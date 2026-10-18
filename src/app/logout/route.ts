import { NextResponse } from "next/server";

import { clearSessionCookie } from "@/lib/auth";

/**
 * Session 55 (R55-D): REF's logout carries the CURRENT page's URL as the
 * login's from_url param — `/login?from_url=https://eon.base44.app/settings`
 * when logging out from /settings (live-measured in the r55 census, phase
 * F) — so the next sign-in returns the user to where they were. The
 * clone's logout dropped the context (a plain /login redirect).
 *
 * The Referer header is the carrier: the user menu's Logout navigates via
 * `window.location.href = "/logout"` (a full document navigation — the
 * anti-prefetch contract, R35-A6), so the browser attaches the current
 * page as Referer. Only SAME-ORIGIN referers pass through (a foreign or
 * absent Referer lands on the plain /login — never an open redirect).
 *
 * The redirect target is built on the REFERER's own origin when it
 * matches (guaranteed to be the origin the browser is actually on —
 * the r55 instrument's localhost/127.0.0.1 note: req.url's origin can
 * be re-derived differently from the requested Host in standalone
 * mode), with the Host-header cross-check accepting either spelling.
 */
function loginTarget(req: Request): URL {
  const reqUrl = new URL(req.url);
  const host = req.headers.get("host");
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      const ref = new URL(referer);
      const sameOrigin = ref.origin === reqUrl.origin || (!!host && ref.host === host);
      if (sameOrigin) {
        const login = new URL("/login", ref.origin);
        login.searchParams.set("from_url", ref.toString());
        return login;
      }
    } catch {
      /* malformed referer — fall through to the plain login */
    }
  }
  return new URL("/login", reqUrl.origin);
}

export async function GET(req: Request) {
  const res = NextResponse.redirect(loginTarget(req), { status: 303 });
  await clearSessionCookie();
  return res;
}

export async function POST(req: Request) {
  const res = NextResponse.redirect(loginTarget(req), { status: 303 });
  await clearSessionCookie();
  return res;
}
