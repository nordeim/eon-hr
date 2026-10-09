#!/usr/bin/env node
/**
 * Session-6 S2 codemod — per-page gradient roots + wrapper restructure.
 *
 * The reference paints a per-page gradient canvas on each module page's
 * root div and applies the page padding there (`main` is bare). This
 * script wraps every page component's existing `mx-auto max-w-*` root
 * wrapper in a measured gradient root:
 *
 *   <div className="min-h-screen bg-[linear-gradient(...)] p-4 md:p-8">
 *     <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
 *       …unchanged content…
 *     </div>
 *   </div>
 *
 * Route → gradient map measured live (docs/remediation-plan-session6.md
 * §S2). Gradients authored as sRGB arbitrary values per Tailwind v4 trap 3.
 * Idempotent: skips files that already contain the root marker.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const P = (dir, file) => join(ROOT, "src", "app", "(app)", dir, file);

// v3-pinned -50 hexes (trap 2)
const C = {
  slate: "#f8fafc", blue: "#eff6ff", green: "#f0fdf4", emerald: "#ecfdf5",
  teal: "#f0fdfa", purple: "#faf5ff", pink: "#fdf2f8", indigo: "#eef2ff",
  cyan: "#ecfeff", red: "#fef2f2", orange: "#fff7ed", violet: "#f5f3ff",
};
const grad = (from, to) => `bg-[linear-gradient(to_right_bottom,${C[from]},${C[to]})]`;

/** route-dir → page config. root: extra classes beyond p-4 md:p-8 */
const GRADIENT_PAGES = {
  taskmanager: [grad("slate", "blue")],
  leavemanagement: [grad("slate", "blue")],
  settings: [grad("slate", "blue")],
  reports: [grad("slate", "blue")],
  advancedanalytics: [grad("slate", "blue")],
  companywall: [grad("slate", "blue")],
  chat: [grad("slate", "blue")],
  loans: [grad("slate", "blue")],
  offboarding: [grad("slate", "blue")],
  profile: [grad("slate", "blue")],
  securitysettings: [grad("slate", "blue"), { wrapper: "max-w-4xl" }],
  payroll: [grad("green", "blue")],
  payrollmodule: [grad("green", "emerald")],
  payrollengine: [grad("emerald", "teal"), { wrapperGap: "gap-6" }],
  training: [grad("purple", "blue")],
  communications: [grad("purple", "blue")],
  expenses: [grad("purple", "pink")],
  hrassistantchat: [grad("purple", "blue")],
  interviewassistant: [grad("purple", "indigo")],
  recruitment: [grad("indigo", "blue")],
  allleaverequests: [grad("blue", "indigo")],
  documenttracker: [grad("blue", "indigo"), { wrapperGap: "gap-6" }],
  evaluations: [grad("indigo", "purple")],
  hrletters: [grad("indigo", "purple")],
  attendance: [grad("blue", "cyan")],
  attendancedashboard: [grad("blue", "cyan")],
  compliancedashboard: [grad("red", "orange")],
  organogram: [grad("teal", "green")],
  surveys: [grad("teal", "cyan")],
  surveyanalytics: [grad("teal", "slate")],
  shiftcalendar: [grad("violet", "indigo"), { wrapperGap: "gap-6" }],
  performancemanagement: [grad("slate", "indigo")],
  workflowautomation: [grad("slate", "purple")],
};

/** Non-gradient pages: plain p-4 md:p-8 root (reference has no canvas). */
const PLAIN_PAGES = {
  employees: {},
  analytics: {},
  templates: {},
  announcements: { wrapperGap: "gap-6" },
  recruitmentkanban: { wrapperGap: "gap-6" },
  assetmanagement: {},
  employeeselfservice: {}, // reference page is broken — keep clone structure
};

/** Special combined/padded wrappers (measured). */
const SPECIAL = {
  // reference combines padding + max-w on one div (no separate root)
  staffrequests: { combined: "mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8" },
  hrreports: { combined: "mx-auto flex w-full max-w-7xl flex-col gap-6 p-6" },
  notificationpreferences: { combined: "mx-auto flex w-full max-w-3xl flex-col gap-6 p-6" },
  workflowconfigpage: { combined: "mx-auto flex w-full max-w-5xl flex-col gap-6 p-6" },
};

const PAGE_FILES = [
  ...Object.keys(GRADIENT_PAGES).map((d) => [d, "page.tsx"]),
  ["attendancedashboard", "dashboard.tsx"],
  ["surveyanalytics", "analytics.tsx"],
  ...Object.keys(PLAIN_PAGES).map((d) => [d, "page.tsx"]),
  ...Object.keys(SPECIAL).map((d) => [d, "page.tsx"]),
];

const WRAPPER_RE = /^(\s*)<div className="(mx-auto flex w-full max-w-\w+ flex-col(?: gap-\d)?[^"]*)">$/;

function divDelta(line) {
  const opens = (line.match(/<div[\s>]/g) || []).length;
  const selfClosing = (line.match(/<div\b[^<>]*\/>/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  return opens - selfClosing - closes;
}

function transform(file, rootClasses, opts = {}) {
  const src = readFileSync(file, "utf8");
  if (src.includes("p-4 md:p-8") && rootClasses && src.includes(rootClasses)) return "already";
  const lines = src.split("\n");
  const openIdx = lines.findIndex((l) => WRAPPER_RE.test(l));
  if (openIdx === -1) return "no-wrapper";
  const m = lines[openIdx].match(WRAPPER_RE);
  const indent = m[1];
  let wrapperCls = m[2];
  if (opts.wrapper) wrapperCls = wrapperCls.replace(/max-w-\w+/, opts.wrapper);
  if (opts.wrapperGap) wrapperCls = wrapperCls.replace(/gap-\d+/, opts.wrapperGap);

  if (opts.combined) {
    // special: rewrite the wrapper line in place (no separate root)
    lines[openIdx] = `${indent}<div className="${opts.combined}">`;
    writeFileSync(file, lines.join("\n"));
    return "combined";
  }

  // depth-scan for the matching close of the wrapper div
  let depth = divDelta(lines[openIdx]);
  let closeIdx = -1;
  for (let i = openIdx + 1; i < lines.length; i++) {
    depth += divDelta(lines[i]);
    if (depth === 0) { closeIdx = i; break; }
  }
  if (closeIdx === -1) return "no-close";

  const root = rootClasses
    ? `min-h-screen ${rootClasses} p-4 md:p-8`
    : "p-4 md:p-8";
  lines[openIdx] = [
    `${indent}<div className="${root}">`,
    `${indent}  <div className="${wrapperCls}">`,
  ].join("\n");
  lines[closeIdx] = [lines[closeIdx], `${indent}</div>`].join("\n");
  writeFileSync(file, lines.join("\n"));
  return "wrapped";
}

let report = [];
for (const [dir, file] of PAGE_FILES) {
  const full = P(dir, file);
  let cfg = null;
  let rootClasses = null;
  let opts = {};
  if (GRADIENT_PAGES[dir]) {
    const v = GRADIENT_PAGES[dir];
    rootClasses = typeof v[0] === "string" ? v[0] : null;
    opts = v.find((x) => typeof x === "object") || {};
  } else if (PLAIN_PAGES[dir]) {
    rootClasses = null;
    opts = PLAIN_PAGES[dir];
  } else if (SPECIAL[dir]) {
    opts = SPECIAL[dir];
  } else if (dir === "attendancedashboard") {
    rootClasses = grad("blue", "cyan");
  } else if (dir === "surveyanalytics") {
    rootClasses = grad("teal", "slate");
  }
  try {
    const r = transform(full, rootClasses, opts);
    report.push(`${dir}/${file}: ${r}`);
  } catch (e) {
    report.push(`${dir}/${file}: ERROR ${e.message}`);
  }
}
console.log(report.join("\n"));
