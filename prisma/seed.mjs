import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Rzeczywiste sale z D-14 i D-14a z podanymi pojemnościami
const rooms = [
  // Aula i duże sale wykładowe (D-14)
  { name: 'Aula', building: 'D-14', floor: 1, capacity: 194, roomType: 'LECTURE', equipment: JSON.stringify(['projektor', 'mikrofon', 'nagłośnienie']), description: 'Aula główna - 194 miejsca' },
  { name: 'A-0.3', building: 'D-14a', floor: 0, capacity: 203, roomType: 'LECTURE', equipment: JSON.stringify(['projektor', 'mikrofon', 'nagłośnienie']), description: 'Sala wykładowa A-0.3 - 203 miejsca' },

  // Sale wykładowe D-14
  { name: '118', building: 'D-14', floor: 1, capacity: 90, roomType: 'LECTURE', equipment: JSON.stringify(['projektor', 'tablica']), description: 'Sala wykładowa 118 - 90 miejsc' },
  { name: '207', building: 'D-14', floor: 2, capacity: 70, roomType: 'LECTURE', equipment: JSON.stringify(['projektor', 'tablica']), description: 'Sala wykładowa 207 - 70 miejsc' },
  { name: '116', building: 'D-14', floor: 1, capacity: 40, roomType: 'LECTURE', equipment: JSON.stringify(['projektor', 'tablica']), description: 'Sala wykładowa 116 - 40 miejsc' },
  { name: '219', building: 'D-14', floor: 2, capacity: 90, roomType: 'LECTURE', equipment: JSON.stringify(['projektor', 'tablica']), description: 'Sala wykładowa 219 - 90 miejsc' },
  { name: '119', building: 'D-14', floor: 1, capacity: 30, roomType: 'LECTURE', equipment: JSON.stringify(['projektor', 'tablica']), description: 'Sala wykładowa 119 - 30 miejsc' },

  // Sale wykładowe D-14a
  { name: '2.6', building: 'D-14a', floor: 2, capacity: 109, roomType: 'LECTURE', equipment: JSON.stringify(['projektor', 'tablica']), description: 'Sala wykładowa 2.6 - 109 miejsc' },
  { name: '1.6', building: 'D-14a', floor: 1, capacity: 109, roomType: 'LECTURE', equipment: JSON.stringify(['projektor', 'tablica']), description: 'Sala wykładowa 1.6 - 109 miejsc' },
  { name: '0.1', building: 'D-14a', floor: 0, capacity: 30, roomType: 'LECTURE', equipment: JSON.stringify(['projektor', 'tablica']), description: 'Sala wykładowa 0.1 - 30 miejsc' },
  { name: '0.2', building: 'D-14a', floor: 0, capacity: 30, roomType: 'LECTURE', equipment: JSON.stringify(['projektor', 'tablica']), description: 'Sala wykładowa 0.2 - 30 miejsc' },
  { name: '1.1', building: 'D-14a', floor: 1, capacity: 30, roomType: 'LECTURE', equipment: JSON.stringify(['projektor', 'tablica']), description: 'Sala wykładowa 1.1 - 30 miejsc' },
  { name: '1.2', building: 'D-14a', floor: 1, capacity: 30, roomType: 'LECTURE', equipment: JSON.stringify(['projektor', 'tablica']), description: 'Sala wykładowa 1.2 - 30 miejsc' },
  { name: '2.1', building: 'D-14a', floor: 2, capacity: 30, roomType: 'LECTURE', equipment: JSON.stringify(['projektor', 'tablica']), description: 'Sala wykładowa 2.1 - 30 miejsc' },
  { name: '2.2', building: 'D-14a', floor: 2, capacity: 30, roomType: 'LECTURE', equipment: JSON.stringify(['projektor', 'tablica']), description: 'Sala wykładowa 2.2 - 30 miejsc' },
  { name: '3.1', building: 'D-14a', floor: 3, capacity: 30, roomType: 'LECTURE', equipment: JSON.stringify(['projektor', 'tablica']), description: 'Sala wykładowa 3.1 - 30 miejsc' },

  // Sale komputerowe D-14a
  { name: '3.6', building: 'D-14a', floor: 3, capacity: 20, roomType: 'LABORATORY', equipment: JSON.stringify(['komputery', 'projektor', 'tablica']), description: 'Sala komputerowa 3.6 - 20 miejsc' },
  { name: '3.2', building: 'D-14a', floor: 3, capacity: 30, roomType: 'LABORATORY', equipment: JSON.stringify(['komputery', 'projektor', 'tablica']), description: 'Sala komputerowa 3.2 - 30 miejsc' },
  { name: '3.7', building: 'D-14a', floor: 3, capacity: 30, roomType: 'LABORATORY', equipment: JSON.stringify(['komputery', 'projektor', 'tablica']), description: 'Sala komputerowa 3.7 - 30 miejsc' },

  // Sale komputerowe D-14
  { name: '320', building: 'D-14', floor: 3, capacity: 15, roomType: 'LABORATORY', equipment: JSON.stringify(['komputery', 'projektor']), description: 'Sala komputerowa 320 - 15 miejsc' },
  { name: '307', building: 'D-14', floor: 3, capacity: 30, roomType: 'LABORATORY', equipment: JSON.stringify(['komputery', 'projektor', 'tablica']), description: 'Sala komputerowa 307 - 30 miejsc' },
  { name: '319', building: 'D-14', floor: 3, capacity: 30, roomType: 'LABORATORY', equipment: JSON.stringify(['komputery', 'projektor', 'tablica']), description: 'Sala komputerowa 319 - 30 miejsc' },
  { name: '206', building: 'D-14', floor: 2, capacity: 15, roomType: 'LABORATORY', equipment: JSON.stringify(['komputery', 'projektor']), description: 'Sala komputerowa 206 - 15 miejsc' },
  { name: '220', building: 'D-14', floor: 2, capacity: 15, roomType: 'LABORATORY', equipment: JSON.stringify(['komputery', 'projektor']), description: 'Sala komputerowa 220 - 15 miejsc' },
  { name: '315', building: 'D-14', floor: 3, capacity: 15, roomType: 'LABORATORY', equipment: JSON.stringify(['komputery', 'projektor']), description: 'Sala komputerowa 315 - 15 miejsc' },
  { name: '106', building: 'D-14', floor: 1, capacity: 15, roomType: 'LABORATORY', equipment: JSON.stringify(['komputery', 'projektor']), description: 'Sala komputerowa 106 - 15 miejsc' },
];

const users = [
  {
    email: 'admin@wydzial.pl',
    name: 'Administrator',
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
  console.log('Starting fresh database seed with real room data...');

  // Clean existing data (CAREFUL - this deletes everything!)
  console.log('Cleaning existing data...');
  await prisma.reservation.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('Database cleaned!');

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
        roomType: room.roomType,
        isCleaned: true,
        lastUsedAt: null,
      },
    });
  }
  console.log(`Created ${rooms.length} rooms (D-14 and D-14a)`);

  console.log('Database seeded successfully with real room data!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
