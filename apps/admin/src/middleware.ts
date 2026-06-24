import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const PUBLIC = ['/login', '/forgot-password', '/reset-password'];
  if (PUBLIC.some(p => pathname === p || pathname.startsWith(p + '/'))) return NextResponse.next();

  const token = req.cookies.get('udyoga_admin_token')?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
