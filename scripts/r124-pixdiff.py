#!/usr/bin/env python3
# r124-pixdiff.py — the REF-vs-clone pixel diffs for the r124 opening read
# (login pair + dashboard pair at 1280x800). Reports the differing-pixel
# count + ratio; <=0.05% is the standing parity bar (the r122 login island
# landed at 0.0214%, the dashboard at 1 pixel).
import sys
from PIL import Image, ImageChops

pairs = [
    ("/tmp/r124-ref-login.png", "docs/screenshots/r124-loc-login.png", "LOGIN"),
    ("/tmp/r124-ref-dashboard.png", "docs/screenshots/r124-loc-dashboard.png", "DASHBOARD"),
]
for ref, loc, name in pairs:
    a, b = Image.open(ref).convert("RGB"), Image.open(loc).convert("RGB")
    if a.size != b.size:
        print(f"{name}: SIZE MISMATCH {a.size} vs {b.size}")
        continue
    diff = ImageChops.difference(a, b)
    bbox = diff.getbbox()
    px = sum(1 for p in diff.getdata() if any(c > 8 for c in p))
    total = a.size[0] * a.size[1]
    print(f"{name}: {px} differing pixels of {total} ({px/total*100:.4f}%) bbox={bbox}")
