import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { auth } from '@/lib/auth';
import type { Room, Reservation } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();

    const roomResult = db.exec('SELECT * FROM rooms WHERE id = ?', [id]);

    if (roomResult.length === 0 || roomResult[0].values.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const row = roomResult[0].values[0];
    const room: Room = {
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
    };

    // Get upcoming reservations for this room
    const reservationsResult = db.exec(
      `SELECT * FROM reservations
       WHERE roomId = ? AND endTime > datetime('now')
       ORDER BY startTime`,
      [id]
    );

    const reservations: Reservation[] =
      reservationsResult.length > 0
        ? reservationsResult[0].values.map((r: (string | number | null | Uint8Array)[]) => ({
            id: r[0] as string,
            roomId: r[1] as string,
            userId: r[2] as string,
            title: r[3] as string,
            startTime: r[4] as string,
            endTime: r[5] as string,
            status: r[6] as 'PENDING' | 'CONFIRMED' | 'CANCELLED',
            createdAt: r[7] as string,
          }))
        : [];

    return NextResponse.json({ room, reservations });
  } catch (error) {
    console.error('Get room error:', error);
    return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { name, building, floor, capacity, equipment, description, positionX, positionY } = await request.json();

    const db = await getDb();

    // Check if room exists
    const roomExists = db.exec('SELECT id FROM rooms WHERE id = ?', [id]);
    if (roomExists.length === 0 || roomExists[0].values.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Validate max length if name or description is provided
    if (name && name.length > 100) {
      return NextResponse.json({ error: 'Room name cannot exceed 100 characters' }, { status: 400 });
    }

    if (description && description.length > 500) {
      return NextResponse.json({ error: 'Description cannot exceed 500 characters' }, { status: 400 });
    }

    // Build dynamic UPDATE query based on provided fields
    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (building !== undefined) {
      updates.push('building = ?');
      values.push(building);
    }
    if (floor !== undefined) {
      updates.push('floor = ?');
      values.push(floor);
    }
    if (capacity !== undefined) {
      updates.push('capacity = ?');
      values.push(capacity);
    }
    if (equipment !== undefined) {
      updates.push('equipment = ?');
      values.push(JSON.stringify(equipment));
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (positionX !== undefined) {
      updates.push('positionX = ?');
      values.push(positionX);
    }
    if (positionY !== undefined) {
      updates.push('positionY = ?');
      values.push(positionY);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);
    db.run(`UPDATE rooms SET ${updates.join(', ')} WHERE id = ?`, values);
    saveDb();

    return NextResponse.json({ message: 'Room updated successfully' });
  } catch (error) {
    console.error('Update room error:', error);
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = await getDb();

    // Check if room exists
    const roomExists = db.exec('SELECT id FROM rooms WHERE id = ?', [id]);
    if (roomExists.length === 0 || roomExists[0].values.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check if room has active reservations
    const activeReservations = db.exec(
      `SELECT id FROM reservations
       WHERE roomId = ? AND status != 'CANCELLED' AND endTime > datetime('now')`,
      [id]
    );

    if (activeReservations.length > 0 && activeReservations[0].values.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete room with active reservations' },
        { status: 400 }
      );
    }

    // Delete the room (cascade will handle reservations if needed)
    db.run('DELETE FROM rooms WHERE id = ?', [id]);
    saveDb();

    return NextResponse.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
  }
}
