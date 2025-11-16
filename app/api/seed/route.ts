import { NextResponse } from 'next/server';
import { seed } from '@/lib/seed';

export async function POST() {
  try {
    await seed();
    return NextResponse.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}
