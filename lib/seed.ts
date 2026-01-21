import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { RoomType } from '@prisma/client';

// Rzeczywiste sale z D-14 i D-14a z podanymi pojemnościami
const rooms = [
  // Aula i duże sale wykładowe (D-14)
  { name: 'Aula', building: 'D-14', floor: 1, capacity: 194, roomType: 'LECTURE' as RoomType, equipment: JSON.stringify(['projektor', 'mikrofon', 'nagłośnienie']), description: 'Aula główna - 194 miejsca' },
  { name: 'A-0.3', building: 'D-14a', floor: 0, capacity: 203, roomType: 'LECTURE' as RoomType, equipment: JSON.stringify(['projektor', 'mikrofon', 'nagłośnienie']), description: 'Sala wykładowa A-0.3 - 203 miejsca' },

  // Sale wykładowe D-14
  { name: '118', building: 'D-14', floor: 1, capacity: 90, roomType: 'LECTURE' as RoomType, equipment: JSON.stringify(['projektor', 'tablica']), description: 'Sala wykładowa 118 - 90 miejsc' },
  { name: '207', building: 'D-14', floor: 2, capacity: 70, roomType: 'LECTURE' as RoomType, equipment: JSON.stringify(['projektor', 'tablica']), description: 'Sala wykładowa 207 - 70 miejsc' },
  { name: '116', building: 'D-14', floor: 1, capacity: 40, roomType: 'LECTURE' as RoomType, equipment: JSON.stringify(['projektor', 'tablica']), description: 'Sala wykładowa 116 - 40 miejsc' },
  { name: '219', building: 'D-14', floor: 2, capacity: 90, roomType: 'LECTURE' as RoomType, equipment: JSON.stringify(['projektor', 'tablica']), description: 'Sala wykładowa 219 - 90 miejsc' },
  { name: '119', building: 'D-14', floor: 1, capacity: 30, roomType: 'LECTURE' as RoomType, equipment: JSON.stringify(['projektor', 'tablica']), description: 'Sala wykładowa 119 - 30 miejsc' },

  // Sale wykładowe D-14a
  { name: '2.6', building: 'D-14a', floor: 2, capacity: 109, roomType: 'LECTURE' as RoomType, equipment: JSON.stringify(['projektor', 'tablica']), description: 'Sala wykładowa 2.6 - 109 miejsc' },
  { name: '1.6', building: 'D-14a', floor: 1, capacity: 109, roomType: 'LECTURE' as RoomType, equipment: JSON.stringify(['projektor', 'tablica']), description: 'Sala wykładowa 1.6 - 109 miejsc' },
  { name: '0.1', building: 'D-14a', floor: 0, capacity: 30, roomType: 'LECTURE' as RoomType, equipment: JSON.stringify(['projektor', 'tablica']), description: 'Sala wykładowa 0.1 - 30 miejsc' },
  { name: '0.2', building: 'D-14a', floor: 0, capacity: 30, roomType: 'LECTURE' as RoomType, equipment: JSON.stringify(['projektor', 'tablica']), description: 'Sala wykładowa 0.2 - 30 miejsc' },
  { name: '1.1', building: 'D-14a', floor: 1, capacity: 30, roomType: 'LECTURE' as RoomType, equipment: JSON.stringify(['projektor', 'tablica']), description: 'Sala wykładowa 1.1 - 30 miejsc' },
  { name: '1.2', building: 'D-14a', floor: 1, capacity: 30, roomType: 'LECTURE' as RoomType, equipment: JSON.stringify(['projektor', 'tablica']), description: 'Sala wykładowa 1.2 - 30 miejsc' },
  { name: '2.1', building: 'D-14a', floor: 2, capacity: 30, roomType: 'LECTURE' as RoomType, equipment: JSON.stringify(['projektor', 'tablica']), description: 'Sala wykładowa 2.1 - 30 miejsc' },
  { name: '2.2', building: 'D-14a', floor: 2, capacity: 30, roomType: 'LECTURE' as RoomType, equipment: JSON.stringify(['projektor', 'tablica']), description: 'Sala wykładowa 2.2 - 30 miejsc' },
  { name: '3.1', building: 'D-14a', floor: 3, capacity: 30, roomType: 'LECTURE' as RoomType, equipment: JSON.stringify(['projektor', 'tablica']), description: 'Sala wykładowa 3.1 - 30 miejsc' },

  // Sale komputerowe D-14a
  { name: '3.6', building: 'D-14a', floor: 3, capacity: 20, roomType: 'LABORATORY' as RoomType, equipment: JSON.stringify(['komputery', 'projektor', 'tablica']), description: 'Sala komputerowa 3.6 - 20 miejsc' },
  { name: '3.2', building: 'D-14a', floor: 3, capacity: 30, roomType: 'LABORATORY' as RoomType, equipment: JSON.stringify(['komputery', 'projektor', 'tablica']), description: 'Sala komputerowa 3.2 - 30 miejsc' },
  { name: '3.7', building: 'D-14a', floor: 3, capacity: 30, roomType: 'LABORATORY' as RoomType, equipment: JSON.stringify(['komputery', 'projektor', 'tablica']), description: 'Sala komputerowa 3.7 - 30 miejsc' },

  // Sale komputerowe D-14
  { name: '320', building: 'D-14', floor: 3, capacity: 15, roomType: 'LABORATORY' as RoomType, equipment: JSON.stringify(['komputery', 'projektor']), description: 'Sala komputerowa 320 - 15 miejsc' },
  { name: '307', building: 'D-14', floor: 3, capacity: 30, roomType: 'LABORATORY' as RoomType, equipment: JSON.stringify(['komputery', 'projektor', 'tablica']), description: 'Sala komputerowa 307 - 30 miejsc' },
  { name: '319', building: 'D-14', floor: 3, capacity: 30, roomType: 'LABORATORY' as RoomType, equipment: JSON.stringify(['komputery', 'projektor', 'tablica']), description: 'Sala komputerowa 319 - 30 miejsc' },
  { name: '206', building: 'D-14', floor: 2, capacity: 15, roomType: 'LABORATORY' as RoomType, equipment: JSON.stringify(['komputery', 'projektor']), description: 'Sala komputerowa 206 - 15 miejsc' },
  { name: '220', building: 'D-14', floor: 2, capacity: 15, roomType: 'LABORATORY' as RoomType, equipment: JSON.stringify(['komputery', 'projektor']), description: 'Sala komputerowa 220 - 15 miejsc' },
  { name: '315', building: 'D-14', floor: 3, capacity: 15, roomType: 'LABORATORY' as RoomType, equipment: JSON.stringify(['komputery', 'projektor']), description: 'Sala komputerowa 315 - 15 miejsc' },
  { name: '106', building: 'D-14', floor: 1, capacity: 15, roomType: 'LABORATORY' as RoomType, equipment: JSON.stringify(['komputery', 'projektor']), description: 'Sala komputerowa 106 - 15 miejsc' },
];

// Mapowanie nazw sal z CSV do nazw w bazie danych
export const roomNameMapping: Record<string, string> = {
  // D-14
  'D-14, sala 100 (AULA)': 'Aula',
  'D-14, sala 118': '118',
  'D-14, sala 116': '116',
  'D-14, sala 119': '119',
  'D-14, sala 206': '206',
  'D-14, sala 207': '207',
  'D-14, sala 219': '219',
  'D-14, sala 220': '220',
  'D-14, sala 306': '306',
  'D-14, sala 307': '307',
  'D-14, sala 315': '315',
  'D-14, sala 319': '319',
  'D-14, sala 320': '320',
  'D-14, sala 106': '106',
  // D-14a
  'D-14a, sala 0.1': '0.1',
  'D-14a, sala 0.2': '0.2',
  'D-14a, sala 0.3': 'A-0.3',
  'D-14a, sala 1.1': '1.1',
  'D-14a, sala 1.2': '1.2',
  'D-14a, sala 1.6': '1.6',
  'D-14a, sala 2.1': '2.1',
  'D-14a, sala 2.2': '2.2',
  'D-14a, sala 2.6': '2.6',
  'D-14a, sala 3.1': '3.1',
  'D-14a, sala 3.2': '3.2',
  'D-14a, sala 3.6': '3.6',
  'D-14a, sala 3.7': '3.7',
};

const users = [
  {
    email: 'admin@wydzial.pl',
    name: 'Administrator',
    password: 'admin123',
    role: 'ADMIN' as const,
  },
  {
    email: 'student@wydzial.pl',
    name: 'Jan Kowalski',
    password: 'student123',
    role: 'USER' as const,
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
        role: user.role,
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
        roomType: room.roomType,
      },
    });
  }

  console.log('Database seeded successfully with real room data!');
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
