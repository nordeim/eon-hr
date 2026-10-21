import { describe, it, expect } from "vitest";
import { readdirSync } from "node:fs";
import path from "node:path";
import { APP_ROUTES, buildSitemap } from "@/lib/sitemap-routes";

// Session-70 (R70-A) — the SEO-surface seam pins.
//
// The registry must be exactly the real route tree (the (app) directory
// set), so a new route without a registry member fails this gate and the
// sitemap can never silently drift from the filesystem. The builder must
// reproduce REF's structural contract (measured live, session-70,
// docs/ref-sitemap-r70.xml): the root index at priority 1.0, every app
// route at 0.8, all changefreq weekly, no lastmod.

describe("R70-A: the sitemap route registry", () => {
  it("APP_ROUTES is exactly the (app) route tree — no member missing, none invented", () => {
    const appDir = path.resolve(import.meta.dirname, "../../src/app/(app)");
    const onDisk = readdirSync(appDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => `/${e.name}`)
      .sort();
    expect([...APP_ROUTES].sort()).toEqual(onDisk);
  });

  it("the registry is slug-clean: leading slash, lowercase, no duplicates", () => {
    expect(new Set(APP_ROUTES).size).toBe(APP_ROUTES.length);
    for (const r of APP_ROUTES) {
      expect(r.startsWith("/")).toBe(true);
      expect(r, `${r} must be lowercase`).toBe(r.toLowerCase());
      expect(r).not.toMatch(/\s/);
    }
  });

  it("the registry carries the REF-mirror members (the 60-route set) + the /dashboard superset", () => {
    // REF's sitemap list (docs/ref-sitemap-r70.xml), lowercased to the
    // clone's canonical form — every one must be a registry member.
    const refRoutes = [
      "advancedanalytics", "allleaverequests", "analytics", "assets",
      "attendance", "careers", "chat", "communications", "companywall",
      "compliancedashboard", "employeedetail", "employeeportal",
      "employeeselfservice", "employees", "evaluations", "expenses",
      "externaljobapplication", "hrassistant", "hrassistantchat",
      "hrletters", "home", "interviewassistant", "leavemanagement",
      "loans", "offboarding", "organizationsetup", "organogram",
      "payroll", "payrollai", "payrollreports", "performancemanagement",
      "profile", "recruitment", "reports", "securitysettings", "settings",
      "surveys", "taskmanager", "templates", "tenantsetup", "training",
      "workflowautomation", "staffrequests", "requestreports",
      "requestsettings", "shiftswap", "announcements",
      "recruitmentkanban", "dynamicdashboard", "workflowconfigpage",
      "hrreports", "notificationpreferences", "analyticsdashboard",
      "surveyanalytics", "attendancedashboard", "assetmanagement",
      "payrollmodule", "documenttracker", "payrollengine",
      "shiftcalendar",
    ].map((s) => `/${s}`);
    for (const r of refRoutes) {
      expect(APP_ROUTES, `${r} (the REF mirror)`).toContain(r);
    }
    // The one-entry superset: the clone's canonical dashboard route.
    expect(APP_ROUTES).toContain("/dashboard");
    // 60 REF routes + /dashboard = 61.
    expect(APP_ROUTES.length).toBe(61);
  });
});

describe("R70-A: buildSitemap (REF's structural contract)", () => {
  const entries = buildSitemap("https://example.test");

  it("serves 62 entries: the root index + the 61 app routes", () => {
    expect(entries.length).toBe(62);
    expect(entries[0]!.url).toBe("https://example.test/");
  });

  it("the root at priority 1.0 + weekly; every app route at 0.8 + weekly", () => {
    expect(entries[0]!.priority).toBe(1);
    expect(entries[0]!.changeFrequency).toBe("weekly");
    for (const e of entries.slice(1)) {
      expect(e.priority).toBe(0.8);
      expect(e.changeFrequency).toBe("weekly");
    }
  });

  it("no lastmod anywhere (REF serves none)", () => {
    for (const e of entries) {
      expect(e.lastModified).toBeUndefined();
    }
  });

  it("the URLs are origin-joined with the registry slugs", () => {
    const urls = entries.slice(1).map((e) => new URL(e.url!).pathname);
    expect(urls).toEqual([...APP_ROUTES]);
  });
});
