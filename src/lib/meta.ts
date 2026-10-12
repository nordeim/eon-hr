import type { Metadata } from "next";

/**
 * Per-route SEO metadata — the REF (https://eon.base44.app) head contract,
 * measured live in parity round 25 (docs/remediation-plan-session26.md).
 *
 * REF's base44 builder generates page SEO mechanically from the route slug:
 *   title:  "<Slug capitalized> | Eon HR"   (/taskmanager → "Taskmanager | Eon HR"
 *                                          — NOT the human "Tasks & Projects")
 *   description: "<Slug> on Eon HR. <base>"
 *   og: title/description/image/url/type/site_name (6 per app route)
 *   twitter: card/title/description/image (5; REF's twitter:url is not a
 *   standard Card tag — scrapers fall back to og:url — documented non-goal)
 *   canonical: the route's URL
 *
 * Divergences (documented in the plan): the description base copy is the
 * clone's own (REF's is leftover OnboardFlow-template junk), assets are
 * self-hosted (REF's live on base44's supabase), and the dashboard titles
 * absolutely ("Eon HR" — REF serves its dashboard at "/").
 */

export const SITE_NAME = "Eon HR";

export const BASE_DESCRIPTION =
  "Eon HR — modern HR management: employees, payroll, recruitment, training, compliance, performance, analytics.";

/** The dashboard + login special case: REF titles them the plain site name. */
const PLAIN_TITLE_ROUTES = new Set(["/dashboard"]);

const humanize = (slug: string) => slug.charAt(0).toUpperCase() + slug.slice(1);

/**
 * Build a route's Metadata per REF's mechanical rules. `route` is the
 * pathname segment ("/employees"). Titles ride the root layout's
 * "%s | Eon HR" template; canonical/og URLs are relative so the root
 * layout's headers()-derived metadataBase resolves them against the actual
 * serving origin.
 */
export function pageMetadata(route: string): Metadata {
  const name = humanize(route.slice(1));
  const isPlain = PLAIN_TITLE_ROUTES.has(route);
  const title = isPlain ? { absolute: SITE_NAME } : name;
  const description = `${name} on ${SITE_NAME}. ${BASE_DESCRIPTION}`;

  return {
    title,
    description,
    alternates: { canonical: route },
    openGraph: {
      // type + siteName are repeated per-route: Next's metadata resolution
      // REPLACES the parent's openGraph object with the child's — the
      // root-level defaults alone would vanish (verified live, round 25)
      type: "website",
      siteName: "Eon HR",
      title: isPlain ? SITE_NAME : `${name} | ${SITE_NAME}`,
      description,
      url: route,
      images: [{ url: "/og-image.png" }],
    },
    twitter: {
      card: "summary_large_image",
      title: isPlain ? SITE_NAME : `${name} | ${SITE_NAME}`,
      description,
      images: [{ url: "/og-image.png" }],
    },
  };
}
