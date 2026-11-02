#!/usr/bin/env python3
# r118 experiments B (column structure) + C (font-size dependence).
# B: does a multi-row column-aligned structure keep big-gap words joined
#    (the Prawn table shape) where a single row splits?
# C: does the split boundary scale with font size (fontSize-relative ~1em)
#    or stay absolute (~9pt)?
import subprocess, os

TYPST = "/tmp/typst-x86_64-unknown-linux-musl/typst"
D = "/tmp/r118-variants"
os.chdir(D)

def compile_and_verdict(name, src):
    open(f"{name}.typ", "w").write(src)
    r = subprocess.run([TYPST, "compile", "--font-path", "/home/z/.cache/fonts", f"{name}.typ", f"{name}.pdf"],
                       capture_output=True, text=True)
    if r.returncode != 0:
        print(f"{name}: COMPILE FAIL: {r.stderr[:300]}")
        return None
    out = subprocess.run(["pdftotext", f"{name}.pdf", "-"], capture_output=True, text=True).stdout
    return out

def verdict(out, probe):
    lines = out.split("\n")
    idx = [i for i, l in enumerate(lines) if probe in l]
    if not idx:
        return f"PROBE-NOT-FOUND: {out[:120]!r}"
    i = idx[0]
    return "JOIN" if "ZZZ" in lines[i] else "SPLIT"

# --- B: column structure at big gaps (85pt = 9.4em at 9pt) ---
# single row: AAA [85pt gap] ZZZ  -> isolated big-gap pair
b1 = """#set page(width: 595pt, height: 220pt, margin: 20pt)
#set text(font: "Libertinus Serif", size: 9pt)
#place(dx: 40pt, dy: 80pt)[AAA]
#place(dx: 160pt, dy: 80pt)[ZZZ]
"""
# three rows, columns aligned (the table shape)
b2 = """#set page(width: 595pt, height: 220pt, margin: 20pt)
#set text(font: "Libertinus Serif", size: 9pt)
#place(dx: 40pt, dy: 40pt)[AAA]
#place(dx: 160pt, dy: 40pt)[BBB]
#place(dx: 280pt, dy: 40pt)[CCC]
#place(dx: 40pt, dy: 80pt)[DDD]
#place(dx: 160pt, dy: 80pt)[ZZZ]
#place(dx: 280pt, dy: 80pt)[FFF]
#place(dx: 40pt, dy: 120pt)[GGG]
#place(dx: 160pt, dy: 120pt)[HHH]
#place(dx: 280pt, dy: 120pt)[III]
"""
# --- C: font-size dependence; pair with a mid gap, two font sizes ---
def c_pair(size, gap):
    return f"""#set page(width: 595pt, height: 220pt, margin: 20pt)
#set text(font: "Libertinus Serif", size: {size}pt)
#place(dx: 40pt, dy: 80pt)[NNN MMM]
#place(dx: {40 + 70 + gap}pt, dy: 80pt)[ZZZ]
"""

for name, src, probe in [
    ("b1", b1, "AAA"),
    ("b2", b2, "DDD"),
]:
    out = compile_and_verdict(name, src)
    if out is not None:
        print(f"{name}: {verdict(out, probe)}")
        for l in out.split("\n")[:8]:
            if l.strip():
                print(f"   {l!r}")

# C: bisect the gap at font 9pt and font 18pt
for size in (9, 18):
    results = []
    for gap in (6, 8, 10, 12, 14, 16, 18, 20):
        name = f"c{size}g{gap}"
        out = compile_and_verdict(name, c_pair(size, gap))
        if out is None:
            results.append((gap, "FAIL"))
            continue
        results.append((gap, verdict(out, "NNN")))
    print(f"font {size}pt gap sweep: {results}")
