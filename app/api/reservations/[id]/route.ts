import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (reservation.userId !== session.user.id && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.reservation.update({
      where: { id },
      data: { status },
    });

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
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (reservation.userId !== session.user.id && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((session.user as any).role === 'ADMIN') {
      await prisma.reservation.delete({
        where: { id },
      });
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
