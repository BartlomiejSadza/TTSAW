import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyCSRFProtection } from '@/lib/csrf';

const publicRoutes = ['/login', '/register', '/api/auth', '/api/register', '/api/seed', '/api/health', '/api/rooms'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CSRF Protection for mutating requests
  const csrfCheck = verifyCSRFProtection(request);
  if (!csrfCheck.safe) {
    return NextResponse.json(
      { error: 'CSRF validation failed', reason: csrfCheck.reason },
      { status: 403 }
    );
  }

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for auth session token
  const sessionToken = request.cookies.get('authjs.session-token') ||
                       request.cookies.get('__Secure-authjs.session-token');

  if (!sessionToken) {
    // For API routes, return JSON error instead of redirect
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
