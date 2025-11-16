# SmartOffice - System Rezerwacji Sal

System rezerwacji sal dla wydziału uczelni zbudowany w Next.js 16 z TypeScript.

## Funkcjonalności

- Przeglądanie dostępnych sal (filtry, wyszukiwanie)
- Rezerwacja sal z walidacją konfliktów
- Panel użytkownika z kalendarzem
- Panel administratora
- Autentykacja (rejestracja, logowanie)
- API RESTful

## Wymagania

- Node.js 18+
- pnpm (zalecane) lub npm/yarn

## Szybki start

### 1. Instalacja zależności

```bash
pnpm install
```

### 2. Konfiguracja środowiska

Utwórz plik `.env.local` w głównym katalogu:

```bash
AUTH_SECRET=twoj-tajny-klucz-min-32-znaki-zmien-w-produkcji
NEXTAUTH_URL=http://localhost:3000
```

Możesz wygenerować bezpieczny klucz:
```bash
openssl rand -base64 32
```

### 3. Inicjalizacja bazy danych (opcjonalne)

Baza danych SQLite (sql.js) tworzy się automatycznie przy pierwszym uruchomieniu. Możesz załadować dane testowe:

```bash
npx tsx lib/seed.ts
```

To utworzy:
- 2 użytkowników (admin i student)
- 5 sal (A101, A102, B201, B202, C301)

### 4. Uruchomienie serwera deweloperskiego

```bash
pnpm dev
```

Otwórz [http://localhost:3000](http://localhost:3000) w przeglądarce.

### 5. Logowanie

Dane testowe:
- **Admin**: `admin@wydzial.pl` / `admin123`
- **Student**: `student@wydzial.pl` / `student123`

Lub zarejestruj nowe konto na stronie `/register`.

## Skrypty

```bash
# Serwer deweloperski
pnpm dev

# Build produkcyjny
pnpm build

# Uruchomienie produkcyjne
pnpm start

# Sprawdzenie TypeScript
npx tsc --noEmit

# Linting
pnpm lint

# Załadowanie danych testowych
npx tsx lib/seed.ts
```

## Struktura projektu

```
├── app/                    # Next.js App Router
│   ├── api/               # Endpointy API
│   │   ├── auth/          # NextAuth.js
│   │   ├── health/        # Health check
│   │   ├── reservations/  # CRUD rezerwacji
│   │   ├── rooms/         # CRUD sal
│   │   └── ...
│   ├── dashboard/         # Panel główny
│   ├── rooms/             # Lista sal
│   ├── reservations/      # Moje rezerwacje
│   ├── calendar/          # Widok kalendarza
│   ├── admin/             # Panel admina
│   ├── login/             # Logowanie
│   └── register/          # Rejestracja
├── components/            # Komponenty React
│   ├── ui/               # Podstawowe UI
│   └── layout/           # Layouty
├── lib/                   # Biblioteki
│   ├── db.ts             # Połączenie z bazą (sql.js)
│   ├── auth.ts           # Konfiguracja NextAuth
│   ├── seed.ts           # Dane seedowe
│   └── utils.ts          # Pomocnicze funkcje
├── types/                 # Definicje TypeScript
├── middleware.ts          # Middleware autoryzacji
└── dev.db                # Baza danych SQLite
```

## API Endpoints

| Endpoint | Metoda | Opis | Auth |
|----------|--------|------|------|
| `/api/health` | GET | Health check | Publiczny |
| `/api/rooms` | GET | Lista sal | Publiczny |
| `/api/rooms/[id]` | GET | Szczegóły sali | Publiczny |
| `/api/reservations` | GET | Moje rezerwacje | Wymagany |
| `/api/reservations` | POST | Utwórz rezerwację | Wymagany |
| `/api/reservations/[id]` | DELETE | Anuluj rezerwację | Wymagany |
| `/api/reservations/[id]` | PATCH | Zmień status | Wymagany |
| `/api/register` | POST | Rejestracja | Publiczny |
| `/api/auth/*` | * | NextAuth endpoints | Publiczny |
| `/api/calendar` | GET | Wydarzenia kalendarza | Wymagany |
| `/api/stats` | GET | Statystyki | Wymagany |
| `/api/users` | GET | Lista użytkowników | Admin |

## Przykłady użycia API

### Health check
```bash
curl http://localhost:3000/api/health
```

### Lista sal
```bash
curl http://localhost:3000/api/rooms
```

### Rejestracja
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"jan@test.pl","name":"Jan Kowalski","password":"test123"}'
```

### Tworzenie rezerwacji (wymaga sesji)
```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "roomId": "ROOM_ID",
    "title": "Spotkanie",
    "startTime": "2025-11-20T10:00:00Z",
    "endTime": "2025-11-20T11:00:00Z"
  }'
```

## Technologie

- **Framework**: Next.js 16 (App Router)
- **Język**: TypeScript
- **Baza danych**: SQLite (sql.js - in-memory)
- **Autentykacja**: NextAuth.js v5
- **Styling**: Tailwind CSS v4
- **State**: React hooks
- **Walidacja**: Natywna + custom

## Rozwiązywanie problemów

### Błąd WASM sql.js
Upewnij się, że masz zainstalowane zależności:
```bash
pnpm install
```

### NextAuth error "Missing Secret"
Utwórz plik `.env.local` z `AUTH_SECRET`.

### Brak dostępu do API
Sprawdź czy endpointy są na liście `publicRoutes` w `middleware.ts`.

### Baza danych nie istnieje
Uruchom seed:
```bash
npx tsx lib/seed.ts
```

## Produkcja

```bash
# Build
pnpm build

# Start
pnpm start
```

**Ważne dla produkcji:**
- Zmień `AUTH_SECRET` na bezpieczny klucz
- Rozważ użycie prawdziwej bazy danych (PostgreSQL, MySQL)
- Skonfiguruj HTTPS
- Dodaj rate limiting
- Włącz logowanie błędów

## Licencja

MIT
