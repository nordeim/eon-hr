#!/usr/bin/env python3
"""scripts/r46-roots.py — session-47 GREEN: apply the page-root family
across the remaining pages.
  - TRIO_OUTSIDE (payroll, taskmanager, leavemanagement, expenses, loans):
    REF's scroller > relative overflow-hidden > touch-pan-y > [gradient
    root] — the PageCanvas wraps the gradient root.
  - GRADIENT_SWAP (recruitment, training, documenttracker, profile,
    settings): the v3 gradient form + dark pairs, no trio.
  - attendance: gradient root stays FIRST (v3 form + dark pair), the
    PageCanvas NESTS inside wrapping the max-w-7xl space-y-8 content.
  - staffrequests: the bare-wrapper verbatim swap.
Depth-matches each root div to place the </PageCanvas> close (the Dialog
siblings stay outside the canvas)."""
import re

TRIO_OUTSIDE = {
    "payroll": (
        '<div className="min-h-screen bg-[linear-gradient(to_right_bottom,#f0fdf4,#eff6ff)] p-4 md:p-8 select-none">',
        '<div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">',
    ),
    "taskmanager": (
        '<div className="min-h-screen bg-[linear-gradient(to_right_bottom,#f8fafc,#eff6ff)] p-4 md:p-8 select-none">',
        '<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">',
    ),
    "leavemanagement": (
        '<div className="min-h-screen bg-[linear-gradient(to_right_bottom,#f8fafc,#eff6ff)] p-4 md:p-8 select-none">',
        '<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">',
    ),
    "expenses": (
        '<div className="min-h-screen bg-[linear-gradient(to_right_bottom,#faf5ff,#fdf2f8)] p-4 md:p-8 select-none">',
        '<div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-8">',
    ),
    "loans": (
        '<div className="min-h-screen bg-[linear-gradient(to_right_bottom,#f8fafc,#eff6ff)] p-4 md:p-8 select-none">',
        '<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">',
    ),
}
GRADIENT_SWAP = {
    "recruitment": (
        '<div className="min-h-screen bg-[linear-gradient(to_right_bottom,#eef2ff,#eff6ff)] p-4 md:p-8">',
        '<div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-4 md:p-8">',
    ),
    "training": (
        '<div className="min-h-screen bg-[linear-gradient(to_right_bottom,#faf5ff,#eff6ff)] p-4 md:p-8">',
        '<div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8">',
    ),
    "documenttracker": (
        '<div className="min-h-screen bg-[linear-gradient(to_right_bottom,#eff6ff,#eef2ff)] p-4 md:p-8">',
        '<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">',
    ),
    "profile": (
        '<div className="min-h-screen bg-[linear-gradient(to_right_bottom,#f8fafc,#eff6ff)] p-4 md:p-8">',
        '<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">',
    ),
    "settings": (
        '<div className="min-h-screen bg-[linear-gradient(to_right_bottom,#f8fafc,#eff6ff)] p-4 md:p-8">',
        '<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">',
    ),
}
ATTENDANCE_ROOT = (
    '<div className="min-h-screen bg-[linear-gradient(to_right_bottom,#eff6ff,#ecfeff)] p-4 md:p-8 select-none">',
    '<div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">',
)
ATTENDANCE_INNER = (
    '<div className="mx-auto flex w-full max-w-7xl flex-col gap-8">',
    '<div className="max-w-7xl mx-auto space-y-8">',
)
STAFFREQUESTS = (
    '<div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">',
    '<div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">',
)

def find_close(lines, start):
    """Depth-match the root <div> opened at lines[start]; return the index
    of the line where depth returns to 0 (may be a mid-line close)."""
    depth = 0
    for i in range(start, len(lines)):
        opens = len(re.findall(r"<div\b", lines[i]))
        closes = len(re.findall(r"</div>", lines[i]))
        depth += opens - closes
        if depth <= 0 and i >= start:
            return i
    raise RuntimeError("unbalanced div")

def add_import(s):
    if 'from "@/components/shared/page-canvas"' in s:
        return s
    anchor = 'import { PageCanvas } from "@/components/shared/page-canvas";\n'
    m = re.search(r'import \{ PageHeader \} from "@/components/shared/page-header";\n', s)
    if m:
        return s.replace(m.group(0), m.group(0) + anchor)
    first = re.search(r"^import ", s, re.M)
    return s[:first.start()] + anchor + s[first.start():]

def wrap_with_canvas(path, open_marker, root_old, root_new, inner=False):
    """Wrap the div opened by open_marker in <PageCanvas>…</PageCanvas>."""
    s = open(path).read()
    assert s.count(open_marker) == 1, f"{path}: marker not unique"
    if root_old:
        assert s.count(root_old) == 1, f"{path}: root not unique"
    lines = s.split("\n")
    target = next(i for i, l in enumerate(lines) if open_marker in l)
    if root_old:
        lines[target] = lines[target].replace(root_old, root_new)
    close = find_close(lines, target)
    indent = re.match(r"\s*", lines[target]).group(0)
    lines.insert(target, f"{indent}<PageCanvas>")
    lines.insert(close + 2, f"{indent}</PageCanvas>")
    s = add_import("\n".join(lines))
    open(path, "w").write(s)
    print(f"canvas{'(inner)' if inner else ''}: {path} close@{close + 1}")

def apply_swap(path, old_root, new_root):
    s = open(path).read()
    assert s.count(old_root) == 1, f"{path}: root not unique"
    s = s.replace(old_root, new_root)
    open(path, "w").write(s)
    print(f"swap: {path}")

base = "src/app/(app)"
for route, (old_root, new_root) in TRIO_OUTSIDE.items():
    wrap_with_canvas(f"{base}/{route}/page.tsx", old_root, old_root, new_root)
for route, (old_root, new_root) in GRADIENT_SWAP.items():
    apply_swap(f"{base}/{route}/page.tsx", old_root, new_root)

# attendance: root swap, then the canvas wraps the INNER content wrapper
p = f"{base}/attendance/page.tsx"
apply_swap(p, *ATTENDANCE_ROOT)
wrap_with_canvas(p, ATTENDANCE_INNER[0], ATTENDANCE_INNER[0], ATTENDANCE_INNER[1], inner=True)

apply_swap(f"{base}/staffrequests/page.tsx", *STAFFREQUESTS)
print("ALL DONE")
