import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        reservations: {
          where: {
            endTime: {
              gt: new Date(),
            },
          },
          orderBy: {
            startTime: 'asc',
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const { reservations, ...roomData } = room;

    const parsedRoom = {
      ...roomData,
      equipment: JSON.parse(roomData.equipment),
    };

    return NextResponse.json({ room: parsedRoom, reservations });
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

    // Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id },
    });

    if (!existingRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Validate max length if name or description is provided
    if (name && name.length > 100) {
      return NextResponse.json({ error: 'Room name cannot exceed 100 characters' }, { status: 400 });
    }

    if (description && description.length > 500) {
      return NextResponse.json({ error: 'Description cannot exceed 500 characters' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (building !== undefined) data.building = building;
    if (floor !== undefined) data.floor = floor;
    if (capacity !== undefined) data.capacity = capacity;
    if (equipment !== undefined) data.equipment = JSON.stringify(equipment);
    if (description !== undefined) data.description = description;
    if (positionX !== undefined) data.positionX = positionX;
    if (positionY !== undefined) data.positionY = positionY;

    await prisma.room.update({
      where: { id },
      data,
    });

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

    // Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id },
    });

    if (!existingRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check if room has active reservations
    const activeReservations = await prisma.reservation.findFirst({
      where: {
        roomId: id,
        status: { not: 'CANCELLED' },
        endTime: { gt: new Date() },
      },
    });

    if (activeReservations) {
      return NextResponse.json(
        { error: 'Cannot delete room with active reservations' },
        { status: 400 }
      );
    }

    // Delete the room
    await prisma.room.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
  }
}
