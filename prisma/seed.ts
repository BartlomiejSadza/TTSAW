import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const rooms = [
  {
    name: 'A101',
    building: 'A',
    floor: 1,
    capacity: 30,
    equipment: '["projektor", "tablica"]',
    description: 'Sala wykładowa z projektorem',
  },
  {
    name: 'A102',
    building: 'A',
    floor: 1,
    capacity: 20,
    equipment: '["projektor", "komputery"]',
    description: 'Sala komputerowa',
  },
  {
    name: 'B201',
    building: 'B',
    floor: 2,
    capacity: 50,
    equipment: '["projektor", "tablica", "mikrofon"]',
    description: 'Duża sala konferencyjna',
  },
  {
    name: 'B202',
    building: 'B',
    floor: 2,
    capacity: 15,
    equipment: '["tablica"]',
    description: 'Mała sala seminaryjna',
  },
  {
    name: 'C301',
    building: 'C',
    floor: 3,
    capacity: 100,
    equipment: '["projektor", "mikrofon", "nagłośnienie"]',
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

async function main() {
  console.log('Start seeding ...');

  // Clean up existing data
  await prisma.reservation.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  // Seed users
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const u = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: hashedPassword,
        role: user.role as 'USER' | 'ADMIN',
      },
    });
    console.log(`Created user with id: ${u.id}`);
  }

  // Seed rooms
  for (const room of rooms) {
    const r = await prisma.room.create({
      data: {
        name: room.name,
        building: room.building,
        floor: room.floor,
        capacity: room.capacity,
        equipment: room.equipment,
        description: room.description,
      },
    });
    console.log(`Created room with id: ${r.id}`);
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
