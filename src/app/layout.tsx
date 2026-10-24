import type { Metadata } from "next";
import { headers } from "next/headers";
import { ToastProvider } from "@/components/ui/toast";
import { Base44EditBadge } from "@/components/shared/base44-edit-badge";
import "./globals.css";

// No next/font: the reference app renders Tailwind v4's default
// ui-sans-serif stack (session-4 measurement) — see globals.css.

/**
 * metadataBase derives from the request host (x-forwarded-proto + host) so
 * every relative metadata URL (canonical, og:url, og:image) resolves
 * against the ACTUAL serving origin — byte-structural parity with REF's
 * absolute URLs, self-consistent on any deployment (localhost:3200, a
 * production domain, ...). Verified live in parity round 25.
 */
export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  return {
    metadataBase: new URL(`${proto}://${host}`),
    title: {
      default: "Eon HR",
      template: "%s | Eon HR",
    },
    description:
      "Eon HR — modern HR management: employees, payroll, recruitment, training, compliance, performance, analytics.",
    // Session 73 (R73-C): the PWA manifest-linkage completion. The r72
    // census claimed every-page manifest linkage; measured FALSE — the
    // link lived only in the login layout, so the whole authed shell (61
    // routes) served zero <link rel="manifest"> while the service worker
    // registered on every page. Chrome's installability criteria need the
    // link on the page being installed. Next's metadata resolution
    // inherits per-field: every route that does not set its own manifest
    // / icons (none do, and login's own values are identical) carries
    // these from the root. Non-visual head elements — zero rendered
    // bytes. Pinned RED-first by
    // tests/e2e/session73-pwa-linkage.spec.ts (R73-Ca/b).
    manifest: "/manifest.json",
    icons: {
      icon: "/icon-192.png",
      apple: "/apple-touch-icon.png",
    },
    openGraph: {
      type: "website",
      siteName: "Eon HR",
      images: [{ url: "/og-image.png" }],
    },
    twitter: {
      card: "summary_large_image",
      images: [{ url: "/og-image.png" }],
    },
  };
}

/** REF's two app-route JSON-LD schemas (WebSite + Organization).
 *  Session 70 (R70-B): the nonce — CSP's script-src applies to
 *  non-executable script types too (a browser blocks an un-nonced
 *  application/ld+json block under a nonce policy), so the JSON-LD
 *  blocks carry the same per-request nonce the middleware minted. */
function JsonLdScripts({ origin, nonce }: { origin: string; nonce?: string }) {
  const website = {
    name: "Eon HR",
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: origin,
  };
  const organization = {
    name: "Eon HR",
    logo: `${origin}/eon-logo.png`,
    "@context": "https://schema.org",
    "@type": "Organization",
  };
  return (
    <>
      <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
      <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
    </>
  );
}

/**
 * Session 33 (R32-A/R32-B): the pre-paint theme boot. REF persists its
 * dark mode (localStorage darkMode="true") and RTL mode (app_lang="ar")
 * and re-applies both on every load before first paint — verified by
 * reload on the live reference (html.dark survives; the sidebar flips
 * right). This inline script mirrors that contract for the SSR clone:
 * it runs in <head> before any rendering, so there is no flash of the
 * wrong theme. The Moon/عربي handlers in the sidebar write the same
 * keys, so the three writers (boot script, Moon, عربي) never disagree.
 *
 * Session 40 (R39-B): the login skip. REF's login is THEME-INERT —
 * live-probed with darkMode="true" armed: the key survives in storage
 * but html.dark never applies (and dir stays ltr with app_lang="ar").
 * REF's login build ships no theme boot at all; the app pages boot from
 * the same keys after sign-in (verified: both apps hand off to a dark
 * /dashboard). The early return mirrors that split for the SSR clone,
 * where /login shares this root layout.
 */
const THEME_BOOT = `(function(){try{
if(location.pathname==="/login"){return;}
if(localStorage.getItem("darkMode")==="true"){document.documentElement.classList.add("dark");}
if(localStorage.getItem("app_lang")==="ar"){document.documentElement.setAttribute("dir","rtl");document.documentElement.setAttribute("lang","ar");}
}catch(e){}})();`;

/**
 * Session 72 (R72-A): the Trusted-Types default-policy bootstrap — the
 * pass-through 'default' policy paired with the CSP's `trusted-types
 * default` + `require-trusted-types-for 'script'` directives (see
 * src/lib/csp.ts). Rendered FIRST in <head> (before THEME_BOOT and
 * before the flight-data inline scripts parse), so the policy exists
 * before any client-side mount could write a DOM-XSS sink. A default
 * policy auto-wraps plain strings at every Trusted-Types sink; the
 * pass-through is the HONEST scope — the rung's value is the
 * enforcement machinery + the policy-NAME control (`trusted-types
 * default` forbids creating any other policy name), not sanitizing:
 * the whole source reads zero raw innerHTML/insertAdjacentHTML/
 * document.write sinks and exactly five dangerouslySetInnerHTML
 * members, every one server-rendered, constant-authored and nonced.
 * Feature-detected (Chromium enforces; other engines ignore the
 * directives and never reach the createPolicy call).
 * PRODUCTION-ONLY render: dev's Turbopack pipeline injects scripts
 * and evals that would trip the enforcement (the mirror of the
 * dev-only script-src 'unsafe-eval' allowance).
 */
const TT_BOOT = `(function(){try{
if(window.trustedTypes&&trustedTypes.createPolicy){trustedTypes.createPolicy('default',{createHTML:function(s){return s;},createScript:function(s){return s;},createScriptURL:function(s){return s;}});}
}catch(e){}})();`;

/**
 * Session 72 (R72-B): the service-worker registration for the offline
 * shell (public/sw.js — the static-shell cache + the never-cache-HTML
 * navigation design). Registered after the page 'load' event so it
 * never competes with first paint, and NONCED (script-src gates inline
 * scripts; the CSP3 auto-nonce covers the chunks Next renders, this
 * authored one carries the explicit attribute like THEME_BOOT).
 * PRODUCTION-ONLY render: in dev the worker would cache-serve stale
 * Turbopack chunks and break fast-refresh; the E2E suite and the
 * standalone servers run the production build, dev stays worker-free.
 */
const SW_REGISTRATION = `(function(){try{
if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});});}
}catch(e){}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  const origin = `${proto}://${host}`;
  // Session 70 (R70-B): the middleware's per-request nonce for the
  // CSP pipeline — stamped on this layout's own inline scripts (Next
  // auto-nonces the scripts IT renders from the request CSP header;
  // authored inline scripts need the explicit attribute). Undefined
  // when no middleware ran (no CSP → no nonce needed — the pairing
  // stays consistent).
  const nonce = h.get("x-nonce") ?? undefined;
  // Session 72: both boot scripts are PRODUCTION-ONLY (dev's Turbopack
  // pipeline would trip the TT enforcement and cache-serve stale
  // chunks through the worker).
  const isProd = process.env.NODE_ENV === "production";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {isProd && <script nonce={nonce} dangerouslySetInnerHTML={{ __html: TT_BOOT }} />}
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        {isProd && <script nonce={nonce} dangerouslySetInnerHTML={{ __html: SW_REGISTRATION }} />}
      </head>
      <body className="font-sans antialiased">
        <ToastProvider>{children}</ToastProvider>
        {/* Session 85 (R85-B): the reference's platform-injected "Edit
            with Base44" badge — fixed bottom-right on every page (the
            root-layout mount covers login + the authed shell + mobile,
            matching the REF's app-wide injection). See
            src/components/shared/base44-edit-badge.tsx. */}
        <Base44EditBadge />
        <JsonLdScripts origin={origin} nonce={nonce} />
      </body>
    </html>
  );
}
