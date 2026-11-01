#!/usr/bin/env python3
# r112-port-proto.py — apply the R112-A prototype (the hoist repair) to
# /tmp/r112-proto/cv-text.ts. Surgical anchors; every replace asserts.
import re, sys

P = "/tmp/r112-proto/cv-text.ts"
src = open(P).read()

def rep(old, new, count=1):
    global src
    assert src.count(old) == count, f"anchor not unique/exact ({src.count(old)}): {old[:90]!r}"
    src = src.replace(old, new)

# 1. TextPiece gains the device-position fields
rep(
    'type TextPiece = { sep: string; font?: string; condGap?: boolean } & ({ kind: "lit"; text: string; raw?: string } | { kind: "hex"; hex: string });',
    'type TextPiece =\n  { sep: string; font?: string; condGap?: boolean; px?: number; py?: number; ps?: number }\n  & ({ kind: "lit"; text: string; raw?: string } | { kind: "hex"; hex: string });',
)

# 2. the affine tracker, before the position state
rep(
    "  // The position state, per the R100-A rule:",
    """  // R112-A: the DEVICE-SPACE position tracker — the hoist repair's eyes.
  // Maintains the CTM (cm concatenation — the operand applies BEFORE the
  // standing transform, empirically pinned on the Chromium specimen — with
  // a q/Q stack) and the text-line matrix (BT resets to identity, Tm sets
  // it, Td composes its translation inside it). Every show stamps its
  // device-space origin (px, py) + device font size (ps). Y is exact
  // (only Td/Tm/T* move the baseline); X carries the show-width drift
  // (the two-pass per-letter width table stays the standing deferred
  // item) — adequate for the same-line tiebreak, never anything finer.
  // A rotated/sheared composed matrix (the IRS sideways labels) returns
  // null and the piece goes unpositioned — the repair never fires on it.
  type Mat = [number, number, number, number, number, number];
  const mul = (m1: Mat, m2: Mat): Mat => [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ];
  let ctm: Mat = [1, 0, 0, 1, 0, 0];
  const ctmStack: Mat[] = [];
  let tlm: Mat = [1, 0, 0, 1, 0, 0];
  const curPos = (): { px: number; py: number; ps: number } | null => {
    const e = mul(ctm, tlm);
    if (Math.abs(e[1]) > 0.01 || Math.abs(e[2]) > 0.01) return null; // rotated/sheared
    const ps = Math.abs(e[3]) * effSize;
    if (!Number.isFinite(ps) || ps <= 0) return null;
    return { px: e[4], py: e[5], ps };
  };

  // The position state, per the R100-A rule:""",
)

# 3. push() stamps the position
rep(
    "    if (pieces.length === 0) sep = \"\"; // no leading separator on the first piece\n    pieces.push({ sep, font: curFont, ...(condGap ? { condGap: true } : {}), ...piece });",
    "    if (pieces.length === 0) sep = \"\"; // no leading separator on the first piece\n    const pos = curPos();\n    pieces.push({ sep, font: curFont, ...(pos ?? {}), ...(condGap ? { condGap: true } : {}), ...piece });",
)

# 4. the literal next-line show stamps too
rep(
    '        pieces.push({ sep: pieces.length === 0 ? "" : "\\n", font: curFont, kind: "lit", text, raw: rawText });',
    '        const pos = curPos();\n        pieces.push({ sep: pieces.length === 0 ? "" : "\\n", font: curFont, kind: "lit", text, raw: rawText, ...(pos ?? {}) });',
)

# 5. the hex next-line show stamps too
rep(
    '        pieces.push({ sep: pieces.length === 0 ? "" : "\\n", font: curFont, kind: "hex", hex });',
    '        const pos = curPos();\n        pieces.push({ sep: pieces.length === 0 ? "" : "\\n", font: curFont, kind: "hex", hex, ...(pos ?? {}) });',
)

# 6. Td composes into tlm (first statement of the Td handler)
rep(
    "    if (m[2] !== undefined) {\n      const tx = parseFloat(m[2]);\n      const ty = parseFloat(m[3]);",
    "    if (m[2] !== undefined) {\n      const tx = parseFloat(m[2]);\n      const ty = parseFloat(m[3]);\n      tlm = mul(tlm, [1, 0, 0, 1, tx, ty]); // R112-A: the line origin moves",
)

# 7. BT resets tlm
rep(
    "      btFresh = true;\n      tmInRun = false;\n      freshTdTaken = false;\n      continue;",
    "      btFresh = true;\n      tmInRun = false;\n      freshTdTaken = false;\n      tlm = [1, 0, 0, 1, 0, 0]; // R112-A: BT resets the text-line matrix (PDF §9.4.1)\n      continue;",
)

# 8. the regex gains cm + q + Q
rep(
    "(-?[\\d.]+)\\s+(-?[\\d.]+)\\s+(-?[\\d.]+)\\s+(-?[\\d.]+)\\s+(-?[\\d.]+)\\s+(-?[\\d.]+)\\s+Tm/g;",
    "(-?[\\d.]+)\\s+(-?[\\d.]+)\\s+(-?[\\d.]+)\\s+(-?[\\d.]+)\\s+(-?[\\d.]+)\\s+(-?[\\d.]+)\\s+Tm|(-?[\\d.]+)\\s+(-?[\\d.]+)\\s+(-?[\\d.]+)\\s+(-?[\\d.]+)\\s+(-?[\\d.]+)\\s+(-?[\\d.]+)\\s+cm|\\bq\\b|\\bQ\\b/g;",
)

# 9. the walk handlers for cm/q/Q (before the literal-show handler)
rep(
    "    if (m[4] !== undefined) {",
    """    if (m[15] !== undefined) {
      // R112-A: cm CONCATENATES — the operand applies before the standing
      // transform (CTM' = CTM x M; pinned on the Chromium flip+scale stack)
      ctm = mul(ctm, [
        parseFloat(m[15]), parseFloat(m[16]), parseFloat(m[17]),
        parseFloat(m[18]), parseFloat(m[19]), parseFloat(m[20]),
      ]);
      continue;
    }
    if (m[0] === "q") {
      if (ctmStack.length < 256) ctmStack.push(ctm); // R112-A: bounded — an adversarial stream cannot grow it forever
      continue;
    }
    if (m[0] === "Q") {
      const prevCtm = ctmStack.pop();
      if (prevCtm) ctm = prevCtm;
      continue;
    }
    if (m[4] !== undefined) {""",
)

# 10. the Tm handler updates tlm
rep(
    "      const axisAligned = Math.abs(b) < 0.01 && Math.abs(c) < 0.01 && Math.abs(a) > 0.01 && Math.abs(d) > 0.01;\n      reset();",
    "      const axisAligned = Math.abs(b) < 0.01 && Math.abs(c) < 0.01 && Math.abs(a) > 0.01 && Math.abs(d) > 0.01;\n      tlm = [a, b, c, d, e, f]; // R112-A: Tm sets the line matrix verbatim\n      reset();",
)

# 11. the repair function after pdfTextPieces's close
rep(
    "/** Concatenated text from a PDF's inflated content streams ((…) Tj / TJ arrays / hex strings). */",
    """// R112-A: the HOISTED-PREFIX REPAIR — the Chromium/Skia print pipeline (the
// 17th writer family) paints FLOATED boxes before the in-flow content, so
// the stream order reads every float first regardless of its layout
// position (a right-floated date column hoists above the name; pdftotext
// emits the merged reading order). The repair re-merges the hoisted run
// when — and only when — the full signature fires:
//   (a) every piece carries a device position (axis-aligned matrices);
//   (b) exactly ONE clear ascent (>= 25 device units) in the y sequence —
//       the jump back to the main flow's top (two ascents = not the shape);
//   (c) the suffix's first y sits ABOVE every hoisted piece by the margin —
//       the main flow starts at the page top. A 2-column layout's second
//       column starts at the SAME height as the first: the guard blocks it
//       (the column must keep its stream order — pdftotext reads it that
//       way too);
//   (d) the hoisted run is a MINORITY of the stream's pieces (a column is
//       ~half; a float run is a handful).
// The merge: the prefix (stream order, stably) merges into the UNTOUCHED
// suffix; a prefix piece drains in when it sits above the suffix head, or
// same-line (0.35 em tolerance) with a smaller x. Relocated BLOCK HEADS
// (the run's first piece, or a new y / a backwards x within the run)
// carry "\\n" seps; glyph continuations keep theirs; the output's first
// piece normalizes to "".
const HOIST_ASCENT = 25;
function repairHoistedPrefix(pieces: TextPiece[]): TextPiece[] {
  const n = pieces.length;
  if (n < 4) return pieces;
  if (!pieces.every((p) => p.px !== undefined && p.py !== undefined && p.ps !== undefined)) return pieces;
  let ascentAt = -1;
  for (let i = 0; i + 1 < n; i++) {
    if (pieces[i + 1].py! - pieces[i].py! >= HOIST_ASCENT) {
      if (ascentAt !== -1) return pieces;
      ascentAt = i;
    }
  }
  if (ascentAt === -1) return pieces;
  const k = ascentAt + 1; // the suffix starts here
  if (k > n / 2) return pieces; // (d) the minority guard
  const suffixTop = pieces[k].py!;
  const prefixTop = Math.max(...pieces.slice(0, k).map((p) => p.py!));
  if (suffixTop <= prefixTop + HOIST_ASCENT) return pieces; // (c) the flow starts above every float
  // the block heads within the prefix: the first piece, or a new y / a
  // backwards x relative to the previous prefix piece
  const head = new Set<number>([0]);
  for (let i = 1; i < k; i++) {
    const eps = 0.35 * Math.max(pieces[i - 1].ps!, pieces[i].ps!);
    if (Math.abs(pieces[i].py! - pieces[i - 1].py!) > eps || pieces[i].px! < pieces[i - 1].px! - eps) head.add(i);
  }
  const out: TextPiece[] = [];
  let pi = 0;
  for (let si = k; si < n; si++) {
    const s = pieces[si];
    while (pi < k) {
      const p = pieces[pi];
      const eps = 0.35 * Math.max(p.ps!, s.ps!);
      const dy = p.py! - s.py!;
      if (dy > eps || (dy >= -eps && p.px! < s.px!)) {
        out.push(pi === 0 || head.has(pi) ? { ...p, sep: "\\n" } : p);
        pi++;
      } else break;
    }
    out.push(s);
  }
  while (pi < k) {
    out.push(pi === 0 || head.has(pi) ? { ...pieces[pi], sep: "\\n" } : pieces[pi]);
    pi++;
  }
  if (out.length && out[0].sep !== "") out[0] = { ...out[0], sep: "" };
  return out;
}

/** Concatenated text from a PDF's inflated content streams ((…) Tj / TJ arrays / hex strings). */""",
)

# 12. wire the repair into the assembly
rep(
    "  const parts = pending.map(({ objNum, pieces }) => {",
    "  const parts = pending.map(({ objNum, pieces: rawPieces }) => {\n    const pieces = repairHoistedPrefix(rawPieces); // R112-A",
)

open(P, "w").write(src)
print("proto patched OK")
