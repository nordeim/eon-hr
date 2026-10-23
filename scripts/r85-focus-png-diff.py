#!/usr/bin/env python3
"""r85-focus-png-diff.py — localize the differing pixels between the
ref/loc focused-social-button login screenshots (1440x900). The r85
keyboard round's cross-side pixel-diff instrument (the program's FIRST
REF<->LOC pixel comparison). Prints the bounding boxes of diff clusters
+ sample differing pixels, so the delta can be classified (the focus
ring region vs the badge region vs other)."""
from PIL import Image, ImageChops

REF = "/home/z/my-project/eon-hr/docs/screenshots/r85-focus-social-ref.png"
LOC = "/home/z/my-project/eon-hr/docs/screenshots/r85-focus-social-loc.png"

a = Image.open(REF).convert("RGB")
b = Image.open(LOC).convert("RGB")
print("sizes:", a.size, b.size)

diff = ImageChops.difference(a, b)
print("diff bbox:", diff.getbbox())

W, H = a.size
px = diff.load()
grid = {}
threshold = 8
for y in range(0, H, 2):
    for x in range(0, W, 2):
        r, g, bl = px[x, y]
        if r > threshold or g > threshold or bl > threshold:
            cell = (x // 48, y // 48)
            grid.setdefault(cell, []).append((x, y, (r, g, bl)))

cells = sorted(grid.keys())
print(f"differing 48px cells: {len(cells)}")
for (cx, cy) in cells[:15]:
    n = len(grid[(cx, cy)])
    sample = grid[(cx, cy)][0]
    print(f"  cell x{cx*48}-{cx*48+48} y{cy*48}-{cy*48+48}: n={n} sample-delta={sample[2]}")

for label, (x, y) in [("google-ring-top", (546, 309)), ("badge-region", (1400, 860))]:
    print(f"{label}: ref={a.getpixel((x, y))} loc={b.getpixel((x, y))}")
