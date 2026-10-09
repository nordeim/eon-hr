#!/usr/bin/env node
// Session-5 per-page header sweep: adds layout= + iconClassName= to every
// badge page's PageHeader call, plus the attendance title quirk and the
// bare-page size fixes. Idempotent: skips files already carrying the props.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = "/home/z/eon-hr/src/app/(app)";

// route -> { layout, icon, titleClassName? }  (docs/remediation-plan-session5.md §3)
const MATRIX = {
  taskmanager: { layout: "raised-48", icon: "text-blue-600" },
  payroll: { layout: "raised-48", icon: "text-green-600" },
  expenses: { layout: "raised-48", icon: "text-purple-600" },
  leavemanagement: { layout: "raised-48", icon: "text-blue-600" },
  loans: { layout: "raised-36", icon: "text-blue-600" },
  allleaverequests: { layout: "flat36", icon: "text-blue-600" },
  interviewassistant: { layout: "flat36", icon: "text-purple-600" },
  offboarding: { layout: "flat36", icon: "text-blue-600" },
  performancemanagement: { layout: "flat36", icon: "text-indigo-600" },
  workflowautomation: { layout: "flat36", icon: "text-purple-600" },
  communications: { layout: "flat36", icon: "text-purple-600" },
  organogram: { layout: "flat36", icon: "text-teal-600" },
  hrassistantchat: { layout: "flat36", icon: "text-purple-600" },
  settings: { layout: "flat36", icon: "text-blue-600" },
  recruitment: { layout: "flat36-sm", icon: "text-indigo-600" },
  compliancedashboard: { layout: "flat36-sm", icon: "text-red-600" },
  training: { layout: "flat48", icon: "text-purple-600" },
  hrletters: { layout: "flat48", icon: "text-indigo-600" },
  surveys: { layout: "flat48", icon: "text-teal-600" },
  evaluations: { layout: "flat48", icon: "text-indigo-600" },
  companywall: { layout: "flat48", icon: "text-blue-600" },
  profile: { layout: "flat48", icon: "text-blue-600" },
  attendance: { layout: "flat48", icon: "text-blue-600", titleClassName: "leading-[2]" },
  shiftcalendar: { layout: "flat-tight", icon: "text-violet-600" },
  documenttracker: { layout: "flat-tight", icon: "text-blue-600" },
};

// Bare pages: analytics + templates need size="lg" (30px), announcements size="md".
const BARE = { analytics: "lg", templates: "lg", announcements: "md" };

let touched = 0;
for (const [route, spec] of Object.entries(MATRIX)) {
  const file = join(ROOT, route, "page.tsx");
  let src = readFileSync(file, "utf8");
  if (src.includes("layout=")) { console.log(`skip ${route} (already has layout)`); continue; }
  const sectionLine = src.split("\n").find((l) => /section=/.test(l));
  if (!sectionLine) { console.log(`WARN ${route}: no section= line`); continue; }
  const indent = sectionLine.match(/^(\s*)/)[1];
  const inject = [
    `${indent}layout="${spec.layout}"`,
    `${indent}iconClassName="${spec.icon}"`,
    ...(spec.titleClassName ? [`${indent}titleClassName="${spec.titleClassName}"`] : []),
  ].join("\n");
  src = src.replace(sectionLine, `${sectionLine}\n${inject}`);
  writeFileSync(file, src);
  touched++;
  console.log(`ok ${route}: layout=${spec.layout} icon=${spec.icon}`);
}

for (const [route, size] of Object.entries(BARE)) {
  const file = join(ROOT, route, "page.tsx");
  let src = readFileSync(file, "utf8");
  if (src.includes("size=")) { console.log(`skip ${route} (already has size)`); continue; }
  const titleLine = src.split("\n").find((l) => /title="/.test(l) && !/sectionTitle/.test(l));
  if (!titleLine) { console.log(`WARN ${route}: no title= line`); continue; }
  const indent = titleLine.match(/^(\s*)/)[1];
  src = src.replace(titleLine, `${titleLine}\n${indent}size="${size}"`);
  writeFileSync(file, src);
  touched++;
  console.log(`ok ${route}: size=${size}`);
}
console.log(`\n${touched} files updated.`);
