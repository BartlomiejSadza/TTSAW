import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await request.json();

    const reservation = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

<<<<<<< HEAD
    const reservation = result[0].values[0];
    const reservationUserId = reservation[2] as string;
    const reservationRoomId = reservation[1] as string;

    // Check permission
    if (reservationUserId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if the room still exists
    const roomExists = db.exec('SELECT id FROM rooms WHERE id = ?', [reservationRoomId]);
    if (roomExists.length === 0 || roomExists[0].values.length === 0) {
      return NextResponse.json({ error: 'Sala dla tej rezerwacji nie istnieje' }, { status: 404 });
    }

    // Update status
    db.run('UPDATE reservations SET status = ? WHERE id = ?', [status, id]);
    saveDb();
=======
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (reservation.userId !== session.user.id && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.reservation.update({
      where: { id },
      data: { status },
    });
>>>>>>> 2a8db55 (refactor: replace sql.js with prisma ORM)

    return NextResponse.json({ message: 'Reservation updated' });
  } catch (error) {
    console.error('Update reservation error:', error);
    return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

<<<<<<< HEAD
    const reservation = result[0].values[0];
    const reservationUserId = reservation[2] as string;

    // Check permission - user can cancel own reservation, admin can delete any
    if (reservationUserId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // For regular users, change status to CANCELLED instead of deleting
    if (session.user.role === 'ADMIN') {
      db.run('DELETE FROM reservations WHERE id = ?', [id]);
=======
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (reservation.userId !== session.user.id && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((session.user as any).role === 'ADMIN') {
      await prisma.reservation.delete({
        where: { id },
      });
>>>>>>> 2a8db55 (refactor: replace sql.js with prisma ORM)
    } else {
      await prisma.reservation.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });
    }

    return NextResponse.json({ message: 'Reservation cancelled' });
  } catch (error) {
    console.error('Delete reservation error:', error);
    return NextResponse.json({ error: 'Failed to cancel reservation' }, { status: 500 });
  }
}
