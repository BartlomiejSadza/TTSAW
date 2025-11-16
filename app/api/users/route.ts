import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const result = db.exec('SELECT id, email, name, role, createdAt FROM users ORDER BY createdAt DESC');

    if (result.length === 0) {
      return NextResponse.json([]);
    }

    const users = result[0].values.map((row: (string | number | null | Uint8Array)[]) => ({
      id: row[0] as string,
      email: row[1] as string,
      name: row[2] as string,
      role: row[3] as string,
      createdAt: row[4] as string,
    }));

    return NextResponse.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
