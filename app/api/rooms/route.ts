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

<<<<<<< HEAD
    const result = db.exec(query, params);

    if (result.length === 0) {
      return NextResponse.json([]);
    }

    const rooms: Room[] = result[0].values.map((row: (string | number | null | Uint8Array)[]) => ({
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
=======
    const parsedRooms = rooms.map((room) => ({
      ...room,
      equipment: JSON.parse(room.equipment),
>>>>>>> 2a8db55 (refactor: replace sql.js with prisma ORM)
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

    if (!session || session.user.role !== 'ADMIN') {
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

<<<<<<< HEAD
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

    const db = await getDb();
    const roomId = generateId();

    db.run(
      'INSERT INTO rooms (id, name, building, floor, capacity, equipment, description, positionX, positionY) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [roomId, name, building, floor, capacity, JSON.stringify(equipment || []), description || null, positionX || null, positionY || null]
    );

    saveDb();
=======
    const room = await prisma.room.create({
      data: {
        name,
        building,
        floor,
        capacity,
        equipment: JSON.stringify(equipment || []),
        description: description || null,
      },
    });
>>>>>>> 2a8db55 (refactor: replace sql.js with prisma ORM)

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
