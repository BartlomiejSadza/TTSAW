#!/bin/bash

# Quick start script - setup i uruchomienie w jednej komendzie

echo "🚀 SmartOffice - Quick Start"
echo ""

# Sprawdź czy .env istnieje
if [ ! -f .env ]; then
    echo "Pierwsza instalacja - uruchamiam setup..."
    if ! ./setup.sh; then
        echo ""
        echo "❌ Setup się nie powiódł. Napraw błędy i spróbuj ponownie."
        exit 1
    fi
    echo ""
fi

# Usuń DATABASE_URL ze środowiska (może override'ować .env)
unset DATABASE_URL

# Uruchom serwer
echo "Uruchamiam serwer deweloperski..."
echo "Otwórz http://localhost:3000 w przeglądarce"
echo ""
echo "Dane logowania:"
echo "  Admin: admin@wydzial.pl / admin123"
echo "  User:  student@wydzial.pl / student123"
echo ""
npm run dev
