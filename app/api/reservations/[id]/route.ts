import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
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

    const db = await getDb();

    // Get reservation
    const result = db.exec('SELECT * FROM reservations WHERE id = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    const reservation = result[0].values[0];
    const reservationUserId = reservation[2] as string;

    // Check permission
    if (reservationUserId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update status
    db.run('UPDATE reservations SET status = ? WHERE id = ?', [status, id]);
    saveDb();

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
    const db = await getDb();

    // Get reservation to check ownership
    const result = db.exec('SELECT * FROM reservations WHERE id = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    const reservation = result[0].values[0];
    const reservationUserId = reservation[2] as string;

    // Check permission - user can cancel own reservation, admin can delete any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (reservationUserId !== session.user.id && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // For regular users, change status to CANCELLED instead of deleting
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((session.user as any).role === 'ADMIN') {
      db.run('DELETE FROM reservations WHERE id = ?', [id]);
    } else {
      db.run('UPDATE reservations SET status = ? WHERE id = ?', ['CANCELLED', id]);
    }
    saveDb();

    return NextResponse.json({ message: 'Reservation cancelled' });
  } catch (error) {
    console.error('Delete reservation error:', error);
    return NextResponse.json({ error: 'Failed to cancel reservation' }, { status: 500 });
  }
}
