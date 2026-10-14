#!/usr/bin/env python3
"""diff-r38-bands.py — localize the mobile pair's pixel diffs by row bands."""
from PIL import Image, ImageChops

SHOTS = "/home/z/my-project/eon-hr/docs/screenshots"

for ref, loc in [("145-ref-login-mobile", "145b-loc-login-mobile"),
                 ("147-ref-login-links-mobile", "147b-loc-login-links-mobile")]:
    a = Image.open(f"{SHOTS}/{ref}.png").convert("RGB")
    b = Image.open(f"{SHOTS}/{loc}.png").convert("RGB")
    diff = ImageChops.difference(a, b).convert("L")
    w, h = diff.size
    print(f"\n=== {ref} ({w}x{h}) row bands (40px) ===")
    px = diff.load()
    for y0 in range(0, h, 40):
        cnt = 0
        for y in range(y0, min(y0 + 40, h)):
            for x in range(w):
                if px[x, y] > 20:
                    cnt += 1
        band_total = 40 * w
        if cnt > 0:
            print(f"  y={y0}-{y0+40}: {100.0*cnt/band_total:.1f}% strong-diff")
