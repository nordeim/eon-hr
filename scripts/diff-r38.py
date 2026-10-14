#!/usr/bin/env python3
"""diff-r38.py — pixel-diff the round-38 screenshot pairs (the round-37
forensic convention: the baseline band is ~1.1-1.6%)."""
from PIL import Image, ImageChops
import sys

SHOTS = "/home/z/my-project/eon-hr/docs/screenshots"
PAIRS = [
    ("144-ref-login-desktop", "144b-loc-login-desktop"),
    ("145-ref-login-mobile", "145b-loc-login-mobile"),
    ("146-ref-login-placeholder-glow", "146b-loc-login-placeholder-glow"),
    ("147-ref-login-links-mobile", "147b-loc-login-links-mobile"),
]

for ref, loc in PAIRS:
    a = Image.open(f"{SHOTS}/{ref}.png").convert("RGB")
    b = Image.open(f"{SHOTS}/{loc}.png").convert("RGB")
    if a.size != b.size:
        print(f"{ref}: SIZE DIFF {a.size} vs {b.size}")
        continue
    diff = ImageChops.difference(a, b)
    bbox = diff.getbbox()
    hist = diff.convert("L").histogram()
    total = a.size[0] * a.size[1]
    changed = sum(hist[8:])  # pixels with >3% channel delta (the r37 tolerance)
    pct = 100.0 * changed / total
    print(f"{ref}: {pct:.2f}% changed-pixels, bbox={bbox}")
