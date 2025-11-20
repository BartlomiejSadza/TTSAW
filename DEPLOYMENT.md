# Deployment Guide - SmartOffice

## Deployment na Vercel

### Krok 1: Przygotuj bazę danych PostgreSQL

Załóż darmowe konto na **Neon** (https://neon.tech):
1. Utwórz nowy projekt
2. Skopiuj connection string (zaczyna się od `postgresql://`)

### Krok 2: Deploy na Vercel

1. **Zaloguj się na Vercel** (https://vercel.com)
2. **Kliknij "Add New Project"**
3. **Import z GitHub:**
   - Połącz konto GitHub
   - Wybierz repozytorium TTSAW
4. **Ustaw zmienne środowiskowe:**
   ```
   DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
   NEXTAUTH_SECRET=<wygeneruj-losowy-string-32-znaki>
   NEXTAUTH_URL=https://twoja-domena.vercel.app
   ```

   Generowanie `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

5. **Deploy!** - Kliknij "Deploy"

### Krok 3: Seedowanie bazy danych

Po successful deployment:

1. **Wywołaj endpoint seedowania:**
   ```bash
   curl -X POST https://twoja-domena.vercel.app/api/seed
   ```

   Lub odwiedź w przeglądarce (POST request):
   ```
   https://twoja-domena.vercel.app/api/seed
   ```

2. **Dane testowe:**
   ```
   Admin:
   Email: admin@wydzial.pl
   Hasło: Admin2024!SecurePassword

   Student:
   Email: student@wydzial.pl
   Hasło: Student2024!Test
   ```

### Krok 4: Zabezpieczenie (OPCJONALNE, ale zalecane)

Po seedowaniu możesz:
- Usunąć endpoint `/app/api/seed/route.ts`
- Lub dodać zabezpieczenie hasłem/tokenem

### Troubleshooting

**Problem: Prisma migration failed**
- Upewnij się, że `DATABASE_URL` zawiera `?sslmode=require`
- Sprawdź czy baza PostgreSQL jest dostępna

**Problem: Build failed**
- Sprawdź czy wszystkie zmienne środowiskowe są ustawione
- Sprawdź logi buildu na Vercel

**Problem: Runtime errors**
- Sprawdź Function Logs na Vercelu
- Upewnij się że uruchomiłeś `/api/seed`

## Alternatywne opcje deployment

### Railway.app
1. Połącz GitHub repo
2. Railway automatycznie utworzy PostgreSQL
3. Ustaw zmienne środowiskowe
4. Deploy i wywołaj `/api/seed`

### Azure Container Apps
1. Utwórz Container App
2. Utwórz Azure SQL Database
3. Dodaj Dockerfile do projektu
4. Deploy i wywołaj `/api/seed`

---

**Powodzenia z deploymentem! 🚀**
