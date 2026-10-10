/**
 * Session-7 parity recipe contracts — pins the reference-measured recipes
 * for the responsive chrome boundary, mobile page kickers, and the inline
 * Add-Employee wizard. Every value below was measured live against
 * https://eon.base44.app (dual agent-browser sessions, DOM ground truth:
 * computed styles + bounding boxes; see docs/remediation-plan-session7.md).
 *
 * If a recipe drifts from the reference contract, this test fails.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (...p: string[]) =>
  readFileSync(join(process.cwd(), ...p), "utf8");

const appShell = read("src", "components", "layout", "app-shell.tsx");
const pageHeader = read("src", "components", "shared", "page-header.tsx");
const wizard = read("src", "app", "(app)", "employees", "employee-wizard.tsx");
const employeesPage = read("src", "app", "(app)", "employees", "page.tsx");

/** Category-A routes: reference renders a mobile kicker and hides the
 *  desktop header below md (390x844 sweep, research-r6-ref-kickers.txt). */
const KICKER_HIDDEN_HEADER_PAGES = [
  "employees",
  "payroll",
  "taskmanager",
  "leavemanagement",
  "expenses",
  "loans",
] as const;

describe("app-shell responsive boundary (session 7, R6-A)", () => {
  it("desktop sidebar mounts from md (768px) — reference measurement", () => {
    // Reference: sidebar visible at 768/800/900; clone must match. The
    // reference's own bottom bar is md:hidden and its shadcn sidebar
    // container mounts from md up.
    expect(appShell).toContain("md:flex md:flex-col");
    expect(appShell).not.toContain("lg:flex");
  });

  it("mobile chrome (top bar, drawer, bottom tabs) hides at md — not lg", () => {
    // 4 surfaces carried lg:hidden; all must be md:hidden now.
    expect(appShell).not.toContain("lg:hidden");
    const mdHidden = appShell.match(/md:hidden/g) ?? [];
    expect(mdHidden.length).toBeGreaterThanOrEqual(4);
  });

  it("drawer overlay serializes as rgba like the reference (R6-D)", () => {
    // bg-black/80 serializes as oklab(0 0 0 / 0.8) in v4 — visually equal
    // but computed-style-different from the reference's rgba(0,0,0,0.8).
    expect(appShell).toContain("bg-[rgba(0,0,0,0.8)]");
    expect(appShell).not.toContain("bg-black/80");
  });
});

describe("PageHeader mobile kicker props (session 7, R6-B)", () => {
  it("declares mobileKicker and mobileHeader props", () => {
    expect(pageHeader).toContain("mobileKicker");
    expect(pageHeader).toContain('mobileHeader');
    expect(pageHeader).toContain('"hidden"');
  });

  it("renders the reference kicker recipe (same as the dashboard's)", () => {
    // Session 9 (R8-G): the redeployed reference's kicker is `sticky top-0`
    // inside a non-scrolling wrapper stack — it scrolls away with the
    // content (measured: kicker y=-89 at scrollY=178, window scrolls, no
    // scrollable ancestor). The clone matches the rendered truth: a static
    // md:hidden bar (bg-white border-b slate-200 px-4 py-3 + h1 text-lg
    // font-bold text-slate-900 truncate).
    expect(pageHeader).not.toContain("sticky top-[73px]");
    expect(pageHeader).toContain("md:hidden border-b border-slate-200 bg-white px-4 py-3");
    expect(pageHeader).toContain("text-lg font-bold text-slate-900 truncate");
  });

  it("hides the desktop header block below md when mobileHeader=hidden", () => {
    expect(pageHeader).toContain("hidden md:flex");
  });
});

describe("category-A call sites carry the kicker props (session 7)", () => {
  for (const page of KICKER_HIDDEN_HEADER_PAGES) {
    it(`/${page} opts into the kicker + hidden desktop header`, () => {
      const src = read("src", "app", "(app)", page, "page.tsx");
      expect(src).toContain("mobileKicker");
      expect(src).toContain('mobileHeader="hidden"');
    });
  }

  it("/profile keeps its content header and adds only the kicker", () => {
    const src = read("src", "app", "(app)", "profile", "page.tsx");
    expect(src).toContain("mobileKicker");
    expect(src).not.toContain('mobileHeader="hidden"');
  });

  it("category-B pages stay opt-out (full header at mobile)", () => {
    // training renders its full desktop header at 390px in the reference.
    const src = read("src", "app", "(app)", "training", "page.tsx");
    expect(src).not.toContain("mobileKicker");
  });
});

describe("inline Add-Employee wizard (session 7, R6-C)", () => {
  it("no dialog — the wizard renders as an inline page view", () => {
    expect(wizard).not.toContain("DialogContent");
    expect(wizard).not.toContain("DialogFooter");
    expect(employeesPage).not.toContain("<Dialog");
  });

  it("back button + bare-page h1 + subtitle (reference header row)", () => {
    expect(wizard).toContain("ArrowLeft");
    expect(wizard).toContain("text-3xl font-bold text-slate-900");
    expect(wizard).toContain("Add a new team member");
  });

  it("max-w-4xl card with p-8 interior (reference card geometry)", () => {
    expect(wizard).toContain("max-w-4xl");
    expect(wizard).toMatch(/p-8[^0-9]/);
  });

  it("card header: sRGB blue-50→indigo-50 gradient, border-b, UserPlus + 24px/600 title", () => {
    // Session 8 (R7-A): the reference computes an sRGB interpolation — v4's
    // bg-gradient-to-r blends in oklab (trap 3). Pinned to the arbitrary
    // form like every other parity gradient.
    expect(wizard).toContain("bg-[linear-gradient(to_right,#eff6ff,#eef2ff)]");
    expect(wizard).not.toContain("bg-gradient-to-r");
    expect(wizard).toContain("border-b border-slate-200");
    expect(wizard).toContain("UserPlus");
    expect(wizard).toContain("text-2xl");
  });

  it("avatar upload block on step 1 (96px circle + 32px camera button)", () => {
    expect(wizard).toContain("h-24 w-24");
    expect(wizard).toContain("rounded-full bg-slate-100");
    expect(wizard).toContain('type="file"');
    expect(wizard).toContain("absolute bottom-0 right-0");
  });

  it("footer carries the reference border-t separator (mt-8 pt-6)", () => {
    expect(wizard).toContain("mt-8 flex justify-between border-t border-slate-200 pt-6");
  });

  it("form grid is md:grid-cols-2 (not sm) like the reference", () => {
    expect(wizard).toContain("md:grid-cols-2");
    expect(wizard).not.toContain("sm:grid-cols-2");
  });

  it("step rail: 48px icon circles, active blue-600 / inactive slate-200", () => {
    expect(wizard).toContain("h-12 w-12");
    expect(wizard).toContain("rounded-full");
    expect(wizard).toContain("bg-blue-600");
    expect(wizard).toContain("bg-slate-200");
    // lucide icons the reference renders in the circles (SVG-path decoded)
    expect(wizard).toContain("User");
    expect(wizard).toContain("Briefcase");
    expect(wizard).toContain("FileText");
    expect(wizard).toContain("Paperclip");
    // labels 14px/500 below the circles; active label blue-600
    expect(wizard).toContain("text-sm font-medium");
  });

  it("connectors: h-0.5 mx-4 flex-1 — green-600 passed, slate-200 upcoming", () => {
    expect(wizard).toContain("h-0.5 mx-4");
    expect(wizard).toContain("bg-green-600");
    expect(wizard).toContain("text-slate-500");
  });

  it("footer keeps the AP-5 rule: no submit-type buttons", () => {
    // The button-type-swap submit bug must not return with the redesign.
    expect(wizard).not.toMatch(/<Button[^>]*type="submit"/);
    expect(wizard.match(/type="button"/g)?.length).toBeGreaterThanOrEqual(4);
  });
});

describe("employees page view state (session 7, R6-C)", () => {
  it("switches between list and wizard views inline", () => {
    // The wizard view replaces the list (search card + table) inline —
    // reference behavior: the page content area becomes the wizard.
    expect(employeesPage).toMatch(/"list"\s*\|\s*"wizard"|view === "wizard"/);
    expect(employeesPage).not.toMatch(/dialogOpen|setDialogOpen/);
  });
});

describe("wizard interior precision (session 8, parity round 7)", () => {
  // Reference measurements (docs/remediation-plan-session8.md):
  //   Next button 97×36 = label + gap-2 (8) + 16px arrow-right + ml-2 (8)
  //   field wrapper 68px = 4 slack + 16 label + 12 gap + 36 input
  //   row pitch 84px = 68 + gap-4 (16); step-1 card 872px

  it("R7-B: the advancing CTA carries the trailing ArrowRight icon", () => {
    // Reference footer Next: "Next" + lucide arrow-right (w-4 h-4 ml-2) —
    // 97px wide vs our 65px without it. Applies to Next AND the final
    // Create Employee button (the same advancing CTA).
    expect(wizard).toContain("ArrowRight");
    expect(wizard).toMatch(/ArrowRight[^/]*className="ml-2 h-4 w-4"/);
  });

  it("R7-C: field rows use the 68px wrapper recipe (pt-1 + leading-4)", () => {
    // Reference field wrapper = 4px top slack + 16px label box + 12px gap
    // + 36px input (68px, 84px pitch). The reference's extra height comes
    // from its inline-display label (16px font-metric box) + line-strut
    // slack; reproduced deterministically with pt-1 + leading-4.
    expect(wizard).toContain("flex flex-col gap-3 pt-1");
    expect(wizard).toMatch(/<Label[^>]*className="leading-4"/);
  });
});

describe("session-9 parity round 8 — header recipes & actions alignment", () => {
  // All values measured live against the redeployed reference
  // (docs/remediation-plan-session9.md).

  it("R8-A: header row centers actions in the header block (items-center)", () => {
    // Reference header rows are `justify-between items-center` — the
    // actions cluster centers vertically (taskmanager y=116 on the h1 row,
    // employees y=46 in the 64px block). The clone's sm:items-start put
    // every action button at y=32.
    expect(pageHeader).toContain("sm:items-center");
    expect(pageHeader).not.toContain("sm:items-start");
    // The raised mt-8 offset applies to BADGE pages only — bare-page rows
    // (employees, analytics, templates) start at y=32 like the reference.
    expect(pageHeader).toContain("hasBadge && recipe.row");
  });

  it("R8-A: actions cluster uses the reference's gap-3 (12px)", () => {
    // Reference: `flex gap-3` (Import CSV 145 + 12 + Add Employee 165 = 322).
    expect(pageHeader).toContain('className="flex flex-wrap items-center gap-3 shrink-0"');
  });

  it("R8-B: PageHeader declares the centered prop for text-center headers", () => {
    // training / evaluations / companywall / organogram wrap their header
    // in text-center on the reference.
    expect(pageHeader).toContain("centered?: boolean");
    expect(pageHeader).toContain("text-center");
  });

  const CENTERED_PAGES = ["training", "evaluations", "companywall", "organogram"] as const;
  for (const page of CENTERED_PAGES) {
    it(`R8-B: /${page} passes centered`, () => {
      const src = read("src", "app", "(app)", page, "page.tsx");
      expect(src).toContain("centered");
    });
  }

  it("R8-D: analyticsdashboard paints the slate→blue page root (session-6 S2 miss)", () => {
    // The route was missed by the S2 codemod — no canvas, no padding (h1
    // at y=0). Reference root: p-4 md:p-8 space-y-8 min-h-screen
    // bg-gradient-to-br from-slate-50 to-blue-50 (sRGB).
    const src = read("src", "app", "(app)", "analyticsdashboard", "dashboard.tsx");
    expect(src).toContain(
      'min-h-screen bg-[linear-gradient(to_right_bottom,#f8fafc,#eff6ff)] p-4 md:p-8'
    );
  });

  it("R8-E: employees filter card matches the reference structure", () => {
    // Reference: card bg-white rounded-xl shadow-sm border-slate-200 p-4
    // mb-6; interior flex-col md:flex-row gap-4 items-center justify-between;
    // search wrapper flex-1 md:flex-none with input w-full md:w-64
    // bg-transparent; NATIVE select (h-9 px-3 py-2 border-slate-300
    // rounded-lg text-sm, 125×36); toggles List + Grid3x3 at h-8 px-3.
    expect(employeesPage).toContain(
      "rounded-xl border border-slate-200 bg-white p-4 shadow-sm mb-6"
    );
    expect(employeesPage).toContain(
      "flex flex-col gap-4 items-center justify-between md:flex-row"
    );
    expect(employeesPage).toContain("relative flex-1 md:flex-none");
    expect(employeesPage).toMatch(/bg-transparent pl-10 md:w-64/);
    expect(employeesPage).toMatch(/<select[^>]*className="[^"]*border-slate-300/);
    expect(employeesPage).toContain("Grid3x3");
    expect(employeesPage).not.toContain("LayoutGrid");
  });

  it("R8-F: templates subtitle is the live count (reference: '0 templates available')", () => {
    const src = read("src", "app", "(app)", "templates", "page.tsx");
    expect(src).toMatch(/\$\{templates\.length\} template\$\{templates\.length === 1 \? "" : "s"\} available/);
  });
});

describe("session-10 parity round 9 — centered headers, companywall, training, attendance, 404", () => {
  // All values measured live against the reference
  // (docs/remediation-plan-session10.md).

  it("R9-A: centered title block fills the row (flex-1) so text centers at the content center", () => {
    // Reference centered pages wrap the header in a FULL-WIDTH text-center
    // block directly under the content wrapper — badge + h1 center at 848
    // (content center at 1440). The clone's shrink-to-fit flex child
    // centered the text at 521-696 instead. flex-1 on the title block
    // restores the reference geometry.
    expect(pageHeader).toMatch(/centered && "flex-1/);
    expect(pageHeader).toMatch(/min-w-0[^)]*centered && "flex-1 text-center"/);
  });

  it("R9-B: companywall renders the narrow centered feed (max-w-3xl, space-y-6)", () => {
    // Reference: max-w-3xl mx-auto space-y-6 → 768px wide at x=464; the
    // clone's max-w-7xl gap-8 rendered 1120px.
    const src = read("src", "app", "(app)", "companywall", "page.tsx");
    expect(src).toContain("max-w-3xl");
    expect(src).not.toContain("max-w-7xl");
    expect(src).toMatch(/space-y-6/);
  });

  it("R9-B: companywall composer matches the reference (avatar + label-less textarea + full-width select)", () => {
    const src = read("src", "app", "(app)", "companywall", "page.tsx");
    // avatar: 40px initials circle next to the textarea
    expect(src).toMatch(/h-10 w-10 rounded-full/);
    // no visible "Share an update" form label — the reference starts at the
    // avatar row (an aria-label on the textarea is fine; it renders nothing)
    expect(src).not.toContain('htmlFor="post-content"');
    expect(src).not.toContain("<Label htmlFor=\"post-content\">");
    // reference placeholder, verbatim
    expect(src).toContain("Share an update with your team");
    // audience select is full width (reference trigger 662×36)
    expect(src).not.toContain("sm:w-52");
  });

  it("R9-C: training header carries no actions (reference has none)", () => {
    const src = read("src", "app", "(app)", "training", "page.tsx");
    expect(src).not.toMatch(/actions=\{/);
  });

  it("R9-C: training renders the bare H2 section row + bare card (reference recipe)", () => {
    // Reference: h2.text-2xl font-bold text-slate-900 "Training Platforms"
    // inside flex items-center justify-between mb-6, then a bare Card with
    // NO CardHeader — the grid or empty state renders directly inside.
    const src = read("src", "app", "(app)", "training", "page.tsx");
    expect(src).toMatch(/text-2xl font-bold text-slate-900/);
    expect(src).toMatch(/flex items-center justify-between mb-6/);
    expect(src).not.toContain("CardTitle");
    expect(src).not.toContain("CardDescription");
    expect(src).not.toContain("CardHeader");
  });

  it("R9-C: training category tabs are bare dark/outline buttons (taskmanager family)", () => {
    // Reference: flex gap-2 overflow-x-auto pb-2 list; active =
    // bg-[#171717] white 12px/500 h-8 px-3 rounded-md; inactive = outline.
    // NOT the shadcn segmented TabsList.
    const src = read("src", "app", "(app)", "training", "page.tsx");
    expect(src).toContain("overflow-x-auto pb-2");
    expect(src).not.toContain("TabsList");
    expect(src).not.toContain("TabsTrigger");
    expect(src).toMatch(/variant=\{.*"dark".*"outline"|category === c.value \? "dark" : "outline"/);
  });

  it("R9-C: training empty state is the simple variant (icon + one 16px slate-500 line)", () => {
    // Reference: p-12 text-center + 64px icon + single p.text-slate-500
    // 16px line "No training platforms available" — no h3, no description,
    // no CTA (card 202px tall). The full EmptyState variant stays for
    // payroll-style pages.
    const src = read("src", "app", "(app)", "training", "page.tsx");
    expect(src).toContain("No training platforms available");
    expect(src).not.toContain("Add a platform to start building your training library");
    expect(src).not.toContain("try another category");
  });

  it("R9-E: attendance header renders the reference's seven buttons without leading-[2]", () => {
    // Reference cluster (911px): Print/PDF/Excel/Devices/Settings/Dashboard
    // at h-8 12px outline + Import Attendance (cyan gradient, h-9). The
    // title block squeezes to 312px and the h1 wraps naturally — the
    // session-5 leading-[2] pin is stale on the redeployed reference.
    const src = read("src", "app", "(app)", "attendance", "page.tsx");
    expect(src).not.toContain("leading-[2]");
    for (const label of ["Print", "PDF", "Excel", "Devices", "Settings", "Dashboard", "Import Attendance"]) {
      expect(src).toContain(label);
    }
    expect(src).not.toContain('"Mark Attendance"');
  });

  it("R9-E: attendance renders the Report Type toolbar card with the three-option select", () => {
    // Reference: card (288,280) 70px tall between header and stats —
    // "Report Type:" + Radix select (All Staff Report / Individual
    // Employee / Department Report).
    const src = read("src", "app", "(app)", "attendance", "page.tsx");
    expect(src).toContain("Report Type");
    expect(src).toContain("All Staff Report");
    expect(src).toContain("Individual Employee");
    expect(src).toContain("Department Report");
  });

  it("R9-F: root not-found renders the reference's 72px 404 inside the shell", () => {
    // Reference: h1 "404" text-7xl font-light + h2 "Page Not Found"
    // text-2xl font-medium, centered in the content area; the sidebar
    // renders for authenticated sessions.
    const src = read("src", "app", "not-found.tsx");
    expect(src).toContain("text-7xl font-light");
    expect(src).toContain("Page Not Found");
    expect(src).toContain("text-2xl font-medium");
    expect(src).toContain("AppShell");
  });
});
