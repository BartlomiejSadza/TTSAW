import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    const db = await getDb();

    let query = `
      SELECT r.*, rm.name as roomName, rm.building, u.name as userName
      FROM reservations r
      JOIN rooms rm ON r.roomId = rm.id
      JOIN users u ON r.userId = u.id
      WHERE r.status != 'CANCELLED'
    `;
    const params: string[] = [];

    if (startDate && endDate) {
      query += ' AND r.startTime >= ? AND r.endTime <= ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY r.startTime';

    const result = db.exec(query, params);

    if (result.length === 0) {
      return NextResponse.json([]);
    }

    const events = result[0].values.map((row: (string | number | null | Uint8Array)[]) => ({
      id: row[0] as string,
      title: `${row[9]} - ${row[3]}`, // roomName - title
      start: row[4] as string,
      end: row[5] as string,
      status: row[6] as string,
      roomName: row[9] as string,
      building: row[10] as string,
      userName: row[11] as string,
      roomId: row[1] as string,
      userId: row[2] as string,
    }));

    return NextResponse.json(events);
  } catch (error) {
    console.error('Get calendar error:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar' }, { status: 500 });
  }
}
