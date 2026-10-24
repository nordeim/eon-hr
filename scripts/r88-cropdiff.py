#!/usr/bin/env python3
"""r88-cropdiff.py — crop-level pixel diff on the target regions (the
fine-grained localization pass — 8px grid, both directions)."""
from PIL import Image, ImageChops
import sys

SHOTS = "/home/z/my-project/eon-hr/docs/screenshots"

def cropdiff(route, box, label):
    a = Image.open(f"{SHOTS}/r88-crossdiff-{route}-ref.png").convert("RGB").crop(box)
    b = Image.open(f"{SHOTS}/r88-crossdiff-{route}-loc.png").convert("RGB").crop(box)
    if a.size != b.size:
        print(f"{route}/{label}: SIZE MISMATCH {a.size} vs {b.size}"); return
    diff = ImageChops.difference(a, b)
    pa = diff.load()
    w, h = a.size
    # find the tight bbox of any delta > 8
    minx, miny, maxx, maxy, maxd = w, h, -1, -1, 0
    rows = {}
    for y in range(h):
        rowmax = 0
        for x in range(w):
            r, g, bl = pa[x, y]
            d = max(r, g, bl)
            if d > 8:
                minx, miny, maxx, maxy = min(minx, x), min(miny, y), max(maxx, x), max(maxy, y)
                rowmax = max(rowmax, d)
                maxd = max(maxd, d)
        if rowmax > 8:
            rows[y] = rowmax
    if maxx == -1:
        print(f"{route}/{label}: CLEAN (max<=8)"); return
    # summarize the row bands
    bands = []
    start = None
    prev = None
    for y in sorted(rows):
        if start is None: start = y
        elif y != prev + 1:
            bands.append((start, prev, max(rows[b] for b in range(start, prev+1))))
            start = y
        prev = y
    if start is not None: bands.append((start, prev, max(rows[b] for b in range(start, prev+1))))
    print(f"{route}/{label}: bbox=({minx},{miny})-({maxx},{maxy}) maxdelta={maxd} | bands: " +
          "; ".join(f"y{box[1]+s0}-{box[1]+s1} max{m}" for s0, s1, m in bands[:10]))

# attendancedashboard
cropdiff("attendancedashboard", (860, 30, 1420, 100), "header-right")
cropdiff("attendancedashboard", (280, 370, 820, 650), "chart1")
cropdiff("attendancedashboard", (860, 370, 1400, 650), "chart2")
cropdiff("attendancedashboard", (280, 660, 1420, 900), "table-card")
# reports
cropdiff("reports", (280, 190, 1420, 300), "tabs-row")
cropdiff("reports", (280, 300, 1420, 560), "card1")
cropdiff("reports", (280, 700, 1420, 900), "filters-card")
# surveyanalytics (the chart cards)
cropdiff("surveyanalytics", (280, 300, 840, 650), "chart1-card")
cropdiff("surveyanalytics", (860, 300, 1420, 650), "chart2-card")
cropdiff("surveyanalytics", (280, 660, 1420, 900), "chart3-card")
