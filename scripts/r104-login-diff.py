#!/usr/bin/env python3
"""r104 login deploy pixel-diff audit: compare the fresh 68th-state login
capture (r104-probe-login-ref.png) against the standing r101 baseline
(r101-probe-login-ref.png) member by member — bounding boxes of changed
regions, per-row/col change profiles, and a side-by-side diff image for the
evidence chain."""
from PIL import Image, ImageChops
import os

REPO = "/home/z/my-project/eon-hr"
NEW = f"{REPO}/docs/screenshots/r104-probe-login-ref.png"
BASE = f"{REPO}/docs/screenshots/r101-probe-login-ref.png"

new = Image.open(NEW).convert("RGB")
base = Image.open(BASE).convert("RGB")
print(f"new : {new.size}")
print(f"base: {base.size}")

if new.size != base.size:
    print("SIZE MISMATCH — resizing base to new for member comparison")
    base = base.resize(new.size)

diff = ImageChops.difference(new, base)
bbox = diff.getbbox()
print(f"changed bbox: {bbox}")

if bbox:
    # count changed pixels
    px = diff.load()
    changed = 0
    rows = {}
    cols = {}
    for y in range(diff.height):
        for x in range(diff.width):
            r, g, b = px[x, y]
            if r > 8 or g > 8 or b > 8:  # tolerance for png rendering noise
                changed += 1
                rows[y] = rows.get(y, 0) + 1
                cols[x] = cols.get(x, 0) + 1
    total = diff.width * diff.height
    print(f"changed pixels (>8 tol): {changed} / {total} = {100.0*changed/total:.3f}%")
    # top changed rows
    top_rows = sorted(rows.items(), key=lambda kv: -kv[1])[:12]
    print("top changed rows (y: count):", top_rows)
    top_cols = sorted(cols.items(), key=lambda kv: -kv[1])[:12]
    print("top changed cols (x: count):", top_cols)
    # sample the strongest change colors
    from collections import Counter
    cc = Counter()
    for (x, y) in [(x, y) for y in range(bbox[1], min(bbox[3], bbox[1]+400), 7) for x in range(bbox[0], min(bbox[2], bbox[0]+400), 7)]:
        r, g, b = px[x, y]
        if r > 8 or g > 8 or b > 8:
            cc[f"new={new.load()[x,y]} base={base.load()[x,y]}"] += 1
    for k, v in cc.most_common(8):
        print("  ", k, v)
    # save side-by-side for the evidence chain
    w, h = new.size
    side = Image.new("RGB", (w * 2 + 10, h), (255, 0, 255))
    side.paste(base, (0, 0))
    side.paste(new, (w + 10, 0))
    side.save(f"{REPO}/docs/screenshots/r104-login-deploy-diff-side-by-side.png")
    print("saved: docs/screenshots/r104-login-deploy-diff-side-by-side.png")
else:
    print("NO CHANGED REGION — images effectively identical (noise-only bytes)")
