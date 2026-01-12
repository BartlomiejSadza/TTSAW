import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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
        equipment: JSON.stringify(equipment),
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
  console.log('Start seeding ...');

  // Clear existing data
  await prisma.reservation.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  // Insert users
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: hashedPassword,
        role: user.role as 'USER' | 'ADMIN',
      },
    });
  }

  // Insert rooms
  for (const room of rooms) {
    await prisma.room.create({
      data: {
        name: room.name,
        building: room.building,
        floor: room.floor,
        capacity: room.capacity,
        equipment: room.equipment,
        description: room.description,
      },
    });
  }

  console.log('Database seeded successfully!');
}

// Run if called directly
if (require.main === module) {
  seed()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
