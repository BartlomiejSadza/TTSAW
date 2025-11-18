import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Room, Reservation } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();

    const roomResult = db.exec('SELECT * FROM rooms WHERE id = ?', [id]);

    if (roomResult.length === 0 || roomResult[0].values.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const row = roomResult[0].values[0];
    const room: Room = {
      id: row[0] as string,
      name: row[1] as string,
      building: row[2] as string,
      floor: row[3] as number,
      capacity: row[4] as number,
      equipment: JSON.parse(row[5] as string),
      description: row[6] as string | null,
      positionX: row[7] as number | null,
      positionY: row[8] as number | null,
      createdAt: row[9] as string,
    };

    // Get upcoming reservations for this room
    const reservationsResult = db.exec(
      `SELECT * FROM reservations
       WHERE roomId = ? AND endTime > datetime('now')
       ORDER BY startTime`,
      [id]
    );

    const reservations: Reservation[] =
      reservationsResult.length > 0
        ? reservationsResult[0].values.map((r: (string | number | null | Uint8Array)[]) => ({
            id: r[0] as string,
            roomId: r[1] as string,
            userId: r[2] as string,
            title: r[3] as string,
            startTime: r[4] as string,
            endTime: r[5] as string,
            status: r[6] as 'PENDING' | 'CONFIRMED' | 'CANCELLED',
            createdAt: r[7] as string,
          }))
        : [];

    return NextResponse.json({ room, reservations });
  } catch (error) {
    console.error('Get room error:', error);
    return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 });
  }
}
