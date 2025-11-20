import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.user.id;
    const all = searchParams.get('all') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (all && session.user.role === 'ADMIN') {
      // No filter on userId
    } else {
      where.userId = userId;
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
    if (!session?.user?.id) {
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

    // Debug: log session and user id
    console.log('Session user id:', session.user.id);
    console.log('Session user:', JSON.stringify(session.user));

    // Verify user exists
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!userExists) {
      console.error('User not found in database:', session.user.id);
      return NextResponse.json(
        { error: 'Sesja wygasła. Zaloguj się ponownie.' },
        { status: 401 }
      );
    }

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

    return NextResponse.json(
      { message: 'Rezerwacja utworzona', reservationId: reservation.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create reservation error:', error);
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}
