## ❌ CZEGO BRAKUJE (z wymagań z zajęć):

### 1. Sortowanie sal od najmniejszej pojemności

- Gdzie: app/api/rooms/route.ts linia 30-36
- Jak: Zmienić orderBy na capacity: 'asc' gdy jest filtr minCapacity

### 2. Typ sali (laboratorium, wykładowa, konferencyjna)

- Gdzie: prisma/schema.prisma + types/index.ts
- Jak: Dodać enum RoomType i pole roomType w modelu Room
- Uwaga: Wymaga migracji bazy danych

### 3. Status sprzątania ⚠️ NAJWAŻNIEJSZE

- Gdzie: prisma/schema.prisma model Room
- Jak: Dodać pole isCleaned: Boolean i lastUsedAt: DateTime?
- Logika: Priorytetyzować sale "brudne" (już używane dziś) → oszczędność kosztów
- Uwaga: Wymaga migracji bazy danych

### 4. Kod QR do sal

- Gdzie: app/rooms/[id]/page.tsx
- Jak: Zainstalować npm install qrcode @types/qrcode, wygenerować QR z URL sali
- Cel: Skanowanie → natychmiastowa rezerwacja

### 5. Filtr daty dostępności

- Gdzie: app/rooms/page.tsx (frontend) + app/api/rooms/route.ts (backend)
- Jak:
- Frontend: dodać input type="date"
- Backend: sprawdzać kolizje rezerwacji w wybranym dniu
- Wyświetlać tylko wolne sale

### 6. Prezentacja Figma (6 slajdów inwestorskich)

- Status: Nieznany - sprawdź czy Julia zrobiła
- Link: https://www.figma.com/design/XoFUMT9nNvHs71YElvhHb6/w
