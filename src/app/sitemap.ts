import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { buildSitemap } from "@/lib/sitemap-routes";

// Session-70 (R70-A): the sitemap parity route. The live REF serves its
// sitemap at /sitemap.xml (the 61-entry registry set — measured live,
// session-70); the clone had no sitemap route at all. This metadata route
// serves the same registry (62 entries: REF's 61-URL mirror + the clone's
// canonical /dashboard) with REF's structure (weekly / 1.0 root / 0.8
// routes / no lastmod).
//
// The origin resolves against the ACTUAL serving host (x-forwarded-proto +
// host) — the same headers()-derived origin the root layout's metadataBase
// uses for the canonical/og URLs — so the sitemap is self-consistent on
// any deployment (localhost:3200, a production domain, ...) exactly like
// the per-route canonicals. Reading headers() makes the route dynamic
// (rendered on demand by the standalone server).

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  return buildSitemap(`${proto}://${host}`);
}
