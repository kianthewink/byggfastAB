import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./lib/auth/token";

/**
 * Gates the admin panel only — everything under / is the public BOFAST site
 * and must stay reachable without a session.
 *
 * This is an optimistic check: a fast redirect for unauthenticated requests
 * before they hit a Server Component/Action. The real authorization boundary
 * is verifySession() in lib/auth/dal.ts, called from every admin page and
 * mutation. See the Next.js authentication guide's "Optimistic checks with
 * Proxy" section for why proxy alone isn't sufficient.
 */
export default async function proxy(request: NextRequest) {
  // The login page is the one admin route that must stay open, otherwise
  // signing in would redirect to itself forever.
  if (request.nextUrl.pathname === "/administrator/logga-in") {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    return NextResponse.redirect(new URL("/administrator/logga-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/administrator/:path*"],
};
