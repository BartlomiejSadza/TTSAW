@echo off
REM Quick start script - setup i uruchomienie w jednej komendzie

echo 🚀 SmartOffice - Quick Start
echo.

REM Sprawdz czy .env istnieje
if not exist .env (
    echo Pierwsza instalacja - uruchamiam setup...
    call setup.bat
    if %errorlevel% neq 0 (
        echo.
        echo [X] Setup sie nie powiodl. Napraw bledy i sprobuj ponownie.
        pause
        exit /b 1
    )
    echo.
)

REM Uruchom serwer
echo Uruchamiam serwer deweloperski...
echo Otworz http://localhost:3000 w przegladarce
echo.
echo Dane logowania:
echo   Admin: admin@wydzial.pl / admin123
echo   User:  student@wydzial.pl / student123
echo.
npm run dev
