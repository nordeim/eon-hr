import { NextResponse, type NextRequest } from "next/server";

/**
 * Session 55 (R55-C): the edge auth guard — REF's logged-out guard
 * carries the REQUESTED URL as the login's from_url param
 * (`/login?from_url=https://eon.base44.app/settings` — live-measured in
 * the r55 census, phase D), so the sign-in round-trip returns the user
 * to the page they asked for. The clone's (app) layout guard can't know
 * the current path (App Router layouts receive no pathname), so it
 * hardcoded `from_url=/dashboard` for every route — the deep link was
 * lost. This proxy (Next 16's middleware convention — `src/proxy.ts`)
 * does the path-carrying redirect at the edge, BEFORE routing.
 *
 * Two-tier design: the proxy checks cookie PRESENCE only (cheap,
 * edge-safe); the (app) layout keeps the full HMAC + DB verification as
 * defense-in-depth for present-but-INVALID cookies (its hardcoded
 * from_url=/dashboard is the sensible recovery target there).
 *
 * The matcher excludes /login, /logout, /api, Next internals, and
 * dot-files — the auth endpoints themselves must stay reachable while
 * logged out (the rate-limited login flow, the logout navigation).
 */
const SESSION_COOKIE = "eon_session";

export default function proxy(req: NextRequest) {
  if (req.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  /* The from_url is built on the REQUEST's own authority (the Host
   * header — what the browser actually used), not req.nextUrl's
   * re-derived origin: the r55 census found the two can spell the host
   * differently (localhost vs 127.0.0.1 in standalone mode), and the
   * login's resolver checks the param against the browser's own
   * location.origin — a mismatch would silently drop the round-trip. */
  const host = req.headers.get("host") ?? req.nextUrl.host;
  const origin = `${req.nextUrl.protocol}//${host}`;
  const login = new URL("/login", origin);
  // REF's format: the FULL absolute URL of the request (the login's
  // resolver — src/lib/login-redirect.ts — accepts same-origin absolute
  // URLs and extracts the path; foreign or malformed values are ignored)
  const requested = new URL(req.nextUrl.pathname + req.nextUrl.search, origin);
  login.searchParams.set("from_url", requested.toString());
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/((?!api|login|logout|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
