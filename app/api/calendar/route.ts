import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      status: { not: 'CANCELLED' },
    };

    if (startDate && endDate) {
      where.startTime = { gte: new Date(startDate) };
      where.endTime = { lte: new Date(endDate) };
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        room: {
          select: { name: true, building: true },
        },
        user: {
          select: { name: true },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    const events = reservations.map((r) => ({
      id: r.id,
      title: `${r.room.name} - ${r.title}`,
      start: r.startTime,
      end: r.endTime,
      status: r.status,
      roomName: r.room.name,
      building: r.room.building,
      userName: r.user.name,
      roomId: r.roomId,
      userId: r.userId,
    }));

    return NextResponse.json(events);
  } catch (error) {
    console.error('Get calendar error:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar' }, { status: 500 });
  }
}
