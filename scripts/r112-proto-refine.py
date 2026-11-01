#!/usr/bin/env python3
# r112-proto-refine.py — the guard refinements on the prototype:
#   1. FIRST-ascent boundary (not "exactly one" — the flow may contain its
#      own later ascents [the Skia skills column-count]; the suffix is
#      never reordered, so later ascents are irrelevant);
#   2. guard (f): the suffix's second piece must continue the flow
#      (step2 >= -75 — the QUARTZ stray top-edge glyph drops -222);
#   3. guard (g): pieces riding the BT-default/unset line matrix (no Tm
#      nor Td since BT — the IRS XFA-XML garbage class) are UNPOSITIONED.
import sys

P = "/tmp/r112-proto/cv-text.ts"
src = open(P).read()

def rep(old, new, count=1):
    global src
    assert src.count(old) == count, f"anchor not unique/exact ({src.count(old)}): {old[:90]!r}"
    src = src.replace(old, new)

# (g) part 1: the explicit flag lives next to tlm
rep(
    "  let tlm: Mat = [1, 0, 0, 1, 0, 0];\n  const curPos = (): { px: number; py: number; ps: number } | null => {\n    const e = mul(ctm, tlm);",
    "  let tlm: Mat = [1, 0, 0, 1, 0, 0];\n  let tlmExplicit = false; // a Tm/Td placed the line matrix since the stream start / the last BT?\n  const curPos = (): { px: number; py: number; ps: number } | null => {\n    if (!tlmExplicit) return null; // the BT-default origin — not a layout position\n    const e = mul(ctm, tlm);",
)

# (g) part 2: Td marks explicit
rep(
    "      tlm = mul(tlm, [1, 0, 0, 1, tx, ty]); // R112-A: the line origin moves",
    "      tlm = mul(tlm, [1, 0, 0, 1, tx, ty]); // R112-A: the line origin moves\n      tlmExplicit = true;",
)

# (g) part 3: BT resets the flag
rep(
    "      tlm = [1, 0, 0, 1, 0, 0]; // R112-A: BT resets the text-line matrix (PDF §9.4.1)",
    "      tlm = [1, 0, 0, 1, 0, 0]; // R112-A: BT resets the text-line matrix (PDF §9.4.1)\n      tlmExplicit = false;",
)

# (g) part 4: Tm marks explicit
rep(
    "      tlm = [a, b, c, d, e, f]; // R112-A: Tm sets the line matrix verbatim",
    "      tlm = [a, b, c, d, e, f]; // R112-A: Tm sets the line matrix verbatim\n      tlmExplicit = true;",
)

# 1 + 2: the signature — first ascent, step2 guard, drop exactly-one
rep(
    """  let ascentAt = -1;
  for (let i = 0; i + 1 < n; i++) {
    if (pieces[i + 1].py! - pieces[i].py! >= HOIST_ASCENT) {
      if (ascentAt !== -1) return pieces;
      ascentAt = i;
    }
  }
  if (ascentAt === -1) return pieces;
  const k = ascentAt + 1; // the suffix starts here
  if (k > n / 2) return pieces; // (d) the minority guard""",
    """  // (b): the FIRST clear ascent bounds the prefix. Later ascents inside
  // the suffix are irrelevant — the suffix never reorders (the Chromium
  // specimen's own skills section is column-count-2: its column break is
  // a later ascent that must not veto the repair).
  let ascentAt = -1;
  for (let i = 0; i + 1 < n; i++) {
    if (pieces[i + 1].py! - pieces[i].py! >= HOIST_ASCENT) {
      ascentAt = i;
      break;
    }
  }
  if (ascentAt === -1) return pieces;
  const k = ascentAt + 1; // the suffix starts here
  if (k > n / 2) return pieces; // (d) the minority guard
  // (f): the suffix must CONTINUE the flow — its second piece within a
  // normal step of its first (>= -75). The QUARTZ stray: a lone
  // top-edge-clipped glyph at the ascent, dropping -222 back into the
  // page — pdftotext reads it in stream order and so must we.
  if (k + 1 >= n || pieces[k + 1].py! - pieces[k].py! < -3 * HOIST_ASCENT) return pieces;""",
)

open(P, "w").write(src)
print("proto refined")
