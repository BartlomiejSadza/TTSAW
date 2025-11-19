import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.user.id;
    const all = searchParams.get('all') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

<<<<<<< HEAD
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
=======
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (all && session.user.role === 'ADMIN') {
      // No filter on userId
    } else {
      where.userId = userId;
>>>>>>> 2a8db55 (refactor: replace sql.js with prisma ORM)
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        room: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });

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

    // Rate limiting for reservations
    const rateLimitResult = rateLimit(`reservation:${session.user.id}`, rateLimitConfigs.mutating);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Zbyt wiele prób rezerwacji. Spróbuj ponownie później.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          }
        }
      );
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

    // Check room exists
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json({ error: 'Sala nie istnieje' }, { status: 404 });
    }

    // Check for conflicts
    const conflicts = await prisma.reservation.findFirst({
      where: {
        roomId,
        status: { not: 'CANCELLED' },
        AND: [
          { startTime: { lt: end } },
          { endTime: { gt: start } },
        ],
      },
    });

    if (conflicts) {
      return NextResponse.json(
        { error: 'Sala jest już zarezerwowana w tym czasie' },
        { status: 409 }
      );
    }

<<<<<<< HEAD
    // Create reservation with retry mechanism for race condition handling
    const reservationId = generateId();
    try {
      db.run(
        `INSERT INTO reservations (id, roomId, userId, title, startTime, endTime, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [reservationId, roomId, session.user.id, title, startTime, endTime, 'PENDING']
      );

      saveDb();
    } catch (insertError) {
      // Re-check conflicts in case of race condition
      const recheck = db.exec(
        `SELECT id FROM reservations
         WHERE roomId = ?
         AND status != 'CANCELLED'
         AND ((startTime < ? AND endTime > ?)
              OR (startTime < ? AND endTime > ?)
              OR (startTime >= ? AND endTime <= ?))`,
        [roomId, endTime, startTime, endTime, startTime, startTime, endTime]
      );

      if (recheck.length > 0 && recheck[0].values.length > 0) {
        return NextResponse.json(
          { error: 'Sala jest już zarezerwowana w tym czasie (konflikt wykryty)' },
          { status: 409 }
        );
      }

      throw insertError;
    }
=======
    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        roomId,
        userId: session.user.id,
        title,
        startTime: start,
        endTime: end,
        status: 'PENDING',
      },
    });
>>>>>>> 2a8db55 (refactor: replace sql.js with prisma ORM)

    return NextResponse.json(
      { message: 'Rezerwacja utworzona', reservationId: reservation.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create reservation error:', error);
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}
