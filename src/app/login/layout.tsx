import type { Metadata, Viewport } from "next";

/**
 * The login route's head contract — REF's platform-shell distribution
 * (measured live, docs/remediation-plan-session26.md): absolute "Eon HR"
 * title, theme-color #000000, manifest + apple-touch-icon links, og:image
 * with width/height/alt, twitter:image:alt, and the 3rd JSON-LD script
 * (BreadcrumbList Home → login). The page itself is a client component —
 * metadata must live in this server layout.
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

export default function LoginLayout({ children }: { children: React.ReactNode }) {
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
      {children}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    </>
  );
}
