import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();

    // User's upcoming reservations
    const upcomingResult = db.exec(
      `SELECT COUNT(*) FROM reservations
       WHERE userId = ? AND endTime > datetime('now') AND status != 'CANCELLED'`,
      [session.user.id]
    );
    const upcomingCount = upcomingResult.length > 0 ? upcomingResult[0].values[0][0] as number : 0;

    // Total rooms
    const roomsResult = db.exec('SELECT COUNT(*) FROM rooms');
    const roomsCount = roomsResult.length > 0 ? roomsResult[0].values[0][0] as number : 0;

    // Total reservations (user's)
    const totalResult = db.exec(
      'SELECT COUNT(*) FROM reservations WHERE userId = ?',
      [session.user.id]
    );
    const totalCount = totalResult.length > 0 ? totalResult[0].values[0][0] as number : 0;

    // Popular rooms (most reserved)
    const popularResult = db.exec(`
      SELECT rm.name, rm.building, COUNT(r.id) as count
      FROM rooms rm
      LEFT JOIN reservations r ON rm.id = r.roomId
      GROUP BY rm.id
      ORDER BY count DESC
      LIMIT 3
    `);

    const popularRooms = popularResult.length > 0
      ? popularResult[0].values.map((row: (string | number | null | Uint8Array)[]) => ({
          name: row[0] as string,
          building: row[1] as string,
          count: row[2] as number,
        }))
      : [];

    // User's recent reservations
    const recentResult = db.exec(
      `SELECT r.*, rm.name as roomName
       FROM reservations r
       JOIN rooms rm ON r.roomId = rm.id
       WHERE r.userId = ? AND r.endTime > datetime('now') AND r.status != 'CANCELLED'
       ORDER BY r.startTime
       LIMIT 5`,
      [session.user.id]
    );

    const recentReservations = recentResult.length > 0
      ? recentResult[0].values.map((row: (string | number | null | Uint8Array)[]) => ({
          id: row[0] as string,
          title: row[3] as string,
          startTime: row[4] as string,
          endTime: row[5] as string,
          roomName: row[8] as string,
        }))
      : [];

    return NextResponse.json({
      upcomingCount,
      roomsCount,
      totalCount,
      popularRooms,
      recentReservations,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
