#!/usr/bin/env python3
"""r48-roots.py — session-48 GREEN batch: the B1 gradient swaps + B2
wrapper swaps (class-string only) across the round's page map, plus the
B3 merged-root five (root class + inner-wrapper div surgery with depth
matching). Verifies each replacement landed; leaves structure alone."""
import re, sys
from pathlib import Path

ROOT = Path("/home/z/my-project/eon-hr/src/app/(app)")

# (file, [(old, new), ...]) — class swaps only.
GRAD = {  # the arbitrary hex form -> the v3 class form
    "compliancedashboard/page.tsx": ("#fef2f2,#fff7ed", "from-red-50 to-orange-50"),
    "performancemanagement/page.tsx": ("#f8fafc,#eef2ff", "from-slate-50 to-indigo-50"),
    "organogram/page.tsx": ("#f0fdfa,#f0fdf4", "from-teal-50 to-green-50"),
    "surveys/page.tsx": ("#f0fdfa,#ecfeff", "from-teal-50 to-cyan-50"),
    "companywall/page.tsx": ("#f8fafc,#eff6ff", "from-slate-50 to-blue-50"),
    "chat/page.tsx": ("#f8fafc,#eff6ff", "from-slate-50 to-blue-50"),
    "evaluations/page.tsx": ("#eef2ff,#faf5ff", "from-indigo-50 to-purple-50"),
    "shiftcalendar/page.tsx": ("#f5f3ff,#eef2ff", "from-violet-50 to-indigo-50"),
    "hrletters/page.tsx": ("#eef2ff,#faf5ff", "from-indigo-50 to-purple-50"),
    "offboarding/page.tsx": ("#f8fafc,#eff6ff", "from-slate-50 to-blue-50"),
    "advancedanalytics/page.tsx": ("#f8fafc,#eff6ff", "from-slate-50 to-blue-50"),
    "reports/reports-browser.tsx": ("#f8fafc,#eff6ff", "from-slate-50 to-blue-50"),
    "payrollreports/page.tsx": ("#f8fafc,#eff6ff", "from-blue-50 to-indigo-50"),
    "payrollai/page.tsx": ("#f0fdf4,#eff6ff", "from-green-50 to-blue-50"),
    "payrollengine/page.tsx": ("#ecfdf5,#f0fdfa", "from-emerald-50 to-teal-50"),
    "interviewassistant/page.tsx": ("#faf5ff,#eef2ff", "from-purple-50 to-indigo-50"),
    "workflowautomation/page.tsx": ("#f8fafc,#faf5ff", "from-slate-50 to-purple-50"),
    "hrassistantchat/page.tsx": ("#faf5ff,#eff6ff", "from-purple-50 to-blue-50"),
    "securitysettings/page.tsx": ("#f8fafc,#eff6ff", "from-slate-50 to-blue-50"),
    "shiftswap/page.tsx": ("#f5f3ff,#eff6ff", "from-violet-50 to-blue-50"),
    "allleaverequests/page.tsx": ("#eff6ff,#eef2ff", "from-blue-50 to-indigo-50"),
    "communications/page.tsx": ("#faf5ff,#eff6ff", "from-purple-50 to-blue-50"),
    "assets/page.tsx": ("#f0fdf4,#eff6ff", "from-green-50 to-blue-50"),
    "attendancedashboard/dashboard.tsx": ("#eff6ff,#ecfeff", "from-blue-50 to-cyan-50"),
    "analyticsdashboard/dashboard.tsx": ("#f8fafc,#eff6ff", "from-slate-50 to-blue-50"),
    "surveyanalytics/analytics.tsx": ("#f0fdfa,#f8fafc", "from-teal-50 to-slate-50"),
    "payrollmodule/page.tsx": ("#f0fdf4,#ecfdf5", "from-green-50 to-emerald-50"),
}

# the wrapper swaps: old -> new (exact class substrings).
WRAPPERS = {
    # the mapped family
    "payroll/page.tsx": ("mx-auto flex w-full max-w-7xl flex-col gap-8", "max-w-7xl mx-auto space-y-8"),
    "taskmanager/page.tsx": ("mx-auto flex w-full max-w-7xl flex-col gap-8", "max-w-7xl mx-auto space-y-8"),
    "recruitment/page.tsx": ("mx-auto flex w-full max-w-7xl flex-col gap-8", "max-w-7xl mx-auto space-y-8"),
    "training/page.tsx": ("mx-auto flex w-full max-w-7xl flex-col gap-8", "max-w-7xl mx-auto space-y-8"),
    "settings/page.tsx": ("mx-auto flex w-full max-w-7xl flex-col gap-8", "max-w-7xl mx-auto space-y-8"),
    "leavemanagement/page.tsx": ("mx-auto flex w-full max-w-7xl flex-col gap-8", "max-w-7xl mx-auto space-y-8"),
    "expenses/page.tsx": ("mx-auto flex w-full max-w-7xl flex-col gap-8", "max-w-7xl mx-auto space-y-8"),
    "loans/page.tsx": ("mx-auto flex w-full max-w-7xl flex-col gap-8", "max-w-7xl mx-auto space-y-8"),
    "documenttracker/page.tsx": ("mx-auto flex w-full max-w-7xl flex-col gap-6", "max-w-7xl mx-auto space-y-6"),
    "profile/page.tsx": ("mx-auto flex w-full max-w-5xl flex-col gap-8", "max-w-5xl mx-auto space-y-8"),
    "employees/page.tsx": ("mx-auto flex w-full max-w-7xl flex-col", "max-w-7xl mx-auto"),
    # this round's pages
    "compliancedashboard/page.tsx": ("mx-auto flex w-full max-w-7xl flex-col gap-8", "max-w-7xl mx-auto space-y-8"),
    "performancemanagement/page.tsx": ("mx-auto flex w-full max-w-7xl flex-col gap-8", "max-w-7xl mx-auto space-y-8"),
    "organogram/page.tsx": ("mx-auto flex w-full max-w-7xl flex-col gap-8", "max-w-full mx-auto space-y-8"),
    "surveys/page.tsx": ("mx-auto flex w-full max-w-7xl flex-col gap-8", "max-w-7xl mx-auto space-y-8"),
    "companywall/page.tsx": ("mx-auto flex w-full max-w-3xl flex-col space-y-6", "max-w-3xl mx-auto space-y-6"),
    "chat/page.tsx": ("mx-auto flex w-full max-w-7xl flex-col", "max-w-7xl mx-auto"),
    "evaluations/page.tsx": ("mx-auto flex w-full max-w-7xl flex-col gap-8", "max-w-7xl mx-auto space-y-8"),
    "shiftcalendar/page.tsx": ("mx-auto flex w-full max-w-7xl flex-col gap-6", "max-w-7xl mx-auto space-y-6"),
    "hrletters/page.tsx": ("mx-auto flex w-full max-w-7xl flex-col gap-8", "max-w-7xl mx-auto space-y-8"),
    "offboarding/page.tsx": ("mx-auto flex w-full max-w-7xl flex-col gap-8", "max-w-7xl mx-auto space-y-8"),
    "advancedanalytics/page.tsx": ("mx-auto flex w-full max-w-7xl flex-col gap-8", "max-w-7xl mx-auto space-y-8"),
    "reports/reports-browser.tsx": ("mx-auto flex w-full max-w-7xl flex-col gap-8", "max-w-7xl mx-auto space-y-8"),
    "payrollreports/page.tsx": ("mx-auto flex w-full max-w-7xl flex-col gap-6", "max-w-7xl mx-auto space-y-6"),
    "payrollengine/page.tsx": ("mx-auto flex w-full max-w-7xl flex-col gap-6", "max-w-7xl mx-auto space-y-6"),
    "interviewassistant/page.tsx": ("mx-auto flex w-full max-w-7xl flex-col gap-8", "max-w-7xl mx-auto space-y-8"),
    "workflowautomation/page.tsx": ("mx-auto flex w-full max-w-7xl flex-col gap-8", "max-w-7xl mx-auto space-y-8"),
    "hrassistantchat/page.tsx": ("mx-auto flex w-full max-w-7xl flex-col", "max-w-7xl mx-auto"),
    "securitysettings/page.tsx": ("mx-auto flex w-full max-w-4xl flex-col gap-8", "max-w-4xl mx-auto space-y-8"),
    "allleaverequests/page.tsx": ("mx-auto flex w-full max-w-7xl flex-col gap-8", "max-w-7xl mx-auto space-y-8"),
    "communications/page.tsx": ("mx-auto flex w-full max-w-7xl flex-col gap-8", "max-w-7xl mx-auto space-y-8"),
    "payrollai/page.tsx": ("mx-auto max-w-7xl space-y-8", "max-w-7xl mx-auto space-y-8"),
    "shiftswap/page.tsx": ("mx-auto max-w-7xl space-y-8", "max-w-7xl mx-auto space-y-8"),
    "assets/page.tsx": ("mx-auto max-w-7xl space-y-8", "max-w-7xl mx-auto space-y-8"),
    "hrassistant/page.tsx": ("mx-auto max-w-4xl space-y-6", "max-w-4xl mx-auto space-y-6"),
    "hrreports/page.tsx": ("mx-auto flex w-full max-w-7xl flex-col gap-6 p-6", "p-6 space-y-6 max-w-7xl mx-auto"),
    "workflowconfigpage/page.tsx": ("mx-auto flex w-full max-w-5xl flex-col gap-6 p-6", "p-6 max-w-5xl mx-auto"),
    "notificationpreferences/page.tsx": ("mx-auto flex w-full max-w-3xl flex-col gap-6 p-6", "p-6 max-w-3xl mx-auto space-y-6"),
}

# the B3 merged-root five: (file, root_old, root_new, gradient) — root
# class swap + inner wrapper REMOVAL (open tag + matching close).
MERGED = {
    "assetmanagement/page.tsx": ('className="p-4 md:p-8"', "p-4 md:p-8 space-y-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50"),
    "analyticsdashboard/dashboard.tsx": ('className="p-4 md:p-8"', "p-4 md:p-8 space-y-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50"),
    "attendancedashboard/dashboard.tsx": ('className="p-4 md:p-8"', "p-4 md:p-8 space-y-8 min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50"),
    "surveyanalytics/analytics.tsx": ('className="p-4 md:p-8"', "p-4 md:p-8 space-y-8 min-h-screen bg-gradient-to-br from-teal-50 to-slate-50"),
    "payrollmodule/page.tsx": ('className="p-4 md:p-8"', "p-4 md:p-8 space-y-8 min-h-screen bg-gradient-to-br from-green-50 to-emerald-50"),
}
INNER = 'className="mx-auto flex w-full max-w-7xl flex-col gap-8"'

changed, problems = [], []

for rel, (hexpair, v3) in GRAD.items():
    p = ROOT / rel
    s = p.read_text()
    old = f"bg-[linear-gradient(to_right_bottom,{hexpair})]"
    if old not in s:
        problems.append(f"GRAD miss {rel}: {old}")
        continue
    s = s.replace(old, f"bg-gradient-to-br {v3}")
    p.write_text(s)
    changed.append(rel)

for rel, (old, new) in WRAPPERS.items():
    p = ROOT / rel
    s = p.read_text()
    if old not in s:
        problems.append(f"WRAP miss {rel}: {old}")
        continue
    s = s.replace(old, new)
    p.write_text(s)
    if rel not in changed:
        changed.append(rel)

for rel, (root_old, root_new) in MERGED.items():
    p = ROOT / rel
    s = p.read_text()
    if root_old not in s:
        problems.append(f"MERGED root miss {rel}")
        continue
    # the root swap (first occurrence = the page root)
    s = s.replace(root_old, f'className="{root_new}"', 1)
    # the inner wrapper removal: find the opening tag, then its matching </div>
    idx = s.find(INNER)
    if idx == -1:
        problems.append(f"MERGED inner miss {rel}")
        continue
    # back up to the start of the wrapper's line (strip the whole line)
    line_start = s.rfind("\n", 0, idx) + 1
    line_end = s.find("\n", idx)
    after_open = line_end + 1
    # depth-scan for the matching close from the opening tag's end
    depth = 1
    pos = after_open
    token = re.compile(r"<div\b|</div>")
    close_idx = None
    for m in token.finditer(s, after_open):
        if m.group(0) == "</div>":
            depth -= 1
            if depth == 0:
                close_idx = m.start()
                break
        else:
            depth += 1
    if close_idx is None:
        problems.append(f"MERGED unbalanced {rel}")
        continue
    # find the close tag's line boundaries
    close_line_start = s.rfind("\n", 0, close_idx) + 1
    close_line_end = s.find("\n", close_idx)
    close_line = s[close_line_start:close_line_end]
    if close_line.strip() != "</div>":
        problems.append(f"MERGED close-line not bare {rel}: {close_line.strip()[:40]}")
        continue
    # remove: the close line first (later in the file), then the open line
    s = s[:close_line_start] + s[close_line_end + 1:]
    s = s[:line_start] + s[line_end + 1:]
    # the root swap may have shifted indices — do it AFTER the surgery instead
    p.write_text(s)
    changed.append(rel)

print(f"changed {len(changed)} files")
for c in sorted(changed):
    print(f"  ok {c}")
if problems:
    print("\nPROBLEMS:")
    for pr in problems:
        print(f"  {pr}")
    sys.exit(1)
