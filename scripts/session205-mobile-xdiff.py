#!/usr/bin/env python3
"""session-205 mobile-menu cross-side pixel diff — REF (eon.base44.app)
vs LOC (localhost:3000) captures at 390x844, following the r86 grid-diff
protocol (48px cells, channel threshold 8, AA-NOISE/MINOR/STRUCTURAL)."""
from PIL import Image, ImageChops
import os, sys

CAP = "/tmp/ref-captures"

PAIRS = [
    ("dash-mobile", "mobile dashboard at-rest"),
    ("mobile-menu-open", "mobile menu open (drawer)"),
    ("mobile-menu-employees-expanded", "mobile menu w/ Employees group expanded"),
    ("mobile-training-after-nav", "mobile /training after menu navigation"),
]

def grid_diff(a_path, b_path, cell=48, thr=8):
    a = Image.open(a_path).convert("RGB")
    b = Image.open(b_path).convert("RGB")
    if a.size != b.size:
        return None, f"size mismatch {a.size} vs {b.size}"
    w, h = a.size
    diff = ImageChops.difference(a, b)
    px = diff.load()
    hot = set()
    max_delta = 0
    for y in range(0, h, cell):
        for x in range(0, w, cell):
            # sample the cell's center + corners
            for sx, sy in ((x+cell//2, min(y+cell//2, h-1)), (x+2, y+2),
                           (min(x+cell-2, w-1), y+2), (x+2, min(y+cell-2, h-1)),
                           (min(x+cell-2, w-1), min(y+cell-2, h-1))):
                r, g, bl = px[min(sx, w-1), min(sy, h-1)]
                d = max(r, g, bl)
                if d > max_delta:
                    max_delta = d
                if d > thr:
                    hot.add((x//cell, y//cell))
                    break
    return {"hot_cells": len(hot), "max_delta": max_delta,
            "cells": sorted(hot)}, None

for name, desc in PAIRS:
    ref_p = f"{CAP}/ref-{name}.png"
    loc_p = f"{CAP}/loc-{name}.png"
    if not (os.path.exists(ref_p) and os.path.exists(loc_p)):
        print(f"[skip] {name}: missing capture")
        continue
    res, err = grid_diff(ref_p, loc_p)
    if err:
        print(f"[{name}] ({desc}): ERROR {err}")
        continue
    cls = "AA-NOISE" if res["max_delta"] <= 2 else ("MINOR" if res["max_delta"] <= 8 else "STRUCTURAL")
    print(f"[{name}] ({desc}): {res['hot_cells']} hot cells, max delta {res['max_delta']} -> {cls}")
    if res["hot_cells"] and res["hot_cells"] <= 30:
        print(f"    cells: {res['cells'][:30]}")
