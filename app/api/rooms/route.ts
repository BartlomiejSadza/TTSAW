import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const building = searchParams.get('building');
    const floor = searchParams.get('floor');
    const minCapacity = searchParams.get('minCapacity');
    const roomType = searchParams.get('roomType');
    const availableDate = searchParams.get('availableDate');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (building) {
      where.building = building;
    }

    if (floor) {
      where.floor = parseInt(floor);
    }

    if (minCapacity) {
      where.capacity = {
        gte: parseInt(minCapacity),
      };
    }

    if (roomType && ['LABORATORY', 'LECTURE', 'CONFERENCE'].includes(roomType)) {
      where.roomType = roomType;
    }

    // Fetch rooms with reservations to check availability
    const rooms = await prisma.room.findMany({
      where,
      include: {
        reservations: availableDate && startTime && endTime ? {
          where: {
            startTime: {
              gte: new Date(`${availableDate}T00:00:00`),
              lt: new Date(`${availableDate}T23:59:59`),
            },
            status: {
              in: ['PENDING', 'CONFIRMED'],
            },
          },
        } : false,
      },
    });

    // Filter out rooms with conflicting reservations if date/time filters are provided
    let filteredRooms = rooms;
    if (availableDate && startTime && endTime) {
      const requestStart = new Date(`${availableDate}T${startTime}`);
      const requestEnd = new Date(`${availableDate}T${endTime}`);

      filteredRooms = rooms.filter((room) => {
        if (!room.reservations || room.reservations.length === 0) {
          return true; // Room is available
        }

        // Check for time conflicts
        const hasConflict = room.reservations.some((reservation) => {
          const resStart = new Date(reservation.startTime);
          const resEnd = new Date(reservation.endTime);

          // Overlapping condition: requestStart < resEnd && requestEnd > resStart
          return requestStart < resEnd && requestEnd > resStart;
        });

        return !hasConflict;
      });
    }

    // Smart sorting:
    // 1. Prioritize dirty rooms (already used, isCleaned=false) to save cleaning costs
    // 2. Then sort by capacity (ascending) to match requirement
    // 3. Then by building and name for consistency
    const sortedRooms = filteredRooms.sort((a, b) => {
      // Priority 1: Dirty rooms first (cost optimization)
      if (a.isCleaned !== b.isCleaned) {
        return a.isCleaned ? 1 : -1; // false (dirty) comes first
      }

      // Priority 2: Smallest capacity first (when minCapacity filter is used)
      if (minCapacity) {
        if (a.capacity !== b.capacity) {
          return a.capacity - b.capacity;
        }
      }

      // Priority 3: Building
      if (a.building !== b.building) {
        return a.building.localeCompare(b.building);
      }

      // Priority 4: Name
      return a.name.localeCompare(b.name);
    });

    const parsedRooms = sortedRooms.map((room) => ({
      ...room,
      equipment: JSON.parse(room.equipment),
      reservations: undefined, // Remove reservations from response
    }));

    return NextResponse.json(parsedRooms);
  } catch (error) {
    console.error('Get rooms error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      name,
      building,
      floor,
      capacity,
      equipment,
      description,
      roomType,
      positionX,
      positionY
    } = await request.json();

    if (!name || !building || floor === undefined || !capacity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate max length
    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Room name cannot exceed 100 characters' },
        { status: 400 }
      );
    }

    if (description && description.length > 500) {
      return NextResponse.json(
        { error: 'Description cannot exceed 500 characters' },
        { status: 400 }
      );
    }

    // Validate roomType
    if (roomType && !['LABORATORY', 'LECTURE', 'CONFERENCE'].includes(roomType)) {
      return NextResponse.json(
        { error: 'Invalid room type. Must be LABORATORY, LECTURE, or CONFERENCE' },
        { status: 400 }
      );
    }

    const room = await prisma.room.create({
      data: {
        name,
        building,
        floor,
        capacity,
        equipment: JSON.stringify(equipment || []),
        description: description || null,
        roomType: roomType || 'LECTURE',
        isCleaned: true,
        lastUsedAt: null,
        positionX: positionX || null,
        positionY: positionY || null,
      },
    });

    return NextResponse.json(
      { message: 'Room created', roomId: room.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}
