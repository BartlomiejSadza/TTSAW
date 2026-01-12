# SmartOffice Lead Engineer Technical Brief

## Mission Statement

Refactor SmartOffice into a **production-ready, enterprise-grade application** following modern web development best practices. This brief focuses on code quality, architecture, performance, security, and maintainability while implementing the design system specified in UX_DESIGNER_BRIEF.md.

---

## Part 1: Code Quality & Architecture Standards

### 1.1 TypeScript Best Practices

**Strict Type Safety:**

```typescript
// tsconfig.json - Enforce strict mode
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "exactOptionalPropertyTypes": true
  }
}
```

**Type Organization:**

```typescript
// types/api.ts - API response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// types/models.ts - Domain models (extend Prisma types)
import type { Room, Reservation, User } from '@prisma/client';

export type RoomWithReservations = Room & {
  reservations: Reservation[];
};

export type SafeUser = Omit<User, 'password'>;

// types/forms.ts - Form validation schemas
export interface LoginFormData {
  email: string;
  password: string;
}

export interface CreateReservationData {
  roomId: string;
  startTime: Date;
  endTime: Date;
  purpose?: string;
}
```

**Avoid Type Assertions:**

```typescript
// ❌ BAD - Using 'as' blindly
const user = data as User;

// ✅ GOOD - Type guards
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'email' in data
  );
}

if (isUser(data)) {
  // TypeScript knows data is User here
  console.log(data.email);
}
```

### 1.2 Component Architecture

**Component File Structure:**

```
components/
├── ui/                      # Pure presentational components
│   ├── Button/
│   │   ├── Button.tsx       # Main component
│   │   ├── Button.test.tsx  # Unit tests
│   │   ├── Button.stories.tsx # Storybook (optional)
│   │   └── index.ts         # Export
│   ├── Card/
│   ├── Input/
│   └── Modal/
├── features/                # Feature-specific components
│   ├── reservations/
│   │   ├── ReservationCard.tsx
│   │   ├── ReservationForm.tsx
│   │   └── ReservationList.tsx
│   ├── rooms/
│   └── floor-plan/
├── layout/                  # Layout components
│   ├── Sidebar.tsx
│   ├── Navbar.tsx
│   └── AppLayout.tsx
└── providers/              # Context providers
    ├── SessionProvider.tsx
    └── ThemeProvider.tsx
```

**Component Patterns:**

```typescript
// ✅ GOOD - Compound component pattern for complex UI
export const Modal = ({ children, ...props }: ModalProps) => {
  return <ModalContext.Provider value={...}>{children}</ModalContext.Provider>;
};

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

// Usage
<Modal open={isOpen} onClose={handleClose}>
  <Modal.Header>Title</Modal.Header>
  <Modal.Body>Content</Modal.Body>
  <Modal.Footer>Actions</Modal.Footer>
</Modal>
```

**Prop Handling:**

```typescript
// ✅ GOOD - Explicit props with defaults
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  'aria-label'?: string;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  className,
  children,
  leftIcon,
  rightIcon,
  onClick,
  ...rest
}: ButtonProps) => {
  // Implementation
};
```

### 1.3 State Management Strategy

**Use Server Components by Default:**

```typescript
// app/rooms/page.tsx - Server Component (default)
import { getRooms } from '@/lib/actions/rooms';

export default async function RoomsPage() {
  const rooms = await getRooms();

  return <RoomList rooms={rooms} />;
}
```

**Client Components Only When Needed:**

```typescript
// components/features/rooms/RoomList.tsx
'use client';

import { useState } from 'react';

export function RoomList({ rooms: initialRooms }: { rooms: Room[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  // Client-side filtering, interactions
}
```

**React Hook Rules:**

```typescript
// ✅ GOOD - Custom hooks for reusable logic
export function useReservations(userId: string) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReservations() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/reservations?userId=${userId}`);
        const data = await response.json();
        setReservations(data.reservations);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch');
      } finally {
        setIsLoading(false);
      }
    }

    fetchReservations();
  }, [userId]);

  return { reservations, isLoading, error };
}
```

**Server Actions for Mutations:**

```typescript
// lib/actions/reservations.ts
'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function createReservation(data: CreateReservationData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    const reservation = await prisma.reservation.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    });

    revalidatePath('/reservations');
    revalidatePath('/dashboard');

    return { success: true, reservation };
  } catch (error) {
    return { error: 'Failed to create reservation' };
  }
}
```

### 1.4 Error Handling

**API Route Error Handling:**

```typescript
// lib/api-utils.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function handleApiError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle known Prisma errors
    if (error.code === 'P2002') {
      return Response.json(
        { error: 'Resource already exists' },
        { status: 409 }
      );
    }
  }

  // Generic error
  return Response.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

// Usage in API route
export async function POST(request: Request) {
  try {
    // ... logic
    return Response.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
```

**Client-Side Error Boundaries:**

```typescript
// components/ErrorBoundary.tsx
'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Log to error reporting service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Part 2: Database & Backend Best Practices

### 2.1 Prisma Optimization

**Efficient Queries:**

```typescript
// ❌ BAD - N+1 query problem
const rooms = await prisma.room.findMany();
for (const room of rooms) {
  const reservations = await prisma.reservation.findMany({
    where: { roomId: room.id }
  });
}

// ✅ GOOD - Use include/select
const rooms = await prisma.room.findMany({
  include: {
    reservations: {
      where: {
        startTime: { gte: new Date() }
      },
      orderBy: { startTime: 'asc' }
    }
  }
});

// ✅ EVEN BETTER - Select only needed fields
const rooms = await prisma.room.findMany({
  select: {
    id: true,
    name: true,
    capacity: true,
    reservations: {
      select: {
        id: true,
        startTime: true,
        endTime: true,
      },
      where: {
        startTime: { gte: new Date() }
      }
    }
  }
});
```

**Connection Pooling:**

```typescript
// lib/prisma.ts - Singleton pattern with proper cleanup
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
```

**Database Migrations:**

```bash
# Always use migrations in production, not db push
npx prisma migrate dev --name descriptive_name
npx prisma migrate deploy  # Production
```

### 2.2 Data Validation

**Use Zod for Runtime Validation:**

```typescript
// lib/validations/reservation.ts
import { z } from 'zod';

export const createReservationSchema = z.object({
  roomId: z.string().uuid(),
  startTime: z.coerce.date().refine(
    (date) => date > new Date(),
    { message: 'Start time must be in the future' }
  ),
  endTime: z.coerce.date(),
  purpose: z.string().min(3).max(500).optional(),
}).refine(
  (data) => data.endTime > data.startTime,
  { message: 'End time must be after start time', path: ['endTime'] }
);

export type CreateReservationInput = z.infer<typeof createReservationSchema>;

// API route usage
export async function POST(request: Request) {
  const body = await request.json();

  const result = createReservationSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { error: 'Validation failed', details: result.error.flatten() },
      { status: 400 }
    );
  }

  // result.data is now typed and validated
  const reservation = await createReservation(result.data);
  return Response.json(reservation);
}
```

**Common Validation Schemas:**

```typescript
// lib/validations/common.ts
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const dateRangeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine(
  (data) => data.endDate >= data.startDate,
  { message: 'End date must be after or equal to start date' }
);

export const emailSchema = z.string().email().toLowerCase();
export const passwordSchema = z.string().min(8).max(100);
```

### 2.3 Security Best Practices

**Authentication Middleware:**

```typescript
// lib/auth-helpers.ts
import { auth } from '@/lib/auth';
import { ApiError } from '@/lib/api-utils';

export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    throw new ApiError(401, 'Unauthorized');
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();

  if (session.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Forbidden - Admin access required');
  }

  return session;
}

// Usage in API route
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    await prisma.room.delete({
      where: { id: params.id }
    });

    return Response.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
```

**Input Sanitization:**

```typescript
// lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href']
  });
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
```

**Rate Limiting:**

```typescript
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

const tokenCache = new LRUCache<string, number[]>({
  max: 500,
  ttl: 60000, // 1 minute
});

export function rateLimit(limit: number, windowMs: number) {
  return (identifier: string): boolean => {
    const now = Date.now();
    const timestamps = tokenCache.get(identifier) || [];

    const validTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < windowMs
    );

    if (validTimestamps.length >= limit) {
      return false; // Rate limit exceeded
    }

    validTimestamps.push(now);
    tokenCache.set(identifier, validTimestamps);
    return true;
  };
}

// Usage in API route
const limiter = rateLimit(10, 60000); // 10 requests per minute

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  if (!limiter(ip)) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // ... handle request
}
```

**CSRF Protection:**

```typescript
// middleware.ts - Add CSRF token
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Set security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );

  return response;
}
```

---

## Part 3: Performance Optimization

### 3.1 React Performance

**Memoization:**

```typescript
// ✅ GOOD - Memoize expensive computations
import { useMemo } from 'react';

function RoomList({ rooms, filters }: Props) {
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      // Expensive filtering logic
      return matchesFilters(room, filters);
    });
  }, [rooms, filters]);

  return <>{/* ... */}</>;
}

// ✅ GOOD - Memoize callbacks passed to children
import { useCallback } from 'react';

function ReservationForm() {
  const handleSubmit = useCallback(async (data: FormData) => {
    // Submit logic
  }, []); // Empty deps if truly stable

  return <Form onSubmit={handleSubmit} />;
}

// ✅ GOOD - React.memo for pure components
export const RoomCard = React.memo(({ room }: { room: Room }) => {
  return (
    <Card>
      <h3>{room.name}</h3>
      {/* ... */}
    </Card>
  );
});
```

**Code Splitting:**

```typescript
// app/admin/page.tsx - Lazy load admin components
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const AdminPanel = dynamic(() => import('@/components/features/admin/AdminPanel'), {
  loading: () => <AdminPanelSkeleton />,
  ssr: false, // If not needed on server
});

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminPanelSkeleton />}>
      <AdminPanel />
    </Suspense>
  );
}
```

**Image Optimization:**

```typescript
// ✅ GOOD - Use Next.js Image component
import Image from 'next/image';

export function RoomImage({ src, alt }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      priority={false} // true for above-the-fold images
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  );
}
```

### 3.2 Data Fetching Optimization

**Parallel Data Fetching:**

```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  // Fetch in parallel
  const [stats, upcomingReservations, popularRooms] = await Promise.all([
    getStats(),
    getUpcomingReservations(),
    getPopularRooms(),
  ]);

  return <Dashboard {...{ stats, upcomingReservations, popularRooms }} />;
}
```

**Streaming SSR:**

```typescript
// app/rooms/page.tsx - Stream content
import { Suspense } from 'react';

export default function RoomsPage() {
  return (
    <div>
      <h1>Rooms</h1>
      <Suspense fallback={<RoomListSkeleton />}>
        <RoomList />
      </Suspense>
    </div>
  );
}

async function RoomList() {
  const rooms = await getRooms(); // This streams
  return <>{/* render rooms */}</>;
}
```

**Caching Strategy:**

```typescript
// lib/actions/rooms.ts
import { unstable_cache } from 'next/cache';

export const getRooms = unstable_cache(
  async () => {
    return await prisma.room.findMany({
      orderBy: { name: 'asc' }
    });
  },
  ['rooms-list'],
  {
    revalidate: 60, // Revalidate every 60 seconds
    tags: ['rooms']
  }
);

// Manually revalidate on mutation
import { revalidateTag } from 'next/cache';

export async function createRoom(data: CreateRoomData) {
  const room = await prisma.room.create({ data });
  revalidateTag('rooms');
  return room;
}
```

### 3.3 Bundle Optimization

**Analyze Bundle:**

```bash
# Add to package.json
"scripts": {
  "analyze": "ANALYZE=true next build"
}

# Install analyzer
npm install @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... config
});
```

**Tree Shaking:**

```typescript
// ✅ GOOD - Named imports for tree shaking
import { Calendar, Clock, User } from 'lucide-react';

// ❌ BAD - Imports entire library
import * as Icons from 'lucide-react';
```

---

## Part 4: Testing Strategy

### 4.1 Unit Testing (Vitest)

```typescript
// components/ui/Button/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables button when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('applies correct variant class', () => {
    render(<Button variant="danger">Delete</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-danger');
  });
});
```

**Setup Vitest:**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});

// vitest.setup.ts
import '@testing-library/jest-dom';
```

### 4.2 Integration Testing

```typescript
// lib/actions/__tests__/reservations.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createReservation, getReservations } from '../reservations';
import { prisma } from '@/lib/prisma';

describe('Reservation Actions', () => {
  beforeAll(async () => {
    // Setup test database
    await prisma.$executeRaw`TRUNCATE TABLE "Reservation" CASCADE`;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates a reservation successfully', async () => {
    const result = await createReservation({
      roomId: 'test-room-id',
      startTime: new Date('2026-02-01T10:00:00'),
      endTime: new Date('2026-02-01T11:00:00'),
      userId: 'test-user-id',
    });

    expect(result.success).toBe(true);
    expect(result.reservation).toBeDefined();
  });

  it('prevents double booking', async () => {
    // First reservation
    await createReservation({
      roomId: 'test-room-id',
      startTime: new Date('2026-02-01T10:00:00'),
      endTime: new Date('2026-02-01T11:00:00'),
      userId: 'user-1',
    });

    // Conflicting reservation
    const result = await createReservation({
      roomId: 'test-room-id',
      startTime: new Date('2026-02-01T10:30:00'),
      endTime: new Date('2026-02-01T11:30:00'),
      userId: 'user-2',
    });

    expect(result.error).toBeDefined();
  });
});
```

### 4.3 E2E Testing (Playwright)

```typescript
// e2e/reservation-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Reservation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'student@wydzial.pl');
    await page.fill('input[name="password"]', 'student123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('user can create a reservation', async ({ page }) => {
    // Navigate to rooms
    await page.click('text=Browse Rooms');
    await expect(page).toHaveURL('/rooms');

    // Select a room
    await page.click('text=Room A-101');

    // Fill reservation form
    await page.fill('input[name="startTime"]', '2026-02-01T10:00');
    await page.fill('input[name="endTime"]', '2026-02-01T11:00');
    await page.fill('textarea[name="purpose"]', 'Team meeting');

    // Submit
    await page.click('button:has-text("Book Now")');

    // Verify success
    await expect(page.locator('text=Reservation created')).toBeVisible();
  });

  test('user can view their reservations', async ({ page }) => {
    await page.click('text=My Reservations');
    await expect(page).toHaveURL('/reservations');

    // Should show reservation list
    await expect(page.locator('[data-testid="reservation-card"]')).toHaveCount(1);
  });
});
```

---

## Part 5: Code Organization & File Structure

### 5.1 Recommended Directory Structure

```
smartoffice/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Protected routes group
│   │   ├── dashboard/
│   │   ├── rooms/
│   │   ├── reservations/
│   │   ├── calendar/
│   │   ├── floor-plan/
│   │   └── layout.tsx            # Shared layout with Sidebar
│   ├── admin/
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── rooms/
│   │   ├── reservations/
│   │   └── health/
│   ├── layout.tsx                # Root layout
│   └── globals.css
├── components/
│   ├── ui/                       # Design system components
│   ├── features/                 # Feature-specific components
│   ├── layout/
│   └── providers/
├── lib/
│   ├── actions/                  # Server actions
│   │   ├── rooms.ts
│   │   └── reservations.ts
│   ├── validations/              # Zod schemas
│   ├── utils/                    # Utility functions
│   ├── hooks/                    # Custom React hooks
│   ├── auth.ts
│   ├── prisma.ts
│   └── constants.ts
├── types/
│   ├── api.ts
│   ├── models.ts
│   ├── forms.ts
│   └── next-auth.d.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.local
├── .eslintrc.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 5.2 Naming Conventions

**Files:**
- Components: PascalCase (e.g., `RoomCard.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- API routes: lowercase (e.g., `route.ts`)
- Types: camelCase with `.d.ts` or part of `types/` folder

**Variables:**
- Constants: UPPER_SNAKE_CASE
- Functions: camelCase
- Components: PascalCase
- Hooks: camelCase starting with `use`

**Example:**

```typescript
// lib/constants.ts
export const MAX_RESERVATION_DURATION = 8; // hours
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// lib/utils/date.ts
export function formatReservationTime(date: Date): string {
  return format(date, 'PPpp');
}

// hooks/useRooms.ts
export function useRooms() {
  // ...
}

// components/RoomCard.tsx
export function RoomCard({ room }: Props) {
  // ...
}
```

---

## Part 6: Documentation Standards

### 6.1 Code Comments

**JSDoc for Functions:**

```typescript
/**
 * Creates a new reservation for a room.
 *
 * @param data - The reservation data including room ID, time range, and purpose
 * @returns Promise resolving to the created reservation or error
 *
 * @throws {ApiError} When user is not authenticated
 * @throws {ApiError} When room is not available at specified time
 *
 * @example
 * ```ts
 * const result = await createReservation({
 *   roomId: '123',
 *   startTime: new Date('2026-02-01T10:00'),
 *   endTime: new Date('2026-02-01T11:00'),
 *   purpose: 'Team meeting'
 * });
 * ```
 */
export async function createReservation(
  data: CreateReservationData
): Promise<ApiResponse<Reservation>> {
  // Implementation
}
```

**Inline Comments (When Needed):**

```typescript
// ✅ GOOD - Explain WHY, not WHAT
// Hash password before storage to prevent plaintext exposure
const hashedPassword = await bcrypt.hash(password, 10);

// ❌ BAD - Obvious what it does
// Create a new user
const user = await prisma.user.create({ data });

// ✅ GOOD - Complex business logic
// Check for overlapping reservations within ±15 minutes buffer
// to account for cleaning/setup time between bookings
const hasConflict = await checkReservationConflict(roomId, startTime, endTime, 15);
```

### 6.2 README Updates

Keep README.md updated with:
- Setup instructions
- Environment variables
- Common commands
- Architecture overview
- Contributing guidelines

---

## Part 7: Deployment & DevOps

### 7.1 Environment Configuration

```bash
# .env.example - Commit this to repo
DATABASE_URL=postgresql://user:password@localhost:5432/smartoffice
AUTH_SECRET=your-secret-here-min-32-chars
AUTH_URL=http://localhost:3000
NODE_ENV=development

# Production-specific
NEXT_PUBLIC_APP_URL=https://smartoffice.example.com
```

### 7.2 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npx tsc --noEmit

      - name: Run unit tests
        run: npm run test

      - name: Build
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          AUTH_SECRET: ${{ secrets.AUTH_SECRET }}

  e2e:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
```

### 7.3 Production Checklist

- [ ] Environment variables set correctly
- [ ] Database migrations run
- [ ] Build succeeds without warnings
- [ ] All tests pass
- [ ] Security headers configured
- [ ] HTTPS enabled
- [ ] Error logging configured (Sentry, LogRocket)
- [ ] Performance monitoring (Vercel Analytics, New Relic)
- [ ] Database backups scheduled
- [ ] Rate limiting enabled
- [ ] CSP headers configured

---

## Part 8: Implementation Phases

### Phase 1: Foundation & Architecture (Week 1)
**Priority: CRITICAL**

1. **TypeScript Strictness**
   - Update `tsconfig.json` with strict settings
   - Fix all type errors
   - Add proper types for all API responses

2. **Error Handling**
   - Implement `ApiError` class
   - Add `handleApiError` helper
   - Create error boundaries for React components
   - Add error logging service integration

3. **Validation Layer**
   - Install Zod
   - Create validation schemas for all forms
   - Add validation to all API routes
   - Implement sanitization helpers

4. **Security Hardening**
   - Add rate limiting
   - Implement CSRF protection
   - Set security headers in middleware
   - Review and fix auth middleware
   - Add input sanitization

### Phase 2: Performance Optimization (Week 2)
**Priority: HIGH**

1. **React Optimization**
   - Add React.memo where needed
   - Implement code splitting with dynamic imports
   - Add Suspense boundaries
   - Optimize re-renders with useMemo/useCallback

2. **Data Fetching**
   - Implement parallel fetching
   - Add caching with unstable_cache
   - Use Server Components by default
   - Add streaming SSR

3. **Database Optimization**
   - Review and optimize Prisma queries
   - Add database indexes for common queries
   - Implement connection pooling
   - Add query result caching

### Phase 3: Testing Infrastructure (Week 3)
**Priority: MEDIUM**

1. **Unit Tests**
   - Setup Vitest
   - Write tests for UI components
   - Write tests for utility functions
   - Aim for 70%+ coverage on critical paths

2. **Integration Tests**
   - Test API routes
   - Test server actions
   - Test database operations

3. **E2E Tests**
   - Setup Playwright
   - Write critical user journey tests
   - Add to CI/CD pipeline

### Phase 4: Code Quality & Documentation (Week 4)
**Priority: MEDIUM**

1. **Refactoring**
   - Organize file structure
   - Extract reusable components
   - Remove code duplication
   - Improve naming consistency

2. **Documentation**
   - Add JSDoc comments
   - Update README
   - Document API endpoints
   - Create architecture diagrams

3. **Linting & Formatting**
   - Configure ESLint with stricter rules
   - Add Prettier
   - Setup pre-commit hooks with Husky
   - Add lint-staged

---

## Part 9: Monitoring & Logging

### 9.1 Structured Logging

```typescript
// lib/logger.ts
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

class Logger {
  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    if (process.env.NODE_ENV === 'production') {
      // Send to external logging service (Datadog, Logtail, etc.)
      this.sendToService(entry);
    } else {
      console.log(JSON.stringify(entry, null, 2));
    }
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>) {
    this.log('error', message, {
      ...context,
      error: {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
      },
    });
  }

  private sendToService(entry: LogEntry) {
    // Integration with logging service
  }
}

export const logger = new Logger();

// Usage
logger.info('Reservation created', { reservationId: '123', userId: '456' });
logger.error('Failed to create reservation', error, { roomId: '789' });
```

### 9.2 Performance Monitoring

```typescript
// lib/metrics.ts
export function measurePerformance<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();

  return fn().finally(() => {
    const duration = performance.now() - start;
    logger.info('Performance metric', {
      operation,
      duration: `${duration.toFixed(2)}ms`,
    });
  });
}

// Usage
const rooms = await measurePerformance('getRooms', () =>
  prisma.room.findMany()
);
```

---

## Part 10: Best Practices Checklist

### Code Quality
- [ ] TypeScript strict mode enabled
- [ ] No `any` types (use `unknown` if truly unknown)
- [ ] All functions have explicit return types
- [ ] Proper error handling everywhere
- [ ] Input validation on all user inputs
- [ ] No hardcoded strings (use constants)
- [ ] DRY principle followed (no duplication)
- [ ] Functions are small and focused (single responsibility)

### Performance
- [ ] Server Components used by default
- [ ] Client Components only when needed (`'use client'`)
- [ ] Images optimized with next/image
- [ ] Code splitting implemented
- [ ] Database queries optimized (no N+1)
- [ ] Memoization used appropriately
- [ ] Bundle size analyzed and minimized

### Security
- [ ] All user input validated and sanitized
- [ ] SQL injection prevented (using Prisma)
- [ ] XSS prevented (React escapes by default)
- [ ] CSRF protection implemented
- [ ] Rate limiting on API routes
- [ ] Authentication required for protected routes
- [ ] Authorization checked for admin actions
- [ ] Security headers configured
- [ ] Dependencies updated regularly

### Testing
- [ ] Unit tests for components
- [ ] Integration tests for API routes
- [ ] E2E tests for critical flows
- [ ] Tests run in CI/CD
- [ ] Coverage reports generated

### Accessibility
- [ ] Semantic HTML used
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader tested

### Documentation
- [ ] README up to date
- [ ] API endpoints documented
- [ ] Complex functions have JSDoc
- [ ] Environment variables documented
- [ ] Setup instructions clear

---

## Summary

This brief provides comprehensive technical standards for building SmartOffice into a production-ready application. Key principles:

1. **Type Safety First** - Strict TypeScript, runtime validation with Zod
2. **Security by Default** - Auth checks, rate limiting, input sanitization
3. **Performance Optimized** - Server Components, caching, code splitting
4. **Well Tested** - Unit, integration, and E2E tests
5. **Properly Structured** - Clear file organization, naming conventions
6. **Production Ready** - Monitoring, logging, CI/CD, deployment checklist

Execute this brief systematically following the implementation phases. Each phase builds upon the previous, creating a solid foundation before adding features.

**BUILD WITH EXCELLENCE!**
