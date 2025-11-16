# SmartOffice - Prompt do Automatycznego Testowania

Skopiuj poniższy prompt i uruchom go po zakończeniu implementacji:

---

## PROMPT DO TESTOWANIA (skopiuj całość):

```
Jesteś testerem QA aplikacji SmartOffice. Twoim zadaniem jest DOKŁADNE przetestowanie KAŻDEJ funkcjonalności systemu rezerwacji sal. Musisz samodzielnie uruchomić aplikację, wykonać wszystkie testy i naprawić błędy które znajdziesz.

## KROK 0: Przygotowanie środowiska

1. Sprawdź czy wszystkie zależności są zainstalowane:
   ```bash
   cd frontend && pnpm install
   ```

2. Sprawdź czy baza danych jest zainicjalizowana:
   ```bash
   npx prisma migrate status
   npx prisma db seed
   ```

3. Uruchom serwer deweloperski w tle:
   ```bash
   pnpm dev
   ```
   Poczekaj aż zobaczysz "Ready" lub "compiled successfully"

4. Sprawdź czy serwer odpowiada:
   ```bash
   curl -s http://localhost:3000 | head -20
   ```

## KROK 1: Testy API (curl)

Przetestuj KAŻDY endpoint API:

### 1.1 Health check
```bash
curl -s http://localhost:3000/api/health
```
Oczekiwany wynik: JSON z status "ok"

### 1.2 GET /api/rooms - Lista sal
```bash
curl -s http://localhost:3000/api/rooms | jq .
```
Oczekiwany wynik: JSON array z 5 salami (A101, A102, B201, B202, C301)
- Sprawdź czy każda sala ma: id, name, building, floor, capacity, equipment
- Sprawdź czy equipment to array stringów

### 1.3 GET /api/rooms/[id] - Szczegóły sali
```bash
# Pobierz ID pierwszej sali
ROOM_ID=$(curl -s http://localhost:3000/api/rooms | jq -r '.[0].id')
curl -s "http://localhost:3000/api/rooms/$ROOM_ID" | jq .
```
Oczekiwany wynik: Pełne dane jednej sali

### 1.4 POST /api/auth/register - Rejestracja (bez autentykacji)
```bash
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.pl","name":"Test User","password":"test123"}' | jq .
```
Oczekiwany wynik: Sukces lub info że user istnieje

### 1.5 POST /api/auth/signin - Logowanie
```bash
curl -s -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email":"student@wydzial.pl","password":"student123"}' -c cookies.txt | head -20
```
Sprawdź czy dostałeś cookie sesji

### 1.6 GET /api/reservations - Lista rezerwacji (wymaga auth)
```bash
curl -s http://localhost:3000/api/reservations -b cookies.txt | jq .
```
Oczekiwany wynik: Array rezerwacji (może być pusty)

### 1.7 POST /api/reservations - Tworzenie rezerwacji
```bash
ROOM_ID=$(curl -s http://localhost:3000/api/rooms | jq -r '.[0].id')
curl -s -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{
    \"roomId\": \"$ROOM_ID\",
    \"title\": \"Test Meeting\",
    \"startTime\": \"$(date -u -v+1d +%Y-%m-%dT10:00:00Z)\",
    \"endTime\": \"$(date -u -v+1d +%Y-%m-%dT11:00:00Z)\"
  }" | jq .
```
Oczekiwany wynik: Utworzona rezerwacja z ID

### 1.8 DELETE /api/reservations/[id] - Anulowanie
```bash
RES_ID=$(curl -s http://localhost:3000/api/reservations -b cookies.txt | jq -r '.[0].id')
curl -s -X DELETE "http://localhost:3000/api/reservations/$RES_ID" -b cookies.txt | jq .
```

## KROK 2: Testy Stron (sprawdź rendering)

### 2.1 Strona główna
```bash
curl -s http://localhost:3000/ | grep -E "<title>|SmartOffice|dashboard"
```
Sprawdź czy renderuje się HTML z tytułem

### 2.2 Strona logowania
```bash
curl -s http://localhost:3000/login | grep -E "form|email|password|submit"
```
Sprawdź czy jest formularz logowania

### 2.3 Strona rejestracji
```bash
curl -s http://localhost:3000/register | grep -E "form|email|name|password"
```

### 2.4 Lista sal
```bash
curl -s http://localhost:3000/rooms | grep -E "A101|B201|sala|room"
```
Sprawdź czy renderują się nazwy sal

### 2.5 Dashboard (po zalogowaniu)
```bash
curl -s http://localhost:3000/dashboard -b cookies.txt | grep -E "dashboard|rezerwacj|welcome"
```

### 2.6 Moje rezerwacje
```bash
curl -s http://localhost:3000/reservations -b cookies.txt | grep -E "rezerwacj|reservation"
```

### 2.7 Panel admina (tylko dla admina)
```bash
# Zaloguj się jako admin
curl -s -X POST http://localhost:3000/api/auth/callback/credentials \
  -d '{"email":"admin@wydzial.pl","password":"admin123"}' -c admin_cookies.txt
curl -s http://localhost:3000/admin -b admin_cookies.txt | grep -E "admin|zarządzanie|management"
```

## KROK 3: Testy Walidacji i Edge Cases

### 3.1 Próba rezerwacji w przeszłości
```bash
curl -s -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{
    \"roomId\": \"$ROOM_ID\",
    \"title\": \"Past Meeting\",
    \"startTime\": \"2020-01-01T10:00:00Z\",
    \"endTime\": \"2020-01-01T11:00:00Z\"
  }" | jq .
```
Oczekiwany wynik: Błąd walidacji (400 Bad Request)

### 3.2 Próba rezerwacji zajętego terminu
Stwórz dwie rezerwacje na ten sam czas - druga powinna się nie udać.

### 3.3 Próba rezerwacji bez autoryzacji
```bash
curl -s -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"roomId":"x","title":"y","startTime":"z","endTime":"w"}' | jq .
```
Oczekiwany wynik: 401 Unauthorized

### 3.4 Nieprawidłowy JSON
```bash
curl -s -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d 'invalid json' | jq .
```
Oczekiwany wynik: 400 Bad Request

### 3.5 Brakujące pola
```bash
curl -s -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"roomId":"x"}' | jq .
```
Oczekiwany wynik: Błąd walidacji

## KROK 4: Testy TypeScript i Linting

```bash
cd frontend

# Sprawdź kompilację TypeScript
npx tsc --noEmit
echo "TypeScript check: $?"

# Sprawdź linting
pnpm lint
echo "Lint check: $?"

# Sprawdź czy build przechodzi
pnpm build
echo "Build check: $?"
```

Wszystkie powinny zwrócić exit code 0.

## KROK 5: Testy Bazy Danych

```bash
# Sprawdź strukturę
npx prisma db pull --print

# Sprawdź czy dane seedowe istnieją
npx prisma studio
# Lub przez API:
curl -s http://localhost:3000/api/rooms | jq 'length'
# Powinno być 5
```

## KROK 6: Scenariusze E2E (pełne flow)

### Scenariusz 1: Nowy użytkownik rezerwuje salę
1. Zarejestruj nowego użytkownika
2. Zaloguj się
3. Pobierz listę sal
4. Wybierz salę
5. Stwórz rezerwację
6. Sprawdź czy rezerwacja jest w "Moje rezerwacje"
7. Anuluj rezerwację
8. Sprawdź czy status zmienił się na CANCELLED

### Scenariusz 2: Admin zarządza systemem
1. Zaloguj jako admin
2. Sprawdź panel admina
3. Dodaj nową salę (jeśli zaimplementowane)
4. Zobacz wszystkie rezerwacje
5. Zmień status rezerwacji na CONFIRMED

### Scenariusz 3: Konflikt rezerwacji
1. User A rezerwuje salę A101 na 10:00-11:00
2. User B próbuje zarezerwować A101 na 10:30-11:30
3. Oczekiwany wynik: Błąd - sala zajęta

## KROK 7: Raport z testów

Po wykonaniu wszystkich testów, stwórz raport w formacie:

```markdown
# Raport z testów SmartOffice

## Podsumowanie
- Testy API: X/Y passed
- Testy stron: X/Y passed
- Testy walidacji: X/Y passed
- TypeScript/Lint: PASS/FAIL
- Build: PASS/FAIL

## Znalezione błędy
1. [CRITICAL] Opis błędu - lokalizacja w kodzie
2. [MAJOR] Opis błędu - lokalizacja w kodzie
3. [MINOR] Opis błędu - lokalizacja w kodzie

## Brakujące funkcjonalności
- [ ] Feature X nie jest zaimplementowane
- [ ] Feature Y działa częściowo

## Rekomendacje
1. Naprawić błąd X bo...
2. Dodać walidację Y bo...
```

## TWOJE ZADANIE:

1. Wykonaj WSZYSTKIE powyższe testy w kolejności
2. Dokumentuj KAŻDY wynik (sukces/porażka)
3. Jeśli znajdziesz błąd - NAPRAW GO natychmiast
4. Po naprawieniu - uruchom test ponownie aby potwierdzić fix
5. Na końcu stwórz kompletny raport
6. Nie zatrzymuj się dopóki WSZYSTKIE testy nie przejdą pomyślnie

WAŻNE:
- Nie zgaduj wyników - faktycznie uruchom komendy
- Jeśli curl nie działa, użyj alternatywnych metod (fetch w Node, etc.)
- Jeśli serwer nie startuje - napraw to najpierw
- Każdy błąd TypeScript lub lint error musi być naprawiony
- Aplikacja musi buildować się bez błędów

START: Zacznij od KROK 0 - uruchom serwer i potwierdź że działa.
```

---

## Jak użyć:

```bash
claude "$(cat TESTING_PROMPT.md | tail -n +11 | head -n -3)"
```

Lub po prostu skopiuj sekcję "PROMPT DO TESTOWANIA" i wklej do Claude Code.
