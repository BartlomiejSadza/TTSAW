# Scenariusze testowe i kroki reprodukcji błędów

## 🧪 SCENARIUSZE TESTOWE

### Scenariusz 1: Test middleware dla API bez autoryzacji

**Oczekiwane zachowanie:** API powinno zwrócić JSON z błędem 401
**Rzeczywiste zachowanie:** API zwraca redirect 307 do /login

**Kroki reprodukcji:**
```bash
curl -v http://localhost:3000/api/reservations
```

**Wynik:**
```
< HTTP/1.1 307 Temporary Redirect
< Location: /login?callbackUrl=%2Fapi%2Freservations
/login?callbackUrl=%2Fapi%2Freservations
```

**Oczekiwany wynik:**
```json
{
  "error": "Unauthorized",
  "status": 401
}
```

---

### Scenariusz 2: Test walidacji email

**Kroki reprodukcji:**
```bash
# Test 1: Brak @ w emailu
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"notanemail","name":"Test","password":"test123"}'

# Test 2: Email bez domeny
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@","name":"Test","password":"test123"}'

# Test 3: Losowy string jako email
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"abc123","name":"Test","password":"test123"}'
```

**Rzeczywisty wynik:** Wszystkie te requesty są **akceptowane** ✅ (to jest BUG!)

**Oczekiwany wynik:** Powinien zwrócić błąd:
```json
{
  "error": "Nieprawidłowy format email"
}
```

---

### Scenariusz 3: Test race condition przy rezerwacjach

**Cel:** Sprawdzić czy dwa równoczesne requesty mogą stworzyć konfliktujące rezerwacje

**Setup:**
1. Zaloguj się jako user1
2. Pobierz ID pierwszego pokoju
3. Uruchom dwa równoczesne requesty rezerwujące ten sam pokój w tym samym czasie

**Kroki (wymaga scripta):**
```bash
# Terminal 1
curl -X POST http://localhost:3000/api/reservations \
  -H "Cookie: authjs.session-token=TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "ROOM_ID",
    "title": "Meeting A",
    "startTime": "2025-11-20T10:00:00Z",
    "endTime": "2025-11-20T11:00:00Z"
  }' &

# Terminal 2 (równocześnie)
curl -X POST http://localhost:3000/api/reservations \
  -H "Cookie: authjs.session-token=TOKEN2" \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "ROOM_ID",
    "title": "Meeting B",
    "startTime": "2025-11-20T10:00:00Z",
    "endTime": "2025-11-20T11:00:00Z"
  }' &
```

**Potencjalny problem:** Oba requesty mogą przejść sprawdzenie konfliktu i utworzyć dwie rezerwacje w tym samym czasie.

---

### Scenariusz 4: Test długich stringów (DoS potential)

**Kroki:**
```bash
# Bardzo długi tytuł (10000 znaków)
LONG_STRING=$(python3 -c "print('A' * 10000)")

curl -X POST http://localhost:3000/api/reservations \
  -H "Cookie: authjs.session-token=VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"roomId\": \"ROOM_ID\",
    \"title\": \"$LONG_STRING\",
    \"startTime\": \"2025-11-20T10:00:00Z\",
    \"endTime\": \"2025-11-20T11:00:00Z\"
  }"
```

**Rzeczywisty wynik:** Request zostaje **zaakceptowany** (potencjalny DoS!)

**Oczekiwany wynik:** Odrzucenie z błędem walidacji:
```json
{
  "error": "Tytuł nie może przekraczać 200 znaków"
}
```

---

### Scenariusz 5: Test >10 pokoi na piętrze w FloorPlan

**Setup:**
1. Zaloguj się jako admin
2. Dodaj 15 pokoi na piętrze 1

**Kroki:**
```bash
# Dodaj 11-ty pokój na piętrze 1
for i in {11..15}; do
  curl -X POST http://localhost:3000/api/rooms \
    -H "Cookie: authjs.session-token=ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"1$(printf %02d $i)\",
      \"building\": \"A\",
      \"floor\": 1,
      \"capacity\": 20,
      \"equipment\": [\"projektor\"]
    }"
done
```

**Następnie:**
1. Otwórz `/floor-plan` w przeglądarce
2. Wybierz piętro 1
3. **Obserwuj:** Pokoje 11-15 będą renderowane wszystkie w pozycji (0,0) - nałożone na siebie

---

### Scenariusz 6: Test Calendar split() bug

**Setup:**
1. Utwórz rezerwację z tytułem BEZ " - " (np. "Spotkanie")
2. Otwórz `/calendar`

**Oczekiwane:** Wyświetlenie tytułu "Spotkanie"
**Rzeczywiste:** Wyświetlenie `undefined` (ponieważ `"Spotkanie".split(' - ')[1]` = undefined)

**Reprodukcja:**
```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Cookie: authjs.session-token=VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "ROOM_ID",
    "title": "ProstaRezerwacja",
    "startTime": "2025-11-20T10:00:00Z",
    "endTime": "2025-11-20T11:00:00Z"
  }'
```

Następnie otwórz `/calendar` i kliknij na wydarzenie.

---

### Scenariusz 7: Test SQL Injection (security test)

**Cel:** Upewnić się że parametryzowane zapytania działają poprawnie

**Próba ataku:**
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.pl'\'' OR '\''1'\''='\''1",
    "name": "Test",
    "password": "test123"
  }'
```

**Oczekiwany wynik:** Email zostanie zapisany jako string (bezpieczne)
**Test:** Sprawdzić bazę danych czy nie nastąpił SQL injection

**STATUS:** ✅ Aplikacja jest zabezpieczona dzięki prepared statements

---

### Scenariusz 8: Test duplikacji użytkowników

**Kroki:**
```bash
# Request 1
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"duplicate@test.pl","name":"User1","password":"test123"}'

# Request 2 (ten sam email)
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"duplicate@test.pl","name":"User2","password":"test456"}'
```

**Wynik:** ✅ Drugi request zwraca błąd "Użytkownik z tym emailem już istnieje"
**STATUS:** Działa poprawnie!

---

### Scenariusz 9: Test walidacji hasła

**Kroki:**
```bash
# Hasło < 6 znaków
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"short@test.pl","name":"Test","password":"12345"}'
```

**Wynik:** ✅ Zwraca błąd "Hasło musi mieć co najmniej 6 znaków"
**STATUS:** Działa poprawnie!

---

### Scenariusz 10: Test bez autentykacji - próba dodania pokoju

**Kroki:**
```bash
curl -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hack Room",
    "building": "Z",
    "floor": 99,
    "capacity": 1
  }'
```

**Wynik:** ✅ Zwraca "Unauthorized" (chociaż jako redirect, nie JSON - patrz Scenariusz 1)

---

## 📋 CHECKLIST TESTÓW MANUALNYCH

### Frontend Tests

- [ ] **Rejestracja**
  - [ ] Poprawna rejestracja z valid danymi
  - [ ] Błąd przy pustych polach
  - [ ] Błąd przy niezgodnych hasłach (confirm password)
  - [ ] Błąd przy za krótkim haśle
  - [ ] Błąd przy duplikacie emaila
  - [ ] Redirect do /login po sukcesie

- [ ] **Logowanie**
  - [ ] Poprawne logowanie z valid credentials
  - [ ] Błąd przy niepoprawnym haśle
  - [ ] Błąd przy nieistniejącym emailu
  - [ ] Redirect do /dashboard po sukcesie

- [ ] **Dashboard**
  - [ ] Wyświetlanie powitania z imieniem użytkownika
  - [ ] Wyświetlanie statystyk (nadchodzące rezerwacje, liczba sal, etc.)
  - [ ] Wyświetlanie nadchodzących rezerwacji
  - [ ] Wyświetlanie popularnych sal

- [ ] **Przeglądanie sal (/rooms)**
  - [ ] Lista sal wyświetla się poprawnie
  - [ ] Filtrowanie po nazwie działa
  - [ ] Filtrowanie po budynku działa
  - [ ] Filtrowanie po min. pojemności działa
  - [ ] Kliknięcie na salę przekierowuje do szczegółów

- [ ] **Szczegóły sali (/rooms/[id])**
  - [ ] Wyświetlanie informacji o sali
  - [ ] Wyświetlanie nadchodzących rezerwacji
  - [ ] Formularz rezerwacji otwiera się poprawnie
  - [ ] Rezerwacja z valid danymi działa
  - [ ] Błąd przy rezerwacji w przeszłości
  - [ ] Błąd przy konflikcie rezerwacji
  - [ ] Błąd gdy endTime <= startTime

- [ ] **Moje rezerwacje (/reservations)**
  - [ ] Lista rezerwacji wyświetla się
  - [ ] Filtr "Nadchodzące" działa
  - [ ] Filtr "Przeszłe" działa
  - [ ] Filtr "Wszystkie" działa
  - [ ] Przycisk "Anuluj" działa
  - [ ] Status rezerwacji wyświetla się poprawnie (badges)

- [ ] **Kalendarz (/calendar)**
  - [ ] Widok tygodnia wyświetla się
  - [ ] Nawigacja "Poprzedni/Następny" działa
  - [ ] Przycisk "Dziś" działa
  - [ ] Wydarzenia wyświetlają się w odpowiednich slotach
  - [ ] Kliknięcie na wydarzenie otwiera modal ze szczegółami
  - [ ] Modal zamyka się po kliknięciu "Zamknij" lub X

- [ ] **Floor Plan (/floor-plan)**
  - [ ] Wybór piętra działa (przyciski 1-4)
  - [ ] Sale wyświetlają się w układzie podkowy
  - [ ] Hover na sali pokazuje highlight
  - [ ] Kliknięcie na salę pokazuje szczegóły
  - [ ] Przycisk "Rezerwuj salę" przekierowuje do /rooms/[id]
  - [ ] Legenda wyświetla się poprawnie

- [ ] **Panel Admin (/admin)**
  - [ ] Dostęp tylko dla ADMIN role
  - [ ] Regular user widzi "Brak uprawnień"
  - [ ] Zakładka "Sale" wyświetla listę sal
  - [ ] Zakładka "Rezerwacje" wyświetla wszystkie rezerwacje
  - [ ] Zakładka "Użytkownicy" wyświetla listę użytkowników
  - [ ] Formularz dodawania sali działa
  - [ ] Formularz dodawania użytkownika działa
  - [ ] Buttons "Potwierdź/Odrzuć" dla rezerwacji działają

### Backend/API Tests

- [ ] **GET /api/rooms**
  - [ ] Zwraca listę sal (40 po seed)
  - [ ] Filtrowanie po building działa
  - [ ] Filtrowanie po floor działa
  - [ ] Filtrowanie po minCapacity działa

- [ ] **POST /api/rooms**
  - [ ] Wymaga autoryzacji ADMIN
  - [ ] Tworzy salę z valid danymi
  - [ ] Błąd przy brakujących polach
  - [ ] Equipment jest parsowane jako array

- [ ] **GET /api/rooms/[id]**
  - [ ] Zwraca szczegóły sali
  - [ ] Zwraca nadchodzące rezerwacje dla sali
  - [ ] 404 dla nieistniejącej sali

- [ ] **GET /api/reservations**
  - [ ] Wymaga autoryzacji
  - [ ] Zwraca rezerwacje użytkownika
  - [ ] Zwraca wszystkie rezerwacje dla ADMIN (query param all=true)
  - [ ] Zawiera informacje o sali i użytkowniku (JOIN)

- [ ] **POST /api/reservations**
  - [ ] Wymaga autoryzacji
  - [ ] Tworzy rezerwację z valid danymi
  - [ ] Błąd przy pustych polach
  - [ ] Błąd przy rezerwacji w przeszłości
  - [ ] Błąd gdy endTime <= startTime
  - [ ] Błąd gdy sala nie istnieje
  - [ ] Błąd przy konflikcie z inną rezerwacją

- [ ] **PATCH /api/reservations/[id]**
  - [ ] Wymaga autoryzacji
  - [ ] Właściciel może zmienić status
  - [ ] Admin może zmienić status dowolnej rezerwacji
  - [ ] 403 gdy user próbuje zmienić cudzą rezerwację
  - [ ] 404 dla nieistniejącej rezerwacji

- [ ] **DELETE /api/reservations/[id]**
  - [ ] Wymaga autoryzacji
  - [ ] Regular user może anulować (status=CANCELLED) swoją rezerwację
  - [ ] Admin może usunąć (DELETE) dowolną rezerwację
  - [ ] 403 gdy user próbuje usunąć cudzą rezerwację

- [ ] **POST /api/register**
  - [ ] Tworzy użytkownika z valid danymi
  - [ ] Hashuje hasło (bcrypt)
  - [ ] Błąd przy duplikacie emaila
  - [ ] Błąd przy za krótkim haśle
  - [ ] Błąd przy pustych polach

- [ ] **GET /api/users**
  - [ ] Wymaga ADMIN role
  - [ ] Zwraca listę użytkowników
  - [ ] NIE zwraca haseł (SELECT bez password column)
  - [ ] 401 dla non-admin

- [ ] **POST /api/users**
  - [ ] Wymaga ADMIN role
  - [ ] Tworzy użytkownika
  - [ ] Pozwala ustawić role (USER/ADMIN)
  - [ ] Walidacja jak w /api/register

- [ ] **GET /api/calendar**
  - [ ] Wymaga autoryzacji
  - [ ] Zwraca wydarzenia w formacie calendar
  - [ ] Filtrowanie po start/end date działa
  - [ ] Wyklucza CANCELLED rezerwacje

- [ ] **GET /api/stats**
  - [ ] Wymaga autoryzacji
  - [ ] Zwraca upcomingCount
  - [ ] Zwraca roomsCount
  - [ ] Zwraca totalCount
  - [ ] Zwraca popularRooms (top 3)
  - [ ] Zwraca recentReservations (limit 5)

- [ ] **POST /api/seed**
  - [ ] Tworzy 40 sal (4 piętra × 10 sal)
  - [ ] Tworzy 2 użytkowników (admin, student)
  - [ ] Czyści istniejące dane przed seed

- [ ] **GET /api/health**
  - [ ] Zwraca status OK
  - [ ] Zwraca timestamp
  - [ ] Sprawdza połączenie z bazą

---

## 🐛 PRIORITY BUG FIX LIST

**Do natychmiastowej naprawy (przed deploymentem):**

1. ✅ Middleware API JSON response (Scenariusz 1)
2. ✅ Email validation (Scenariusz 2)
3. ✅ FloorPlan >10 rooms handling (Scenariusz 5)
4. ✅ Calendar split() bug (Scenariusz 6)
5. ✅ Max length validation (Scenariusz 4)
6. ✅ Remove await from saveDb() calls

**Do naprawy przed produkcją:**

7. Rate limiting
8. CSRF protection verification
9. Add database indexes
10. Transaction/locking for reservation conflicts
11. Migrate middleware to proxy.ts (Next.js 16)

**Nice to have:**

12. API documentation (OpenAPI)
13. Unit tests
14. Integration tests
15. Error monitoring (Sentry)
16. i18n consistency

---

**Data wykonania testów:** 2025-11-18
**Środowisko:** Development (localhost:3000)
**Baza danych:** SQLite (dev.db)
**Build status:** ✅ Successful (TypeScript compilation passed)
