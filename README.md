# SmartOffice - System Rezerwacji Sal

SmartOffice to nowoczesny system zarządzania rezerwacjami sal konferencyjnych i wykładowych z interaktywnym planem pięter w układzie podkowy.

## 🚀 Funkcjonalności

### Dla użytkowników:
- 📅 **Przeglądanie dostępnych sal** - lista wszystkich sal z filtrowaniem
- 🏢 **Interaktywny plan pięter** - wizualna reprezentacja sal w układzie podkowy (4 piętra × 10 sal)
- 📝 **Rezerwacja sal** - prosta rezerwacja z wyborem daty i godziny
- 📊 **Zarządzanie rezerwacjami** - podgląd własnych rezerwacji (nadchodzących i przeszłych)
- 🗓️ **Kalendarz** - widok kalendarza rezerwacji

### Dla administratorów:
- 👥 **Zarządzanie użytkownikami** - tworzenie kont użytkowników i administratorów
- 🏫 **Zarządzanie salami** - dodawanie i edycja sal
- ✅ **Zatwierdzanie rezerwacji** - potwierdzanie lub odrzucanie rezerwacji
- 📈 **Przegląd wszystkich rezerwacji** - widok wszystkich rezerwacji w systemie

## 🛠️ Technologie

- **Frontend**: Next.js 16.0.1 (App Router), React 19.2.0, TypeScript
- **Backend**: Next.js API Routes
- **Baza danych**: PostgreSQL z Prisma ORM
- **Autentykacja**: NextAuth.js 5.0-beta.30
- **Stylowanie**: Tailwind CSS 4
- **Walidacja**: Bcrypt dla haseł
- **Powiadomienia**: react-hot-toast

## 📋 Wymagania

- **Node.js**: wersja 18.x lub nowsza
- **npm**: wersja 8.x lub nowsza
- **PostgreSQL**: wersja 14.x lub nowsza (lub dostęp do bazy PostgreSQL)
- **System operacyjny**: Windows, macOS lub Linux

## 🔧 Instalacja

### Metoda 1: Automatyczna instalacja (ZALECANE) 🚀

Najłatwiejszy sposób - wszystko zrobi się automatycznie!

#### Linux/macOS:
```bash
git clone https://github.com/BartlomiejSadza/TTSAW.git
cd TTSAW
chmod +x setup.sh
./setup.sh
```

#### Windows:
```cmd
git clone https://github.com/BartlomiejSadza/TTSAW.git
cd TTSAW
setup.bat
```

Skrypt automatycznie:
- ✅ Sprawdzi wymagania systemowe (Node.js, npm, PostgreSQL)
- ✅ Zainstaluje wszystkie zależności
- ✅ Wygeneruje plik `.env` z bezpiecznym kluczem
- ✅ Pomoże skonfigurować bazę danych (lokalną lub zdalną)
- ✅ Uruchomi migracje Prisma
- ✅ Zaseeduje bazę przykładowymi danymi

---

### Metoda 2: Instalacja ręczna

Jeśli wolisz wszystko zrobić samodzielnie:

#### 1. Klonowanie repozytorium

```bash
git clone https://github.com/BartlomiejSadza/TTSAW.git
cd TTSAW
```

#### 2. Instalacja zależności

```bash
npm install
```

#### 3. Konfiguracja zmiennych środowiskowych

Skopiuj plik `.env.example` do `.env`:

```bash
cp .env.example .env
```

Następnie edytuj plik `.env` i uzupełnij wartości:

```env
# Database - URL do bazy PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/smartoffice"

# Auth.js v5 configuration
# Wygeneruj secret: openssl rand -base64 32
AUTH_SECRET="twoj-wygenerowany-sekretny-klucz-min-32-znaki"
AUTH_TRUST_HOST=true
AUTH_URL="http://localhost:3000"

# Legacy NextAuth support (opcjonalne, dla kompatybilności wstecznej)
NEXTAUTH_SECRET="twoj-wygenerowany-sekretny-klucz-min-32-znaki"
NEXTAUTH_URL="http://localhost:3000"
```

**Uwaga**: Pamiętaj, aby zastąpić `user`, `password` i nazwę bazy danych własnymi wartościami.

#### 4. Inicjalizacja bazy danych

Uruchom migracje Prisma, aby utworzyć tabele w bazie danych:

```bash
npx prisma db push
```

Lub użyj migracji (zalecane dla produkcji):

```bash
npx prisma migrate dev --name init
```

#### 5. Zaseedowanie bazy danych (opcjonalne)

Wypełnij bazę danych przykładowymi danymi:

```bash
npm run seed
```

Lub zrób to poprzez API po uruchomieniu aplikacji:

```bash
curl -X POST http://localhost:3000/api/seed
```

## ▶️ Uruchomienie

### Tryb deweloperski

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem: [http://localhost:3000](http://localhost:3000)

### Tryb produkcyjny

```bash
npm run build
npm start
```

## 👤 Dane logowania (po seedowaniu)

### Administrator:
- **Email**: admin@wydzial.pl
- **Hasło**: admin123

### Użytkownik testowy:
- **Email**: student@wydzial.pl
- **Hasło**: student123

## 📁 Struktura projektu

```
TTSAW/
├── app/                        # Next.js App Router
│   ├── admin/                 # Panel administratora
│   ├── api/                   # API endpoints
│   │   ├── auth/             # Autentykacja NextAuth
│   │   ├── users/            # Zarządzanie użytkownikami
│   │   ├── rooms/            # Zarządzanie salami
│   │   ├── reservations/     # Zarządzanie rezerwacjami
│   │   └── seed/             # Inicjalizacja danych
│   ├── dashboard/            # Strona główna po zalogowaniu
│   ├── floor-plan/           # Interaktywny plan pięter
│   ├── rooms/                # Przeglądanie i rezerwacja sal
│   ├── reservations/         # Zarządzanie rezerwacjami użytkownika
│   ├── calendar/             # Kalendarz rezerwacji
│   ├── login/                # Strona logowania
│   └── register/             # Rejestracja nowych użytkowników
├── components/
│   ├── layout/               # Komponenty layoutu (Navbar, Sidebar)
│   └── ui/                   # Komponenty UI (Button, Card, Input, FloorPlan)
├── lib/
│   ├── auth.ts              # Konfiguracja NextAuth
│   ├── db.ts                # Połączenie z bazą danych (sql.js)
│   ├── seed.ts              # Dane testowe
│   └── utils.ts             # Funkcje pomocnicze
├── prisma/
│   └── schema.prisma        # Schema bazy danych
├── types/
│   └── index.ts             # Definicje typów TypeScript
├── dev.db                   # Plik bazy danych SQLite
└── package.json

```

## 🗄️ Model danych

### Users (Użytkownicy)
- `id`: Unikalny identyfikator (CUID)
- `email`: Email (unikalny)
- `name`: Imię i nazwisko
- `password`: Zahashowane hasło (bcrypt)
- `role`: Rola (USER | ADMIN)
- `createdAt`: Data utworzenia

### Rooms (Sale)
- `id`: Unikalny identyfikator (CUID)
- `name`: Nazwa sali (np. "101", "202")
- `building`: Budynek (np. "A")
- `floor`: Numer piętra (1-4)
- `capacity`: Pojemność (liczba miejsc)
- `equipment`: Wyposażenie (JSON array)
- `description`: Opis sali
- `positionX`, `positionY`: Pozycja na planie (opcjonalne)
- `createdAt`: Data utworzenia

### Reservations (Rezerwacje)
- `id`: Unikalny identyfikator (CUID)
- `roomId`: ID sali
- `userId`: ID użytkownika
- `title`: Tytuł rezerwacji
- `startTime`: Data i godzina rozpoczęcia
- `endTime`: Data i godzina zakończenia
- `status`: Status (PENDING | CONFIRMED | CANCELLED)
- `createdAt`: Data utworzenia

## 🎨 Plan pięter

System zawiera interaktywną wizualizację planu pięter w kształcie podkowy:

### Układ budynku:
```
    [ ][ ][ ][ ]     <- 4 sale na górze
   [ ]           [ ]  <- Lewy i prawy bok
   [ ]           [ ]
   [ ]           [ ]  <- 3 sale po każdej stronie
        [Dziedziniec]
```

### Charakterystyka:
- **4 piętra** (1, 2, 3, 4)
- **10 sal na każdym piętrze**
- **Razem 40 sal** w systemie
- **Układ podkowy** z dziedzińcem w centrum
- **Interaktywne pokoje** - kliknięcie przekierowuje do rezerwacji
- **Efekt hover** - niebieskie podświetlenie przy najechaniu

## 🔐 Bezpieczeństwo

### Zaimplementowane zabezpieczenia:
- ✅ **Hashowanie haseł** - bcrypt z 10 rund saltingu
- ✅ **Autoryzacja** - middleware Next.js sprawdza sesję
- ✅ **Role użytkowników** - rozróżnienie USER/ADMIN
- ✅ **Parametryzowane zapytania** - ochrona przed SQL Injection
- ✅ **Walidacja danych** - po stronie frontendu i backendu
- ✅ **JWT tokens** - bezpieczne sesje

### Ograniczenia dostępu:
- Endpointy admina wymagają roli `ADMIN`
- Użytkownicy widzą tylko własne rezerwacje
- Publiczny dostęp tylko do listy sal (GET /api/rooms)

## 📚 API Endpoints

### Autentykacja
- `POST /api/auth/callback/credentials` - Logowanie
- `GET /api/auth/session` - Pobierz sesję

### Użytkownicy
- `GET /api/users` - Lista użytkowników (ADMIN)
- `POST /api/users` - Utwórz użytkownika (ADMIN)
- `POST /api/register` - Rejestracja nowego użytkownika

### Sale
- `GET /api/rooms` - Lista sal (publiczny)
- `GET /api/rooms?building=A&floor=1&minCapacity=20` - Filtrowanie sal
- `POST /api/rooms` - Dodaj salę (ADMIN)
- `GET /api/rooms/[id]` - Szczegóły sali z rezerwacjami

### Rezerwacje
- `GET /api/reservations` - Rezerwacje użytkownika
- `GET /api/reservations?all=true` - Wszystkie rezerwacje (ADMIN)
- `POST /api/reservations` - Utwórz rezerwację
- `PATCH /api/reservations/[id]` - Zmień status rezerwacji
- `DELETE /api/reservations/[id]` - Usuń rezerwację

### Inne
- `POST /api/seed` - Zainicjalizuj bazę danych przykładowymi danymi
- `GET /api/health` - Health check

## 🧪 Testowanie

### Manualne testowanie:

#### 1. Test logowania i autoryzacji
```bash
# Sprawdź czy można się zalogować jako admin
# Przejdź do http://localhost:3000/login
# Zaloguj się: admin@wydzial.pl / admin123
```

#### 2. Test tworzenia użytkownika (jako admin)
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=YOUR_SESSION_TOKEN" \
  -d '{"email":"test@test.pl","name":"Test User","password":"test123","role":"USER"}'
```

#### 3. Test pobierania sal
```bash
curl http://localhost:3000/api/rooms
```

#### 4. Test planu pięter
```
# Przejdź do http://localhost:3000/floor-plan
# Sprawdź czy pokazuje się 4 piętra
# Kliknij na różne piętra
# Najedź na sale (powinny się podświetlać na niebiesko)
# Kliknij na salę (przekierowanie do rezerwacji)
```

### Automatyczne testy (TODO):
```bash
npm run test        # Uruchom testy jednostkowe
npm run test:e2e    # Uruchom testy end-to-end
```

## 🛠️ Przydatne komendy

```bash
# Generowanie Prisma Client
npx prisma generate

# Otworzenie Prisma Studio (GUI do bazy danych)
npx prisma studio

# Reset bazy danych (usuwa wszystkie dane!)
npx prisma migrate reset

# Sprawdzenie stanu migracji
npx prisma migrate status

# Formatowanie schema.prisma
npx prisma format
```

## 🐛 Debugging

### Problem: Błąd połączenia z bazą danych
**Rozwiązanie**:
1. Sprawdź czy PostgreSQL działa: `psql -U postgres`
2. Sprawdź czy `DATABASE_URL` w `.env` jest poprawny
3. Upewnij się, że baza danych została utworzona
4. Uruchom `npx prisma db push` ponownie

### Problem: Błąd "AUTH_SECRET is not set"
**Rozwiązanie**:
1. Wygeneruj secret: `openssl rand -base64 32`
2. Dodaj go do `.env` jako `AUTH_SECRET`
3. Zrestartuj serwer deweloperski

### Problem: Błąd autoryzacji / sesja wygasa
**Rozwiązanie**: Wyloguj się i zaloguj ponownie, usuń cookies przeglądarki

### Problem: Pokoje nie pokazują się na planie pięter
**Rozwiązanie**:
1. Sprawdź czy sale mają właściwe `floor` (1-4)
2. Sprawdź czy dane zostały zaseedowane: `npm run seed`
3. Otwórz konsolę developerską i sprawdź błędy

### Problem: Prisma Client nie generuje się
**Rozwiązanie**:
1. Usuń folder `node_modules/.prisma`
2. Uruchom `npx prisma generate`
3. Zrestartuj serwer deweloperski

## 📝 TODO / Przyszłe funkcjonalności

- [ ] Testy jednostkowe (Jest + React Testing Library)
- [ ] Testy E2E (Playwright)
- [ ] Pokazywanie zajętości sal na planie pięter
- [ ] Export rezerwacji do PDF/Excel
- [ ] Powiadomienia email o rezerwacjach
- [ ] Recurring reservations (rezerwacje cykliczne)
- [ ] Filtry w panelu admina
- [ ] Edycja użytkowników przez admina
- [ ] Statystyki wykorzystania sal
- [ ] Dark mode
- [ ] Responsive design dla mobile
- [ ] PWA support

## 🤝 Kontryb ucja

1. Fork projektu
2. Stwórz branch dla feature (`git checkout -b feature/AmazingFeature`)
3. Commit zmiany (`git commit -m 'Add some AmazingFeature'`)
4. Push do brancha (`git push origin feature/AmazingFeature`)
5. Otwórz Pull Request

## 📄 Licencja

Projekt edukacyjny - brak licencji komercyjnej.

## 👨‍💻 Autorzy

- Bartłomiej Sadza - [GitHub](https://github.com/BartlomiejSadza)

## 🙏 Podziękowania

- Next.js team za świetny framework
- Anthropic za Claude AI który pomógł w development
- Społeczność open-source

## 📞 Kontakt

W razie pytań lub problemów, otwórz issue na GitHubie:
https://github.com/BartlomiejSadza/TTSAW/issues

---

**Happy coding! 🎉**
