@echo off
REM SmartOffice - Automatyczny skrypt instalacyjny dla Windows
REM Ten skrypt automatycznie skonfiguruje projekt BEZ zadawania pytan

setlocal enabledelayedexpansion

echo ==================================
echo   SmartOffice - Automatyczna instalacja
echo ==================================
echo.

REM Sprawdz czy Node.js jest zainstalowany
echo [1/6] Sprawdzam Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Node.js nie jest zainstalowany!
    echo Pobierz Node.js z: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js !NODE_VERSION!

REM Sprawdz czy npm jest zainstalowany
echo.
echo [2/6] Sprawdzam npm...
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] npm nie jest zainstalowany!
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [OK] npm !NPM_VERSION!

REM Instalacja zaleznosci
echo.
echo [3/6] Instaluje zaleznosci...
echo [i] To moze potrwac chwile...
call npm install --silent
if %errorlevel% neq 0 (
    echo [X] Blad podczas instalacji zaleznosci
    pause
    exit /b 1
)
echo [OK] Zaleznosci zainstalowane

REM Konfiguracja .env
echo.
echo [4/6] Konfiguruje zmienne srodowiskowe...

if exist .env (
    echo [!] Plik .env juz istnieje - pomijam
) else (
    echo [i] Tworze plik .env z automatycznymi ustawieniami...

    REM Generuj AUTH_SECRET (uzywamy PowerShell)
    for /f "tokens=*" %%i in ('powershell -Command "[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))"') do set AUTH_SECRET=%%i

    REM Uzyj domyslnych ustawien - PostgreSQL
    set DATABASE_URL=postgresql://postgres@localhost:5432/smartoffice

    REM Utworz plik .env
    (
    echo # Database - domyslnie PostgreSQL lokalny
    echo # Jesli nie masz PostgreSQL, zmien na: file:./dev.db ^(SQLite^)
    echo DATABASE_URL="!DATABASE_URL!"
    echo.
    echo # Auth.js v5 configuration ^(wygenerowane automatycznie^)
    echo AUTH_SECRET="!AUTH_SECRET!"
    echo AUTH_TRUST_HOST=true
    echo AUTH_URL="http://localhost:3000"
    echo.
    echo # Legacy NextAuth support
    echo NEXTAUTH_SECRET="!AUTH_SECRET!"
    echo NEXTAUTH_URL="http://localhost:3000"
    ) > .env

    echo [OK] Plik .env utworzony
    echo [i] DATABASE_URL: postgresql://postgres@localhost:5432/smartoffice
)

REM Inicjalizacja bazy danych
echo.
echo [5/6] Inicjalizuje baze danych...

REM Sprawdz czy PostgreSQL jest dostepny
where psql >nul 2>nul
if %errorlevel% equ 0 (
    echo [i] Wykryto PostgreSQL - probuje utworzyc baze...

    REM Sprobuj utworzyc baze
    createdb -U postgres smartoffice >nul 2>nul
    if %errorlevel% equ 0 (
        echo [OK] Baza danych 'smartoffice' utworzona
    ) else (
        echo [i] Baza juz istnieje
    )

    REM Uruchom Prisma
    echo [i] Uruchamiam migracje Prisma...
    call npx prisma db push --accept-data-loss --skip-generate
    if %errorlevel% neq 0 (
        echo [X] Blad podczas inicjalizacji bazy danych
        pause
        exit /b 1
    )
    echo [OK] Baza danych zainicjalizowana
) else (
    echo [X] PostgreSQL nie wykryty!
    echo.
    echo Aby uruchomić projekt potrzebujesz PostgreSQL.
    echo.
    echo Opcje:
    echo   1. Zainstaluj PostgreSQL lokalnie:
    echo      Windows: https://www.postgresql.org/download/windows/
    echo.
    echo   2. Lub uzyj darmowej bazy w chmurze:
    echo      - Supabase: https://supabase.com ^(darmowy tier^)
    echo      - Neon: https://neon.tech ^(darmowy tier^)
    echo      - Railway: https://railway.app ^(darmowy tier^)
    echo.
    echo   Po instalacji/utworzeniu bazy zmien DATABASE_URL w pliku .env
    echo   i uruchom ponownie: setup.bat
    pause
    exit /b 1
)

REM Generowanie Prisma Client
echo [i] Generuje Prisma Client...
call npx prisma generate >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Blad podczas generowania Prisma Client
    pause
    exit /b 1
)
echo [OK] Prisma Client wygenerowany

REM Zaseedowanie bazy danych
echo.
echo [6/6] Zaladowanie przykladowych danych...

if exist "prisma\seed.ts" (
    echo [i] Laduje dane testowe ^(uzytkownicy, sale, rezerwacje^)...
    call npm run seed >nul 2>nul
    if %errorlevel% neq 0 (
        echo [!] Seedowanie nie powiodlo sie - mozesz to zrobic pozniej: npm run seed
    ) else (
        echo [OK] Dane testowe zaladowane
    )
) else (
    echo [i] Brak seed.ts - dane zostana zaladowane przy pierwszym uruchomieniu
)

REM Podsumowanie
echo.
echo ==================================
echo [OK] Instalacja zakonczona!
echo ==================================
echo.
echo Nastepne kroki:
echo.
echo 1. Uruchom aplikacje:
echo    npm run dev
echo.
echo 2. Otworz w przegladarce:
echo    http://localhost:3000
echo.
echo Dane do logowania:
echo.
echo   Administrator:
echo      Email: admin@wydzial.pl
echo      Haslo: admin123
echo.
echo   Uzytkownik:
echo      Email: student@wydzial.pl
echo      Haslo: student123
echo.
echo Przydatne komendy:
echo   - npx prisma studio    - GUI do bazy danych
echo   - npm run seed         - Ponowne zaladowanie danych
echo.
echo Gotowe do uzycia! 🚀
echo.
pause
