import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const building = searchParams.get('building');
    const floor = searchParams.get('floor');
    const minCapacity = searchParams.get('minCapacity');

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

    const rooms = await prisma.room.findMany({
      where,
      orderBy: [
        { building: 'asc' },
        { name: 'asc' },
      ],
    });

    const parsedRooms = rooms.map((room) => ({
      ...room,
      equipment: JSON.parse(room.equipment),
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

    const { name, building, floor, capacity, equipment, description, positionX, positionY } = await request.json();

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

    const room = await prisma.room.create({
      data: {
        name,
        building,
        floor,
        capacity,
        equipment: JSON.stringify(equipment || []),
        description: description || null,
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
