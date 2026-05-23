import { NextRequest, NextResponse } from 'next/server';

/**
 * Sample middleware for authentication
 * In production, integrate with Supabase Auth
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  // Protected routes
  const protectedRoutes = ['/dashboard', '/admin', '/api/wallet', '/api/withdrawals'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /* Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
