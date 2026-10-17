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
  it("leaf links use the measured px-3 py-2.5 gap-3 box with 16px icons (session-44: the geometry rides the leaf tail over the shared shadcn base)", () => {
    expect(sidebarNav).toContain(
      "rounded-lg mb-1 text-slate-600 hover:custom-accent-bg flex items-center gap-3 px-3 py-2.5"
    );
  });

  it("leaf link icons author w-5 h-5 — the base's [&>svg]:size-4 guard renders them 16px (session 44: REF's authored form; the direct-child svg gets the guard)", () => {
    const navLinkBlock = sidebarNav.slice(
      sidebarNav.indexOf("function NavLink"),
      sidebarNav.indexOf("function CollapsibleNavItem")
    );
    expect(navLinkBlock).toContain('<Icon className="w-5 h-5" aria-hidden="true" />');
  });

  it("leaf hover uses the sidebar tokens — zinc-100 bg + #18181B text + opacity-80 (session 20, R19-A; session 44: the token members replace the hex forms)", () => {
    expect(sidebarNav).toContain("hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 text-sm hover:opacity-80");
    expect(sidebarNav).not.toContain("hover:bg-[#f4f4f5]");
  });

  it("group triggers hover blue-50/blue-700 like the reference", () => {
    expect(sidebarNav).toContain("hover:bg-blue-50");
    expect(sidebarNav).toContain("hover:text-blue-700");
  });

  it("sub-list is REF's no-ul submenu — div.pl-4.space-y-1 with direct li children (session 44; the 4px pitch rides space-y-1)", () => {
    expect(sidebarNav).toContain('className="pl-4 space-y-1"');
  });

  it("brand header: p-6 column + row, 18px slate-900 h2, the truncate p sub (session-40: REF's flex-col gap-2 outer + the flex-1 min-w-0 text container)", () => {
    expect(sidebarNav).toContain("flex flex-col gap-2 border-b border-slate-200 dark:border-slate-800 p-6");
    expect(sidebarNav).toMatch(
      /<h2 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">EonHR<\/h2>/
    );
    expect(sidebarNav).toContain('className="text-xs text-slate-500 dark:text-slate-400 truncate"');
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
  it("CardTitle renders text-base/600 with default leading (lh 24) — session 47 amendment: the TAG is the div and the class order is REF-verbatim", () => {
    // Reference card titles: div "font-semibold tracking-tight text-base"
    // — fs16/fw600/lh24, color #0A0A0A inherited. The shadcn leading-none
    // (lh 16) shrank every title row 8px and card 4px.
    expect(card).toContain("font-semibold tracking-tight text-base");
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
    expect(statCard).toContain("text-3xl font-bold text-slate-900 mb-1");
    expect(statCard).toContain("text-sm text-slate-600");
    expect(statCard).toContain("border-slate-200");
    // Session 48 (R47-D1): the tile carries GEOMETRY + BG only — the icon
    // size + color ride the svg's own classes (w-6 h-6 text-{c}-600,
    // live-measured on advancedanalytics/analytics); the horizontal tile
    // keeps the r46 guard form (documenttracker's own contract).
    expect(statCard).toContain("w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100");
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
    // Session 48 (R47-A2): the verbatim re-adopted on the hand-rolled copy
    // (sticky/z-20 + the dark: pairs + safe-area-top — the r46 PageHeader
    // fix missed this one) + the h1's dark pair (R47-A1).
    expect(dashboard).toContain("md:hidden sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 safe-area-top");
    expect(dashboard).toMatch(/text-lg font-bold text-slate-900 dark:text-white truncate/);
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
    // Session 48 (R47-E3): the page hand-rolls REF's verbatim empty zone
    // (the 64px slate-100 circle + the w-8 h-8 slate-400 file-text icon)
    // — the shared EmptyState is no longer used here.
    expect(src).toContain("w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center");
    expect(src).toContain('FileText className="w-8 h-8 text-slate-400"');
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
  it("employees Import CSV icon carries mr-2 (145px button) — session 47 amendment: the hand-authored UploadIcon (REF's old-lucide glyph, class lucide-upload w-4 h-4 mr-2)", () => {
    const page = read("src", "app", "(app)", "employees", "page.tsx");
    expect(page).toContain('className="lucide lucide-upload w-4 h-4 mr-2"');
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
    expect(page).toMatch(/<Kanban className="mr-2"/); /* session 47: REF's kanban glyph (was KanbanSquare) */
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

  it("the create affordance — session 47 amendment: the zero-state CTA retired (REF's zero page renders message only); the entry is the with-data dashed add-tile", () => {
    expect(page).toMatch(/No training platforms available[\s\S]{0,400}?<\/div>/);
    expect(page).not.toMatch(/No training platforms available[\s\S]{0,400}?<Button/);
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

describe("sidebar footer colors (session 16 R15-B; hover re-measured session 20; the strings re-pinned session 43)", () => {
  it("Bell ghost icon renders slate-600 (on the SVG, w-5 h-5 authored — the base's svg guard renders 16px); the Moon's color is INHERITED (session 43: no color classes — the sidebar-foreground token)", () => {
    expect(sidebarNav).toMatch(/<Bell className="w-5 h-5 text-slate-600"/);
    const moonIdx = sidebarNav.indexOf('aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}');
    const moonBlock = sidebarNav.slice(moonIdx, moonIdx + 900);
    expect(moonBlock).not.toContain("text-zinc-700");
  });

  it("the user name renders slate-900 (session 20 re-measure — the R15 zinc-700 reading was the button's inherited color)", () => {
    expect(sidebarNav).toMatch(/<p className="truncate text-sm font-medium text-slate-900">\{user\.name\}<\/p>/);
    expect(sidebarNav).not.toMatch(/text-zinc-700">\{user\.name\}/);
  });
});

describe("page-header actions cluster fitting (session 16, R15-C)", () => {
  it("the default actions cluster carries no shrink-0 — the documented wrap-to-second-row fitting must engage at mid viewports", () => {
    // Session 49 (R48-A5): the cluster family grew — actionsBare (`flex
    // gap-2`) + actionsUnwrapped ride alongside the wrap default; the
    // no-shrink-0 fitting rationale is unchanged for the wrap family.
    expect(pageHeader).toContain('actionsBare ? "flex gap-2" : "flex flex-wrap items-center gap-3"');
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

  it("R18-B: Input and Textarea render REF's v4 family (session-40 amendment — REF silently migrated the app-side base post-round-19: bg-transparent + text-base md:text-sm + at-rest shadow-sm + ring-1 offset-0; the round-19 ring-2/offset-2/bg-card recipe retired)", () => {
    expect(input).toContain(
      "border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors"
    );
    expect(input).toContain(
      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    );
    expect(input).not.toContain("ring-offset-2");
    expect(input).not.toContain("bg-card");
    // both components (Input + Textarea) in one file — the v4 focus recipe must appear twice
    expect(input.match(/focus-visible:ring-1 focus-visible:ring-ring/g)?.length).toBe(2);
  });

  it("R18-C: sidebar leaf links, group buttons and sub-items focus in REF's sidebar-ring blue, NOT the dark ring token (session 44: the pair rides the shared menu-button base + the group-label)", () => {
    expect(sidebarNav).toContain("ring-sidebar-ring focus-visible:ring-2");
    expect(sidebarNav).not.toContain("focus-visible:ring-2 focus-visible:ring-ring");
    // two authored sites: the shared base const + the group-label
    expect(sidebarNav.match(/ring-sidebar-ring/g)?.length).toBe(2);
  });

  it("R18-C: globals.css pins the sidebar-ring token to REF's blue-500 (#3B82F6 = 217.2 91.2% 59.8%)", () => {
    /* Session 33: the token moved to the :root runtime-var layer (it maps
       through --color-sidebar-ring: var(--sidebar-ring) in @theme). */
    expect(globals).toContain("--sidebar-ring: #3b82f6");
    expect(globals).toContain("--color-sidebar-ring: var(--sidebar-ring)");
  });

  it("R18-D: the mobile hamburger carries REF's button focus recipe (the bare button had none)", () => {
    const shell = appShell.slice(appShell.indexOf("Toggle Sidebar"), appShell.indexOf("Toggle Sidebar") + 700);
    expect(shell).toContain("focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring");
  });

  it("R18-E: login inputs carry REF's page-level slate-400 focus pair (session-43 amendment — the redeploy switched the ring member to the PLAIN focus: variant, un-killing the base's focus-visible:ring-ring in the merge; session-46 amendment — the hidden views' four sibling inputs also carry the pair, so the count anchors to the SIGN-IN form region)", () => {
    const signinRegion = login.slice(login.indexOf('id="email"'), login.indexOf('flex flex-col sm:flex-row'));
    expect(login).toContain("focus:border-slate-400 focus:ring-slate-400");
    expect(signinRegion.match(/focus:ring-slate-400/g)?.length).toBe(2);
    expect(login).not.toContain("focus-visible:ring-slate-400");
  });

  it("R18-E: the login Sign in ring is REF's ring-ring TOKEN over the login-scoped zinc-950 --ring (session-43 amendment — the redeploy adopted the token; the hex pin retired)", () => {
    const submit = login.slice(login.indexOf("disabled={loading}"), login.indexOf("disabled={loading}") + 700);
    expect(submit).toContain("focus-visible:ring-ring");
    expect(submit).not.toContain("ring-[#09090b]");
    expect(submit).not.toContain("ring-slate-400");
  });

  it("R18-F: the Select trigger uses REF's v4 button recipe (session-40 amendment — shadow-sm + ring-offset-background + the focus: prefix, live-measured on the loans dialog)", () => {
    expect(select).toContain("text-sm shadow-sm ring-offset-background");
    expect(select).toContain(
      "focus:outline-none focus:ring-1 focus:ring-ring"
    );
    expect(select).not.toContain("focus:ring-2");
    expect(select).not.toContain("focus-visible:ring-1");
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

  it("R19-A: inactive leaf + sub-item hover = sidebar-accent zinc-100 bg + sidebar-accent-foreground text (session 44: the token members; NOT the stale #e4e6eb, NOT the r19 hex forms)", () => {
    expect(sidebarNav).toContain("hover:bg-sidebar-accent hover:text-sidebar-accent-foreground");
    expect(sidebarNav).not.toContain("hover:bg-[#e4e6eb]");
    expect(sidebarNav).not.toContain("hover:bg-[#f4f4f5]");
    expect(sidebarNav).toContain("hover:opacity-80");
  });

  it("R19-B: the ACTIVE leaf carries the custom-primary-bg recipe (unlayered !important blue beats every layered hover) + text-white font-medium shadow-sm + the inline blue style (session 44)", () => {
    expect(sidebarNav).toContain(
      "rounded-lg mb-1 custom-primary-bg text-white font-medium shadow-sm flex items-center gap-3 px-3 py-2.5"
    );
  });

  it("R19-C: Bell button = REF's full v4 Button base + the ghost hover pair + relative (session 43: the base's focus-visible ring-1 pair is the keyboard-focus contract); the ICON owns text-slate-600 (survives hover)", () => {
    expect(sidebarNav).toMatch(
      /aria-label="Notifications"[\s\S]{0,900}?hover:bg-accent hover:text-accent-foreground h-9 w-9 relative/
    );
    expect(sidebarNav).toMatch(/<Bell className="w-5 h-5 text-slate-600"/);
    // the button carries the full base (focus-visible ring + svg guards)
    expect(sidebarNav).toContain(
      "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 w-9 relative"
    );
  });

  it("R19-C2: Moon button = the v4 base + select-none, NO color classes (the icon inherits the sidebar-foreground token — session 43); hover:bg-accent hover:text-accent-foreground", () => {
    expect(sidebarNav).toContain(
      "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 w-9 select-none"
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
    /* Session-39 amendment (superseded session-40): the social buttons
       dropped type="submit" (R39-A1), so the first indexOf('type="submit"')
       is the Sign in again — the disabled={loading} anchor stays anyway.
       Session-45 amendment: the text became conditional (the R44-D1 swap),
       so the closing anchor is the conditional's tail. */
    const signinBlock = loginPage.slice(
      loginPage.indexOf("disabled={loading}"),
      loginPage.indexOf('"Sign in"}</button>')
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

  it("R19-J: the mobile hamburger adopts REF's v4 Button family + data-sidebar=trigger + the sr-only name span (session-40 amendment — hover:text-accent-foreground h-7 w-7 hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200; the clone KEEPS aria-label/type/aria-expanded, the documented a11y superset)", () => {
    expect(appShell).toMatch(/data-sidebar="trigger"/);
    expect(appShell).toMatch(/<span className="sr-only">Toggle Sidebar<\/span>/);
    expect(appShell).toContain(
      "hover:text-accent-foreground h-7 w-7 hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200"
    );
    expect(appShell).toContain('aria-label="Toggle Sidebar"');
  });

  it("R19-K: mobile bottom tabs have NO hover color change (REF renders none; session 21 re-pinned for the bg-blue-50 active pill — R20-B)", () => {
    const tabsBlock = appShell.slice(
      appShell.indexOf("min-h-[44px]"),
      appShell.indexOf("min-h-[44px]") + 900
    );
    expect(tabsBlock).toContain('active ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : "text-slate-600 dark:text-slate-400"');
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
  it("R20-A: group button pressed = the base's active:bg-sidebar-accent pair (session 44: the hex forms retired; the pressed pair rides the shared base)", () => {
    expect(sidebarNav).toContain(
      "active:bg-sidebar-accent active:text-sidebar-accent-foreground"
    );
  });

  it("R20-E: the EXPANDED group hovers GRAY — data-[state=open]:hover: sidebar tokens (NOT the blue collapsed hover; session 44: the token members)", () => {
    expect(sidebarNav).toContain(
      "data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground"
    );
  });

  it("R20-C: inactive leaf + sub-item carry text-slate-600 + the dead hover:custom-accent-bg member (session 44: the authored active: hex pair retired — the pressed pair rides the base)", () => {
    const inactive = 'text-slate-600 hover:custom-accent-bg flex items-center gap-3';
    expect(sidebarNav).toContain(inactive);
    // both branches (NavLink leaf + sub-item) — the string appears twice
    expect(sidebarNav.split(inactive).length - 1).toBe(2);
  });

  it("R20-D: the ACTIVE leaf pressed keeps the blue bg (the unlayered custom-primary-bg !important) — the active branches carry custom-primary-bg text-white font-medium shadow-sm, the hex active: members are gone", () => {
    const activeBranch = 'custom-primary-bg text-white font-medium shadow-sm flex items-center';
    expect(sidebarNav).toContain(activeBranch);
    expect(sidebarNav.split(activeBranch).length - 1).toBe(2);
    // the pressed pair rides the shared base (1×); the per-branch hex
    // active: members are retired
    expect(sidebarNav.split("active:bg-[").length - 1).toBe(0);
    expect(sidebarNav).toContain("active:bg-sidebar-accent active:text-sidebar-accent-foreground");
  });

  it("R20-B: the active mobile bottom tab renders the bg-blue-50 pill (REF pixel-verified rgb(239,246,255))", () => {
    const tabsBlock = appShell.slice(
      appShell.indexOf("min-h-[44px]"),
      appShell.indexOf("min-h-[44px]") + 900
    );
    expect(tabsBlock).toContain('active ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : "text-slate-600 dark:text-slate-400"');
  });
});

describe("session-22 transition + animation recipes (parity round 21 — the motion dimension)", () => {
  it("R21-A: the group trigger transitions over 200ms like every REF nav item (measured settle ~269ms REF vs ~229ms clone at 150ms; session 44: the motion rides the toggle tail)", () => {
    const trigIdx = sidebarNav.indexOf('"h-8 text-sm hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg mb-1 text-slate-600"');
    expect(trigIdx).toBeGreaterThan(-1);
    const trigBlock = sidebarNav.slice(trigIdx, trigIdx + 320);
    expect(trigBlock).toContain("transition-all duration-200");
    expect(trigBlock).not.toContain("transition-colors");
  });

  it("R21-D: the group chevron is a GLYPH SWAP — chevron-down open, chevron-right collapsed (REF authors no chevron motion classes — computed all 0s; the swing was a clone extra)", () => {
    const chevIdx = sidebarNav.indexOf('<ChevronDown className="w-4 h-4" aria-hidden="true" />');
    expect(chevIdx).toBeGreaterThan(-1);
    const chevBlock = sidebarNav.slice(chevIdx - 260, chevIdx + 260);
    expect(chevBlock).not.toContain("transition-transform");
    expect(chevBlock).not.toContain("rotate-90");
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

  it("R21-B3: the sidebar user dropdown animates (REF-measured enter 0.15s on the same recipe; session 36 evolved the anchor — the menu is now the measured min-w-[8rem] recipe)", () => {
    const ddIdx = sidebarNav.indexOf("z-50 min-w-[8rem]");
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
  it("R22-A1: the sidebar nav NEVER styles its scrollbar (REF authors zero scrollbar rules — computed auto everywhere; the nav scrolls live at 872>690 on expanded-group pages; session 44: the anchor is the content div)", () => {
    const navIdx = sidebarNav.indexOf('data-sidebar="content" className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto');
    expect(navIdx).toBeGreaterThan(-1);
    const navBlock = sidebarNav.slice(navIdx, navIdx + 200);
    expect(navBlock).toContain("overflow-auto");
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

  it("R22-C3: the loans form renders the Requesting-for preview card when an employee is selected (p-4 bg-blue-50 rounded-lg, 20px user icon, name + email; session-38 amendment: the card gained border border-blue-200 — R37-F — and the pin window widened past the new comment)", () => {
    expect(loansPage).toContain("bg-blue-50");
    // target the CARD DIV itself (not any bg-blue-50 hit — the R37-F
    // comment also names the classes)
    const cardIdx = loansPage.indexOf('className="p-4 bg-blue-50 rounded-lg border border-blue-200"');
    expect(cardIdx).toBeGreaterThan(-1);
    const cardBlock = loansPage.slice(cardIdx, cardIdx + 900);
    expect(cardBlock).toContain("p-4");
    expect(cardBlock).toContain("rounded-lg");
    expect(cardBlock).toContain("Requesting for");
    expect(cardBlock).toContain("border border-blue-200");
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
    /* Session 33: the base block grew (the runtime-var body comment), so
       the pin matches the rule inside @layer base by regex. */
    expect(globalsCss).toMatch(/@layer base[\s\S]*?button \{[\s\S]*?cursor: pointer/);
  });

  it("R23-B1: the dashboard page root — session 47 amendment: the select-none family LEFT REF (only the shell chrome keeps it); the page now renders inside REF's PageCanvas pair (relative overflow-hidden > touch-pan-y)", () => {
    expect(dashPage).toContain("<PageCanvas>");
    expect(dashPage).toContain('className="p-4 md:p-8 space-y-8"');
    expect(dashPage).not.toContain("select-none");
  });

  it("R23-B2: the employees page root — session 47 amendment: same family change as R23-B1", () => {
    expect(employeesPage).toContain("<PageCanvas>");
    expect(employeesPage).toContain('className="p-4 md:p-8"');
    expect(employeesPage).not.toContain("select-none");
  });

  it("R23-B3..B8: the six gradient-rooted core pages — session 47 amendment: select-none dropped + the v3 gradient forms + the PageCanvas trio (five wrap the gradient root; attendance nests its canvas inside)", () => {
    const roots: [string, string][] = [
      ["payroll", payrollPage],
      ["attendance", attendancePage],
      ["leavemanagement", leavePage],
      ["expenses", expensesPage],
      ["loans", loansPage],
      ["taskmanager", taskPage],
    ];
    for (const [name, src] of roots) {
      const m = src.match(/className="min-h-screen bg-gradient-to-br[^"]*"/);
      expect(m, name).toBeTruthy();
      expect(src, name).not.toContain("select-none");
    }
  });

  it("R23-B-scope: settings (the representative of the plain-gradient family) stays selectable — session 47: it adopts the v3 gradient form but no trio, no select-none", () => {
    const m = settingsPage.match(/className="min-h-screen bg-gradient-to-br[^"]*"/);
    expect(m).toBeTruthy();
    expect(m?.[0]).not.toContain("select-none");
    expect(settingsPage).not.toContain("<PageCanvas>");
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
    /* 61 since session 32 (R31): the orphan-route hunt found 14 more
       routes REF serves (the bundle's page registry cross-reference) —
       10 real pages, 2 dashboard aliases, 2 blank stubs. */
    expect(dirs.length).toBe(61);
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
  it("R29-A1: the submenu is the no-ul div.pl-4.space-y-1 (session 44) — the 4px pitch rides space-y-1, the trailing gap after an expanded group is the menu ul's gap-1 only", () => {
    expect(sidebarNav).toContain('className="pl-4 space-y-1"');
    expect(sidebarNav).not.toContain("mt-1 flex flex-col gap-1 pl-4");
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
describe("session-31 drawer border + chat structure + legacy assets + swipe recipes (parity round 30)", () => {
  it("R30-A1: the mobile drawer panel carries the reference's right border — border-r picks up the base layer's #e5e5e5 (REF's measured rgb(229,229,229); the desktop sidebar keeps border-sidebar-border)", () => {
    expect(appShell).toContain('w-[288px]');
    const m = appShell.match(/DialogPrimitive\.Content[\s\S]*?className="([^"]+)"/);
    expect(m).toBeTruthy();
    expect(m![1]).toContain("border-r");
    /* Session 33 (R32-A/E) → Session 35 (R34-D) CORRECTED: the desktop
       aside's VISIBLE surface is the bg-sidebar TOKEN — REF's fixed
       container authors bg-white/dark classes but its inner bg-sidebar
       div fully covers it (#FAFAFA light, pixel-verified; #18181b dark,
       computed — NOT slate-900). The round-32 pin had measured the
       container, not the painted surface. The drawer keeps the token
       flip (bg-sidebar -> #18181b). */
    expect(appShell).toContain("border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900");
    expect(appShell).toContain('data-sidebar="sidebar"');
  });

  it("R30-B1: the chat left card — CardHeader p-4 border-b border-slate-200 with the 14px/600 title, the p-2 max-h-96 body, and the plain muted 'No chats' line (no icon, no centered EmptyState)", () => {
    const src = read("src", "app", "(app)", "hrassistantchat", "page.tsx");
    expect(src).toContain('CardHeader');
    expect(src).toContain('border-b border-slate-200 p-4');
    expect(src).toMatch(/CardTitle className="text-sm">Active Chats/);
    expect(src).toContain("Active Chats");
    expect(src).toContain("max-h-96 space-y-1 overflow-y-auto p-2");
    expect(src).toContain('<p className="text-sm text-muted-foreground">No chats</p>');
    // the stretched column-card recipe is gone (the natural-height card)
    expect(src).toContain('<Card className="border-slate-200">');
    expect(src).not.toContain('<Card className="flex min-h-0');
  });

  it("R30-B2: the chat right-pane empty — the h-full card with the centered 64px slate-300 MessageSquare + the single muted line (no h3 title, no description)", () => {
    const src = read("src", "app", "(app)", "hrassistantchat", "page.tsx");
    expect(src).toContain("MessageSquare");
    expect(src).toContain("h-16 w-16 text-slate-300");
    expect(src).toContain("Select a chat or start a new one");
    expect(src).toContain("flex h-full items-center justify-center");
    // REF renders no description under the line
    expect(src).not.toContain("Your HR assistant answers questions");
    expect(src).not.toContain("Start a new chat to ask a question");
  });

  it("R30-C1: the legacy /assets route — flat36 header with the always-row actions (green→blue canvas, bg-slate-50 card header, p-12 centered empty)", () => {
    const src = read("src", "app", "(app)", "assets", "page.tsx");
    /* Session 49 (R48-A3/G2) amendment: the r30 class-trio translation
       retired — the header is now the UNPREFIXED alwaysRow + the single
       action rendered DIRECTLY in the row + the badge glyph Laptop at
       text-green-600 (all live-measured this round). */
    expect(src).toContain('layout="flat36"');
    expect(src).toContain('alwaysRow');
    expect(src).toContain('actionsUnwrapped');
    expect(src).toContain('section="Asset Management"');
    expect(src).toContain('title="Assets"');
    expect(src).toContain("Track and manage company assets");
    expect(src).toContain('iconClassName="text-green-600"');
    expect(src).toContain('<Laptop aria-hidden="true" />');
    expect(src).not.toContain('className="flex-row justify-between items-start"');
    expect(src).toContain("bg-gradient-to-br from-green-50 to-blue-50");
    expect(src).toContain("border-b bg-slate-50");
    expect(src).toContain("leading-none");
    expect(src).toContain("p-12 text-center");
    expect(src).toContain('Inbox className="h-16 w-16 text-slate-300"');
    expect(src).toContain("No assets yet");
  });

  it("R30-C2: the legacy Add Asset dialog field set — name, type (incl. Desktop/Tablet), serial, optional assignee, posting to the assets API", () => {
    const src = read("src", "app", "(app)", "assets", "page.tsx");
    expect(src).toContain("Asset Name");
    expect(src).toContain("Serial Number");
    expect(src).toContain("Assign To (Optional)");
    expect(src).toContain("Desktop");
    expect(src).toContain("Tablet");
    expect(src).toContain("/api/assets");
  });

  it("R30-C3: the assets API accepts the legacy dialog's desktop/tablet types (the modern page's filter stays the reference contract)", () => {
    const src = read("src", "app", "api", "assets", "route.ts");
    const m = src.match(/z\.enum\(\[([^\]]+)\]/);
    expect(m).toBeTruthy();
    expect(m![1]).toContain('"desktop"');
    expect(m![1]).toContain('"tablet"');
    expect(m![1]).toContain('"laptop"');
  });

  it("R30-D1: the drawer swipe-to-close contract — touch handlers with the horizontal-dominant guard and the close threshold (interaction-state only, zero at-rest impact)", () => {
    expect(appShell).toContain("onTouchStart");
    expect(appShell).toContain("onTouchMove");
    expect(appShell).toContain("onTouchEnd");
    expect(appShell).toMatch(/SWIPE_THRESHOLD|threshold/i);
  });
});

describe("session-32 orphan-route hunt recipes (parity round 31 — 14 new routes)", () => {
  const APP = join(process.cwd(), "src", "app", "(app)");

  it("R31-COV: the 14 orphan routes the REF bundle registry serves (VKe={61 keys} + We(name)=/lowercase) all have page dirs — route-coverage parity", () => {
    const dirs = readdirSync(APP, { withFileTypes: true }).filter((d) => d.isDirectory());
    /* 61 since session 32 (R31-A/B/C): REF's page registry cross-reference
       found 14 routes the clone 404'd on — 10 real pages, 2 dashboard
       aliases, 2 blank stubs. */
    expect(dirs.length).toBe(61);
    for (const r of ["careers","employeeportal","externaljobapplication","hrassistant","payrollai","payrollreports","requestreports","requestsettings","shiftswap","tenantsetup","organizationsetup","dynamicdashboard","home","employeedetail"]) {
      expect(existsSync(join(APP, r, "page.tsx")), `${r}/page.tsx missing`).toBe(true);
      expect(existsSync(join(APP, r, "layout.tsx")), `${r}/layout.tsx missing`).toBe(true);
    }
  });

  it("R31-C1: /careers — the blue→indigo sRGB hero canvas + the page canvas, the centered 48px white h1 + the blue-100 line + the job-search input, the job-grid + zero-data No Open Positions card (evolved round 33: REF's hero re-measured)", () => {
    const src = read("src", "app", "(app)", "careers", "page.tsx");
    expect(src).toContain("bg-[linear-gradient(to_right,#2563eb,#4f46e5)]");
    expect(src).toContain("from-blue-50 to-indigo-50");
    expect(src).toMatch(/>Find Your Dream Job<\/h1>/);
    expect(src).toContain("Explore opportunities from top companies powered by EonHR");
    expect(src).toContain("text-blue-100");
    expect(src).toContain("No Open Positions");
    expect(src).toContain("Check back later for new opportunities!");
    expect(src).toContain("/api/jobs");
  });

  it("R31-C2: /employeeportal — the blue→indigo-100 centered canvas with the max-w-md shadow-xl card + the onboarding empty state", () => {
    const src = read("src", "app", "(app)", "employeeportal", "page.tsx");
    expect(src).toContain("from-blue-50 to-indigo-100");
    expect(src).toContain("flex items-center justify-center");
    expect(src).toContain("max-w-md");
    expect(src).toContain("shadow-xl");
    expect(src).toContain("No Onboarding Found");
    expect(src).toContain("You don&apos;t have an active onboarding process yet. Please contact your HR team.");
  });

  it("R31-C3: /externaljobapplication — the blue→indigo canvas, centered 36px header, the Briefcase icon-over-line empty card", () => {
    const src = read("src", "app", "(app)", "externaljobapplication", "page.tsx");
    expect(src).toContain("from-blue-50 to-indigo-50");
    expect(src).toMatch(/>Job Opportunities<\/h1>/);
    expect(src).toContain("Join our team and make an impact");
    expect(src).toContain("Briefcase");
    expect(src).toContain("w-16 h-16 text-slate-300");
    expect(src).toContain("We don&apos;t have any open positions at the moment. Check back later!");
  });

  it("R31-C4: /hrassistant — the max-w-4xl centered header (kicker pill + 36px h1 + line) + the single-pane shadow-xl chat card with the textarea + dark send button", () => {
    const src = read("src", "app", "(app)", "hrassistant", "page.tsx");
    expect(src).toContain("from-blue-50 to-indigo-50");
    expect(src).toContain("max-w-4xl mx-auto");
    expect(src).toContain("AI HR Assistant");
    expect(src).toMatch(/title="HR Assistant"/);
    expect(src).toContain("Ask me anything about HR policies, leave, payroll, and more");
    expect(src).toContain("shadow-xl");
    expect(src).toContain("Ask me anything about HR...");
    expect(src).toContain("/api/ai");
  });

  it("R31-C5: /payrollai — the green→blue canvas (the /assets twin), the Run AI Analysis gradient header button, the 3-tile stat row, the green CheckCircle empty", () => {
    const src = read("src", "app", "(app)", "payrollai", "page.tsx");
    expect(src).toContain("bg-gradient-to-br from-green-50 to-blue-50");
    expect(src).toMatch(/title="Payroll AI Suggestions"/);
    expect(src).toContain("AI-powered payroll analysis and recommendations");
    expect(src).toContain("Run AI Analysis");
    expect(src).toContain("Pending Suggestions");
    expect(src).toContain("Total Adjustments");
    expect(src).toContain("CheckCircle");
    expect(src).toContain("text-green-500");
  });

  it("R31-C6: /payrollreports — the kicker + short hidden always-row + green WhatsApp CTA, the filter card, the 4-trigger tab list, the summary card (evolved round 48: the header rebuilt to PageHeader + the Radix TabsContent panels)", () => {
    const src = read("src", "app", "(app)", "payrollreports", "page.tsx");
    /* Session 33 baseline fix: round-31's live-verification rebuilt this
       header by hand; session 49 (R48-C3) rebuilt it AGAIN to the fresh
       census — the mobile kicker (back button) + the SHORT hidden desktop
       row via PageHeader (alwaysRow + actionsStart + actionsUnwrapped +
       flat36-sm), the WhatsApp CTA DIRECT in the row + the full-width
       mobile copy in a md:hidden div. */
    expect(src).toContain('title="Payroll Reports"');
    expect(src).toContain('layout="flat36-sm"');
    expect(src).toContain('mobileKickerBack');
    expect(src).toContain("Send Payslips via WhatsApp");
    expect(src).toContain("bg-green-600");
    expect(src).toContain("text-white");
    expect(src).toContain('<div className="md:hidden">');
    expect(src).toContain("Total Earnings");
    expect(src).toContain("Net Payroll");
    expect(src).toContain("Filter by Employee");
    expect(src).toContain("Monthly Payroll Summary");
    expect(src).toContain("Tax & Deductions");
    expect(src).toContain("History");
  });

  it("R31-C7: /requestreports — the slate→blue canvas, the centered 24px header + Back ghost button, the documenttracker-recipe 4-tile row", () => {
    const src = read("src", "app", "(app)", "requestreports", "page.tsx");
    expect(src).toContain('className="p-4 md:p-8 max-w-7xl mx-auto space-y-6"');
    expect(src).toMatch(/>Request Reports<\/h1>/);
    expect(src).toContain("Analytics and reporting by area and period");
    expect(src).toContain("Back");
    expect(src).toContain("Export CSV");
    expect(src).toContain("Total Requests");
    expect(src).toContain("Total Amount (SAR)");
  });

  it("R31-C8: /requestsettings — the LEFT-aligned 24px header + Back ghost, the max-w-5xl Approval Workflow + Request Limits cards, the None-set lines (evolved round 33: REF's structure re-measured)", () => {
    const src = read("src", "app", "(app)", "requestsettings", "page.tsx");
    expect(src).toContain('className="p-4 md:p-8 max-w-5xl mx-auto space-y-6"');
    expect(src).toMatch(/>Request Settings<\/h1>/);
    expect(src).toContain("Configure approvers and request limits");
    expect(src).toContain("Approval Workflow");
    expect(src).toContain("Set up to 3 approval levels per request category");
    expect(src).toContain("max-w-5xl");
    expect(src).toContain("Level {lvl}");
    expect(src).toContain("None set");
    expect(src).toContain("Request Limits");
    expect(src).toContain("/api/approval-config");
  });

  it("R31-C9: /shiftswap — the violet→blue canvas, the 4-tile stat row, the violet My Requests tab + ghost Peer Approval pill, the ArrowLeft empty", () => {
    const src = read("src", "app", "(app)", "shiftswap", "page.tsx");
    expect(src).toContain("bg-gradient-to-br from-violet-50 to-blue-50");
    expect(src).toMatch(/title="Shift Swap"/);
    expect(src).toContain("Request, approve, and manage shift swaps");
    expect(src).toContain("My Requests");
    expect(src).toContain("Peer Approval Needed");
    expect(src).toContain("Manager Review");
    expect(src).toContain("bg-violet-600");
    expect(src).toContain("ArrowLeft");
    expect(src).toContain("/api/shiftswaps");
  });

  it("R31-C10: /tenantsetup — the blue→indigo centered canvas, the max-w-2xl shadow wizard card, the Company Name/Owner Email fields + Continue", () => {
    const src = read("src", "app", "(app)", "tenantsetup", "page.tsx");
    expect(src).toContain("from-blue-50 to-indigo-50");
    expect(src).toContain("flex items-center justify-center");
    expect(src).toContain("max-w-2xl");
    expect(src).toContain("Welcome to EonHR");
    expect(src).toContain("Let&apos;s set up your HR management workspace");
    expect(src).toContain("Company Name");
    expect(src).toContain("Owner Email");
    expect(src).toContain("Continue");
  });

  it("R31-B1: the dashboard aliases — /organizationsetup + /dynamicdashboard re-export the Dashboard page and take the plain Eon HR title", () => {
    for (const r of ["organizationsetup", "dynamicdashboard"]) {
      const src = read("src", "app", "(app)", r, "page.tsx");
      expect(src).toContain('../dashboard/page');
    }
    const meta = read("src", "lib", "meta.ts");
    expect(meta).toContain('"/organizationsetup"');
    expect(meta).toContain('"/dynamicdashboard"');
  });

  it("R31-D1: the blank stubs — /home + /employeedetail render null content with mechanical titles", () => {
    for (const r of ["home", "employeedetail"]) {
      const src = read("src", "app", "(app)", r, "page.tsx");
      expect(src).not.toMatch(/return null/);
    }
    // Session 48 (R47-B7): the r47 rootmap re-measured the stubs — /home
    // renders an empty div, /employeedetail renders the centered CSS
    // spinner (the r31 "blank" read was an instrument artifact).
    expect(read("src", "app", "(app)", "home", "page.tsx")).toContain("return <div></div>;");
    expect(read("src", "app", "(app)", "employeedetail", "page.tsx")).toContain("animate-spin");
  });

  it("R31-S1: the ShiftSwap model — requester, shift date, notes, the 5-status flow", () => {
    expect(prismaSchema).toMatch(/model ShiftSwap \{[\s\S]*?requesterId[\s\S]*?swapDate[\s\S]*?status\s+String\s+@default\("pending"\)/);
  });

  it("R31-S2: the ApprovalConfig model — category + level + approver with the unique triple", () => {
    expect(prismaSchema).toMatch(/model ApprovalConfig \{[\s\S]*?@@unique\(\[category, level, approverId\]\)/);
  });

  it("R31-S3: the two new API routes exist with the ApiResult envelope + Zod validation", () => {
    for (const r of ["shiftswaps", "approval-config"]) {
      const src = read("src", "app", "api", r, "route.ts");
      expect(src).toContain("guard(");
      expect(src).toContain("requireUser");
    }
    const swapsApi = read("src", "app", "api", "shiftswaps", "route.ts");
    expect(swapsApi).toContain('z.object');
  });
});

describe("session-33 dark theme + RTL + swipe-to-open recipes (parity round 32)", () => {
  /* The round's census: REF's Moon toggles a REAL shadcn-neutral dark
     theme (html.dark + localStorage darkMode="true", extracted verbatim
     from REF's live stylesheet) and REF's عربي flips dir=rtl
     (localStorage app_lang) — the clone's controls were display-only
     stubs. Plus a 31-round-invisible light find: REF's desktop aside is
     bg-white (not the sidebar token). All values REF-measured this
     round — see docs/remediation-plan-session33.md. */

  const root = globalsCss.slice(globalsCss.indexOf(":root {"), globalsCss.indexOf(".dark {"));
  const darkBlock = globalsCss.slice(globalsCss.indexOf(".dark {"), globalsCss.lastIndexOf("@theme inline"));
  const themeBlock = globalsCss.slice(globalsCss.lastIndexOf("@theme inline"), globalsCss.indexOf("@layer base"));

  it("R32-A1: globals.css uses the shadcn runtime-var pattern — :root light pins, .dark overrides, @theme inline var() indirection", () => {
    expect(globalsCss).toContain(":root {");
    expect(globalsCss).toContain(".dark {");
    // the indirection layer: color tokens point at the runtime vars
    expect(themeBlock).toContain("--color-background: var(--background)");
    expect(themeBlock).toContain("--color-foreground: var(--foreground)");
    expect(themeBlock).toContain("--color-border: var(--border)");
    expect(themeBlock).toContain("--color-card: var(--card)");
    expect(themeBlock).toContain("--color-primary-foreground: var(--primary-foreground)");
    expect(themeBlock).toContain("--color-sidebar: var(--sidebar)");
    // light pins move to :root verbatim
    expect(root).toContain("--background: #ffffff");
    expect(root).toContain("--foreground: #0a0a0a");
    expect(root).toContain("--primary: #1877f2");
    expect(root).toContain("--primary-foreground: #fafafa");
    expect(root).toContain("--border: #e5e5e5");
    expect(root).toContain("--sidebar: #fafafa");
  });

  it("R32-A2: the .dark block carries REF's extracted shadcn-neutral palette (live stylesheet verbatim)", () => {
    expect(darkBlock).toContain("--background: #0a0a0a");
    expect(darkBlock).toContain("--foreground: #fafafa");
    expect(darkBlock).toContain("--card: #0a0a0a");
    expect(darkBlock).toContain("--card-foreground: #fafafa");
    expect(darkBlock).toContain("--popover: #0a0a0a");
    expect(darkBlock).toContain("--popover-foreground: #fafafa");
    expect(darkBlock).toContain("--primary-foreground: #171717");
    expect(darkBlock).toContain("--secondary: #262626");
    expect(darkBlock).toContain("--secondary-foreground: #fafafa");
    expect(darkBlock).toContain("--muted: #262626");
    expect(darkBlock).toContain("--muted-foreground: #a3a3a3");
    expect(darkBlock).toContain("--accent: #262626");
    expect(darkBlock).toContain("--accent-foreground: #fafafa");
    expect(darkBlock).toContain("--destructive: #7f1d1d");
    expect(darkBlock).toContain("--border: #262626");
    expect(darkBlock).toContain("--input: #262626");
    expect(darkBlock).toContain("--ring: #d4d4d4");
    // the drawer flip: REF's dark --sidebar-background 240 5.9% 10%
    expect(darkBlock).toContain("--sidebar: #18181b");
  });

  it("R32-A3: the tokens that must NOT flip — primary (the active-nav blue), link, and the body flip via var", () => {
    // REF authors its blue via custom classes that survive dark; the
    // clone's --color-primary stays the literal in @theme (no .dark
    // override exists for --primary).
    expect(themeBlock).toContain("--color-primary: #1877f2");
    expect(darkBlock).not.toContain("--primary:");
    expect(themeBlock).toContain("--color-link: #2563eb");
    // the neutral-400 pin (the dark inactive-tab color) joins the palette
    expect(themeBlock).toContain("--color-neutral-400: #a3a3a3");
    // the body base flips with the runtime var (dark body = #0a0a0a)
    expect(globalsCss).toContain("background-color: var(--background)");
  });

  it("R32-A4: the app shell's dark surfaces — canvas gradient, aside (the light bg-white find), mobile chrome, bottom tabs", () => {
    // canvas: slate-900 -> slate-800, sRGB-pinned per trap 3
    expect(appShell).toContain("dark:bg-[linear-gradient(to_right_bottom,#0f172a,#1e293b)]");
    // the desktop sidebar: session-40 — the shadcn div.peer architecture;
    // the panel authors bg-white/dark:slate-900 while the INNER
    // data-sidebar=sidebar div paints the bg-sidebar token (session-35
    // correction preserved)
    expect(appShell).toContain("border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900");
    expect(appShell).toContain("flex h-full w-full flex-col bg-sidebar");
    // mobile header + bottom nav: dark slate-900/800 chrome (session-35:
    // the aside moved to the token — two chrome carriers remain)
    expect(appShell.match(/dark:bg-slate-900/g)?.length).toBeGreaterThanOrEqual(2);
    // bottom tabs: inactive flips slate-400, active flips blue-400 + blue-900/20
    expect(appShell).toContain("dark:text-slate-400");
    expect(appShell).toContain("dark:bg-blue-900/20 dark:text-blue-400");
  });

  it("R32-A5: the sidebar's dark details — brand h2, brand-row border (the nav/bell/user colors stay hardcoded, REF's own behavior; session 43: the moon's dark color comes from the inherited sidebar-foreground token, not a class)", () => {
    expect(sidebarNav).toContain("text-slate-900 dark:text-white");
    expect(sidebarNav).toContain("dark:border-slate-800");
  });

  it("R32-A6: the Moon persists — initializes from localStorage.darkMode, writes on every toggle", () => {
    expect(sidebarNav).toContain('localStorage.getItem("darkMode")');
    expect(sidebarNav).toContain('localStorage.setItem("darkMode"');
  });

  it("R32-A7: the button dark variant tracks REF's bg-primary flip (dark #fafafa bg, #171717 text via the token)", () => {
    const src = read("src", "components", "ui", "button.tsx");
    expect(src).toContain("dark:bg-[#fafafa]");
    expect(src).toContain("dark:hover:bg-[#fafafa]/90");
  });

  it("R32-A8: the tab list's inactive color flips to neutral-400 in dark (REF's muted-foreground dark token)", () => {
    expect(tabsUi).toContain("dark:text-neutral-400");
  });

  it("R32-A9: the primary-foreground text surfaces stay readable in dark (the unmeasurable-surface superset)", () => {
    const checkbox = read("src", "components", "ui", "checkbox.tsx");
    expect(checkbox).toContain("dark:data-[state=checked]:text-white");
    const avatar = read("src", "components", "ui", "avatar.tsx");
    expect(avatar).toContain("dark:text-white");
    for (const p of ["chat", "hrassistantchat"]) {
      const src = read("src", "app", "(app)", p, "page.tsx");
      expect(src).toContain("dark:text-white");
      expect(src).toContain("dark:text-white/70");
    }
  });

  it("R32-A10: the pre-paint boot script — darkMode and app_lang apply before first paint (no FOUC, reload-persistent)", () => {
    const src = read("src", "app", "layout.tsx");
    expect(src).toContain("darkMode");
    expect(src).toContain("classList.add(\"dark\")");
    expect(src).toContain("app_lang");
    expect(src).toContain("dir");
  });

  it("R32-B1: the عربي RTL contract — dir flip + app_lang persistence + the Arabic title string", () => {
    expect(sidebarNav).toContain('document.documentElement.dir');
    expect(sidebarNav).toContain('localStorage.setItem("app_lang"');
    expect(sidebarNav).toContain("التبديل إلى الإنجليزية");
  });

  it("R32-C1: the swipe-to-open contract — left-edge, rightward, horizontal-dominant, threshold-gated (interaction-state only)", () => {
    expect(appShell).toContain("EDGE");
    expect(appShell).toMatch(/OPEN_THRESHOLD|EDGE_THRESHOLD/);
    expect(appShell).toMatch(/setMobileOpen\(true\)/);
  });
});

/* ============================================================
 * SESSION 34 / PARITY ROUND 33 — the at-rest DOM parity of the
 * round-31-wired pages (the button/input/text census) + the
 * form-error dimension (the login Alert) + the /settings border.
 * Ground truth live-measured this round (see
 * docs/remediation-plan-session34.md).
 * ============================================================ */
describe("session-34 pins (parity round 33)", () => {

  it("R33-G1: the shadcn Alert primitive exists (the login error's component)", () => {
    const src = read("src", "components", "ui", "alert.tsx");
    expect(src).toContain("bg-red-50/70");
    expect(src).toContain("border-red-200");
    expect(src).toContain("rounded-xl");
    expect(src).toContain("AlertDescription");
  });

  it("R33-G2: the login error uses the Alert (REF: translucent red-50/70 + red-200 border + rounded-xl + the text-red-700 description)", () => {
    const src = read("src", "app", "login", "page.tsx");
    expect(src).toContain("<Alert");
    expect(src).toContain("text-red-700");
    expect(src).not.toContain("rounded-lg bg-red-50 px-3 py-2");
  });

  it("R33-A1: /payrollreports — the slate→blue sRGB canvas + the chart-column badge kicker family + the green MessageCircle CTA", () => {
    const src = read("src", "app", "(app)", "payrollreports", "page.tsx");
    /* Session 49 (R48-C3) amendment: the badge now rides PageHeader —
       the section + ChartColumn glyph pin replaces the raw class
       string (the badge classes live in the component). */
    expect(src).toContain("bg-gradient-to-br from-blue-50 to-indigo-50");
    expect(src).toContain('section="Payroll Reporting Suite"');
    expect(src).toContain('<ChartColumn aria-hidden="true" />');
    expect(src).toContain("bg-green-600");
    expect(src).toContain("MessageCircle");
    expect(src).not.toContain("bg-[linear-gradient");
  });

  it("R33-A2: /payrollreports — the filter card (Label above the w-full select, records right) + the 4-col grid tab list with the Custom trigger", () => {
    const src = read("src", "app", "(app)", "payrollreports", "page.tsx");
    expect(src).toContain("Filter by Employee");
    expect(src).toContain("space-y-1 flex-1 min-w-[180px]");
    expect(src).toContain("flex flex-wrap gap-4 items-end");
    expect(src).toContain("total records");
    expect(src).toContain("grid grid-cols-4");
    expect(src).toContain("Custom");
    expect(src).not.toContain("data-[state=active]:bg-slate-900");
  });

  it("R33-A3: /payrollreports — the summary card carries the Calendar icon + the month input; the stats live INSIDE the card with REF's colored values; the 8-col table + the No-records TD", () => {
    const src = read("src", "app", "(app)", "payrollreports", "page.tsx");
    expect(src).toContain("Monthly Payroll Summary");
    expect(src).toMatch(/Calendar\b/);
    expect(src).toContain('type="month"');
    expect(src).toContain("text-blue-700");
    expect(src).toContain("text-red-600");
    expect(src).toContain("text-green-700");
    expect(src).toContain("<thead");
    expect(src).toContain("Payslip");
    expect(src).toContain("No records for");
    expect(src).not.toContain("No payroll records for the selected period.");
  });

  it("R33-B1: /requestreports — the stat tiles carry REF's shadow + default border; the 4 section cards + the Request Log table", () => {
    const src = read("src", "app", "(app)", "requestreports", "page.tsx");
    expect(src).toContain("Requests by Category");
    expect(src).toContain("Status Breakdown");
    expect(src).toContain("Financial Amount by Category (SAR)");
    expect(src).toContain("Top Requesters");
    expect(src).toContain("No data");
    expect(src).toContain("No financial requests");
    expect(src).toContain("Request Log - Monthly");
    expect(src).toContain("Ref #");
    expect(src).toContain("Date");
    expect(src).not.toContain("No requests in the selected period.");
  });

  it("R33-C1: /requestsettings — REF's Approval Workflow row (name + email inputs + level select + Add) + the 3 static None-set rows", () => {
    const src = read("src", "app", "(app)", "requestsettings", "page.tsx");
    expect(src).toContain('placeholder="Approver name"');
    expect(src).toContain('placeholder="Approver email"');
    expect(src).toContain("Level 1 (First)");
    expect(src).toContain("Level 3 (Final)");
    expect(src).toContain("None set");
    expect(src).not.toContain('placeholder="Select approver"');
  });

  it("R33-C2: /requestsettings — REF's Request Limits grid (limit/sub-type/max inputs + Finance/Monthly/All Staff selects + Add Limit + the empty line)", () => {
    const src = read("src", "app", "(app)", "requestsettings", "page.tsx");
    expect(src).toContain('placeholder="Limit name (e.g. Petty Cash Monthly)"');
    expect(src).toContain('placeholder="Sub-type (e.g. petty_cash)"');
    expect(src).toContain('placeholder="Max requests (optional)"');
    expect(src).toContain('placeholder="Max amount SAR (optional)"');
    expect(src).toContain("All Staff");
    expect(src).toContain("Add Limit");
    expect(src).toContain("No limits configured");
    expect(src).not.toContain("All Employees");
  });

  it("R33-D1: /shiftswap — no at-rest header action (REF renders none) + REF's empty text on both tabs", () => {
    const src = read("src", "app", "(app)", "shiftswap", "page.tsx");
    expect(src).not.toContain("Request Swap</Button>");
    expect(src).not.toContain("actions=");
    expect(src).toContain("No swap requests in this category");
    expect(src).not.toContain("No swap requests yet");
  });

  it("R33-D2: /shiftswap — the superset entry is the invisible-at-rest keyboard shortcut (n opens the dialog; the API round-trip unchanged)", () => {
    const src = read("src", "app", "(app)", "shiftswap", "page.tsx");
    expect(src).toMatch(/addEventListener\("keydown"/);
    expect(src).toMatch(/e\.key !== "n"|key === "n"/);
    expect(src).toContain("/api/shiftswaps");
  });

  it("R33-E1: /careers — the page canvas + REF's hero structure (max-w-6xl px-4, h1 mb-4, blue-100 sub, the job-search input)", () => {
    const src = read("src", "app", "(app)", "careers", "page.tsx");
    expect(src).toContain("bg-gradient-to-br from-blue-50 to-indigo-50");
    expect(src).toContain("max-w-6xl mx-auto px-4");
    expect(src).toContain("text-5xl font-bold mb-4");
    expect(src).toContain("text-blue-100 mb-8");
    expect(src).toContain("Search jobs by title, department, or location...");
    expect(src).not.toContain("text-blue-200");
  });

  it("R33-E2: /careers — the Browse by Company H2 + REF's chip geometry (session-40 amendment: the v4 Button outline family — variant=outline + h-auto py-3 px-4, measured h=46; no All-Companies chip)", () => {
    const src = read("src", "app", "(app)", "careers", "page.tsx");
    expect(src).toContain("Browse by Company");
    expect(src).toContain("text-2xl font-bold text-slate-900 mb-4");
    expect(src).toMatch(/<Button key=\{c\} variant="outline" className="h-auto py-3 px-4"/);
    expect(src).not.toContain("All Companies");
  });

  it("R33-F1: /payrollai — REF's empty state (the 64px CircleCheckBig + All Clear! + the exact line)", () => {
    const src = read("src", "app", "(app)", "payrollai", "page.tsx");
    expect(src).toContain("CircleCheckBig");
    expect(src).toContain("w-16 h-16 mx-auto mb-4 text-green-500");
    expect(src).toContain("All Clear!");
    expect(src).toContain("No payroll adjustments needed");
    expect(src).not.toContain("No pending suggestions");
  });

  it("R33-H1: /settings — the cards carry REF's hardcoded border-slate-200 (the 3-unit deferred micro-diff)", () => {
    const src = read("src", "app", "(app)", "settings", "page.tsx");
    expect(src).toContain('<Card className="border-slate-200">');
    expect(src).not.toMatch(/<Card>\s*$/m);
  });
});

describe("session-35 dialog interiors + deep RTL + payrollreports tabs (parity round 34)", () => {
  /* The round's census: the dialog-interior dimension (loans + assets —
     the only two REF-exposed dialogs, measured geometrically for the
     first time), the deep-RTL frontier (REF's desktop sidebar does NOT
     mirror: a fixed painting panel stays LEFT while a transparent
     in-flow peer spacer mirrors — the round-32 "mirror match" had
     measured the peer), and the payrollreports tab contents (REF's
     triggers are inert — wiring them is the with-data superset).
     All values REF-measured this round — see
     docs/remediation-plan-session35.md. */

  it("R34-C1: the systemic DialogTitle recipe — text-lg font-semibold leading-none (REF-measured 18px/18px/600 on both dialogs)", () => {
    expect(dialogUi).toContain("text-lg font-semibold leading-none");
  });

  it("R34-C3: the dialog backdrop — bg-black/80 (REF's overlay, live-measured rgba(0,0,0,0.8); the shadcn-default /50 was a never-audited 30-point gap)", () => {
    expect(dialogUi).toContain("bg-black/80");
    expect(dialogUi).not.toContain("bg-black/50");
  });

  it("R34-A1: the asset dialog ships the H2-only header (REF renders no description — the loans pattern)", () => {
    const src = read("src", "app", "(app)", "assets", "page.tsx");
    expect(src).not.toContain("Register a new company asset");
    expect(src).not.toContain("<DialogDescription>");
    const hdrIdx = src.indexOf("<DialogTitle>Add Asset</DialogTitle>");
    const formIdx = src.indexOf('<form onSubmit={onSubmit}');
    expect(hdrIdx).toBeGreaterThan(-1);
    expect(formIdx).toBeGreaterThan(hdrIdx);
  });

  it("R34-A2: the asset dialog's Type + Serial ride REF's 2-col row (223+223 over the 462 inner width)", () => {
    const src = read("src", "app", "(app)", "assets", "page.tsx");
    const nameIdx = src.indexOf('id="asset-name"');
    const typeIdx = src.indexOf("<Label>Type</Label>");
    const serialIdx = src.indexOf('<Label htmlFor="asset-serial">Serial Number</Label>');
    const assignIdx = src.indexOf("<Label>Assign To (Optional)</Label>");
    const gridIdx = src.indexOf('className="grid grid-cols-2 gap-4"');
    expect(gridIdx).toBeGreaterThan(-1);
    // the row sits between the Asset Name field and the Assign field, wrapping Type + Serial
    expect(gridIdx).toBeGreaterThan(nameIdx);
    expect(typeIdx).toBeGreaterThan(gridIdx);
    expect(serialIdx).toBeGreaterThan(typeIdx);
    expect(assignIdx).toBeGreaterThan(serialIdx);
  });

  it("R34-A3: the asset dialog's Add button is text-only (REF: 102×36, no icon)", () => {
    const src = read("src", "app", "(app)", "assets", "page.tsx");
    const footIdx = src.indexOf("<DialogFooter>");
    const foot = src.slice(footIdx);
    expect(foot).toContain("Add Asset");
    expect(foot).not.toContain("<Plus");
    expect(foot).not.toContain("Loader2");
  });

  it("R34-B1: the loans installment value — REF's P recipe (16px/600/blue-700 inside the matched box)", () => {
    const instIdx = loansPage.indexOf("Monthly Installment</Label>");
    const block = loansPage.slice(instIdx, instIdx + 600);
    expect(block).toContain("p-2.5 bg-slate-100 border border-slate-200 rounded-md text-center");
    expect(block).toContain('<p className="text-base font-semibold text-blue-700">');
  });

  it("R34-B2: the loans Paid From input carries no placeholder (REF: empty)", () => {
    const pfIdx = loansPage.indexOf('id="loan-paid-from"');
    const block = loansPage.slice(pfIdx, pfIdx + 400);
    expect(block).not.toContain("placeholder=");
  });

  it("R34-D1: REF's RTL shell — the in-flow transparent peer spacer reserves the column (mirrors with dir; session-40: the spacer is the shadcn peer wrapper's first child; REF authors no aria-hidden anywhere in the tree)", () => {
    expect(appShell).toMatch(/<div\s+className="group peer hidden text-sidebar-foreground md:block"\s+data-state=/);
    expect(appShell).toMatch(/<div className="relative h-svh w-\(--sidebar-width\) bg-transparent transition-\[width\] duration-200 ease-linear/);
  });

  it("R34-D2: the desktop sidebar is REF's fixed painting panel — physically left in BOTH directions (session-40: the aside became the shadcn div.peer architecture, never flips)", () => {
    expect(appShell).toMatch(/<div className="fixed inset-y-0 z-10 hidden h-svh w-\(--sidebar-width\) transition-\[left,right,width\] duration-200 ease-linear md:flex left-0/);
    expect(appShell).not.toContain("<aside");
    expect(appShell).not.toContain('<aside className="sticky top-0');
  });

  it("R34-C2: the v4 Radix-native-select trap — Select-ending field wrappers carry NO space-y (v4's :not(:last-child) would margin the TRIGGER: Radix's hidden native select is the last child, a phantom 8px; the explicit mt-2 carries the 12px gap alone)", () => {
    const assets = read("src", "app", "(app)", "assets", "page.tsx");
    // the two Select wrappers on the asset dialog
    const typeIdx = assets.indexOf("<Label>Type</Label>");
    const assignIdx = assets.indexOf("<Label>Assign To (Optional)</Label>");
    expect(assets.slice(assets.lastIndexOf("<div", typeIdx), typeIdx)).not.toContain("space-y-2");
    expect(assets.slice(assets.lastIndexOf("<div", assignIdx), assignIdx)).not.toContain("space-y-2");
    // the two Select wrappers on the loans dialog
    const empIdx = loansPage.indexOf('htmlFor="loan-employee"');
    const ltIdx = loansPage.indexOf('htmlFor="loan-type"');
    expect(loansPage.slice(loansPage.lastIndexOf("<div", empIdx), empIdx)).not.toContain("space-y-2");
    expect(loansPage.slice(loansPage.lastIndexOf("<div", ltIdx), ltIdx)).not.toContain("space-y-2");
  });

  it("R34-E1: the payrollreports tabs are wired (controlled) — the at-rest Monthly DOM unchanged", () => {
    const src = read("src", "app", "(app)", "payrollreports", "page.tsx");
    expect(src).toContain('<Tabs value={tab} onValueChange={setTab}>');
    expect(src).toContain("Monthly Payroll Summary");
  });

  it("R34-E2: the Tax & Deductions card — the per-employee breakdown on REF's card grammar", () => {
    const src = read("src", "app", "(app)", "payrollreports", "page.tsx");
    /* Session 49 (R48-C3) amendment: the conditional render retired —
       all four cards ride Radix TabsContent panels (REF mounts all
       four; the aggregates stay the wired superset). */
    expect(src).toContain('<TabsContent value="tax"');
    expect(src).toContain("Tax & Deductions");
    expect(src).toContain("Effective Rate");
  });

  it("R34-E3: the History card — the processed-periods table", () => {
    const src = read("src", "app", "(app)", "payrollreports", "page.tsx");
    expect(src).toContain('<TabsContent value="history"');
    expect(src).toContain("Payroll History");
    expect(src).toContain("No payroll history yet");
  });

  it("R34-E4: the Custom card — the from/to range form + the filtered table", () => {
    const src = read("src", "app", "(app)", "payrollreports", "page.tsx");
    expect(src).toContain('<TabsContent value="custom"');
    expect(src).toContain("Custom Report");
    expect(src).toContain("Generate Report");
  });
});

describe("session-36 footer-menu family + compliance selects + 404 + settings tabs (parity round 35)", () => {
  /* The round's census: the user-dropdown menu (round 22 pinned only its
     motion — the interior was never measured), the systemic menu-family
     recipes (dropdown + select containers/items), the compliance filter
     option sets, the 404 page (round 10 pinned only the two headings), and
     the settings tab interiors (round 13 pinned only the tab strip + the
     Company card). All values REF-measured this round — see
     docs/remediation-plan-session36.md. */

  const dropdownUi = read("src", "components", "ui", "dropdown-menu.tsx");
  const settingsPage = read("src", "app", "(app)", "settings", "page.tsx");
  const notFoundPage = read("src", "app", "not-found.tsx");
  const documentsApi = read("src", "app", "api", "documents", "route.ts");

  it("R35-A1: the user menu renders NO Label/Separator (REF: 192×74, two items only — the 'Admin' label was invented)", () => {
    const menuIdx = sidebarNav.indexOf("function UserMenu(");
    const block = sidebarNav.slice(menuIdx);
    expect(block).not.toContain("<DropdownMenu.Label");
    expect(block).not.toContain("<DropdownMenu.Separator");
  });

  it("R35-A2: the user menu aligns END with the 4px offset (REF: menu right-edge = trigger right-edge; bottom gap 4)", () => {
    const menuIdx = sidebarNav.indexOf("function UserMenu(");
    const block = sidebarNav.slice(menuIdx);
    expect(block).toContain('side="top"');
    expect(block).toContain('align="end"');
    expect(block).toContain("sideOffset={4}");
  });

  it("R35-A3: the user menu drops the invented min-w-[200px], renders the rounded-md container and the FIXED w-48 (REF: 192px width, radius 6px — re-measured after the initial content-sized implementation rendered 128)", () => {
    const menuIdx = sidebarNav.indexOf("function UserMenu(");
    const block = sidebarNav.slice(menuIdx);
    expect(block).not.toContain("min-w-[200px]");
    expect(block).toContain("min-w-[8rem] w-48");
    expect(block).toContain("rounded-md border bg-popover p-1 text-popover-foreground shadow-md");
  });

  it("R35-A4: the user menu items carry REF's recipe — cursor-default + rounded-sm (the newer shadcn item classes)", () => {
    const menuIdx = sidebarNav.indexOf("function UserMenu(");
    const block = sidebarNav.slice(menuIdx);
    expect(block).toContain("cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm");
    expect(block).not.toMatch(/cursor-pointer[^\n]*rounded-md/);
  });

  it("R35-A5: the user menu icons are REF's pair — CircleUser on My Profile (not User) and LogOut, both mr-2 over the item's gap-2 (16px icon-to-text; the svgs ride the [&>svg]:size-4 variant)", () => {
    const menuIdx = sidebarNav.indexOf("function UserMenu(");
    const block = sidebarNav.slice(menuIdx);
    expect(block).toContain("[&>svg]:size-4 [&>svg]:shrink-0");
    expect(block).toContain('<CircleUser className="w-4 h-4 mr-2"');
    expect(block).toContain('<LogOut className="w-4 h-4 mr-2"');
    expect(block).not.toContain('<User className="h-4 w-4"');
  });

  it("R35-A6: Logout carries a real navigation handler with NO prefetchable Link (a Link to the logout route gets PREFETCHED when the menu opens; the prefetch GETs the route handler, which clears the session cookie — the menu logged the user out on open, found live; session 43: the item is a plain div like REF's — the contract is the handler, not the tag)", () => {
    const menuIdx = sidebarNav.indexOf("function UserMenu(");
    const block = sidebarNav.slice(menuIdx);
    expect(block).not.toContain('href="/logout"');
    expect(block).toContain('window.location.href = "/logout"');
  });

  it("R35-B1: the shared dropdown-menu Content is rounded-md and its Item is cursor-default rounded-sm (REF-measured on the user menu)", () => {
    expect(dropdownUi).toContain("rounded-md border bg-popover p-1 text-popover-foreground shadow-md");
    expect(dropdownUi).not.toContain("rounded-lg border bg-popover");
    expect(dropdownUi).toContain("cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm");
  });

  it("R35-B2: the shared select Content is rounded-md and its Item is cursor-default rounded-sm (REF-measured on the compliance All Types select: radius 6px, cursor default)", () => {
    expect(selectUi).toContain("rounded-md border bg-popover text-popover-foreground shadow-md");
    expect(selectUi).not.toContain("rounded-lg border bg-popover");
    expect(selectUi).toContain("cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm");
  });

  it("R35-C1: the compliance type options are REF's Saudi taxonomy (Iqama/Visa/Passport/Contract/Probation)", () => {
    expect(compliancePage).toContain(
      'const TYPE_OPTIONS = ["all", "iqama", "visa", "passport", "contract", "probation"];'
    );
  });

  it("R35-C2: the compliance window-select labels are REF's select taxonomy (All/Expired/Within N days — the stat tiles keep their own labels)", () => {
    expect(compliancePage).toContain('{ key: "all", label: "All" }');
    expect(compliancePage).toContain('{ key: "d7", label: "Within 7 days" }');
    expect(compliancePage).toContain('{ key: "d30", label: "Within 30 days" }');
    expect(compliancePage).not.toContain('{ key: "all", label: "All Alerts" }');
    // the stat tiles keep the Expiring ≤ taxonomy (both render on REF)
    expect(compliancePage).toMatch(/label="Expiring ≤ 7 days"/);
  });

  it("R35-C3: the documents API accepts REF's five types (+ the model's default fallback)", () => {
    expect(documentsApi).toContain(
      'const DOC_TYPES = ["iqama", "visa", "passport", "contract", "probation", "other"] as const;'
    );
  });

  it("R35-D1: the 404 headings — 72px/300 slate-300 + 24px/500 slate-800 in the measured stack (divider bar + space-y-3 block)", () => {
    expect(notFoundPage).toContain('className="text-7xl font-light text-slate-300"');
    expect(notFoundPage).toContain('className="text-2xl font-medium text-slate-800"');
    expect(notFoundPage).toContain('className="space-y-2"');
    expect(notFoundPage).toContain('className="h-0.5 w-16 bg-slate-200 mx-auto"');
  });

  it("R35-D2: the 404 sentence — the quoted full pathname + the Go Home outline button (REF: 123×38, slate-200 border, rounded-lg)", () => {
    const island = read("src", "app", "not-found-copy.tsx");
    expect(island).toContain("could not be found in this application");
    expect(island).toContain("font-medium text-slate-700");
    expect(notFoundPage).toContain("Go Home");
    expect(notFoundPage).toMatch(/border-slate-200 rounded-lg/);
  });

  it("R35-D3: the logged-out 404 redirects to /login (REF's guard behavior — the round-10 'unmeasurable' assumption corrected)", () => {
    expect(notFoundPage).toContain('redirect("/login")');
    expect(notFoundPage).not.toContain("canvas-gradient");
  });

  it("R35-D4: the 404 title + sentence come from the pathname (client island: usePathname + the React-19 <title> singleton rendered via the computed title — a raw document.title mutation is reverted by React's reconciliation)", () => {
    const island = read("src", "app", "not-found-copy.tsx");
    expect(island).toContain("usePathname");
    expect(island).toContain("`${slug} | Eon HR`");
    expect(island).toMatch(/<title>\{title\}/);
    // The final mechanics: the layout's default title renders first in the
    // head and Next's metadata controller re-asserts it during hydration —
    // the island delays past that window, then drops competing titles.
    expect(island).toContain('document.querySelectorAll("head title")');
    expect(notFoundPage).toContain("NotFoundCopy");
  });

  it("R35-E1: the settings tab headers are the title-only 16px leading-none recipe (no CardDescription on the non-Company tabs)", () => {
    for (const title of ["Approval Workflows", "Work Shifts", "Departments", "System Integrations", "Theme &amp; Layout Settings", "System Audit Logs"]) {
      expect(settingsPage).toContain(`font-semibold leading-none tracking-tight">${title}`);
    }
    expect(settingsPage).not.toContain("Multi-level approval hierarchies");
    expect(settingsPage).not.toContain("Shift templates used by the shift calendar");
    expect(settingsPage).not.toContain("Organize employees into departments");
    expect(settingsPage).not.toContain("Audit trail of recent system actions");
  });

  it("R35-E2: the Departments tab — h-9 Add (default variant, 180×36) + the 48px slate-300 empty icon + the P-based two-line empty", () => {
    const idx = settingsPage.indexOf("function DepartmentsTab(");
    const block = settingsPage.slice(idx, settingsPage.indexOf("function IntegrationsTab("));
    expect(block).not.toContain('size="sm"');
    expect(block).toContain("No departments yet");
    expect(block).toContain('Click &quot;Add Department&quot; to create your first department.');
    expect(block).toContain("w-12 h-12 mx-auto mb-3 text-slate-300");
    expect(block).toContain('<Building2 className="w-12 h-12 mx-auto mb-3 text-slate-300"');
  });

  it("R35-E3: the Workflows tab empty — CircleCheckBig 48px slate-300 + the single P 'No workflows configured'", () => {
    const idx = settingsPage.indexOf("function WorkflowsTab(");
    const block = settingsPage.slice(idx, settingsPage.indexOf("function ShiftsTab("));
    expect(block).toContain("No workflows configured");
    expect(block).not.toContain("Set up a workflow in the Approval Workflow Engine");
    expect(block).toContain('<CircleCheckBig className="w-12 h-12 mx-auto mb-3 text-slate-300"');
  });

  it("R35-E4: the Shifts tab — the 'Work Shifts' title + the single P 'No shifts configured' + the Clock 48px", () => {
    const idx = settingsPage.indexOf("function ShiftsTab(");
    const block = settingsPage.slice(idx, settingsPage.indexOf("function DepartmentsTab("));
    expect(block).toContain(">Work Shifts<");
    expect(block).toContain("No shifts configured");
    expect(block).not.toContain("Create shifts to build the shift calendar");
    expect(block).toContain('<Clock className="w-12 h-12 mx-auto mb-3 text-slate-300"');
  });

  it("R35-E5: the Integrations tab — REF's four text-chip tiles (WhatsApp/SMS/Email/ZKT) with the Active badge", () => {
    const idx = settingsPage.indexOf("function IntegrationsTab(");
    const block = settingsPage.slice(idx, settingsPage.indexOf("function ThemeTab("));
    for (const name of ["WhatsApp Integration", "SMS Gateway", "Email Service", "ZKT BioTime Cloud"]) {
      expect(block).toContain(name);
    }
    expect(block).toContain("Send notifications via WhatsApp");
    expect(block).toContain("Twilio or local provider");
    expect(block).toContain("Built-in email integration");
    expect(block).toContain("Biometric Attendance Sync");
    expect(block).toContain('initials: "WA"');
    expect(block).toContain("bg-green-100");
    expect(block).toContain('chipText: "text-green-700"');
    expect(block).toContain("${i.chipText} font-bold text-lg");
    expect(block).toContain('bg-green-100 text-green-700 border-transparent');
    expect(block).not.toContain("Slack");
  });

  it("R35-E6: the Theme tab — REF's real form (three color fields + Preview + Menu Position + the two collapse checkboxes + Save Theme)", () => {
    const idx = settingsPage.indexOf("function ThemeTab(");
    const block = settingsPage.slice(idx, settingsPage.indexOf("function LogsTab("));
    expect(block).toContain("Save Theme");
    expect(block).toContain(">Colors<");
    expect(block).toContain("Primary Color");
    expect(block).toContain("Secondary Color");
    expect(block).toContain("Accent Color");
    expect(block).toContain('type="color"');
    expect(block).toContain(">Preview:<");
    expect(block).toContain("Layout Settings");
    expect(block).toContain("Menu Position");
    expect(block).toContain("Left Sidebar");
    expect(block).toContain("Allow sidebar to collapse");
    expect(block).toContain("Start with sidebar collapsed");
    expect(block).not.toContain("Compact Mode");
    expect(block).not.toContain("Density");
  });

  it("R35-E7: the System Logs tab — the filter shell (Search/User/Action/From/To + Clear Filters) + the P empty line", () => {
    const idx = settingsPage.indexOf("function LogsTab(");
    const block = settingsPage.slice(idx);
    expect(block).toContain("total logs");
    expect(block).toContain("All Users");
    expect(block).toContain("All Actions");
    expect(block).toContain("Clear Filters");
    expect(block).toContain("No logs found matching your filters");
  });

  /* ---- R35-F: the live-verification amendments (the re-measure found
     what the census missed — the header action buttons + the dialogs +
     the Quick Presets + the w-full selects + the button COLOR family) ---- */

  it("R35-F1: the Workflows tab header carries the Add Workflow action (REF: 160×36, dark solid + Plus — the census missed the button entirely)", () => {
    const idx = settingsPage.indexOf("function WorkflowsTab(");
    const block = settingsPage.slice(idx, settingsPage.indexOf("function ShiftsTab("));
    expect(block).toContain("flex flex-row items-center justify-between space-y-0 border-b border-slate-200 p-6");
    expect(block).toContain("Add Workflow");
    expect(block).toMatch(/<Plus className="mr-2"/);
    expect(block).toContain('variant="dark"');
  });

  it("R35-F2: the Create Approval Workflow dialog — REF's contract (max-w-3xl, Name | Type select with the five types, Approval Levels + Add Level + Mandatory, Cancel/Create)", () => {
    const idx = settingsPage.indexOf("function WorkflowsTab(");
    const block = settingsPage.slice(idx, settingsPage.indexOf("function ShiftsTab("));
    expect(block).toContain("Create Approval Workflow");
    expect(block).toContain("max-w-3xl");
    expect(block).toContain("Workflow Name");
    expect(block).toContain(">Type<");
    for (const t of ["Leave", "Expense", "Loan", "Payroll", "Recruitment"]) {
      expect(block).toContain(`<SelectItem value="${t.toLowerCase()}">${t}</SelectItem>`);
    }
    expect(block).toContain("Approval Levels");
    expect(block).toContain("Add Level");
    expect(block).toContain("Mandatory");
    expect(block).toMatch(/>\s*Create\s*<\/Button>/);
    expect(block).toMatch(/>\s*Cancel\s*<\/Button>/);
  });

  it("R35-F3: the approval-workflows API accepts the dialog's five types (APPLIES_TO extended with loans/payroll/recruitment)", () => {
    const api = read("src", "app", "api", "approval-workflows", "route.ts");
    expect(api).toContain('"leave_requests", "expenses", "staff_requests", "loans", "payroll", "recruitment"');
    expect(api).toContain('loans: "general"');
    expect(api).toContain('payroll: "general"');
    expect(api).toContain('recruitment: "recruitment"');
  });

  it("R35-F4: the Shifts tab header carries the Add Shift action (REF: 127×36, dark solid + Plus)", () => {
    const idx = settingsPage.indexOf("function ShiftsTab(");
    const block = settingsPage.slice(idx, settingsPage.indexOf("function DepartmentsTab("));
    expect(block).toContain("flex flex-row items-center justify-between space-y-0 border-b border-slate-200 p-6");
    expect(block).toContain("Add Shift");
    expect(block).toMatch(/<Plus className="mr-2"/);
    expect(block).toContain('variant="dark"');
  });

  it("R35-F5: the Add Shift dialog — REF's contract (max-w-lg, the seven fields with REF's placeholders, Status select, Cancel/Create)", () => {
    const idx = settingsPage.indexOf("function ShiftsTab(");
    const block = settingsPage.slice(idx, settingsPage.indexOf("function DepartmentsTab("));
    expect(block).toContain("Add Shift");
    expect(block).toContain("max-w-lg");
    expect(block).toContain("Shift Name");
    expect(block).toContain(">Code<");
    expect(block).toContain('placeholder="e.g., M, E, N"');
    expect(block).toContain("Start Time");
    expect(block).toContain("End Time");
    expect(block).toContain("Break (minutes)");
    expect(block).toContain("Tolerance (minutes)");
    expect(block).toContain('placeholder="0"');
    expect(block).toContain(">Status<");
    expect(block).toContain('<SelectItem value="active">Active</SelectItem>');
    expect(block).toContain('<SelectItem value="inactive">Inactive</SelectItem>');
  });

  it("R35-F6: the shifts API discriminates creation from assignment (the Shift model carries REF's code/break/tolerance fields)", () => {
    const api = read("src", "app", "api", "shifts", "route.ts");
    expect(api).toContain("ShiftInput");
    // The body is read ONCE (single-use stream) then shape-discriminated on
    // employeeId — assignment vs shift definition.
    expect(api).toContain("typeof shape.employeeId === \"string\"");
    expect(api).toContain("createShift");
    const schema = read("prisma", "schema.prisma");
    const shiftModel = schema.slice(schema.indexOf("model Shift {"), schema.indexOf("model ShiftAssignment"));
    expect(shiftModel).toContain("code");
    expect(shiftModel).toContain("breakMinutes");
    expect(shiftModel).toContain("toleranceMinutes");
  });

  it("R35-F7: Save Theme is REF's dark solid with the Save icon (REF: 151×36 bg rgb(23,23,23) + lucide-save mr-2 — NOT the blue gradient CTA)", () => {
    const idx = settingsPage.indexOf("function ThemeTab(");
    const block = settingsPage.slice(idx, settingsPage.indexOf("function LogsTab("));
    expect(block).toContain('<Button variant="dark" onClick={saveTheme}>');
    expect(block).toContain('<Save className="mr-2"');
    expect(block).not.toContain("linear-gradient");
  });

  it("R35-F8: the Quick Presets section — REF's three outline cards (h-auto p-4 flex-col items-start gap-2, three w-6 h-6 rounded swatches; click populates the color fields)", () => {
    const idx = settingsPage.indexOf("function ThemeTab(");
    const block = settingsPage.slice(idx, settingsPage.indexOf("function LogsTab("));
    expect(block).toContain("Quick Presets");
    expect(block).toContain("Facebook (Default)");
    expect(block).toContain("Professional Blue");
    expect(block).toContain("Fresh Green");
    expect(block).toContain("h-auto p-4 flex flex-col items-start gap-2");
    expect(block).toContain("w-6 h-6 rounded");
    expect(block).toContain("#1877f2");
    expect(block).toContain("#42b72a");
    expect(block).toContain("#3b82f6");
    expect(block).toContain("#6366f1");
    expect(block).toContain("#10b981");
    expect(block).toContain("applyPreset");
  });

  it("R35-F9: the Logs filter selects carry REF's w-full (REF: the triggers fill their grid columns at 195px; the clone's content-sized renders were 201)", () => {
    const idx = settingsPage.indexOf("function LogsTab(");
    const block = settingsPage.slice(idx);
    expect(block.match(/<SelectTrigger className="w-full">/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it("R35-F10: the Departments Add button is REF's dark solid too (bg rgb(23,23,23) + white text — the live pair caught the gradient CTA on all four header actions; session-38 amendment: the button now rides inside DialogTrigger asChild — R37-A)", () => {
    const idx = settingsPage.indexOf("function DepartmentsTab(");
    const block = settingsPage.slice(idx, settingsPage.indexOf("function ThemeTab("));
    expect(block).toMatch(/<Button variant="dark">\s*<Plus className="mr-2" aria-hidden="true" \/>\s*Add Department/);
    expect(block).not.toContain("linear-gradient");
  });

  it("R35-F11: the 404 wrapper is REF's vertical recipe — min-h-screen + p-6 + the slate-50 page background (content centers at y=306 of 900; the clone's min-h-[70vh] + pb-40 had centered at 226 — an 80px offset)", () => {
    expect(notFoundPage).toContain('className="min-h-screen flex items-center justify-center p-6 bg-slate-50"');
    expect(notFoundPage).not.toContain("min-h-[70vh]");
    expect(notFoundPage).not.toContain("pb-40");
  });

  it("R35-F12: the 404 Go Home carries REF's 16px Home icon at mr-2 (REF: 123×38 with it; the icon-less clone rendered 99px)", () => {
    expect(notFoundPage).toContain('<Home className="h-4 w-4 mr-2"');
  });

  it("R35-F13: the Logs empty carries REF's 48px FileText slate-300 icon above the line (live-measured; the census had recorded \"no icon\")", () => {
    const idx = settingsPage.indexOf("function LogsTab(");
    const block = settingsPage.slice(idx);
    expect(block).toContain('<FileText className="w-12 h-12 mx-auto mb-3 text-slate-300"');
  });
});

describe("session-37 dialog form contracts (parity round 36)", () => {
  /* The round's census: the empty-submit probe on REF revealed the whole
     dialog family is <form>-based with NATIVE validation (required attrs,
     Create=submit, everything else type=button, no custom error text) —
     the round-35 rebuilds shipped button-driven dialogs with invented
     inline-error Ps. Plus the never-re-measured Add Department interior
     and the asset dialog's text layer. All values REF-measured this
     round — see docs/remediation-plan-session37.md. */

  const settingsPage = read("src", "app", "(app)", "settings", "page.tsx");
  const assetsPage = read("src", "app", "(app)", "assets", "page.tsx");
  const departmentsApi = read("src", "app", "api", "departments", "route.ts");

  const workflowBlock = () => {
    const idx = settingsPage.indexOf("function CreateWorkflowDialog(");
    return settingsPage.slice(idx, settingsPage.indexOf("function ShiftsTab("));
  };
  const shiftBlock = () => {
    const idx = settingsPage.indexOf("function AddShiftDialog(");
    return settingsPage.slice(idx, settingsPage.indexOf("// ------------------------------------------------------------ Departments"));
  };
  const deptBlock = () => {
    const idx = settingsPage.indexOf("function DepartmentsTab(");
    return settingsPage.slice(idx, settingsPage.indexOf("function ThemeTab("));
  };

  it("R36-A1: the Create Approval Workflow dialog is a real form — the space-y-4 form wraps fields + footer and Create submits it (REF: hasForm, footer inside)", () => {
    const block = workflowBlock();
    expect(block).toMatch(/<form\s+className="space-y-4"\s+onSubmit=/);
    expect(block).toMatch(/<\/form>\s*<\/DialogContent>/);
  });

  it("R36-A2: the workflow footer's non-primary actions are explicit type=\"button\" (REF: Add Level/Cancel=button, Create=submit — an untyped button defaults to submit inside a form)", () => {
    const block = workflowBlock();
    expect(block).toMatch(/<Button[^>]*type="button"[^>]*>\s*<Plus[\s\S]*?Add Level/);
    expect(block).toMatch(/<Button variant="outline" type="button" onClick=/);
    expect(block).toMatch(/<Button variant="dark" type="submit"[^>]*>\s*Create\s*<\/Button>/);
  });

  it("R36-A3: the workflow Name input is required — REF's empty-submit is the NATIVE tooltip, and NO custom inline error ever renders (the invented 'Workflow name is required' P dies)", () => {
    const block = workflowBlock();
    const nameIdx = block.indexOf('id="wf-name"');
    const nameInput = block.slice(nameIdx, block.indexOf("/>", nameIdx));
    expect(nameInput).toContain("required");
    expect(block).not.toContain("Workflow name is required");
    expect(block).not.toContain("setError");
  });

  it("R36-A4: the Add Shift dialog is the same form architecture with Name/Start/End required (REF live-measured: required on exactly those three)", () => {
    const block = shiftBlock();
    expect(block).toMatch(/<form\s+className="space-y-4"\s+onSubmit=/);
    for (const id of ["shift-name", "shift-start", "shift-end"]) {
      const idx = block.indexOf(`id="${id}"`);
      const input = block.slice(idx, block.indexOf("/>", idx));
      expect(input).toContain("required");
    }
    const codeIdx = block.indexOf('id="shift-code"');
    const codeInput = block.slice(codeIdx, block.indexOf("/>", codeIdx));
    expect(codeInput).not.toContain("required");
  });

  it("R36-A5: the shift break/tolerance inputs carry REF's DEFAULTS — 60 and 0 (the clone shipped empty strings; REF renders val=\"60\"/\"0\")", () => {
    const block = shiftBlock();
    expect(block).toMatch(/breakMinutes, setBreakMinutes\] = React\.useState\("60"\)/);
    expect(block).toMatch(/toleranceMinutes, setToleranceMinutes\] = React\.useState\("0"\)/);
  });

  it("R36-A6: the shift Status row rides INSIDE the grid as the 7th cell with the w-full trigger (REF: 223px column + w-full; the clone's hard-pinned w-[223px] full-width row was the wrong recipe)", () => {
    const block = shiftBlock();
    expect(block).not.toContain("w-[223px]");
    const gridIdx = block.indexOf('<div className="grid grid-cols-2 gap-4">');
    const statusIdx = block.indexOf(">Status<");
    const gridEnd = block.indexOf("</div>", statusIdx);
    expect(gridIdx).toBeGreaterThan(-1);
    expect(statusIdx).toBeGreaterThan(gridIdx);
    expect(gridEnd).toBeGreaterThan(statusIdx);
  });

  it("R36-B1: the Add Department dialog is REF's max-w-lg form (512×372; the clone's max-w-md 448×290 was the invented size)", () => {
    const block = deptBlock();
    const titleIdx = block.indexOf("<DialogTitle>Add Department</DialogTitle>");
    const openTag = block.lastIndexOf("<DialogContent", titleIdx);
    const dlg = block.slice(openTag, titleIdx);
    expect(dlg).toContain("max-w-lg");
    const formEnd = block.indexOf("</form>", titleIdx);
    expect(block.slice(titleIdx, formEnd)).toMatch(/<form\s+className="space-y-4"\s+onSubmit=/);
  });

  it("R36-B2: the department fields are REF's three — 'Department Name *' (required, ph 'e.g., Human Resources'), Description (ph 'Brief description'), Manager Email (type=email, ph 'manager@company.com') — the Name+Code pair was invented", () => {
    const block = deptBlock();
    const titleIdx = block.indexOf("<DialogTitle>Add Department</DialogTitle>");
    const dlg = block.slice(titleIdx, block.indexOf("</form>", titleIdx));
    expect(dlg).toContain("Department Name *");
    expect(dlg).toContain('placeholder="e.g., Human Resources"');
    expect(dlg).toContain(">Description<");
    expect(dlg).toContain('placeholder="Brief description"');
    expect(dlg).toContain(">Manager Email<");
    expect(dlg).toMatch(/type="email"/);
    expect(dlg).toContain('placeholder="manager@company.com"');
    expect(dlg).not.toContain('placeholder="Sales"');
    expect(dlg).not.toContain('placeholder="SLS"');
  });

  it("R36-B3: the department dialog footer is REF's — Create submit (not 'Add Department') + explicit button Cancel, justify-end gap-3 (the header action keeps its Add Department label)", () => {
    const block = deptBlock();
    const titleIdx = block.indexOf("<DialogTitle>Add Department</DialogTitle>");
    const dlg = block.slice(titleIdx, block.indexOf("</form>", titleIdx));
    expect(dlg).toContain('<div className="flex justify-end gap-3">');
    expect(dlg).toMatch(/<Button type="button" variant="outline" onClick=/);
    expect(dlg).toMatch(/<Button type="submit" variant="dark"[^>]*>[\s\S]*?Create[\s\S]*?<\/Button>/);
    expect(dlg).not.toMatch(/>\s*Add Department\s*<\/Button>/);
  });

  it("R36-B4: the Department model + API persist REF's new fields (description + managerEmail columns; code stays for compat)", () => {
    const deptModel = prismaSchema.slice(
      prismaSchema.indexOf("model Department {"),
      prismaSchema.indexOf("model Employee {"),
    );
    expect(deptModel).toContain("description");
    expect(deptModel).toContain("managerEmail");
    expect(departmentsApi).toContain("description");
    expect(departmentsApi).toContain("managerEmail");
  });

  it("R36-C1: the asset dialog's Name placeholder is REF's 'e.g., Macbook Air 2024' (the clone had invented 'e.g. MacBook Pro 16\"')", () => {
    expect(assetsPage).toContain('placeholder="e.g., Macbook Air 2024"');
    expect(assetsPage).not.toContain("MacBook Pro 16");
  });

  it("R36-C2: the asset Serial placeholder is EMPTY (REF renders no placeholder; the clone's 'Optional' was invented — page-level: the only Optional placeholder was the serial's)", () => {
    expect(assetsPage).not.toContain('placeholder="Optional"');
  });

  it("R36-C3: the assignment option reads 'Not assigned' (REF's casing; the clone had 'Not Assigned')", () => {
    expect(assetsPage).toContain('<SelectItem value="none">Not assigned</SelectItem>');
    expect(assetsPage).not.toContain("Not Assigned");
  });
});

describe("session-38 keyboard/focus contracts (parity round 37)", () => {
  /* The round's census: the keyboard/focus dimension (round 36's named
     frontier). Tab orders measured structurally IDENTICAL on all five
     parity dialogs — but REF's triggers are Radix DialogTriggers
     (aria-haspopup="dialog" + focus-restore-on-close via triggerRef),
     while the clone's plain onClick buttons drop focus to BODY on close
     (read from @radix-ui/react-dialog 1.2.0: DialogContentModal's
     onCloseAutoFocus focuses context.triggerRef.current — null without
     a trigger — and its preventDefault also kills the FocusScope
     fallback). Plus the asset submit's at-rest disabled, the Add Level
     mr-1, and the loans dialog's never-compared text/contract layer.
     All values REF-measured this round — see
     docs/remediation-plan-session38.md. */

  const settingsPage38 = read("src", "app", "(app)", "settings", "page.tsx");
  const assetsPage38 = read("src", "app", "(app)", "assets", "page.tsx");
  const loansPage38 = read("src", "app", "(app)", "loans", "page.tsx");

  it("R37-A1: the assets Add Asset trigger is a DialogTrigger asChild (REF: aria-haspopup=dialog, aria-expanded, focus-restore) — the plain onClick pattern dies", () => {
    /* Session 49 (R48-G2b) amendment: the Button carries the r48-measured
       green utility gradient pass — the asChild/focus contract unchanged. */
    expect(assetsPage38).toMatch(/<DialogTrigger asChild>[\s\S]*?<Button[^>]*>\s*<Plus className="mr-2" aria-hidden="true" \/>\s*Add Asset\s*<\/Button>\s*<\/DialogTrigger>/);
    expect(assetsPage38).not.toMatch(/onClick=\{\(\) => setDialogOpen\(true\)\}/);
    expect(assetsPage38).toContain("DialogTrigger");
  });

  it("R37-A2: the assets dialog root is LIFTED to wrap the page (the trigger must sit inside the root's context) and AssetDialog renders bare DialogContent", () => {
    expect(assetsPage38).toMatch(/return \(\s*\/\*[\s\S]*?<Dialog open=\{dialogOpen\} onOpenChange=\{setDialogOpen\}>\s*<div className="min-h-screen/);
    const dlgIdx = assetsPage38.indexOf("function AssetDialog(");
    const dlg = assetsPage38.slice(dlgIdx);
    expect(dlg).not.toMatch(/<Dialog open=\{open\} onOpenChange=\{onOpenChange\}>/);
    expect(dlg).toMatch(/return \(\s*\/\*[\s\S]*?<DialogContent className="max-w-lg">/);
  });

  it("R37-A3: the loans New Loan Request HEADER trigger is a DialogTrigger asChild with the page-level root lift (the empty-state CTA stays a plain button — REF's own has no aria contract)", () => {
    expect(loansPage38).toMatch(/actions=\{\s*<DialogTrigger asChild>\s*<Button>\s*<Plus className="mr-2" aria-hidden="true" \/>\s*New Loan Request\s*<\/Button>\s*<\/DialogTrigger>\s*\}/);
    expect(loansPage38).toMatch(/return \(\s*\/\*[\s\S]*?<Dialog open=\{dialogOpen\} onOpenChange=\{setDialogOpen\}>\s*<PageCanvas>\s*<div className="min-h-screen/);
    // the inline old root is gone — the Content renders under the page root
    expect(loansPage38).not.toMatch(/<Dialog open=\{dialogOpen\} onOpenChange=\{setDialogOpen\}>\s*\{\/\*/);
  });

  it("R37-A4: the three settings triggers (Add Workflow / Add Shift / Add Department) are DialogTriggers asChild inside lifted tab roots", () => {
    for (const label of ["Add Workflow", "Add Shift", "Add Department"]) {
      expect(settingsPage38).toMatch(
        new RegExp(`<DialogTrigger asChild>\\s*<Button variant="dark">\\s*<Plus className="mr-2" aria-hidden="true" />\\s*${label}\\s*</Button>\\s*</DialogTrigger>`),
      );
    }
    expect(settingsPage38).not.toMatch(/onClick=\{\(\) => setAddOpen\(true\)\}/);
  });

  it("R37-A5: the settings dialog components render bare DialogContent (their own roots lifted into the tabs)", () => {
    expect(settingsPage38).not.toMatch(/<Dialog open=\{open\} onOpenChange=\{onOpenChange\}>/);
    expect(settingsPage38).not.toMatch(/<Dialog open=\{addOpen\} onOpenChange=\{setAddOpen\}>\s*<CardContent/);
    // the tabs own the roots now — one per tab, wrapping the Card
    expect(settingsPage38).toMatch(/<Dialog open=\{addOpen\} onOpenChange=\{setAddOpen\}>\s*<Card className="border-slate-200">/);
  });

  it("R37-B1: the asset dialog's submit is disabled ONLY while saving (REF keeps it enabled at rest — the empty-submit fires native validation; the !form.name.trim() clause removed it from the Tab order)", () => {
    expect(assetsPage38).toMatch(/<Button type="submit" disabled=\{saving\}>/);
    expect(assetsPage38).not.toMatch(/disabled=\{saving \|\| !form\.name\.trim\(\)\}/);
  });

  it("R37-C1: the Add Level icon rides mr-1 (REF: w-4 h-4 mr-1 → 113×32; the clone's mr-2 measured 117×32 and shifted the dialog's right-edge stack)", () => {
    const idx = settingsPage38.indexOf('onClick={addLevel}');
    const block = settingsPage38.slice(idx - 200, idx + 300);
    expect(block).toMatch(/<Plus className="mr-1" aria-hidden="true" \/>\s*Add Level/);
    expect(block).not.toMatch(/<Plus className="mr-2"[^>]*>\s*\n\s*Add Level/);
  });

  it("R37-D1: the loans Reason textarea is REQUIRED and carries REF's placeholder 'Hi, I'm buying an apartment and I need a loan for the down payment.' (the clone's 'e.g. Family relocation…' was invented)", () => {
    const idx = loansPage38.indexOf('id="loan-reason"');
    const ta = loansPage38.slice(idx, loansPage38.indexOf("</Textarea>", idx));
    expect(ta).toContain("required");
    expect(ta).toContain('placeholder="Hi, I\'m buying an apartment and I need a loan for the down payment."');
    expect(loansPage38).not.toContain("Family relocation");
  });

  it("R37-D2: the loans form DEFAULTS — Amount '0' and Paid From 'New Era LLC' (REF live-measured, stable across re-opens; hardcoded form defaults in REF's code — its own company is 'Demo')", () => {
    expect(loansPage38).toMatch(/useState\(\{ employeeId: "", loanType: "standard", amount: "0", months: "12", paidFrom: "New Era LLC", reason: "" \}\)/);
  });

  it("R37-D3: the loans number inputs carry NO min/max/step (REF: required only — the invented constraints change the native validation surface; the API's Zod + toast is the superset)", () => {
    for (const id of ["loan-amount", "loan-months"]) {
      const idx = loansPage38.indexOf(`id="${id}"`);
      const input = loansPage38.slice(idx, loansPage38.indexOf("/>", idx));
      expect(input).not.toContain('min="');
      expect(input).not.toContain('max="');
      expect(input).not.toContain('step="');
      expect(input).toContain("required");
    }
  });

  it("R37-D4: the loans silent-return submit guard is gone (the round-36 anti-pattern — with the '0' prefill an immediate submit now flows to the API and surfaces the Zod error as a toast; the monthlyPreview display computation keeps its own null path)", () => {
    expect(loansPage38).not.toMatch(/amount <= 0\) return;/);
    expect(loansPage38).not.toMatch(/months < 1 \|\| months > 60\) return;/);
  });
});

describe("session-38b pixel-diff forensics (parity round 37, addendum)", () => {
  /* The round's screenshot pair diff (3.73% vs the ~1.1% baseline) led
     to two live-measured finds on the loans dialog: REF's placeholder-
     state Select triggers render neutral-500 (rgb(115,115,115); dark
     #a3a3a3) via Radix's data-placeholder attribute — the clone's bare
     SelectPrimitive.Value left them in the dark foreground — and REF's
     Requesting-for card carries border border-blue-200 (the 2px the
     dialog-height pair exposed: 698 vs 696). */

  const selectUi38 = read("src", "components", "ui", "select.tsx");
  const loansPage38b = read("src", "app", "(app)", "loans", "page.tsx");

  it("R37-E1: the SelectTrigger renders the placeholder state in neutral-500 (REF: rgb(115,115,115) light / #a3a3a3 dark — the data-placeholder attribute Radix already sets; NOT the muted-foreground token, which is slate-500)", () => {
    expect(selectUi38).toMatch(/data-\[placeholder\]:text-neutral-500/);
    expect(selectUi38).toMatch(/dark:data-\[placeholder\]:text-neutral-400/);
  });

  it("R37-F1: the loans Requesting-for card carries REF's border border-blue-200 (1px rgb(191,219,254); the clone's borderless card was 2px short — the 698-vs-696 dialog height)", () => {
    expect(loansPage38b).toMatch(/<div className="p-4 bg-blue-50 rounded-lg border border-blue-200">/);
  });
});

describe("session-39 login re-audit contracts (parity round 38 — the redeploy)", () => {
  /* REF's /login static JS chunk changed (index-CneaUv24.js →
     index-BYE5Ojxh.js) while every other build fingerprint held — the
     login page re-audited end to end, at 1440×900 AND (for the first
     time) 390×844. All twelve findings live-measured on both apps. */

  const login39 = read("src", "app", "login", "page.tsx");

  it("R38-G1: the login canvas root is REF's MAIN element with the pinned sRGB gradient + p-4 + the zinc-950 foreground + the session-43 login-scoped zinc-950 --ring override + the session-46 --foreground sibling (REF's login build uses the zinc palette — computed rgb(9,9,11) on the typed text AND on the Alert family's text-foreground; the app pages keep the pinned neutral-950 token)", () => {
    expect(login39).toMatch(
      /<main className="flex min-h-screen items-center justify-center bg-\[linear-gradient\(to_bottom_right,#f8fafc,#f1f5f9\)\] p-4 text-\[#09090b\] \[--ring:#09090b\] \[--foreground:#09090b\]">/
    );
    expect(login39).not.toMatch(/<div className="flex min-h-screen items-center justify-center bg-\[linear-gradient/);
  });

  it("R38-A1: the login inputs + Sign in are REF's responsive heights — h-11 sm:h-12 (44px mobile / 48px ≥640px; the clone's flat h-12 measured 48px at 390×844 vs REF's 44px — the login was never probed below 1440 before)", () => {
    expect(login39.match(/h-11 sm:h-12/g)?.length).toBe(3);
  });

  it("R38-A2: the login inputs are REF's responsive font — text-base (base position) + md:text-sm (base-end) in the session-43 verbatim string (16px mobile / 14px ≥768px; the flat text-sm measured 14px at mobile vs REF's 16px; session-46 amendment — the hidden views' sibling inputs carry the same md member, so the count anchors to the SIGN-IN form region)", () => {
    const signinRegion = login39.slice(login39.indexOf('id="email"'), login39.indexOf('flex flex-col sm:flex-row'));
    expect(signinRegion.match(/text-base/g)?.length).toBeGreaterThanOrEqual(2);
    expect(signinRegion.match(/md:text-sm/g)?.length).toBe(2);
  });

  it("R38-B1: the login inputs render REF's placeholder slate-600 (rgb(71,85,105) — live-measured on both fields; NOT the base's muted-foreground slate-500 rgb(100,116,139))", () => {
    expect(login39.match(/placeholder:text-slate-600/g)?.length).toBe(2);
  });

  it("R38-I1: the login inputs carry NO shadow/transition members (session-43 amendment — REF's new login base has neither shadow-sm nor transition-colors to counter; the two-build split counters RETIRED: shadow-none/transition-none appear nowhere on the page)", () => {
    const loginInputsBlock = login39.slice(login39.indexOf('id="email"'), login39.indexOf('id="password"') + 900);
    expect(loginInputsBlock).not.toContain("shadow-none");
    expect(loginInputsBlock).not.toContain("transition-none");
    expect(loginInputsBlock).not.toContain("shadow-sm");
    expect(loginInputsBlock).not.toContain("transition-colors");
  });

  it("R38-D1: REF's sm:hidden spacer footnote below the card (mt-8 text-center text-xs text-slate-400 > p:&nbsp; — the invisible line pins the card to y=16 and scrolls the mobile page 18px: 862 vs the 844 viewport)", () => {
    expect(login39).toMatch(/<div className="mt-8 text-center text-xs text-slate-400 sm:hidden">/);
    expect(login39).toMatch(/<p>&nbsp;<\/p>/);
  });

  it("R38-E1: the Sign in button is REF's recipe — inline-flex, gap-1, whitespace-nowrap, px-3 py-2, transition-all duration-200 (200ms all-properties vs the clone's 150ms colors-only — the motion dimension; the loading spinner rides the 4px gap)", () => {
    const idx = login39.indexOf("disabled={loading}");
    const btn = login39.slice(idx, idx + 800);
    expect(btn).toContain("inline-flex");
    expect(btn).toContain("gap-1");
    expect(btn).toContain("whitespace-nowrap");
    expect(btn).toContain("px-3 py-2");
    expect(btn).toContain("transition-all duration-200");
    expect(btn).not.toContain("transition-colors");
  });

  it("R38-F1: the three social buttons are REF's family (session-40 amendment — the redeploy DROPPED the type attr: REF renders no type on any of the three; they sit outside the form so it was inert), REF's exact class list with text-[16px] + group", () => {
    expect(
      login39.match(
        /className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 px-5 py-3\.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all duration-200 font-medium text-\[16px\] group"/g
      )?.length
    ).toBe(3);
    expect(login39.match(/<button[^>]*type="submit"[^>]*className="w-full flex items-center/g)?.length ?? 0).toBe(0);
  });

  it("R38-F2: the social icons ride REF's wrappers — ONLY Google carries the -ml-4 pull (live-measured: REF's Google div x=84.8 with ml=-16, its Microsoft/Apple divs have NO -ml-4 and sit at 84.6/98.2 on their own text widths); the labels are span-wrapped", () => {
    expect(login39.match(/<div className="transition-transform duration-200 -ml-4">/g)?.length).toBe(1);
    expect(login39.match(/<div className="transition-transform duration-200">/g)?.length).toBe(2);
    expect(login39).toMatch(/<div className="transition-transform duration-200 -ml-4">\s*<GoogleIcon \/>/);
    expect(login39).toMatch(/<div className="transition-transform duration-200">\s*<MicrosoftIcon \/>/);
    expect(login39).toMatch(/<div className="transition-transform duration-200">\s*<AppleIcon \/>/);
    expect(login39).toMatch(/<span>Continue with Google<\/span>/);
    expect(login39).toMatch(/<span>Continue with Microsoft<\/span>/);
    expect(login39).toMatch(/<span>Continue with Apple<\/span>/);
  });

  it("R38-J1: the links row is REF's responsive direction — flex-col at mobile, row ≥sm (the clone's flat row wrapped BOTH links to two lines at 390px — the shrunken buttons measured 118+176=294 filling the row, h=40 each vs REF's clean h=20 stack)", () => {
    expect(login39).toMatch(
      /<div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">/
    );
  });

  it("R38-J2: the links carry REF's text recipes — Forgot: font-medium + transition-colors; Need: transition-colors; the Sign up span: font-medium text-slate-700 (the clone's bare span inherited slate-500 — a visible color diff)", () => {
    expect(login39).toMatch(
      /className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"/
    );
    expect(login39).toMatch(
      /className="text-sm text-slate-500 hover:text-slate-700 transition-colors"/
    );
    expect(login39).toMatch(/<span className="font-medium text-slate-700">Sign up<\/span>/);
  });

  it("R38-K1: the or-divider is REF's continuous-line + white-chip pattern (the absolute 1px slate-200 line + the centered bg-white px-3 chip in slate-500 — the clone's segmented divider rendered the 'or' in slate-400)", () => {
    expect(login39).toMatch(/<div className="relative my-6" role="separator" aria-label="or">/);
    expect(login39).toMatch(
      /<div data-orientation="horizontal" role="none" className="shrink-0 h-\[1px\] w-full bg-slate-200" \/>/
    );
    expect(login39).toMatch(
      /<span className="bg-white px-3 text-slate-500 font-medium tracking-wider">or<\/span>/
    );
  });

  it("R38-L1: the logo carries REF's glow layer (the blur-xl slate gradient at opacity-30 → 40 on group-hover) inside a relative group wrapper", () => {
    expect(login39).toMatch(/<div className="relative group">/);
    expect(login39).toMatch(
      /className="absolute inset-0 bg-\[linear-gradient\(to_bottom_right,#e2e8f0,#cbd5e1\)\] rounded-full blur-xl opacity-30 group-hover:opacity-40 transition-opacity duration-300"/
    );
  });

  it("R38-L2: the logo circle is REF's SPAN with the hover shadow-xl + the 'Eon HR logo' alt (the clone's div carried alt='Eon HR')", () => {
    expect(login39).toMatch(
      /<span className="flex shrink-0 overflow-hidden rounded-full relative h-20 w-20 sm:h-24 sm:w-24 shadow-lg ring-4 ring-white\/50 group-hover:shadow-xl transition-all duration-300">/
    );
    expect(login39).toContain('alt="Eon HR logo"');
  });

  it("R38-H1: the title block is REF's shrink-to-fit (space-y-2 sm:space-y-3 — NO w-full; the w-full stretched the H1 box to 368 vs REF's 317)", () => {
    expect(login39).toMatch(/<div className="space-y-2 sm:space-y-3">/);
    expect(login39).not.toMatch(/<div className="w-full space-y-2 sm:space-y-3">/);
  });

  it("R38-M1: the social icons are REF's exact glyphs (the pixel-diff forensics addendum — the Microsoft icon's viewBox is 0 0 24 24, NOT the clone's 0 0 23 23; the Apple icon is REF's classic two-path glyph, NOT the clone's alternate; session-45 amendment: the fill semantics + square order moved to the R44-C pins)", () => {
    expect(login39).not.toContain('viewBox="0 0 23 23"');
    // REF's Apple leaf path (the second path of the two-path glyph)
    expect(login39).toContain("M13 3.5c.73-.83 1.94-1.46 2.94-1.5");
    // REF's Microsoft squares live in the 24-box (M1 1h10v10H1z family × 4)
    expect(login39.match(/M1 1h10v10H1z|M13 1h10v10H13z|M1 13h10v10H1z|M13 13h10v10H13z/g)?.length).toBeGreaterThanOrEqual(4);
  });
});

describe("session-40 shell restructure + input migration + careers org-view (parity round 39)", () => {
  /* Round 39's three fronts, all live-measured on both apps this round:
     (1) REF's login JS chunk redeployed twice more (BYE5Ojxh → Cqb_n9sO
     → BIuE7r17) — the social buttons DROPPED type="submit" and the login
     proved THEME-INERT (no html.dark/dir even with the storage keys
     armed; the keys survive — REF's login build ships no theme boot).
     (2) The app-side input family silently migrated to the v4 shadcn
     recipes (bg-transparent + text-base md:text-sm + at-rest shadow-sm +
     ring-1 offset-0) — measured on the loans dialog's input, textarea
     and select trigger.
     (3) REF's shell is the shadcn Sidebar architecture (peer wrapper +
     fixed panel + the flex-1 overflow-auto scroll container, header
     inside main, bottom nav as the canvas's child) and its public
     careers board carries the ?org= company view. */

  const login40 = read("src", "app", "login", "page.tsx");
  const careers40 = read("src", "app", "(app)", "careers", "page.tsx");
  const tenant40 = read("src", "app", "(app)", "tenantsetup", "page.tsx");
  const extjob40 = read("src", "app", "(app)", "externaljobapplication", "page.tsx");
  const layout40 = read("src", "app", "layout.tsx");
  const input40 = read("src", "components", "ui", "input.tsx");

  // --- A. the login redeploy re-audit ---

  it("R39-A1: the three social buttons carry NO type attribute (the redeploy's change — REF renders type:null on all three; the buttons sit outside the form so the attribute was inert)", () => {
    expect(login40.match(/<button[^>]*type="submit"[^>]*className="w-full flex items-center/g)?.length ?? 0).toBe(0);
    expect(login40.match(/className="w-full flex items-center justify-center gap-3 bg-white text-slate-700/g)?.length).toBe(3);
  });

  it("R39-B1: the theme boot is LOGIN-INERT — REF's login preserves darkMode/app_lang but never applies html.dark/dir (live-probed both sides); the boot returns early on /login BEFORE either applier", () => {
    const boot = layout40.slice(layout40.indexOf("THEME_BOOT"), layout40.indexOf("THEME_BOOT") + 460);
    expect(boot).toMatch(/pathname\s*===?\s*"\/login"/);
    expect(boot.indexOf("/login")).toBeLessThan(boot.indexOf("darkMode"));
    expect(boot.indexOf("/login")).toBeLessThan(boot.indexOf("app_lang"));
  });

  it("R39-C1: the login inputs carry the ring-2/offset-2 family IN BASE (session-43 amendment — the redeploy adopted the base; the retired counters' surviving members: ring-offset-background + the focus-visible ring triple, now inside the verbatim string; NO shadow/transition members anywhere on the inputs; session-46 amendment — the hidden views' siblings carry the family too, so the count anchors to the SIGN-IN form region)", () => {
    const signinRegion = login40.slice(login40.indexOf('id="email"'), login40.indexOf('flex flex-col sm:flex-row'));
    expect(login40.match(/ring-offset-background/g)?.length).toBeGreaterThanOrEqual(3);
    expect(signinRegion.match(/focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2/g)?.length).toBe(3);
    expect(login40).not.toContain("shadow-none transition-none");
  });

  // --- B. the base migration ---

  it("R39-D1: the Input base is REF's migrated v4 recipe — bg-transparent + text-base md:text-sm + at-rest shadow-sm + ring-1 focus (offset-0) + file:text-foreground (live-measured on the loans dialog; the round-19 ring-2/offset-2/bg-card recipe retired)", () => {
    expect(input40).toContain("border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors");
    expect(input40).toContain("file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring");
    expect(input40).toContain("disabled:cursor-not-allowed disabled:opacity-50 md:text-sm");
    expect(input40).not.toContain("bg-card");
    expect(input40).not.toContain("ring-offset-2");
  });

  it("R39-E1: the Textarea base is REF's migrated recipe — min-h-[60px] (was 80) + the same v4 family", () => {
    expect(input40).toContain("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm");
    expect(input40).not.toContain("min-h-[80px]");
  });

  it("R39-F1: the SelectTrigger gains the v4 members — shadow-sm + ring-offset-background + the focus: prefix (was focus-visible:); the R37-E neutral-500 placeholder override stays (rendered rgb(115,115,115) verified identical on both sides)", () => {
    expect(selectUi).toContain("px-3 py-2 text-sm shadow-sm ring-offset-background");
    expect(selectUi).toContain("focus:outline-none focus:ring-1 focus:ring-ring");
    expect(selectUi).not.toContain("focus-visible:ring-1");
    expect(selectUi).toContain("data-[placeholder]:text-neutral-500 dark:data-[placeholder]:text-neutral-400");
  });

  // --- C. the app-shell restructure ---

  it("R39-H1: the wrapper layers — unclassed root > group/sidebar-wrapper (the --sidebar-width: 16rem + --sidebar-width-icon: 3rem inline vars) > the canvas (the pinned sRGB gradient + REF's inert safe-area-inset class)", () => {
    expect(appShell).toMatch(/<div>\s*<div\s+className="group\/sidebar-wrapper flex min-h-svh w-full has-\[\[data-variant=inset\]\]:bg-sidebar"\s+style=/);
    expect(appShell).toContain('"--sidebar-width": "16rem"');
    expect(appShell).toContain('"--sidebar-width-icon": "3rem"');
    expect(appShell).toContain("dark:bg-[linear-gradient(to_right_bottom,#0f172a,#1e293b)] safe-area-inset");
  });

  it("R39-I1: the sidebar is REF's peer architecture — div.group.peer (NOT an aside) wrapping the RTL spacer + the fixed panel; the panel authors bg-white/dark:slate-900 while the inner data-sidebar=sidebar div paints the bg-sidebar token (the session-35 two-layer surface)", () => {
    expect(appShell).not.toContain("<aside");
    expect(appShell).toMatch(/<div className="fixed inset-y-0 z-10 hidden h-svh w-\(--sidebar-width\) transition-\[left,right,width\] duration-200 ease-linear md:flex left-0/);
    expect(appShell).toContain("border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900");
    expect(appShell).toMatch(/<div data-sidebar="sidebar" className="flex h-full w-full flex-col bg-sidebar/);
  });

  it("R39-J1: the brand text container is REF's flex-1 min-w-0 BLOCK (stretches to 155px; the clone's shrink-wrapped flex-col measured 66px) inside the flex-col gap-2 outer + the flex items-center gap-3 row, with the h2 + a p sub (truncate, slate-500/400 — NOT the muted token)", () => {
    expect(sidebarNav).toContain("flex flex-col gap-2 border-b border-slate-200 dark:border-slate-800 p-6");
    expect(sidebarNav).toMatch(/<div className="flex items-center gap-3">/);
    expect(sidebarNav).toMatch(/<div className="flex-1 min-w-0">/);
    expect(sidebarNav).toMatch(/<h2 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">EonHR<\/h2>/);
    expect(sidebarNav).toMatch(/<p className="text-xs text-slate-500 dark:text-slate-400 truncate">Demo<\/p>/);
    expect(sidebarNav).not.toMatch(/flex min-w-0 flex-col/);
  });

  it("R39-K1: the mobile header lives INSIDE main (before the scroll container) with REF's exact string — explicit border-slate-200 + the inert safe-area-top", () => {
    expect(appShell.indexOf("<header")).toBeGreaterThan(appShell.indexOf("<main"));
    expect(appShell).toMatch(/<header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 md:hidden sticky top-0 z-10 safe-area-top">/);
  });

  it("R39-L1: the toggle adopts REF's v4 Button family — the shadcn base members + hover:text-accent-foreground h-7 w-7 hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200 (measured 28×28, 16px icon, both sides)", () => {
    expect(appShell).toContain("hover:text-accent-foreground h-7 w-7 hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200");
  });

  it("R39-M1: the bottom nav is REF's canvas-side sibling — md:hidden fixed bottom-0 left-0 right-0 (explicit, not inset-x-0) + border-slate-200 + the inert safe-area-bottom; the clone's env() padding superset stays (0px on all test surfaces)", () => {
    expect(appShell).toMatch(/className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 safe-area-bottom z-50 pb-\[env\(safe-area-inset-bottom\)\]"/);
    expect(appShell).not.toContain("fixed inset-x-0 bottom-0");
  });

  it("R39-N1: the scroll container — main wraps the header + a div.flex-1.overflow-auto that carries the page content and the edge-swipe handlers (REF: the document itself does not scroll the page; the inner div does)", () => {
    expect(appShell).toMatch(/<div className="flex-1 overflow-auto" onTouchStart=\{onMainTouchStart\} onTouchMove=\{onMainTouchMove\}>/);
    expect(appShell).toMatch(/\{children\}\s*<\/div>\s*<\/main>/);
  });

  it("R39-O1: the print superset follows the restructure — the sidebar hides via the escaped .group\\/sidebar-wrapper selector (spacer + panel together) and the scroll container un-clips for print", () => {
    const at = globalsCss.indexOf("@media print");
    const block = globalsCss.slice(at);
    expect(block).toContain(".group\\/sidebar-wrapper");
    expect(block).toMatch(/overflow: visible !important/);
  });

  // --- D. careers: the with-data surface + the org view ---

  it("R39-P1: the careers chips are REF's v4 Button outline family — variant=outline (the button.tsx recipe: border-input + bg-background + shadow-sm + the accent hover) + h-auto py-3 px-4 (measured h=46 both sides), parent flex gap-3 flex-wrap", () => {
    expect(careers40).toMatch(/<Button key=\{c\} variant="outline" className="h-auto py-3 px-4"/);
    expect(careers40).toContain("flex gap-3 flex-wrap");
    expect(careers40).not.toContain("h-[46px]");
  });

  it("R39-Q1: the count heading — REF renders an h3 'N Open Position(s)' (text-xl font-semibold text-slate-900, pluralized with the count) between the chips and the grid; the zero-data card's h3 shares the recipe", () => {
    expect(careers40).toMatch(/text-xl font-semibold text-slate-900/);
    expect(careers40).toMatch(/\{visible\.length\} Open Position\{visible\.length === 1/);
  });

  it("R39-R1: the hero input is the migrated base + REF's overrides — md:text-sm pl-12 py-6 text-lg bg-white (h=50, 18px mobile font; the h-12 pl-11 rounded-lg recipe retired)", () => {
    expect(careers40).toContain("pl-12 py-6 text-lg bg-white");
    expect(careers40).not.toContain("h-12 pl-11");
  });

  it("R39-S1: the org view — the chip click navigates to ?org=<slug> (useSearchParams; the (app) layout is dynamic — cookies — so no Suspense boundary needed) rendering the org-name h2 text-3xl font-bold + the back button", () => {
    expect(careers40).toContain("useSearchParams");
    expect(careers40).toMatch(/text-3xl font-bold text-slate-900/);
    expect(careers40).toContain("Back to all companies");
  });

  // --- E/F. tenantsetup + externaljobapplication ---

  it("R39-U1: the tenantsetup canvas gains REF's p-4 (the card sits x=16 w=358 at 390 — live-measured both sides)", () => {
    expect(tenant40).toContain("flex items-center justify-center p-4");
  });

  it("R39-V1: the tenantsetup inputs drop the stale h-11 overrides — the migrated base (h-9 = 36px) is REF's recipe now (live-measured)", () => {
    expect(tenant40).not.toContain('className="h-11"');
  });

  it("R39-W1: the externaljobapplication content wrapper is REF's max-w-6xl (the clone's max-w-7xl rendered identically at 1440 but diverges ≥1536)", () => {
    expect(extjob40).toContain("max-w-6xl");
    expect(extjob40).not.toContain("max-w-7xl");
  });
});

describe("session-41 careers family + login button members (parity round 40)", () => {
  /* Round 40's census: REF's login redeployed a FOURTH consecutive time
     (JS BIuE7r17→C-ulo5ek AND CSS D0Q6-tUz→BIWjBcok — the CSS delta is
     platform font-faces, unused by the login; every login recipe
     re-measured byte-identical, desktop + mobile). The round's core came
     from the careers mobile pixel-diff (round-39's deferred frontier):
     the 25.41% pair diff traced to the content wrapper's rhythm + opened
     the careers family end to end — the zero-card icon family, the count
     row, the first measurable with-data job card (the badge + the
     company line + the 4-row meta stack + the line-clamp + the apply
     CTA), the org view's section wrapper, the company/salary model, and
     the external page's alignment. The toaster frontier resolved: REF's
     failed-login Alert is byte-identical on the clone. */

  const careers41 = read("src", "app", "(app)", "careers", "page.tsx");
  const extjob41 = read("src", "app", "(app)", "externaljobapplication", "page.tsx");
  const login41 = read("src", "app", "login", "page.tsx");
  const schema41 = read("prisma", "schema.prisma");
  const jobsApi41 = read("src", "app", "api", "jobs", "route.ts");

  // --- A. the login: the Sign in button's base members ---

  it("R40-A1: the Sign in button carries the login build's base members — ring-offset-background + the three svg guards (inert at rest; session-43 amendment: the ring member is the ring-ring TOKEN resolving the login-scoped zinc-950 --ring set on the root main; REF's offset renders white via the background token, the clone's via the default)", () => {
    const btn = login41.match(/className=\"[^\"]*h-11 sm:h-12[^\"]*bg-slate-900[^\"]*\"/)?.[0] ?? "";
    expect(btn).toContain("ring-offset-background");
    expect(btn).toContain("[&_svg]:pointer-events-none");
    expect(btn).toContain("[&_svg]:size-4");
    expect(btn).toContain("[&_svg]:shrink-0");
    expect(btn).toContain("focus-visible:ring-ring");
    expect(btn).toContain("transition-all duration-200");
  });

  // --- B/C/D. the careers board: wrapper + zero-card + count row ---

  it("R40-B1: the board content wrapper is REF's centered wide container with the tall rhythm (both the board and the org view — the clone's old edge-padding wrapper started the content 32px too high at mobile)", () => {
    expect(careers41).toContain('className="max-w-6xl mx-auto px-4 py-12"');
    expect(careers41).not.toContain("p-4 md:p-8");
  });

  it("R40-C1: the zero-card is the icon-over-line family — the Card carries the centered tall padding itself (the base supplies the shadow; NO slate border override), the inner is the bare CardContent, the briefcase rides first with the w-first order + auto centering, the h3 gains the tight bottom gap, the line is the darker gray", () => {
    expect(careers41).toMatch(/<Card className="text-center py-12">/);
    expect(careers41).not.toContain("border-slate-200 shadow");
    expect(careers41).toContain("w-16 h-16 text-slate-300 mx-auto mb-4");
    expect(careers41).toContain("text-xl font-semibold text-slate-900 mb-2");
    expect(careers41).toContain('className="text-slate-600"');
  });

  it("R40-C2: the zero-card message is state-dependent — the recovery line for the empty board AND the org view, the search line for the filtered zero (both live-measured on REF)", () => {
    expect(careers41).toContain("Check back later for new opportunities!");
    expect(careers41).toContain("No jobs match your search. Try different keywords.");
  });

  it("R40-D1: the count heading row is REF's flex wrapper with the between alignment (ready for a right-side element; shared by the board and the org view — the plain margin-only wrapper retired)", () => {
    expect(careers41).toContain('className="mb-4 flex items-center justify-between"');
    expect(careers41).not.toContain("mb-6");
  });

  // --- E/F. the with-data job card + the apply flow ---

  it("R40-E1: the job card shell — the Card base's shadow + the hover elevation + the transition, NO slate border override (REF's default border renders the neutral gray)", () => {
    expect(careers41).toMatch(/<Card key=\{j\.id\} className="hover:shadow-lg transition-shadow">/);
  });

  it("R40-E2: the card header — the border-b CardHeader wraps the title row (start-aligned, between, tight bottom gap): the left block (the centered row wrapper > the title div in the bold tight large recipe + the company line) + the right badge", () => {
    expect(careers41).toContain("flex items-start justify-between mb-3");
    expect(careers41).toContain("flex items-center gap-3");
    expect(careers41).toMatch(/font-semibold tracking-tight text-xl/);
    expect(careers41).toContain('<p className="text-sm text-slate-600">{j.company}</p>');
  });

  it("R40-E3: the Open badge is hand-rolled as a DIV (REF's tag; the taskmanager count-chip precedent — badge.tsx serves other pages): REF's full string incl. the focus rings + the transparent border + the at-rest shadow + the hover wash + the green look", () => {
    expect(careers41).toContain(
      '<div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent shadow hover:bg-primary/80 bg-green-100 text-green-700">'
    );
  });

  it("R40-E4: the meta stack — the tight stack in the small darker-gray recipe with the FOUR icon rows (office/map/clock/dollar, each the centered 2-gap row); the type renders lowercase (the capitalize retired)", () => {
    expect(careers41).toContain("space-y-2 text-sm text-slate-600");
    expect((careers41.match(/flex items-center gap-2/g) ?? []).length).toBeGreaterThanOrEqual(4);
    expect(careers41).toContain("Building2");
    expect(careers41).toContain("MapPin");
    expect(careers41).toContain("Clock");
    expect(careers41).toContain("DollarSign");
    expect(careers41).not.toContain("capitalize");
  });

  it("R40-E5: the card content — the tight-top padding, the description clamps at three lines with the bottom gap, and the apply CTA is full-width", () => {
    expect(careers41).toContain('<CardContent className="p-6 pt-4">');
    expect(careers41).toContain("text-slate-700 line-clamp-3 mb-4");
    expect(careers41).toContain("View Details &amp; Apply");
  });

  it("R40-F1: the apply CTA navigates to the external application page carrying the org + job slugs (REF's contract, the clone's lowercase route; REF's own target resolves the params to nothing visible — a REF-side artifact the clone's superset fixes)", () => {
    expect(careers41).toContain("externaljobapplication?org=");
    expect(careers41).toMatch(/job=\$\{/);
  });

  // --- G. the org view structure ---

  it("R40-G1: the org view wraps the back button + the org h2 in the tall-gap section (REF's chain: content > section > back(tight gap) + h2); the count row + the list follow unwrapped", () => {
    expect(careers41).toContain('className="mb-8"');
    expect(careers41).toMatch(/text-3xl font-bold text-slate-900/);
    expect(careers41).not.toContain("mt-4");
  });

  // --- H. the data model + the API ---

  it("R40-H1: the JobPosting model gains the company + salary fields (nullable, additive — REF's chips are COMPANIES, the card's fourth meta row is the salary range)", () => {
    const job = schema41.slice(schema41.indexOf("model JobPosting"), schema41.indexOf("model Candidate"));
    expect(job).toContain("company");
    expect(job).toContain("salaryRange");
  });

  it("R40-H2: the jobs API accepts the two new fields, and the careers chips are built from the job's company (the department-based chips were semantically wrong vs REF's company chips)", () => {
    expect(jobsApi41).toMatch(/company: z\.string\(\)/);
    expect(jobsApi41).toMatch(/salaryRange: z\.string\(\)/);
    expect(careers41).toMatch(/if \(j\.company\) set\.add\(j\.company\)/);
    expect(careers41).not.toMatch(/set\.add\(j\.department\)/);
  });

  // --- I. the external application page ---

  it("R40-I1: the external wrapper drops the stack spacing for REF's bare centered wide container; the header block gains the tall bottom gap with the h1 carrying the tight one (not the line's top gap)", () => {
    expect(extjob41).toContain('className="max-w-6xl mx-auto"');
    expect(extjob41).not.toContain("space-y-12");
    expect(extjob41).toContain('className="text-center mb-12"');
    expect(extjob41).toMatch(/text-4xl font-bold text-slate-900 mb-3/);
    expect(extjob41).not.toContain("mt-3 text-lg");
  });

  it("R40-I2: the external card joins the icon-over-line family — the centered tall padding on the Card itself (no slate border override), the bare CardContent, the w-first briefcase + the tight h3 gap + the darker-gray line (the old pt-12 wrapper + justify-center icon row retired)", () => {
    expect(extjob41).toMatch(/<Card className="text-center py-12">/);
    expect(extjob41).not.toContain("border-slate-200");
    expect(extjob41).toContain("w-16 h-16 text-slate-300 mx-auto mb-4");
    expect(extjob41).toContain("text-xl font-semibold text-slate-900 mb-2");
    expect(extjob41).not.toContain("flex justify-center");
  });

  it("R40-I3: the page reads the org/job query params and slug-filters its list (the superset; no match renders the zero-state — REF-parity for unresolvable params)", () => {
    expect(extjob41).toContain("useSearchParams");
    expect(extjob41).toMatch(/searchParams\.get\("org"\)/);
    expect(extjob41).toMatch(/searchParams\.get\("job"\)/);
  });
});

describe("session-42 footer focus family + employees row + sidebar attributes (parity round 41)", () => {
  const sidebarNav42 = read("src", "components", "layout", "sidebar-nav.tsx");
  const employees42 = read("src", "app", "(app)", "employees", "page.tsx");
  const globals42 = read("src", "app", "globals.css");

  // --- A. the footer ghost family's v4 Button base ---

  it("R41-A1: the bell carries REF's full v4 Button base + relative (the unread-badge context) with the svg's authored w-5 h-5 slate-600 (the base's size-4 guard renders 16px)", () => {
    expect(sidebarNav42).toContain(
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 w-9 relative"
    );
    expect(sidebarNav42).toMatch(/<Bell className="w-5 h-5 text-slate-600"/);
  });

  it("R41-A2: the moon carries the base + select-none with NO color classes (the icon inherits the sidebar-foreground token — zinc-700 light / zinc-100 dark)", () => {
    expect(sidebarNav42).toContain(
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 w-9 select-none"
    );
    const moonIdx = sidebarNav42.indexOf('aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}');
    const moonBlock = sidebarNav42.slice(moonIdx, moonIdx + 900);
    expect(moonBlock).not.toContain("text-zinc-700");
    expect(moonBlock).not.toContain("dark:text-zinc-100");
  });

  it("R41-A3: the عربي button carries REF's outline-variant string verbatim (whitespace-nowrap + the focus/disabled/svg members)", () => {
    expect(sidebarNav42).toContain(
      "justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border bg-background shadow-sm hover:text-accent-foreground h-8 rounded-md px-3 text-xs flex items-center gap-1.5 font-semibold text-slate-700 border-slate-300 hover:bg-slate-100 min-w-[64px]"
    );
    expect(sidebarNav42).toMatch(/<Languages className="w-4 h-4"/);
  });

  it("R41-A4: the user trigger carries REF's string (the disabled/svg guards; no stray outline-none member)", () => {
    expect(sidebarNav42).toContain(
      "inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-9 px-4 py-2 w-full justify-start gap-3 hover:bg-slate-100"
    );
  });

  // --- B. the moon's conditional icon render ---

  it("R41-B1: the moon renders ONE state-driven svg (REF's conditional moon/sun — NOT the two-svg class-driven pair)", () => {
    expect(sidebarNav42).not.toContain("dark:hidden");
    expect(sidebarNav42).not.toContain("hidden dark:block");
    expect(sidebarNav42).toMatch(/\{dark \? <Sun className="w-5 h-5" aria-hidden="true" \/> : <Moon className="w-5 h-5" aria-hidden="true" \/>\}/);
  });

  // --- C. the user-menu items as plain Radix divs ---

  it("R41-C1: the user-menu items are PLAIN DropdownMenu.Item divs (no asChild surfacing a/button tags — REF's items stretch the full 182px row); My Profile navigates via onSelect + router.push, Logout keeps the anti-prefetch location.href", () => {
    const menuIdx = sidebarNav42.indexOf("function UserMenu(");
    const block = sidebarNav42.slice(menuIdx);
    expect(block).not.toContain("DropdownMenu.Item asChild");
    expect(block).not.toContain("<Link");
    expect(block).toMatch(/onSelect=\{\(\) => router\.push\("\/profile"\)\}/);
    expect(block).toContain('window.location.href = "/logout"');
  });

  // --- D. the employees filter row ---

  it("R41-D1: the search input is FIXED at md:w-64 (256px) with the md:flex-none wrapper (REF re-measured 256 at 1440 AND 768; the r17 shrink arrangement rendered 228)", () => {
    expect(employees42).toContain('"relative flex-1 md:flex-none"');
    expect(employees42).toContain('className="pl-10 w-full md:w-64"');
    expect(employees42).not.toContain("md:max-w-64");
    expect(employees42).not.toContain("md:flex-initial");
  });

  it("R41-D2: the status select DEFAULTS to active (REF's live default, measured on three fresh loads)", () => {
    expect(employees42).toMatch(/useState[^\n]*"active"/);
    expect(employees42).not.toMatch(/useState[^\n]*"all"/);
  });

  it("R41-D3: the select's background is the UA buttonface keyword (the v4 preflight trap — v3 kept the OS gray rgb(239,239,239), v4 resets transparent)", () => {
    expect(employees42).toContain("bg-[buttonface]");
  });

  it("R41-D4/D5: the select carries REF's authored string verbatim — py-2 intrinsic height (no h-9) + the blue-500 focus ring pair", () => {
    expect(employees42).toContain(
      'className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[buttonface]"'
    );
    expect(employees42).not.toContain("focus:ring-1 focus:ring-ring");
  });

  // --- E. the shadcn Sidebar data-sidebar family ---

  it("R41-E1 (session-44 amendment): the shell carries REF's data-sidebar attribute family — header/content/group/group-label/group-content/menu/menu-button/menu-item/footer — and the contract now covers the toggles (data-size + data-active) and the subleaf li (REF's reloaded build authors the full set; the r41 bare-toggle reading was pre-redeploy)", () => {
    expect(sidebarNav42).toContain('data-sidebar="header"');
    expect(sidebarNav42).toContain('data-sidebar="content"');
    expect(sidebarNav42).toContain('data-sidebar="group"');
    expect(sidebarNav42).toContain('data-sidebar="group-label"');
    expect(sidebarNav42).toContain('data-sidebar="group-content"');
    expect(sidebarNav42).toContain('data-sidebar="menu"');
    expect(sidebarNav42).toContain('data-sidebar="menu-button"');
    expect(sidebarNav42).toContain('data-sidebar="menu-item"');
    expect(sidebarNav42).toContain('data-sidebar="footer"');
    // the menu-item li carries the shadcn group class (standalone +
    // subleaf); the group toggles sit in Radix Root divs
    expect(sidebarNav42).toContain('data-sidebar="menu-item" className="group/menu-item relative"');
  });

  // --- T. the sidebar-foreground token ---

  it("R41-T1: the light sidebar-foreground token is REF's zinc-700 (240 5.3% 26.1% — the moon's inherited color), not the app-foreground slate-800", () => {
    expect(globals42).toMatch(/--sidebar-foreground: hsl\(240 5\.3% 26\.1%\)/);
  });
});

describe("session-43 login redeploy re-audit (parity round 42 — the input base migration)", () => {
  /* REF redeployed BOTH login chunks (JS C-ulo5ek → DRs9_-5K, CSS
     BIWjBcok → DPOrvWRk; the app chunks quiet). The rendered surface
     stayed byte-identical on both bands — the redeploy changed the
     AUTHORED recipes: the login build's input component adopted the
     ring-2/offset-2 base (the round-39 two-build split counters
     retired), the Sign in ring switched to the ring-ring token, the
     w-full column flattened to three direct children, and the field
     wrapper adopted space-y-1.5. All live-measured on both apps. */

  const login43 = read("src", "app", "login", "page.tsx");

  // REF's new login-build input string, measured verbatim on both fields.
  const REF_INPUT_STRING =
    "flex w-full border px-3 py-2 text-base ring-offset-background " +
    "file:border-0 file:bg-transparent file:text-sm file:font-medium " +
    "file:text-foreground focus-visible:outline-none focus-visible:ring-2 " +
    "focus-visible:ring-ring focus-visible:ring-offset-2 " +
    "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 h-11 " +
    "sm:h-12 bg-slate-50/50 border-slate-200 focus:border-slate-400 " +
    "focus:ring-slate-400 rounded-xl placeholder:text-slate-600";

  // --- A. the login inputs' authored-string migration ---

  it("R42-A1: the email input carries REF's verbatim new-base string (the login build's own component — py-2 text-base + ring-offset-background + the focus-visible:ring-2 ring-ring ring-offset-2 triple in BASE position, md:text-sm at base-end, the pl-10 … slate-600 page tail)", () => {
    const emailIdx = login43.indexOf('id="email"');
    const emailBlock = login43.slice(emailIdx, emailIdx + 900);
    expect(emailBlock).toContain(`className="${REF_INPUT_STRING}"`);
  });

  it("R42-A2: the password input carries the identical verbatim string (REF's two fields are byte-identical)", () => {
    const pwIdx = login43.indexOf('id="password"');
    const pwBlock = login43.slice(pwIdx, pwIdx + 900);
    expect(pwBlock).toContain(`className="${REF_INPUT_STRING}"`);
  });

  it("R42-A3: the inputs are HAND-AUTHORED elements (not the shared v4 Input component — tailwind-merge cannot delete the shared base's shadow-sm/transition-colors, and REF's login build ships its own input component; the two-build split honored)", () => {
    expect(login43).not.toMatch(/import \{ Input \} from "@\/components\/ui\/input"/);
    const emailIdx = login43.indexOf('id="email"');
    // the <input opening tag sits just BEFORE the id attribute
    expect(login43.slice(emailIdx - 120, emailIdx)).toContain("<input");
    expect(login43).not.toMatch(/<Input\s/);
  });

  it("R42-A4: the retired split members appear NOWHERE in the input blocks (shadow-none/transition-none were the round-39 counters for a base REF no longer ships)", () => {
    const formIdx = login43.indexOf('id="email"');
    const formBlock = login43.slice(formIdx - 400, login43.indexOf("Sign in</button>"));
    expect(formBlock).not.toContain("shadow-none");
    expect(formBlock).not.toContain("transition-none");
  });

  // --- B. the Sign in ring token + the login --ring override ---

  it("R42-B1: the Sign in button carries focus-visible:ring-ring (REF's token member — the r38 hex pin retired)", () => {
    const idx = login43.indexOf("disabled={loading}");
    const btn = login43.slice(idx, idx + 800);
    expect(btn).toContain("focus-visible:ring-ring");
  });

  it("R42-B2: the login root scopes the zinc-950 --ring override (REF's login build sets it at :root; the clone scopes it to the login subtree — the app pages keep the shared neutral token; full-value form per trap 1)", () => {
    expect(login43).toMatch(/<main className="[^"]*\[--ring:#09090b\][^"]*"/);
  });

  // --- C. the w-full column restructure ---

  it("R42-C1: the w-full column has THREE direct children — the social space-y-3 group (buttons only), the my-6 divider, the form (REF's live-counted shape; the clone's nested single space-y-3 wrapper retired)", () => {
    // the social group (space-y-3) wraps ONLY the three buttons: the
    // group's opening tag is the last space-y-3 before the Google label,
    // and its closing tag lands right after the Apple button (before the
    // divider + the form — both then direct children of the w-full column).
    const googleIdx = login43.indexOf("Continue with Google");
    const appleIdx = login43.indexOf("Continue with Apple");
    const groupOpenIdx = login43.lastIndexOf('className="space-y-3"', googleIdx);
    expect(groupOpenIdx).toBeGreaterThan(-1);
    // the form tag must NOT sit between the group opening and the Apple
    // button (the old nesting put the form INSIDE the group)
    const groupSlice = login43.slice(groupOpenIdx, appleIdx);
    expect(groupSlice).not.toContain("<form");
    // after the Apple button: the divider (relative my-6) comes FIRST,
    // then the form — both outside the group
    const afterApple = login43.slice(appleIdx, appleIdx + 1600);
    const dividerAt = afterApple.indexOf('className="relative my-6"');
    const formAt = afterApple.indexOf("<form");
    expect(dividerAt).toBeGreaterThan(-1);
    expect(formAt).toBeGreaterThan(-1);
    expect(dividerAt).toBeLessThan(formAt);
  });

  // --- D. the field wrapper adopts space-y-1.5 ---

  it("R42-D1: the field DIV carries space-y-1.5 (REF's authored wrapper) with the explicit mt-1.5 kept on the relative wrapper (the trap-6 v4 restoration — v4's space-y lands on the inline label where vertical margins are ignored; the dashboard welcome-row pattern)", () => {
    const emailFieldIdx = login43.indexOf('id="email"');
    // lastIndexOf — the icon-comment between the wrapper and the input
    // inflates the distance (comments never quote class strings)
    const relIdx = login43.lastIndexOf('className="relative mt-1.5"', emailFieldIdx);
    const fieldIdx = login43.lastIndexOf('className="space-y-1.5"', emailFieldIdx);
    expect(relIdx).toBeGreaterThan(-1);
    expect(fieldIdx).toBeGreaterThan(-1);
    expect(fieldIdx).toBeLessThan(relIdx);
    // BOTH fields carry the pair
    const pwFieldIdx = login43.indexOf('id="password"');
    expect(login43.lastIndexOf('className="space-y-1.5"', pwFieldIdx)).toBeGreaterThan(-1);
    expect(login43.lastIndexOf('className="relative mt-1.5"', pwFieldIdx)).toBeGreaterThan(-1);
  });
});

describe("session-44 sidebar shadcn architecture + desktop collapse (parity round 43)", () => {
  const sidebarNav44 = read("src", "components", "layout", "sidebar-nav.tsx");
  const appShell44 = read("src", "components", "layout", "app-shell.tsx");
  const globals44 = read("src", "app", "globals.css");

  // --- D. the token corrections + the custom rules ---

  it("R43-D1: the light sidebar-accent family = REF's zinc-100/zinc-900 (the old --sidebar-accent was a wrong blue tint; the accent-foreground token was MISSING entirely), and the custom-class vars land at :root", () => {
    expect(globals44).toContain("--sidebar-accent: hsl(240 4.8% 95.9%)");
    expect(globals44).toContain("--sidebar-accent-foreground: hsl(240 5.9% 10%)");
    expect(globals44).toContain("--primary-color: #1877f2");
    expect(globals44).toContain("--accent-color: #e4e6eb");
    // the blue tint is retired
    expect(globals44).not.toContain("--sidebar-accent: hsl(214 95% 93%)");
  });

  it("R43-D2: the dark sidebar-accent family = REF's zinc-800/zinc-100", () => {
    // slice the .dark block — the light values above must not mask a
    // missing dark override
    const darkAt = globals44.indexOf(".dark {");
    const darkBlock = globals44.slice(darkAt, globals44.indexOf("}", globals44.indexOf("--sidebar-accent", darkAt)));
    expect(darkBlock).toContain("--sidebar-accent: hsl(240 3.7% 15.9%)");
    expect(darkBlock).toContain("--sidebar-accent-foreground: hsl(240 4.8% 95.9%)");
  });

  it("R43-D3: the unlayered custom rules, verbatim — the active nav tile's blue survives every layered utility (unlayered + !important)", () => {
    expect(globals44).toContain(".custom-primary-bg {");
    expect(globals44).toContain("background-color: var(--primary-color) !important;");
    expect(globals44).toContain(".custom-accent-bg {");
    expect(globals44).toContain("background-color: var(--accent-color) !important;");
  });

  // --- C. the SidebarNav shadcn restructure ---

  it("R43-C1: the content wrapper is REF's SidebarContent div (the nav ELEMENT retires — the last nav in the tree is the bottom tab bar) with min-h-0 + the rail overflow member; the extra flex h-full wrapper is gone", () => {
    expect(sidebarNav44).toContain(
      'data-sidebar="content" className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden p-3"'
    );
    expect(sidebarNav44).not.toContain("<nav");
    expect(sidebarNav44).not.toContain('className="flex h-full flex-col"');
  });

  it("R43-C2: the group family — group p-2 wrapper, the group-label's rail members (transition-[margin,opacity] + -mt-8 + opacity-0), group-content w-full, menu ul w-full min-w-0", () => {
    expect(sidebarNav44).toContain('data-sidebar="group" className="relative flex w-full min-w-0 flex-col p-2"');
    expect(sidebarNav44).toContain("group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0");
    expect(sidebarNav44).toContain("transition-[margin,opacity] duration-200 ease-linear");
    expect(sidebarNav44).toContain('data-sidebar="group-content" className="w-full text-sm"');
    expect(sidebarNav44).toContain('data-sidebar="menu" className="flex w-full min-w-0 flex-col gap-1"');
    // the group-label authors slate-500, not the muted token
    expect(sidebarNav44).toContain("text-slate-500 uppercase tracking-wider");
  });

  it("R43-C3: the shared shadcn menu-button base const — verbatim REF string with the !size-8/!p-2 rail members and the data-[active=true] dead-code family", () => {
    expect(sidebarNav44).toContain(
      'const MENU_BUTTON_BASE =\n  "peer/menu-button flex w-full items-center gap-2 overflow-hidden p-2 text-left outline-none ring-sidebar-ring focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0"'
    );
  });

  it("R43-C4: every nav button carries the full attribute contract (menu-button + data-size=default + data-active=false — REF authors false even on the active link) and the active branches add the inline blue style", () => {
    expect(sidebarNav44).toContain('data-sidebar="menu-button"\n      data-size="default"\n      data-active="false"');
    expect(sidebarNav44).toContain('style={active ? { backgroundColor: "rgb(24, 119, 242)" } : undefined}');
    expect(sidebarNav44).not.toContain('data-active="true"');
  });

  it("R43-C5: the leaf tails — inactive carries the sidebar-token hover pair + slate-600 + the dead hover:custom-accent-bg member; active replaces them with custom-primary-bg text-white font-medium shadow-sm (NO bg-primary)", () => {
    expect(sidebarNav44).toContain(
      '"hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 text-sm hover:opacity-80 transition-all duration-200 rounded-lg mb-1 text-slate-600 hover:custom-accent-bg flex items-center gap-3 px-3 py-2.5"'
    );
    expect(sidebarNav44).toContain(
      '"hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 text-sm hover:opacity-80 transition-all duration-200 rounded-lg mb-1 custom-primary-bg text-white font-medium shadow-sm flex items-center gap-3 px-3 py-2.5"'
    );
    expect(sidebarNav44).not.toContain("bg-primary font-medium text-white");
  });

  it("R43-C6: the toggle tail does NOT carry the sidebar-accent hover pair (the split that keeps the toggle's blue hover alive) — hover:bg-blue-50 + text-blue-700 over the base only", () => {
    expect(sidebarNav44).toContain(
      '"h-8 text-sm hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg mb-1 text-slate-600"'
    );
    // the toggle interior: REF's justify-between wrapper + the gap-3 row
    expect(sidebarNav44).toContain('className="flex items-center justify-between w-full px-3 py-2.5"');
    expect(sidebarNav44).toContain('className="flex items-center gap-3"');
  });

  it("R43-C7: the chevron is a GLYPH SWAP (chevron-down open, chevron-right collapsed — no rotation, no motion classes)", () => {
    expect(sidebarNav44).toContain('<ChevronDown className="w-4 h-4" aria-hidden="true" />');
    expect(sidebarNav44).toContain('<ChevronRight className="w-4 h-4" aria-hidden="true" />');
    expect(sidebarNav44).not.toContain("rotate-90");
    expect(sidebarNav44).not.toContain("transition-transform");
  });

  it("R43-C8: the no-ul submenu — Collapsible.Content is div.pl-4.space-y-1 with DIRECT li menu-item children (group/menu-item relative); subleaf tails use px-3 py-2 with NO mb-1", () => {
    expect(sidebarNav44).toMatch(/<Collapsible\.Content\s+id=\{contentId\}\s+className="pl-4 space-y-1">/);
    expect(sidebarNav44).toContain('data-sidebar="menu-item" className="group/menu-item relative"');
    expect(sidebarNav44).toContain(
      '"hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 text-sm hover:opacity-80 transition-all duration-200 rounded-lg text-slate-600 hover:custom-accent-bg flex items-center gap-3 px-3 py-2"'
    );
    expect(sidebarNav44).toContain(
      '"hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 text-sm hover:opacity-80 transition-all duration-200 rounded-lg custom-primary-bg text-white font-medium shadow-sm flex items-center gap-3 px-3 py-2"'
    );
    expect(sidebarNav44).not.toContain("mt-1 flex flex-col gap-1 pl-4");
  });

  it("R43-C9: label spans + icons mirror REF — leaf/toggle spans font-medium, subleaf spans text-sm; top-level icons author w-5 h-5 (the base guard renders 16px), subleaf icons w-4 h-4; NO icon color classes (inheritance)", () => {
    expect(sidebarNav44).toContain('<span className="font-medium">{item.label}</span>');
    expect(sidebarNav44).toContain('<span className="text-sm">{child.label}</span>');
    expect(sidebarNav44).toContain('<Icon className="w-5 h-5" aria-hidden="true" />');
    expect(sidebarNav44).toContain('<ChildIcon className="w-4 h-4" aria-hidden="true" />');
    expect(sidebarNav44).not.toContain('className="h-4 w-4 shrink-0"');
    expect(sidebarNav44).not.toContain('className="h-5 w-5 shrink-0 text-slate-600"');
  });

  // --- A. the desktop collapse ---

  it("R43-A1: the peer wrapper carries REF's four data attrs and flips on the collapse state — the spacer/wrap/inner s40 members respond to data-collapsible=icon", () => {
    expect(appShell44).toMatch(
      /<div\s+className="group peer hidden text-sidebar-foreground md:block"\s+data-state=\{collapsed \? "collapsed" : "expanded"\}\s+data-collapsible=\{collapsed \? "icon" : ""\}\s+data-variant="sidebar"\s+data-side="left"\s+>/
    );
    expect(appShell44).toContain("const [collapsed, setCollapsed] = React.useState(false);");
  });

  it("R43-A2: the trigger's click branches on the 768px media — desktop toggles the icon-rail collapse, mobile opens the drawer (REF's authored branch; the trigger lives in the md:hidden header either way)", () => {
    expect(appShell44).toContain('if (window.matchMedia("(min-width: 768px)").matches)');
    expect(appShell44).toContain("setCollapsed((c) => !c);");
    expect(appShell44).toContain("setMobileOpen(true);");
  });
});

describe("session-45 login redeploy re-audit (parity round 44 — the icon colors + the runtime ring cascade)", () => {
  /* Round 44's census: REF's login redeployed TWICE mid-session (the 8th
     + 9th deploys) — the rendered surface at rest stayed byte-identical,
     but the census reached the COLOR + INTERIOR dimensions 43 rounds never
     measured: (1) the platform runtime injects a second Tailwind v3.4.17
     stylesheet INLINE after the linked one, whose two plain-:focus rules
     beat focus-visible:ring-ring in the cascade — the keyboard-focused
     inputs render SLATE-400 on REF; (2) the field icons are slate-500 with
     the v3 transform member (the clone rendered slate-400 lighter); (3)
     the Apple logo is path-level BLACK (the clone's currentColor rendered
     slate-700) and REF's Microsoft squares ship its own blue/green
     variant; (4) the loading state swaps the text + carries the mr-2
     spinner; (5) the title/subtitle member order. */

  const loginPage45 = read("src", "app", "login", "page.tsx");

  // --- A. the runtime-injected ring cascade ---

  it("R44-A1: the login ships the runtime-mirror style block — REF's two verbatim focus rules, rendered IN PLACE (a plain style element lands after the head links — the same winning cascade position the platform's injected block occupies)", () => {
    // the two rules verbatim from REF's runtime block (the escaped class
    // selectors double-escaped for the template literal)
    expect(loginPage45).toContain(
      ".focus\\\\:border-slate-400:focus{--tw-border-opacity:1;border-color:rgb(148 163 184 / var(--tw-border-opacity, 1))}"
    );
    expect(loginPage45).toContain(
      ".focus\\\\:ring-slate-400:focus{--tw-ring-opacity:1;--tw-ring-color:rgb(148 163 184 / var(--tw-ring-opacity, 1))}"
    );
    // a plain in-place style element (no precedence prop — React 19 only
    // hoists styles that carry one)
    expect(loginPage45).toMatch(/<style>\{`/);
  });

  it("R44-A2: the input class strings stay REF-verbatim (the fix is PURE CASCADE — no member changes on the inputs themselves; the ring-ring token appears on the two inputs AND the Sign in's base; session-46 amendment — the hidden views' four sibling inputs + two CTAs carry the tokens too, so the counts anchor to the SIGN-IN form region)", () => {
    const signinRegion = loginPage45.slice(loginPage45.indexOf('id="email"'), loginPage45.indexOf('flex flex-col sm:flex-row'));
    expect(signinRegion.match(/focus-visible:ring-ring/g)?.length).toBe(3);
    expect(signinRegion.match(/focus:ring-slate-400/g)?.length).toBe(2);
    expect(signinRegion.match(/focus:border-slate-400/g)?.length).toBe(2);
  });

  // --- B. the field icon pair ---

  it("R44-B1: the Mail field icon is hand-authored with REF's older-lucide glyph (the envelope rect FIRST + the 1.94-arc flap) and the verbatim class — the v3 transform member + slate-500, NO pointer-events-none (the clone's slate-400 icons rendered lighter)", () => {
    const i = loginPage45.indexOf("lucide lucide-mail");
    expect(i).toBeGreaterThan(0);
    const block = loginPage45.slice(i - 60, i + 800);
    expect(block).toContain(
      "lucide lucide-mail absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500"
    );
    expect(block).not.toContain("pointer-events-none");
    expect(block).not.toContain("text-slate-400");
    expect(block).toContain('<rect width="20" height="16" x="2" y="4" rx="2" />');
    expect(block).toContain('d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"');
  });

  it("R44-B2: the Lock field icon carries the same verbatim class (slate-500 + the transform member) with REF's glyph (the ry-2 body rect + the shackle path)", () => {
    const i = loginPage45.indexOf("lucide lucide-lock");
    expect(i).toBeGreaterThan(0);
    const block = loginPage45.slice(i - 60, i + 800);
    expect(block).toContain(
      "lucide lucide-lock absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500"
    );
    expect(block).not.toContain("pointer-events-none");
    expect(block).toContain('<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />');
    expect(block).toContain('d="M7 11V7a5 5 0 0 1 10 0v4"');
  });

  it("R44-B3: the lucide-react Mail/Lock imports retire (the hand-authored svgs replace them — REF's glyphs are the older lucide revision the current package no longer ships)", () => {
    expect(loginPage45).not.toMatch(/import \{[^}]*\bMail\b[^}]*\} from "lucide-react"/);
    expect(loginPage45).not.toMatch(/import \{[^}]*\bLock\b[^}]*\} from "lucide-react"/);
    // the old component usages (with props/whitespace after the tag name);
    // the FieldIcon replacements do not match this form
    expect(loginPage45).not.toMatch(/<Mail[\s/>]/);
    expect(loginPage45).not.toMatch(/<Lock[\s/>]/);
  });

  // --- C. the social icon family ---

  it("R44-C1: the Apple logo carries the path-level BLACK fill (REF authors fill on the path with NO svg-level fill — the clone's currentColor rendered the button's slate-700 gray)", () => {
    const i = loginPage45.indexOf("function AppleIcon");
    const block = loginPage45.slice(i, i + 1400);
    expect(block).toContain('fill="#000000"');
    expect(block).not.toContain('fill="currentColor"');
    // REF's classic two-path leaf glyph stays
    expect(block).toContain("M13 3.5c.73-.83 1.94-1.46 2.94-1.5");
  });

  it("R44-C2: the Microsoft squares ship REF's own variant order — red, BLUE top-right, GREEN bottom-left, yellow (NOT the real logo's red/green/blue/yellow the clone shipped)", () => {
    const i = loginPage45.indexOf("function MicrosoftIcon");
    const block = loginPage45.slice(i, i + 900);
    const order = [
      '#F25022" d="M1 1',
      '#00A4EF" d="M13 1',
      '#7FBA00" d="M1 13',
      '#FFB900" d="M13 13',
    ];
    let last = -1;
    for (const frag of order) {
      const at = block.indexOf(frag);
      expect(at).toBeGreaterThan(last);
      last = at;
    }
  });

  it("R44-C3: the Google icon's paths author d BEFORE fill (REF's serialization order — the clone's fill-first reordered the DOM attributes)", () => {
    const i = loginPage45.indexOf("function GoogleIcon");
    const block = loginPage45.slice(i, i + 1600);
    // the geometry data first, the fill second (REF's attribute order)
    expect(block).toMatch(/d="M22\.56[^"]*"\s*\n\s*fill="#4285F4"/);
    expect(block).not.toMatch(/fill="#4285F4"\s*\n\s*d=/);
  });

  // --- D. the loading state ---

  it("R44-D1: the Sign in text swaps to REF's loading copy while submitting (the button ALSO disables — the disabled anchor stays)", () => {
    expect(loginPage45).toContain('disabled={loading}');
    expect(loginPage45).toContain('{loading ? "Signing in..." : "Sign in"}');
  });

  it("R44-D2: the spinner carries REF's mr-2 member (the button's gap-1 stacks with it — identical by construction, both sides ship both)", () => {
    expect(loginPage45).toContain('className="mr-2 h-4 w-4 animate-spin"');
    expect(loginPage45).not.toContain('className="h-4 w-4 animate-spin"');
  });

  // --- E. the title/subtitle member order ---

  it("R44-E1: the title + subtitle adopt REF's verbatim member order (render-neutral authored-recipe migration — same sets, REF's order)", () => {
    expect(loginPage45).toContain('className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight"');
    expect(loginPage45).toContain('className="text-slate-500 text-sm sm:text-base font-medium"');
    expect(loginPage45).not.toContain('className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"');
    expect(loginPage45).not.toContain('className="text-sm font-medium text-slate-500 sm:text-base"');
  });
});

describe("session-46 hidden login flows (parity round 45 — the password-reset + sign-up views)", () => {
  /* Round 45's census (the 11th login deploy): the login card's w-full
     column swaps its ENTIRE content when the sign-in action buttons are
     clicked — two view-swapped flows 44 rounds never censused (they leave
     no DOM trace until clicked). REF's password-reset flow: the back
     button + title group + one-field form, the "Sending..." loading swap,
     then the "Check your email" success view (the icon circle + the
     green Alert + the submitted email span) with ANTI-ENUMERATION
     verified live (a non-existent email renders the identical view).
     REF's sign-up flow: a bare space-y-4 wrapper, the H2 direct (no
     subtitle), the three-field form (the bare space-y-3 fields group),
     the "Creating account..." swap, and the duplicate-email error with
     REF's verbatim copy. The hidden views' inputs are a SIBLING family
     (h-10 sm:h-11 + placeholder:text-slate-400; the sign-in pair ships
     h-11 sm:h-12 + placeholder:text-slate-600) and their field icons sit
     at slate-400 (the re-measured sign-in pair is slate-500). The
     trap-6 restorations: the -mb-2 back buttons kill v4's :where space-y
     margin, so the following elements author the mt members (the title
     group mt-4 sm:mt-6 / the signup H2 mt-4); the field units' relative
     wrappers author the r42 mt-1.5. */

  const loginPage46 = read("src", "app", "login", "page.tsx");
  const alertUi46 = read("src", "components", "ui", "alert.tsx");
  let forgotRoute46 = "";
  try { forgotRoute46 = read("src", "app", "api", "auth", "forgot-password", "route.ts"); } catch { /* RED until created */ }
  let signupRoute46 = "";
  try { signupRoute46 = read("src", "app", "api", "auth", "signup", "route.ts"); } catch { /* RED until created */ }

  // --- A. the password-reset view ---

  it("R45-A1: the login swaps views behind the action buttons (the card's w-full column unmounts the logo/title/social/divider entirely — the clone's former not-configured error Alerts retire)", () => {
    expect(loginPage46).toMatch(/type LoginView = "signin" \| "reset" \| "reset-success" \| "signup";/);
    expect(loginPage46).toMatch(/useState<LoginView>\("signin"\)/);
    expect(loginPage46).not.toContain("Password reset is not configured");
    expect(loginPage46).not.toContain("Sign up is disabled");
    // the two action buttons swap views; the three back buttons return
    expect(loginPage46).toMatch(/onClick=\{\(\) => \{ setView\("reset"\)/);
    expect(loginPage46).toMatch(/onClick=\{\(\) => \{ setView\("signup"\)/);
    expect(loginPage46.match(/onClick=\{backToSignin\}/g)?.length).toBe(3);
  });

  it("R45-A2: the back button is REF's verbatim recipe — the -mb-2 mb + the arrow-left glyph (m12 19-7-7 7-7 + M19 12H5) hand-authored", () => {
    expect(loginPage46.match(/className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors -mb-2"/g)?.length).toBe(2);
    expect(loginPage46).toContain('className="lucide lucide-arrow-left h-4 w-4"');
    expect(loginPage46).toContain('d="m12 19-7-7 7-7"');
    expect(loginPage46).toContain('d="M19 12H5"');
  });

  it("R45-A3: the reset title group is REF's recipe with the trap-6 restoration (text-center space-y-2 + the authored mt-4 sm:mt-6 — the -mb-2 kills v4's :where space-y mb, the member restores REF's v3-stacked 8/16px gap)", () => {
    expect(loginPage46).toContain('className="text-center space-y-2 mt-4 sm:mt-6"');
    expect(loginPage46).toContain('className="text-xl sm:text-2xl font-bold text-slate-900"');
    expect(loginPage46).toContain("Reset your password");
    expect(loginPage46).toContain('className="text-slate-600 text-sm sm:text-base"');
    expect(loginPage46).toContain("Enter your email and we&apos;ll send you a link to reset your password");
  });

  it("R45-A4: the reset field unit is the sign-in's architecture with the sibling family — space-y-1.5 + the mt-1.5 relative wrapper + the slate-400 mail icon (the hidden views' icons sit LIGHTER than the sign-in pair's slate-500)", () => {
    const i = loginPage46.indexOf("Reset your password");
    const block = loginPage46.slice(i, i + 1600);
    expect(block).toContain('className="space-y-1.5"');
    expect(block).toContain('className="relative mt-1.5"');
    expect(block).toContain("<MailFieldIconSlate400 />");
    // the icon component's verbatim class (the hand-authored definition)
    expect(loginPage46).toContain("lucide lucide-mail absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400");
  });

  it("R45-A5: the reset input is the SIBLING family verbatim (the shared base with h-10 sm:h-11 44px + placeholder:text-slate-400 — NOT the sign-in's h-11 sm:h-12 + slate-600; no autocomplete attr; the reset copy ends at the placeholder member while the signup trio appends the responsive font pair)", () => {
    expect(loginPage46.match(/rounded-xl placeholder:text-slate-400"/g)?.length).toBe(1);
    expect(loginPage46.match(/rounded-xl placeholder:text-slate-400 text-sm sm:text-base"/g)?.length).toBe(3);
    expect(loginPage46).toContain('py-2 text-base ring-offset-background');
    expect(loginPage46).toContain('placeholder="you@example.com"');
  });

  it("R45-A6: the reset CTA is REF's verbatim dark block with the loading swap (Send reset link → Sending... + the r44 mr-2 spinner family)", () => {
    expect(loginPage46).toContain('className="inline-flex items-center justify-center gap-1 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 px-3 py-2 w-full h-10 sm:h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm rounded-xl transition-all duration-200"');
    expect(loginPage46).toContain('{loading ? "Sending..." : "Send reset link"}');
  });

  // --- B. the sign-up view ---

  it("R45-B1: the signup wrapper is BARE space-y-4 (16px both bands — the reset's sm:space-y-6 gives 24px desktop) with the H2 DIRECT (no title group, no subtitle) + the trap-6 mt-4 restoration", () => {
    const i = loginPage46.indexOf("Create your account");
    const block = loginPage46.slice(i - 700, i + 200);
    expect(block).toContain('className="space-y-4"');
    expect(loginPage46).toContain('className="text-xl sm:text-2xl font-bold text-slate-900 mt-4"');
    expect(loginPage46.match(/Create your account[\s\S]{0,600}?text-slate-600/g)?.length ?? 0).toBe(0);
  });

  it("R45-B2: the signup form is space-y-3 sm:space-y-4 around a BARE space-y-3 fields group — three units with REF's ids + placeholders (email/password/confirmPassword) and the TAIL font pair the reset input lacks", () => {
    const i = loginPage46.indexOf("Create your account");
    const block = loginPage46.slice(i, i + 4200);
    expect(block).toContain('className="space-y-3 sm:space-y-4"');
    expect(block).toContain('className="space-y-3"');
    expect(block.match(/className="space-y-1\.5"/g)?.length).toBe(3);
    expect(block.match(/className="relative mt-1\.5"/g)?.length).toBe(3);
    expect(loginPage46.match(/rounded-xl placeholder:text-slate-400 text-sm sm:text-base"/g)?.length).toBe(3);
    expect(loginPage46).toContain('htmlFor="confirmPassword"');
    expect(loginPage46).toContain('placeholder="Min. 8 characters"');
    expect(loginPage46).toContain('placeholder="Re-enter password"');
    // the two lock usages share ONE hand-authored definition (the class string exists once in the source)
    expect(loginPage46.match(/<LockFieldIconSlate400 \/>/g)?.length).toBe(2);
    expect(loginPage46).toContain("lucide lucide-lock absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400");
  });

  it("R45-B3: the signup CTA swaps to REF's loading copy (Create account → Creating account... + the spinner)", () => {
    expect(loginPage46).toContain('{loading ? "Creating account..." : "Create account"}');
  });

  it("R45-B4: the duplicate-email error renders INSIDE the form (between the fields group and the CTA) in the r33 error Alert family — the client also guards the confirm-mismatch path (the unmeasured superset)", () => {
    const i = loginPage46.indexOf("onSignupSubmit");
    const block = loginPage46.slice(loginPage46.indexOf('className="space-y-3 sm:space-y-4"', i), loginPage46.indexOf("Create account", i) + 60);
    expect(block.indexOf("variant=\"error\"")).toBeGreaterThan(-1);
    expect(loginPage46).toContain("Passwords do not match");
  });

  // --- C. the reset-success view ---

  it("R45-C1: the success view's icon circle is REF's recipe (mx-auto w-14/h-14 sm:w-16/h-16 bg-slate-100 rounded-full) wrapping the older-lucide mail at slate-700 h-7/w-7 sm:h-8/w-8", () => {
    expect(loginPage46).toContain('className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center"');
    expect(loginPage46).toContain("lucide lucide-mail h-7 w-7 sm:h-8 sm:w-8 text-slate-700");
  });

  it("R45-C2: the success title group is the space-y-2 family with the P's two-line structure (the instruction line + the br + the font-medium slate-900 email span)", () => {
    expect(loginPage46).toContain("Check your email");
    expect(loginPage46).toContain("We&apos;ve sent password reset instructions to");
    expect(loginPage46).toContain('<span className="font-medium text-slate-900">{resetEmail}</span>');
  });

  it("R45-C3: the green Alert is the success variant (the alert component ships bg-green-50/70 border-green-200 — the r33 error sibling) with REF's verbatim description copy + the bottom full-width back button", () => {
    expect(alertUi46).toContain('success: "text-foreground bg-green-50/70 border-green-200 rounded-xl"');
    expect(loginPage46).toContain('<Alert variant="success">');
    expect(loginPage46).toContain("Please check your email for the password reset link. It may take a few minutes to arrive.");
    expect(loginPage46).toContain('className="w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"');
  });

  // --- D. the API seams ---

  it("R45-D1: /api/auth/forgot-password is the anti-enumeration contract (zod-validated; ALWAYS ok — no account-existence signal in the response either way, the behavior verified live with a non-existent email)", () => {
    expect(forgotRoute46).toContain("guard");
    expect(forgotRoute46).toMatch(/findUnique|findFirst/);
    expect(forgotRoute46).not.toMatch(/err\(/);
  });

  it("R45-D2: /api/auth/signup returns REF's verbatim duplicate copy + the auto-login superset (hashPassword + createSessionCookie on the new-email path)", () => {
    expect(signupRoute46).toContain("A user with this email already exists");
    expect(signupRoute46).toContain("hashPassword");
    expect(signupRoute46).toContain("setSessionCookie");
    expect(signupRoute46).toMatch(/role:\s*"employee"/);
  });

  // --- E. the foreground token ---

  it("R45-E1: the login main gains the zinc-950 --foreground pin (the r42 --ring sibling — REF's login build sets 240 10% 3.9% at :root; the Alert family's text-foreground resolves rgb(9,9,11), the app pages keep the shared neutral token)", () => {
    expect(loginPage46).toMatch(/\[--ring:#09090b\] \[--foreground:#09090b\]">/);
  });
});

describe("session-47 zero-state app interiors (parity round 46 — the page-root families + the stat conditionals + the CardTitle tag)", () => {
  /* Round 46's census (probe-r46-census-a..h.mjs, live @1440×900 with a
     ZERO-TENANT scratch server on :3201 — schema + the demo user only,
     mirroring REF's 0-employee tenant so the zero-data pages compare
     like-for-like): the route sweep pins h1s only, so 45 rounds never
     censused the page INTERIORS. The findings: (A) REF renders THREE
     page-root families — a `relative overflow-hidden > touch-pan-y` pair
     (7 pages + attendance's nested form; the pair's third member, the
     absolute-top deco at opacity:0 with the refresh-cw scroll widget, is
     invisible platform runtime — non-clone), the v3 `bg-gradient-to-br`
     forms (the clone ships the same colors as arbitrary-value strings and
     MISSES the dark: pairs on taskmanager/attendance/profile), and the
     bare staffrequests wrapper; (B) the payroll + recruitment stat rows
     render on the clone at ZERO data but not on REF (both stay as the
     with-data superset); (C) REF's stat cards carry per-page element tags
     (attendance's standard variant = div values + div labels; the
     documenttracker horizontal = p values + p labels) while the clone
     renders p values + div labels everywhere; (D) REF's CardTitle is a
     DIV (`font-semibold tracking-tight text-base`) — the session-6
     comment already called it "the Base44 title div" but the scaffold
     kept the h3 tag; (E) REF's zero-tenant dashboard renders the DEFAULT
     leave-balances UI (Annual 21/21 blue + Sick 30/30 green) where the
     clone showed an empty state; (F) REF's profile renders a hidden
     avatar file input + the full_name/email/phone/job_title id family.
     The REF-side drop: the page-root select-none family (R23-B) left REF
     — only the shell chrome (the bottom-nav anchors + the footer ghost
     buttons) keeps it. */

  const page = (...p: string[]) => read("src", "app", "(app)", ...p);
  let pageCanvas47 = "";
  try { pageCanvas47 = read("src", "components", "shared", "page-canvas.tsx"); } catch { /* RED until created */ }

  // --- A. the page-root families ---

  it("R46-A1: the PageCanvas component — REF's page-level pair (relative overflow-hidden > touch-pan-y; the invisible deco slot is documented non-clone)", () => {
    expect(pageCanvas47).toContain('className="relative overflow-hidden"');
    expect(pageCanvas47).toContain('className="touch-pan-y"');
    expect(pageCanvas47).not.toContain("absolute top-0");
  });

  it("R46-A2: the seven TRIO pages render PageCanvas with their verbatim content roots (dashboard/employees bare; payroll/taskmanager/leavemanagement/expenses/loans gradients — the v3 form + the dark: pairs; NO select-none anywhere — REF dropped the page-root family, only the shell chrome keeps it)", () => {
    const trio: [string, string, string][] = [
      ["dashboard", "dashboard", 'className="p-4 md:p-8 space-y-8"'],
      ["employees", "employees", 'className="p-4 md:p-8"'],
      ["payroll", "payroll", 'className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8"'],
      ["taskmanager", "taskmanager", 'className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8"'],
      ["leavemanagement", "leavemanagement", 'className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8"'],
      ["expenses", "expenses", 'className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-8"'],
      ["loans", "loans", 'className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8"'],
    ];
    for (const [name, route, root] of trio) {
      const src = page(route, "page.tsx");
      expect(src, name).toContain("<PageCanvas>");
      expect(src, name).toContain(root);
      expect(src, name).not.toContain("select-none");
      if (root.includes("min-h-screen")) {
        const m = src.match(/className="min-h-screen[^"]*"/);
        expect(m?.[0], name).not.toContain("bg-[linear-gradient");
      }
    }
  });

  it("R46-A3: attendance keeps its gradient root FIRST (the v3 form + the dark pair) and NESTS the PageCanvas around the max-w-7xl space-y-8 content (REF's inverted arrangement — the only measured page that nests)", () => {
    const src = page("attendance", "page.tsx");
    expect(src).toContain('className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8"');
    expect(src).toContain("<PageCanvas>");
    expect(src).toContain('className="max-w-7xl mx-auto space-y-8"');
    expect(src).not.toContain("flex-col gap-8");
    expect(src).not.toContain("select-none");
  });

  it("R46-A4: the five plain-gradient pages + staffrequests adopt REF's verbatim roots (recruitment indigo/blue, training purple/blue, documenttracker blue/indigo, profile slate/blue + dark, settings slate/blue; staffrequests the bare max-w-7xl space-y-6 wrapper)", () => {
    const roots: [string, string][] = [
      ["recruitment", 'className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-4 md:p-8"'],
      ["training", 'className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8"'],
      ["documenttracker", 'className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8"'],
      ["profile", 'className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8"'],
      ["settings", 'className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8"'],
      ["staffrequests", 'className="p-4 md:p-8 max-w-7xl mx-auto space-y-6"'],
    ];
    for (const [name, root] of roots) {
      const src = page(name, "page.tsx");
      expect(src, name).toContain(root);
      expect(src, name).not.toContain("select-none");
      if (root.includes("min-h-screen")) {
        const m = src.match(/className="min-h-screen[^"]*"/);
        expect(m?.[0], name).not.toContain("bg-[linear-gradient");
      }
    }
  });

  it("R46-A5: the PageHeader kicker adopts REF's current verbatim (sticky top-0 z-20 + the dark: pair + safe-area-top — the session-9 rendered-truth note stays: the sticky is inert inside the r39 scroller stack)", () => {
    expect(pageHeader).toContain("md:hidden sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 safe-area-top");
  });

  // --- B. the stat-row conditionals ---

  it("R46-B1 (corrected): payroll's stat grid renders at ZERO too — REF's values + labels are DIVs, invisible to the round's first P-based census read; the zone is REF's verbatim order + the measured icon family (dollar-sign/users/trending-up/calendar, per-color tiles)", () => {
    const src = page("payroll", "page.tsx");
    expect(src).toContain('className="grid md:grid-cols-4 gap-6"');
    expect(src).not.toMatch(/records\.length > 0 &&/);
    /* Session 48 (R47-D1): the icon classes moved onto the svg
       (w-6 h-6 text-{c}-600) + the tile carries bg only — REF's
       live-measured tile form. */
    expect(src).toContain('icon={<DollarSign className="w-6 h-6 text-green-600" aria-hidden="true" />} tileClassName="bg-green-100"');
    expect(src).toContain('icon={<TrendingUp className="w-6 h-6 text-purple-600" aria-hidden="true" />} tileClassName="bg-purple-100"');
    expect(src).toContain('icon={<Calendar className="w-6 h-6 text-orange-600" aria-hidden="true" />} tileClassName="bg-orange-100"');
  });

  it("R46-B2 (corrected): recruitment's stat grid renders at ZERO too (the DIV-valued family the census missed) — the measured icon set (briefcase/users/circle-check-big/trending-up) with the per-color indigo/blue/green/purple tiles", () => {
    const src = page("recruitment", "page.tsx");
    expect(src).toContain("grid grid-cols-2 md:grid-cols-4 gap-4");
    expect(src).not.toMatch(/jobs\.length > 0 \|\| candidates\.length > 0/);
    /* Session 48 (R47-D1): the compact tile renders DIRECTLY (mb-3 on
       the tile, no wrapper) + the icon classes on the svg. */
    expect(src).toContain('icon={<CircleCheckBig className="w-5 h-5 text-green-600" aria-hidden="true" />} tileClassName="bg-green-100"');
    expect(src).toContain('icon={<TrendingUp className="w-5 h-5 text-purple-600" aria-hidden="true" />} tileClassName="bg-purple-100"');
    expect(src).toContain('label="Active Jobs" value={stats.activeJobs} icon={<Briefcase className="w-5 h-5 text-indigo-600" aria-hidden="true" />} tileClassName="bg-indigo-100"');
  });

  // --- C. the StatCard per-variant element tags ---

  it("R46-C1: the standard + compact stat values render as DIVs (REF's zero-state rows measured: attendance's standard = div.text-3xl values + div labels; payroll's standard + recruitment's compact = the same div family — the round's first census missed them behind the P-based outline)", () => {
    expect(statCard).toMatch(/standard:\s*"div"/);
    expect(statCard).toMatch(/compact:\s*"div"/);
  });

  it("R46-C2: the horizontal stat label renders as a P (documenttracker measured: p values + p labels — 'Total Documents'/'Valid'/'Expiring ≤30 days'/'Expired')", () => {
    expect(statCard).toMatch(/horizontal:\s*"p"/);
  });

  it("R46-C3: the compact stat label is text-slate-500 (recruitment's zero-state row measured: div.text-sm text-slate-500 — the standard family keeps slate-600)", () => {
    expect(statCard).toMatch(/compact:\s*"text-slate-500"/);
  });

  it("R46-C4: documenttracker's stat icons are REF's measured family (file-text / circle-check-big / triangle-alert / circle-x — the clone's file-stack/file-check-2/file-clock/file-x-2 set retired)", () => {
    const src = page("documenttracker", "page.tsx");
    expect(src).toContain('label="Total Documents" value={stats.total} icon={<FileText');
    expect(src).toContain('label="Valid" value={stats.valid} icon={<CircleCheckBig');
    expect(src).toContain('label="Expiring ≤30 days" value={stats.expiring} icon={<TriangleAlert');
    expect(src).toContain('label="Expired" value={stats.expired} icon={<CircleX');
    expect(src).not.toContain("FileStack");
  });

  // --- D. the CardTitle tag ---

  it("R46-D1: CardTitle renders REF's DIV (the session-6 comment already called it 'the Base44 title div' — 4 div.font-semibold tracking-tight text-base on the REF dashboard, 0 tracking-tight h3s on any sampled page) with REF's class order", () => {
    expect(card).toContain('function CardTitle({ className, ...props }: React.ComponentProps<"div">');
    expect(card).toContain('cn("font-semibold tracking-tight text-base", className)');
    expect(card).not.toContain('ComponentProps<"h3">');
  });

  // --- E. the dashboard interior ---

  it("R46-E1: the leave-balances card renders the DEFAULT UI at zero balances (REF's zero-tenant dashboard: Annual Leave 21/21 with the full bg-blue-500 bar + Sick Leave 30/30 with bg-green-500 — NOT an empty state)", () => {
    const src = page("dashboard", "page.tsx");
    expect(src).toContain("Annual Leave");
    expect(src).toContain("remaining: 21, entitled: 21");
    expect(src).toContain("Sick Leave");
    expect(src).toContain("remaining: 30, entitled: 30");
    expect(src).not.toContain("No leave balances yet");
  });

  it("R46-E2: the quick-action items are a BARE Link wrapping the styled inner div (REF: a{} > div.flex items-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer)", () => {
    const src = page("dashboard", "page.tsx");
    expect(src).not.toMatch(/<Link[^>]*className="flex cursor-pointer/);
    expect(src).toContain('className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"');
  });

  it("R46-E3: the Customize button rides in a flex items-center gap-3 wrapper (REF's welcome-row right column)", () => {
    const src = page("dashboard", "page.tsx");
    expect(src).toMatch(/<div className="flex items-center gap-3">\s*<CustomizeButton/);
  });

  // --- F. the profile family ---

  it("R46-F1: the identity header renders REF's hidden avatar file input between the email line and the Change Photo button (r48: the ref + onChange wiring — the WORKING upload)", () => {
    const src = page("profile", "page.tsx");
    /* Session 49 (R48-F1) amendment: the input carries the ref + the
       onChange (the canvas downscale + POST flow); the id/accept/
       hidden contract is unchanged. */
    expect(src).toContain('ref={avatarInputRef}');
    expect(src).toContain('type="file"');
    expect(src).toContain('id="avatar"');
    expect(src).toContain('accept="image/*"');
    expect(src).toContain('onChange={(e) => void onPickAvatar(e.target.files?.[0])}');
    expect(src).toContain('avatarInputRef.current?.click()');
  });

  it("R46-F2: the profile form input ids are REF's family (full_name/email/phone/job_title + the matching Label htmlFor pairs — the pf-* family retired)", () => {
    const src = page("profile", "page.tsx");
    expect(src).toContain('htmlFor="full_name"');
    expect(src).toContain('id="full_name"');
    expect(src).toContain('htmlFor="email"');
    expect(src).toContain('id="phone"');
    expect(src).toContain('id="job_title"');
    expect(src).not.toContain("pf-name");
    expect(src).not.toContain("pf-email");
    expect(src).not.toContain("pf-phone");
    expect(src).not.toContain("pf-title");
  });

  it("R46-F3: the audit-note line is gone (REF's profile renders no audit notice — the audit-logging superset stays backend-side)", () => {
    const src = page("profile", "page.tsx");
    expect(src).not.toContain("audited for security");
  });

  // --- G. the icon family (rendered diffs) ---

  it("R46-G1: employees' Import CSV + search icons are hand-authored to REF's OLD-lucide glyphs (upload = the tray-first path + polyline + line, class w-4 h-4 mr-2; search = circle-first + the m21 21-4.3-4.3 tail, class absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 — the installed 0.525 ships the newer revisions and muted-foreground)", () => {
    const src = page("employees", "page.tsx");
    expect(src).toContain('lucide lucide-upload w-4 h-4 mr-2');
    expect(src).toContain('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4');
    expect(src).toContain('points="17 8 12 3 7 8"');
    expect(src).toContain('lucide lucide-search absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400');
    expect(src).toContain('m21 21-4.3-4.3');
    expect(src).not.toContain("text-muted-foreground\" aria-hidden=\"true\" />\n            </div>");
  });

  it("R46-G2: taskmanager's view toggle uses the KANBAN glyph (REF: lucide-kanban M6 5v11 — the clone's KanbanSquare is the rect-first SquareKanban, a different icon)", () => {
    const src = page("taskmanager", "page.tsx");
    expect(src).not.toContain("KanbanSquare");
    expect(src).toMatch(/<Kanban className="mr-2"/);
  });

  // --- H. the training create entry ---

  it("R46-H1: training's zero-state renders NO create button (REF's zero-state page: message only — the session-15 CTA retired; the create flow stays reachable via the with-data grid's dashed Add Platform tile)", () => {
    const src = page("training", "page.tsx");
    expect(src).not.toContain("New Platform");
    expect(src).toContain("Add Platform");
  });
});

describe("session-48 unmapped-route interiors (parity round 47 — the rootmap families + the per-page stat tags + the kicker dark pair)", () => {
  /* Round 47's census (probe-r48-census-a/b2.mjs + the rows/rootmap/zone
     readers, live @1440×900 REF vs the zero-tenant :3201 clone): r46
     covered 12 canonical routes; this round censused the REMAINING ~46.
     THE INSTRUMENT CORRECTION (the round's transferable lesson): the
     census/zone readers JOIN adjacent child text nodes with ' ' — JSX
     interpolation produces phantom spaces; raw-textContent verification
     DISSOLVED the entire suspected "space-in-template" family (the only
     real text diffs: advancedanalytics' two stat labels). The findings:
     (A) every clone kicker h1 misses REF's dark:text-white pair + the
     dashboard's hand-rolled kicker is the pre-r46 form; (B) 27 pages
     still ship the arbitrary bg-[linear-gradient] form + the flex-col
     gap-N wrappers where REF ships the v3 gradient classes + space-y-N
     (plus the merged-root five, the bare roots, the payrollreports trio,
     and the stubs); (C) REF's md-family header rows carry the UNPREFIXED
     justify-between + items-start members; (D) REF's stat cards carry
     per-page value/label tags (P on the analytics families) and the
     no-tile variant is label-TOP with a mt-1 value + a BARE per-color
     svg — correcting the session-14 R13-I contract (the r46 instrument
     lesson again); (E) the zero-state affordances (announcements /
     hrletters / templates / performancemanagement / hrossistant render
     create buttons and empty-state blocks on the clone that REF's
     zero-state pages do not carry). */

  const page = (...p: string[]) => read("src", "app", "(app)", ...p);

  // --- A. the kicker family ---

  it("R47-A1: PageHeader's kicker h1 carries REF's dark:text-white pair (a REAL dark-mode diff — measured on every REF kicker)", () => {
    expect(pageHeader).toContain("text-lg font-bold text-slate-900 dark:text-white truncate");
  });

  it("R47-A2: the dashboard's hand-rolled kicker adopts the r46 verbatim (sticky/z-20 + the dark: pairs + safe-area-top) + the dark h1", () => {
    const dashboard = page("dashboard", "page.tsx");
    expect(dashboard).toContain("md:hidden sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 safe-area-top");
    expect(dashboard).toContain("text-lg font-bold text-slate-900 dark:text-white truncate");
    expect(dashboard).not.toContain('className="md:hidden border-b border-slate-200 bg-white px-4 py-3"');
  });

  // --- B. the page-root families (the rootmap) ---

  it("R47-B1: the 27 v3 gradient swaps (REF's bg-gradient-to-br class forms replace the arbitrary-value strings)", () => {
    const MAP: Record<string, [string, string]> = {
      compliancedashboard: ["page.tsx", "from-red-50 to-orange-50"],
      performancemanagement: ["page.tsx", "from-slate-50 to-indigo-50"],
      organogram: ["page.tsx", "from-teal-50 to-green-50"],
      surveys: ["page.tsx", "from-teal-50 to-cyan-50"],
      companywall: ["page.tsx", "from-slate-50 to-blue-50"],
      chat: ["page.tsx", "from-slate-50 to-blue-50"],
      evaluations: ["page.tsx", "from-indigo-50 to-purple-50"],
      shiftcalendar: ["page.tsx", "from-violet-50 to-indigo-50"],
      hrletters: ["page.tsx", "from-indigo-50 to-purple-50"],
      offboarding: ["page.tsx", "from-slate-50 to-blue-50"],
      analyticsdashboard: ["dashboard.tsx", "from-slate-50 to-blue-50"],
      attendancedashboard: ["dashboard.tsx", "from-blue-50 to-cyan-50"],
      surveyanalytics: ["analytics.tsx", "from-teal-50 to-slate-50"],
      advancedanalytics: ["page.tsx", "from-slate-50 to-blue-50"],
      reports: ["reports-browser.tsx", "from-slate-50 to-blue-50"],
      payrollreports: ["page.tsx", "from-blue-50 to-indigo-50"],
      payrollai: ["page.tsx", "from-green-50 to-blue-50"],
      payrollengine: ["page.tsx", "from-emerald-50 to-teal-50"],
      payrollmodule: ["page.tsx", "from-green-50 to-emerald-50"],
      interviewassistant: ["page.tsx", "from-purple-50 to-indigo-50"],
      workflowautomation: ["page.tsx", "from-slate-50 to-purple-50"],
      hrassistantchat: ["page.tsx", "from-purple-50 to-blue-50"],
      securitysettings: ["page.tsx", "from-slate-50 to-blue-50"],
      shiftswap: ["page.tsx", "from-violet-50 to-blue-50"],
      allleaverequests: ["page.tsx", "from-blue-50 to-indigo-50"],
      communications: ["page.tsx", "from-purple-50 to-blue-50"],
      assets: ["page.tsx", "from-green-50 to-blue-50"],
    };
    for (const [route, [file, grad]] of Object.entries(MAP)) {
      const src = page(route, file);
      expect(src, route).toContain(`bg-gradient-to-br ${grad}`);
      expect(src, route).not.toContain("bg-[linear-gradient(to_right_bottom");
    }
  });

  it("R47-B2: the space-y content wrappers (REF's verbatim max-w-Nxl mx-auto space-y-N forms)", () => {
    const MAP: Record<string, [string, string]> = {
      compliancedashboard: ["page.tsx", "max-w-7xl mx-auto space-y-8"],
      performancemanagement: ["page.tsx", "max-w-7xl mx-auto space-y-8"],
      organogram: ["page.tsx", "max-w-full mx-auto space-y-8"],
      surveys: ["page.tsx", "max-w-7xl mx-auto space-y-8"],
      companywall: ["page.tsx", "max-w-3xl mx-auto space-y-6"],
      evaluations: ["page.tsx", "max-w-7xl mx-auto space-y-8"],
      shiftcalendar: ["page.tsx", "max-w-7xl mx-auto space-y-6"],
      hrletters: ["page.tsx", "max-w-7xl mx-auto space-y-8"],
      offboarding: ["page.tsx", "max-w-7xl mx-auto space-y-8"],
      advancedanalytics: ["page.tsx", "max-w-7xl mx-auto space-y-8"],
      reports: ["reports-browser.tsx", "max-w-7xl mx-auto space-y-8"],
      payrollreports: ["page.tsx", "max-w-7xl mx-auto space-y-6"],
      payrollai: ["page.tsx", "max-w-7xl mx-auto space-y-8"],
      payrollengine: ["page.tsx", "max-w-7xl mx-auto space-y-6"],
      interviewassistant: ["page.tsx", "max-w-7xl mx-auto space-y-8"],
      workflowautomation: ["page.tsx", "max-w-7xl mx-auto space-y-8"],
      securitysettings: ["page.tsx", "max-w-4xl mx-auto space-y-8"],
      shiftswap: ["page.tsx", "max-w-7xl mx-auto space-y-8"],
      allleaverequests: ["page.tsx", "max-w-7xl mx-auto space-y-8"],
      communications: ["page.tsx", "max-w-7xl mx-auto space-y-8"],
      assets: ["page.tsx", "max-w-7xl mx-auto space-y-8"],
      hrreports: ["page.tsx", "p-6 space-y-6 max-w-7xl mx-auto"],
      workflowconfigpage: ["page.tsx", "p-6 max-w-5xl mx-auto"],
      notificationpreferences: ["page.tsx", "p-6 max-w-3xl mx-auto space-y-6"],
    };
    for (const [route, [file, wrapper]] of Object.entries(MAP)) {
      expect(page(route, file), route).toContain(wrapper);
    }
    // chat + hrassistantchat: NO space member (bare max-w-7xl mx-auto)
    for (const route of ["chat", "hrassistantchat"]) {
      const src = page(route, "page.tsx");
      expect(src, route).toContain("max-w-7xl mx-auto");
      expect(src, route).not.toContain("max-w-7xl mx-auto space-y");
    }
  });

  it("R47-B3: the merged-root five — p-4 md:p-8 space-y-8 + gradient ON the root, NO inner max-w wrapper (REF renders full-width content)", () => {
    const MAP: Record<string, [string, string]> = {
      assetmanagement: ["page.tsx", "from-slate-50 to-blue-50"],
      analyticsdashboard: ["dashboard.tsx", "from-slate-50 to-blue-50"],
      attendancedashboard: ["dashboard.tsx", "from-blue-50 to-cyan-50"],
      surveyanalytics: ["analytics.tsx", "from-teal-50 to-slate-50"],
      payrollmodule: ["page.tsx", "from-green-50 to-emerald-50"],
    };
    for (const [route, [file, grad]] of Object.entries(MAP)) {
      const src = page(route, file);
      expect(src, route).toContain(`p-4 md:p-8 space-y-8 min-h-screen bg-gradient-to-br ${grad}`);
      expect(src, route).not.toContain("max-w-7xl");
    }
  });

  it("R47-B4: the bare roots — no gradient, no min-h, REF's verbatim root strings (announcements + recruitmentkanban drop the max-w wrapper; requestreports + requestsettings drop the extra gradient level)", () => {
    expect(page("announcements", "page.tsx")).toContain('className="p-4 md:p-8 space-y-6"');
    expect(page("announcements", "page.tsx")).not.toContain("max-w-7xl");
    expect(page("recruitmentkanban", "page.tsx")).toContain('className="p-4 md:p-8 space-y-6"');
    expect(page("recruitmentkanban", "page.tsx")).not.toContain("max-w-7xl");
    expect(page("requestreports", "page.tsx")).toContain('className="p-4 md:p-8 max-w-7xl mx-auto space-y-6"');
    expect(page("requestreports", "page.tsx")).not.toContain("bg-gradient-to-br from-slate-50 to-blue-50 flex min-h-screen");
    expect(page("requestsettings", "page.tsx")).toContain('className="p-4 md:p-8 max-w-5xl mx-auto space-y-6"');
    expect(page("requestsettings", "page.tsx")).not.toContain("flex min-h-screen");
  });

  it("R47-B5: payrollreports carries the PageCanvas trio (REF: relative overflow-hidden > touch-pan-y)", () => {
    const src = page("payrollreports", "page.tsx");
    expect(src).toMatch(/<PageCanvas>/);
  });

  it("R47-B6: the small-root fixes — employeeportal's p-4, tenantsetup's DIV welcome, hrassistant's REF member order", () => {
    expect(page("employeeportal", "page.tsx")).toContain("from-blue-50 to-indigo-100 flex items-center justify-center p-4");
    const ts = page("tenantsetup", "page.tsx");
    expect(ts).not.toContain("<h2");
    expect(ts).toMatch(/<div[^>]*>\s*Welcome to EonHR/);
    expect(page("hrassistant", "page.tsx")).toContain("max-w-4xl mx-auto space-y-6");
  });

  it("R47-B7: the stubs — /home renders REF's empty div, /employeedetail renders the centered CSS spinner, /employeeselfservice renders the centered loader during fetch", () => {
    const home = page("home", "page.tsx");
    expect(home).toMatch(/<div\s*\/>|<div><\/div>/);
    const ed = page("employeedetail", "page.tsx");
    expect(ed).toContain("flex items-center justify-center min-h-screen");
    expect(ed).toContain("w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin");
    const ess = page("employeeselfservice", "page.tsx");
    expect(ess).toContain("flex items-center justify-center min-h-screen");
    expect(ess).toContain("Loading your profile...");
  });

  // --- C. the header-row family ---

  it("R47-C1: the md-family rows carry REF's UNPREFIXED members (justify-between + items-start — they apply at mobile's flex-col, md:items-center at desktop)", () => {
    expect(pageHeader).toMatch(/rowBreakpoint === "md" && "justify-between items-start"/);
  });

  it("R47-C2: the rowBreakpoint=md passes (REF switches flex-col → flex-row at md on these six; the clone still defaulted to sm)", () => {
    const FILES: Record<string, string> = {
      analyticsdashboard: "dashboard.tsx",
      surveyanalytics: "analytics.tsx",
      payrollengine: "page.tsx",
      hrletters: "page.tsx",
      shiftswap: "page.tsx",
      surveys: "page.tsx",
    };
    for (const [route, file] of Object.entries(FILES)) {
      expect(page(route, file), route).toContain('rowBreakpoint="md"');
    }
  });

  it("R47-C3: performancemanagement is an actionsStart page (REF: flex justify-between items-start — the clone rendered items-center)", () => {
    expect(page("performancemanagement", "page.tsx")).toContain("actionsStart");
  });

  // --- D. the stat family ---

  it("R47-D1a: StatCard declares the per-page valueTag/labelTag overrides (REF's tags vary per page within a variant)", () => {
    const statCard = read("src", "components", "shared", "stat-card.tsx");
    expect(statCard).toContain("valueTag?:");
    expect(statCard).toContain("labelTag?:");
  });

  it("R47-D1b: the no-tile rewrite — label-TOP p + value-BELOW p mt-1 + the BARE per-color icon + the card WITHOUT border-slate-200 (corrects the session-14 R13-I contract; value-in-tile KEEPS the border — r48: horizontal-bare + mini-centered are bare too)", () => {
    const statCard = read("src", "components", "shared", "stat-card.tsx");
    /* Session 49 (R48-C5/C7) amendment: the bare-card branch grew —
       horizontal-bare (requestreports) + mini-centered (hrreports +
       notificationpreferences) joined no-tile this round. */
    expect(statCard).toMatch(/variant === "no-tile" \|\| variant === "horizontal-bare" \|\| variant === "mini-centered"\s*\?\s*""\s*:\s*"border-slate-200"/);
    expect(statCard).toMatch(/"no-tile": "p"/);
    expect(statCard).toContain('"text-3xl font-bold text-slate-900 mt-1"');
  });

  it("R47-D1c: the tile-right / mini / mini-centered / compact-s label tags are P on REF (analytics, shiftcalendar, notificationpreferences, payrollmodule)", () => {
    const statCard = read("src", "components", "shared", "stat-card.tsx");
    expect(statCard).toMatch(/"tile-right": "p"/);
    expect(statCard).toMatch(/(?<![-"])mini: "p"/);
    expect(statCard).toMatch(/"mini-centered": "p"/);
    expect(statCard).toMatch(/"compact-s": "p"/);
  });

  it("R47-D2a: the four analytics compacts pass p/p tags + the slate-600 label (recruitment + compliance keep the r46 DIV/DIV + slate-500 contract)", () => {
    const FILES: Record<string, string> = {
      analyticsdashboard: "dashboard.tsx",
      attendancedashboard: "dashboard.tsx",
      surveyanalytics: "analytics.tsx",
      assetmanagement: "page.tsx",
    };
    for (const [route, file] of Object.entries(FILES)) {
      const src = page(route, file);
      expect(src, route).toContain('valueTag="p"');
      expect(src, route).toContain('labelTag="p"');
      expect(src, route).toContain('labelClassName="text-slate-600"');
    }
    expect(page("recruitment", "page.tsx")).not.toContain("valueTag");
    expect(page("compliancedashboard", "page.tsx")).not.toContain("valueTag");
  });

  it("R47-D2b: performancemanagement + workflowautomation render the per-color no-tile values (slate/green/orange/purple + slate/green/blue)", () => {
    const pm = page("performancemanagement", "page.tsx");
    expect(pm).toContain("text-green-600");
    expect(pm).toContain("text-orange-600");
    expect(pm).toContain("text-purple-600");
    const wa = page("workflowautomation", "page.tsx");
    expect(wa).toContain("text-green-600");
    expect(wa).toContain("text-blue-600");
  });

  it("R47-D2c: advancedanalytics + payrollai + allleaverequests pass p/p + the mt-4 value + the no-mb tile row + REF's label texts on advancedanalytics", () => {
    for (const route of ["advancedanalytics", "payrollai", "allleaverequests"]) {
      const src = page(route, "page.tsx");
      expect(src, route).toContain('valueTag="p"');
      expect(src, route).toContain('labelTag="p"');
      expect(src, route).toContain("mt-4");
    }
    const aa = page("advancedanalytics", "page.tsx");
    expect(aa).toContain("Avg Tenure (months)");
    expect(aa).toContain("At Risk (AI Prediction)");
  });

  it("R47-D2d: shiftcalendar + notificationpreferences + payrollmodule + analytics pass the P label", () => {
    expect(page("shiftcalendar", "page.tsx")).toContain('labelTag="p"');
    expect(page("notificationpreferences", "page.tsx")).toContain('labelTag="p"');
    expect(page("payrollmodule", "page.tsx")).toContain('labelTag="p"');
    expect(page("analytics", "page.tsx")).toContain('labelTag="p"');
  });

  // --- E. the zero-state affordances ---

  it("R47-E1: announcements' zero state — NO New Announcement button, the bare DIV empty (direct text), REF's bare root", () => {
    const src = page("announcements", "page.tsx");
    expect(src).not.toContain("flex justify-center pb-4");
    expect(src).toMatch(/canPost && announcements\.length > 0/);
    expect(src).toMatch(/<div className="text-center py-16 text-slate-400">No announcements at this time<\/div>/);
  });

  it("R47-E2: hrletters' zero state — the bare svg (classes ON the icon, no wrapper divs), the mb-4-free P, NO empty-state button", () => {
    const src = page("hrletters", "page.tsx");
    expect(src).not.toContain('<EmptyState');
    expect(src).toMatch(/!loading && letters\.length > 0/);
    expect(src).toMatch(/<FileText className="h-16 w-16 mx-auto mb-4 text-slate-300"/);
  });

  it("R47-E3: templates renders ONE Create Template button (the row CTA) + REF's card classes + the mb-8 row", () => {
    const src = page("templates", "page.tsx");
    expect(src.match(/<Plus className="mr-2" aria-hidden="true" \/>\s*\n?\s*Create Template/g) ?? []).toHaveLength(1);
    expect(src).not.toContain("<EmptyState");
    expect(src).toContain("rounded-xl border bg-card text-card-foreground border-slate-200 shadow-sm");
    expect(src).toContain("flex items-center justify-between mb-8");
  });

  it("R47-E4: performancemanagement's zero state renders NO count line + NO empty-state card (REF: the Set New Goal row + an empty grid) + the REF tab classes", () => {
    const src = page("performancemanagement", "page.tsx");
    expect(src).toMatch(/goals\.length > 0|goals\.length === 0\s*\?|hasGoals/);
    expect(src).not.toContain("No goals set yet\" },{");
    expect(src).toContain("bg-white border border-slate-200");
    expect(src).toMatch(/focus-visible:ring-ring focus-visible:ring-offset-2 space-y-6/);
    expect(src).not.toContain("No goals set yet");
  });

  it("R47-E5: hrassistant renders no zero-state suggestion line (REF's zero chat: the input only)", () => {
    const src = page("hrassistant", "page.tsx");
    expect(src).not.toContain("Ask about leave, payroll, letters or company policy");
  });

  // --- F. page-specific contracts ---

  it("R47-F1: compliance's At-Risk card header carries REF's bg-slate-50 py-3 + the flex gap-2 title; the empty P has NO class", () => {
    const src = page("compliancedashboard", "page.tsx");
    expect(src).toContain("bg-slate-50 py-3");
    expect(src).toContain("tracking-tight text-sm font-semibold text-slate-700 flex items-center gap-2");
    expect(src).toMatch(/<p>\s*No documents at risk/);
  });

  it("R47-F2: requestreports' Total Amount stat renders the raw division (REF: integer 0 at zero), not toFixed(2) — the with-data table keeps its decimals", () => {
    const src = page("requestreports", "page.tsx");
    /* Session 49 (R48-C7) amendment: the stat row rides the StatCard
       horizontal-bare variant now — the raw division contract is
       unchanged. */
    expect(src).toContain('label="Total Amount (SAR)" value={loading ? "…" : stats.amount / 100}');
    expect(src).not.toContain("value: (stats.amount / 100).toFixed(2)");
    expect(src).not.toContain(".toFixed(2) }");
  });

  it("R47-F3: recruitmentkanban's stage-count chips are REF's badge-form DIVs (rounded-md, the focus ring family, bg-slate-200 text-slate-700 — the census's DIV-vs-SPAN catch, the full class form measured this round)", () => {
    const src = page("recruitmentkanban", "page.tsx");
    expect(src).toMatch(/<div className="inline-flex items-center rounded-md border px-2\.5 py-0\.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent shadow hover:bg-primary\/80 text-xs bg-slate-200 text-slate-700">/);
    expect(src).not.toMatch(/h-\[22px\]/);
  });
});

describe("session-49 bare interiors + header architecture (parity round 48 — the BARE family + the always-rows + the C-page contracts + the avatar superset)", () => {
  /* Round 48's census (probe-r49-*.mjs + r49-boot-loc0.mjs, live
     @1440×900 REF vs the zero-tenant :3201 clone): the hero-block
     architecture re-measured — REF renders the block CLASSLESS on every
     page (the clone's min-w-0/flex-1 wrapper retired), the BARE family
     (15 pages) renders NO hero row at all, the always-row families are
     UNPREFIXED, the actions clusters are bare (`flex gap-2`) or
     unwrapped (single actions direct), the chart family renders
     DUAL-direction gridlines, and the C pages carry fresh per-page
     contracts. The round also ships the WORKING avatar upload (the
     functional superset over REF's inert button). */

  const page = (...p: string[]) => read("src", "app", "(app)", ...p);

  // --- A. the hero-block architecture ---

  it("R48-A1: the hero block renders CLASSLESS (or text-center) — the min-w-0/flex-1 wrapper retired (REF renders DIV[] / DIV[text-center] on every measured page)", () => {
    expect(pageHeader).toContain("function HeroBlock(");
    expect(pageHeader).not.toMatch(/cn\("min-w-0"/);
    expect(pageHeader).not.toContain("flex-1 text-center");
  });

  it("R48-A2: the bare prop — the hero block as a DIRECT child of the content wrapper (no row)", () => {
    expect(pageHeader).toContain("bare?: boolean");
    expect(pageHeader).toMatch(/\{bare \? \(/);
    expect(pageHeader).toContain('cn(centered && "text-center", heroClassName) || undefined');
  });

  it("R48-A2b: the BARE-15 family passes (organogram/companywall/evaluations/training/hrassistant centered; reports/interviewassistant/securitysettings/communications/settings/profile/analytics/notificationpreferences/announcements classless; hrassistantchat mb-6)", () => {
    for (const r of ["organogram", "companywall", "evaluations", "training", "interviewassistant", "securitysettings", "communications", "settings", "profile", "analytics", "notificationpreferences", "announcements"]) {
      const src = page(r, "page.tsx");
      expect(src.includes("\n        bare\n") || src.includes("\n          bare\n")).toBe(true);
    }
    const rb = page("reports", "reports-browser.tsx");
    expect(rb).toContain("\n        bare\n");
    const ia = page("hrassistantchat", "page.tsx");
    expect(ia).toContain("\n        bare\n");
    expect(ia).toContain('heroClassName="mb-6"');
    const ha = page("hrassistant", "page.tsx");
    expect(ha).toContain("\n        bare\n");
  });

  it("R48-A3: the alwaysRow prop — the UNPREFIXED always-row (no responsive collapse, no recipe.row)", () => {
    expect(pageHeader).toContain("alwaysRow?: boolean");
    expect(pageHeader).toMatch(/alwaysRow\s*\?\s*cn\(\s*"flex justify-between"/);
    expect(pageHeader).toContain("!alwaysRow && hasBadge && recipe.row");
  });

  it("R48-A3b: the always-start eight + the center family + the mb-variants pass alwaysRow", () => {
    for (const r of ["offboarding", "compliancedashboard", "performancemanagement", "workflowautomation", "allleaverequests", "payrollai", "advancedanalytics"]) {
      const src = page(r, "page.tsx");
      expect(src).toContain("alwaysRow");
      expect(src).toContain("actionsStart");
    }
    const hr = page("hrreports", "page.tsx");
    expect(hr).toContain("alwaysRow");
    expect(hr).toContain("actionsBare");
    expect(hr).not.toContain('actionsClassName="flex gap-2"');
    const wfc = page("workflowconfigpage", "page.tsx");
    expect(wfc).toContain('alwaysRow');
    expect(wfc).toContain('className="mb-6"');
    const tm = read("src", "app", "(app)", "templates", "page.tsx");
    expect(tm).toContain("flex items-center justify-between mb-8");
  });

  it("R48-A4: the md-family passes (taskmanager/leavemanagement/expenses switch at md; loans keeps the short hidden always-row)", () => {
    for (const r of ["taskmanager", "leavemanagement", "expenses"]) {
      const src = page(r, "page.tsx");
      expect(src).toContain('rowBreakpoint="md"');
    }
    const loans = read("src", "app", "(app)", "loans", "page.tsx");
    expect(loans).toContain("alwaysRow");
    expect(loans).toContain('mobileHeader="hidden"');
  });

  it("R48-A5: actionsUnwrapped — the single-action pages render DIRECTLY in the row (leavemanagement, assets, payrollreports)", () => {
    expect(pageHeader).toContain("actionsUnwrapped?: boolean");
    expect(pageHeader).toMatch(/actionsUnwrapped \? \(\s*actions/);
    for (const r of ["leavemanagement", "assets", "payrollreports"]) {
      const src = page(r, "page.tsx");
      expect(src).toContain("actionsUnwrapped");
    }
  });

  // --- B. the C-page contracts ---

  it("R48-C1: interviewassistant — REF's two-card grid (`grid lg:grid-cols-2 gap-6`) with the Select Candidate + Interview Notes cards (labels: Candidate / Notes; the clone's AI Analysis rides column one as the superset)", () => {
    const src = page("interviewassistant", "page.tsx");
    expect(src).toContain('className="grid lg:grid-cols-2 gap-6"');
    expect(src).toContain(">Select Candidate</CardTitle>");
    expect(src).toContain(">Interview Notes</CardTitle>");
    expect(src).toContain(">Candidate</Label>");
    expect(src).toContain(">Notes</Label>");
    expect(src).not.toContain('<form onSubmit={onAnalyze}');
    expect(src).toContain("AI Analysis");
  });

  it("R48-C2: securitysettings — the circle-alert alert (H3 text-lg font-semibold text-orange-900 + P text-sm text-orange-700) + the DIV badges (rounded-md font-semibold, slate/green pairs) + the circle-check-big recommendation glyphs", () => {
    const src = page("securitysettings", "page.tsx");
    expect(src).toContain('<CircleAlert className="h-12 w-12 text-orange-600"');
    expect(src).toMatch(/<h3 className="text-lg font-semibold text-orange-900">/);
    expect(src).toContain('className="text-sm text-orange-700"');
    expect(src).toContain("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-slate-100 text-slate-700");
    expect(src).toContain('<CircleCheckBig className="h-3 w-3 mr-1"');
    expect(src).not.toContain("<Badge");
  });

  it("R48-C2b: the checkbox component — the FIRST live-measured REF form (border-primary + shadow + ring-1; NO data-[state=checked]:border-primary, NO cursor-pointer)", () => {
    const cb = read("src", "components", "ui", "checkbox.tsx");
    expect(cb).toContain("border border-primary shadow focus-visible:outline-none focus-visible:ring-1");
    expect(cb).not.toContain("data-[state=checked]:border-primary");
    expect(cb).not.toContain("cursor-pointer");
    expect(cb).toContain("dark:data-[state=checked]:text-white");
  });

  it("R48-C3: payrollreports — the Radix-verbatim tabs (4 TabsContent panels + the old-shadcn trigger pass) + the BARE Monthly th family + the md:hidden mobile WhatsApp copy", () => {
    const src = page("payrollreports", "page.tsx");
    expect(src).toContain('<TabsList className="grid grid-cols-4 w-full md:w-auto">');
    expect(src.match(/<TabsContent value="/g)?.length).toBe(4);
    expect(src).toContain('className="ring-offset-background text-xs md:text-sm data-[state=active]:bg-background data-[state=active]:shadow"');
    expect(src).toContain('className="px-4 py-3 text-left"');
    expect(src).toContain('className="px-4 py-3 text-right hidden md:table-cell"');
    expect(src).toContain('className="px-4 py-3 text-right font-bold"');
    /* The Monthly table's th family is the bare r48 form (the Allowances
       column retired its uppercase member); the tax/history/custom
       cards keep the r33 form — REF-unmeasured superset panels. */
    expect(src).not.toContain('className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-600">Allowances');
  });

  it("R48-C3b: the WhatsApp CTA — text-white (NOT text-primary-foreground) + the shadow h-9 px-4 py-2 green form", () => {
    const src = page("payrollreports", "page.tsx");
    expect(src).toContain("bg-green-600 hover:bg-none hover:bg-green-700 text-white");
    expect(src).not.toContain("text-primary-foreground");
  });

  it("R48-C5: hrreports — the form labels ride the Label component (text-xs text-slate-500 — the hand-rolled font-medium labels retired)", () => {
    const src = page("hrreports", "page.tsx");
    expect(src.match(/<Label htmlFor="hr-[a-z]+" className="text-xs text-slate-500">/g)?.length).toBeGreaterThanOrEqual(5);
    expect(src).not.toContain('className="text-xs text-slate-500 font-medium"');
    expect(src).toContain('className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase"');
  });

  it("R48-C6: evaluations — the value-in-tile stats + the Radix-verbatim panels (ring-offset-background + space-y-6)", () => {
    const src = page("evaluations", "page.tsx");
    expect(src.match(/variant="value-in-tile"/g)?.length).toBe(4);
    expect(src.match(/TabsContent value="[a-z0-9]+" className="ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-6"/g)?.length).toBeGreaterThanOrEqual(3);
  });

  it("R48-C7: requestreports — the always-row header (Back ghost h-8 px-3 text-xs + classless h1/p block + the bare flex gap-2 cluster) + the horizontal-bare stats + the pb-2 pr-4 th family", () => {
    const src = page("requestreports", "page.tsx");
    expect(src).toContain('<div className="flex items-center justify-between">');
    expect(src).toContain('className="h-8 rounded-md px-3 text-xs"');
    expect(src).toContain('<div className="flex gap-2">');
    expect(src.match(/variant="horizontal-bare"/g)?.length).toBe(4);
    expect(src).toContain('<th className="pb-2 pr-4">');
    expect(src).toContain('<th className="pb-2">');
    expect(src).not.toContain("px-4 py-3 text-left font-medium");
  });

  it("R48-C7b: the stat-card horizontal-bare variant — the 40×40 rounded-LG tile (no svg guard) + the classless text div + P/P tags + the DEFAULT bordered card", () => {
    const sc = read("src", "components", "shared", "stat-card.tsx");
    expect(sc).toContain('"horizontal-bare": "p-4 flex items-center gap-3"');
    expect(sc).toContain('"w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100"');
    expect(sc).toMatch(/variant === "horizontal-bare" \? \([\s\S]*?<div>\{textBlock\}<\/div>/);
    expect(sc).toContain('"horizontal-bare": "p"');
    expect(sc).toContain('"horizontal-bare": "text-2xl font-bold text-slate-900"');
    expect(sc).toContain('"horizontal-bare": "text-xs text-slate-500"');
  });

  it("R48-C8: analytics — the BARE root (p-4 md:p-8 only, no gradient canvas) + the verbatim max-w-7xl mx-auto space-y-8 wrapper (the trap-4 mitigation wrapper retired)", () => {
    const src = page("analytics", "page.tsx");
    expect(src).toContain('<div className="p-4 md:p-8">');
    expect(src).toContain('className="max-w-7xl mx-auto space-y-8"');
    expect(src).not.toMatch(/className="[^"]*min-h-screen/);
    expect(src).not.toContain("flex w-full max-w-7xl flex-col gap-8");
  });

  it("R48-C9: recruitmentkanban — the md-family row + the classless hero ride PageHeader (rowBreakpoint md + size md, unchanged from r47 — the block rewrite lands the classless hero)", () => {
    const src = page("recruitmentkanban", "page.tsx");
    expect(src).toContain('rowBreakpoint="md"');
    expect(src).toContain('title="Recruitment Pipeline"');
  });

  // --- E. the chart gridline family ---

  it("R48-E: the chart family renders DUAL-direction CartesianGrids (REF renders both on every chart page — the vertical={false} pins retired)", () => {
    for (const r of ["hrreports", "attendancedashboard", "advancedanalytics", "analytics", "analyticsdashboard", "surveyanalytics"]) {
      const src = page(r, "charts.tsx");
      expect(src).toContain('<CartesianGrid strokeDasharray="3 3" />');
      expect(src).not.toContain("vertical={false}");
    }
  });

  // --- F. the avatar module (functional superset) ---

  it("R48-F1: the avatar API route — guard/requireUser/parseBody + the data-URL validation + the audit log", () => {
    const route = read("src", "app", "api", "profile", "avatar", "route.ts");
    expect(route).toContain("guard(async () => {");
    expect(route).toContain("requireUser()");
    expect(route).toContain("parseBody(req, AvatarInput)");
    expect(route).toContain("data: { avatarUrl: data.avatar }");
    expect(route).toContain("profile.avatar_changed");
  });

  it("R48-F1b: the profile page — the canvas downscale (96×96 center-crop) + the POST + the optimistic swap", () => {
    const src = page("profile", "page.tsx");
    expect(src).toContain("const SIZE = 96;");
    expect(src).toContain('fetch("/api/profile/avatar"');
    expect(src).toContain("setProfile({ ...profile, avatarUrl: json.data.avatarUrl })");
    expect(src).toContain('canvas.toDataURL("image/jpeg", 0.85)');
  });

  it("R48-F2: the purge script resets user avatars (the E2E pristine contract — the seed's upsert never touches avatarUrl)", () => {
    const purge = read("tests", "e2e", "purge-test-data.ts");
    expect(purge).toContain("avatarUrl: { not: null }");
    expect(purge).toContain("avatarUrl: null");
  });

  // --- G. the quick fixes ---

  it("R48-G1: profile's stray wrap-level footer P (the icon-only CheckCircle2 cruft) is GONE", () => {
    const src = page("profile", "page.tsx");
    expect(src).not.toMatch(/<p className="flex items-center gap-1\.5 text-xs text-muted-foreground">\s*<CheckCircle2/);
  });

  it("R48-G2: the badge glyph colors — hrassistant's Bot at text-blue-600 (NOT purple), assets' Laptop at text-green-600", () => {
    const ha = page("hrassistant", "page.tsx");
    expect(ha).toContain('iconClassName="text-blue-600"');
    expect(ha).toContain("<Bot aria-hidden=\"true\" />");
    expect(ha).not.toContain('iconClassName="text-purple-600"');
    const as = page("assets", "page.tsx");
    expect(as).toContain('iconClassName="text-green-600"');
  });

  it("R48-G5: the Button base carries NO cursor-pointer (REF's buttons carry none)", () => {
    const btn = read("src", "components", "ui", "button.tsx");
    expect(btn).not.toMatch(/shrink-0 cursor-pointer/);
    expect(btn).not.toMatch(/cursor-pointer",/);
  });

  it("R48-G6: the kicker back button carries select-none (REF payrollreports' kicker, live-measured)", () => {
    expect(pageHeader).toContain('className="h-9 w-9 select-none"');
  });
});
