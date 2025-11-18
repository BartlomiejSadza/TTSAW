import { NextResponse } from 'next/server';
import { getDb, generateId, saveDb } from '@/lib/db';
import { auth } from '@/lib/auth';
import bcrypt from 'bcrypt';

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Brak uprawnień' }, { status: 401 });
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
    return NextResponse.json({ error: 'Nie udało się pobrać użytkowników' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Brak uprawnień' }, { status: 401 });
    }

    const body = await request.json();
    const { email, name, password, role } = body;

    if (!email || !name || !password) {
      return NextResponse.json({ error: 'Wszystkie pola są wymagane' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Nieprawidłowy format email' }, { status: 400 });
    }

    // Validate max length
    if (name.length > 100) {
      return NextResponse.json({ error: 'Imię nie może przekraczać 100 znaków' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Hasło musi mieć co najmniej 6 znaków' }, { status: 400 });
    }

    const db = await getDb();

    // Check if user already exists
    const existingUser = db.exec('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0 && existingUser[0].values.length > 0) {
      return NextResponse.json({ error: 'Użytkownik z tym emailem już istnieje' }, { status: 400 });
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

    saveDb();

    return NextResponse.json({
      id: userId,
      email,
      name,
      role: userRole,
      createdAt: now,
    }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Nie udało się utworzyć użytkownika' }, { status: 500 });
  }
}
