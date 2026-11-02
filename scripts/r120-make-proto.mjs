#!/usr/bin/env node
// r120-make-proto.mjs — build the CANDIDATE proto (/tmp/r120-proto/cv-text.ts)
// from src/lib/cv-text.ts + the three R120 cures + the piece-dump hook, so the
// drift ledger and censuses measure the candidate exactly as it would ship.
// The edits mirror the planned source changes 1:1 (the patch is the plan).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const SRC = "/home/z/my-project/eon-hr/src/lib/cv-text.ts";
const OUT = "/tmp/r120-proto/cv-text.ts";
let src = readFileSync(SRC, "utf8");

const edits = [];
function edit(name, anchor, replacement) {
  if (!src.includes(anchor)) throw new Error(`[${name}] anchor missing`);
  if (src.includes(replacement)) throw new Error(`[${name}] already applied`);
  src = src.replace(anchor, replacement);
  edits.push([name, anchor.length, replacement.length]);
}

// ---------------------------------------------------------------------------
// R120-A leg 1: the indirect width refs recorded in readWidthsFromFontBody
// ---------------------------------------------------------------------------
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

edit(
  "R120-A2 record the refs",
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

edit(
  "R120-A3 the indirect /W form",
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

// ---------------------------------------------------------------------------
// R120-A leg 2: the ObjStm bodies kept for the deferred resolution
// ---------------------------------------------------------------------------
edit(
  "R120-A4 objstmBodies map",
  `  const pageFonts = new Map<number, Map<string, number>>(); // content objNum → /F-name → font objNum
  const objFonts = new Map<number, Map<string, number>>(); // resources objNum → /F-name → font objNum`,
  `  const pageFonts = new Map<number, Map<string, number>>(); // content objNum → /F-name → font objNum
  const objFonts = new Map<number, Map<string, number>>(); // resources objNum → /F-name → font objNum
  // R120-A: every ObjStm entry's body, kept for the deferred width-array
  // resolution (the dvipdfmx/fontspec /W targets are themselves
  // ObjStm-carried — invisible to any raw scan)
  const objstmBodies = new Map<number, string>();`
);

edit(
  "R120-A5 store the entry bodies",
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

// ---------------------------------------------------------------------------
// R120-A leg 3: the deferred resolution pass (after the stream walk, before
// the descendant merge) — the raw array-object scan + the ObjStm lookup
// ---------------------------------------------------------------------------
edit(
  "R120-A6 the deferred pass",
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

// ---------------------------------------------------------------------------
// R120-B: the general-name font bindings — the R108-B /Font-dict-region
// discipline + the pure-pair-dict form, feeding objFonts/pageFonts (the
// width machinery's page binding), not just the candidate chain
// ---------------------------------------------------------------------------
edit(
  "R120-B1 the fontPairsOf helper",
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

edit(
  "R120-B2 raw pass: the else-branch feeds objFonts with general names",
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

edit(
  "R120-B3 ObjStm page branch: general-name pairs bind pageFonts",
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

edit(
  "R120-B4 ObjStm else-branch: general-name pairs feed objFonts",
  `          } else {
            // R106-A: an ObjStm-carried /Resources body (the /Font pairs
            // dict) feeds the deferred resolution — the raw pass cannot see
            // it, and the fontspec pages reference exactly these
            const fonts = new Map<string, number>();
            for (const fm of body.matchAll(/\\/([Ff]\\w+(?:\\.\\w+)*)\\s+(\\d+)\\s+0\\s+R/g))
              if (fm[1] !== "Font") fonts.set(fm[1], parseInt(fm[2], 10)); // R107-B: the key exclusion
            if (fonts.size) objFonts.set(entries[i].obj, fonts);`,
  `          } else {
            // R106-A: an ObjStm-carried /Resources body (the /Font pairs
            // dict) feeds the deferred resolution — the raw pass cannot see
            // it, and the fontspec pages reference exactly these
            const fonts = new Map<string, number>();
            for (const fm of body.matchAll(/\\/([Ff]\\w+(?:\\.\\w+)*)\\s+(\\d+)\\s+0\\s+R/g))
              if (fm[1] !== "Font") fonts.set(fm[1], parseInt(fm[2], 10)); // R107-B: the key exclusion
            for (const [k, v] of fontPairsOf(body)) fonts.set(k, v); // R120-B: the WeasyPrint pure-pair dict + the region form
            if (fonts.size) objFonts.set(entries[i].obj, fonts);`
);

// ---------------------------------------------------------------------------
// R120-C: the widthFor fallback — a part with NO page map at all resolves
// through the candidate chain (the first width-carrying object, the
// position-sorted ownChainFor discipline); a page map that exists but lacks
// the font stays blind (the misbind signal)
// ---------------------------------------------------------------------------
edit(
  "R120-C the widthFor fallback",
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

// ---------------------------------------------------------------------------
// the piece-dump hook (the census surface — same as the committed proto's)
// ---------------------------------------------------------------------------
edit(
  "hook",
  `    // R110-D: the census is SPACE-only`,
  `    // R120: THE DEBUG-CAPTURE HOOK (the proto's census surface — identical
    // to the committed scripts/protos/cv-text-proto.ts addition).
    {
      const __g = globalThis as unknown as { __r119pages?: unknown[][]; __r118pieces?: unknown[] };
      (__g.__r119pages ??= []).push(decoded);
      const __flat = decoded.map((d) => {
        const e = d as unknown as { p: Record<string, unknown>; text: string; genuine?: boolean; trail?: boolean };
        return { ...e.p, text: e.text, genuine: e.genuine, trail: e.trail };
      });
      (__g.__r118pieces ??= []).push(...__flat);
      __r117DebugPieces.push(...__flat);
    }
    // R110-D: the census is SPACE-only`
);

edit(
  "hook-export",
  `const MAX_INFLATED_BYTES = 8 * 1024 * 1024;`,
  `const MAX_INFLATED_BYTES = 8 * 1024 * 1024;

// R120: the flat debug surface (the proto's module-level census addition)
export const __r117DebugPieces: Array<Record<string, unknown>> = [];`
);

mkdirSync("/tmp/r120-proto", { recursive: true });
writeFileSync(OUT, src);
console.log(`candidate proto written: ${OUT}`);
for (const [name, a, r] of edits) console.log(`  ${name}: anchor ${a} -> ${r}`);
