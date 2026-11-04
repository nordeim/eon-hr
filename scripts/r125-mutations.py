#!/usr/bin/env python3
# r125-mutations.py — the mutation matrix for the R125-A/B/C/D cures (the
# mixed-/W range arms + the bracket-balanced /W capture, the known-zero
# advance, the /Contents-array text-state carry, and the Form XObject's own
# resources). Each mutation reverts or inverts ONE arm in isolation, runs
# the named spec set, and asserts the exact RED count. The runner resyncs
# the proto after every mutation (the D-120a discipline), so the sync arm
# stays green by construction — the behavioral specs are the measured
# surface.
import subprocess, re, shutil, sys

REPO = "/home/z/my-project/eon-hr"
SRC = f"{REPO}/src/lib/cv-text.ts"
BACKUP = "/tmp/r125-cv-text-backup.ts"
shutil.copy(SRC, BACKUP)
src = open(SRC).read()

import json as J, os
def run_specs(label, expect_red):
    out = f"{REPO}/.vitest/json/output.json"
    if os.path.exists(out):
        os.remove(out)  # the stale-json trap: assert freshness, never trust a leftover
    r = subprocess.run(
        ["bunx", "vitest", "run", "tests/unit/cv-text.test.ts", "tests/unit/script-portability.test.ts", "--reporter=json"],
        cwd=REPO, capture_output=True, text=True, timeout=300)
    if r.returncode == 0 and expect_red > 0:
        print(f"{label}: rc 0 but expected {expect_red} RED — *** MISMATCH ***")
        return False
    if not os.path.exists(out):
        print(f"{label}: NO REPORT (rc={r.returncode}) — *** MISMATCH ***")
        return False
    data = J.load(open(out))
    failed = data.get("numFailedTests", -1)
    print(f"{label}: failed {failed} (expected {expect_red}) {'OK' if failed == expect_red else '*** MISMATCH ***'}")
    return failed == expect_red

def restore():
    shutil.copy(BACKUP, SRC)
    subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)

ok = True

# M1 — the bare-group RANGE reading reverted to the pair reading: the
# mixed-/W spec goes RED (the arXiv FontN gap arms read as pairs, the real
# widths interleave as fake CIDs, every shown code falls to /DW 0)
m1 = src.replace("""    } else if (i < toks.length && toks[i] !== "]") {
      // R125-A: a bare number group in a bracketed /W is the spec's RANGE
      // entry (cfirst clast w) — the pair reading corrupted the Calibri/fpdf2
      // gap forms (the arXiv FontN descendants' "4 31 0" gap-ranges read as
      // pairs with the real widths interleaved as fake CIDs).
      if (i + 1 < toks.length && toks[i + 1] !== "[" && toks[i + 1] !== "]") {
        const clast = Number(toks[i]);
        const wv = Number(toks[i + 1]);
        for (let cid = c; cid <= clast; cid++) out.set(cid, wv);
        i += 2;
      } else {
        out.set(c, Number(toks[i]));
        i++;
      }
    }""", """    } else if (i < toks.length && toks[i] !== "]") {
      out.set(c, Number(toks[i])); // M1: the pair reading restored
      i++;
    }""")
assert m1 != src, "M1 anchor not found"
open(SRC, "w").write(m1)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M1 [the bare-group range reading reverted to pairs]", 1)
restore()

# M2 — the /W capture's bracket-balance dropped (the [^\\]]* truncation
# restored): the mixed-/W spec AND the multi-entry pure-array guard go RED
# (the capture stops at the leading entry's closer, every later entry and
# arm silently dropped)
m2 = src.replace("""    // R125-A: the /W value capture is BRACKET-BALANCED — the mixed form
    // interleaves nested array entries (`c [w…]`) with bare range arms, and
    // the [^\\]]* capture truncated at the FIRST `]` (the leading entry's
    // closer), silently dropping every later entry and arm (the arXiv FontN
    // class: the map kept only the `0 [ 506 0 0 226 578 ]` fragment, the
    // rest falling to /DW). The single-entry and pure-number forms have no
    // inner bracket — the balanced capture reads them identically.
    {
      const wStart = body.match(/\\/W\\s*\\[/);
      let wInner: string | null = null;
      if (wStart && wStart.index !== undefined) {
        let depth = 0;
        let end = -1;
        for (let i = wStart.index + wStart[0].length - 1; i < body.length; i++) {
          const ch = body[i];
          if (ch === "[") depth++;
          else if (ch === "]") { depth--; if (depth === 0) { end = i; break; } }
        }
        if (end > 0) wInner = body.slice(wStart.index + wStart[0].length, end); // AFTER the opening bracket — the pure-number forms keep the validated no-bracket readings
      }
      if (wInner !== null) {
        const map = parseWidthsArray(wInner);
        const dw = body.match(/\\/DW\\s+(\\d+)/);
        if (map && map.size > 0) objWidths.set(objNum, { codeLen: 2, map, def: dw ? parseInt(dw[1], 10) : 1000 });
        return;
      }
    }""", """    const wsm = body.match(/\\/W\\s*\\[([^\\]]*)\\]/); // M2: the truncating capture restored
    if (wsm) {
      const map = parseWidthsArray(wsm[1]);
      const dw = body.match(/\\/DW\\s+(\\d+)/);
      if (map && map.size > 0) objWidths.set(objNum, { codeLen: 2, map, def: dw ? parseInt(dw[1], 10) : 1000 });
      return;
    }""")
assert m2 != src, "M2 anchor not found"
open(SRC, "w").write(m2)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M2 [the /W capture bracket-balance dropped]", 2)
restore()

# M3 — the known-zero refinement reverted (the blanket w <= 0 blindness):
# the .null-glyph spec goes RED (the map-covered zero blinds the block)
m3 = src.replace("""          const hit = we.map.get(c);
          const w = hit ?? we.def;
          // R125-B: a code the map COVERS at width 0 is a KNOWN zero advance
          // (the .null-glyph class under the Calibri array's zero-width
          // entries) — not blindness. Only a code the table does not cover
          // (no positive default) stays the conservative blind signal.
          if (w === undefined || w < 0 || (hit === undefined && w <= 0)) { ok = false; break; }""", """          const w = we.map.get(c) ?? we.def; // M3: the blanket guard restored
          if (w === undefined || w <= 0) { ok = false; break; }""")
assert m3 != src, "M3 anchor not found"
open(SRC, "w").write(m3)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M3 [the known-zero refinement reverted]", 1)
restore()

# M4 — the carry INIT dropped (pdfTextPieces ignores the carry): the
# /Contents-array carry spec goes RED (the Tf-less stream walks fresh)
m4 = src.replace("""  let effSize = carry?.size ?? 1; // the last Tf size operand (the em denominator)
  let curFont = carry?.font ?? ""; // the last Tf font NAME (the R102-B scoping key)""", """  let effSize = 1; // M4: the carry init dropped
  let curFont = ""; // M4""")
assert m4 != src, "M4 anchor not found"
open(SRC, "w").write(m4)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M4 [the carry init dropped]", 1)
restore()

# M5 — the Form XObject's own-resources binding dropped: the embedded-
# figure misbind spec goes RED (the candidate chain resolves the FIRST
# same-named font — the wrong form's table)
m5 = src.replace("""        // R125-D: THE FORM XOBJECT'S OWN RESOURCES — a Form XObject carrying
        // an inline /Resources /Font region binds ITS OWN object number: its
        // content stream walks as a candidate with no page binding (the
        // LaTeX PTEX figure class — the embedded-figure PDFs), and the
        // candidate chain resolved the /F-name to the FIRST same-named font
        // in file order (a DIFFERENT form's font — the arXiv Font1 misbind:
        // the Calibri-Bold subset answering for the ArialMT pieces, the
        // codes falling on the wrong /W's zero arms). The form's own pairs
        // are the stream's REAL bindings, exactly like a page's own.
        if (fonts.size && /\\/Subtype\\s*\\/Form\\b/.test(body)) {
          pageFonts.set(parseInt(rm[1], 10), fonts);
        }
""", "")
assert m5 != src, "M5 anchor not found"
open(SRC, "w").write(m5)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M5 [the form own-resources binding dropped]", 1)
restore()

# M6 — the carry WRITE-BACK dropped (the carry object never mutates): the
# /Contents-array carry spec goes RED (the successor receives the stale
# defaults)
m6 = src.replace("""  if (carry) { carry.font = curFont; carry.size = effSize; carry.tw = curTw; carry.tz = curTz; } // R125-C: the write-back
  return pieces;""", """  return pieces; // M6: the write-back dropped""")
assert m6 != src, "M6 anchor not found"
open(SRC, "w").write(m6)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M6 [the carry write-back dropped]", 1)
restore()

print()
print("MUTATION MATRIX " + ("EXACT" if ok else "*** DRIFTED ***"))
sys.exit(0 if ok else 1)
