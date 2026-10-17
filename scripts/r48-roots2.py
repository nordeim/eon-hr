#!/usr/bin/env python3
"""r48-roots2.py — the 5 follow-up fixes from the batch's problem list:
the four merged-root pages whose roots already carried the v3 gradient
(member reorder + space-y-8) + payrollreports' order-only wrapper."""
import re, sys
from pathlib import Path

ROOT = Path("/home/z/my-project/eon-hr/src/app/(app)")
INNER = 'className="mx-auto flex w-full max-w-7xl flex-col gap-8"'

MERGED = {
    "analyticsdashboard/dashboard.tsx": (
        "min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8",
        "p-4 md:p-8 space-y-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50",
    ),
    "attendancedashboard/dashboard.tsx": (
        "min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4 md:p-8",
        "p-4 md:p-8 space-y-8 min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50",
    ),
    "surveyanalytics/analytics.tsx": (
        "min-h-screen bg-gradient-to-br from-teal-50 to-slate-50 p-4 md:p-8",
        "p-4 md:p-8 space-y-8 min-h-screen bg-gradient-to-br from-teal-50 to-slate-50",
    ),
    "payrollmodule/page.tsx": (
        "min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 md:p-8",
        "p-4 md:p-8 space-y-8 min-h-screen bg-gradient-to-br from-green-50 to-emerald-50",
    ),
}

changed, problems = [], []

for rel, (old_root, new_root) in MERGED.items():
    p = ROOT / rel
    s = p.read_text()
    old = f'className="{old_root}"'
    if old not in s:
        problems.append(f"root miss {rel}")
        continue
    s = s.replace(old, f'className="{new_root}"', 1)
    idx = s.find(INNER)
    if idx == -1:
        problems.append(f"inner miss {rel}")
        continue
    line_start = s.rfind("\n", 0, idx) + 1
    line_end = s.find("\n", idx)
    depth, close_idx = 1, None
    for m in re.finditer(r"<div\b|</div>", s, ):
        pos = m.start()
        if pos <= line_end:
            continue
        if m.group(0) == "</div>":
            depth -= 1
            if depth == 0:
                close_idx = pos
                break
        else:
            depth += 1
    if close_idx is None:
        problems.append(f"unbalanced {rel}")
        continue
    cls = s.rfind("\n", 0, close_idx) + 1
    cle = s.find("\n", close_idx)
    if s[cls:cle].strip() != "</div>":
        problems.append(f"close-line not bare {rel}: {s[cls:cle].strip()[:40]}")
        continue
    s = s[:cls] + s[cle + 1:]
    s = s[:line_start] + s[line_end + 1:]
    p.write_text(s)
    changed.append(rel)

# payrollreports' wrapper (order-only)
p = ROOT / "payrollreports/page.tsx"
s = p.read_text()
oldw = 'className="mx-auto max-w-7xl space-y-6"'
if oldw in s:
    p.write_text(s.replace(oldw, 'className="max-w-7xl mx-auto space-y-6"'))
    changed.append("payrollreports/page.tsx")
else:
    problems.append("payrollreports wrapper miss")

print(f"changed {len(changed)}: {changed}")
if problems:
    print("PROBLEMS:")
    for pr in problems:
        print(f"  {pr}")
    sys.exit(1)
