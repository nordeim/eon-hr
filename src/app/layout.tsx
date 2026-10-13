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

/** REF's two app-route JSON-LD schemas (WebSite + Organization). */
function JsonLdScripts({ origin }: { origin: string }) {
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
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
 */
const THEME_BOOT = `(function(){try{
if(localStorage.getItem("darkMode")==="true"){document.documentElement.classList.add("dark");}
if(localStorage.getItem("app_lang")==="ar"){document.documentElement.setAttribute("dir","rtl");}
}catch(e){}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  const origin = `${proto}://${host}`;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body className="font-sans antialiased">
        <ToastProvider>{children}</ToastProvider>
        <JsonLdScripts origin={origin} />
      </body>
    </html>
  );
}
