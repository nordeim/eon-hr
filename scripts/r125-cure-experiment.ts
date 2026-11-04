// r125-cure-experiment.ts — the patched-proto experiment for the three
// r125 cures, measured BEFORE any source change (the r124 discipline):
//   R125-A the mixed /W range arms (a bare number group in a bracketed /W
//         is the spec's cfirst clast w RANGE entry — the pair reading
//         corrupted the Calibri/fpdf2 gap forms)
//   R125-B the known-zero advance (a code the map COVERS at width 0 is a
//         legitimate zero advance — the .null-glyph class; only the
//         UNCOVERED code stays the conservative blind signal)
//   R125-C the /Contents-array text-state carry (a mid-array stream that
//         shows text before any Tf inherits the predecessor stream's font
//         state — the IRS pocket's cause)
// Measures: the 12-member drift ledger, the 16 family members, the bx
// coverage (arXiv/IRS/ReportLab), and prints changed-member diffs for the
// toward/away classification.
// Usage: bun scripts/r125-cure-experiment.ts
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import crypto from "node:crypto";

const SRC = "/home/z/my-project/eon-hr/scripts/protos/cv-text-proto.ts";
const PATCHED = "/tmp/r125-cured-proto.ts";
let src = readFileSync(SRC, "utf8");

// ---- PATCH A: the mixed /W range arms ----
const aAnchor = `    } else if (i < toks.length && toks[i] !== "]") {
      out.set(c, Number(toks[i]));
      i++;
    }`;
const aPatch = `    } else if (i < toks.length && toks[i] !== "]") {
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
    }`;
if (!src.includes(aAnchor)) throw new Error("PATCH A anchor not found");
src = src.replace(aAnchor, aPatch);

// ---- PATCH B: the known-zero advance ----
const bAnchor = `          const w = we.map.get(c) ?? we.def;
          if (w === undefined || w <= 0) { ok = false; break; }`;
const bPatch = `          const hit = we.map.get(c);
          const w = hit ?? we.def;
          // R125-B: a code the map COVERS at width 0 is a KNOWN zero advance
          // (the .null-glyph class under the Calibri array's zero-width
          // entries) — not blindness. Only a code the table does not cover
          // (no positive default) stays the conservative blind signal.
          if (w === undefined || w < 0 || (hit === undefined && w <= 0)) { ok = false; break; }`;
if (!src.includes(bAnchor)) throw new Error("PATCH B anchor not found");
src = src.replace(bAnchor, bPatch);

// ---- PATCH C: the /Contents-array text-state carry ----
// C1: pdfTextPieces gains the carry parameter (init + write-back)
const c1Anchor = `function pdfTextPieces(content: string): TextPiece[] {`;
const c1Patch = `function pdfTextPieces(content: string, carry?: { font: string; size: number; tw: number; tz: number }): TextPiece[] {`;
if (!src.includes(c1Anchor)) throw new Error("PATCH C1 anchor not found");
src = src.replace(c1Anchor, c1Patch);

const c2Anchor = `  let effSize = 1; // the last Tf size operand (the em denominator)
  let curFont = ""; // the last Tf font NAME (the R102-B scoping key)`;
const c2Patch = `  let effSize = carry?.size ?? 1; // the last Tf size operand (the em denominator)
  let curFont = carry?.font ?? ""; // the last Tf font NAME (the R102-B scoping key)`;
if (!src.includes(c2Anchor)) throw new Error("PATCH C2 anchor not found");
src = src.replace(c2Anchor, c2Patch);

const c3Anchor = `  let curTw = 0;
  let curTz = 100;`;
const c3Patch = `  let curTw = carry?.tw ?? 0;
  let curTz = carry?.tz ?? 100;`;
if (!src.includes(c3Anchor)) throw new Error("PATCH C3 anchor not found");
src = src.replace(c3Anchor, c3Patch);

// C4: the write-back at pdfTextPieces's return — find the return of pieces
// (the function's final return). Anchor on the pending push's tail inside
// pdfTextPieces: the `return pieces;` that ends the walk.
const c4AnchorRe = /(\n  return pieces;\n\})/;
if (!c4AnchorRe.test(src)) throw new Error("PATCH C4 anchor not found");
src = src.replace(c4AnchorRe, `
  if (carry) { carry.font = curFont; carry.size = effSize; carry.tw = curTw; carry.tz = curTz; } // R125-C: the write-back
  return pieces;
}`);

// C5: the contentsPrev map + streamState map (module-scope inside the
// extract function — anchor on the pendingRes declaration neighborhood)
const c5Anchor = `  const pendingRes: { contents: number[]; res: number }[] = [];`;
const c5Patch = `  const pendingRes: { contents: number[]; res: number }[] = [];
  // R125-C: the /Contents-array chain — each array member's immediate
  // predecessor (the text state carries across the array's streams, ISO
  // 32000-1 §7.7.4 / §9.4: the streams process as-if-concatenated).
  const contentsPrev = new Map<number, number>();
  const streamState = new Map<number, { font: string; size: number; tw: number; tz: number }>();`;
if (!src.includes(c5Anchor)) throw new Error("PATCH C5 anchor not found");
src = src.replace(c5Anchor, c5Patch);

// C6: fill contentsPrev in the page scan (the /Type /Page branch)
const c6Anchor = `      if (/\\/Type\\s*\\/Page\\b/.test(body)) {
        const refs = contentsRefs(body);
        if (!refs.length) continue;`;
const c6Patch = `      if (/\\/Type\\s*\\/Page\\b/.test(body)) {
        const refs = contentsRefs(body);
        if (!refs.length) continue;
        for (let ri = 1; ri < refs.length; ri++) contentsPrev.set(refs[ri], refs[ri - 1]); // R125-C`;
if (!src.includes(c6Anchor)) throw new Error("PATCH C6 anchor not found");
src = src.replace(c6Anchor, c6Patch);

// C7: the call site — thread the carry
const c7Anchor = `    let pieces: TextPiece[];
    try {
      pieces = pdfTextPieces(text);
    } catch {
      continue; // the stack-overflow class — one bad stream never kills the file
    }`;
const c7Patch = `    let pieces: TextPiece[];
    try {
      const prevNum = contentsPrev.get(objNum); // R125-C
      const prevCarry = prevNum !== undefined ? streamState.get(prevNum) : undefined;
      const carry = { font: prevCarry?.font ?? "", size: prevCarry?.size ?? 1, tw: prevCarry?.tw ?? 0, tz: prevCarry?.tz ?? 100 };
      pieces = pdfTextPieces(text, carry);
      streamState.set(objNum, carry);
    } catch {
      continue; // the stack-overflow class — one bad stream never kills the file
    }`;
if (!src.includes(c7Anchor)) throw new Error("PATCH C7 anchor not found");
src = src.replace(c7Anchor, c7Patch);

writeFileSync(PATCHED, src);
console.log("cured proto written:", PATCHED);

// ---------------- the measurement ----------------
const cured = await import(PATCHED);
const head = await import("/home/z/my-project/eon-hr/src/lib/cv-text");
const md5 = (s: string) => crypto.createHash("md5").update(s).digest("hex").slice(0, 8);
const na = (s: string) => s.replace(/[^A-Za-z0-9]/g, "");

const members: [string, string, string, number][] = [
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv", "6aa0c41b", 70646],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx", "d70a708e", 61437],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec", "8ecdda5e", 106179],
  ["/tmp/r106-corpus/irs-f1040.pdf", "IRS", "eeb0ce16", 5798],
  ["/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ", "7c7e6529", 2697],
  ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab", "880ec001", 213160],
  ["/tmp/r110-prawn-manual.pdf", "Prawn", "fe969d8d", 83657],
  ["/tmp/r113-writers/weasy-cv.pdf", "WeasyPrint", "8afc1417", 782],
  ["/tmp/typst-cv/resume.pdf", "Typst resume", "7e3033d7", 793],
  ["/tmp/typst-cv/resume2.pdf", "Typst resume2", "d4c51041", 793],
  ["/tmp/typst-cv/coverletter.pdf", "Typst coverletter", "676f38ab", 897],
  ["/tmp/typst-cv/coverletter2.pdf", "Typst coverletter2", "74c60344", 871],
];

console.log("\n=== THE DRIFT LEDGER (HEAD pin vs the CURED extraction) ===");
const changed: [string, string, string][] = [];
for (const [p, n, pin, alnumPin] of members) {
  const raw = readFileSync(p);
  const file = new File([new Uint8Array(raw)], "m.pdf");
  const t = await cured.extractTextFromFile(file);
  const cur = md5(t);
  const alnums = na(t).length;
  const status = cur === pin ? "IDENTICAL" : "CHANGED";
  const alnumOk = alnums === alnumPin ? "alnums exact" : `*** ALNUM DRIFT ${alnums} vs ${alnumPin} ***`;
  console.log(`${n}: ${cur} (HEAD ${pin}) ${status} · ${alnumOk}`);
  if (status === "CHANGED") changed.push([p, n, pin]);
}

// the bx coverage on the named pockets
console.log("\n=== THE BX COVERAGE (the named pockets) ===");
for (const [p, n] of [["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"], ["/tmp/r106-corpus/irs-f1040.pdf", "IRS"], ["/tmp/r109-corpus/rl-userguide.pdf", "ReportLab"]] as [string, string][]) {
  (globalThis as any).__r119pages = [];
  const raw = readFileSync(p);
  await cured.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const decoded = ((globalThis as any).__r119pages ?? []).flat() as { p?: { px?: number; bx?: number } }[];
  let positioned = 0, withBx = 0;
  for (const d of decoded) {
    if (d.p?.px !== undefined) { positioned++; if (d.p.bx !== undefined) withBx++; }
  }
  console.log(`${n}: positioned ${positioned} | with bx ${withBx} (${(100 * withBx / positioned).toFixed(1)}%)`);
}

// the family checks
console.log("\n=== THE 16 FAMILY MEMBERS (alnums vs pdftotext) ===");
const fam: [string, string][] = [
  ["/tmp/skia-cv/john-smith-cv.pdf", "Skia CV"], ["/tmp/skia-cv/variant-control.pdf", "Skia control"],
  ["/tmp/skia-cv/variant-floatlast.pdf", "Skia floatlast"], ["/tmp/skia-cv/variant-absolute.pdf", "Skia absolute"],
  ["/tmp/skia-cv/variant-twopage.pdf", "Skia twopage"], ["/tmp/r113-writers/weasy-cv.pdf", "WeasyPrint CV"],
  ["/tmp/r113-writers/weasy-variant-control.pdf", "WeasyPrint control"], ["/tmp/r113-writers/weasy-variant-floatlast.pdf", "WeasyPrint floatlast"],
  ["/tmp/r113-writers/weasy-variant-absolute.pdf", "WeasyPrint absolute"], ["/tmp/r113-writers/weasy-variant-twopage.pdf", "WeasyPrint twopage"],
  ["/tmp/r113-writers/weasy-variant-display.pdf", "WeasyPrint letterspaced"], ["/tmp/r114-writers/fpdf-variant-control.pdf", "fpdf2 control"],
  ["/tmp/r114-writers/fpdf-variant-absolute.pdf", "fpdf2 dates"], ["/tmp/r114-writers/fpdf-variant-twopage.pdf", "fpdf2 twopage"],
  ["/tmp/r114-writers/fpdf-variant-letterspaced.pdf", "fpdf2 letterspaced"], ["/tmp/r114-writers/fpdf-variant-corefont.pdf", "fpdf2 core14"],
];
let bad = 0;
for (const [p, n] of fam) {
  const raw = readFileSync(p);
  const t = await cured.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const ref = execSync(`pdftotext ${p} -`, { encoding: "utf8", maxBuffer: 512 * 1024 * 1024 });
  const alnum = (s: string) => (s.match(/[A-Za-z0-9]/g) ?? []).join("");
  const ok = alnum(t).length === alnum(ref).length && !t.includes("\uFFFD");
  if (!ok) bad++;
  console.log(`${n}: alnums ${alnum(t).length}/${alnum(ref).length} ${ok ? "EXACT" : "*** DRIFT ***"}`);
}
console.log(bad === 0 ? "ALL 16 FAMILY MEMBERS EXACT" : `${bad} MEMBERS DRIFTED`);

// dump the changed members' outputs for the toward/away classification
console.log("\n=== THE CHANGED MEMBERS' OUTPUT DUMPS ===");
for (const [p, n] of changed) {
  const raw = readFileSync(p);
  const file = new File([new Uint8Array(raw)], "m.pdf");
  const h = await head.extractTextFromFile(file);
  const c = await cured.extractTextFromFile(file);
  writeFileSync(`/tmp/r125-head-${n.replace(/\W/g, "")}.txt`, h);
  writeFileSync(`/tmp/r125-cured-${n.replace(/\W/g, "")}.txt`, c);
  const ref = execSync(`pdftotext ${p} -`, { encoding: "utf8", maxBuffer: 512 * 1024 * 1024 });
  writeFileSync(`/tmp/r125-ref-${n.replace(/\W/g, "")}.txt`, ref);
  console.log(`${n}: head ${h.length} chars -> cured ${c.length} chars (dumps written to /tmp/r125-*)`);
}
