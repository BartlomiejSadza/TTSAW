#!/bin/sh
set -e

echo "Starting SmartOffice..."

# Push database schema (creates tables if they don't exist)
echo "Setting up database schema..."
npx prisma db push --skip-generate

# Seed the database (will skip if data exists)
echo "Seeding database..."
node /app/prisma/seed.mjs

# Start the server
echo "Starting Next.js server..."
exec npm start
