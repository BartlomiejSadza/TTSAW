# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SmartOffice is a room reservation system for conference and lecture rooms with an interactive horseshoe-shaped floor plan. Built with Next.js 16 (App Router), React 19, TypeScript, PostgreSQL/Prisma, and NextAuth.js 5.

## Common Commands

```bash
# Development
npm run dev              # Start dev server at localhost:3000
npm run build            # Build for production (runs prisma generate first)
npm run lint             # Run ESLint

# Database
npx prisma generate      # Generate Prisma Client (also runs on npm install)
npx prisma db push       # Push schema changes to database
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Create and run migrations

# Docker (recommended for quick start)
docker-compose up -d     # Start PostgreSQL + app
docker-compose down -v   # Stop and remove volumes

# Seeding
curl -X POST http://localhost:3000/api/seed  # Load test data
```

## Architecture

### Authentication Flow
- NextAuth.js v5 with JWT strategy, configured in [lib/auth.ts](lib/auth.ts)
- Middleware at [middleware.ts](middleware.ts) protects routes and redirects unauthenticated users
- Credentials provider with bcrypt password hashing
- User roles: `USER` and `ADMIN`

### Database Layer
- Prisma ORM with PostgreSQL
- Schema defined in [prisma/schema.prisma](prisma/schema.prisma)
- Singleton pattern for Prisma client in [lib/prisma.ts](lib/prisma.ts)
- Three models: `User`, `Room`, `Reservation`

### API Routes Structure
All API routes are in `app/api/`:
- `/api/auth/[...nextauth]` - NextAuth handlers
- `/api/rooms` and `/api/rooms/[id]` - Room CRUD (GET public, POST admin-only)
- `/api/reservations` and `/api/reservations/[id]` - Reservation management
- `/api/users` - User management (admin-only)
- `/api/seed` - Database seeding endpoint
- `/api/health` - Health check

### Page Routes
- `/dashboard` - User home after login
- `/rooms` and `/rooms/[id]` - Room listing and details/booking
- `/floor-plan` - Interactive floor visualization (4 floors, 10 rooms each)
- `/reservations` - User's reservations
- `/calendar` - Calendar view
- `/admin` - Admin panel
- `/login`, `/register` - Auth pages

### Component Structure
- `components/layout/` - Navbar, Sidebar
- `components/ui/` - Reusable UI components
- `components/Providers.tsx` - Session provider wrapper

### Types
Custom TypeScript types in [types/index.ts](types/index.ts), NextAuth extensions in [types/next-auth.d.ts](types/next-auth.d.ts).

## Environment Variables

Required in `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/smartoffice
AUTH_SECRET=<min-32-char-secret>  # Generate: openssl rand -base64 32
AUTH_URL=http://localhost:3000
```

## Test Credentials (after seeding)

- Admin: `admin@wydzial.pl` / `admin123`
- User: `student@wydzial.pl` / `student123`
