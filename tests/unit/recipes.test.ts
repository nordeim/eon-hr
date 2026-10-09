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
    // p text-slate-500 mb-4, dark #171717 CTA (not gradient).
    expect(emptyState).toContain("p-12 text-center");
    expect(emptyState).toContain("text-lg font-semibold text-slate-900 mb-2");
    expect(emptyState).toContain("text-slate-500 mb-4");
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

  it("mobile kicker is sticky below the 73px top bar with px-4 py-3", () => {
    // Reference: md:hidden sticky top-0 z-20 bg-white border-b
    // border-slate-200 px-4 py-3 (inside the p-4 page wrapper, so title
    // x=32); h1 text-lg font-bold text-slate-900 truncate.
    expect(dashboard).toContain("sticky top-[73px] z-20");
    expect(dashboard).toContain("md:hidden");
    expect(dashboard).toContain("px-4 py-3");
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
