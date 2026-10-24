#!/usr/bin/env python3
"""r88-diff.py — session-88 / parity round 87: the cross-side at-rest
pixel-diff over this round's target routes (the r87 instrument class,
r88-capture naming). Same classification: PIL grid diff (48px cells,
channel threshold 8), AA-NOISE (max delta <= 2) / MINOR (3-8, few cells) /
STRUCTURAL (any delta > 8 with contiguous cells)."""
from PIL import Image, ImageChops
import os, sys

SHOTS = "/home/z/my-project/eon-hr/docs/screenshots"
ROUTES = ["surveyanalytics", "attendancedashboard", "tenantsetup", "reports", "hrreports", "shiftswap", "companywall"]
if len(sys.argv) > 1:
    ROUTES = sys.argv[1:]

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
    return clusters

for route in ROUTES:
    a = os.path.join(SHOTS, f"r88-crossdiff-{route}-ref.png")
    b = os.path.join(SHOTS, f"r88-crossdiff-{route}-loc.png")
    if not (os.path.exists(a) and os.path.exists(b)):
        print(f"{route}: MISSING pair"); continue
    ia, ib = Image.open(a).convert("RGB"), Image.open(b).convert("RGB")
    if ia.size != ib.size:
        print(f"{route}: SIZE MISMATCH ref={ia.size} loc={ib.size}"); continue
    w, h = ia.size
    diff = ImageChops.difference(ia, ib)
    pa = diff.load()
    # 48px grid, channel threshold
    cells = {}
    maxd = 0
    for y in range(0, h, 48):
        for x in range(0, w, 48):
            worst = 0
            for yy in range(y, min(y+48, h), 4):
                for xx in range(x, min(x+48, w), 4):
                    r, g, bl = pa[xx, yy]
                    worst = max(worst, r, g, bl)
            if worst > 2:
                cells[(x//48, y//48)] = worst
            maxd = max(maxd, worst)
    n = len(cells)
    if n == 0:
        print(f"{route}: CLEAN (maxdelta {maxd}) — AA-NOISE floor"); continue
    clusters = cluster_cells(list(cells.keys()))
    structural = [cl for cl in clusters if max(cells[c] for c in cl) > 8 and len(cl) >= 1]
    summary = "; ".join(f"({cl[0][0]*48},{cl[0][1]*48})+{len(cl)}cells max{max(cells[c] for c in cl)}" for cl in clusters[:8])
    if any(max(cells[c] for c in cl) > 8 for cl in clusters):
        print(f"{route}: STRUCTURAL — {n} cells, maxdelta {maxd} | {summary}")
    else:
        print(f"{route}: MINOR/AA — {n} cells, maxdelta {maxd} | {summary}")
