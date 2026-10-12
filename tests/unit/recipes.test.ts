/**
 * Session-5 parity recipe contracts — pins the reference-measured class
 * recipes in the shell/header components. Every value below was measured
 * live against https://eon.base44.app (dual agent-browser sessions, DOM
 * ground truth: computed styles + bounding boxes; see
 * docs/remediation-plan-session5.md).
 *
 * If a recipe drifts from the reference contract, this test fails.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (...p: string[]) =>
  readFileSync(join(process.cwd(), ...p), "utf8");

const sidebarNav = read("src", "components", "layout", "sidebar-nav.tsx");
const appShell = read("src", "components", "layout", "app-shell.tsx");
const pageHeader = read("src", "components", "shared", "page-header.tsx");
const selectUi = read("src", "components", "ui", "select.tsx");
const toastUi = read("src", "components", "ui", "toast.tsx");
const dialogUi = read("src", "components", "ui", "dialog.tsx");
const tabsUi = read("src", "components", "ui", "tabs.tsx");
const loansPage = read("src", "app", "(app)", "loans", "page.tsx");
const loansApi = read("src", "app", "api", "loans", "route.ts");
const prismaSchema = read("prisma", "schema.prisma");
const compliancePage = read("src", "app", "(app)", "compliancedashboard", "page.tsx");
const hrreportsPage = read("src", "app", "(app)", "hrreports", "page.tsx");
const attDashboard = read("src", "app", "(app)", "attendancedashboard", "dashboard.tsx");
const globalsCss = read("src", "app", "globals.css");

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
  // Session 9 (R8-C): the redeployed reference's measured recipes for the
  // four pages the session-5 sweep left on the raised-48 default (and the
  // reports badge the clone never carried).
  "/payrollengine": { layout: "flat-tight", icon: "text-emerald-600" },
  "/advancedanalytics": { layout: "flat36", icon: "text-blue-600" },
  "/securitysettings": { layout: "flat36", icon: "text-blue-600" },
  "/reports": { layout: "flat36", icon: "text-blue-600" },
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

  it("leaf hover uses the sidebar tokens — zinc-100 bg + #18181B text + opacity-80 (session 20, R19-A)", () => {
    expect(sidebarNav).toContain("hover:bg-[#f4f4f5] hover:text-[#18181b]");
    expect(sidebarNav).toContain("hover:opacity-80");
    expect(sidebarNav).toContain("transition-all duration-200");
  });

  it("group triggers hover blue-50/blue-700 like the reference", () => {
    expect(sidebarNav).toContain("hover:bg-blue-50");
    expect(sidebarNav).toContain("hover:text-blue-700");
  });

  it("sub-list has the measured 4px top gap (mt-1; the trailing side is the root wrapper's gap-1 only — session-30 re-measured, mb-1 removed)", () => {
    expect(sidebarNav).toContain("mt-1 flex flex-col gap-1 pl-4");
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
    // raised = row-level mt-8 (session 9: the reference offsets the whole
    // header row — items-center then lands the actions on the h1 row,
    // y=116); flat = badge at y=32 (no row offset)
    expect(pageHeader).toContain('row: "mt-8"');
    expect(pageHeader).not.toContain("mb-4 mt-8");
    // flat-tight = mb-3 badge + bare h1 + mt-1 subtitle
    expect(pageHeader).toContain("text-slate-600 mt-1");
  });
});

describe("per-page header matrix (session 5)", () => {
  for (const [route, spec] of Object.entries(BADGE_PAGES)) {
    it(`${route} pins layout=${spec.layout} icon=${spec.icon}`, () => {
      // /reports is a server page delegating to the reports-browser client
      // component — its PageHeader lives there (session 9).
      const file = route === "/reports" ? "reports-browser.tsx" : "page.tsx";
      const page = read("src", "app", "(app)", route.slice(1), file);
      expect(page).toContain(`layout="${spec.layout}"`);
      expect(page).toContain(`iconClassName="${spec.icon}"`);
    });
  }

  it("attendance title uses the natural line-height (session-10 re-pin)", () => {
    // Sessions 2–9 pinned the reference's double-line-height title quirk
    // (leading-[2]). Session 10 re-measured: the reference now wraps its
    // 312px-squeezed h1 to two lines at the NATURAL 48px line-height —
    // the quirk is gone from the redeployed reference.
    const page = read("src", "app", "(app)", "attendance", "page.tsx");
    expect(page).not.toContain("leading-[2]");
  });
});

describe("session-9 small-page headers (R8-C)", () => {
  // Reference: bare 24px h1 (no badge) — the size="md" recipe. Measured
  // y=32 (recruitmentkanban, staffrequests) and y=24 (hrreports,
  // notificationpreferences, workflowconfigpage — the p-6 wrapper pages).
  const SMALL_PAGES = [
    "recruitmentkanban",
    "hrreports",
    "staffrequests",
    "notificationpreferences",
    "workflowconfigpage",
  ] as const;

  for (const page of SMALL_PAGES) {
    it(`/${page} renders the 24px size="md" h1`, () => {
      const src = read("src", "app", "(app)", page, "page.tsx");
      expect(src).toContain('size="md"');
    });
  }

  it("announcements keeps its existing size=\"md\" (24px) match", () => {
    const src = read("src", "app", "(app)", "announcements", "page.tsx");
    expect(src).toContain('size="md"');
  });
});

// ===== Session 6 — parity round 5: content-area recipes =====
// Every contract below was measured live against https://eon.base44.app
// (dual agent-browser sessions; see docs/remediation-plan-session6.md).

const card = read("src", "components", "ui", "card.tsx");
const statCard = read("src", "components", "shared", "stat-card.tsx");
const emptyState = read("src", "components", "shared", "empty-state.tsx");
const button = read("src", "components", "ui", "button.tsx");
const dashboard = read("src", "app", "(app)", "dashboard", "page.tsx");
const taskmanager = read("src", "app", "(app)", "taskmanager", "page.tsx");

describe("card component recipe (session 6)", () => {
  it("CardTitle renders text-base/600 with default leading (lh 24)", () => {
    // Reference card titles: div "font-semibold tracking-tight text-base"
    // — fs16/fw600/lh24, color #0A0A0A inherited. The shadcn leading-none
    // (lh 16) shrank every title row 8px and card 4px.
    expect(card).toContain("text-base font-semibold tracking-tight");
    expect(card).not.toContain("leading-none");
  });

  it("Card root relies on the base-layer border color (no explicit hex)", () => {
    // Reference: "rounded-xl border bg-card text-card-foreground shadow".
    expect(card).toMatch(/"rounded-xl border bg-card text-card-foreground shadow"/);
  });
});

describe("stat-card recipe (session 6)", () => {
  it("renders the measured 48px tile + 30px value + slate-600 label", () => {
    // Reference: Card(border-slate-2xx) > p-6 > [tile p-3 rounded-xl,
    // text-3xl font-bold text-slate-900 mb-1, text-sm text-slate-600].
    expect(statCard).toContain("p-6");
    expect(statCard).toContain("p-3 rounded-xl");
    expect(statCard).toContain("text-3xl font-bold text-slate-900 mb-1");
    expect(statCard).toContain("text-sm text-slate-600");
    expect(statCard).toContain("border-slate-200");
    // 24px icons inside the 48px tile
    expect(statCard).toContain("[&_svg]:h-6 [&_svg]:w-6");
  });
});

describe("empty-state recipe (session 6)", () => {
  it("renders the measured payroll empty state", () => {
    // Reference: div.p-12 text-center > icon 64px slate-300,
    // h3 text-lg font-semibold text-slate-900 mb-2,
    // p text-slate-500 (+ mb-4 when an action follows — session 12 R11-B),
    // dark #171717 CTA (not gradient).
    expect(emptyState).toContain("p-12 text-center");
    expect(emptyState).toContain("text-lg font-semibold text-slate-900 mb-2");
    expect(emptyState).toContain('action ? "mb-4"');
    expect(emptyState).toContain("h-16 w-16");
    expect(emptyState).toContain("text-slate-300");
  });
});

describe("button variant map (session 6)", () => {
  it("has the dark shadcn-default variant (#171717)", () => {
    // Reference toggle/empty CTA: bg-primary (#171717) + #FAFAFA text.
    expect(button).toContain("dark:");
  });

  it("outline matches the reference utilities", () => {
    // "border border-input bg-background shadow-sm hover:bg-accent
    //  hover:text-accent-foreground"
    expect(button).toMatch(
      /outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"/
    );
  });

  it("per-page gradient CTA variants (measured endpoints, sRGB)", () => {
    // payroll/interviewassistant: #16A34A -> #059669
    expect(button).toContain("bg-[linear-gradient(to_right,#16A34A,#059669)]");
    // attendance: #2563EB -> #0891B2
    expect(button).toContain("bg-[linear-gradient(to_right,#2563EB,#0891B2)]");
    // compliance: #DC2626 -> #EA580C
    expect(button).toContain("bg-[linear-gradient(to_right,#DC2626,#EA580C)]");
    // hrassistantchat: #9333EA -> #4F46E5
    expect(button).toContain("bg-[linear-gradient(to_right,#9333EA,#4F46E5)]");
    // templates: #4F46E5 -> #9333EA
    expect(button).toContain("bg-[linear-gradient(to_right,#4F46E5,#9333EA)]");
    // workflowautomation: #9333EA -> #DB2777
    expect(button).toContain("bg-[linear-gradient(to_right,#9333EA,#DB2777)]");
  });
});

describe("dashboard card recipes (session 6)", () => {
  it("leave-balances header nests title+link row in the column header", () => {
    // Reference: CardHeader "flex flex-col space-y-1.5 p-6 pb-2" (the
    // component default + pb-2) whose first child is a
    // "flex items-center justify-between" row.
    expect(dashboard).toContain('<CardHeader className="pb-2">');
    expect(dashboard).toContain("flex items-center justify-between");
    expect(dashboard).not.toContain("flex-row items-center justify-between space-y-0");
  });

  it("balance value inherits foreground (#0A0A0A) — no slate-900 override", () => {
    expect(dashboard).not.toContain('font-medium text-slate-900');
  });

  it("quick-actions grid uses the measured gap-2", () => {
    expect(dashboard).toContain("grid grid-cols-2 gap-2");
    expect(dashboard).not.toContain("grid grid-cols-2 gap-3");
  });

  it("mobile kicker is the reference bar (static after the session-9 re-pin)", () => {
    // Reference (session 6): md:hidden sticky top-0 z-20 bg-white border-b
    // border-slate-200 px-4 py-3 (inside the p-4 page wrapper, so title
    // x=32); h1 text-lg font-bold text-slate-900 truncate.
    // Session 9 (R8-G): the redeployed reference's sticky became inert
    // (non-scrolling wrapper stack — the kicker scrolls away); the clone
    // matches the rendered truth with a static bar.
    expect(dashboard).not.toContain("sticky top-[73px]");
    expect(dashboard).toContain("md:hidden border-b border-slate-200 bg-white px-4 py-3");
    expect(dashboard).toMatch(/text-lg font-bold text-slate-900 truncate/);
  });

  it("dashboard root is the reference full-width p-4 md:p-8 wrapper", () => {
    expect(dashboard).toContain("p-4 md:p-8 space-y-8");
  });
});

describe("taskmanager board recipe (session 6)", () => {
  it("kanban/projects toggle = plain flex gap-2 of h-9 buttons (no pill)", () => {
    expect(taskmanager).toContain("flex gap-2");
    expect(taskmanager).not.toContain("rounded-lg bg-secondary p-1");
  });

  it("board grid goes 5-up from md", () => {
    expect(taskmanager).toContain("grid grid-cols-1 md:grid-cols-5 gap-4");
  });

  it("columns are bare space-y-3 rounded-lg p-3 (no bg, no border)", () => {
    expect(taskmanager).toContain("space-y-3 rounded-lg p-3");
    expect(taskmanager).not.toContain("bg-secondary/30");
  });

  it("column header h3 is 16px semibold slate-900", () => {
    expect(taskmanager).toContain("font-semibold text-slate-900");
    expect(taskmanager).not.toContain("text-sm font-semibold text-foreground");
  });

  it("count chip: rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700", () => {
    expect(taskmanager).toContain(
      "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700"
    );
    expect(taskmanager).not.toContain("rounded-full border px-2.5");
  });

  it("empty columns render no filler text (reference ends after header)", () => {
    expect(taskmanager).not.toContain("No tasks");
  });
});

describe("app-shell canvas + main padding (session 6)", () => {
  it("shell root carries the sRGB canvas gradient", () => {
    // Reference shell root: min-h-screen flex w-full bg-gradient-to-br
    // from-slate-50 to-blue-50 (stretches with content, not fixed).
    expect(appShell).toContain("bg-[linear-gradient(to_right_bottom,#f8fafc,#eff6ff)]");
    expect(appShell).toContain("min-h-screen");
  });

  it("main is bare flex-1 pb-20 md:pb-0 (padding moved to pages)", () => {
    expect(appShell).toMatch(/main className="flex-1 flex flex-col pb-20 md:pb-0"/);
    expect(appShell).not.toContain("p-4 pb-20");
  });
});

describe("sidebar user name color (session 6, re-measured session 20)", () => {
  it("UserMenu name renders slate-900 like the reference (R19-D re-measure)", () => {
    // Session 20 DOM-verified REF's span class text-slate-900 → rgb(15,23,42);
    // the R15 zinc-700 reading measured the BUTTON's inherited color.
    expect(sidebarNav).toContain("text-sm font-medium text-slate-900");
    expect(sidebarNav).not.toContain("text-sm font-medium text-foreground");
  });
});

// ===== Session 10 — parity round 9: the StatCard variant map =====
// A fresh sweep of every stat row on the reference found per-page
// variants; the clone rendered the session-6 standard recipe everywhere.
// All values measured live (docs/remediation-plan-session10.md §R9-D).

describe("stat-card variant prop (session 10, R9-D)", () => {
  it("declares the eight measured variants", () => {
    expect(statCard).toContain("variant?:");
    for (const v of ["standard", "compact", "compact-s", "mini", "mini-centered", "horizontal", "no-tile", "tile-right"]) {
      expect(statCard).toContain(`"${v}"`);
    }
  });

  it("compact renders p-5 / 40px tile / 20px icons / text-2xl value", () => {
    // Reference compact (recruitment/compliance/assets/attendance-dash/
    // survey-analytics): 268×146, p-5, 40×40 tile, 24px value.
    expect(statCard).toContain("p-5");
    expect(statCard).toContain("[&_svg]:h-5 [&_svg]:w-5");
  });

  it("horizontal renders p-4 flex items-center gap-3 with the 44px tile left", () => {
    // Reference documenttracker: 268×80, tile 44×44 beside value+label.
    expect(statCard).toContain("p-4 flex items-center gap-3");
  });

  it("mini-centered renders p-4 text-center without a tile", () => {
    // Reference hrreports (272×90) + notificationpreferences (229×86).
    expect(statCard).toContain("p-4 text-center");
  });
});

describe("per-page stat variant matrix (session 10, R9-D)", () => {
  const page = (...p: string[]) => read("src", "app", "(app)", ...p);

  it("standard pages keep the 262px gap-6 grid", () => {
    for (const route of ["expenses", "surveys"]) {
      const src = page(route, "page.tsx");
      expect(src).toContain("grid gap-6 md:grid-cols-4");
      expect(src).not.toContain("xl:grid-cols-4");
    }
    const adv = page("advancedanalytics", "page.tsx");
    expect(adv).toContain("grid gap-6 md:grid-cols-4");
  });

  it("allleaverequests renders the 3-col gap-6 grid", () => {
    const src = page("allleaverequests", "page.tsx");
    expect(src).toContain("gap-6 md:grid-cols-3");
    expect(src).not.toContain("xl:grid-cols-3");
  });

  const COMPACT_PAGES: Array<[string, string]> = [
    ["recruitment", "page.tsx"],
    ["compliancedashboard", "page.tsx"],
    ["assetmanagement", "page.tsx"],
    ["attendancedashboard", "dashboard.tsx"],
    ["surveyanalytics", "analytics.tsx"],
    ["analyticsdashboard", "dashboard.tsx"],
  ];
  for (const [route, file] of COMPACT_PAGES) {
    it(`${route}: compact variant + grid-cols-2 md:grid-cols-4 gap-4`, () => {
      const src = page(route, file);
      expect(src).toMatch(/variant="compact"/);
      expect(src).toContain("md:grid-cols-4 gap-4");
      expect(src).not.toContain("gap-6 md:grid-cols-4");
    });
  }

  it("payrollmodule: compact-s variant (20px values, 142px cards)", () => {
    const src = page("payrollmodule", "page.tsx");
    expect(src).toMatch(/variant="compact-s"/);
    expect(src).toContain("md:grid-cols-4 gap-4");
  });

  it("documenttracker: horizontal variant", () => {
    const src = page("documenttracker", "page.tsx");
    expect(src).toMatch(/variant="horizontal"/);
  });

  it("shiftcalendar: mini variant (no tile, 82px)", () => {
    const src = page("shiftcalendar", "page.tsx");
    expect(src).toMatch(/variant="mini"/);
  });

  it("performancemanagement + workflowautomation: no-tile variant", () => {
    expect(page("performancemanagement", "page.tsx")).toMatch(/variant="no-tile"/);
    expect(page("workflowautomation", "page.tsx")).toMatch(/variant="no-tile"/);
  });

  it("hrreports: mini-centered variant + 4-col grid", () => {
    const src = page("hrreports", "page.tsx");
    expect(src).toMatch(/variant="mini-centered"/);
    expect(src).toContain("md:grid-cols-4 gap-4");
  });

  it("analytics: tile-right variant", () => {
    expect(page("analytics", "page.tsx")).toMatch(/variant="tile-right"/);
  });

  it("templates renders NO stat row (reference has none); evaluations gained one (R11-N)", () => {
    expect(page("templates", "page.tsx")).not.toContain("StatCard");
    // Session 12 (R11-N): the reference now renders a 4× 74px value-in-tile
    // stat row on /evaluations (live-measured this session).
    expect(page("evaluations", "page.tsx")).toContain("StatCard");
  });

  it("notificationpreferences: mini-centered 3-col grid with the Mark All Read card", () => {
    const src = page("notificationpreferences", "page.tsx");
    expect(src).toContain("grid-cols-3 gap-4");
    expect(src).toContain("Mark All Read");
  });
});

// ---------------------------------------------------------------------------
// Session 12 — parity round 11 (R11). All recipes live-measured against
// https://eon.base44.app this session (dual agent-browser sessions; see
// docs/remediation-plan-session12.md).
// ---------------------------------------------------------------------------

describe("sidebar footer cluster (session 12, R11-A)", () => {
  it("renders the left-aligned gap-2 cluster in a p-4 border-t footer", () => {
    expect(sidebarNav).toContain("flex flex-col gap-2 border-t border-slate-200 dark:border-slate-800 p-4");
    expect(sidebarNav).toContain("flex items-center gap-2 mb-2");
  });

  it("icon buttons are 36×36 ghost (h-9 w-9), not 32px justify-between", () => {
    expect(sidebarNav).not.toContain("justify-between gap-1 px-1 pb-2");
    expect(sidebarNav.match(/h-9 w-9/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
  });

  it("language button is the outlined h-8 min-w-[64px] عربي recipe", () => {
    expect(sidebarNav).toContain("min-w-[64px]");
    expect(sidebarNav).toContain("عربي");
  });

  it("user trigger is the h-9 px-4 py-2 w-full justify-start gap-3 recipe", () => {
    expect(sidebarNav).toContain("h-9 px-4 py-2 w-full justify-start gap-3");
  });

  it("user avatar is 36px (w-9 h-9) inside the trigger, not a p-2 wrapper", () => {
    expect(sidebarNav).not.toContain("rounded-md p-2 text-left");
    expect(sidebarNav).toContain("w-9 h-9");
  });
});

describe("EmptyState conditional margin + iconChip (session 12, R11-B/C)", () => {
  const emptyState = read("src", "components", "shared", "empty-state.tsx");

  it("description carries mb-4 only when an action follows", () => {
    expect(emptyState).toContain("action ?");
    expect(emptyState).toMatch(/action \? "([^"]*)mb-4/);
  });

  it("iconChip variant renders the slate-100 circle with a 32px icon", () => {
    expect(emptyState).toContain("iconChip");
    expect(emptyState).toContain("bg-slate-100 rounded-full");
    expect(emptyState).toContain("[&_svg]:h-8 [&_svg]:w-8");
  });
});

describe("systemic table recipe (session 12, R11-V)", () => {
  const table = read("src", "components", "ui", "table.tsx");

  it("th is py-3 px-4 font-medium text-slate-500 (45px)", () => {
    expect(table).toContain("py-3 px-4");
    expect(table).toContain("text-slate-500");
    expect(table).not.toContain("h-10 px-3 text-left");
  });

  it("data pages render the py-12 text-center text-slate-400 empty row", () => {
    for (const route of ["payrollmodule", "assetmanagement", "payroll"]) {
      const src = read("src", "app", "(app)", route, "page.tsx");
      expect(src).toContain("py-12 text-center text-slate-400");
    }
  });
});

describe("border-b DIV-title card headers (session 12, R11-E/F/G/H/I)", () => {
  const page = (...p: string[]) => read("src", "app", "(app)", ...p);

  it("shared recipe: flex flex-col space-y-1.5 p-6 border-b + DIV font-semibold leading-none", () => {
    for (const [route, file] of [
      ["expenses", "page.tsx"],
      ["leavemanagement", "page.tsx"],
      ["allleaverequests", "page.tsx"],
      ["payroll", "page.tsx"],
      ["payrollmodule", "page.tsx"],
    ] as const) {
      const src = page(route, file);
      expect(src).toContain("flex flex-col space-y-1.5 p-6 border-b border-slate-200");
      expect(src).toContain("font-semibold leading-none tracking-tight");
    }
  });

  it("expenses: DIV title 'Expense Claims', CardContent p-0, no card-level CTA", () => {
    const src = page("expenses", "page.tsx");
    expect(src).toContain("Expense Claims");
    expect(src).not.toMatch(/EmptyState[\s\S]{0,400}action=/);
  });

  it("leavemanagement: CardContent p-6 with the py-12 single-P empty (no h3)", () => {
    const src = page("leavemanagement", "page.tsx");
    expect(src).toContain('CardContent className="p-6"');
    expect(src).toContain("text-center py-12");
    expect(src).not.toContain("No leave requests yet\" description");
  });

  it("allleaverequests: p-6 content with the py-12 single-P empty", () => {
    const src = page("allleaverequests", "page.tsx");
    expect(src).toContain("text-center py-12");
  });

  it("payroll: p-6 toolbar card (search flex-1 + month input) above the records card", () => {
    const src = page("payroll", "page.tsx");
    expect(src).toContain("relative flex-1");
    expect(src).toMatch(/type="month"/);
    // The empty state KEEPS its dark Add Payroll CTA (live-verified:
    // 142x36 at y=826 with the description mb-4 ahead of it).
    expect(src).toMatch(/EmptyState[\s\S]{0,300}action=/);
    expect(src).toContain("Add Payroll");
  });

  it("payrollmodule: standalone max-w-sm search + month input in the header", () => {
    const src = page("payrollmodule", "page.tsx");
    expect(src).toContain("relative max-w-sm");
    expect(src).toMatch(/type="month"/);
    expect(src).toContain("Payslips —");
  });
});

describe("documenttracker filter row + bare empty (session 12, R11-D)", () => {
  const src = read("src", "app", "(app)", "documenttracker", "page.tsx");

  it("filter row: search relative flex-1 min-w-64 + white chip group", () => {
    expect(src).toContain("flex flex-wrap gap-3 items-center");
    expect(src).toContain("relative flex-1 min-w-64");
    expect(src).toContain("flex bg-white border border-slate-200 rounded-lg p-1 gap-1");
  });

  it("chips: px-3 py-1.5 capitalize with the blue-600 active state", () => {
    expect(src).toContain("px-3 py-1.5 rounded text-xs font-medium transition-all capitalize");
    expect(src).toContain("bg-blue-600 text-white");
    expect(src).toContain("text-slate-600 hover:bg-slate-50");
    expect(src).toContain("pending upload");
  });

  it("empty card is p-6 py-16 text-center with a 48px icon and a single P", () => {
    expect(src).toContain("p-6 py-16 text-center");
    expect(src).toMatch(/h-12 w-12/);
    expect(src).not.toContain('title="No documents found"');
  });

  it("the Tabs filter is gone", () => {
    expect(src).not.toContain("<TabsList>");
  });
});

describe("assetmanagement filter row + table (session 12, R11-J)", () => {
  const src = read("src", "app", "(app)", "assetmanagement", "page.tsx");

  it("search wrapper is relative flex-1 min-w-[200px]", () => {
    expect(src).toContain("relative flex-1 min-w-[200px]");
  });

  it("status/type selects with All Statuses / All Types", () => {
    expect(src).toContain("All Statuses");
    expect(src).toContain("All Types");
  });
});

describe("recruitment toolbar + table (session 12, R11-K)", () => {
  const src = read("src", "app", "(app)", "recruitment", "page.tsx");

  it("toolbar card is p-4 with the ml-auto candidates count", () => {
    expect(src).toContain("bg-white p-4 rounded-xl border border-slate-200");
    expect(src).toContain("text-sm text-slate-500 ml-auto");
  });

  it("candidates table renders the py-10 empty row", () => {
    expect(src).toContain("text-center py-10 text-slate-400");
  });
});

describe("evaluations tab pill + value-in-tile stats (session 12, R11-N)", () => {
  const src = read("src", "app", "(app)", "evaluations", "page.tsx");

  it("tablist is the centered equal-width max-w-lg grid", () => {
    expect(src).toContain("max-w-lg mx-auto");
    expect(src).toContain("grid-cols-3");
  });

  it("stat row: value-in-tile cards with the slate-100 40px tile", () => {
    expect(src).toContain("Total Reviews");
    expect(src).toContain("Not Started");
  });

  it("row header: h3 font-semibold text-slate-800 + h-8 New Review button", () => {
    expect(src).toContain("font-semibold text-slate-800");
    expect(src).toContain("Review Cycles");
    expect(src).toContain("New Review");
  });

  it("empty state is the py-10 slate-400 one-liner", () => {
    expect(src).toContain("text-center py-10 text-slate-400 bg-white rounded-xl border border-slate-200");
    expect(src).toContain("No reviews yet. Create one to get started.");
  });
});

describe("employees zero-render (session 12, R11-O)", () => {
  const src = read("src", "app", "(app)", "employees", "page.tsx");

  it("renders nothing below the filter row when there are no employees", () => {
    expect(src).not.toContain('title="No employees yet"');
    expect(src).not.toContain("No employees match your filters");
    expect(src).toMatch(/=== 0\s*\?\s*null/);
  });
});

describe("communications channel cards (session 12, R11-P)", () => {
  const src = read("src", "app", "(app)", "communications", "page.tsx");

  it("cards are p-8 text-center with the 64px colored circle chip", () => {
    expect(src).toContain("p-8 text-center");
    expect(src).toContain("rounded-full flex items-center justify-center mx-auto mb-4");
  });

  it("no per-card full-width Send button (the whole card is the affordance)", () => {
    expect(src).not.toContain('<Button className="w-full" onClick={() => openDialog(c.key)}>');
  });

  it("channel icons: Mail blue, MessageSquare green, MessageCircle emerald", () => {
    expect(src).toContain("bg-blue-100");
    expect(src).toContain("bg-green-100");
    expect(src).toContain("bg-emerald-100");
  });
});

describe("analyticsdashboard stacked layout (session 12, R11-R)", () => {
  const dash = read("src", "app", "(app)", "analyticsdashboard", "dashboard.tsx");
  const charts = read("src", "app", "(app)", "analyticsdashboard", "charts.tsx");

  it("chart stack is space-y-6: full-width → 2-col → 3-col → full-width", () => {
    expect(dash).toContain("space-y-6");
    expect(dash).toContain("grid md:grid-cols-2 gap-6");
    expect(dash).toContain("grid md:grid-cols-3 gap-6");
  });

  it("card titles match the reference strings", () => {
    expect(dash).toContain("Hiring Trend — New Employees per Month");
    expect(dash).toContain("Attendance vs Leave Trend");
    expect(dash).toContain("Monthly Expense Trend (SAR)");
    expect(dash).toContain("Employees by Department");
    expect(dash).toContain("Employment Types");
    expect(dash).toContain("Leave Types Distribution");
    expect(dash).toContain("Employee Status Breakdown");
  });

  it("status breakdown renders the flex flex-wrap gap-3 chips, not a pie", () => {
    expect(dash).toContain("flex flex-wrap gap-3");
    // the 4th REF pie was replaced by the chips card: exactly 3 DistributionPie uses remain
    expect(dash.match(/<DistributionPie/g)?.length ?? 0).toBe(3);
  });

  it("chart types/heights: area 260, bar 240, line 240, pies 220", () => {
    expect(charts).toMatch(/HiringTrendArea/);
    expect(charts).toMatch(/height=\{260\}/);
    expect(charts.match(/height=\{240\}/g)?.length ?? 0).toBe(2);
    expect(charts).toMatch(/height = 220/);
  });
});

describe("securitysettings recipes (session 12, R11-S)", () => {
  const src = read("src", "app", "(app)", "securitysettings", "page.tsx");

  it("alert is border-2 orange on bg-orange-50 with the p-6 gap-4 row", () => {
    expect(src).toContain("border-2 border-orange-500 bg-orange-50");
    expect(src).toContain("flex items-center gap-4");
  });

  it("feature rows are p-4 bg-slate-50 rounded-lg with checkbox + badge", () => {
    expect(src).toContain("flex items-center justify-between p-4 bg-slate-50 rounded-lg");
  });

  it("recommendations are the compact space-y-3 text-sm slate-600 list", () => {
    expect(src).toContain("space-y-3 text-sm text-slate-600");
  });
});

describe("chart-page heights + iconed stat rows (session 12, R11-T/U)", () => {
  it("hrreports chart is 320px", () => {
    expect(read("src", "app", "(app)", "hrreports", "charts.tsx")).toContain("height={320}");
  });

  it("attendancedashboard charts are 260px", () => {
    const src = read("src", "app", "(app)", "attendancedashboard", "charts.tsx");
    expect(src.match(/height=\{260\}/g)?.length ?? 0).toBe(2);
  });

  it("advancedanalytics charts are 300px", () => {
    const src = read("src", "app", "(app)", "advancedanalytics", "charts.tsx");
    expect(src.match(/height=\{300\}/g)?.length ?? 0).toBe(3);
  });

  it("advancedanalytics keeps the '(Last 6 Months)' payroll title", () => {
    expect(read("src", "app", "(app)", "advancedanalytics", "page.tsx")).toContain("Payroll Trend (Last 6 Months)");
  });

  it("surveyanalytics charts are 240/240/260", () => {
    const src = read("src", "app", "(app)", "surveyanalytics", "charts.tsx");
    expect(src.match(/height=\{240\}/g)?.length ?? 0).toBe(2);
    expect(src.match(/height=\{260\}/g)?.length ?? 0).toBe(1);
  });

  it("surveyanalytics + attendancedashboard stat rows carry icons + tiles (146px)", () => {
    const sa = read("src", "app", "(app)", "surveyanalytics", "analytics.tsx");
    const ad = read("src", "app", "(app)", "attendancedashboard", "dashboard.tsx");
    for (const src of [sa, ad]) {
      const iconed = src.match(/icon=\{</g)?.length ?? 0;
      expect(iconed).toBeGreaterThanOrEqual(4);
      expect(src.match(/tileClassName="bg-/g)?.length ?? 0).toBeGreaterThanOrEqual(4);
    }
  });
});

describe("companywall feed rhythm (session 12, R11-B companion)", () => {
  const src = read("src", "app", "(app)", "companywall", "page.tsx");

  it("feed stack is space-y-6", () => {
    expect(src).toContain("flex flex-col space-y-6");
  });
});

describe("templates iconChip empty (session 12, R11-C)", () => {
  const src = read("src", "app", "(app)", "templates", "page.tsx");

  it("empty state uses the iconChip variant with the FileText icon", () => {
    expect(src).toContain("iconChip");
    expect(src).toContain("<FileText");
  });
});

describe("horizontal StatCard precision (session 12, R11-D)", () => {
  const statCard = read("src", "components", "shared", "stat-card.tsx");

  it("tile is 44px w-11 h-11 with a 20px icon", () => {
    expect(statCard).toContain("[&_svg]:h-5 [&_svg]:w-5");
  });

  it("label is text-xs text-slate-500 (12px, 80px card)", () => {
    expect(statCard).toContain("text-xs text-slate-500");
  });

  it("documenttracker stat call sites carry per-color tiles", () => {
    const src = read("src", "app", "(app)", "documenttracker", "page.tsx");
    expect(src).toContain("bg-blue-100");
    expect(src).toContain("bg-green-100");
    expect(src).toContain("bg-amber-100");
    expect(src).toContain("bg-red-100");
  });
});

// ---------------------------------------------------------------------------
// Session 13 — parity round 12 pins (R12-A…R12-G)
// ---------------------------------------------------------------------------

describe("notificationpreferences recipes (session 13, R12-A)", () => {
  const page = read("src", "app", "(app)", "notificationpreferences", "page.tsx");

  it("stat tiles use text-xs labels (16px line — 86px tiles)", () => {
    expect(page).toContain('labelClassName="text-xs text-slate-500"');
  });

  it("stat values carry per-tile colors (unread red-500, total blue-600)", () => {
    expect(page).toContain("text-red-500");
    expect(page).toContain("text-blue-600");
  });

  it("card headers are title-only (no CardDescription)", () => {
    expect(page).not.toContain("CardDescription");
  });

  it("preference rows: border-b last:border-0 + icon chip + gap-3", () => {
    expect(page).toContain("border-b last:border-0");
    expect(page).toContain("p-2 bg-slate-100 rounded-lg");
    expect(page).toContain("flex items-center gap-3");
  });

  it("save row is pt-2 flex justify-end with an iconed button", () => {
    expect(page).toContain("pt-2 flex justify-end");
  });

  it("recent-notifications empty is the simple py-8 recipe (no EmptyState)", () => {
    expect(page).not.toContain("EmptyState");
    expect(page).toMatch(/text-center py-8/);
  });
});

describe("hrreports toolbar grid + table padding (session 13, R12-B/C)", () => {
  const page = read("src", "app", "(app)", "hrreports", "page.tsx");

  it("toolbar is a grid (2/4/6 cols, gap-4) of bare field divs", () => {
    expect(page).toContain("grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4");
  });

  it("toolbar labels are text-xs text-slate-500 (not Label component text-sm)", () => {
    expect(page).toContain("text-xs text-slate-500 font-medium");
  });

  it("table container keeps the card's horizontal padding (no full-bleed)", () => {
    expect(page).not.toContain("px-0 pb-0");
  });
});

describe("hrreports header + stat colors (session 13, R12-D/G)", () => {
  const page = read("src", "app", "(app)", "hrreports", "page.tsx");

  it("subtitle sits flush under the h1 (no mt-1)", () => {
    expect(page).not.toContain("mt-1 text-slate-500");
  });

  it("header actions cluster is flex gap-2", () => {
    expect(page).toContain("flex gap-2");
  });

  it("stat values carry per-tile colors (blue/orange/purple)", () => {
    expect(page).toContain("text-blue-600");
    expect(page).toContain("text-orange-500");
    expect(page).toContain("text-purple-600");
  });
});

describe("analytics stacked tiles + chart cards (session 13, R12-E)", () => {
  const page = read("src", "app", "(app)", "analytics", "page.tsx");
  const charts = read("src", "app", "(app)", "analytics", "charts.tsx");

  it("stat grid is md:grid-cols-4 gap-6", () => {
    expect(page).toContain("md:grid-cols-4 gap-6");
  });

  it("chart grid is lg:grid-cols-2 gap-6 (548px tiles)", () => {
    expect(page).toContain("lg:grid-cols-2 gap-6");
  });

  it("chart cards use border-b headers with leading-none DIV titles", () => {
    expect(page).toContain("border-b border-slate-200");
    expect(page).toContain("font-semibold leading-none tracking-tight");
  });

  it("chart heights are 300px", () => {
    expect(charts).toMatch(/height=\{300\}/);
  });

  it("onboarding summary is plain text stacks (grid md:grid-cols-3 gap-8)", () => {
    expect(page).toContain("md:grid-cols-3 gap-8");
    expect(page).not.toContain("<dl");
  });
});

describe("StatCard stacked variant (session 13, R12-E)", () => {
  const statCard = read("src", "components", "shared", "stat-card.tsx");

  it("tile-right renders label-top, value mt-2, hint mt-2, icon right", () => {
    expect(statCard).toContain("flex items-start justify-between");
    expect(statCard).toContain("mt-2");
  });
});

describe("staffrequests trigger (session 13, R12-F)", () => {
  const page = read("src", "app", "(app)", "staffrequests", "page.tsx");

  it("tab trigger is px-3 py-1 (137px, not h-7 px-4)", () => {
    expect(page).not.toContain("h-7 px-4");
    expect(page).toMatch(/rounded-md px-3 py-1/);
  });

  it("pill drops self-start (reference parent is bare)", () => {
    expect(page).not.toContain("self-start");
  });
});

describe("iconed button margins (session 14, R13-A)", () => {
  it("employees Import CSV icon carries mr-2 (145px button)", () => {
    const page = read("src", "app", "(app)", "employees", "page.tsx");
    expect(page).toMatch(/<Upload className="mr-2"/);
  });

  it("payroll Reports & Export icon carries mr-2 (185px button)", () => {
    const page = read("src", "app", "(app)", "payroll", "page.tsx");
    expect(page).toMatch(/<FileDown className="mr-2"/);
  });

  it("payrollmodule Generate All icon carries mr-2 (153px button)", () => {
    const page = read("src", "app", "(app)", "payrollmodule", "page.tsx");
    expect(page).toMatch(/<Wand2 className="mr-2"/);
  });

  it("taskmanager New Project / Kanban / Projects icons carry mr-2", () => {
    const page = read("src", "app", "(app)", "taskmanager", "page.tsx");
    expect(page).toMatch(/<FolderKanban className="mr-2"/);
    expect(page).toMatch(/<KanbanSquare className="mr-2"/);
    expect(page).toMatch(/<FolderIcon className="mr-2"/);
  });

  it("documenttracker Run Alert Check icon carries mr-2 (178px button)", () => {
    const page = read("src", "app", "(app)", "documenttracker", "page.tsx");
    expect(page).toMatch(/<BellRing className="mr-2"/);
  });

  it("surveyanalytics Run AI Analysis icon carries mr-2 (171px button)", () => {
    const page = read("src", "app", "(app)", "surveyanalytics", "analytics.tsx");
    expect(page).toMatch(/<Sparkles className="mr-2"/);
  });

  it("analyticsdashboard Export CSV/PDF icons carry mr-2 (145/144px)", () => {
    const page = read("src", "app", "(app)", "analyticsdashboard", "dashboard.tsx");
    expect(page).toMatch(/<Download className="mr-2"/);
  });

  it("attendancedashboard Export Report icon mr-2 + in-card Export mr-1", () => {
    const page = read("src", "app", "(app)", "attendancedashboard", "dashboard.tsx");
    expect(page).toMatch(/<Download className="mr-2"/);
    expect(page).toMatch(/mr-1"/);
  });

  it("advancedanalytics Schedule Report icon carries mr-2 (179px button)", () => {
    const page = read("src", "app", "(app)", "advancedanalytics", "schedule-report-button.tsx");
    expect(page).toMatch(/<CalendarClock className="mr-2"/);
  });
});

describe("settings pill + company card (session 14, R13-B)", () => {
  const page = read("src", "app", "(app)", "settings", "page.tsx");

  it("tab pill is the default shrink-wrap + bg-white border (971px, not full-width bg-secondary)", () => {
    expect(page).not.toContain('TabsList className="h-auto flex-wrap justify-start"');
    expect(page).toMatch(/TabsList className="bg-white border border-slate-200"/);
  });

  it("the seven tab triggers are iconed", () => {
    expect(page).toMatch(/<Building2 className="h-4 w-4 mr-2"/);
    expect(page).toMatch(/<Workflow className="h-4 w-4 mr-2"/);
    expect(page).toMatch(/<Clock className="h-4 w-4 mr-2"/);
    expect(page).toMatch(/<Users className="h-4 w-4 mr-2"/);
    expect(page).toMatch(/<Plug className="h-4 w-4 mr-2"/);
    expect(page).toMatch(/<Palette className="h-4 w-4 mr-2"/);
    expect(page).toMatch(/<FileText className="h-4 w-4 mr-2"/);
  });

  it("company card header is title-only with the iconed h-9 Edit button", () => {
    expect(page).not.toContain("<CardDescription>Public details");
    expect(page).toMatch(/font-semibold leading-none/);
    expect(page).toMatch(/<Pencil className="mr-2"/);
  });

  it("company fields render as the reference read-only tile grid (p-4, mb-1 label)", () => {
    expect(page).toContain("md:grid-cols-2 gap-6");
    expect(page).toMatch(/text-sm text-slate-500 mb-1/);
    expect(page).not.toContain('className="grid grid-cols-1 gap-x-8 gap-y-4');
  });
});

describe("profile tabs + general form (session 14, R13-C)", () => {
  const page = read("src", "app", "(app)", "profile", "page.tsx");

  it("has exactly the four reference tabs, iconed, default general (no User tab)", () => {
    expect(page).not.toContain('<TabsTrigger value="user">');
    expect(page).toMatch(/defaultValue="general"/);
    expect(page).toMatch(/<User className="h-4 w-4 mr-2"/);
    expect(page).toMatch(/<Lock className="h-4 w-4 mr-2"/);
    expect(page).toMatch(/<Globe className="h-4 w-4 mr-2"/);
    expect(page).toMatch(/<SlidersHorizontal className="h-4 w-4 mr-2"/);
  });

  it("tab pill is the shrink-wrap + bg-white border recipe", () => {
    expect(page).not.toContain('TabsList className="h-auto flex-wrap justify-start"');
    expect(page).toMatch(/TabsList className="bg-white border border-slate-200"/);
  });

  it("the personal-information card uses the border-b DIV-title header (no CardDescription)", () => {
    expect(page).not.toContain("Update the details shown on your profile.");
    expect(page).toMatch(/font-semibold leading-none/);
  });

  it("the form is the reference recipe (space-y-6 + grid md:grid-cols-2 gap-6 + space-y-2 fields)", () => {
    expect(page).toMatch(/space-y-6/);
    expect(page).toContain("md:grid-cols-2 gap-6");
    expect(page).toMatch(/space-y-2/);
  });

  it("Save Changes rides inside the form (flex justify-end), iconed mr-2 — no CardFooter", () => {
    expect(page).not.toContain("<CardFooter");
    expect(page).toContain("flex justify-end");
    expect(page).toMatch(/<Save className="mr-2"/);
  });

  it("identity-card h2 drops truncate (777px reference width)", () => {
    expect(page).not.toContain('className="truncate text-2xl font-bold text-slate-900"');
  });
});

describe("attendance stat tabs (session 14, R13-D)", () => {
  const page = read("src", "app", "(app)", "attendance", "page.tsx");

  it("first tab is Mark Attendance (not Dashboard), tab set is the reference trio", () => {
    expect(page).toMatch(/value="mark"/);
    expect(page).toMatch(/Mark Attendance/);
    expect(page).not.toContain('<TabsTrigger value="dashboard">');
  });

  it("tab pill is the default shrink-wrap + bg-white border", () => {
    expect(page).toMatch(/TabsList className="bg-white border border-slate-200"/);
  });

  it("non-admins get the access-restricted recipe (red chip + max-w-sm copy)", () => {
    expect(page).toMatch(/bg-red-100 rounded-full/);
    expect(page).toMatch(/text-slate-500 max-w-sm/);
  });
});

describe("compliance structure (session 14, R13-E)", () => {
  const page = read("src", "app", "(app)", "compliancedashboard", "page.tsx");

  it("header Run Compliance Scan button is text-only (184px)", () => {
    expect(page).not.toContain("<ScanSearch");
    expect(page).not.toMatch(/import[^\n]*ScanSearch/);
  });

  it("stat-tab pill: shrink-wrap + bg-white border with two iconed triggers", () => {
    expect(page).toMatch(/TabsList className="bg-white border border-slate-200"/);
    expect(page).toMatch(/Document Expiry Monitor/);
    expect(page).toMatch(/All Alerts/);
  });

  it("notify row is flex flex-wrap gap-2 with mr-1 icons", () => {
    expect(page).toContain("flex flex-wrap gap-2");
    expect(page).toMatch(/mr-1"/);
  });

  it("toolbar is flex flex-wrap gap-3 with the ml-auto at-risk counter", () => {
    expect(page).toContain("flex flex-wrap gap-3");
    expect(page).toMatch(/ml-auto/);
    expect(page).toMatch(/at-risk document/);
  });
});

describe("reports tab tiles + filters (session 14, R13-F)", () => {
  const browser = read("src", "app", "(app)", "reports", "reports-browser.tsx");

  it("active tab renders ONE card with the 20px-iconed leading-none title", () => {
    expect(browser).toMatch(/font-semibold leading-none/);
    expect(browser).toMatch(/h-5 w-5/);
  });

  it("report tiles are the p-4 recipe with two iconed 152px buttons", () => {
    expect(browser).toContain("grid md:grid-cols-2 lg:grid-cols-3");
    expect(browser).toMatch(/text-slate-900 mb-3/);
    expect(browser).toMatch(/flex gap-2/);
  });

  it("Report Filters card renders the md:grid-cols-4 date/department/status row", () => {
    expect(browser).toContain("Report Filters");
    expect(browser).toContain("md:grid-cols-4");
  });
});

describe("offboarding empty (session 14, R13-G)", () => {
  const page = read("src", "app", "(app)", "offboarding", "page.tsx");

  it("content sits in the grid md:grid-cols-2 lg:grid-cols-3 wrapper", () => {
    expect(page).toContain("md:grid-cols-2 lg:grid-cols-3");
  });

  it("empty state has NO CTA (the affordance is the header button)", () => {
    expect(page).not.toMatch(/EmptyState[\s\S]{0,300}action=/);
  });
});

describe("select widths + export variant (session 14, R13-H)", () => {
  it("surveyanalytics: All Surveys select w-48; Export is the h-8 sm variant iconed mr-2", () => {
    const page = read("src", "app", "(app)", "surveyanalytics", "analytics.tsx");
    expect(page).toMatch(/w-48/);
    expect(page).toMatch(/size="sm"/);
  });

  it("analyticsdashboard range select is w-36 (144px)", () => {
    const page = read("src", "app", "(app)", "analyticsdashboard", "dashboard.tsx");
    expect(page).toMatch(/w-36/);
  });

  it("attendancedashboard department select is w-44 (176px)", () => {
    const page = read("src", "app", "(app)", "attendancedashboard", "dashboard.tsx");
    expect(page).toMatch(/w-44/);
  });
});

describe("StatCard no-tile variant (session 14, R13-I)", () => {
  const statCard = read("src", "components", "shared", "stat-card.tsx");

  it("no-tile renders a flex row with the text stack left + 40px icon right (108px)", () => {
    expect(statCard).toMatch(/variant === "no-tile"/);
    expect(statCard).toMatch(/h-10 w-10/);
  });
});

describe("taskmanager column + badge (session 14, R13-J)", () => {
  const page = read("src", "app", "(app)", "taskmanager", "page.tsx");

  it("empty columns keep their space-y-2 list container (60px, REF)", () => {
    expect(page).toMatch(/space-y-2/);
  });
});

describe("payrollengine fields (session 14, R13-K)", () => {
  const page = read("src", "app", "(app)", "payrollengine", "page.tsx");

  it("toolbar field wrappers use space-y-2 (64px fields, 132px card)", () => {
    expect(page).toMatch(/space-y-2/);
    expect(page).not.toMatch(/space-y-1"/);
  });
});

describe("small pins: hrreports status + shiftcalendar (session 14, R13-L)", () => {
  it("hrreports Group By select defaults to an empty trigger (Status Filter shows All)", () => {
    const page = read("src", "app", "(app)", "hrreports", "page.tsx");
    expect(page).toMatch(/Group By[\s\S]{0,300}SelectValue placeholder=""/);
    expect(page).toMatch(/groupBy, setGroupBy\] = React\.useState<string>\(""\)/);
  });

  it("shiftcalendar: Shift Swaps affordance is a Link (anchor)", () => {
    const page = read("src", "app", "(app)", "shiftcalendar", "page.tsx");
    expect(page).toMatch(/asChild/);
    expect(page).toMatch(/href="\/ShiftSwap"/);
  });
});

describe("recruitment tab pill + trigger icons (session 15, R14-A)", () => {
  const page = read("src", "app", "(app)", "recruitment", "page.tsx");

  it("tab pill is the shrink-wrap + bg-white border recipe (439px)", () => {
    expect(page).toMatch(/TabsList className="bg-white border border-slate-200"/);
    expect(page).not.toMatch(/<TabsList>\s*$/);
  });

  it("first two triggers carry 12px icons with gap-1 (190/131px)", () => {
    expect(page).toMatch(/TabsTrigger value="applicants" className="gap-1"><Users className="h-3 w-3"/);
    expect(page).toMatch(/TabsTrigger value="cvupload" className="gap-1"><Sparkles className="h-3 w-3"/);
  });

  it("Job Postings trigger stays icon-less (108px)", () => {
    expect(page).toMatch(/TabsTrigger value="jobs">Job Postings/);
  });
});

describe("training section furniture (session 15, R14-B)", () => {
  const page = read("src", "app", "(app)", "training", "page.tsx");

  it("chip-row container is role=group (no tablist — invalid ARIA)", () => {
    expect(page).not.toContain('role="tablist"');
    expect(page).toMatch(/role="group" aria-label="Training categories"/);
  });

  it("the h2 row renders NO button (32px row — reference-measured)", () => {
    const h2row = page.match(/flex items-center justify-between mb-6[\s\S]{0,220}?<\/div>/)?.[0] ?? "";
    expect(h2row).toMatch(/Training Platforms/);
    expect(h2row).not.toMatch(/<Button/);
    expect(page).not.toContain("New Platform\n          </Button>");
  });

  it("the create affordance lives in the empty state (loans-recipe CTA superset)", () => {
    expect(page).toMatch(/No training platforms available[\s\S]{0,400}?<Button/);
  });

  it("the with-data grid carries a trailing dashed add-tile", () => {
    expect(page).toMatch(/border-dashed/);
    expect(page).toMatch(/Add Platform/);
  });
});

describe("performancemanagement tab pill (session 15, R14-C)", () => {
  const page = read("src", "app", "(app)", "performancemanagement", "page.tsx");

  it("tab pill is the shrink-wrap + bg-white border recipe (296px)", () => {
    expect(page).toMatch(/TabsList className="bg-white border border-slate-200"/);
  });
});

describe("staffrequests pill wrapper (session 15, R14-D)", () => {
  const page = read("src", "app", "(app)", "staffrequests", "page.tsx");

  it("the pill sits in a plain block wrapper (no flex-col stretch — 145px left pill)", () => {
    expect(page).not.toMatch(/<div className="flex flex-col">[\s\S]{0,80}<div className="inline-flex h-9 items-center justify-center rounded-lg bg-secondary/);
    expect(page).toMatch(/<div>[\s\S]{0,400}?<div className="inline-flex h-9 items-center justify-center rounded-lg bg-secondary/);
  });
});

describe("profile preferences tab content (session 15, R14-E)", () => {
  const page = read("src", "app", "(app)", "profile", "page.tsx");

  it("the language/timezone card renders under the preferences tab (not general)", () => {
    expect(page).not.toMatch(/TabsContent value="general"[\s\S]{0,80}General Settings/);
    expect(page).toMatch(/TabsContent value="preferences"/);
    const prefBlock = page.match(/TabsContent value="preferences"[\s\S]{0,5000}?<\/TabsContent>/)?.[0] ?? "";
    expect(prefBlock).toMatch(/pf-language/);
    expect(prefBlock).toMatch(/pf-timezone/);
  });

  it("the general tab keeps exactly the four reference fields", () => {
    const generalBlock = page.match(/TabsContent value="general"[\s\S]{0,4000}?<\/TabsContent>/)?.[0] ?? "";
    expect(generalBlock).toMatch(/Full Name/);
    expect(generalBlock).toMatch(/Job Title/);
    expect(generalBlock).not.toMatch(/Language/);
    expect(generalBlock).not.toMatch(/Timezone/);
  });

  it("Change Photo is type=button (no implicit submit)", () => {
    expect(page).toMatch(/<Button\s+type="button"\s+variant="outline"/);
  });
});

describe("compliance notify buttons (session 15, R14-F)", () => {
  const page = read("src", "app", "(app)", "compliancedashboard", "page.tsx");

  it("notify buttons render at the h-8 size (sm — 32px, 166/173/173)", () => {
    expect(page).toMatch(/<Button\s+key=\{w\}\s+variant="outline"\s+size="sm"/);
  });
});

describe("tab-pill inactive trigger color (session 16, R15-A)", () => {
  const tabs = read("src", "components", "ui", "tabs.tsx");
  const reportsBrowser = read("src", "app", "(app)", "reports", "reports-browser.tsx");

  it("TabsList carries the reference's neutral-500 inactive color (its muted-foreground token renders visibly on tab surfaces)", () => {
    expect(tabs).toMatch(/rounded-lg bg-secondary p-1 text-neutral-500/);
    expect(tabs).not.toMatch(/text-muted-foreground/);
  });

  it("the reports selector pill's explicit override matches the same neutral-500", () => {
    expect(reportsBrowser).toMatch(/border-slate-200 bg-white text-neutral-500/);
    expect(reportsBrowser).not.toMatch(/text-muted-foreground/);
  });
});

describe("sidebar footer colors (session 16 R15-B; hover re-measured session 20)", () => {
  it("Bell ghost icon renders slate-600 (on the SVG), Moon ghost icon renders zinc-700", () => {
    expect(sidebarNav).toMatch(/<Bell className="h-4 w-4 text-slate-600"/);
    expect(sidebarNav).toMatch(/h-9 w-9 select-none[^"]*text-zinc-700|text-zinc-700[^"]*h-9 w-9 select-none/);
  });

  it("the user name renders slate-900 (session 20 re-measure — the R15 zinc-700 reading was the button's inherited color)", () => {
    expect(sidebarNav).toMatch(/<p className="truncate text-sm font-medium text-slate-900">\{user\.name\}<\/p>/);
    expect(sidebarNav).not.toMatch(/text-zinc-700">\{user\.name\}/);
  });
});

describe("page-header actions cluster fitting (session 16, R15-C)", () => {
  it("the default actions cluster carries no shrink-0 — the documented wrap-to-second-row fitting must engage at mid viewports", () => {
    expect(pageHeader).toContain('"flex flex-wrap items-center gap-3", actionsClassName');
    expect(pageHeader).not.toContain("flex flex-wrap items-center gap-3 shrink-0");
  });
});

describe("organogram bare card + simple empty (session 16, R15-D)", () => {
  const page = read("src", "app", "(app)", "organogram", "page.tsx");

  it("renders NO CardHeader (no title/description) — the reference's card is bare", () => {
    expect(page).not.toMatch(/CardTitle>Reporting Structure/);
    expect(page).not.toMatch(/CardDescription/);
  });

  it("renders the simple empty recipe: 64px icon + ONE 16px line inside p-12 text-center", () => {
    expect(page).toMatch(/p-12 text-center/);
    expect(page).not.toMatch(/<EmptyState/);
    expect(page).toMatch(/No reporting structure defined\./);
  });

  it("wraps the chart card in the centering + horizontal-scroll container (overflow-x-auto + min-w-max justify-center p-8)", () => {
    expect(page).toMatch(/overflow-x-auto pb-8/);
    expect(page).toMatch(/min-w-max flex justify-center p-8/);
  });
});

describe("staffrequests pill recipe + default scope (session 16, R15-E)", () => {
  const page = read("src", "app", "(app)", "staffrequests", "page.tsx");

  it("the pill renders the secondary surface (#F5F5F5) with the neutral-500 inactive color", () => {
    expect(page).toMatch(/rounded-lg bg-secondary p-1 text-neutral-500/);
    expect(page).not.toMatch(/bg-muted p-1 text-muted-foreground/);
  });

  it("the default scope is \"mine\" — the trigger renders the reference's selected look at load", () => {
    expect(page).toMatch(/useState<"all" \| "mine">\("mine"\)/);
  });
});

describe("surveys Avg Sentiment zero value (session 17, R16-A)", () => {
  const page = read("src", "app", "(app)", "surveys", "page.tsx");

  it("the Avg Sentiment tile renders \"0%\" at zero surveys (REF keeps the number)", () => {
    expect(page).toMatch(/: "0%"/);
    expect(page).not.toMatch(/: "%"/);
  });
});

describe("workflowautomation zero-render (session 17, R16-B)", () => {
  const page = read("src", "app", "(app)", "workflowautomation", "page.tsx");

  it("renders NOTHING below the stat row at 0 workflows (the employees zero-render pattern)", () => {
    expect(page).not.toContain("No workflows yet");
    expect(page).not.toMatch(/<EmptyState/);
  });

  it("keeps the header Create Workflow CTA as the affordance (offboarding R13-G pattern)", () => {
    expect(page).toMatch(/Create Workflow/);
  });
});

describe("chat sidebar zero state (session 17, R16-C)", () => {
  const page = read("src", "app", "(app)", "chat", "page.tsx");

  it("renders the reference's simple p-8 text-center recipe — 48px MessageCircle + ONE text-sm line", () => {
    expect(page).toMatch(/p-8 text-center/);
    expect(page).toMatch(/MessageCircle/);
    expect(page).toMatch(/mx-auto mb-3 h-12 w-12 text-slate-300/);
    expect(page).toMatch(/text-sm text-slate-500/);
    expect(page).toContain("No conversations yet");
  });

  it("does NOT render the h3 EmptyState in the sidebar", () => {
    const sidebar = page.slice(page.indexOf("overflow-y-auto"), page.indexOf("flex-1 overflow-y-auto") + 3000);
    expect(sidebar).not.toMatch(/<EmptyState/);
    expect(sidebar).not.toContain("Start a new conversation");
  });

  it("the right pane renders the bare centered recipe — 80px MessageCircle + h3 + p, NO p-8 pane padding", () => {
    expect(page).toMatch(/flex flex-1 items-center justify-center">\s*<div className="text-center">/);
    expect(page).toMatch(/MessageCircle className="mx-auto mb-4 h-20 w-20 text-slate-300"/);
    expect(page).not.toMatch(/justify-center p-8">/);
  });
});

describe("StatCard tile shrink (session 17, R16-D)", () => {
  const statCard = read("src", "components", "shared", "stat-card.tsx");

  it("the shared tile carries NO shrink-0 — REF's tile flex-shrinks at constrained card widths (analytics @768)", () => {
    expect(statCard).not.toContain('cn(tileClasses, "shrink-0", tile)');
    expect(statCard).toContain("cn(tileClasses, tile)");
  });
});

describe("Focus-ring recipes (session 19, R18-A..G — the interaction-parity dimension)", () => {
  const button = read("src", "components", "ui", "button.tsx");
  const input = read("src", "components", "ui", "input.tsx");
  const select = read("src", "components", "ui", "select.tsx");
  const tabs = read("src", "components", "ui", "tabs.tsx");
  const login = read("src", "app", "login", "page.tsx");
  const globals = read("src", "app", "globals.css");

  it("R18-A: the Button base renders REF's 1px no-offset ring — ring-1 ring-ring, NOT ring-2/ring-offset-1", () => {
    expect(button).toContain(
      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    );
    expect(button).not.toContain("focus-visible:ring-2");
    expect(button).not.toContain("focus-visible:ring-offset-1");
  });

  it("R18-B: Input and Textarea render REF's ring-offset-2 (white 2px + ring 2px), NOT offset-1", () => {
    expect(input).toContain(
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    );
    expect(input).not.toContain("focus-visible:ring-offset-1");
    // both components (Input + Textarea) in one file — the recipe must appear twice
    expect(input.match(/focus-visible:ring-offset-2/g)?.length).toBe(2);
  });

  it("R18-C: sidebar leaf links, group buttons and sub-items focus in REF's sidebar-ring blue, NOT the dark ring token", () => {
    expect(sidebarNav).toContain("focus-visible:ring-2 focus-visible:ring-sidebar-ring");
    expect(sidebarNav).not.toContain("focus-visible:ring-2 focus-visible:ring-ring");
    // three call sites: leaf, group, sub-item
    expect(sidebarNav.match(/focus-visible:ring-sidebar-ring/g)?.length).toBe(3);
  });

  it("R18-C: globals.css pins the sidebar-ring token to REF's blue-500 (#3B82F6 = 217.2 91.2% 59.8%)", () => {
    expect(globals).toContain("--color-sidebar-ring: #3b82f6");
  });

  it("R18-D: the mobile hamburger carries REF's button focus recipe (the bare button had none)", () => {
    const shell = appShell.slice(appShell.indexOf("Toggle Sidebar"), appShell.indexOf("Toggle Sidebar") + 700);
    expect(shell).toContain("focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring");
  });

  it("R18-E: login inputs carry REF's page-level slate-400 focus pair", () => {
    // focus-visible:ring-slate-400 (NOT focus:) — same variant as the base's
    // ring-ring so tailwind-merge deterministically dedups the color; the
    // bare focus: variant loses the v4 cascade battle against the base.
    expect(login).toContain("focus:border-slate-400 focus-visible:ring-slate-400");
    expect(login.match(/focus-visible:ring-slate-400/g)?.length).toBe(2);
  });

  it("R18-E: the login Sign in ring is REF's page-scoped zinc-950 (#09090B), NOT slate-400", () => {
    const submit = login.slice(login.indexOf('type="submit"'), login.indexOf('type="submit"') + 700);
    expect(submit).toContain("focus-visible:ring-[#09090b]");
    expect(submit).not.toContain("ring-slate-400");
  });

  it("R18-F: the Select trigger uses REF's button recipe — focus-visible:ring-1, NOT focus:ring-2", () => {
    expect(select).toContain(
      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    );
    expect(select).not.toContain("focus:ring-2");
  });

  it("R18-G: the TabsTrigger adds REF's ring-offset-2 (4px total ring)", () => {
    expect(tabs).toContain(
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    );
  });
});

/**
 * Session-20 parity recipes — the HOVER/ACTIVE dimension (parity round 19).
 * Every recipe measured live on both apps with real :hover (CDP mouse moves;
 * LOC probed through the documented v4 @media (hover: hover) polyfill — see
 * docs/remediation-plan-session20.md). Settled reads (>= 2s) — REF's
 * transition-all duration-200 produces mid-flight artifacts at ~750ms.
 */
describe("session-20 hover recipes (parity round 19)", () => {
  const employeesPage = read("src", "app", "(app)", "employees", "page.tsx");
  const staffrequestsPage = read("src", "app", "(app)", "staffrequests", "page.tsx");
  const loginPage = read("src", "app", "login", "page.tsx");
  const dropdownMenu = read("src", "components", "ui", "dropdown-menu.tsx");

  it("R19-A: inactive leaf + sub-item hover = sidebar-accent zinc-100 bg + sidebar-accent-foreground text (NOT the stale #e4e6eb)", () => {
    expect(sidebarNav).toContain("hover:bg-[#f4f4f5] hover:text-[#18181b]");
    expect(sidebarNav).not.toContain("hover:bg-[#e4e6eb]");
    expect(sidebarNav).toContain("hover:opacity-80");
  });

  it("R19-B: the ACTIVE leaf hover flips text to #18181b (bg stays primary; REF's custom-primary-bg beats its hover:bg-sidebar-accent; session 21 adds the active:text twin)", () => {
    expect(sidebarNav).toMatch(
      /"bg-primary font-medium text-white shadow-sm hover:text-\[#18181b\] active:text-\[#18181b\]"/
    );
  });

  it("R19-C: Bell button = ghost hover:bg-accent + hover:text-accent-foreground; the ICON owns text-slate-600 (survives hover)", () => {
    expect(sidebarNav).toMatch(
      /aria-label="Notifications"[\s\S]{0,700}?hover:bg-accent hover:text-accent-foreground/
    );
    expect(sidebarNav).toMatch(/<Bell className="h-4 w-4 text-slate-600"/);
    // the BUTTON itself carries no color class (the icon owns it)
    expect(sidebarNav).toMatch(
      /className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"/
    );
  });

  it("R19-C2: Moon button keeps zinc-700 base + hover:bg-accent hover:text-accent-foreground", () => {
    expect(sidebarNav).toMatch(
      /text-zinc-700 transition-colors hover:bg-accent hover:text-accent-foreground/
    );
    expect(sidebarNav).not.toContain("hover:text-foreground");
  });

  it("R19-D: the user name span renders slate-900 (rgb(15,23,42) — DOM-verified class), NOT the stale R15 zinc-700", () => {
    expect(sidebarNav).toMatch(
      /<p className="truncate text-sm font-medium text-slate-900">\{user\.name\}<\/p>/
    );
    expect(sidebarNav).not.toMatch(/text-sm font-medium text-zinc-700/);
  });

  it("R19-F: Import CSV = outline + border-blue-300 + text-blue-700 + hover:bg-blue-50 (REF's blue-tinted outline)", () => {
    const csvBlock = employeesPage.slice(
      employeesPage.indexOf("Import CSV") - 600,
      employeesPage.indexOf("Import CSV")
    );
    expect(csvBlock).toContain("text-blue-700");
    expect(csvBlock).toContain("border-blue-300");
    expect(csvBlock).toContain("hover:bg-blue-50");
  });

  it("R19-G: staffrequests search placeholder uses REF's three ASCII dots (NOT U+2026)", () => {
    expect(staffrequestsPage).toContain('placeholder="Search requests..."');
    expect(staffrequestsPage).not.toContain("Search requests…");
  });

  it("R19-H: login Sign in carries REF's shadow-sm (rgba(0,0,0,0.05) 0 1px 2px)", () => {
    const signinBlock = loginPage.slice(
      loginPage.indexOf("type=\"submit\""),
      loginPage.indexOf("Sign in</button>")
    );
    expect(signinBlock).toContain("shadow-sm");
  });

  it("R19-I: login forgot link hovers text only — NO underline (REF has none)", () => {
    const forgotBlock = loginPage.slice(
      loginPage.indexOf("Forgot password?") - 300,
      loginPage.indexOf("Forgot password?")
    );
    expect(forgotBlock).not.toContain("hover:underline");
    expect(forgotBlock).toContain("hover:text-slate-700");
  });

  it("R19-J: mobile hamburger inherits foreground (NO base color class) + hover:bg-slate-100 hover:text-accent-foreground", () => {
    expect(appShell).toMatch(
      /className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-slate-100 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"/
    );
  });

  it("R19-K: mobile bottom tabs have NO hover color change (REF renders none; session 21 re-pinned for the bg-blue-50 active pill — R20-B)", () => {
    const tabsBlock = appShell.slice(
      appShell.indexOf("min-h-[44px]"),
      appShell.indexOf("min-h-[44px]") + 900
    );
    expect(tabsBlock).toContain('active ? "bg-blue-50 text-blue-600" : "text-slate-600"');
    expect(tabsBlock).not.toContain("hover:text-foreground");
  });

  it("R19-L: dropdown primitive items focus in accent + accent-foreground (NOT secondary)", () => {
    expect(dropdownMenu).toContain("focus:bg-accent focus:text-accent-foreground");
    expect(dropdownMenu).not.toContain("focus:bg-secondary");
  });

  it("R19-L: sidebar user-menu items — My Profile accent recipe; Logout keeps text-red-600 but drops focus:bg-red-50", () => {
    const menuBlock = sidebarNav.slice(sidebarNav.indexOf("function UserMenu"));
    expect(menuBlock).toContain("focus:bg-accent focus:text-accent-foreground");
    expect(menuBlock).not.toContain("focus:bg-secondary");
    expect(menuBlock).not.toContain("focus:bg-red-50");
    expect(menuBlock).toContain("text-red-600");
  });
});

describe("session-21 pressed-state recipes (parity round 20 — the :active dimension)", () => {
  it("R20-A: group button pressed = sidebar-accent zinc-100 + #18181B (active: beats the blue hover in rule order)", () => {
    expect(sidebarNav).toMatch(
      /text-slate-600 hover:bg-blue-50 hover:text-blue-700 active:bg-\[#f4f4f5\] active:text-\[#18181b\]/
    );
  });

  it("R20-E: the EXPANDED group hovers GRAY — data-[state=open]:hover: sidebar tokens (NOT the blue collapsed hover)", () => {
    expect(sidebarNav).toContain(
      "data-[state=open]:hover:bg-[#f4f4f5] data-[state=open]:hover:text-[#18181b]"
    );
  });

  it("R20-C: inactive leaf + sub-item carry the authored active: pair (desktop-pressed rides hover; the classes restore the recipe + the tap-press moment)", () => {
    const inactive = 'font-normal text-slate-600 hover:bg-[#f4f4f5] hover:text-[#18181b] active:bg-[#f4f4f5] active:text-[#18181b]';
    expect(sidebarNav).toContain(inactive);
    // both branches (NavLink leaf + sub-item) — the string appears twice
    expect(sidebarNav.split(inactive).length - 1).toBe(2);
  });

  it("R20-D: the ACTIVE leaf pressed keeps the blue bg (v4: an active:bg utility would beat bg-primary — REF's unlayered custom class doesn't) and flips text to #18181B", () => {
    const activeBranch = 'bg-primary font-medium text-white shadow-sm hover:text-[#18181b] active:text-[#18181b]';
    expect(sidebarNav).toContain(activeBranch);
    expect(sidebarNav.split(activeBranch).length - 1).toBe(2);
    // the documented deviation: active:bg appears ONLY on the 3 inactive
    // surfaces (leaf, sub-item, group) — never on an active branch (the
    // exact positive branch strings above cannot contain it)
    expect(sidebarNav.split("active:bg-[").length - 1).toBe(3);
    expect(sidebarNav).not.toContain("active:bg-sidebar-accent");
  });

  it("R20-B: the active mobile bottom tab renders the bg-blue-50 pill (REF pixel-verified rgb(239,246,255))", () => {
    const tabsBlock = appShell.slice(
      appShell.indexOf("min-h-[44px]"),
      appShell.indexOf("min-h-[44px]") + 900
    );
    expect(tabsBlock).toContain('active ? "bg-blue-50 text-blue-600" : "text-slate-600"');
  });
});

describe("session-22 transition + animation recipes (parity round 21 — the motion dimension)", () => {
  it("R21-A: the group trigger transitions over 200ms like every REF nav item (measured settle ~269ms REF vs ~229ms clone at 150ms)", () => {
    const trigIdx = sidebarNav.indexOf("flex h-8 w-full items-center gap-2 rounded-lg px-2 py-2");
    expect(trigIdx).toBeGreaterThan(-1);
    const trigBlock = sidebarNav.slice(trigIdx, trigIdx + 320);
    expect(trigBlock).toContain("transition-all duration-200");
    expect(trigBlock).not.toContain("transition-colors");
  });

  it("R21-D: the group chevron SNAPS (REF authors no chevron motion classes — computed all 0s; the swing was a clone extra)", () => {
    const chevIdx = sidebarNav.indexOf('open && "rotate-90"');
    expect(chevIdx).toBeGreaterThan(-1);
    const chevBlock = sidebarNav.slice(chevIdx - 220, chevIdx + 40);
    expect(chevBlock).not.toContain("transition-transform");
    expect(chevBlock).not.toContain("duration-200");
  });

  it("R21-B1: globals.css carries the enter/exit keyframes + the v4 utility subset (the plugin classes generate real CSS)", () => {
    expect(globalsCss).toContain("@keyframes enter");
    expect(globalsCss).toContain("@keyframes exit");
    for (const u of [
      "animate-in",
      "animate-out",
      "fade-in-0",
      "fade-out-0",
      "fade-in",
      "fade-out",
      "zoom-in-95",
      "zoom-out-95",
      "slide-in-from-left",
      "slide-out-to-left",
      "slide-in-from-bottom-2",
    ]) {
      expect(globalsCss).toContain(`@utility ${u}`);
    }
    // the keyframes read the enter/exit custom properties with unit fallbacks
    expect(globalsCss).toContain("--tw-enter-opacity");
    expect(globalsCss).toContain("--tw-exit-translate-x");
  });

  it("R21-B2: the select content animates like REF's (enter 0.15s, fade + zoom — measured on the attendance select)", () => {
    const selIdx = selectUi.indexOf("SelectPrimitive.Content");
    expect(selIdx).toBeGreaterThan(-1);
    const selBlock = selectUi.slice(selIdx, selIdx + 950);
    expect(selBlock).toContain("data-[state=open]:animate-in");
    expect(selBlock).toContain("data-[state=open]:fade-in-0");
    expect(selBlock).toContain("data-[state=open]:zoom-in-95");
    expect(selBlock).toContain("data-[state=closed]:animate-out");
    expect(selBlock).toContain("data-[state=closed]:fade-out-0");
    expect(selBlock).toContain("data-[state=closed]:zoom-out-95");
  });

  it("R21-B3: the sidebar user dropdown animates (REF-measured enter 0.15s on the same recipe)", () => {
    const ddIdx = sidebarNav.indexOf("z-50 min-w-[200px]");
    expect(ddIdx).toBeGreaterThan(-1);
    const ddBlock = sidebarNav.slice(ddIdx, ddIdx + 700);
    expect(ddBlock).toContain("data-[state=open]:animate-in");
    expect(ddBlock).toContain(
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
    );
    expect(ddBlock).toContain("data-[state=closed]:animate-out");
  });

  it("R21-C: the mobile drawer slides (REF: 500ms open / 300ms close with the vaul cubic-bezier(0.32,0.72,0,1); the overlay fades 150ms — the mount-fresh drawer could never run a transition)", () => {
    const ovIdx = appShell.indexOf("bg-[rgba(0,0,0,0.8)]");
    expect(ovIdx).toBeGreaterThan(-1);
    const ovBlock = appShell.slice(ovIdx, ovIdx + 500);
    expect(ovBlock).toContain("data-[state=open]:animate-in");
    expect(ovBlock).toContain("data-[state=open]:fade-in");
    expect(ovBlock).toContain("data-[state=closed]:animate-out");
    expect(ovBlock).toContain("data-[state=closed]:fade-out");
    expect(ovBlock).not.toContain("transition-opacity");

    const panelIdx = appShell.indexOf("w-[288px]");
    expect(panelIdx).toBeGreaterThan(-1);
    const panelBlock = appShell.slice(panelIdx, panelIdx + 800);
    expect(panelBlock).toContain("data-[state=open]:animate-in");
    expect(panelBlock).toContain("data-[state=open]:slide-in-from-left");
    expect(panelBlock).toContain("data-[state=closed]:animate-out");
    expect(panelBlock).toContain("data-[state=closed]:slide-out-to-left");
    expect(panelBlock).toContain("data-[state=open]:[animation-duration:500ms]");
    expect(panelBlock).toContain("data-[state=closed]:[animation-duration:300ms]");
    expect(panelBlock).toContain("[animation-timing-function:cubic-bezier(0.32,0.72,0,1)]");
    expect(panelBlock).not.toContain("transition-transform");
  });

  it("R21-E: the toast card enters with a fade + slide (superset polish — REF's sonner animates but is unmeasurable; the old state-gated class never fired)", () => {
    const tIdx = toastUi.indexOf("pointer-events-auto flex items-start gap-3");
    expect(tIdx).toBeGreaterThan(-1);
    const tBlock = toastUi.slice(tIdx, tIdx + 700);
    expect(tBlock).toContain("animate-in fade-in slide-in-from-bottom-2");
    expect(tBlock).not.toContain("data-[state=open]:animate-in");
  });
});

describe("session-23 scroll-dimension recipes (parity round 22 — the scroll dimension + the dialog surface)", () => {
  it("R22-A1: the sidebar nav NEVER styles its scrollbar (REF authors zero scrollbar rules — computed auto everywhere; the nav scrolls live at 872>690 on expanded-group pages)", () => {
    const navIdx = sidebarNav.indexOf('className="flex-1 overflow-y-auto');
    expect(navIdx).toBeGreaterThan(-1);
    const navBlock = sidebarNav.slice(navIdx, navIdx + 160);
    expect(navBlock).toContain("overflow-y-auto");
    expect(navBlock).not.toContain("scrollbar-thin");
    // the whole file carries no scrollbar styling at all
    expect(sidebarNav).not.toContain("scrollbar-thin");
  });

  it("R22-A2: the dialog content keeps the 85vh fitting cap + auto scroll but drops the styled scrollbar (REF: oy visible + no max-height — its own clip-prone family; scrollbar-thin was a clone extra)", () => {
    const dIdx = dialogUi.indexOf("max-h-[85vh] overflow-y-auto");
    expect(dIdx).toBeGreaterThan(-1);
    const dBlock = dialogUi.slice(dIdx - 60, dIdx + 220);
    expect(dBlock).toContain("max-h-[85vh] overflow-y-auto");
    expect(dBlock).not.toContain("scrollbar-thin");
    expect(dialogUi).not.toContain("scrollbar-thin");
  });

  it("R22-A3: globals.css no longer ships the .scrollbar-thin class (the session-1 scaffold extra — deleted, not neutralized)", () => {
    expect(globalsCss).not.toContain(".scrollbar-thin");
    expect(globalsCss).not.toContain("scrollbar-width: thin");
    expect(globalsCss).not.toContain("::-webkit-scrollbar");
  });

  it("R22-B: TabsContent carries mb-0! — the v4 trailing space-y killer (v4 emits margin-block-end on :not(:last-child); the ACTIVE content followed only by display:none Radix siblings kept mb-24 → 24px phantom below tab cards; REF's v3 margin-top model never trails; measured /settings docH 943 vs 919)", () => {
    const cIdx = tabsUi.indexOf("TabsPrimitive.Content");
    expect(cIdx).toBeGreaterThan(-1);
    const cBlock = tabsUi.slice(cIdx, cIdx + 400);
    expect(cBlock).toContain("mb-0!");
  });

  it("R22-C1: the loans dialog is 672px with an H2-only header (REF max-w-2xl measured 672; the description was a clone extra)", () => {
    const dlgIdx = loansPage.indexOf("<DialogContent");
    expect(dlgIdx).toBeGreaterThan(-1);
    const dlgBlock = loansPage.slice(dlgIdx, dlgIdx + 400);
    expect(dlgBlock).toContain("max-w-2xl");
    const hdrIdx = loansPage.indexOf("<DialogHeader>");
    const hdrBlock = loansPage.slice(hdrIdx, hdrIdx + 260);
    expect(hdrBlock).toContain("<DialogTitle>New Loan Request</DialogTitle>");
    expect(hdrBlock).not.toContain("DialogDescription");
  });

  it("R22-C2: the loans form carries the REF field set — Loan Type select (4 options), Amount, Duration, the computed Monthly Installment display, Reason (min-h-[60px]), Paid From", () => {
    expect(loansPage).toContain("Loan Type");
    for (const opt of ["Standard Loan", "Emergency Loan", "Salary Advance", "Personal Loan"]) {
      expect(loansPage).toContain(opt);
    }
    expect(loansPage).toContain("Amount (SAR)");
    expect(loansPage).toContain("Duration (Months)");
    expect(loansPage).toContain("Monthly Installment");
    expect(loansPage).toContain("Paid From");
    expect(loansPage).toContain("min-h-[60px]");
    // the installment display recipe: p-2.5 bg-slate-100 border (read-only SAR 0.00 family)
    expect(loansPage).toContain("p-2.5 bg-slate-100 border");
    // the field rows use the REF space-y-2 recipe (label + control), not gap-1.5
    expect(loansPage).not.toContain("flex flex-col gap-1.5");
  });

  it("R22-C3: the loans form renders the Requesting-for preview card when an employee is selected (p-4 bg-blue-50 rounded-lg, 20px user icon, name + email)", () => {
    expect(loansPage).toContain("bg-blue-50");
    const cardIdx = loansPage.indexOf("bg-blue-50");
    const cardBlock = loansPage.slice(cardIdx - 200, cardIdx + 500);
    expect(cardBlock).toContain("p-4");
    expect(cardBlock).toContain("rounded-lg");
    expect(cardBlock).toContain("Requesting for");
  });

  it("R22-C4: the loans actions row is justify-end gap-3 with the Submit Request label (REF-measured; the col-reverse Create Request was a clone extra)", () => {
    expect(loansPage).toContain("flex justify-end gap-3");
    expect(loansPage).toContain("Submit Request");
    expect(loansPage).not.toContain("flex-col-reverse");
    expect(loansPage).not.toContain("Create Request");
  });

  it("R22-C5: the Loan API accepts loanType + paidFrom and the schema stores them (the REF functional field set)", () => {
    expect(loansApi).toContain("loanType");
    expect(loansApi).toContain("paidFrom");
    expect(prismaSchema).toMatch(/loanType\s+String\s+@default\("standard"\)/);
    expect(prismaSchema).toMatch(/paidFrom\s+String\?/);
  });

  it("R22-C6: the loans table surfaces the loan type (REF's table is unmeasurable at zero data — the Type column is the superset display)", () => {
    const theadIdx = loansPage.indexOf("<TableHead>Employee</TableHead>");
    expect(theadIdx).toBeGreaterThan(-1);
    const theadBlock = loansPage.slice(theadIdx, theadIdx + 420);
    expect(theadBlock).toContain("<TableHead>Type</TableHead>");
  });

  it("R22-D: the compliance monitor tab renders Expired FIRST + the At-Risk Employees table title (REF-measured order + title; the clone had them swapped/retitled)", () => {
    const statsIdx = compliancePage.indexOf('variant="mini-centered"');
    expect(statsIdx).toBeGreaterThan(-1);
    const statsBlock = compliancePage.slice(statsIdx, statsIdx + 900);
    const expiredIdx = statsBlock.indexOf('label="Expired"');
    const d7Idx = statsBlock.indexOf('label="Expiring ≤ 7 days"');
    expect(expiredIdx).toBeGreaterThan(-1);
    expect(d7Idx).toBeGreaterThan(-1);
    expect(expiredIdx).toBeLessThan(d7Idx);
    expect(compliancePage).toContain("At-Risk Employees");
    // the monitor tab's table card title is At-Risk Employees, NOT Document Expiry Monitor
    const titleIdx = compliancePage.indexOf("At-Risk Employees");
    const titleBlock = compliancePage.slice(Math.max(0, titleIdx - 350), titleIdx + 40);
    expect(titleBlock).not.toContain("Document Expiry Monitor");
  });

  it("R22-E: the hrreports table th is the compact uppercase recipe with lowercase DOM texts + a header-only table at 0 records (REF: 33px th, no empty state — card 139px)", () => {
    // the lowercase DOM texts live in the TABLE_HEADERS const (the CSV export keeps the uppercase literals)
    expect(hrreportsPage).toContain('const TABLE_HEADERS = ["full name", "job title", "department id", "employment status", "employment type", "start date"]');
    const tableIdx = hrreportsPage.indexOf("<TableHead");
    expect(tableIdx).toBeGreaterThan(-1);
    const tableBlock = hrreportsPage.slice(tableIdx, tableIdx + 500);
    expect(tableBlock).toContain("px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase");
    // no EmptyState in the table card — 0 records renders the header row only
    const cardIdx = hrreportsPage.indexOf("Data Table (${");
    expect(cardIdx).toBeGreaterThan(-1);
    const cardBlock = hrreportsPage.slice(cardIdx, cardIdx + 2200);
    expect(cardBlock).not.toContain("EmptyState");
    expect(cardBlock).not.toContain("No records found");
  });

  it("R22-F: the attendancedashboard summary table th is the 37px all-left recipe + the bare py-8 P empty state (REF: text-left py-2 px-3 text-slate-500 font-medium on ALL six columns; P 'No employees found for selected filter.' — not the EmptyState component)", () => {
    const tblIdx = attDashboard.indexOf('className="text-left py-2 px-3 text-slate-500 font-medium">Employee');
    expect(tblIdx).toBeGreaterThan(-1);
    const tblBlock = attDashboard.slice(tblIdx - 400, tblIdx + 900);
    expect(tblBlock).toContain("text-left py-2 px-3 text-slate-500 font-medium");
    expect(tblBlock).not.toContain("text-right");
    expect(attDashboard).toContain("text-center text-slate-400 py-8");
    expect(attDashboard).toContain("No employees found for selected filter.");
    // the P replaces the EmptyState component in the summary card
    const sumIdx = attDashboard.indexOf("Employee Attendance Summary");
    expect(sumIdx).toBeGreaterThan(-1);
    const sumBlock = attDashboard.slice(sumIdx, sumIdx + 2600);
    expect(sumBlock).not.toContain("<EmptyState");
  });
});

describe("session-24 cursor + selection recipes (parity round 23 — the cursor dimension)", () => {
  const dashPage = read("src", "app", "(app)", "dashboard", "page.tsx");
  const employeesPage = read("src", "app", "(app)", "employees", "page.tsx");
  const payrollPage = read("src", "app", "(app)", "payroll", "page.tsx");
  const attendancePage = read("src", "app", "(app)", "attendance", "page.tsx");
  const leavePage = read("src", "app", "(app)", "leavemanagement", "page.tsx");
  const expensesPage = read("src", "app", "(app)", "expenses", "page.tsx");
  const taskPage = read("src", "app", "(app)", "taskmanager", "page.tsx");
  const settingsPage = read("src", "app", "(app)", "settings", "page.tsx");

  it("R23-A: the base layer re-authors the v3 preflight button cursor (v4 removed button{cursor:pointer}; REF computes pointer on 100% of measured buttons — group toggles, header chrome, dialogs, login)", () => {
    const baseIdx = globalsCss.indexOf("@layer base");
    expect(baseIdx).toBeGreaterThan(-1);
    const baseBlock = globalsCss.slice(baseIdx, baseIdx + 800);
    expect(baseBlock).toContain("button {");
    expect(baseBlock).toContain("cursor: pointer");
  });

  it("R23-B1: the dashboard page root carries select-none (REF wraps its 8 core-module pages in a user-select:none container — the touch-pan-y layer)", () => {
    expect(dashPage).toContain('className="p-4 md:p-8 space-y-8 select-none"');
  });

  it("R23-B2: the employees page root carries select-none", () => {
    expect(employeesPage).toContain('className="p-4 md:p-8 select-none"');
  });

  it("R23-B3..B8: the six gradient-rooted core pages carry select-none (payroll, attendance, leavemanagement, expenses, loans, taskmanager — the REF-wrapped family)", () => {
    const roots: [string, string][] = [
      ["payroll", payrollPage],
      ["attendance", attendancePage],
      ["leavemanagement", leavePage],
      ["expenses", expensesPage],
      ["loans", loansPage],
      ["taskmanager", taskPage],
    ];
    for (const [name, src] of roots) {
      const m = src.match(/className="min-h-screen[^"]*"/);
      expect(m, name).toBeTruthy();
      expect(m?.[1] ?? m?.[0], name).toContain("select-none");
    }
  });

  it("R23-B-scope: settings (the representative of the 38 unwrapped REF routes) stays selectable — REF renders its tabs directly in the page root with no touch-pan-y layer", () => {
    const m = settingsPage.match(/className="min-h-screen[^"]*"/);
    expect(m).toBeTruthy();
    expect(m?.[0]).not.toContain("select-none");
  });
});

describe("session-25 a11y attribute recipes (parity round 24 — the aria dimension)", () => {
  const popoverUi = read("src", "components", "ui", "popover.tsx");

  it("R24-A: the CollapsibleNavItem authors a stable content id — the Trigger carries aria-controls in BOTH states (REF's 9 group toggles all carry it; Radix only sets it when open)", () => {
    // the stable id exists
    expect(sidebarNav).toContain("const contentId = React.useId()");
    // the trigger carries the override (user props spread after Radix's own)
    expect(sidebarNav).toContain("aria-controls={contentId}");
    // the content mounts with the SAME id so the reference resolves when open
    expect(sidebarNav).toMatch(/<Collapsible\.Content\s+id=\{contentId\}/);
  });

  it("R24-B1: the shadcn popover primitive exists (Root/Trigger/Content over @radix-ui/react-popover — the bell needs it)", () => {
    expect(popoverUi).toContain('@radix-ui/react-popover');
    expect(popoverUi).toContain("PopoverPrimitive.Portal");
    expect(popoverUi).toContain("PopoverPrimitive.Content");
    expect(popoverUi).toContain("PopoverPrimitive.Trigger");
  });

  it("R24-B2: the bell is a real popover trigger (REF's bell: haspopup=dialog + expanded + controls EVEN CLOSED; the clone's was a dead button — the only measured surface where REF did more)", () => {
    expect(sidebarNav).toContain("PopoverTrigger");
    // the closed-state aria-controls override (same stable-id trick as R24-A —
    // Radix only authors it while open; REF's measured radix-:ro: persists closed)
    expect(sidebarNav).toContain("aria-controls={bellContentId}");
    expect(sidebarNav).toMatch(/<PopoverContent[^>]*id=\{bellContentId\}/);
    // REF's popover lands x=0 (16px LEFT of the bell's left edge — measured
    // translate(0px, 617px); sideOffset 4 default keeps y=617)
    expect(sidebarNav).toContain("alignOffset={-16}");
    // the w-96 (384px) content with the REF-measured recipe
    expect(sidebarNav).toContain('className="w-96"');
    // the header row: h3 font-semibold text-slate-900 Notifications + border-b
    expect(sidebarNav).toMatch(/h3[^>]*font-semibold text-slate-900/);
    expect(sidebarNav).toContain("Notifications</h3>");
    // the empty-state body: py-8 text-center text-slate-500 + the faded bell icon
    expect(sidebarNav).toContain("py-8 text-center text-slate-500");
    expect(sidebarNav).toContain("h-8 w-8 mx-auto mb-2 opacity-30");
    expect(sidebarNav).toContain("No notifications yet");
  });

  it("R24-B-scope: only the bell gains the popover — the moon and the عربي language buttons stay plain buttons (REF authors no popover on them)", () => {
    const popoverUses = sidebarNav.match(/<Popover>/g) ?? [];
    expect(popoverUses.length).toBe(1);
    const bellIdx = sidebarNav.indexOf('aria-label="Notifications"');
    const popoverIdx = sidebarNav.indexOf("<Popover>");
    expect(popoverIdx).toBeGreaterThan(-1);
    expect(bellIdx).toBeGreaterThan(popoverIdx);
    // the moon button keeps its plain onClick toggle (no popover wrap)
    const moonIdx = sidebarNav.indexOf('aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}');
    expect(moonIdx).toBeGreaterThan(-1);
  });
});

describe("session-26 SEO/meta recipes (parity round 25 — the head dimension)", () => {
  const rootLayout = read("src", "app", "layout.tsx");
  let loginLayout = "";
  try { loginLayout = read("src", "app", "login", "layout.tsx"); } catch { /* RED until created */ }

  // PNG IHDR dimension reader (bytes 16..24: width/height big-endian)
  const pngSize = (...p: string[]) => {
    const b = readFileSync(join(process.cwd(), ...p));
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  };

  it("R25-A1: pageMetadata implements REF's mechanical title rule — slug-capitalized + the site template (taskmanager renders 'Taskmanager', NOT the human 'Tasks & Projects')", async () => {
    const { pageMetadata } = await import("@/lib/meta");
    const employees = pageMetadata("/employees");
    expect(employees.title).toBe("Employees");
    const taskmanager = pageMetadata("/taskmanager");
    expect(taskmanager.title).toBe("Taskmanager");
    const compliance = pageMetadata("/compliancedashboard");
    expect(compliance.title).toBe("Compliancedashboard");
    // compound slug stays whole — no word splitting
    const hrletters = pageMetadata("/hrletters");
    expect(hrletters.title).toBe("Hrletters");
  });

  it("R25-A2: the dashboard special-case — REF serves its dashboard at '/' so the title is the plain site name (no template)", async () => {
    const { pageMetadata } = await import("@/lib/meta");
    const dashboard = pageMetadata("/dashboard");
    expect(dashboard.title).toEqual({ absolute: "Eon HR" });
  });

  it("R25-A3: the description prefix rule — '<Name> on Eon HR.' + the clone's own base copy (REF's OnboardFlow template junk is NOT replicated — same divergence family as the base44 branding)", async () => {
    const { pageMetadata, BASE_DESCRIPTION } = await import("@/lib/meta");
    const employees = pageMetadata("/employees");
    expect(employees.description).toBe(`Employees on Eon HR. ${BASE_DESCRIPTION}`);
    // REF's junk copy must not leak into the clone
    expect(employees.description ?? "").not.toContain("OnboardFlow");
    expect(BASE_DESCRIPTION).toContain("Eon HR");
  });

  it("R25-B/C: every route carries canonical + og:title/description/url + twitter card fields (REF: 6 og + 5 twitter per app route)", async () => {
    const { pageMetadata } = await import("@/lib/meta");
    const m = pageMetadata("/employees");
    expect(m.alternates?.canonical).toBe("/employees");
    const og = m.openGraph as Record<string, unknown>;
    // REF's og:title is the FULL templated string (og tags don't ride the
    // title template — measured "og:title=Employees | Eon HR" on REF)
    expect(og.title).toBe("Employees | Eon HR");
    // type + siteName repeat per-route: Next REPLACES the parent openGraph
    // object with the child's — root defaults alone vanish (verified live)
    expect(og.type).toBe("website");
    expect(og.siteName).toBe("Eon HR");
    expect(og.description).toContain("Employees on Eon HR.");
    expect(og.url).toBe("/employees");
    const images = og.images as Array<Record<string, unknown>>;
    expect(images[0]?.url).toBe("/og-image.png");
    const tw = m.twitter as Record<string, unknown>;
    expect(tw.card).toBe("summary_large_image");
    expect(tw.title).toBe("Employees | Eon HR");
    expect(tw.description).toContain("Employees on Eon HR.");
    const twImages = tw.images as Array<Record<string, unknown>>;
    expect(twImages[0]?.url).toBe("/og-image.png");
  });

  it("R25-C1: the root layout derives metadataBase from the request host (headers()) so canonical/og URLs resolve against the ACTUAL serving origin — self-consistent on any deployment", () => {
    expect(rootLayout).toContain("generateMetadata");
    expect(rootLayout).toContain("headers()");
    expect(rootLayout).toContain("metadataBase");
    expect(rootLayout).toContain("x-forwarded-proto");
  });

  it("R25-B2: the root layout authors the site-level og/twitter defaults (og:site_name + og:type survive per-route overrides via Next's shallow merge) and the icon link", () => {
    expect(rootLayout).toContain('siteName: "Eon HR"');
    expect(rootLayout).toContain('type: "website"');
    expect(rootLayout).toContain('card: "summary_large_image"');
    expect(rootLayout).toContain("icon-192.png");
  });

  it("R25-E1: the root layout renders the two REF JSON-LD schemas (WebSite + Organization with the own logo)", () => {
    expect(rootLayout).toContain("application/ld+json");
    expect(rootLayout).toContain('"@type": "WebSite"');
    expect(rootLayout).toContain('"@type": "Organization"');
    expect(rootLayout).toContain("/eon-logo.png");
  });

  it("R25-D1: the login layout carries REF's platform-shell distribution — absolute 'Eon HR' title, theme-color #000000, manifest, apple-touch-icon, og image dims/alt + twitter:image:alt", () => {
    expect(loginLayout).toContain('title: { absolute: "Eon HR" }');
    expect(loginLayout).toContain('themeColor: "#000000"');
    expect(loginLayout).toContain('manifest: "/manifest.json"');
    expect(loginLayout).toContain("apple-touch-icon.png");
    expect(loginLayout).toContain("width: 1200");
    expect(loginLayout).toContain("height: 630");
    expect(loginLayout).toContain('alt: "Eon HR"');
  });

  it("R25-E2: the login layout adds the BreadcrumbList JSON-LD (Home → login — REF's 3rd login script)", () => {
    expect(loginLayout).toContain("BreadcrumbList");
    expect(loginLayout).toContain('"Home"');
  });

  it("R25-A4 coverage: every (app) route dir has a layout.tsx exporting pageMetadata('<route>') — client pages cannot export metadata", () => {
    const base = join(process.cwd(), "src", "app", "(app)");
    const dirs = readdirSync(base, { withFileTypes: true }).filter((d) => d.isDirectory());
    expect(dirs.length).toBe(46);
    for (const d of dirs) {
      const layoutPath = join(base, d.name, "layout.tsx");
      expect(existsSync(layoutPath), `${d.name}/layout.tsx missing`).toBe(true);
      const src = read(layoutPath.slice(process.cwd().length + 1));
      expect(src, `${d.name}/layout.tsx must export metadata`).toContain("export const metadata");
      expect(src, `${d.name}/layout.tsx must reference its route`).toContain(`pageMetadata("/${d.name}")`);
    }
  });

  it("R25-D2: the asset family — og-image 1200x630 (the REF composition), icon-192/512 (square full logo), apple-touch-icon 180x180", () => {
    expect(pngSize("public", "og-image.png")).toEqual({ w: 1200, h: 630 });
    expect(pngSize("public", "icon-192.png")).toEqual({ w: 192, h: 192 });
    expect(pngSize("public", "icon-512.png")).toEqual({ w: 512, h: 512 });
    expect(pngSize("public", "apple-touch-icon.png")).toEqual({ w: 180, h: 180 });
  });

  it("R25-D3: manifest.json carries REF's field set with the clone's own copy", () => {
    const manifestJson = JSON.parse(read("public", "manifest.json"));
    expect(manifestJson.name).toBe("Eon HR");
    expect(manifestJson.short_name).toBe("Eon HR");
    expect(manifestJson.description).toContain("Eon HR");
    expect(manifestJson.description).not.toContain("OnboardFlow");
    expect(manifestJson.icons).toHaveLength(2);
    expect(manifestJson.icons.map((i: { sizes: string }) => i.sizes).sort()).toEqual(["192x192", "512x512"]);
    expect(manifestJson.start_url).toBe("/");
    expect(manifestJson.display).toBe("standalone");
    expect(manifestJson.theme_color).toBe("#000000");
    expect(manifestJson.background_color).toBe("#ffffff");
    expect(manifestJson.scope).toBe("/");
  });
});

describe("session-27 reduced-motion + kanban DnD recipes (parity round 26 — the a11y superset + the drag-drop superset)", () => {
  it("R26-A1: globals.css carries the prefers-reduced-motion block (both apps ignore the preference — the clone supersedes REF on the WCAG 2.3.3 a11y axis)", () => {
    expect(globalsCss).toContain("@media (prefers-reduced-motion: reduce)");
  });

  it("R26-A2: the block pins the modern-normalize recipe — 0.01ms animation/transition durations + iteration-count 1 + scroll-behavior auto (near-zero, never zero-none: Radix needs animationend to fire so portal close paths still unmount)", () => {
    const block = globalsCss.slice(globalsCss.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(block).toContain("animation-duration: 0.01ms");
    expect(block).toContain("transition-duration: 0.01ms");
    expect(block).toContain("animation-iteration-count: 1");
    expect(block).toContain("scroll-behavior: auto");
    // The Radix unmount trap: `animation: none` would starve the
    // animationend listener and hang every dialog/drawer/dropdown close.
    expect(block.slice(0, block.indexOf("}") + 1)).not.toContain("animation: none");
  });

  it("R26-A3: the block is UNLAYERED and !important — an unlayered important rule beats every v4 cascade layer (the session-21 unlayered-class lesson), so utility animation classes yield under reduce", () => {
    const idx = globalsCss.indexOf("@media (prefers-reduced-motion: reduce)");
    const block = globalsCss.slice(idx, idx + 700);
    expect(block).toContain("!important");
    // Must NOT live inside @layer base (layered rules lose to unlayered
    // utilities under the v4 cascade — the block would be dead code).
    const before = globalsCss.slice(0, idx);
    const openLayers = (before.match(/@layer base \{/g) || []).length;
    const closeLayers = (before.match(/\n\}/g) || []).length;
    expect(openLayers).toBeLessThanOrEqual(closeLayers);
  });

  it("R26-A4: under DEFAULT media the block is inert — parity is byte-identical (the 12-route geometry + motion regression sweeps re-prove it live; this pin locks the media scoping)", () => {
    const idx = globalsCss.indexOf("@media (prefers-reduced-motion: reduce)");
    expect(idx).toBeGreaterThan(-1);
    // The motion family stays intact OUTSIDE the media block.
    const outside = globalsCss.slice(0, idx);
    expect(outside).toContain("@keyframes enter");
    expect(outside).toContain("@utility animate-in");
    expect(outside).toContain("animation-duration: var(--tw-animate-duration, 0.15s)");
  });

  it("R26-B1: the kanban task card is HTML5-draggable (REF ships zero draggables — the superset), carrying the task id on dataTransfer and a mid-drag affordance", () => {
    const src = read("src", "app", "(app)", "taskmanager", "page.tsx");
    expect(src).toContain("draggable");
    expect(src).toContain("onDragStart");
    expect(src).toContain('dataTransfer.setData');
    expect(src).toContain("opacity-50");
    expect(src).toContain("onDragEnd");
  });

  it("R26-B2: the kanban columns are drop zones — dragover preventDefault (the HTML5 DnD contract) + a hover highlight + onDrop wired to the existing moveTask PATCH path", () => {
    const src = read("src", "app", "(app)", "taskmanager", "page.tsx");
    expect(src).toContain("onDragOver");
    expect(src).toContain("preventDefault");
    expect(src).toContain("onDrop");
    expect(src).toContain("moveTask(");
    // The keyboard/a11y path stays: the Move-to dropdown survives alongside DnD.
    expect(src).toContain("Move to");
  });
});

describe("session-28 DnD depth recipes (parity round 27 — the recruitment pipeline superset + the within-column reorder superset)", () => {
  it("R27-A1: the recruitment pipeline card is HTML5-draggable (REF ships zero draggables on /recruitmentkanban — re-verified round 27), carrying the candidate id on dataTransfer and a mid-drag affordance", () => {
    const src = read("src", "app", "(app)", "recruitmentkanban", "page.tsx");
    expect(src).toContain("draggable");
    expect(src).toContain("onDragStart");
    expect(src).toContain("dataTransfer.setData");
    expect(src).toContain("opacity-50");
    expect(src).toContain("onDragEnd");
  });

  it("R27-A2: the pipeline columns are drop zones — dragover preventDefault (the HTML5 DnD contract) + a hover highlight + onDrop wired to the existing onMove stage PATCH path; the Move-to dropdown stays as the keyboard path", () => {
    const src = read("src", "app", "(app)", "recruitmentkanban", "page.tsx");
    expect(src).toContain("onDragOver");
    expect(src).toContain("preventDefault");
    expect(src).toContain("onDrop");
    expect(src).toContain("onMove(");
    expect(src).toContain("Move to");
  });

  it("R27-A3: the draggable card carries the grab affordance (hover-state superset — REF's card shows the default cursor while being un-draggable; a draggable card that does not look draggable is a usability defect)", () => {
    const src = read("src", "app", "(app)", "recruitmentkanban", "page.tsx");
    expect(src).toContain("cursor-grab");
    expect(src).toContain("active:cursor-grabbing");
  });

  it("R27-B1: the Task model carries an explicit position column — the within-column order becomes persistent state (all existing rows backfill to 0; the createdAt tiebreak preserves today's newest-first render)", () => {
    const src = read("prisma", "schema.prisma");
    const taskBlock = src.slice(src.indexOf("model Task {"), src.indexOf("model Project {"));
    expect(taskBlock).toContain("position");
    expect(taskBlock).toContain("@default(0)");
  });

  it("R27-B2: GET /api/tasks orders by position asc with the createdAt desc tiebreak — array order IS render order for the optimistic reorder", () => {
    const src = read("src", "app", "api", "tasks", "route.ts");
    expect(src).toContain('orderBy: [{ position: "asc" }, { createdAt: "desc" }]');
  });

  it("R27-B3: PATCH /api/tasks accepts an order array — TaskPatch schema + the positional reassignment loop (position = index for every listed id, existence-validated)", () => {
    const src = read("src", "app", "api", "tasks", "route.ts");
    expect(src).toContain("order: z.array(");
    expect(src).toContain("data.order");
    // the reassignment loop + the existence validation
    expect(src).toMatch(/position: index|position: i\b/);
    expect(src).toMatch(/order[\s\S]*findMany|findMany[\s\S]*order/);
  });

  it("R27-B4: the taskmanager cards are insertion drop targets — onDragOver/onDrop on the card, the reorderTask function, and the { status?, order } PATCH body", () => {
    const src = read("src", "app", "(app)", "taskmanager", "page.tsx");
    expect(src).toContain("reorderTask");
    expect(src).toContain("dragOverId");
    // the PATCH body carries the order array
    expect(src).toMatch(/order:\s*\w+/);
  });
});

describe("session-29 DnD ordering depth + print recipes (parity round 28 — the recruitment within-stage ordering superset + the print superset)", () => {
  it("R28-A1: the Candidate model carries an explicit position column — the within-stage order becomes persistent state (existing rows backfill to 0; the appliedAt tiebreak preserves today's newest-first render)", () => {
    const src = read("prisma", "schema.prisma");
    const candBlock = src.slice(src.indexOf("model Candidate {"), src.indexOf("// ============================================================ Onboarding"));
    expect(candBlock).toContain("position");
    expect(candBlock).toContain("@default(0)");
  });

  it("R28-A2: GET /api/candidates orders by position asc with the appliedAt desc tiebreak — array order IS render order for the optimistic reorder", () => {
    const src = read("src", "app", "api", "candidates", "route.ts");
    expect(src).toContain('orderBy: [{ position: "asc" }, { appliedAt: "desc" }]');
  });

  it("R28-A3: PATCH /api/candidates accepts an order array — CandidatePatch schema + the positional reassignment loop (position = index for every listed id, existence-validated in a transaction)", () => {
    const src = read("src", "app", "api", "candidates", "route.ts");
    expect(src).toContain("order: z.array(");
    expect(src).toContain("data.order");
    expect(src).toMatch(/position: index|position: i\b/);
    expect(src).toMatch(/order[\s\S]*findMany|findMany[\s\S]*order/);
    expect(src).toContain("$transaction");
  });

  it("R28-A4: the pipeline cards are insertion drop targets — dragOverId + reorderCandidate + the { stage?, order } PATCH body computed over the FULL stage list (filters cannot corrupt persisted positions)", () => {
    const src = read("src", "app", "(app)", "recruitmentkanban", "page.tsx");
    expect(src).toContain("reorderCandidate");
    expect(src).toContain("dragOverId");
    // the order is computed over the unfiltered candidates array, not the
    // filtered `visible` view
    expect(src).toMatch(/candidates\.filter\(\(c\) => c\.stage === /);
    // the PATCH body carries the order array
    expect(src).toMatch(/order:\s*\w+/);
    // same-stage reorders get their own toast; cross-stage keeps the R27 contract
    expect(src).toContain("Order updated");
    expect(src).toContain("→ ${labelize(");
  });

  it("R28-B1: the print superset — a scoped @media print block in globals.css hides the shell chrome (aside/header/nav + Radix portals), resets the tab-bar padding and min-h-screen, and avoids splitting cards/rows across pages", () => {
    const src = read("src", "app", "globals.css");
    const at = src.indexOf("@media print");
    expect(at).toBeGreaterThan(-1);
    const block = src.slice(at);
    expect(block).toContain("display: none !important");
    expect(block).toContain("[data-radix-portal]");
    expect(block).toContain("break-inside: avoid");
    expect(block).toContain("padding-bottom: 0 !important");
    expect(block).toContain("min-height: 0 !important");
  });

  it("R28-B2: the print block is UNLAYERED and important — an unlayered !important rule beats every v4 cascade layer (the round-26 reduced-motion placement rule), and no print rule existed on either side before (session-18 census: both apps shipped browser defaults)", () => {
    const src = read("src", "app", "globals.css");
    const at = src.indexOf("@media print");
    expect(at).toBeGreaterThan(-1);
    // everything before the print block: the reduced-motion block is the
    // last unlayered rule — the print block must come after it, outside
    // any @layer/@utility block
    const before = src.slice(0, at);
    const lastLayer = Math.max(before.lastIndexOf("@layer"), before.lastIndexOf("@utility"));
    expect(at).toBeGreaterThan(lastLayer);
    expect(before.lastIndexOf("@media (prefers-reduced-motion: reduce)")).toBeGreaterThan(lastLayer);
  });
});

describe("session-30 sidebar leaf-gap + organogram DnD + print color recipes (parity round 29)", () => {
  it("R29-A1: the leaf-list ul drops mb-1 — the trailing gap after an expanded group is the root wrapper's 4px gap-1 only (REF-measured: next root at +4, the session-5 over-generalized bottom margin removed)", () => {
    expect(sidebarNav).toContain("mt-1 flex flex-col gap-1 pl-4");
    expect(sidebarNav).not.toContain("mt-1 mb-1 flex flex-col gap-1 pl-4");
  });

  it("R29-B1: the organogram page delegates the tree render to the client island (the page-folder convention) while keeping the server-side tree build", () => {
    const src = read("src", "app", "(app)", "organogram", "page.tsx");
    expect(src).toContain("OrganogramTree");
    expect(src).toContain("buildNode");
    expect(src).toMatch(/trees=\{/);
  });

  it("R29-B2: the organogram client island's DnD source contract — draggable cards + dataTransfer + dragOverId ring + the unified reparent with the { managerId } PATCH body and router.refresh", () => {
    const src = read("src", "app", "(app)", "organogram", "organogram-tree.tsx");
    expect(src).toContain("draggable");
    expect(src).toContain("onDragStart");
    expect(src).toContain("dataTransfer");
    expect(src).toContain("dragOverId");
    expect(src).toContain("ring-2 ring-inset ring-blue-500/40");
    expect(src).toContain("reparent");
    expect(src).toContain("managerId");
    expect(src).toContain("router.refresh");
    expect(src).toContain("opacity-50");
    expect(src).toContain("cursor-grab");
  });

  it("R29-B3: the client cycle guard — a node cannot be dropped onto its own descendant (the tree walk precedes any request)", () => {
    const src = read("src", "app", "(app)", "organogram", "organogram-tree.tsx");
    expect(src).toMatch(/isDescendant|descendant/);
    expect(src).toContain("cycle");
  });

  it("R29-B4: the employees PATCH carries the ancestor-walk cycle guard (a re-parent that would loop the chain is a VALIDATION error, not an FK crash or corrupt tree)", () => {
    const src = read("src", "app", "api", "employees", "route.ts");
    expect(src).toContain("reporting cycle");
    const at = src.indexOf("reporting cycle");
    // the guard lives inside the PATCH managerId block, after the existence check
    expect(src.lastIndexOf("Selected manager does not exist", at)).toBeGreaterThan(-1);
  });

  it("R29-C1: the print block gains color fidelity — print-color-adjust exact (both prefixes) and a consistent @page margin (media-scoped, zero screen impact)", () => {
    const src = read("src", "app", "globals.css");
    const at = src.indexOf("@media print");
    expect(at).toBeGreaterThan(-1);
    const block = src.slice(at);
    expect(block).toContain("print-color-adjust: exact !important");
    expect(block).toContain("-webkit-print-color-adjust: exact !important");
    expect(src).toContain("@page");
    expect(src).toContain("margin: 10mm");
  });
});
