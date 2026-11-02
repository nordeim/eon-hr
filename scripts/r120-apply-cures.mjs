#!/usr/bin/env node
// r120-apply-cures.mjs — apply the validated R120-A/B/C/D/E/F cures to
// src/lib/cv-text.ts (the same edits the /tmp/r120-proto candidate carried
// through the drift ledger — the patch IS the plan).
import { readFileSync, writeFileSync } from "node:fs";

const SRC = "/home/z/my-project/eon-hr/src/lib/cv-text.ts";
let src = readFileSync(SRC, "utf8");

function edit(name, anchor, replacement) {
  if (!src.includes(anchor)) throw new Error(`[${name}] anchor missing`);
  if (src.includes(replacement)) throw new Error(`[${name}] already applied`);
  src = src.replace(anchor, replacement);
  console.log(`  ${name} applied`);
}

// --- R120-A1: the widthsRef map ---
edit(
  "R120-A1 widthsRef map",
  `  const objWidths = new Map<number, WidthEntry>();
  const objDescendant = new Map<number, { desc: number; identityH: boolean }>(); // Type0 font obj → descendant obj`,
  `  const objWidths = new Map<number, WidthEntry>();
  const objDescendant = new Map<number, { desc: number; identityH: boolean }>(); // Type0 font obj → descendant obj
  // R120-A: THE INDIRECT WIDTH REFS — a font dict whose /W or /Widths value
  // is an object REFERENCE (Prawn's /Widths 514 0 R, dvipdfmx/fontspec's
  // descendant /W 1029 0 R, arXiv's 36 /Widths N 0 R) carries the array in
  // a SEPARATE object (raw or ObjStm-carried) — unresolvable at the body
  // parse (the target may not be seen yet), deferred to the post-walk pass.
  const widthsRef = new Map<number, { kind: "w" | "widths"; target: number; first: number; def: number }>();`
);

// --- R120-A2: record the indirect /Widths refs in readWidthsFromFontBody ---
edit(
  "R120-A2 record /Widths refs",
  `    const sm = body.match(/\\/Widths\\s*\\[([^\\]]*)\\]/);
    if (sm) {
      const nums = (sm[1].match(/-?[\\d.]+/g) ?? []).map(Number);
      const fc = body.match(/\\/FirstChar\\s+(\\d+)/);
      const first = fc ? parseInt(fc[1], 10) : 0;
      const map = new Map<number, number>();
      nums.forEach((w, i) => map.set(first + i, w));
      const mw = body.match(/\\/MissingWidth\\s+(\\d+)/);
      objWidths.set(objNum, { codeLen: 1, map, def: mw ? parseInt(mw[1], 10) : 0 });
    }
  };`,
  `    const sm = body.match(/\\/Widths\\s*\\[([^\\]]*)\\]/);
    if (sm) {
      const nums = (sm[1].match(/-?[\\d.]+/g) ?? []).map(Number);
      const fc = body.match(/\\/FirstChar\\s+(\\d+)/);
      const first = fc ? parseInt(fc[1], 10) : 0;
      const map = new Map<number, number>();
      nums.forEach((w, i) => map.set(first + i, w));
      const mw = body.match(/\\/MissingWidth\\s+(\\d+)/);
      objWidths.set(objNum, { codeLen: 1, map, def: mw ? parseInt(mw[1], 10) : 0 });
    } else {
      // R120-A: the INDIRECT /Widths form — "/Widths 514 0 R" (Prawn's
      // embedded fonts, arXiv's Type1 families). The first/missing defaults
      // ride the FONT body (the array object carries numbers only).
      const wr = body.match(/\\/Widths\\s+(\\d+)\\s+0\\s+R/);
      if (wr) {
        const fc = body.match(/\\/FirstChar\\s+(\\d+)/);
        const mw = body.match(/\\/MissingWidth\\s+(\\d+)/);
        widthsRef.set(objNum, { kind: "widths", target: parseInt(wr[1], 10), first: fc ? parseInt(fc[1], 10) : 0, def: mw ? parseInt(mw[1], 10) : 0 });
      }
    }
  };`
);

// --- R120-A3: the indirect /W form ---
edit(
  "R120-A3 indirect /W",
  `    const wsm = body.match(/\\/W\\s*\\[([^\\]]*)\\]/);
    if (wsm) {
      const map = parseWidthsArray(wsm[1]);
      const dw = body.match(/\\/DW\\s+(\\d+)/);
      if (map && map.size > 0) objWidths.set(objNum, { codeLen: 2, map, def: dw ? parseInt(dw[1], 10) : 1000 });
      return;
    }`,
  `    const wsm = body.match(/\\/W\\s*\\[([^\\]]*)\\]/);
    if (wsm) {
      const map = parseWidthsArray(wsm[1]);
      const dw = body.match(/\\/DW\\s+(\\d+)/);
      if (map && map.size > 0) objWidths.set(objNum, { codeLen: 2, map, def: dw ? parseInt(dw[1], 10) : 1000 });
      return;
    }
    // R120-A: the INDIRECT /W form — "/W 1029 0 R" (the dvipdfmx/fontspec
    // CID descendants). /DW rides the font body; the array rides the target.
    {
      const wr = body.match(/\\/W\\s+(\\d+)\\s+0\\s+R/);
      if (wr) {
        const dw = body.match(/\\/DW\\s+(\\d+)/);
        widthsRef.set(objNum, { kind: "w", target: parseInt(wr[1], 10), first: 0, def: dw ? parseInt(dw[1], 10) : 1000 });
      }
    }`
);

// --- R120-A4: the objstmBodies map ---
edit(
  "R120-A4 objstmBodies",
  `  const pageFonts = new Map<number, Map<string, number>>(); // content objNum → /F-name → font objNum
  const objFonts = new Map<number, Map<string, number>>(); // resources objNum → /F-name → font objNum`,
  `  const pageFonts = new Map<number, Map<string, number>>(); // content objNum → /F-name → font objNum
  const objFonts = new Map<number, Map<string, number>>(); // resources objNum → /F-name → font objNum
  // R120-A: every ObjStm entry's body, kept for the deferred width-array
  // resolution (the dvipdfmx/fontspec /W targets are themselves
  // ObjStm-carried — invisible to any raw scan)
  const objstmBodies = new Map<number, string>();`
);

// --- R120-A5: store the entry bodies ---
edit(
  "R120-A5 store bodies",
  `        for (let i = 0; i < entries.length; i++) {
          const start = first + entries[i].off;
          const end = i + 1 < entries.length ? first + entries[i + 1].off : text.length;
          if (start > end || end > text.length) continue;
          const body = text.slice(start, end);`,
  `        for (let i = 0; i < entries.length; i++) {
          const start = first + entries[i].off;
          const end = i + 1 < entries.length ? first + entries[i + 1].off : text.length;
          if (start > end || end > text.length) continue;
          const body = text.slice(start, end);
          objstmBodies.set(entries[i].obj, body); // R120-A: the deferred-resolution feed`
);

// --- R120-A6: the deferred resolution pass ---
edit(
  "R120-A6 deferred pass",
  `  // R117-A: THE DESCENDANT MERGE — the Type0 parents' width entries resolve`,
  `  // R120-A: THE INDIRECT WIDTH-ARRAY RESOLUTION — every recorded ref's
  // target body (raw array object or ObjStm entry) parsed into objWidths.
  // The raw targets are plain array objects ("1435 0 obj\\n[ 333.3 ... ]");
  // the /W form may nest arrays ("3 [318] 11 [390 390]") so the slice is
  // BRACKET-BALANCED, never a regex. A target that resolves nowhere leaves
  // the font blind (the conservative guard — a missing array never
  // misfires, it only cures less).
  if (widthsRef.size) {
    const rawArray = new Map<number, string>();
    for (const wr of widthsRef.values()) {
      if (objstmBodies.has(wr.target) || rawArray.has(wr.target)) continue;
      const hm = ascii.match(new RegExp("(?:^|\\\\n)" + wr.target + " 0 obj\\\\s*\\\\["));
      if (!hm || hm.index === undefined) continue;
      let depth = 0;
      let end = -1;
      for (let i = hm.index + hm[0].length - 1; i < ascii.length; i++) {
        const ch = ascii[i];
        if (ch === "[") depth++;
        else if (ch === "]") { depth--; if (depth === 0) { end = i; break; } }
      }
      if (end > 0) rawArray.set(wr.target, ascii.slice(hm.index + hm[0].length - 1, end + 1));
    }
    for (const [objNum, wr] of widthsRef) {
      if (objWidths.has(objNum)) continue; // a real inline array won (the precedence guard)
      const body = objstmBodies.get(wr.target) ?? rawArray.get(wr.target);
      if (body === undefined) continue;
      const inner = body.replace(/^[\\s\\[]+/, "").replace(/[\\s\\]]+$/, "");
      if (wr.kind === "w") {
        const map = parseWidthsArray(inner);
        if (map && map.size > 0) objWidths.set(objNum, { codeLen: 2, map, def: wr.def });
      } else {
        const nums = (inner.match(/-?[\\d.]+/g) ?? []).map(Number);
        if (nums.length) {
          const map = new Map<number, number>();
          nums.forEach((w, i) => map.set(wr.first + i, w));
          objWidths.set(objNum, { codeLen: 1, map, def: wr.def });
        }
      }
    }
  }
  // R117-A: THE DESCENDANT MERGE — the Type0 parents' width entries resolve`
);

// --- R120-B1: the fontPairsOf helper ---
edit(
  "R120-B1 fontPairsOf",
  `  const inlineFontRef = (body: string): number | null => {`,
  `  // R120-B: THE GENERAL-NAME FONT PAIRS — the WeasyPrint/IRS/QUARTZ class
  // (the Tf names are the subset tag or T1_0/Tc1 forms, never /F-prefixed):
  // (a) the pairs inside a /Font << … >> region (the R108-B discipline — by
  //     construction every Name N 0 R pair there IS a font binding);
  // (b) a body that IS a pure pair dict (WeasyPrint's referenced font dict
  //     "<< /BAWKYD 19 0 R /KTGASA 23 0 R >>" — no /Type, no other keys).
  const fontPairsOf = (body: string): Map<string, number> => {
    const out = new Map<string, number>();
    for (const rm of body.matchAll(/\\/Font\\s*<<\\s*([\\w#+\\-./\\s]+)>>/g)) {
      for (const fm of rm[1].matchAll(/\\/([\\w#+.-]+)\\s+(\\d+)\\s+0\\s+R/g)) {
        if (fm[1] === "Font") continue;
        out.set(fm[1], parseInt(fm[2], 10));
      }
    }
    if (out.size === 0 && /^<<\\s*(\\/[\\w#+.-]+\\s+\\d+\\s+0\\s+R\\s*)+>>$/.test(body.trim())) {
      for (const fm of body.matchAll(/\\/([\\w#+.-]+)\\s+(\\d+)\\s+0\\s+R/g)) {
        if (fm[1] === "Font") continue;
        out.set(fm[1], parseInt(fm[2], 10));
      }
    }
    return out;
  };
  const inlineFontRef = (body: string): number | null => {`
);

// --- R120-B2: the raw pass else-branch ---
edit(
  "R120-B2 raw else-branch",
  `      } else {
        if (fonts.size) objFonts.set(parseInt(rm[1], 10), fonts);
        const fr = body.match(/\\/Font\\s+(\\d+)\\s+0\\s+R/); // R107-B shape (b): the link
        if (fr) fontRefOf.set(parseInt(rm[1], 10), parseInt(fr[1], 10));
      }`,
  `      } else {
        if (fonts.size) objFonts.set(parseInt(rm[1], 10), fonts);
        // R120-B: the general-name pairs (the Tc1/T1_0/BAWKYD class) — a
        // resources body's /Font << >> region or a pure pair dict feeds the
        // SAME objFonts feed the F-prefixed form fills
        const gpairs = fontPairsOf(body);
        if (gpairs.size) {
          const cur = objFonts.get(parseInt(rm[1], 10)) ?? new Map<string, number>();
          for (const [k, v] of gpairs) cur.set(k, v);
          objFonts.set(parseInt(rm[1], 10), cur);
          for (const [k, v] of gpairs) pushCandidate(k, v, rm.index ?? 0);
        }
        const fr = body.match(/\\/Font\\s+(\\d+)\\s+0\\s+R/); // R107-B shape (b): the link
        if (fr) fontRefOf.set(parseInt(rm[1], 10), parseInt(fr[1], 10));
      }`
);

// --- R120-B3: the ObjStm page branch ---
edit(
  "R120-B3 ObjStm page branch",
  `          if (/\\/Type\\s*\\/Page\\b/.test(body)) {
            const refs = contentsRefs(body);
            if (refs.length) {
              const fonts = new Map<string, number>();
              for (const fm of body.matchAll(/\\/([Ff]\\w+(?:\\.\\w+)*)\\s+(\\d+)\\s+0\\s+R/g))
                if (fm[1] !== "Font") fonts.set(fm[1], parseInt(fm[2], 10)); // R107-B: the key exclusion`,
  `          if (/\\/Type\\s*\\/Page\\b/.test(body)) {
            const refs = contentsRefs(body);
            if (refs.length) {
              const fonts = new Map<string, number>();
              for (const fm of body.matchAll(/\\/([Ff]\\w+(?:\\.\\w+)*)\\s+(\\d+)\\s+0\\s+R/g))
                if (fm[1] !== "Font") fonts.set(fm[1], parseInt(fm[2], 10)); // R107-B: the key exclusion
              for (const [k, v] of fontPairsOf(body)) fonts.set(k, v); // R120-B: the inline /Font region pairs (the IRS T1_0 class)`
);

// --- R120-B4: the ObjStm else-branch ---
edit(
  "R120-B4 ObjStm else-branch",
  `            const fonts = new Map<string, number>();
            for (const fm of body.matchAll(/\\/([Ff]\\w+(?:\\.\\w+)*)\\s+(\\d+)\\s+0\\s+R/g))
              if (fm[1] !== "Font") fonts.set(fm[1], parseInt(fm[2], 10)); // R107-B: the key exclusion
            if (fonts.size) objFonts.set(entries[i].obj, fonts);`,
  `            const fonts = new Map<string, number>();
            for (const fm of body.matchAll(/\\/([Ff]\\w+(?:\\.\\w+)*)\\s+(\\d+)\\s+0\\s+R/g))
              if (fm[1] !== "Font") fonts.set(fm[1], parseInt(fm[2], 10)); // R107-B: the key exclusion
            for (const [k, v] of fontPairsOf(body)) fonts.set(k, v); // R120-B: the WeasyPrint pure-pair dict + the region form
            if (fonts.size) objFonts.set(entries[i].obj, fonts);`
);

// --- R120-C: the widthFor fallback ---
edit(
  "R120-C widthFor fallback",
  `    const widthFor = (font?: string): WidthEntry | undefined => {
      if (!font) return undefined;
      const fo = pageMap?.get(font);
      if (fo === undefined) return undefined;
      return objWidths.get(fo);
    };`,
  `    const widthFor = (font?: string): WidthEntry | undefined => {
      if (!font) return undefined;
      const fo = pageMap?.get(font);
      if (fo === undefined) {
        // R120-C: THE PAGE-MAP-LESS FALLBACK — a part with NO page binding
        // at all (the unbound-stream class) resolves through the candidate
        // chain's first width-carrying object (the position-sorted
        // ownChainFor discipline). A page map that EXISTS but lacks this
        // font stays blind — that is the misbind signal, never a fallback
        // license (the fontspec collision class).
        if (pageMap) return undefined;
        const cands = fCandidates.get(font);
        if (!cands?.length) return undefined;
        for (const c of [...cands].sort((a, b) => a.pos - b.pos)) {
          const we = objWidths.get(c.obj);
          if (we) return we;
        }
        return undefined;
      }
      return objWidths.get(fo);
    };`
);

// --- R120-D: the kern sign ---
edit(
  "R120-D kern sign",
  `        if (piece.kv) adv += (piece.kv / 1000) * piece.ps;`,
  `        if (piece.kv) adv -= (piece.kv / 1000) * piece.ps; // R120-D: a TJ number displaces by -K/1000 x ps (ISO 32000-1 9.4.3) — the word-gap kerns (-321) move RIGHT`
);

// --- R120-E: the leader-run guard ---
edit(
  "R120-E leader guard",
  `      const gapEm = (p.px - ap.bx) / Math.max(ap.ps, p.ps);
      if (gapEm < 0.95) continue; // the Skia em-dash band stays joined (0.89 em measured)
      if (p.condGap && hasSpaceGlyphs) continue; // a join never upgrades (the R117-A guard form)`,
  `      const gapEm = (p.px - ap.bx) / Math.max(ap.ps, p.ps);
      if (gapEm < 0.95) continue; // the Skia em-dash band stays joined (0.89 em measured)
      // R120-E: THE LEADER-RUN GUARD — an anchor followed on the same
      // baseline by the SAME anchor text at a regular forward step (the TOC
      // dot leaders, both forms: the fontspec/dvipdfmx same-block run and
      // the IRS per-dot repositioned pieces) is a typographic LEADER
      // bridging the entry to its page number, not an icon separator —
      // pdftotext reads the whole run same-line. The Typst contacts icons
      // lead DIFFERENT content (the phone digits, the email) — the icon
      // class keeps firing.
      {
        const at = d.text.trim();
        let leader = false;
        for (let k = i + 1; k <= i + 2 && k < decoded.length; k++) {
          const nk = decoded[k] as { p: { px?: number; py?: number; ps?: number }; text: string };
          if (nk.p.px === undefined || nk.p.py === undefined || nk.p.ps === undefined) break;
          if (Math.abs(nk.p.py - p.py) >= 0.5 * Math.max(nk.p.ps, p.ps)) break;
          const step = nk.p.px - p.px;
          if (step >= 0 && step <= 3 * Math.max(nk.p.ps, p.ps) && nk.text.trim() === at) { leader = true; break; }
        }
        if (leader) continue;
      }
      if (p.condGap && hasSpaceGlyphs) continue; // a join never upgrades (the R117-A guard form)`
);

// --- R120-F legs 1-3: the Tw/Tz state + the ops regex arms + the handlers ---
edit(
  "R120-F1 state",
  `  let effSize = 1; // the last Tf size operand (the em denominator)
  let curFont = ""; // the last Tf font NAME (the R102-B scoping key)`,
  `  let effSize = 1; // the last Tf size operand (the em denominator)
  let curFont = ""; // the last Tf font NAME (the R102-B scoping key)
  // R120-F: the text-state advance modifiers — Tw adds text-space units to
  // every single-byte 0x20 code's advance (Prawn's justification form: the
  // word spaces are real 0x20 glyph bytes inside the atoms, the JUSTIFIED
  // spacing riding Tw), Tz scales every advance (the shrink/tracking form).
  // Both ride the piece for the bx post-pass (ISO 32000-1 9.3).
  let curTw = 0;
  let curTz = 100;`
);

edit(
  "R120-F2 stamp on pieces",
  `    pieces.push({ sep, font: curFont, ...(pos ?? {}), ...(condGap ? { condGap: true } : {}), ...(kernGap ? { condKern: true } : {}), ...(kernVal !== 0 ? { kv: kernVal } : {}), ...piece });`,
  `    pieces.push({ sep, font: curFont, ...(pos ?? {}), ...(condGap ? { condGap: true } : {}), ...(kernGap ? { condKern: true } : {}), ...(kernVal !== 0 ? { kv: kernVal } : {}), ...(curTw !== 0 ? { tw: curTw } : {}), ...(curTz !== 100 ? { tz: curTz } : {}), ...piece });`
);

const tail = "|\\\\bq\\\\b|\\\\bQ\\\\b/g;";
edit(
  "R120-F3 ops regex arms",
  tail,
  "|\\\\bq\\\\b|\\\\bQ\\\\b|(-?[\\\\d.]+)\\\\s+Tw|(-?[\\\\d.]+)\\\\s+Tz/g;"
);

edit(
  "R120-F4 handlers",
  `    if (m[0] === "T*") {
      moved = true;
      pendingTy = 1; // the explicit next-line operator
      continue;
    }`,
  `    if (m[0] === "T*") {
      moved = true;
      pendingTy = 1; // the explicit next-line operator
      continue;
    }
    // R120-F: the advance-modifier text state (the Tw/Tz regex arms)
    if (m[21] !== undefined) { curTw = parseFloat(m[21]) || 0; continue; }
    if (m[22] !== undefined) { curTz = parseFloat(m[22]) || 100; continue; }`
);

// --- R120-F5: the post-pass tw/tz application ---
edit(
  "R120-F5 post-pass",
  `        let ok = true;
        for (const c of codes) {
          const w = we.map.get(c) ?? we.def;
          if (w === undefined || w <= 0) { ok = false; break; }
          adv += (w / 1000) * piece.ps;
        }
        if (!ok) { blind = true; continue; }`,
  `        let ok = true;
        // R120-F: the advance modifiers — Tz scales every advance, Tw adds
        // text-space units to every single-byte 0x20 code (the Prawn
        // justification form; ISO 32000-1 9.3 — Tw applies ONLY to
        // single-byte codes)
        const tz = (piece as { tz?: number }).tz ?? 100;
        const twv = (piece as { tw?: number }).tw ?? 0;
        for (const c of codes) {
          const w = we.map.get(c) ?? we.def;
          if (w === undefined || w <= 0) { ok = false; break; }
          adv += ((w / 1000) + (we.codeLen === 1 && c === 32 ? twv : 0)) * piece.ps * (tz / 100);
        }
        if (!ok) { blind = true; continue; }`
);

writeFileSync(SRC, src);
console.log("ALL CURES APPLIED to src/lib/cv-text.ts");
