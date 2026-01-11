import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Generate 40 rooms (4 floors x 10 rooms) in horseshoe layout
const generateRooms = () => {
  const rooms = [];
  const equipmentOptions = [
    ['projektor', 'tablica'],
    ['projektor', 'tablica', 'komputery'],
    ['tablica', 'mikrofon'],
    ['projektor', 'mikrofon', 'naglosnienie'],
    ['projektor', 'tablica', 'klimatyzacja'],
    ['komputery', 'tablica'],
  ];

  for (let floor = 1; floor <= 4; floor++) {
    for (let roomNum = 1; roomNum <= 10; roomNum++) {
      const capacity = 10 + Math.floor(Math.random() * 40);
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

async function main() {
  console.log('Checking if database needs seeding...');

  // Check if data already exists
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log('Database already has data, skipping seed.');
    return;
  }

  console.log('Seeding database...');

  // Insert users
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: hashedPassword,
        role: user.role,
      },
    });
    console.log(`Created user: ${user.email}`);
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
  console.log(`Created ${rooms.length} rooms`);

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
