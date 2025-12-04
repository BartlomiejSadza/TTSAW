@echo off
REM SmartOffice - Automatyczny skrypt instalacyjny dla Windows
REM Ten skrypt automatycznie skonfiguruje projekt

setlocal enabledelayedexpansion

echo ==================================
echo   SmartOffice - Automatyczna instalacja
echo ==================================
echo.

REM Sprawdź czy Node.js jest zainstalowany
echo [1/8] Sprawdzam Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Node.js nie jest zainstalowany!
    echo Pobierz Node.js z: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js jest zainstalowany: %NODE_VERSION%

REM Sprawdź czy npm jest zainstalowany
echo [2/8] Sprawdzam npm...
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] npm nie jest zainstalowany!
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [OK] npm jest zainstalowany: %NPM_VERSION%

REM Sprawdź czy PostgreSQL jest zainstalowany
echo [3/8] Sprawdzam PostgreSQL...
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] PostgreSQL nie znaleziony lokalnie
    echo.
    echo Mozesz:
    echo   1. Zainstalowac PostgreSQL lokalnie
    echo   2. Uzyc zdalnej bazy danych ^(np. Vercel Postgres, Supabase, Neon^)
    echo.
    set /p has_db="Czy masz dostep do bazy PostgreSQL? (tak/nie): "
    if /i "!has_db!" neq "tak" (
        echo [X] Potrzebujesz dostepu do bazy PostgreSQL
        echo.
        echo Opcje:
        echo   - Zainstaluj lokalnie: https://www.postgresql.org/download/
        echo   - Uzyj darmowego Supabase: https://supabase.com
        echo   - Uzyj darmowego Neon: https://neon.tech
        pause
        exit /b 1
    )
    set HAS_POSTGRES=false
) else (
    for /f "tokens=*" %%i in ('psql --version') do set PSQL_VERSION=%%i
    echo [OK] PostgreSQL jest zainstalowany: !PSQL_VERSION!
    set HAS_POSTGRES=true
)

REM Instalacja zależności
echo.
echo [4/8] Instaluje zaleznosci npm...
call npm install
if %errorlevel% neq 0 (
    echo [X] Blad podczas instalacji zaleznosci
    pause
    exit /b 1
)
echo [OK] Zaleznosci zainstalowane

REM Konfiguracja .env
echo.
echo [5/8] Konfiguruje zmienne srodowiskowe...
if exist .env (
    echo [!] Plik .env juz istnieje
    set /p overwrite="Czy chcesz go nadpisac? (tak/nie): "
    if /i "!overwrite!" neq "tak" (
        echo [!] Pomijam konfiguracje .env
        goto skip_env
    )
    del .env
)

echo Tworze plik .env...

REM Generuj AUTH_SECRET (używamy PowerShell)
echo Generuje AUTH_SECRET...
for /f "tokens=*" %%i in ('powershell -Command "[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))"') do set AUTH_SECRET=%%i

REM Zapytaj o DATABASE_URL
echo.
echo Konfiguracja bazy danych:
echo ------------------------

if "!HAS_POSTGRES!"=="true" (
    echo Przykladowy DATABASE_URL dla lokalnej bazy:
    echo postgresql://postgres:password@localhost:5432/smartoffice
    echo.

    set /p DB_NAME="Nazwa bazy danych [smartoffice]: "
    if "!DB_NAME!"=="" set DB_NAME=smartoffice

    set /p DB_USER="Uzytkownik PostgreSQL [postgres]: "
    if "!DB_USER!"=="" set DB_USER=postgres

    set /p DB_PASSWORD="Haslo PostgreSQL: "

    set /p DB_HOST="Host [localhost]: "
    if "!DB_HOST!"=="" set DB_HOST=localhost

    set /p DB_PORT="Port [5432]: "
    if "!DB_PORT!"=="" set DB_PORT=5432

    set DATABASE_URL=postgresql://!DB_USER!:!DB_PASSWORD!@!DB_HOST!:!DB_PORT!/!DB_NAME!

    echo.
    echo [!] Upewnij sie, ze baza '!DB_NAME!' istnieje w PostgreSQL
    echo Mozesz ja utworzyc komenda: CREATE DATABASE !DB_NAME!;
) else (
    echo Podaj pelny DATABASE_URL od swojego providera ^(np. Supabase, Neon^):
    echo Przyklad: postgresql://user:password@hostname:5432/database
    set /p DATABASE_URL="DATABASE_URL: "
)

REM Utwórz plik .env
(
echo # Database
echo DATABASE_URL="!DATABASE_URL!"
echo.
echo # Auth.js v5 configuration
echo AUTH_SECRET="!AUTH_SECRET!"
echo AUTH_TRUST_HOST=true
echo AUTH_URL="http://localhost:3000"
echo.
echo # Legacy NextAuth support ^(opcjonalne^)
echo NEXTAUTH_SECRET="!AUTH_SECRET!"
echo NEXTAUTH_URL="http://localhost:3000"
) > .env

echo [OK] Plik .env zostal utworzony

:skip_env

REM Inicjalizacja bazy danych
echo.
echo [6/8] Inicjalizuje baze danych...
echo Uruchamiam Prisma migrations...
call npx prisma db push --accept-data-loss
if %errorlevel% neq 0 (
    echo [X] Blad podczas inicjalizacji bazy danych
    echo Sprawdz czy DATABASE_URL jest poprawny i czy baza danych istnieje
    pause
    exit /b 1
)
echo [OK] Baza danych zainicjalizowana

REM Generowanie Prisma Client
echo.
echo [7/8] Generuje Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo [X] Blad podczas generowania Prisma Client
    pause
    exit /b 1
)
echo [OK] Prisma Client wygenerowany

REM Zaseedowanie bazy danych
echo.
echo [8/8] Zaseedowanie bazy danych...
set /p seed_db="Czy chcesz zaseedowac baze przykladowymi danymi? (tak/nie) [tak]: "
if "!seed_db!"=="" set seed_db=tak

if /i "!seed_db!"=="tak" (
    if exist "prisma\seed.ts" (
        call npm run seed
        if %errorlevel% neq 0 (
            echo [!] Seedowanie przez npm nie powiodlo sie
            echo Sprobuj przez API po uruchomieniu: curl -X POST http://localhost:3000/api/seed
        ) else (
            echo [OK] Baza danych zaseedowana
        )
    ) else (
        echo [!] Brak pliku seed.ts, seedowanie nastapi przez API
        set SEED_VIA_API=true
    )
)

REM Podsumowanie
echo.
echo ==================================
echo   Instalacja zakonczona!
echo ==================================
echo.
echo Nastepne kroki:
echo.
echo 1. Uruchom serwer deweloperski:
echo    npm run dev
echo.
echo 2. Otworz przegladarke:
echo    http://localhost:3000
echo.

if "!SEED_VIA_API!"=="true" (
    echo 3. Zaseeduj baze danych ^(w nowym terminalu gdy serwer dziala^):
    echo    curl -X POST http://localhost:3000/api/seed
    echo.
)

echo Dane logowania ^(po seedowaniu^):
echo   Admin:
echo     Email: admin@wydzial.pl
echo     Haslo: admin123
echo.
echo   Uzytkownik:
echo     Email: student@wydzial.pl
echo     Haslo: student123
echo.
echo Przydatne komendy:
echo   - Prisma Studio ^(GUI do bazy^): npx prisma studio
echo   - Resetuj baze danych: npx prisma migrate reset
echo.
echo Milego kodowania! 🎉
echo.
pause
