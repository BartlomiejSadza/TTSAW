import { getDb, saveDb, generateId } from './db';
import bcrypt from 'bcrypt';

const rooms = [
  {
    name: 'A101',
    building: 'A',
    floor: 1,
    capacity: 30,
    equipment: ['projektor', 'tablica'],
    description: 'Sala wykładowa z projektorem',
  },
  {
    name: 'A102',
    building: 'A',
    floor: 1,
    capacity: 20,
    equipment: ['projektor', 'komputery'],
    description: 'Sala komputerowa',
  },
  {
    name: 'B201',
    building: 'B',
    floor: 2,
    capacity: 50,
    equipment: ['projektor', 'tablica', 'mikrofon'],
    description: 'Duża sala konferencyjna',
  },
  {
    name: 'B202',
    building: 'B',
    floor: 2,
    capacity: 15,
    equipment: ['tablica'],
    description: 'Mała sala seminaryjna',
  },
  {
    name: 'C301',
    building: 'C',
    floor: 3,
    capacity: 100,
    equipment: ['projektor', 'mikrofon', 'nagłośnienie'],
    description: 'Aula główna',
  },
];

const users = [
  {
    email: 'admin@wydzial.pl',
    name: 'Admin',
    password: 'admin123',
    role: 'ADMIN',
  },
  {
    email: 'student@wydzial.pl',
    name: 'Jan Kowalski',
    password: 'student123',
    role: 'USER',
  },
];

export async function seed() {
  const db = await getDb();

  // Clear existing data
  db.run('DELETE FROM reservations');
  db.run('DELETE FROM rooms');
  db.run('DELETE FROM users');

  // Insert users
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    db.run(
      'INSERT INTO users (id, email, name, password, role) VALUES (?, ?, ?, ?, ?)',
      [generateId(), user.email, user.name, hashedPassword, user.role]
    );
  }

  // Insert rooms
  for (const room of rooms) {
    db.run(
      'INSERT INTO rooms (id, name, building, floor, capacity, equipment, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        generateId(),
        room.name,
        room.building,
        room.floor,
        room.capacity,
        JSON.stringify(room.equipment),
        room.description,
      ]
    );
  }

  saveDb();
  console.log('Database seeded successfully!');
}

// Run if called directly
if (require.main === module) {
  seed().catch(console.error);
}
