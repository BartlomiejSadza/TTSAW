import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { roomNameMapping } from '@/lib/seed';
import fs from 'fs';
import path from 'path';

interface CSVRow {
  przedmiot: string;
  zajecia: string;
  data: string;
  godz_od: string;
  godz_do: string;
  lokalizacja: string;
  prowadzacy: string;
  tytul: string;
  kierunek: string;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
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

function parseDate(dateStr: string, timeStr: string): Date | null {
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

function getRoomNameFromLocation(location: string): string | null {
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

export async function POST() {
  try {
    // Znajdź użytkownika systemowego (admin) do przypisania rezerwacji
    const systemUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (!systemUser) {
      return NextResponse.json(
        { error: 'System user not found. Please run seed first.' },
        { status: 400 }
      );
    }

    // Wczytaj plik CSV
    const csvPath = path.join(
      process.cwd(),
      'DUDA_USOS_ROZLICZENIE_ZIMA_2025_2026(USOS_ROZLICZENIE_ZIMA_2025_2026).csv'
    );

    if (!fs.existsSync(csvPath)) {
      return NextResponse.json({ error: 'CSV file not found' }, { status: 400 });
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');

    // Pobierz nagłówki (pierwsza linia)
    const headers = parseCSVLine(lines[0]);
    const przedmiotIdx = headers.findIndex((h) => h.includes('przedmiot'));
    const zajeciaIdx = headers.findIndex((h) => h.includes('zajecia'));
    const dataIdx = headers.findIndex((h) => h.includes('data'));
    const godzOdIdx = headers.findIndex((h) => h.includes('godz_od'));
    const godzDoIdx = headers.findIndex((h) => h.includes('godz_do'));
    const lokalizacjaIdx = headers.findIndex((h) => h.includes('lokalizacja'));
    const prowadzacyIdx = headers.findIndex((h) => h.includes('prowadzacy'));

    // Pobierz wszystkie sale z bazy
    const rooms = await prisma.room.findMany();
    const roomMap = new Map(rooms.map((r) => [r.name, r.id]));

    // Usuń istniejące rezerwacje systemowe (te zaimportowane z USOS)
    await prisma.reservation.deleteMany({
      where: {
        userId: systemUser.id,
      },
    });

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

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

        // Sprawdź czy rezerwacja nie nachodzi na istniejącą
        const existingReservation = await prisma.reservation.findFirst({
          where: {
            roomId,
            OR: [
              {
                AND: [
                  { startTime: { lte: startTime } },
                  { endTime: { gt: startTime } },
                ],
              },
              {
                AND: [
                  { startTime: { lt: endTime } },
                  { endTime: { gte: endTime } },
                ],
              },
              {
                AND: [
                  { startTime: { gte: startTime } },
                  { endTime: { lte: endTime } },
                ],
              },
            ],
          },
        });

        if (existingReservation) {
          skipped++;
          continue;
        }

        // Utwórz rezerwację
        await prisma.reservation.create({
          data: {
            roomId,
            userId: systemUser.id,
            title: title.substring(0, 255), // Ogranicz długość
            startTime,
            endTime,
            status: 'CONFIRMED',
          },
        });

        imported++;
      } catch (err) {
        errors.push(`Line ${i}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        skipped++;
      }
    }

    return NextResponse.json({
      message: 'Import completed',
      imported,
      skipped,
      errors: errors.slice(0, 10), // Zwróć max 10 błędów
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Failed to import schedule' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Zwróć statystyki aktualnych rezerwacji
  const stats = await prisma.reservation.groupBy({
    by: ['status'],
    _count: true,
  });

  const totalReservations = await prisma.reservation.count();
  const totalRooms = await prisma.room.count();

  return NextResponse.json({
    totalReservations,
    totalRooms,
    byStatus: stats,
  });
}
