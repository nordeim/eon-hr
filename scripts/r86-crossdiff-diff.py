#!/usr/bin/env python3
"""r86-crossdiff-diff.py — session-86 / parity round 85: the cross-side
at-rest pixel-diff pass (the program's FIRST REF<->LOC pixel protocol at
scale — the r85 focused-pair instrument class extended to the standing
route set). For each captured pair: PIL grid diff (48px cells, channel
threshold 8), reporting (a) the differing-cell count, (b) the bounding
boxes of diff clusters, (c) the max channel delta, and (d) the
classification: AA-NOISE (max delta <= 2 on all sampled pixels —
subpixel resampling class), MINOR (3-8), or STRUCTURAL (any delta > 8
with contiguous cells). The r85 precedent: the focused pair's post-fix
residual = 6 AA-noise cells; the login logo's residual = ~46 px of
+/-1-channel noise (classified below the parity bar)."""
from PIL import Image, ImageChops
import os, sys

SHOTS = "/home/z/my-project/eon-hr/docs/screenshots"
ROUTES = ["login", "dashboard", "payroll", "employees", "attendance",
          "training", "recruitment", "settings", "assetmanagement", "payrollreports"]

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
    # merge pass (a cell may bridge clusters added earlier)
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
    ref_p = f"{SHOTS}/r86-crossdiff-{route}-ref.png"
    loc_p = f"{SHOTS}/r86-crossdiff-{route}-loc.png"
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
    # largest cluster bbox
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
    print(f"  {route:16s} {verdict:16s} cells={ncells:4d} maxdelta={maxdelta}")
