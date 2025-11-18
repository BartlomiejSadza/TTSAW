// CSRF Protection Helper
// NextAuth has built-in CSRF protection for auth endpoints
// This adds additional protection for other mutating endpoints

import { NextRequest } from 'next/server';

/**
 * Verify CSRF protection for mutating requests (POST, PUT, PATCH, DELETE)
 *
 * NextAuth's CSRF protection:
 * - Auth endpoints (/api/auth/*) are protected by NextAuth's built-in CSRF tokens
 * - NextAuth uses the 'next-auth.csrf-token' cookie
 *
 * Additional protection:
 * - Same-Site cookies (set by NextAuth) prevent CSRF attacks
 * - Origin/Referer header verification
 * - Custom CSRF token for non-auth endpoints (if needed)
 *
 * @param request - The Next.js request object
 * @returns true if request is safe, false otherwise
 */
export function verifyCSRFProtection(request: NextRequest): {
  safe: boolean;
  reason?: string;
} {
  const method = request.method;

  // Safe methods don't need CSRF protection
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return { safe: true };
  }

  // Check for auth endpoints (protected by NextAuth)
  if (request.nextUrl.pathname.startsWith('/api/auth/')) {
    return { safe: true };
  }

  // Verify Origin or Referer header matches host
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');

  if (!origin && !referer) {
    // No origin/referer - likely not a browser request
    // Allow for API clients, but this could be stricter
    return { safe: true };
  }

  // Extract hostname from origin or referer
  let requestOrigin: string | null = null;

  if (origin) {
    try {
      requestOrigin = new URL(origin).host;
    } catch {
      return { safe: false, reason: 'Invalid origin header' };
    }
  } else if (referer) {
    try {
      requestOrigin = new URL(referer).host;
    } catch {
      return { safe: false, reason: 'Invalid referer header' };
    }
  }

  // Verify origin matches host
  if (requestOrigin && host && requestOrigin !== host) {
    return {
      safe: false,
      reason: `Origin mismatch: ${requestOrigin} !== ${host}`,
    };
  }

  return { safe: true };
}

/**
 * Check if request has valid session cookies
 * This provides additional CSRF protection via SameSite cookies
 */
export function hasValidSessionCookie(request: NextRequest): boolean {
  const sessionToken = request.cookies.get('authjs.session-token') ||
                       request.cookies.get('__Secure-authjs.session-token');

  return !!sessionToken;
}

/**
 * CSRF Protection Status
 *
 * Current implementation:
 * 1. ✅ NextAuth built-in CSRF tokens for auth endpoints
 * 2. ✅ SameSite cookies (set by NextAuth) - primary defense
 * 3. ✅ Origin/Referer header verification
 * 4. ⚠️  Custom CSRF tokens for API endpoints (optional enhancement)
 *
 * Security note:
 * Modern browsers with SameSite cookies provide strong CSRF protection.
 * Origin/Referer verification adds an additional layer.
 * For maximum security in older browsers, implement custom CSRF tokens.
 */
export const csrfStatus = {
  protected: true,
  mechanisms: [
    'NextAuth CSRF tokens',
    'SameSite cookies',
    'Origin/Referer verification',
  ],
  notes: 'Strong CSRF protection for modern browsers. Consider custom tokens for legacy browser support.',
};
