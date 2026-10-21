import type { Metadata } from "next";
import { headers } from "next/headers";
import { ToastProvider } from "@/components/ui/toast";
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
    icons: { icon: "/icon-192.png" },
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
if(localStorage.getItem("app_lang")==="ar"){document.documentElement.setAttribute("dir","rtl");}
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

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body className="font-sans antialiased">
        <ToastProvider>{children}</ToastProvider>
        <JsonLdScripts origin={origin} nonce={nonce} />
      </body>
    </html>
  );
}
