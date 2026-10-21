import type { MetadataRoute } from "next";

/**
 * The canonical app-route registry for the sitemap (session-70, R70-A).
 *
 * The live REF serves its sitemap as a 61-entry URL set (measured via
 * curl, session-70; saved as docs/ref-sitemap-r70.xml): "/" at priority
 * 1.0 + its 60 app routes at 0.8, every one <changefreq>weekly</changefreq>,
 * no <lastmod>. The clone serves the SAME registry — the session-32
 * complete 61-page set, in the clone's canonical lowercase form (the
 * form every page's <link rel=canonical> points at) — plus "/dashboard"
 * as the one-entry superset: REF omits a dashboard entry only because
 * its dashboard IS "/" (the platform maps index → dashboard), while the
 * clone's canonical dashboard route is the real /dashboard page (the
 * R51-A /Dashboard case-alias + the R55-B "/" rewrite both serve it).
 *
 * The registry is pinned against the actual route tree by
 * tests/unit/seo-surface.test.ts (readdirSync comparison) — a new (app)
 * route without a registry member fails the unit gate, so the sitemap
 * can never silently drift from the filesystem.
 */
export const APP_ROUTES: readonly string[] = [
  "/advancedanalytics",
  "/allleaverequests",
  "/analytics",
  "/analyticsdashboard",
  "/announcements",
  "/assetmanagement",
  "/assets",
  "/attendance",
  "/attendancedashboard",
  "/careers",
  "/chat",
  "/communications",
  "/companywall",
  "/compliancedashboard",
  "/dashboard",
  "/documenttracker",
  "/dynamicdashboard",
  "/employeedetail",
  "/employeeportal",
  "/employees",
  "/employeeselfservice",
  "/evaluations",
  "/expenses",
  "/externaljobapplication",
  "/home",
  "/hrassistant",
  "/hrassistantchat",
  "/hrletters",
  "/hrreports",
  "/interviewassistant",
  "/leavemanagement",
  "/loans",
  "/notificationpreferences",
  "/offboarding",
  "/organizationsetup",
  "/organogram",
  "/payroll",
  "/payrollai",
  "/payrollengine",
  "/payrollmodule",
  "/payrollreports",
  "/performancemanagement",
  "/profile",
  "/recruitment",
  "/recruitmentkanban",
  "/reports",
  "/requestreports",
  "/requestsettings",
  "/securitysettings",
  "/settings",
  "/shiftcalendar",
  "/shiftswap",
  "/staffrequests",
  "/surveyanalytics",
  "/surveys",
  "/taskmanager",
  "/templates",
  "/tenantsetup",
  "/training",
  "/workflowautomation",
  "/workflowconfigpage",
];

/** REF's structural contract: the root index at 1.0, every app route at
 *  0.8, all weekly, no lastmod. 62 entries total (the root + the 61). */
export function buildSitemap(origin: string): MetadataRoute.Sitemap {
  return [
    { url: `${origin}/`, changeFrequency: "weekly", priority: 1 },
    ...APP_ROUTES.map((route) => ({
      url: `${origin}${route}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
