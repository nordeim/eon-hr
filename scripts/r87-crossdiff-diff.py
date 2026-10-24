#!/usr/bin/env python3
"""r87-crossdiff-diff.py — session-87 / parity round 86: the cross-side
at-rest pixel-diff pass over the REMAINING 52 registry routes (the r86
instrument extended — the standing protocol's first full-registry sweep).
Same classification as r86-crossdiff-diff.py: PIL grid diff (48px cells,
channel threshold), AA-NOISE (max delta <= 2) / MINOR (3-8, few cells) /
STRUCTURAL (any delta > 8 with contiguous cells)."""
from PIL import Image, ImageChops
import os, sys

SHOTS = "/home/z/my-project/eon-hr/docs/screenshots"
ROUTES = [
  "advancedanalytics", "allleaverequests", "analytics", "analyticsdashboard",
  "announcements", "assets", "attendancedashboard", "careers", "chat",
  "communications", "companywall", "compliancedashboard", "documenttracker",
  "dynamicdashboard", "employeedetail", "employeeportal", "employeeselfservice",
  "evaluations", "expenses", "externaljobapplication", "home", "hrassistant",
  "hrassistantchat", "hrletters", "hrreports", "interviewassistant",
  "leavemanagement", "loans", "notificationpreferences", "offboarding",
  "organizationsetup", "organogram", "payrollai", "payrollengine",
  "payrollmodule", "performancemanagement", "profile", "recruitmentkanban",
  "reports", "requestreports", "requestsettings", "securitysettings",
  "shiftcalendar", "shiftswap", "staffrequests", "surveyanalytics", "surveys",
  "taskmanager", "templates", "tenantsetup", "workflowautomation",
  "workflowconfigpage",
]
# r87-crossdiff-verify re-captures the remediated subset; pass route names
# as args to diff only those (e.g. `python3 r87-crossdiff-diff.py assets
# loans`), no args = the full 52-route registry pass.
if len(sys.argv) > 1:
    ROUTES = sys.argv[1:]

def cluster_cells(cells, gap=1):
    """union-find-lite clustering of grid cells by adjacency (gap=1)."""
    cells = sorted(cells)
    clusters = []
    for c in cells:
        merged = False
        for cl in clusters:
            if any(abs(c[0]-d[0]) <= gap and abs(c[1]-d[1]) <= gap for d in cl):
                cl.append(c); merged = True; break
        if not merged:
            clusters.append([c])
    changed = True
    while changed:
        changed = False
        out = []
        for cl in clusters:
            hit = None
            for i, o in enumerate(out):
                if any(abs(c[0]-d[0]) <= gap and abs(c[1]-d[1]) <= gap for c in cl for d in o):
                    hit = i; break
            if hit is None:
                out.append(list(cl))
            else:
                out[hit].extend(cl); changed = True
        clusters = out
    return clusters

summary = []
for route in ROUTES:
    ref_p = f"{SHOTS}/r87-crossdiff-{route}-ref.png"
    loc_p = f"{SHOTS}/r87-crossdiff-{route}-loc.png"
    if not (os.path.exists(ref_p) and os.path.exists(loc_p)):
        print(f"{route}: MISSING capture"); continue
    a = Image.open(ref_p).convert("RGB")
    b = Image.open(loc_p).convert("RGB")
    if a.size != b.size:
        print(f"{route}: SIZE MISMATCH ref={a.size} loc={b.size}")
        summary.append((route, "SIZE-MISMATCH", 0, 0)); continue
    diff = ImageChops.difference(a, b)
    W, H = a.size
    px = diff.load()
    grid = {}
    maxdelta = 0
    for y in range(0, H, 2):
        for x in range(0, W, 2):
            r, g, bl = px[x, y]
            d = max(r, g, bl)
            maxdelta = max(maxdelta, d)
            if d > 2:  # above AA-noise floor
                grid.setdefault((x // 48, y // 48), []).append((x, y, (r, g, bl)))
    cells = sorted(grid.keys())
    ncells = len(cells)
    clusters = cluster_cells(cells)
    biggest = max(clusters, key=len) if clusters else []
    if biggest:
        xs = [c[0] for c in biggest]; ys = [c[1] for c in biggest]
        bbox = (min(xs)*48, min(ys)*48, (max(xs)+1)*48, (max(ys)+1)*48)
    else:
        bbox = None
    if ncells == 0:
        verdict = "IDENTICAL(>2)" if maxdelta <= 2 else "AA-NOISE-ONLY"
    elif maxdelta <= 2:
        verdict = "AA-NOISE"
    elif maxdelta <= 8 and ncells <= 12:
        verdict = "MINOR"
    else:
        verdict = "STRUCTURAL"
    print(f"{route}: cells={ncells} clusters={len(clusters)} maxdelta={maxdelta} "
          f"biggest_cluster_bbox={bbox} -> {verdict}")
    summary.append((route, verdict, ncells, maxdelta))

print("\n==== SUMMARY ====")
for route, verdict, ncells, maxdelta in summary:
    print(f"  {route:26s} {verdict:16s} cells={ncells:4d} maxdelta={maxdelta}")
n_struct = sum(1 for r in summary if r[1] == "STRUCTURAL")
n_minor = sum(1 for r in summary if r[1] in ("MINOR", "AA-NOISE", "AA-NOISE-ONLY"))
print(f"\nSTRUCTURAL: {n_struct} | MINOR/AA: {n_minor} | total {len(summary)}")
