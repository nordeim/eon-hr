/**
 * Session-5 parity recipe contracts — pins the reference-measured class
 * recipes in the shell/header components. Every value below was measured
 * live against https://eon.base44.app (dual agent-browser sessions, DOM
 * ground truth: computed styles + bounding boxes; see
 * docs/remediation-plan-session5.md).
 *
 * If a recipe drifts from the reference contract, this test fails.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (...p: string[]) =>
  readFileSync(join(process.cwd(), ...p), "utf8");

const sidebarNav = read("src", "components", "layout", "sidebar-nav.tsx");
const appShell = read("src", "components", "layout", "app-shell.tsx");
const pageHeader = read("src", "components", "shared", "page-header.tsx");

/** Route -> (layout recipe, badge icon class) — reference-measured map. */
const BADGE_PAGES: Record<
  string,
  { layout: string; icon: string }
> = {
  "/taskmanager": { layout: "raised-48", icon: "text-blue-600" },
  "/payroll": { layout: "raised-48", icon: "text-green-600" },
  "/expenses": { layout: "raised-48", icon: "text-purple-600" },
  "/leavemanagement": { layout: "raised-48", icon: "text-blue-600" },
  "/loans": { layout: "raised-36", icon: "text-blue-600" },
  "/allleaverequests": { layout: "flat36", icon: "text-blue-600" },
  "/interviewassistant": { layout: "flat36", icon: "text-purple-600" },
  "/offboarding": { layout: "flat36", icon: "text-blue-600" },
  "/performancemanagement": { layout: "flat36", icon: "text-indigo-600" },
  "/workflowautomation": { layout: "flat36", icon: "text-purple-600" },
  "/communications": { layout: "flat36", icon: "text-purple-600" },
  "/organogram": { layout: "flat36", icon: "text-teal-600" },
  "/hrassistantchat": { layout: "flat36", icon: "text-purple-600" },
  "/settings": { layout: "flat36", icon: "text-blue-600" },
  "/recruitment": { layout: "flat36-sm", icon: "text-indigo-600" },
  "/compliancedashboard": { layout: "flat36-sm", icon: "text-red-600" },
  "/training": { layout: "flat48", icon: "text-purple-600" },
  "/hrletters": { layout: "flat48", icon: "text-indigo-600" },
  "/surveys": { layout: "flat48", icon: "text-teal-600" },
  "/evaluations": { layout: "flat48", icon: "text-indigo-600" },
  "/companywall": { layout: "flat48", icon: "text-blue-600" },
  "/profile": { layout: "flat48", icon: "text-blue-600" },
  "/attendance": { layout: "flat48", icon: "text-blue-600" },
  "/shiftcalendar": { layout: "flat-tight", icon: "text-violet-600" },
  "/documenttracker": { layout: "flat-tight", icon: "text-blue-600" },
};

describe("sidebar-nav reference recipe (session 5)", () => {
  it("leaf links use the measured px-3 py-2.5 gap-3 box with 16px icons", () => {
    expect(sidebarNav).toContain(
      "flex h-8 items-center gap-3 rounded-lg px-3 py-2.5 text-sm"
    );
    expect(sidebarNav).toContain("mb-1");
  });

  it("leaf link icons are 16px (h-4 w-4), not 20px", () => {
    const navLinkBlock = sidebarNav.slice(
      sidebarNav.indexOf("function NavLink"),
      sidebarNav.indexOf("function CollapsibleNavItem")
    );
    expect(navLinkBlock).toContain("h-4 w-4");
    expect(navLinkBlock).not.toContain("h-5 w-5");
  });

  it("leaf hover uses the reference --accent-color #e4e6eb with opacity-80", () => {
    expect(sidebarNav).toContain("hover:bg-[#e4e6eb]");
    expect(sidebarNav).toContain("hover:opacity-80");
    expect(sidebarNav).toContain("transition-all duration-200");
  });

  it("group triggers hover blue-50/blue-700 like the reference", () => {
    expect(sidebarNav).toContain("hover:bg-blue-50");
    expect(sidebarNav).toContain("hover:text-blue-700");
  });

  it("sub-list has the measured 4px top gap (mt-1)", () => {
    expect(sidebarNav).toContain("mt-1 mb-1 flex flex-col gap-1 pl-4");
  });

  it("brand header: px-6 row, 18px slate-900 h2, 12px Demo sub", () => {
    expect(sidebarNav).toContain("px-6 py-6");
    expect(sidebarNav).toMatch(
      /<h2 className="text-lg font-bold[^"]*text-slate-900[^"]*">EonHR<\/h2>/
    );
    expect(sidebarNav).toContain('className="text-xs leading-tight text-muted-foreground"');
  });
});

describe("app-shell mobile chrome recipe (session 5)", () => {
  it("mobile top bar: 28px toggle with 16px icon, h1 brand + Demo sub-line", () => {
    expect(appShell).toContain("h-7 w-7");
    expect(appShell).toMatch(/<PanelLeft className="h-4 w-4"/);
    expect(appShell).toMatch(
      /<h1 className="text-base font-bold text-slate-900">EonHR<\/h1>/
    );
    expect(appShell).toMatch(
      /<p className="text-xs text-slate-500">Demo<\/p>/
    );
  });

  it("mobile content row centers the 40px brand block", () => {
    expect(appShell).toContain("flex items-center gap-4");
  });

  it("bottom tabs: text-sm font-medium labels with blue active state", () => {
    expect(appShell).toContain("text-sm font-medium");
    expect(appShell).toContain("text-blue-600");
    // reference label line-height is 21px (leading-normal), tab height 61
    expect(appShell).toContain("leading-normal");
  });
});

describe("PageHeader reference recipes (session 5)", () => {
  it("badge text span is the measured 14px/500 slate-700", () => {
    expect(pageHeader).toContain(
      "text-sm font-medium leading-5 text-slate-700"
    );
  });

  it("badge icon color is per-page (iconClassName prop, blue default)", () => {
    expect(pageHeader).toContain("iconClassName");
    expect(pageHeader).toContain('"text-blue-600"');
  });

  it("implements the six measured layout recipes", () => {
    for (const layout of [
      "raised-48",
      "raised-36",
      "flat36",
      "flat36-sm",
      "flat48",
      "flat-tight",
    ]) {
      expect(pageHeader).toContain(`"${layout}"`);
    }
    // raised = mt-8 badge (y 64/116); flat = badge at y=32
    expect(pageHeader).toContain("mb-4 mt-8");
    // flat-tight = mb-3 badge + bare h1 + mt-1 subtitle
    expect(pageHeader).toContain("text-slate-600 mt-1");
  });
});

describe("per-page header matrix (session 5)", () => {
  for (const [route, spec] of Object.entries(BADGE_PAGES)) {
    it(`${route} pins layout=${spec.layout} icon=${spec.icon}`, () => {
      const page = read("src", "app", "(app)", route.slice(1), "page.tsx");
      expect(page).toContain(`layout="${spec.layout}"`);
      expect(page).toContain(`iconClassName="${spec.icon}"`);
    });
  }

  it("attendance replicates the reference's tall-title quirk", () => {
    const page = read("src", "app", "(app)", "attendance", "page.tsx");
    expect(page).toContain('titleClassName="leading-[2]"');
  });
});
