import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb, generateId } from '@/lib/db';
import { auth } from '@/lib/auth';
import type { Room } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);

    const building = searchParams.get('building');
    const floor = searchParams.get('floor');
    const minCapacity = searchParams.get('minCapacity');

    let query = 'SELECT * FROM rooms WHERE 1=1';
    const params: (string | number)[] = [];

    if (building) {
      query += ' AND building = ?';
      params.push(building);
    }

    if (floor) {
      query += ' AND floor = ?';
      params.push(parseInt(floor));
    }

    if (minCapacity) {
      query += ' AND capacity >= ?';
      params.push(parseInt(minCapacity));
    }

    query += ' ORDER BY building, name';

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
    }));

    return NextResponse.json(rooms);
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

    const db = await getDb();
    const roomId = generateId();

    db.run(
      'INSERT INTO rooms (id, name, building, floor, capacity, equipment, description, positionX, positionY) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [roomId, name, building, floor, capacity, JSON.stringify(equipment || []), description || null, positionX || null, positionY || null]
    );

    saveDb();

    return NextResponse.json(
      { message: 'Room created', roomId },
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
