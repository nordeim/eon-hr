#!/usr/bin/env python3
# r118 bridge experiment builder — writes the a1..a4 typ variants, compiles,
# and reads the pdftotext verdicts. Usage: python3 scripts/r118-bridge-experiments.py
import subprocess, os

TYPST = "/tmp/typst-x86_64-unknown-linux-musl/typst"
D = "/tmp/r118-variants"
os.chdir(D)

EMAIL = "john.smith\\@example.com"  # typst: \@ escapes the label reference
HEAD = """#set page(width: 595pt, height: 220pt, margin: 20pt)
#set text(font: "Libertinus Serif", size: 9pt)
"""
PAIR = f"""
#place(dx: 100pt, dy: 80pt)[+1 (555) 010-9911]
#place(dx: 173.4pt, dy: 80pt)[{EMAIL}]
"""
BRIDGE_ABOVE = "#place(dx: 158pt, dy: 66pt)[BRIDGEWORD]\n"
BRIDGE_BELOW = "#place(dx: 158pt, dy: 94pt)[BRIDGEWORD]\n"

variants = {
    "a1": ("isolated pair (the SPLIT control)", PAIR),
    "a2": ("+ bridge word ABOVE the gap region", PAIR + BRIDGE_ABOVE),
    "a3": ("+ bridge word BELOW the gap region", PAIR + BRIDGE_BELOW),
    "a4": ("+ bridge words ABOVE AND BELOW", PAIR + BRIDGE_ABOVE + BRIDGE_BELOW),
}

for name, (desc, body) in variants.items():
    src = HEAD + body
    open(f"{name}.typ", "w").write(src)
    r = subprocess.run([TYPST, "compile", "--font-path", "/home/z/.cache/fonts", f"{name}.typ", f"{name}.pdf"],
                       capture_output=True, text=True)
    if r.returncode != 0:
        print(f"{name}: COMPILE FAIL: {r.stderr[:200]}")
        continue
    out = subprocess.run(["pdftotext", f"{name}.pdf", "-"], capture_output=True, text=True).stdout
    lines = out.split("\n")
    phone_lines = [i for i, l in enumerate(lines) if "010-9911" in l]
    if phone_lines:
        i = phone_lines[0]
        joined = "john.smith" in lines[i]
        print(f"{name} ({desc}): {'JOIN' if joined else 'SPLIT'}")
        for l in lines[i:i+3]:
            print(f"   {l!r}")
    else:
        print(f"{name} ({desc}): phone not found; output: {out[:200]!r}")
