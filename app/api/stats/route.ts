import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    const [upcomingCount, roomsCount, totalCount, popularRoomsData, recentReservations] = await Promise.all([
      // Upcoming count
      prisma.reservation.count({
        where: {
          userId: session.user.id,
          endTime: { gt: now },
          status: { not: 'CANCELLED' },
        },
      }),
      // Rooms count
      prisma.room.count(),
      // Total reservations count
      prisma.reservation.count({
        where: {
          userId: session.user.id,
        },
      }),
      // Popular rooms
      prisma.room.findMany({
        include: {
          _count: {
            select: { reservations: true },
          },
        },
        orderBy: {
          reservations: {
            _count: 'desc',
          },
        },
        take: 3,
      }),
      // Recent reservations
      prisma.reservation.findMany({
        where: {
          userId: session.user.id,
          endTime: { gt: now },
          status: { not: 'CANCELLED' },
        },
        include: {
          room: {
            select: { name: true },
          },
        },
        orderBy: {
          startTime: 'asc',
        },
        take: 5,
      }),
    ]);

    const popularRooms = popularRoomsData.map((room) => ({
      name: room.name,
      building: room.building,
      count: room._count.reservations,
    }));

    const formattedRecentReservations = recentReservations.map((r) => ({
      id: r.id,
      title: r.title,
      startTime: r.startTime,
      endTime: r.endTime,
      roomName: r.room.name,
    }));

    return NextResponse.json({
      upcomingCount,
      roomsCount,
      totalCount,
      popularRooms,
      recentReservations: formattedRecentReservations,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
