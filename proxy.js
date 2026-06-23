import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function proxy(req) {
  // Skip auth in development so you can test without a token
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  // Already has a valid session cookie → let through
  const session = req.cookies.get('mcp_session')?.value;
  if (session) {
    try {
      jwt.verify(session, process.env.MCP_SECRET);
      return NextResponse.next();
    } catch {}
  }

  // First visit → must have a valid JWT token in the URL
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    jwt.verify(token, process.env.MCP_SECRET);

    // Valid → set session cookie, good for 1 hour
    const res = NextResponse.next();
    res.cookies.set('mcp_session', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      maxAge: 60 * 60,
    });
    return res;
  } catch {
    return new Response('Unauthorized', { status: 401 });
  }
}

export const config = {
  matcher: ['/chat/:path*'],
};
