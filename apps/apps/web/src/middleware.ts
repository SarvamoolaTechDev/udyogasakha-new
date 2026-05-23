import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require a valid JWT cookie
const PROTECTED = ['/profile', '/post', '/moderator', '/notifications', '/settings'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('udyoga_token')?.value;

  const isProtected = PROTECTED.some(p => pathname === p || pathname.startsWith(p + '/'));

  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
