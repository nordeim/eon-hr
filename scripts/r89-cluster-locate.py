#!/usr/bin/env python3
"""r89-cluster-locate.py — locate the diff clusters on a dark/rtl mobile pair,
crop them to side-by-side composites for visual triage.
Usage: python3 scripts/r89-cluster-locate.py <dark|rtl> <route> [maxclusters]"""
from PIL import Image, ImageChops, ImageDraw
import sys, os

STATE = sys.argv[1]
PREFIX = "r89-darkm" if STATE == "dark" else "r89-rtlm"
route = sys.argv[2]
maxn = int(sys.argv[3]) if len(sys.argv) > 3 else 4
SHOTS = "/home/z/my-project/eon-hr/docs/screenshots"
OUT = "/tmp/r89-clusters"

a = Image.open(f"{SHOTS}/{PREFIX}-{route}-ref.png").convert("RGB")
b = Image.open(f"{SHOTS}/{PREFIX}-{route}-loc.png").convert("RGB")
if a.size != b.size:
    print("SIZE MISMATCH", a.size, b.size); sys.exit(1)

d = ImageChops.difference(a, b)
w, h = a.size
cell = 48
cols, rows = w // cell, h // cell
hot = []
px = d.load()
for cy in range(rows):
    for cx in range(cols):
        worst = 0
        for y in range(cy*cell, min((cy+1)*cell, h), 4):
            for x in range(cx*cell, min((cx+1)*cell, w), 4):
                worst = max(worst, max(px[x, y]))
        if worst > 8:
            hot.append((cx, cy, worst))

# cluster
def cluster(cells, gap=1):
    cells = sorted(cells)
    clusters = []
    for c in cells:
        merged = False
        for cl in clusters:
            if any(abs(c[0]-d0[0]) <= gap and abs(c[1]-d0[1]) <= gap for d0 in cl):
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
                if any(abs(x[0]-y[0]) <= gap and abs(x[1]-y[1]) <= gap for x in cl for y in other):
                    other.extend(cl); absorbed = True; changed = True; break
            if not absorbed:
                out.append(cl)
        clusters = out
    return clusters

cls = cluster([(c[0], c[1]) for c in hot])
cls.sort(key=len, reverse=True)
os.makedirs(OUT, exist_ok=True)
print(f"{route}: {len(cls)} clusters, top sizes: {[len(c) for c in cls[:6]]}")
for i, cl in enumerate(cls[:maxn]):
    xs = [c[0] for c in cl]; ys = [c[1] for c in cl]
    x0, y0 = max(0, min(xs)*cell - 24), max(0, min(ys)*cell - 24)
    x1, y1 = min(w, (max(xs)+1)*cell + 24), min(h, (max(ys)+1)*cell + 24)
    cw, chh = x1-x0, y1-y0
    comp = Image.new("RGB", (cw*2+30, chh), (255, 0, 255))
    comp.paste(a.crop((x0, y0, x1, y1)), (0, 0))
    comp.paste(b.crop((x0, y0, x1, y1)), (cw+30, 0))
    out = f"{OUT}/{STATE}-{route}-c{i}.png"
    comp.save(out)
    print(f"  cluster {i}: cells={len(cl)} box=({x0},{y0})-({x1},{y1}) -> {out}")
