#!/usr/bin/env python3
"""r88-crop-diff.py — localize the mobile-band diff clusters: for each
route, find the diff clusters (48px grid cells) and emit a cropped
side-by-side (ref on left, loc on right) PNG per cluster so the divergent
regions can be inspected visually."""
from PIL import Image, ImageChops
import os, sys

SHOTS = "/home/z/my-project/eon-hr/docs/screenshots"
ROUTES = sys.argv[1:] or [
  "taskmanager", "staffrequests", "careers", "hrreports", "interviewassistant",
  "analyticsdashboard", "employeeselfservice", "attendancedashboard", "profile",
  "shiftcalendar", "shiftswap", "surveys", "chat", "tenantsetup", "companywall",
  "hrassistantchat", "employees", "recruitment", "reports", "evaluations",
  "advancedanalytics", "allleaverequests", "analytics", "assets",
  "compliancedashboard", "documenttracker", "employeedetail", "payrollengine",
  "recruitmentkanban", "settings", "surveyanalytics", "templates", "payroll",
  "offboarding", "workflowautomation", "workflowconfigpage", "attendance",
  "assetmanagement", "payrollreports", "communications", "announcements",
]

def cluster_cells(cells, gap=1):
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

for route in ROUTES:
    ref_p = f"{SHOTS}/r88-mobile-{route}-ref.png"
    loc_p = f"{SHOTS}/r88-mobile-{route}-loc.png"
    if not (os.path.exists(ref_p) and os.path.exists(loc_p)):
        print(f"{route}: MISSING"); continue
    a = Image.open(ref_p).convert("RGB")
    b = Image.open(loc_p).convert("RGB")
    diff = ImageChops.difference(a, b)
    W, H = a.size
    px = diff.load()
    grid = {}
    for y in range(0, H, 2):
        for x in range(0, W, 2):
            r, g, bl = px[x, y]
            if max(r, g, bl) > 2:
                grid.setdefault((x // 48, y // 48), []).append((x, y))
    cells = sorted(grid.keys())
    if not cells:
        print(f"{route}: clean")
        continue
    clusters = sorted(cluster_cells(cells), key=len, reverse=True)[:3]
    for i, cl in enumerate(clusters):
        xs = [c[0] for c in cl]; ys = [c[1] for c in cl]
        x0, y0 = max(0, min(xs)*48), max(0, min(ys)*48)
        x1, y1 = min(W, (max(xs)+1)*48), min(H, (max(ys)+1)*48)
        w = x1 - x0
        crop = Image.new("RGB", (w*2, y1-y0), "white")
        crop.paste(a.crop((x0, y0, x1, y1)), (0, 0))
        crop.paste(b.crop((x0, y0, x1, y1)), (w, 0))
        out = f"{SHOTS}/r88-crop-{route}-c{i}.png"
        crop.save(out)
        print(f"{route} cluster{i}: bbox=({x0},{y0},{x1},{y1}) cells={len(cl)} -> {out}")
