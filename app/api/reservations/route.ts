import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb, generateId } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.user.id;
    const all = searchParams.get('all') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let query: string;
    let params: (string | number)[];

    if (all && session.user.role === 'ADMIN') {
      query = `
        SELECT r.*, rm.name as roomName, rm.building, u.name as userName, u.email as userEmail
        FROM reservations r
        JOIN rooms rm ON r.roomId = rm.id
        JOIN users u ON r.userId = u.id
        ORDER BY r.startTime DESC
        LIMIT ? OFFSET ?
      `;
      params = [limit, offset];
    } else {
      query = `
        SELECT r.*, rm.name as roomName, rm.building, u.name as userName, u.email as userEmail
        FROM reservations r
        JOIN rooms rm ON r.roomId = rm.id
        JOIN users u ON r.userId = u.id
        WHERE r.userId = ?
        ORDER BY r.startTime DESC
        LIMIT ? OFFSET ?
      `;
      params = [userId, limit, offset];
    }

    const result = db.exec(query, params);

    if (result.length === 0) {
      return NextResponse.json([]);
    }

    const reservations = result[0].values.map((row: (string | number | null | Uint8Array)[]) => ({
      id: row[0] as string,
      roomId: row[1] as string,
      userId: row[2] as string,
      title: row[3] as string,
      startTime: row[4] as string,
      endTime: row[5] as string,
      status: row[6] as string,
      createdAt: row[7] as string,
      room: {
        id: row[1] as string,
        name: row[8] as string,
        building: row[9] as string,
      },
      user: {
        id: row[2] as string,
        name: row[10] as string,
        email: row[11] as string,
      },
    }));

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Get reservations error:', error);
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId, title, startTime, endTime } = await request.json();

    if (!roomId || !title || !startTime || !endTime) {
      return NextResponse.json({ error: 'Wszystkie pola są wymagane' }, { status: 400 });
    }

    // Validate max length for title
    if (title.length > 200) {
      return NextResponse.json({ error: 'Tytuł nie może przekraczać 200 znaków' }, { status: 400 });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    // Validation
    if (start < now) {
      return NextResponse.json(
        { error: 'Nie można rezerwować w przeszłości' },
        { status: 400 }
      );
    }

    if (end <= start) {
      return NextResponse.json(
        { error: 'Czas zakończenia musi być po czasie rozpoczęcia' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Check room exists
    const roomExists = db.exec('SELECT id FROM rooms WHERE id = ?', [roomId]);
    if (roomExists.length === 0 || roomExists[0].values.length === 0) {
      return NextResponse.json({ error: 'Sala nie istnieje' }, { status: 404 });
    }

    // Check for conflicts
    const conflicts = db.exec(
      `SELECT id FROM reservations
       WHERE roomId = ?
       AND status != 'CANCELLED'
       AND ((startTime < ? AND endTime > ?)
            OR (startTime < ? AND endTime > ?)
            OR (startTime >= ? AND endTime <= ?))`,
      [
        roomId,
        endTime,
        startTime,
        endTime,
        startTime,
        startTime,
        endTime,
      ]
    );

    if (conflicts.length > 0 && conflicts[0].values.length > 0) {
      return NextResponse.json(
        { error: 'Sala jest już zarezerwowana w tym czasie' },
        { status: 409 }
      );
    }

    // Create reservation
    const reservationId = generateId();
    db.run(
      `INSERT INTO reservations (id, roomId, userId, title, startTime, endTime, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [reservationId, roomId, session.user.id, title, startTime, endTime, 'PENDING']
    );

    saveDb();

    return NextResponse.json(
      { message: 'Rezerwacja utworzona', reservationId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create reservation error:', error);
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}
