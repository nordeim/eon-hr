#!/usr/bin/env node
// add-section-icons.mjs — one-time session-4 edit: pass the nav-config module
// icon to PageHeader as sectionIcon on every badge page (measured reference
// badge icons: taskmanager=FolderKanban, leave=Plane, payroll=DollarSign,
// settings=Settings, profile=CircleUser, recruitment=UserPlus,
// companywall=House; the rest follow nav-config's per-route icons).
import { readFileSync, writeFileSync } from "node:fs";

const pages = [
  ["src/app/(app)/taskmanager/page.tsx", "FolderKanban"],
  ["src/app/(app)/allleaverequests/page.tsx", "Plane"],
  ["src/app/(app)/leavemanagement/page.tsx", "Plane"],
  ["src/app/(app)/attendance/page.tsx", "Calendar"],
  ["src/app/(app)/shiftcalendar/page.tsx", "Calendar"],
  ["src/app/(app)/documenttracker/page.tsx", "FileText"],
  ["src/app/(app)/payroll/page.tsx", "DollarSign"],
  ["src/app/(app)/loans/page.tsx", "DollarSign"],
  ["src/app/(app)/expenses/page.tsx", "Receipt"],
  ["src/app/(app)/recruitment/page.tsx", "UserPlus"],
  ["src/app/(app)/interviewassistant/page.tsx", "Sparkles"],
  ["src/app/(app)/offboarding/page.tsx", "CircleCheckBig"],
  ["src/app/(app)/training/page.tsx", "Video"],
  ["src/app/(app)/compliancedashboard/page.tsx", "ShieldCheck"],
  ["src/app/(app)/hrletters/page.tsx", "FileText"],
  ["src/app/(app)/surveys/page.tsx", "MessageSquare"],
  ["src/app/(app)/performancemanagement/page.tsx", "Target"],
  ["src/app/(app)/evaluations/page.tsx", "ClipboardCheck"],
  ["src/app/(app)/workflowautomation/page.tsx", "Sparkles"],
  ["src/app/(app)/companywall/page.tsx", "House"],
  ["src/app/(app)/communications/page.tsx", "MessageCircle"],
  ["src/app/(app)/organogram/page.tsx", "Users"],
  ["src/app/(app)/hrassistantchat/page.tsx", "Target"],
  ["src/app/(app)/settings/page.tsx", "SettingsIcon"],
  ["src/app/(app)/profile/page.tsx", "CircleUser"],
  ["src/app/(app)/advancedanalytics/page.tsx", "TrendingUp"],
  ["src/app/(app)/securitysettings/page.tsx", "ShieldCheck"],
  ["src/app/(app)/payrollengine/page.tsx", "Calculator"],
];

let changed = 0;
for (const [file, icon] of pages) {
  let src = readFileSync(file, "utf8");
  if (src.includes("sectionIcon=")) { console.log(`skip (has icon): ${file}`); continue; }

  // 1) add sectionIcon prop right after the section="..." line
  const sectionRe = /(\n(\s*)section="[^"]+")/;
  const m = src.match(sectionRe);
  if (!m) { console.log(`NO SECTION: ${file}`); continue; }
  src = src.replace(sectionRe, `$1\n${m[2]}sectionIcon={<${icon} aria-hidden="true" />}`);

  // 2) ensure the icon is imported from lucide-react
  const importRe = /import \{([^}]+)\} from "lucide-react";/;
  const im = src.match(importRe);
  if (!im) {
    src = src.replace(/("use client";\n)/, `$1import { ${icon} } from "lucide-react";\n`);
  } else {
    const names = im[1].split(",").map((s) => s.trim()).filter(Boolean);
    if (!names.includes(icon)) {
      names.push(icon);
      names.sort((a, b) => a.localeCompare(b));
      src = src.replace(importRe, `import { ${names.join(", ")} } from "lucide-react";`);
    }
  }
  writeFileSync(file, src);
  changed++;
}
console.log(`done: ${changed} files updated`);
