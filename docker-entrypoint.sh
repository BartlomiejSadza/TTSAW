#!/bin/sh
set -e

echo "🚀 Starting SmartOffice..."

# Run database migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Check if database is empty (first run)
echo "🔍 Checking if database needs seeding..."

# Start the server in background
echo "🌐 Starting Next.js server..."
npm start &
SERVER_PID=$!

# Wait for server to be ready
echo "⏳ Waiting for server to start..."
sleep 10

# Try to seed the database via API
echo "🌱 Attempting to seed database..."
if curl -f -X POST http://localhost:3000/api/seed -H "Content-Type: application/json" 2>/dev/null; then
  echo "✅ Database seeded successfully!"
else
  echo "ℹ️  Seed skipped (database might already have data)"
fi

# Bring server to foreground
echo "✨ SmartOffice is ready!"
wait $SERVER_PID
