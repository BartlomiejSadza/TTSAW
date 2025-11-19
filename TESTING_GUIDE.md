# Przewodnik testowania - TTSAW (SmartOffice)

## 🧪 Testy manualne API

### 1. Test Rate Limiting

```bash
# Test: 5 prób rejestracji w 15 minut (limit)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test$i@test.pl\",\"name\":\"Test$i\",\"password\":\"test123\"}" \
    -w "\n%{http_code}\n\n"
  sleep 1
done

# Oczekiwany rezultat:
# - Pierwsze 5 requestów: 201 Created lub 400 (jeśli email istnieje)
# - 6-ty request: 429 Too Many Requests
```

### 2. Test Race Conditions

```bash
# Test: Równoczesne rezerwacje tej samej sali
# Terminal 1 i 2 - uruchom jednocześnie:

SESSION_TOKEN="<your-auth-token>"
ROOM_ID="<existing-room-id>"

curl -X POST http://localhost:3000/api/reservations \
  -H "Cookie: authjs.session-token=$SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "'$ROOM_ID'",
    "title": "Test Meeting",
    "startTime": "2025-12-01T10:00:00Z",
    "endTime": "2025-12-01T11:00:00Z"
  }'

# Oczekiwany rezultat:
# - Jeden request: 201 Created
# - Drugi request: 409 Conflict (konflikt wykryty)
```

### 3. Test CSRF Protection

```bash
# Test: Request z innego originu
curl -X POST http://localhost:3000/api/reservations \
  -H "Origin: http://malicious-site.com" \
  -H "Cookie: authjs.session-token=$SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "'$ROOM_ID'",
    "title": "CSRF Test",
    "startTime": "2025-12-01T14:00:00Z",
    "endTime": "2025-12-01T15:00:00Z"
  }'

# Oczekiwany rezultat:
# - 403 Forbidden (CSRF validation failed)
```

### 4. Test Walidacji Email

```bash
# Test: Nieprawidłowy format email
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"notanemail","name":"Test","password":"test123"}'

# Oczekiwany rezultat:
# - 400 Bad Request: "Nieprawidłowy format email"

# Test: Prawidłowy email
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"valid@email.com","name":"Test","password":"test123"}'

# Oczekiwany rezultat:
# - 201 Created lub 400 (jeśli email już istnieje)
```

### 5. Test Max Length Validation

```bash
# Test: Za długi tytuł (>200 znaków)
LONG_TITLE=$(python3 -c "print('A' * 201)")

curl -X POST http://localhost:3000/api/reservations \
  -H "Cookie: authjs.session-token=$SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "'$ROOM_ID'",
    "title": "'$LONG_TITLE'",
    "startTime": "2025-12-01T16:00:00Z",
    "endTime": "2025-12-01T17:00:00Z"
  }'

# Oczekiwany rezultat:
# - 400 Bad Request: "Tytuł nie może przekraczać 200 znaków"
```

### 6. Test Paginacji

```bash
# Test: Pobranie pierwszych 10 rezerwacji
curl "http://localhost:3000/api/reservations?limit=10&offset=0" \
  -H "Cookie: authjs.session-token=$SESSION_TOKEN"

# Test: Pobranie kolejnych 10 rezerwacji
curl "http://localhost:3000/api/reservations?limit=10&offset=10" \
  -H "Cookie: authjs.session-token=$SESSION_TOKEN"

# Oczekiwany rezultat:
# - Pierwsze 10 rezerwacji w pierwszym requeście
# - Kolejne 10 w drugim requeście
```

### 7. Test API Middleware (JSON response)

```bash
# Test: Nieautoryzowany dostęp do API
curl -v http://localhost:3000/api/reservations

# Oczekiwany rezultat:
# - 401 Unauthorized (JSON, nie redirect!)
# - Content-Type: application/json
# - Body: {"error":"Unauthorized"}
```

### 8. Test PATCH/DELETE dla pokoi

```bash
# Test: Update pokoju (jako admin)
curl -X PATCH "http://localhost:3000/api/rooms/$ROOM_ID" \
  -H "Cookie: authjs.session-token=$ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "capacity": 30,
    "description": "Updated description"
  }'

# Oczekiwany rezultat:
# - 200 OK: "Room updated successfully"

# Test: Delete pokoju bez aktywnych rezerwacji
curl -X DELETE "http://localhost:3000/api/rooms/$ROOM_ID" \
  -H "Cookie: authjs.session-token=$ADMIN_TOKEN"

# Oczekiwany rezultat:
# - 200 OK: "Room deleted successfully"
# LUB
# - 400 Bad Request: "Cannot delete room with active reservations"
```

## 📝 Checklist testów manualnych

### Bezpieczeństwo
- [ ] Rate limiting działa dla register endpoint
- [ ] Rate limiting działa dla reservations endpoint
- [ ] CSRF protection blokuje requesty z innego originu
- [ ] Walidacja email działa poprawnie
- [ ] Max length validation działa dla wszystkich pól
- [ ] SQL injection nie działa (prepared statements)
- [ ] Middleware zwraca JSON dla API routes

### Funkcjonalność
- [ ] Paginacja działa poprawnie
- [ ] FloorPlan renderuje >10 pokoi
- [ ] Calendar bezpiecznie obsługuje split()
- [ ] Race conditions są wykrywane
- [ ] PATCH/DELETE dla pokoi działa
- [ ] Room existence check działa przed update rezerwacji

### Performance
- [ ] Indeksy DB są utworzone
- [ ] Zapytania są szybkie (sprawdź logi)
- [ ] Rate limiting nie blokuje legalnych użytkowników

## 🔍 Automatyczne testy (do zaimplementowania)

### Przykład testu jednostkowego (Jest/Vitest)

```typescript
// __tests__/api/register.test.ts
describe('POST /api/register', () => {
  it('should reject invalid email format', async () => {
    const res = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'notanemail',
        name: 'Test',
        password: 'test123'
      })
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('email');
  });

  it('should enforce rate limiting', async () => {
    // Make 6 requests in quick succession
    const requests = Array(6).fill(null).map((_, i) =>
      fetch('/api/register', {
        method: 'POST',
        body: JSON.stringify({
          email: `test${i}@test.pl`,
          name: 'Test',
          password: 'test123'
        })
      })
    );

    const responses = await Promise.all(requests);
    const last = responses[responses.length - 1];

    expect(last.status).toBe(429);
  });
});
```

## 🚀 Uruchomienie testów produkcyjnych

Przed deploymentem na produkcję, wykonaj wszystkie testy manualne i sprawdź:

1. **Bezpieczeństwo**
   - Rate limiting
   - CSRF protection
   - Email validation
   - Max length validation

2. **Performance**
   - Indeksy DB działają
   - Paginacja działa
   - Brak memory leaks

3. **Funkcjonalność**
   - Wszystkie API endpoints działają
   - Frontend renderuje się poprawnie
   - Rezerwacje można tworzyć i anulować

## 📊 Status pokrycia testami

| Feature | Manual Tests | Unit Tests | Integration Tests |
|---------|--------------|------------|-------------------|
| Rate Limiting | ✅ | ⚠️ | ❌ |
| CSRF Protection | ✅ | ⚠️ | ❌ |
| Email Validation | ✅ | ⚠️ | ❌ |
| Max Length | ✅ | ⚠️ | ❌ |
| Race Conditions | ✅ | ❌ | ❌ |
| Paginacja | ✅ | ⚠️ | ❌ |
| PATCH/DELETE Rooms | ✅ | ❌ | ❌ |

Legend:
- ✅ Implemented
- ⚠️ Partial
- ❌ Not implemented

## 🔧 Setup testów automatycznych (TODO)

```bash
# Install test dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Add test script to package.json
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage"

# Run tests
npm test
```
