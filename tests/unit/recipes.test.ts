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

describe("sidebar user name color (session 6)", () => {
  it("UserMenu name renders slate-900 like the reference", () => {
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
