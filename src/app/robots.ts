import type { MetadataRoute } from "next";
import { headers } from "next/headers";

// Session-70 (R70-A): the dynamic robots. REF's robots.txt declares its
// sitemap (Sitemap: https://eon.base44.app/sitemap.xml); the clone's old
// static public/robots.txt carried no Sitemap directive (deleted in this
// round — a static file would shadow this route). The dynamic route adds
// the directive with the serving-origin resolution (the same
// headers()-derived origin the sitemap itself uses) while KEEPING the
// clone's "Disallow: /api/" — the production-grade superset member REF
// lacks (the API is not for crawlers; the page routes are).

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${proto}://${host}/sitemap.xml`,
  };
}
