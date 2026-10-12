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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  const origin = `${proto}://${host}`;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ToastProvider>{children}</ToastProvider>
        <JsonLdScripts origin={origin} />
      </body>
    </html>
  );
}
