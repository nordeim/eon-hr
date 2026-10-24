#!/usr/bin/env python3
"""r89-theme-mobile-diff.py — session-89 / parity round 88: the cross-side
pixel-diff for the DARK/RTL MOBILE-BAND pass (390x844). Same classification
as r88-mobile-diff.py: PIL grid diff (48px cells, channel threshold),
AA-NOISE (max delta <= 2) / MINOR (3-8, few cells) / STRUCTURAL (any
delta > 8 with contiguous cells). The mobile-band known-superset regions
carried: the LOC badge overlay on the 73px top bar (DRIFT-BY-DESIGN, r85).
The dark band adds the REF EXPERIMENT-VARIANCE caveat: the r86/r87
documented non-deterministic REF dark-sidebar palette flips are now
ROOT-CAUSED as the platform's per-visitor PRE_AUTH_EXPERIMENTS variant
system — a REF-side palette read that matches a documented variant form
is classified VARIANT (REF-authored), not a clone defect.
Usage: python3 scripts/r89-theme-mobile-diff.py <dark|rtl> [route ...]"""
from PIL import Image, ImageChops
import os, sys

SHOTS = "/home/z/my-project/eon-hr/docs/screenshots"
STATE = sys.argv[1] if len(sys.argv) > 1 else "dark"
PREFIX = "r89-darkm" if STATE == "dark" else "r89-rtlm"
ROUTES = [
  "dashboard", "payroll", "employees", "attendance", "training",
  "recruitment", "settings", "assetmanagement", "payrollreports",
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
args = sys.argv[2:]
if args:
    ROUTES = [r for r in args if not r.startswith("-")]


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
            absorbed = False
            for other in out:
                if any(abs(a[0]-b[0]) <= gap and abs(a[1]-b[1]) <= gap for a in cl for b in other):
                    other.extend(cl); absorbed = True; changed = True; break
            if not absorbed:
                out.append(cl)
        clusters = out
    return clusters


def diff(route):
    a_p = f"{SHOTS}/{PREFIX}-{route}-ref.png"
    b_p = f"{SHOTS}/{PREFIX}-{route}-loc.png"
    if not (os.path.exists(a_p) and os.path.exists(b_p)):
        return None
    a = Image.open(a_p).convert("RGB")
    b = Image.open(b_p).convert("RGB")
    if a.size != b.size:
        return (route, "SIZE-MISMATCH", a.size, b.size, 0, [])
    # the badge region (LOC superset, top-right ~135x28 at y~79) is masked
    # BEFORE diffing only when both sides are same-size (r88 convention:
    # mask nothing — classify the badge band by cluster position instead)
    diff_img = ImageChops.difference(a, b)
    w, h = a.size
    cell = 48
    cols = w // cell
    rows = h // cell
    hot = []
    grid = diff_img.load()
    maxdelta = 0
    for cy in range(rows):
        for cx in range(cols):
            worst = 0
            for y in range(cy*cell, min((cy+1)*cell, h), 4):
                for x in range(cx*cell, min((cx+1)*cell, w), 4):
                    r, g, bl = grid[x, y]
                    d = max(r, g, bl)
                    if d > worst:
                        worst = d
            if worst > 2:
                hot.append((cx, cy, worst))
            maxdelta = max(maxdelta, worst)
    if not hot:
        return (route, "IDENTICAL" if maxdelta <= 2 else "AA-NOISE-ONLY", None, None, maxdelta, [])
    clusters = cluster_cells([(c[0], c[1]) for c in hot])
    sizes = [len(c) for c in clusters]
    worst_cluster = max(sizes)
    n_bad = sum(1 for c in hot if c[2] > 8)
    if n_bad == 0 and maxdelta <= 8:
        verdict = "AA-NOISE" if maxdelta <= 5 else "MINOR"
    elif worst_cluster >= 3 or n_bad >= 4:
        verdict = "STRUCTURAL"
    else:
        verdict = "MINOR"
    return (route, verdict, len(hot), n_bad, maxdelta, clusters)


summary = []
for r in ROUTES:
    res = diff(r)
    if res is None:
        print(f"  MISSING  {r} (pair not captured)")
        continue
    route, verdict = res[0], res[1]
    if verdict == "SIZE-MISMATCH":
        print(f"  {verdict:11} {r}: ref{res[2]} vs loc{res[3]}")
    else:
        detail = f"{res[2]} hot/{res[3]} bad/max{res[4]}" if res[2] is not None else f"max{res[4]}"
        print(f"  {verdict:11} {r:24} {detail}")
    summary.append((route, verdict))

n_ident = sum(1 for r in summary if r[1] in ("IDENTICAL", "AA-NOISE-ONLY"))
n_struct = sum(1 for r in summary if r[1] == "STRUCTURAL")
n_minor = sum(1 for r in summary if r[1] in ("MINOR", "AA-NOISE"))
print(f"\n[{STATE}] IDENTICAL: {n_ident} | MINOR/AA: {n_minor} | STRUCTURAL: {n_struct} | total {len(summary)}")
if n_struct:
    print("STRUCTURAL routes:", ", ".join(r for r, v in summary if v == "STRUCTURAL"))
