#!/bin/bash

# SmartOffice - Automatyczny skrypt instalacyjny
# Ten skrypt automatycznie skonfiguruje projekt

set -e  # Zatrzymaj skrypt przy pierwszym błędzie

echo "=================================="
echo "  SmartOffice - Automatyczna instalacja"
echo "=================================="
echo ""

# Kolory dla lepszej czytelności
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funkcja do wyświetlania sukcesów
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Funkcja do wyświetlania błędów
error() {
    echo -e "${RED}✗${NC} $1"
}

# Funkcja do wyświetlania ostrzeżeń
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Funkcja do wyświetlania kroków
step() {
    echo ""
    echo -e "${GREEN}==>${NC} $1"
}

# Sprawdź czy Node.js jest zainstalowany
step "Sprawdzam Node.js..."
if ! command -v node &> /dev/null; then
    error "Node.js nie jest zainstalowany!"
    echo "Pobierz Node.js z: https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
success "Node.js jest zainstalowany: $NODE_VERSION"

# Sprawdź czy npm jest zainstalowany
step "Sprawdzam npm..."
if ! command -v npm &> /dev/null; then
    error "npm nie jest zainstalowany!"
    exit 1
fi
NPM_VERSION=$(npm -v)
success "npm jest zainstalowany: $NPM_VERSION"

# Sprawdź czy PostgreSQL jest zainstalowany
step "Sprawdzam PostgreSQL..."
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version)
    success "PostgreSQL jest zainstalowany: $PSQL_VERSION"
    HAS_POSTGRES=true
else
    warning "PostgreSQL nie znaleziony lokalnie"
    echo "Możesz:"
    echo "  1. Zainstalować PostgreSQL lokalnie"
    echo "  2. Użyć zdalnej bazy danych (np. Vercel Postgres, Supabase, Neon)"
    echo ""
    read -p "Czy masz dostęp do bazy PostgreSQL? (tak/nie): " has_db
    if [[ $has_db != "tak" ]]; then
        error "Potrzebujesz dostępu do bazy PostgreSQL"
        echo ""
        echo "Opcje:"
        echo "  - Zainstaluj lokalnie: https://www.postgresql.org/download/"
        echo "  - Użyj darmowego Supabase: https://supabase.com"
        echo "  - Użyj darmowego Neon: https://neon.tech"
        exit 1
    fi
    HAS_POSTGRES=false
fi

# Instalacja zależności
step "Instaluję zależności npm..."
npm install
success "Zależności zainstalowane"

# Konfiguracja .env
step "Konfiguruję zmienne środowiskowe..."
if [ -f .env ]; then
    warning "Plik .env już istnieje"
    read -p "Czy chcesz go nadpisać? (tak/nie): " overwrite
    if [[ $overwrite != "tak" ]]; then
        warning "Pomijam konfigurację .env"
    else
        rm .env
    fi
fi

if [ ! -f .env ]; then
    echo "Tworzę plik .env..."

    # Generuj AUTH_SECRET
    echo "Generuję AUTH_SECRET..."
    AUTH_SECRET=$(openssl rand -base64 32)

    # Zapytaj o DATABASE_URL
    echo ""
    echo "Konfiguracja bazy danych:"
    echo "------------------------"

    if [ "$HAS_POSTGRES" = true ]; then
        echo "Przykładowy DATABASE_URL dla lokalnej bazy:"
        echo "postgresql://postgres:password@localhost:5432/smartoffice"
        echo ""
        read -p "Nazwa bazy danych [smartoffice]: " DB_NAME
        DB_NAME=${DB_NAME:-smartoffice}

        read -p "Użytkownik PostgreSQL [postgres]: " DB_USER
        DB_USER=${DB_USER:-postgres}

        read -sp "Hasło PostgreSQL: " DB_PASSWORD
        echo ""

        read -p "Host [localhost]: " DB_HOST
        DB_HOST=${DB_HOST:-localhost}

        read -p "Port [5432]: " DB_PORT
        DB_PORT=${DB_PORT:-5432}

        DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

        # Sprawdź czy baza istnieje, jeśli nie - utwórz
        echo ""
        echo "Sprawdzam czy baza danych istnieje..."
        if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
            success "Baza danych '$DB_NAME' już istnieje"
        else
            echo "Tworzę bazę danych '$DB_NAME'..."
            PGPASSWORD=$DB_PASSWORD createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null || warning "Nie udało się utworzyć bazy automatycznie. Utwórz ją ręcznie: CREATE DATABASE $DB_NAME;"
        fi
    else
        echo "Podaj pełny DATABASE_URL od swojego providera (np. Supabase, Neon):"
        echo "Przykład: postgresql://user:password@hostname:5432/database"
        read -p "DATABASE_URL: " DATABASE_URL
    fi

    # Utwórz plik .env
    cat > .env << EOF
# Database
DATABASE_URL="${DATABASE_URL}"

# Auth.js v5 configuration
AUTH_SECRET="${AUTH_SECRET}"
AUTH_TRUST_HOST=true
AUTH_URL="http://localhost:3000"

# Legacy NextAuth support (opcjonalne)
NEXTAUTH_SECRET="${AUTH_SECRET}"
NEXTAUTH_URL="http://localhost:3000"
EOF

    success "Plik .env został utworzony"
fi

# Inicjalizacja bazy danych
step "Inicjalizuję bazę danych..."
echo "Uruchamiam Prisma migrations..."
npx prisma db push --accept-data-loss
success "Baza danych zainicjalizowana"

# Generowanie Prisma Client
step "Generuję Prisma Client..."
npx prisma generate
success "Prisma Client wygenerowany"

# Zaseedowanie bazy danych
step "Zaseeduję bazę danych przykładowymi danymi..."
read -p "Czy chcesz zaseedować bazę przykładowymi danymi? (tak/nie) [tak]: " seed_db
seed_db=${seed_db:-tak}

if [[ $seed_db == "tak" ]]; then
    if [ -f "prisma/seed.ts" ]; then
        npm run seed || warning "Seedowanie przez npm nie powiodło się, spróbuję przez API po uruchomieniu"
        success "Baza danych zaseedowana"
    else
        warning "Brak pliku seed.ts, seedowanie nastąpi przez API"
        SEED_VIA_API=true
    fi
fi

# Podsumowanie
echo ""
echo "=================================="
echo -e "${GREEN}  Instalacja zakończona!${NC}"
echo "=================================="
echo ""
echo "Następne kroki:"
echo ""
echo "1. Uruchom serwer deweloperski:"
echo -e "   ${YELLOW}npm run dev${NC}"
echo ""
echo "2. Otwórz przeglądarkę:"
echo -e "   ${YELLOW}http://localhost:3000${NC}"
echo ""

if [ "$SEED_VIA_API" = true ]; then
    echo "3. Zaseeduj bazę danych (w nowym terminalu gdy serwer działa):"
    echo -e "   ${YELLOW}curl -X POST http://localhost:3000/api/seed${NC}"
    echo ""
fi

echo "Dane logowania (po seedowaniu):"
echo "  Admin:"
echo "    Email: admin@wydzial.pl"
echo "    Hasło: admin123"
echo ""
echo "  Użytkownik:"
echo "    Email: student@wydzial.pl"
echo "    Hasło: student123"
echo ""
echo "Przydatne komendy:"
echo "  - Prisma Studio (GUI do bazy): npx prisma studio"
echo "  - Resetuj bazę danych: npx prisma migrate reset"
echo ""
echo -e "${GREEN}Miłego kodowania! 🎉${NC}"
