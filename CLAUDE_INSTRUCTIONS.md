# SmartOffice - Instrukcja dla Claude Code Agent

## Cel projektu

Stwórz system SmartOffice do rezerwacji sal dla wydziału uczelni. System ma umożliwiać przeglądanie dostępności sal, rezerwację terminów, zarządzanie salami i użytkownikami.

## Stack technologiczny

- **Frontend**: Next.js 16 + React 19 + TypeScript + Tailwind CSS (już skonfigurowane)
- **Backend**: Next.js API Routes (w folderze `frontend/app/api/`)
- **Baza danych**: SQLite + Prisma ORM (proste, bez konfiguracji serwera)
- **Autentykacja**: NextAuth.js z credentials provider

## Architektura

### Struktura folderów (docelowa)

```
frontend/
├── app/
│   ├── api/                    # API Routes
│   │   ├── auth/[...nextauth]/ # NextAuth
│   │   ├── rooms/              # CRUD sal
│   │   ├── reservations/       # CRUD rezerwacji
│   │   └── users/              # Zarządzanie użytkownikami
│   ├── (auth)/                 # Strony logowania/rejestracji
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/              # Panel główny
│   ├── rooms/                  # Lista sal
│   │   └── [id]/               # Szczegóły sali
│   ├── reservations/           # Moje rezerwacje
│   ├── calendar/               # Widok kalendarza
│   └── admin/                  # Panel admina
├── components/                 # Komponenty React
│   ├── ui/                     # Komponenty bazowe (Button, Input, Card)
│   ├── forms/                  # Formularze
│   ├── layout/                 # Navbar, Sidebar, Footer
│   └── calendar/               # Komponenty kalendarza
├── lib/                        # Utilities
│   ├── prisma.ts               # Klient Prisma
│   ├── auth.ts                 # Konfiguracja NextAuth
│   └── utils.ts                # Pomocnicze funkcje
├── types/                      # TypeScript types
├── hooks/                      # Custom React hooks
└── prisma/
    ├── schema.prisma           # Model bazy danych
    └── seed.ts                 # Dane testowe
```

## Model danych (Prisma)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  password      String    // hashed
  role          Role      @default(USER)
  reservations  Reservation[]
  createdAt     DateTime  @default(now())
}

enum Role {
  USER
  ADMIN
}

model Room {
  id           String    @id @default(cuid())
  name         String
  building     String
  floor        Int
  capacity     Int
  equipment    String[]  // projektor, tablica, komputery
  description  String?
  reservations Reservation[]
  createdAt    DateTime  @default(now())
}

model Reservation {
  id        String   @id @default(cuid())
  roomId    String
  room      Room     @relation(fields: [roomId], references: [id])
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  title     String
  startTime DateTime
  endTime   DateTime
  status    ReservationStatus @default(PENDING)
  createdAt DateTime @default(now())
}

enum ReservationStatus {
  PENDING
  CONFIRMED
  CANCELLED
}
```

## Funkcjonalności do implementacji (w kolejności)

### FAZA 1: Fundament

1. **Konfiguracja Prisma i bazy SQLite**

   - Zainstaluj `prisma` i `@prisma/client`
   - Stwórz schema.prisma z modelami
   - Uruchom `prisma migrate dev`
   - Dodaj seed z przykładowymi danymi (5 sal, 2 użytkowników)

2. **Autentykacja (NextAuth.js)**

   - Zainstaluj `next-auth` i `bcrypt`
   - Skonfiguruj credentials provider
   - Strona logowania (`/login`)
   - Strona rejestracji (`/register`)
   - Middleware do ochrony tras

3. **Layout podstawowy**
   - Navbar z nawigacją i info o użytkowniku
   - Sidebar z menu
   - Responsywny design (mobile-first)

### FAZA 2: Core Features

4. **Lista sal (`/rooms`)**

   - Wyświetlanie wszystkich sal w gridzie
   - Filtrowanie po budynku, piętrze, pojemności
   - Wyszukiwarka
   - Karty z podstawowymi info o sali

5. **Szczegóły sali (`/rooms/[id]`)**

   - Pełne informacje o sali
   - Mini kalendarz z dostępnością
   - Przycisk "Zarezerwuj"

6. **Formularz rezerwacji**

   - Wybór daty i godziny (start/end)
   - Walidacja (sala wolna, nie w przeszłości)
   - Potwierdzenie rezerwacji

7. **Moje rezerwacje (`/reservations`)**
   - Lista rezerwacji użytkownika
   - Status rezerwacji (pending/confirmed/cancelled)
   - Możliwość anulowania

### FAZA 3: Zaawansowane

8. **Widok kalendarza (`/calendar`)**

   - Kalendarz tygodniowy/miesięczny
   - Kolorowe bloki rezerwacji
   - Kliknięcie = szczegóły rezerwacji

9. **Dashboard (`/dashboard`)**

   - Nadchodzące rezerwacje
   - Szybkie statystyki
   - Popularne sale

10. **Panel admina (`/admin`)**
    - CRUD sal (dodawanie, edycja, usuwanie)
    - Lista wszystkich rezerwacji
    - Zarządzanie użytkownikami
    - Zmiana statusu rezerwacji

### FAZA 4: Polish

11. **Powiadomienia**

    - Toast notifications (react-hot-toast)
    - Komunikaty o błędach
    - Potwierdzenia akcji

12. **Optymalizacja**
    - Loading states (skeletony)
    - Error boundaries
    - Optymistyczne UI updates

## Zasady implementacji

### Styl kodu

- Używaj TypeScript z strict mode
- Komponenty funkcyjne z hooks
- Server Components gdzie możliwe (Next.js 16)
- Client Components tylko gdy potrzebna interaktywność
- Tailwind dla stylów (bez custom CSS)
- Nazewnictwo: PascalCase dla komponentów, camelCase dla funkcji

### API Routes

- Zwracaj zawsze JSON z odpowiednim statusem
- Obsługuj błędy (try/catch)
- Waliduj dane wejściowe
- Sprawdzaj autoryzację

### Komponenty UI

- Twórz reużywalne komponenty w `components/ui/`
- Button, Input, Card, Modal, Badge, Select
- Używaj wariantów (primary, secondary, danger)
- Accessibility (aria labels, keyboard navigation)

### Bezpieczeństwo

- Hashuj hasła (bcrypt)
- Waliduj dane na serwerze
- Sprawdzaj sesję użytkownika
- Nie ufaj danym z frontendu

## Komendy do uruchomienia

```bash
# Instalacja zależności
cd frontend
pnpm add prisma @prisma/client next-auth bcrypt @types/bcrypt
pnpm add react-hot-toast date-fns
pnpm add -D prisma

# Inicjalizacja Prisma
npx prisma init --datasource-provider sqlite

# Po stworzeniu schema
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed

# Uruchomienie
pnpm dev
```

## Przykładowe dane testowe (seed)

```typescript
// Sale
const rooms = [
  {
    name: "A101",
    building: "A",
    floor: 1,
    capacity: 30,
    equipment: ["projektor", "tablica"],
  },
  {
    name: "A102",
    building: "A",
    floor: 1,
    capacity: 20,
    equipment: ["projektor", "komputery"],
  },
  {
    name: "B201",
    building: "B",
    floor: 2,
    capacity: 50,
    equipment: ["projektor", "tablica", "mikrofon"],
  },
  {
    name: "B202",
    building: "B",
    floor: 2,
    capacity: 15,
    equipment: ["tablica"],
  },
  {
    name: "C301",
    building: "C",
    floor: 3,
    capacity: 100,
    equipment: ["projektor", "mikrofon", "nagłośnienie"],
  },
];

// Użytkownicy
const users = [
  {
    email: "admin@wydzial.pl",
    name: "Admin",
    password: "admin123",
    role: "ADMIN",
  },
  {
    email: "student@wydzial.pl",
    name: "Jan Kowalski",
    password: "student123",
    role: "USER",
  },
];
```

## Checklisty dla każdego etapu

### Po każdym etapie sprawdź:

- [ ] Kod kompiluje się bez błędów TypeScript
- [ ] `pnpm lint` nie pokazuje błędów
- [ ] Aplikacja uruchamia się (`pnpm dev`)
- [ ] Nowa funkcjonalność działa w przeglądarce
- [ ] Responsywność (sprawdź na mobile)
- [ ] Obsługa błędów (co jeśli API zwróci 500?)

## Priorytety

1. **Działający MVP** > Perfekcyjny kod
2. **Funkcjonalność** > Wygląd
3. **Prostota** > Overengineering
4. **TypeScript safety** > Any types

## WAŻNE

- NIE używaj zewnętrznych serwisów (Firebase, Supabase) - wszystko lokalnie
- NIE twórz osobnego backendu - używaj Next.js API Routes
- NIE instaluj zbędnych bibliotek - minimalizuj zależności
- ZAWSZE testuj w przeglądarce po każdej zmianie
- COMMITUJ po każdej działającej funkcjonalności

## Kolejność wykonania (step-by-step)

1. Skonfiguruj Prisma + SQLite + modele
2. Stwórz seed z danymi testowymi
3. Zainstaluj i skonfiguruj NextAuth
4. Stwórz stronę logowania
5. Stwórz stronę rejestracji
6. Dodaj middleware ochrony tras
7. Stwórz podstawowy layout (Navbar + Sidebar)
8. Stwórz stronę główną (dashboard placeholder)
9. Stwórz API endpoint dla sal (GET /api/rooms)
10. Stwórz stronę listy sal
11. Stwórz stronę szczegółów sali
12. Stwórz API endpoint dla rezerwacji (POST /api/reservations)
13. Stwórz formularz rezerwacji
14. Stwórz stronę "Moje rezerwacje"
15. Dodaj możliwość anulowania rezerwacji
16. Stwórz widok kalendarza
17. Rozbuduj dashboard o statystyki
18. Stwórz panel admina
19. Dodaj toast notifications
20. Dodaj loading states i error handling

---

**START: Zacznij od punktu 1 - konfiguracja Prisma**
