// r127-cure-experiment2.ts — THE CORRECTED PATCHED-PROTO EXPERIMENT: the
// R127-A cure with the STICKY flag semantics — Tf/Tw/Tz are NEUTRAL (they
// neither set nor clear), Td/TD/T*/BT/cm/q/Q set it (sticky until the next
// push). This preserves the R116-A-upgrade classes (the ReportLab code-block
// lines and the arXiv table rows — their ctx carries BT/cm/Td before the
// final Tf) while joining the clean pen-continues class (ctx = empty or pure
// Tf — the ﬀ ligature + the bibliography + the ReportLab sentence periods).
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import * as crypto from "node:crypto";

const SRC = "/home/z/my-project/eon-hr/src/lib/cv-text.ts";
const PATCHED = "/tmp/r127-cured2.ts";
const src = readFileSync(SRC, "utf8");

// ---- PATCH 1: the walk-level tracking state ----
const A1 = `  const reset = () => {
    pendingEm = 0;
    pendingTy = 0;
    moved = false;
    backward = false;
  };`;
const R1 = `  const reset = () => {
    pendingEm = 0;
    pendingTy = 0;
    moved = false;
    backward = false;
  };
  // R127-A: the pen-continues tracking — the ops since the last show
  let showOpSeq = 0; // increments at every show-op match (Tj/TJ/'/")
  let lastPushSeq = -1; // the showOpSeq at the last pushed piece
  let nonTextTouched = true; // a positioning/text-object/graphics op since the last show? (sticky; true initially — a first show never joins)`;
if (!src.includes(A1)) throw new Error("patch-1 anchor missing");

// ---- PATCH 2: the cure in push() ----
const A2 = `    if (pieces.length === 0) sep = ""; // no leading separator on the first piece`;
const R2 = `    // R127-A: THE PEN-CONTINUES JOIN — a NEW show op (a different Tj/TJ
    // from the previous piece's) with NO positioning op (Td/TD/Tm/T*) and NO
    // text-object/graphics change (BT/cm/q/Q) since the previous show
    // continues the pen exactly where the last glyph ended (ISO 32000-1
    // §9.4.1): the pieces are CONTIGUOUS, never space-separated. The
    // matplotlib PTEX figure class (a mid-word font switch to a Type0
    // ligature glyph — "...e di" TJ + <0001>Tj (the ﬀ) + "erent..." TJ read
    // "di ﬀ erent" where pdftotext reads "diﬀerent"), the arXiv bibliography
    // ("(" Tj + "2023" Tj reads "( 2023" — pdftotext "(2023", 111 measured
    // inversions), and the ReportLab sentence/URL period class (652 decisive
    // joins, 0 spaces, on the r127 census). The standing " " join survives
    // for the OTHER not-moved classes: TJ-internal atoms with no number (the
    // W3C dummy.pdf pin — the same showOpSeq) and every boundary whose
    // intervening ops touched the positioning/text-object/graphics state
    // (the sticky flag) — the Typst every-word-its-own-BT+cm form's word
    // separator AND the R116-A-upgrade classes (the ReportLab code-block
    // lines and the arXiv table rows ride BT/cm/Td under a final Tf; their
    // newlines come from the assembly upgrade on the standing " ").
    if (!moved && pieces.length > 0 && showOpSeq !== lastPushSeq && !nonTextTouched) sep = "";
    if (pieces.length === 0) sep = ""; // no leading separator on the first piece`;
if (!src.includes(A2)) throw new Error("patch-2 anchor missing");

// ---- PATCH 3: clear the flags at push ----
const A3 = `    reset();
    shownSinceTm = true; // a show happened — the next Td is a BETWEEN-SHOWS move (the ty rule lives)
    btFresh = false; // R104-C: the show ends the fresh run — the next Td is a between-shows move
  };`;
const R3 = `    reset();
    lastPushSeq = showOpSeq;
    nonTextTouched = false;
    shownSinceTm = true; // a show happened — the next Td is a BETWEEN-SHOWS move (the ty rule lives)
    btFresh = false; // R104-C: the show ends the fresh run — the next Td is a between-shows move
  };`;
if (!src.includes(A3)) throw new Error("patch-3 anchor missing");

// ---- PATCH 4: the showOpSeq increment at each show-op match (loop head) ----
const A4 = `  while ((m = ops.exec(content))) {
    if (m[1] !== undefined) {`;
const R4 = `  while ((m = ops.exec(content))) {
    if (m[4] !== undefined || m[6] !== undefined || m[7] !== undefined) showOpSeq++; // R127-A: a new show op begins
    if (m[1] !== undefined) {`;
if (!src.includes(A4)) throw new Error("patch-4 anchor missing");

// ---- PATCH 5: the sticky setters — Td/TD, T*, BT, cm, q, Q ----
const A5 = `    if (m[2] !== undefined) {
      const tx = parseFloat(m[2]);`;
const R5 = `    if (m[2] !== undefined) {
      nonTextTouched = true; // R127-A: a positioning op — sticky
      const tx = parseFloat(m[2]);`;
if (!src.includes(A5)) throw new Error("patch-5 anchor missing");

const A6 = `    if (m[0] === "T*") {
      moved = true;
      pendingTy = 1; // the explicit next-line operator
      continue;
    }`;
const R6 = `    if (m[0] === "T*") {
      moved = true;
      pendingTy = 1; // the explicit next-line operator
      nonTextTouched = true; // R127-A: a positioning op — sticky
      continue;
    }`;
if (!src.includes(A6)) throw new Error("patch-6 anchor missing");

const A7 = `    if (m[0] === "BT") {
      // R104-C: a fresh text run begins — the run state resets (the first`;
const R7 = `    if (m[0] === "BT") {
      nonTextTouched = true; // R127-A: a new text object — sticky
      // R104-C: a fresh text run begins — the run state resets (the first`;
if (!src.includes(A7)) throw new Error("patch-7 anchor missing");

const A8 = `    if (m[15] !== undefined) {
      // R112-A: cm CONCATENATES — the operand applies before the standing`;
const R8 = `    if (m[15] !== undefined) {
      nonTextTouched = true; // R127-A: a graphics-state change — sticky
      // R112-A: cm CONCATENATES — the operand applies before the standing`;
if (!src.includes(A8)) throw new Error("patch-8 anchor missing");

const A9 = `    if (m[0] === "q") {
      if (ctmStack.length < 256) ctmStack.push(ctm); // bounded — an adversarial stream cannot grow it forever
      continue;
    }
    if (m[0] === "Q") {
      const prevCtm = ctmStack.pop();
      if (prevCtm) ctm = prevCtm;
      continue;
    }`;
const R9 = `    if (m[0] === "q") {
      nonTextTouched = true; // R127-A: a graphics-state change — sticky
      if (ctmStack.length < 256) ctmStack.push(ctm); // bounded — an adversarial stream cannot grow it forever
      continue;
    }
    if (m[0] === "Q") {
      nonTextTouched = true; // R127-A: a graphics-state change — sticky
      const prevCtm = ctmStack.pop();
      if (prevCtm) ctm = prevCtm;
      continue;
    }`;
if (!src.includes(A9)) throw new Error("patch-9 anchor missing");

let patched = src;
for (const [a, r] of [[A1, R1], [A2, R2], [A3, R3], [A4, R4], [A5, R5], [A6, R6], [A7, R7], [A8, R8], [A9, R9]] as Array<[string, string]>) {
  if (!patched.includes(a)) throw new Error("anchor missing: " + a.slice(0, 60));
  patched = patched.replace(a, r);
}
writeFileSync(PATCHED, patched);
console.log(`patched source written: ${PATCHED} (${patched.length} bytes vs ${src.length})`);

// ---- the drift ledger on the corrected patched module ----
const mod = await import(PATCHED);
const md5 = (s: string) => crypto.createHash("md5").update(s).digest("hex").slice(0, 8);
const na = (s: string) => s.replace(/[^A-Za-z0-9]/g, "");

const members: Array<[string, string, string, number]> = [
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv", "75436914", 70646],
  ["/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx", "d70a708e", 61437],
  ["/tmp/r106-corpus/fontspec.pdf", "fontspec", "9366f8a9", 106183],
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

console.log("\n=== THE DRIFT LEDGER (corrected patch vs the r126 pins) ===");
for (const [p, n, pin, alnumPin] of members) {
  const raw = readFileSync(p);
  const t = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  writeFileSync(`/tmp/r127-c2-${n.replace(/ /g, "_")}.txt`, t);
  const cur = md5(t);
  const alnums = na(t).length;
  console.log(`${n}: ${cur} (pin ${pin}) ${cur === pin ? "IDENTICAL" : "*** CHANGED ***"} · alnums ${alnums} (pin ${alnumPin}) ${alnums === alnumPin ? "exact" : "*** " + (alnums - alnumPin) + " ***"}`);
}

// ---- the 16 family members ----
console.log("\n=== THE 16 FAMILY MEMBERS ===");
const fam: Array<[string, string]> = [
  ["/tmp/skia-cv/john-smith-cv.pdf", "Skia CV"], ["/tmp/skia-cv/variant-control.pdf", "Skia control"],
  ["/tmp/skia-cv/variant-floatlast.pdf", "Skia floatlast"], ["/tmp/skia-cv/variant-absolute.pdf", "Skia absolute"],
  ["/tmp/skia-cv/variant-twopage.pdf", "Skia twopage"], ["/tmp/r113-writers/weasy-cv.pdf", "WeasyPrint CV"],
  ["/tmp/r113-writers/weasy-variant-control.pdf", "WeasyPrint control"], ["/tmp/r113-writers/weasy-variant-floatlast.pdf", "WeasyPrint floatlast"],
  ["/tmp/r113-writers/weasy-variant-absolute.pdf", "WeasyPrint absolute"], ["/tmp/r113-writers/weasy-variant-twopage.pdf", "WeasyPrint twopage"],
  ["/tmp/r113-writers/weasy-variant-display.pdf", "WeasyPrint letterspaced"], ["/tmp/r114-writers/fpdf-variant-control.pdf", "fpdf2 control"],
  ["/tmp/r114-writers/fpdf-variant-absolute.pdf", "fpdf2 dates"], ["/tmp/r114-writers/fpdf-variant-twopage.pdf", "fpdf2 twopage"],
  ["/tmp/r114-writers/fpdf-variant-letterspaced.pdf", "fpdf2 letterspaced"], ["/tmp/r114-writers/fpdf-variant-corefont.pdf", "fpdf2 core14"],
];
let badFam = 0;
for (const [p, n] of fam) {
  const raw = readFileSync(p);
  const t = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const ref = execSync(`pdftotext ${p} -`, { encoding: "utf8", maxBuffer: 512 * 1024 * 1024 });
  const alnum = (s: string) => (s.match(/[A-Za-z0-9]/g) ?? []).join("");
  const ok = alnum(t).length === alnum(ref).length && !t.includes("\uFFFD");
  if (!ok) badFam++;
  console.log(`${n}: alnums ${alnum(t).length}/${alnum(ref).length} ${ok ? "EXACT" : "*** DRIFT ***"}`);
}
console.log(badFam === 0 ? "ALL 16 FAMILY MEMBERS EXACT" : `${badFam} MEMBERS DRIFTED`);

// ---- the regression checks: the two R116-A classes must be preserved ----
console.log("\n=== THE REGRESSION CHECKS ===");
const rl = readFileSync("/tmp/r127-c2-ReportLab.txt", "utf8");
const rlOk = rl.includes("textobject.moveCursor(dx, dy) # from start of current LINE\n(x,y) = textobject.getCursor()\nx = textobject.getX()");
console.log(`ReportLab code block newlines: ${rlOk ? "PRESERVED" : "*** FUSED — REGRESSION ***"}`);
const ax = readFileSync("/tmp/r127-c2-arXiv.txt", "utf8");
const axOk = /Wikipedia Test\n10/.test(ax);
console.log(`arXiv table row newlines (Wikipedia Test\\n10): ${axOk ? "PRESERVED" : "*** FUSED — REGRESSION ***"}`);
const ffOk = ax.includes("diﬀerent") && ax.includes("Use ﬁrst") && ax.includes("Preﬁll");
console.log(`arXiv ligature junctions (diﬀerent/Use ﬁrst/Preﬁll): ${ffOk ? "JOINED ✓" : "*** NOT JOINED ***"}`);
const bibOk = !/\(\s+20\d\d/.test(ax) && !/20\d\d\s+\)/.test(ax);
console.log(`arXiv bibliography "(2023).": ${bibOk ? "CURED ✓" : "*** STILL SPACED ***"}`);
