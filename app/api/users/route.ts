import { NextResponse } from 'next/server';
import { getDb, generateId, saveDb } from '@/lib/db';
import { auth } from '@/lib/auth';
import bcrypt from 'bcrypt';

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

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, name, password, role } = body;

    if (!email || !name || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();

    // Check if user already exists
    const existingUser = db.exec('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0 && existingUser[0].values.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = generateId();
    const userRole = role || 'USER';
    const now = new Date().toISOString();

    // Insert user
    db.run(
      'INSERT INTO users (id, email, name, password, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, email, name, hashedPassword, userRole, now]
    );

    await saveDb();

    return NextResponse.json({
      id: userId,
      email,
      name,
      role: userRole,
      createdAt: now,
    }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
