import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { getDb, saveDb, generateId } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json();

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Wszystkie pola są wymagane' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Hasło musi mieć co najmniej 6 znaków' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Check if user exists
    const existingUser = db.exec('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0 && existingUser[0].values.length > 0) {
      return NextResponse.json(
        { error: 'Użytkownik z tym emailem już istnieje' },
        { status: 400 }
      );
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = generateId();

    db.run(
      'INSERT INTO users (id, email, name, password, role) VALUES (?, ?, ?, ?, ?)',
      [userId, email, name, hashedPassword, 'USER']
    );

    saveDb();

    return NextResponse.json(
      { message: 'Konto zostało utworzone', userId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas rejestracji' },
      { status: 500 }
    );
  }
}
