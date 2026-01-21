#!/bin/sh
set -e

echo "Starting SmartOffice..."

# Push database schema (creates tables if they don't exist)
echo "Setting up database schema..."
npx prisma db push --skip-generate

# Always seed with fresh data (clean start each deployment)
echo "Seeding database with fresh room data..."
node /app/prisma/seed.mjs

# Start the server
echo "Starting Next.js server..."
exec npm start
