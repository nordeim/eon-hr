#!/usr/bin/env python3
"""diff-r40-hero.py — pixel-diff the careers hero mobile pair (the round-39
deferred frontier), clipped to the hero region (top 540px — above REF's
first chip at y=547). Baseline band convention: ~1.1-1.6%."""
from PIL import Image, ImageChops

SHOTS = "/home/z/my-project/eon-hr/docs/screenshots"
CLIP_H = 540

a = Image.open(f"{SHOTS}/r40-hero-ref.png").convert("RGB")
b = Image.open(f"{SHOTS}/r40-hero-loc.png").convert("RGB")
print(f"ref size={a.size} loc size={b.size}")
if a.size != b.size:
    print("SIZE DIFF — aborting")
    raise SystemExit(1)

a = a.crop((0, 0, a.size[0], CLIP_H))
b = b.crop((0, 0, b.size[0], CLIP_H))
diff = ImageChops.difference(a, b)
bbox = diff.getbbox()
hist = diff.convert("L").histogram()
total = a.size[0] * a.size[1]
changed = sum(hist[8:])  # >3% channel delta (the r37 tolerance)
pct = 100.0 * changed / total
print(f"careers hero (top {CLIP_H}px): {pct:.2f}% changed-pixels, bbox={bbox}")

# band analysis: which 40px rows carry the differences
for y0 in range(0, CLIP_H, 40):
    band = diff.crop((0, y0, a.size[0], min(y0 + 40, CLIP_H))).convert("L")
    h = band.histogram()
    ch = sum(h[8:])
    bp = 100.0 * ch / (a.size[0] * 40)
    if bp > 0.05:
        print(f"  rows {y0}-{y0+40}: {bp:.2f}%")
