#!/bin/bash

# SmartOffice - Automatyczny skrypt instalacyjny
# Ten skrypt automatycznie skonfiguruje projekt BEZ zadawania pytań

echo "=================================="
echo "  SmartOffice - Automatyczna instalacja"
echo "=================================="
echo ""
echo "⚠️  Upewnij się, że PostgreSQL jest uruchomiony!"
echo ""

# Kolory dla lepszej czytelności
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Funkcja do wyświetlania informacji
info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Funkcja do wyświetlania kroków
step() {
    echo ""
    echo -e "${GREEN}==>${NC} $1"
}

# Funkcja do wyjścia z błędem
die() {
    error "$1"
    exit 1
}

# Sprawdź czy Node.js jest zainstalowany
step "[1/6] Sprawdzam Node.js..."
if ! command -v node &> /dev/null; then
    die "Node.js nie jest zainstalowany! Pobierz z: https://nodejs.org/"
fi
NODE_VERSION=$(node -v)
success "Node.js $NODE_VERSION"

# Sprawdź czy npm jest zainstalowany
step "[2/6] Sprawdzam npm..."
if ! command -v npm &> /dev/null; then
    die "npm nie jest zainstalowany!"
fi
NPM_VERSION=$(npm -v)
success "npm $NPM_VERSION"

# Instalacja zależności
step "[3/6] Instaluję zależności..."
info "To może potrwać chwilę..."
if ! npm install --silent; then
    die "Błąd podczas instalacji zależności!"
fi
success "Zależności zainstalowane"

# Konfiguracja .env
step "[4/6] Konfiguruję zmienne środowiskowe..."

# Sprawdź czy .env już istnieje
if [ -f .env ]; then
    warning "Plik .env już istnieje - pomijam"
else
    info "Tworzę plik .env z automatycznymi ustawieniami..."

    # Generuj AUTH_SECRET
    AUTH_SECRET=$(openssl rand -base64 32)

    # Użyj domyślnych ustawień - whoami dla Homebrew, postgres dla standardowej instalacji
    CURRENT_USER=$(whoami)
    DATABASE_URL="postgresql://${CURRENT_USER}@localhost:5432/smartoffice"

    # Utwórz plik .env
    cat > .env << EOF
# Database - domyślnie PostgreSQL lokalny
DATABASE_URL="${DATABASE_URL}"

# Auth.js v5 configuration (wygenerowane automatycznie)
AUTH_SECRET="${AUTH_SECRET}"
AUTH_TRUST_HOST=true
AUTH_URL="http://localhost:3000"

# Legacy NextAuth support
NEXTAUTH_SECRET="${AUTH_SECRET}"
NEXTAUTH_URL="http://localhost:3000"
EOF

    success "Plik .env utworzony"
    info "DATABASE_URL: postgresql://${CURRENT_USER}@localhost:5432/smartoffice"
fi

# Inicjalizacja bazy danych
step "[5/6] Inicjalizuję bazę danych..."

# Sprawdź czy PostgreSQL jest dostępny i działa
if ! command -v psql &> /dev/null; then
    error "PostgreSQL nie wykryty!"
    echo ""
    echo "Aby uruchomić projekt potrzebujesz PostgreSQL."
    echo ""
    echo "Opcje:"
    echo "  1. Zainstaluj PostgreSQL lokalnie:"
    echo "     macOS:   brew install postgresql@14"
    echo "              brew services start postgresql@14"
    echo ""
    echo "     Ubuntu:  sudo apt install postgresql postgresql-contrib"
    echo "              sudo systemctl start postgresql"
    echo ""
    echo "     Windows: https://www.postgresql.org/download/windows/"
    echo ""
    echo "  2. Lub użyj darmowej bazy w chmurze:"
    echo "     - Supabase: https://supabase.com (darmowy tier)"
    echo "     - Neon: https://neon.tech (darmowy tier)"
    echo "     - Railway: https://railway.app (darmowy tier)"
    echo ""
    echo "  Po instalacji/utworzeniu bazy zmień DATABASE_URL w pliku .env"
    exit 1
fi

info "Wykryto PostgreSQL - sprawdzam czy działa..."

# Użyj whoami dla Homebrew PostgreSQL, fallback do postgres
CURRENT_USER=$(whoami)
DB_USER=$CURRENT_USER

# Sprawdź czy serwer faktycznie działa
if ! psql -U $DB_USER -c "SELECT 1" > /dev/null 2>&1; then
    # Spróbuj z postgres (standardowa instalacja)
    if psql -U postgres -c "SELECT 1" > /dev/null 2>&1; then
        DB_USER="postgres"
    else
        error "PostgreSQL jest zainstalowany ale nie działa!"
        echo ""
        echo "Uruchom PostgreSQL:"
        echo "  macOS:   brew services start postgresql@14"
        echo "  Linux:   sudo systemctl start postgresql"
        echo ""
        echo "Sprawdź status:"
        echo "  macOS:   brew services list | grep postgres"
        echo "  Linux:   sudo systemctl status postgresql"
        echo ""
        exit 1
    fi
fi

success "PostgreSQL działa poprawnie (użytkownik: $DB_USER)"

# Spróbuj utworzyć bazę
createdb -U $DB_USER smartoffice 2>/dev/null && success "Baza danych 'smartoffice' utworzona" || info "Baza już istnieje"

# Zaktualizuj DATABASE_URL w .env jeśli używamy innego użytkownika niż w pliku
if [ -f .env ] && [ "$DB_USER" != "$CURRENT_USER" ]; then
    sed -i.bak "s|postgresql://.*@localhost:5432/smartoffice|postgresql://${DB_USER}@localhost:5432/smartoffice|" .env
    rm -f .env.bak
    info "Zaktualizowano DATABASE_URL na użytkownika: $DB_USER"
fi

# Uruchom Prisma - MUSI się udać!
info "Uruchamiam migracje Prisma..."
if ! npx prisma db push --accept-data-loss --skip-generate 2>&1; then
    error "Błąd podczas migracji bazy danych!"
    echo ""
    echo "Sprawdź czy:"
    echo "  1. PostgreSQL działa: brew services list | grep postgres"
    echo "  2. Możesz się połączyć: psql -U postgres -c 'SELECT 1'"
    echo "  3. Baza istnieje: psql -U postgres -l | grep smartoffice"
    echo ""
    exit 1
fi
success "Baza danych zainicjalizowana"

# Generowanie Prisma Client
info "Generuję Prisma Client..."
if ! npx prisma generate --silent; then
    die "Błąd podczas generowania Prisma Client!"
fi
success "Prisma Client wygenerowany"

# Zaseedowanie bazy danych
step "[6/6] Załadowanie przykładowych danych..."

if [ -f "prisma/seed.ts" ]; then
    info "Ładuję dane testowe (użytkownicy, sale, rezerwacje)..."
    if npm run seed 2>&1 | grep -q "error"; then
        warning "Seedowanie nie powiodło się - możesz to zrobić później: npm run seed"
    else
        success "Dane testowe załadowane"
    fi
else
    info "Brak seed.ts - dane zostaną załadowane przy pierwszym uruchomieniu"
fi

# Podsumowanie
echo ""
echo "=================================="
echo -e "${GREEN}✓ Instalacja zakończona!${NC}"
echo "=================================="
echo ""
echo -e "${BLUE}Następne kroki:${NC}"
echo ""
echo "1. Uruchom aplikację:"
echo -e "   ${YELLOW}npm run dev${NC}"
echo ""
echo "2. Otwórz w przeglądarce:"
echo -e "   ${YELLOW}http://localhost:3000${NC}"
echo ""
echo -e "${BLUE}Dane do logowania:${NC}"
echo ""
echo "  👤 Administrator:"
echo "     Email: admin@wydzial.pl"
echo "     Hasło: admin123"
echo ""
echo "  👤 Użytkownik:"
echo "     Email: student@wydzial.pl"
echo "     Hasło: student123"
echo ""
echo -e "${BLUE}Przydatne komendy:${NC}"
echo "  • npx prisma studio    - GUI do bazy danych"
echo "  • npm run seed         - Ponowne załadowanie danych"
echo ""
echo -e "${GREEN}Gotowe do użycia! 🚀${NC}"
echo ""
