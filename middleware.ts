import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Canonical domain redirect
  if (url.hostname === 'engelsizforum.miracdeveloper.com.tr') {
    url.hostname = 'engelsizforum.com';
    return NextResponse.redirect(url, 301);
  }

  // Bypass session middleware for API routes to prevent stream transformation and keep SSE/MCP connections clean
  if (url.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets like .svg, .png, .jpg, .ico, .webm, .html
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm|mp3|wav|html)$).*)',
  ],
};

