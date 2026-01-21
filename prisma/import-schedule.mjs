import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Mapowanie nazw sal z CSV do nazw w bazie danych
const roomNameMapping = {
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

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ';' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseDate(dateStr, timeStr) {
  // Format: DD.MM.YYYY and HH:MM
  const dateParts = dateStr.split('.');
  if (dateParts.length !== 3) return null;

  const [day, month, year] = dateParts.map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  if (isNaN(day) || isNaN(month) || isNaN(year) || isNaN(hours) || isNaN(minutes)) {
    return null;
  }

  return new Date(year, month - 1, day, hours, minutes);
}

function getRoomNameFromLocation(location) {
  // Sprawdź mapowanie
  if (roomNameMapping[location]) {
    return roomNameMapping[location];
  }

  // Pomiń sale online i zewnętrzne
  if (
    location.includes('online') ||
    location.includes('poza AGH') ||
    location.includes('Wirtualna') ||
    !location.includes('D-14')
  ) {
    return null;
  }

  return null;
}

async function importSchedule() {
  console.log('Starting schedule import...');

  // Znajdź użytkownika systemowego (admin) do przypisania rezerwacji
  const systemUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!systemUser) {
    console.error('System user not found. Please run seed first.');
    process.exit(1);
  }

  console.log(`Using admin user: ${systemUser.email}`);

  // Wczytaj plik CSV
  const csvPath = path.join(
    __dirname,
    '..',
    'DUDA_USOS_ROZLICZENIE_ZIMA_2025_2026(USOS_ROZLICZENIE_ZIMA_2025_2026).csv'
  );

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found at: ${csvPath}`);
    process.exit(1);
  }

  console.log(`Reading CSV from: ${csvPath}`);
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n');
  console.log(`Found ${lines.length} lines in CSV`);

  // Pobierz nagłówki (pierwsza linia)
  const headers = parseCSVLine(lines[0]);
  const przedmiotIdx = headers.findIndex((h) => h.includes('przedmiot'));
  const zajeciaIdx = headers.findIndex((h) => h.includes('zajecia'));
  const dataIdx = headers.findIndex((h) => h.includes('data'));
  const godzOdIdx = headers.findIndex((h) => h.includes('godz_od'));
  const godzDoIdx = headers.findIndex((h) => h.includes('godz_do'));
  const lokalizacjaIdx = headers.findIndex((h) => h.includes('lokalizacja'));
  const prowadzacyIdx = headers.findIndex((h) => h.includes('prowadzacy'));

  console.log('Column indices:', { przedmiotIdx, zajeciaIdx, dataIdx, godzOdIdx, godzDoIdx, lokalizacjaIdx, prowadzacyIdx });

  // Pobierz wszystkie sale z bazy
  const rooms = await prisma.room.findMany();
  console.log(`Found ${rooms.length} rooms in database`);
  const roomMap = new Map(rooms.map((r) => [r.name, r.id]));

  // Usuń istniejące rezerwacje systemowe (te zaimportowane z USOS)
  const deletedCount = await prisma.reservation.deleteMany({
    where: {
      userId: systemUser.id,
    },
  });
  console.log(`Deleted ${deletedCount.count} existing system reservations`);

  let imported = 0;
  let skipped = 0;
  const errors = [];

  // Batch size for creating reservations
  const batchSize = 100;
  let batch = [];

  // Przetwórz każdą linię
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const values = parseCSVLine(line);

      const przedmiot = values[przedmiotIdx] || '';
      const zajecia = values[zajeciaIdx] || '';
      const data = values[dataIdx] || '';
      const godzOd = values[godzOdIdx] || '';
      const godzDo = values[godzDoIdx] || '';
      const lokalizacja = values[lokalizacjaIdx] || '';
      const prowadzacy = values[prowadzacyIdx] || '';

      // Znajdź salę
      const roomName = getRoomNameFromLocation(lokalizacja);
      if (!roomName) {
        skipped++;
        continue;
      }

      const roomId = roomMap.get(roomName);
      if (!roomId) {
        skipped++;
        continue;
      }

      // Parsuj daty
      const startTime = parseDate(data, godzOd);
      const endTime = parseDate(data, godzDo);

      if (!startTime || !endTime) {
        skipped++;
        continue;
      }

      // Utwórz tytuł rezerwacji
      const title = `${przedmiot} - ${zajecia}${prowadzacy ? ` (${prowadzacy})` : ''}`;

      // Dodaj do batcha
      batch.push({
        roomId,
        userId: systemUser.id,
        title: title.substring(0, 255),
        startTime,
        endTime,
        status: 'CONFIRMED',
      });

      imported++;

      // Zapisz batch
      if (batch.length >= batchSize) {
        await prisma.reservation.createMany({
          data: batch,
          skipDuplicates: true,
        });
        process.stdout.write(`\rImported: ${imported}`);
        batch = [];
      }
    } catch (err) {
      errors.push(`Line ${i}: ${err.message}`);
      skipped++;
    }
  }

  // Zapisz pozostałe
  if (batch.length > 0) {
    await prisma.reservation.createMany({
      data: batch,
      skipDuplicates: true,
    });
  }

  console.log('\n');
  console.log('=== Import Summary ===');
  console.log(`Imported: ${imported}`);
  console.log(`Skipped: ${skipped}`);
  if (errors.length > 0) {
    console.log(`Errors (first 10):`);
    errors.slice(0, 10).forEach((e) => console.log(`  - ${e}`));
  }

  // Statystyki końcowe
  const totalReservations = await prisma.reservation.count();
  console.log(`\nTotal reservations in database: ${totalReservations}`);
}

importSchedule()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Import failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
