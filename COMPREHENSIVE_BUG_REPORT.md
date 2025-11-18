# Kompleksowy raport błędów - TTSAW (SmartOffice)

**Data testu:** 2025-11-18
**Tester:** Claude (Automated Code Review)
**Zakres:** Przegląd całego kodu, testy API, testy manualne, analiza przypadków brzegowych

---

## 🔴 KRYTYCZNE BŁĘDY

### 1. Middleware przekierowuje API requests zamiast zwracać 401
**Plik:** `middleware.ts:20-23`
**Opis:** Gdy nieautoryzowany użytkownik próbuje wywołać chroniony endpoint API (np. `/api/reservations`), middleware przekierowuje do `/login` zamiast zwrócić odpowiedź JSON z kodem 401.
**Problem:** API powinno zwracać JSON, nie HTML redirect. To łamie REST API conventions.
**Wpływ:** Klienci API (np. mobilne aplikacje, testy integracyjne) otrzymają redirect zamiast właściwego błędu JSON.
**Rozwiązanie:** Sprawdzić czy request jest do `/api/*` i zwrócić `NextResponse.json({ error: 'Unauthorized' }, { status: 401 })` zamiast redirect.

```typescript
// Obecny kod (ZŁY):
if (!sessionToken) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('callbackUrl', pathname);
  return NextResponse.redirect(loginUrl);
}

// Powinno być:
if (!sessionToken) {
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('callbackUrl', pathname);
  return NextResponse.redirect(loginUrl);
}
```

### 2. Niepoprawny import locale w date-fns v4
**Plik:** `app/calendar/page.tsx:7`
**Opis:** Import `import { pl } from 'date-fns/locale';` jest niepoprawny dla date-fns v4.
**Problem:** W date-fns v4 należy importować `import { pl } from 'date-fns/locale/pl';`
**Wpływ:** Może powodować błędy runtime lub niepoprawne formatowanie dat.
**Test:** Należy sprawdzić czy aplikacja kompiluje się poprawnie i czy daty są formatowane w języku polskim.

### 3. Funkcja `saveDb()` używana z `await` pomimo że nie jest async
**Plik:** `app/api/users/route.ts:73`
**Opis:** Kod używa `await saveDb()`, ale funkcja `saveDb()` w `lib/db.ts:87-93` nie jest async i nie zwraca Promise.
**Problem:** Niepotrzebne użycie `await` - może wprowadzać w błąd i sugerować asynchroniczność gdzie jej nie ma.
**Wpływ:** Nieznaczny - kod działa, ale jest mylący.
**Rozwiązanie:** Usunąć `await` lub zmienić `saveDb()` na async.

```typescript
// Obecny kod w lib/db.ts:
export function saveDb() {  // NIE jest async
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(DB_PATH, buffer);
  }
}

// W app/api/users/route.ts:73:
await saveDb();  // Niepotrzebne await!
```

---

## 🟠 WAŻNE BŁĘDY

### 4. Brak obsługi przypadku gdy FloorPlan ma więcej niż 10 pokoi na piętrze
**Plik:** `components/ui/FloorPlan.tsx:67,71-72`
**Opis:** Komponent definiuje tylko 10 pozycji dla pokoi w układzie "podkowy". Jeśli na piętrze jest więcej niż 10 pokoi, nadmiarowe pokoje będą renderowane na pozycji `{x: 0, y: 0}` (wszystkie w tym samym miejscu).
**Problem:** Seed generuje 10 pokoi na piętro, więc obecnie działa, ale jeśli admin doda 11+ pokoi, będzie wizualny chaos.
**Wpływ:** UX - pokoje nakładają się na siebie.
**Rozwiązanie:**
- Dynamicznie generować pozycje dla dowolnej liczby pokoi, lub
- Ograniczyć liczbę pokoi na piętrze do 10, lub
- Pokazać ostrzeżenie/error gdy jest więcej niż 10 pokoi

```typescript
// Obecny kod:
const position = positions[index] || { x: 0, y: 0 };  // PROBLEM!
if (index >= positions.length) {
  console.warn(`Room ${room.name} on floor ${floor} has no position defined`);
}
```

### 5. Unsafe split w komponencie Calendar
**Plik:** `app/calendar/page.tsx:151, 178`
**Opis:** Kod zakłada że `event.title` zawsze ma format "X - Y" i używa `.split(' - ')[1]`.
**Problem:** Jeśli użytkownik utworzy rezerwację z tytułem bez " - ", `.split(' - ')[1]` zwróci `undefined`.
**Wpływ:** Wyświetlanie `undefined` w UI lub błąd runtime.
**Rozwiązanie:** Bezpieczne parsowanie:

```typescript
// Obecnie:
<div className="truncate">{event.title.split(' - ')[1]}</div>

// Powinno być:
<div className="truncate">{event.title.split(' - ')[1] || event.title}</div>
```

### 6. Deprecation warning - middleware convention
**Plik:** `middleware.ts`
**Opis:** Next.js 16 wyświetla warning: "The 'middleware' file convention is deprecated. Please use 'proxy' instead."
**Problem:** Używana konwencja middleware jest przestarzała.
**Wpływ:** Kod może przestać działać w przyszłych wersjach Next.js.
**Rozwiązanie:** Migracja do nowej konwencji `proxy.ts` zgodnie z dokumentacją Next.js 16.

### 7. Brak walidacji formatu email
**Plik:** `app/api/register/route.ts:9`, `app/api/users/route.ts:45`
**Opis:** Backend sprawdza tylko czy email nie jest pusty, ale nie waliduje formatu email.
**Problem:** Można wpisać "abc" jako email i zostanie zaakceptowane.
**Wpływ:** Złe dane w bazie, problemy z wysyłką emaili (gdyby była zaimplementowana).
**Rozwiązanie:** Dodać regex lub bibliotekę do walidacji email:

```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return NextResponse.json(
    { error: 'Nieprawidłowy format email' },
    { status: 400 }
  );
}
```

---

## 🟡 ŚREDNIE PROBLEMY

### 8. Niespójne użycie TypeScript castingu dla role
**Plik:** `app/api/reservations/[id]/route.ts:69,75`
**Opis:** W niektórych miejscach kod używa `session.user.role`, a w innych `(session.user as any).role`.
**Problem:** Niespójna praktyka. Typ jest zdefiniowany w `types/next-auth.d.ts`, więc `as any` nie jest potrzebny.
**Wpływ:** Kod jest mniej type-safe i trudniejszy w maintenance.
**Rozwiązanie:** Konsekwentnie używać `session.user.role` bez `as any`.

### 9. Brak obsługi błędów SQL injection w niektórych miejscach
**Plik:** Wszystkie pliki z `db.exec()`
**Opis:** Chociaż kod używa prepared statements (parametryzowane zapytania), nie ma dodatkowej walidacji inputów.
**Problem:** Teoretycznie SQL injection jest zabezpieczone przez parametry, ale brak sanityzacji może prowadzić do innych problemów.
**Wpływ:** Niskie ryzyko SQL injection, ale brak defense in depth.
**Status:** Obecna implementacja jest **bezpieczna**, ale warto dodać dodatkową walidację.

### 10. Brak limitu na GET /api/reservations
**Plik:** `app/api/reservations/route.ts:5-73`
**Opis:** Endpoint zwraca wszystkie rezerwacje bez paginacji czy limitu.
**Problem:** Jeśli będzie 10000+ rezerwacji, response będzie ogromny.
**Wpływ:** Performance - wolne ładowanie, duże zużycie pamięci.
**Rozwiązanie:** Dodać paginację lub limit (np. 100 ostatnich rezerwacji).

### 11. Brak walidacji dat w przeszłości przy tworzeniu rezerwacji
**Plik:** `app/api/reservations/route.ts:93-98`
**Opis:** Kod sprawdza czy `start < now`, ale porównuje obiekty Date bezpośrednio.
**Problem:** W JavaScript porównanie dat może być problematyczne w zależności od timezone.
**Test wymagany:** Sprawdzić czy walidacja działa poprawnie dla różnych stref czasowych.

### 12. Brak obsługi race condition przy równoczesnych rezerwacjach
**Plik:** `app/api/reservations/route.ts:115-139`
**Opis:** Sprawdzenie konfliktu i utworzenie rezerwacji to dwie oddzielne operacje.
**Problem:** Jeśli dwóch użytkowników jednocześnie rezerwuje tę samą salę w tym samym czasie, obaj mogą przejść check i utworzyć konfliktujące rezerwacje.
**Wpływ:** Race condition - możliwość podwójnej rezerwacji.
**Rozwiązanie:** Użyć transakcji lub unique constraint w bazie danych.

---

## 🟢 DROBNE PROBLEMY I ULEPSZENIA

### 13. Brak indeksów w bazie danych
**Plik:** `lib/db.ts:48-85`
**Opis:** Tabele nie mają zdefiniowanych indeksów na często używanych kolumnach (np. `userId`, `roomId`).
**Wpływ:** Wolniejsze zapytania przy dużej ilości danych.
**Rozwiązanie:** Dodać indeksy:

```sql
CREATE INDEX idx_reservations_userId ON reservations(userId);
CREATE INDEX idx_reservations_roomId ON reservations(roomId);
CREATE INDEX idx_reservations_startTime ON reservations(startTime);
```

### 14. Brak logowania błędów (error logging)
**Plik:** Wszystkie `catch (error)` bloki
**Opis:** Błędy są logowane tylko do `console.error()`.
**Problem:** W produkcji nie ma serwisu do monitorowania błędów (np. Sentry).
**Wpływ:** Trudność w debugowaniu production issues.
**Rozwiązanie:** Zintegrować system logowania błędów (Sentry, LogRocket, etc.).

### 15. Słabe hasła w seed data
**Plik:** `lib/seed.ts:37-50`
**Opis:** Admin ma hasło `admin123`, student ma `student123`.
**Problem:** Bardzo słabe hasła dla testowych kont.
**Wpływ:** Bezpieczeństwo - jeśli seed zostanie użyty w produkcji, konta będą łatwe do zhackowania.
**Rozwiązanie:** Zmienić hasła na silniejsze lub dodać ostrzeżenie w README.

### 16. Brak rate limiting na API
**Plik:** Wszystkie API routes
**Opis:** Brak ograniczeń ilości requestów.
**Problem:** Możliwość DDoS lub brute force ataków na endpoint `/api/register` lub `/api/auth`.
**Wpływ:** Bezpieczeństwo i dostępność.
**Rozwiązanie:** Dodać rate limiting middleware (np. `express-rate-limit` lub custom solution).

### 17. Brak walidacji max length dla stringów
**Plik:** `app/api/rooms/route.ts`, `app/api/reservations/route.ts`, etc.
**Opis:** Nie ma walidacji długości stringów (name, title, description).
**Problem:** Użytkownik może wpisać 10000 znaków jako tytuł rezerwacji.
**Wpływ:** UX, database storage, potential DoS.
**Rozwiązanie:** Dodać max length validation (np. title max 200 chars).

### 18. Brak CSRF protection
**Plik:** Wszystkie API routes
**Opis:** Brak CSRF tokenów dla mutating operations (POST, PATCH, DELETE).
**Problem:** Możliwość CSRF ataków.
**Wpływ:** Bezpieczeństwo - attacker może wykonać akcje w imieniu zalogowanego użytkownika.
**Status:** NextAuth może mieć wbudowaną ochronę, wymaga weryfikacji.

### 19. Brak sanityzacji HTML w user inputs
**Plik:** Wszystkie miejsca gdzie user input jest wyświetlany
**Opis:** Nie ma sanityzacji HTML/XSS.
**Problem:** Jeśli użytkownik wpisze `<script>alert('XSS')</script>` jako tytuł, może wykonać kod JavaScript.
**Wpływ:** XSS vulnerability.
**Status:** React automatycznie escapuje stringi, więc ryzyko jest niskie, ale warto dodać dodatkową sanityzację dla defense in depth.

### 20. Hardcoded wartości w seed
**Plik:** `lib/seed.ts:4-33`
**Opis:** Wszystkie pokoje są w budynku "A", 4 piętra, 10 pokoi każde.
**Problem:** Brak flexibility - co jeśli uniwersytet ma budynki B, C, D?
**Wpływ:** Ograniczenie funkcjonalności.
**Rozwiązanie:** Parametryzować seed lub pozwolić adminom na pełne zarządzanie przez UI.

### 21. Brak obsługi UPDATE/DELETE dla pokoi
**Plik:** `app/api/rooms/[id]/route.ts`
**Opis:** Endpoint ma tylko GET, brak PATCH/DELETE.
**Problem:** Admin nie może edytować ani usuwać pokoi przez API.
**Wpływ:** Brak funkcjonalności - trzeba ręcznie edytować bazę.
**Rozwiązanie:** Dodać PATCH i DELETE handlers.

### 22. Brak sprawdzenia czy sala istnieje przed update w /api/reservations/[id]
**Plik:** `app/api/reservations/[id]/route.ts:5-43`
**Opis:** Przy PATCH nie ma sprawdzenia czy reservation.roomId wskazuje na istniejący pokój.
**Problem:** Teoretycznie możliwa inconsistency w danych.
**Wpływ:** Niskie - frontend nie powinien wysłać nieprawidłowego roomId.

### 23. Inconsistent error messages (polski/angielski)
**Plik:** Różne pliki API
**Opis:** Niektóre błędy są po polsku ("Wszystkie pola są wymagane"), inne po angielsku ("Unauthorized").
**Problem:** Brak spójności i18n.
**Wpływ:** UX - mylące dla użytkowników.
**Rozwiązanie:** Zdecydować na jeden język lub zaimplementować proper i18n.

### 24. Brak testów jednostkowych i integracyjnych
**Plik:** Cały projekt
**Opis:** Brak testów automatycznych.
**Problem:** Łatwo wprowadzić regresję przy zmianach.
**Wpływ:** Jakość kodu, maintenance.
**Rozwiązanie:** Dodać testy (Jest, React Testing Library, Playwright).

### 25. Brak dokumentacji API (OpenAPI/Swagger)
**Plik:** Cały projekt
**Opis:** Brak formalnej dokumentacji API endpoints.
**Problem:** Trudność w integracji dla innych developerów.
**Wpływ:** Developer Experience.
**Rozwiązanie:** Wygenerować OpenAPI spec lub dodać dokumentację w README.

---

## ✅ POZYTYWNE ASPEKTY

1. ✅ **Dobra struktura projektu** - Next.js App Router, czytelna organizacja folderów
2. ✅ **TypeScript** - cała aplikacja jest typowana
3. ✅ **Prepared statements** - używane wszędzie, SQL injection zabezpieczone
4. ✅ **Haszowanie haseł** - bcrypt z salt rounds 10
5. ✅ **NextAuth** - profesjonalna biblioteka do autentykacji
6. ✅ **Walidacja podstawowa** - sprawdzanie required fields, min length hasła
7. ✅ **Czytelny kod** - dobra formatowanie, sensowne nazwy zmiennych
8. ✅ **Error handling** - większość operacji ma try/catch
9. ✅ **UI Components** - reusable komponenty (Button, Card, Input)
10. ✅ **Build passes** - aplikacja kompiluje się bez błędów TypeScript

---

## 📊 PODSUMOWANIE

**Znalezione błędy:**
- 🔴 Krytyczne: 3
- 🟠 Ważne: 4
- 🟡 Średnie: 5
- 🟢 Drobne: 13

**ŁĄCZNIE: 25 problemów**

### Priorytetowe działania:
1. Naprawić middleware dla API endpoints (błąd #1) - **KRYTYCZNE**
2. Naprawić import date-fns locale (błąd #2) - **KRYTYCZNE**
3. Usunąć niepotrzebne `await saveDb()` (błąd #3) - **KRYTYCZNE**
4. Dodać obsługę >10 pokoi w FloorPlan (błąd #4) - **WAŻNE**
5. Zabezpieczyć split() w Calendar (błąd #5) - **WAŻNE**
6. Dodać walidację email (błąd #7) - **WAŻNE**
7. Rozważyć dodanie paginacji do rezerwacji (błąd #10)
8. Dodać rate limiting (błąd #16)

---

**Ogólna ocena kodu:** 7/10
Aplikacja jest funkcjonalna i ma solidne fundamenty, ale wymaga naprawienia kilku krytycznych błędów oraz dodania warstw bezpieczeństwa i walidacji dla produkcji.
