import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";

/**
 * The login route's head contract — REF's platform-shell distribution
 * (measured live, docs/remediation-plan-session26.md): absolute "Eon HR"
 * title, theme-color #000000, manifest + apple-touch-icon links, og:image
 * with width/height/alt, twitter:image:alt, and the 3rd JSON-LD script
 * (BreadcrumbList Home → login). The page itself is a client component —
 * metadata must live in this server layout.
 *
 * Session 71 (R71-A): this layout is now ASYNC — it reads the proxy's
 * per-request nonce (`x-nonce`, the same mechanism as the root layout)
 * and stamps it on BOTH inline blocks it renders:
 *   1. the BreadcrumbList JSON-LD below — the r70 pipeline nonced the
 *      ROOT layout's two JSON-LD blocks but MISSED this one (the r71
 *      delta audit, curl-verified: a bare <script type=application/ld+json>
 *      blocked silently — CSP gates non-executable types too);
 *   2. the session-45 focus-cascade <style> mirror MOVED here from the
 *      client page (a client component cannot read headers(); the
 *      element-side style-src-elem hardening needs the nonce). Rendered
 *      BEFORE {children}, it still lands in the body AFTER the head
 *      <link> stylesheets — the winning cascade position is preserved
 *      (no precedence prop, so React 19 keeps it in place).
 */
export const metadata: Metadata = {
  title: { absolute: "Eon HR" },
  description:
    "Eon HR — modern HR management: employees, payroll, recruitment, training, compliance, performance, analytics.",
  alternates: { canonical: "/login" },
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Eon HR",
    title: "Eon HR",
    description:
      "Eon HR — modern HR management: employees, payroll, recruitment, training, compliance, performance, analytics.",
    url: "/login",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Eon HR",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eon HR",
    description:
      "Eon HR — modern HR management: employees, payroll, recruitment, training, compliance, performance, analytics.",
    images: [
      {
        url: "/og-image.png",
        alt: "Eon HR",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

// REF's runtime focus-cascade mirror (session-45): the platform
// injects a second Tailwind stylesheet INLINE (after the linked one) on
// the login — its two plain-focus rules sit at equal specificity but
// later in document order than the linked focus-visible ring rule, so
// they WIN: the keyboard-focused inputs render the slate-400 ring,
// while the Sign in's token ring is untouched (the button's tail carries
// no plain-focus ring member). Moved from the client page to this server
// layout in session-71 for the CSP nonce (style-src-elem gates <style>
// ELEMENTS; a plain style tag — no precedence prop, so React 19 keeps it
// in the body, after the head links — reproduces the same winning
// cascade position).
const FOCUS_CASCADE_MIRROR = `.focus\\:border-slate-400:focus{--tw-border-opacity:1;border-color:rgb(148 163 184 / var(--tw-border-opacity, 1))}.focus\\:ring-slate-400:focus{--tw-ring-opacity:1;--tw-ring-color:rgb(148 163 184 / var(--tw-ring-opacity, 1))}`;

export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  // Session 71 (R71-A): the middleware's per-request nonce — undefined
  // when no middleware ran (no CSP → no nonce needed), exactly like the
  // root layout's pairing.
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "/" },
      { "@type": "ListItem", position: 2, name: "login", item: "/login" },
    ],
  };
  return (
    <>
      <style nonce={nonce} dangerouslySetInnerHTML={{ __html: FOCUS_CASCADE_MIRROR }} />
      {children}
      <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    </>
  );
}
