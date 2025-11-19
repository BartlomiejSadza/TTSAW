import { getDb, saveDb, generateId } from './db';
import bcrypt from 'bcrypt';

// Generate 40 rooms (4 floors × 10 rooms) in horseshoe layout
const generateRooms = () => {
  const rooms = [];
  const equipmentOptions = [
    ['projektor', 'tablica'],
    ['projektor', 'tablica', 'komputery'],
    ['tablica', 'mikrofon'],
    ['projektor', 'mikrofon', 'nagłośnienie'],
    ['projektor', 'tablica', 'klimatyzacja'],
    ['komputery', 'tablica'],
  ];

  for (let floor = 1; floor <= 4; floor++) {
    for (let roomNum = 1; roomNum <= 10; roomNum++) {
      const capacity = 10 + Math.floor(Math.random() * 40); // 10-50 osób
      const equipment = equipmentOptions[Math.floor(Math.random() * equipmentOptions.length)];

      rooms.push({
        name: `${floor}${roomNum.toString().padStart(2, '0')}`,
        building: 'A',
        floor: floor,
        capacity: capacity,
        equipment: equipment,
        description: `Sala ${floor}${roomNum.toString().padStart(2, '0')} - ${capacity} miejsc`,
      });
    }
  }

  return rooms;
};

const rooms = generateRooms();

// WARNING: These are test accounts with weak passwords.
// NEVER use these credentials in production!
// For production, use strong passwords and change these defaults immediately.
const users = [
  {
    email: 'admin@wydzial.pl',
    name: 'Admin',
    password: 'Admin2024!SecurePassword', // Changed from weak 'admin123'
    role: 'ADMIN',
  },
  {
    email: 'student@wydzial.pl',
    name: 'Jan Kowalski',
    password: 'Student2024!Test', // Changed from weak 'student123'
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
      'INSERT INTO rooms (id, name, building, floor, capacity, equipment, description, positionX, positionY) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        generateId(),
        room.name,
        room.building,
        room.floor,
        room.capacity,
        JSON.stringify(room.equipment),
        room.description,
        null, // positionX - calculated by FloorPlan component
        null, // positionY - calculated by FloorPlan component
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
