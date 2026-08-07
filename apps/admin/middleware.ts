import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminToken } from './lib/auth';

// Node runtime required — jsonwebtoken (used by verifyAdminToken) doesn't run on Edge.
export const runtime = 'nodejs';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  const isLoginPage = request.nextUrl.pathname === '/login';

  // Previously only checked that a cookie existed — an expired or tampered
  // token still passed through. Now actually verifies signature + expiry.
  const payload = token ? verifyAdminToken(token) : null;

  if (!payload && !isLoginPage) {
    const res = NextResponse.redirect(new URL('/login', request.url));
    res.cookies.delete('admin_token');
    return res;
  }

  if (payload && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
