import { NextResponse, type NextRequest } from "next/server";
import { buildCsp } from "@/lib/csp";

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
 * Session 70 (R70-B): the CSP nonce pipeline. Every matched DOCUMENT
 * route now gets a per-request nonce: the CSP is set on the REQUEST
 * headers (Next.js reads the nonce from the request CSP header and
 * stamps it on every script it renders — the documented auto-nonce
 * mechanism) and on the response. The matcher was widened to include
 * /login + /logout (documents with scripts — they need the policy too);
 * the auth-redirect below is explicitly scoped to skip them (the auth
 * endpoints must stay reachable while logged out). The API routes, the
 * _next internals, and dot-files (static assets, /sitemap.xml,
 * /robots.txt) stay unmatched — CSP is a document policy, and those
 * surfaces keep riding the r69 5-header set from next.config.ts.
 */
const SESSION_COOKIE = "eon_session";
const AUTH_PATHS = new Set(["/login", "/logout"]);

export default function proxy(req: NextRequest) {
  // R70-B: the CSP nonce pipeline — one nonce per request, the strict
  // 'self' baseline (the app loads zero external resources), and the
  // dev-only allowances (fast-refresh eval + the HMR websocket).
  const nonce = crypto.randomUUID();
  const csp = buildCsp(nonce, process.env.NODE_ENV !== "production");
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("Content-Security-Policy", csp);

  // R55-C: the auth guard — scoped past the auth pages now that the
  // matcher includes them.
  if (AUTH_PATHS.has(req.nextUrl.pathname)) return res;
  if (req.cookies.has(SESSION_COOKIE)) return res;

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
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
