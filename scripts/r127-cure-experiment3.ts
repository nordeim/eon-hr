// r127-cure-experiment3.ts — THE FINAL PATCHED-PROTO EXPERIMENT: the R127-A
// cure with the COMPLETE sticky-flag coverage — Tm joins the setters (the IRS
// "Form"+"1040" title class: per-word Tms at the same origin — the positioning
// memory must survive), and the '/'"' next-line show handlers update the
// push-state flags like every other show.
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import * as crypto from "node:crypto";

const SRC = "/home/z/my-project/eon-hr/src/lib/cv-text.ts";
const PATCHED = "/tmp/r127-cured3.ts";
const src = readFileSync(SRC, "utf8");

const patches: Array<[string, string]> = [
  // 1: the walk-level tracking state
  [`  const reset = () => {
    pendingEm = 0;
    pendingTy = 0;
    moved = false;
    backward = false;
  };`,
`  const reset = () => {
    pendingEm = 0;
    pendingTy = 0;
    moved = false;
    backward = false;
  };
  // R127-A: the pen-continues tracking — the ops since the last show
  let showOpSeq = 0; // increments at every show-op match (Tj/TJ/'/")
  let lastPushSeq = -1; // the showOpSeq at the last pushed piece
  let nonTextTouched = true; // a positioning/text-object/graphics op since the last show? (sticky; true initially — a first show never joins)`],
  // 2: the cure in push()
  [`    if (pieces.length === 0) sep = ""; // no leading separator on the first piece`,
`    // R127-A: THE PEN-CONTINUES JOIN — a NEW show op (a different Tj/TJ
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
    // separator, the IRS per-word-Tm title class ("Form" + "1040" — the Tm
    // origin repeats, the positioning memory sticky), AND the R116-A-upgrade
    // classes (the ReportLab code-block lines and the arXiv table rows ride
    // BT/cm/Td under a final Tf; their newlines come from the assembly
    // upgrade on the standing " ").
    if (!moved && pieces.length > 0 && showOpSeq !== lastPushSeq && !nonTextTouched) sep = "";
    if (pieces.length === 0) sep = ""; // no leading separator on the first piece`],
  // 3: clear the flags at push
  [`    reset();
    shownSinceTm = true; // a show happened — the next Td is a BETWEEN-SHOWS move (the ty rule lives)
    btFresh = false; // R104-C: the show ends the fresh run — the next Td is a between-shows move
  };`,
`    reset();
    lastPushSeq = showOpSeq;
    nonTextTouched = false;
    shownSinceTm = true; // a show happened — the next Td is a BETWEEN-SHOWS move (the ty rule lives)
    btFresh = false; // R104-C: the show ends the fresh run — the next Td is a between-shows move
  };`],
  // 4: the showOpSeq increment (loop head)
  [`  while ((m = ops.exec(content))) {
    if (m[1] !== undefined) {`,
`  while ((m = ops.exec(content))) {
    if (m[4] !== undefined || m[6] !== undefined || m[7] !== undefined) showOpSeq++; // R127-A: a new show op begins
    if (m[1] !== undefined) {`],
  // 5: Td/TD sticky
  [`    if (m[2] !== undefined) {
      const tx = parseFloat(m[2]);`,
`    if (m[2] !== undefined) {
      nonTextTouched = true; // R127-A: a positioning op — sticky
      const tx = parseFloat(m[2]);`],
  // 6: T* sticky
  [`    if (m[0] === "T*") {
      moved = true;
      pendingTy = 1; // the explicit next-line operator
      continue;
    }`,
`    if (m[0] === "T*") {
      moved = true;
      pendingTy = 1; // the explicit next-line operator
      nonTextTouched = true; // R127-A: a positioning op — sticky
      continue;
    }`],
  // 7: BT sticky
  [`    if (m[0] === "BT") {
      // R104-C: a fresh text run begins — the run state resets (the first`,
`    if (m[0] === "BT") {
      nonTextTouched = true; // R127-A: a new text object — sticky
      // R104-C: a fresh text run begins — the run state resets (the first`],
  // 8: cm sticky
  [`    if (m[15] !== undefined) {
      // R112-A: cm CONCATENATES — the operand applies before the standing`,
`    if (m[15] !== undefined) {
      nonTextTouched = true; // R127-A: a graphics-state change — sticky
      // R112-A: cm CONCATENATES — the operand applies before the standing`],
  // 9: q/Q sticky
  [`    if (m[0] === "q") {
      if (ctmStack.length < 256) ctmStack.push(ctm); // bounded — an adversarial stream cannot grow it forever
      continue;
    }
    if (m[0] === "Q") {
      const prevCtm = ctmStack.pop();
      if (prevCtm) ctm = prevCtm;
      continue;
    }`,
`    if (m[0] === "q") {
      nonTextTouched = true; // R127-A: a graphics-state change — sticky
      if (ctmStack.length < 256) ctmStack.push(ctm); // bounded — an adversarial stream cannot grow it forever
      continue;
    }
    if (m[0] === "Q") {
      nonTextTouched = true; // R127-A: a graphics-state change — sticky
      const prevCtm = ctmStack.pop();
      if (prevCtm) ctm = prevCtm;
      continue;
    }`],
  // 10: Tm sticky (the missing piece — the IRS per-word-Tm title class)
  [`      tlm = [a, b, c, d, e, f]; // R112-A: Tm sets the line matrix verbatim`,
`      tlm = [a, b, c, d, e, f]; // R112-A: Tm sets the line matrix verbatim
      nonTextTouched = true; // R127-A: a positioning op — sticky (the origin-to-origin delta rule may leave moved=false, the memory must not)`],
  // 11: the literal next-line show (' / ") — the push-state flags
  [`      if (m[5] === "'" || m[5] === '"') {
        // the next-line shows: always a line break, the pending move consumed
        const pos = curPos();
        pieces.push({ sep: pieces.length === 0 ? "" : "\\n", font: curFont, kind: "lit", text, raw: rawText, ...(pos ?? {}) });
        reset();
      } else {`,
`      if (m[5] === "'" || m[5] === '"') {
        // the next-line shows: always a line break, the pending move consumed
        const pos = curPos();
        pieces.push({ sep: pieces.length === 0 ? "" : "\\n", font: curFont, kind: "lit", text, raw: rawText, ...(pos ?? {}) });
        reset();
        lastPushSeq = showOpSeq; // R127-A: a show happened — the push-state updates like every other
        nonTextTouched = false;
      } else {`],
];

let patched = src;
for (const [a, r] of patches) {
  if (!patched.includes(a)) throw new Error("anchor missing: " + a.slice(0, 60).replace(/\n/g, "\\n"));
  patched = patched.replace(a, r);
}
writeFileSync(PATCHED, patched);
console.log(`patched source written: ${PATCHED} (${patched.length} bytes vs ${src.length})`);

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
  ["/tmp/typst-cv/resume.pdf", "Typst_resume", "7e3033d7", 793],
  ["/tmp/typst-cv/resume2.pdf", "Typst_resume2", "d4c51041", 793],
  ["/tmp/typst-cv/coverletter.pdf", "Typst_coverletter", "676f38ab", 897],
  ["/tmp/typst-cv/coverletter2.pdf", "Typst_coverletter2", "74c60344", 871],
];

console.log("\n=== THE DRIFT LEDGER (final patch vs the r126 pins) ===");
for (const [p, n, pin, alnumPin] of members) {
  const raw = readFileSync(p);
  const t = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  writeFileSync(`/tmp/r127-c3-${n}.txt`, t);
  const cur = md5(t);
  const alnums = na(t).length;
  console.log(`${n}: ${cur} (pin ${pin}) ${cur === pin ? "IDENTICAL" : "*** CHANGED ***"} · alnums ${alnums} (pin ${alnumPin}) ${alnums === alnumPin ? "exact" : "*** " + (alnums - alnumPin) + " ***"}`);
}

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

console.log("\n=== THE REGRESSION + CURE CHECKS ===");
const rl = readFileSync("/tmp/r127-c3-ReportLab.txt", "utf8");
console.log(`ReportLab code-block newlines: ${rl.includes("(x,y) = textobject.getCursor()\nx = textobject.getX()") ? "PRESERVED" : "*** FUSED ***"}`);
const ax = readFileSync("/tmp/r127-c3-arXiv.txt", "utf8");
console.log(`arXiv table-row newlines (Test\\n10): ${/Wikipedia Test\n10/.test(ax) ? "PRESERVED" : "*** FUSED ***"}`);
console.log(`arXiv ligature junctions: ${ax.includes("diﬀerent") && ax.includes("Use ﬁrst") && ax.includes("Preﬁll") ? "JOINED ✓" : "*** NOT JOINED ***"}`);
console.log(`arXiv bibliography "(2023).": ${!/\(\s+20\d\d/.test(ax) && !/20\d\d\s+\)/.test(ax) ? "CURED ✓" : "*** STILL SPACED ***"}`);
const irs = readFileSync("/tmp/r127-c3-IRS.txt", "utf8");
console.log(`IRS title "Form 1040": ${irs.includes("Form 1040") ? "SPACE KEPT ✓" : "*** JOINED — REGRESSION ***"}`);
