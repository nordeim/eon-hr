// r126-cure-experiment.ts — the patched-proto experiment (the r125
// discipline): apply the three designed cures to a COPY of the committed
// proto, then measure the drift ledger (12 members), the bx coverage, and
// the 16 family members — BEFORE any source change.
//   CURE A — the form own-resources binding fires on the MERGED pairs
//            (the F-scan + the fontPairsOf region pairs): the hyphenated
//            f-0-0 class + the ZaDb/T1_N class bind their own forms.
//   CURE B — the raw-page site gains the ObjStm site's fontPairsOf merge
//            (the r120 asymmetry — the merge's own comment names "the IRS
//            T1_0 class" but the IRS pages are raw-carried).
//   CURE C — the empty-show known-zero-content: an empty raw (or hex) is a
//            zero-advance event, never a blind.
// Usage: bun scripts/r126-cure-experiment.ts
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import * as crypto from "node:crypto";

const SRC = "/home/z/my-project/eon-hr/scripts/protos/cv-text-proto.ts";
const PATCHED = "/tmp/r126-cured-proto.ts";
let src = readFileSync(SRC, "utf8");

// ---- CURE B: the raw-page site's fontPairsOf merge ----
const pageAnchor = `      if (/\\/Type\\s*\\/Page\\b/.test(body)) {
        const refs = contentsRefs(body);
        if (!refs.length) continue;
        for (let ri = 1; ri < refs.length; ri++) contentsPrev.set(refs[ri], refs[ri - 1]); // R125-C: the array chain
        const res = body.match(/\\/Resources\\s+(\\d+)\\s+0\\s+R/);
        const fontRef = inlineFontRef(body);
        if (fonts.size) refs.forEach((r) => pageFonts.set(r, fonts));`;
const pagePatched = pageAnchor.replace(
  `        if (fonts.size) refs.forEach((r) => pageFonts.set(r, fonts));`,
  `        for (const [k, v] of fontPairsOf(body)) fonts.set(k, v); // R126-B: the raw-site merge (the ObjStm site's own form — the r120 asymmetry)
        if (fonts.size) refs.forEach((r) => pageFonts.set(r, fonts));`
);
if (!src.includes(pageAnchor)) throw new Error("CURE B page anchor not found");
src = src.replace(pageAnchor, pagePatched);

// ---- CURE A: the form binding on the MERGED pairs ----
const formAnchor = `      } else {
        if (fonts.size) objFonts.set(parseInt(rm[1], 10), fonts);
        // R125-D: THE FORM XOBJECT'S OWN RESOURCES — a Form XObject carrying
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
        }`;
const formPatched = `      } else {
        if (fonts.size) objFonts.set(parseInt(rm[1], 10), fonts);
        // R125-D: THE FORM XOBJECT'S OWN RESOURCES — a Form XObject carrying
        // an inline /Resources /Font region binds ITS OWN object number: its
        // content stream walks as a candidate with no page binding (the
        // LaTeX PTEX figure class — the embedded-figure PDFs), and the
        // candidate chain resolved the /F-name to the FIRST same-named font
        // in file order (a DIFFERENT form's font — the arXiv Font1 misbind:
        // the Calibri-Bold subset answering for the ArialMT pieces, the
        // codes falling on the wrong /W's zero arms). The form's own pairs
        // are the stream's REAL bindings, exactly like a page's own.
        // R126-A: the binding fires on the MERGED pairs — the F-scan's
        // \\w class rejects the hyphenated names (f-0-0 — the matplotlib
        // figure class) and the non-F-prefixed names (ZaDb, T1_N — the
        // AcroForm class): those forms' own bindings never fired and the
        // candidate chain resolved the name to the FIRST same-named object.
        const r126gpairs = fontPairsOf(body);
        if (r126gpairs.size) {
          for (const [k, v] of r126gpairs) fonts.set(k, v);
        }
        if (fonts.size && /\\/Subtype\\s*\\/Form\\b/.test(body)) {
          pageFonts.set(parseInt(rm[1], 10), fonts);
        }`;
if (!src.includes(formAnchor)) throw new Error("CURE A form anchor not found");
src = src.replace(formAnchor, formPatched);

// ---- CURE C: the empty-show known-zero-content ----
const litAnchor = `          if (we.codeLen === 2) {
            if (raw.length === 0 || raw.length % 2 !== 0) { blind = true; continue; }
            codes = [];
            for (let i = 0; i < raw.length; i += 2) codes.push(raw.charCodeAt(i) * 256 + raw.charCodeAt(i + 1));
          } else {
            codes = [];
            for (let i = 0; i < raw.length; i++) codes.push(raw.charCodeAt(i));
          }`;
const litPatched = `          if (we.codeLen === 2) {
            if (raw.length === 0) { (piece as { bx?: number }).bx = origin + adv; continue; } // R126-C: the EMPTY show — a known zero-content event, never a blind
            if (raw.length % 2 !== 0) { blind = true; continue; }
            codes = [];
            for (let i = 0; i < raw.length; i += 2) codes.push(raw.charCodeAt(i) * 256 + raw.charCodeAt(i + 1));
          } else {
            codes = [];
            for (let i = 0; i < raw.length; i++) codes.push(raw.charCodeAt(i));
          }`;
if (!src.includes(litAnchor)) throw new Error("CURE C lit anchor not found");
src = src.replace(litAnchor, litPatched);
const hexAnchor = `          if (hx.length === 0 || hx.length % per !== 0 || !/^[0-9A-Fa-f]+$/.test(hx)) { blind = true; continue; }`;
const hexPatched = `          if (hx.length === 0) { (piece as { bx?: number }).bx = origin + adv; continue; } // R126-C: the EMPTY hex show — the same zero-content class
          if (hx.length % per !== 0 || !/^[0-9A-Fa-f]+$/.test(hx)) { blind = true; continue; }`;
if (!src.includes(hexAnchor)) throw new Error("CURE C hex anchor not found");
src = src.replace(hexAnchor, hexPatched);

writeFileSync(PATCHED, src);
console.log("cured proto written:", PATCHED);

const cured = await import(PATCHED);
const head = await import("/home/z/my-project/eon-hr/src/lib/cv-text");
const md5 = (s: string) => crypto.createHash("md5").update(s).digest("hex").slice(0, 8);
const na = (s: string) => s.replace(/[^A-Za-z0-9]/g, "");

const members: [string, string, string, number][] = [
  ["/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv", "1c189607", 70646],
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

console.log("\n=== THE DRIFT LEDGER (HEAD pin vs the CURED extraction) ===");
const changed: [string, string][] = [];
for (const [p, n, pin, alnumPin] of members) {
  const raw = readFileSync(p);
  const file = new File([new Uint8Array(raw)], "m.pdf");
  const t = await cured.extractTextFromFile(file);
  const cur = md5(t);
  const alnums = na(t).length;
  const status = cur === pin ? "IDENTICAL" : "CHANGED";
  const alnumOk = alnums === alnumPin ? "alnums exact" : `*** ALNUM DRIFT ${alnums} vs ${alnumPin} ***`;
  console.log(`${n}: ${cur} (HEAD ${pin}) ${status} · ${alnumOk}`);
  if (status === "CHANGED") changed.push([p, n]);
}

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

// dump the changed members for the toward/away classification
console.log("\n=== THE CHANGED MEMBERS' OUTPUT DUMPS ===");
for (const [p, n] of changed) {
  const raw = readFileSync(p);
  const file = new File([new Uint8Array(raw)], "m.pdf");
  const h = await head.extractTextFromFile(file);
  const c = await cured.extractTextFromFile(file);
  const key = n.replace(/\W/g, "");
  writeFileSync(`/tmp/r126-head-${key}.txt`, h);
  writeFileSync(`/tmp/r126-cured-${key}.txt`, c);
  const ref = execSync(`pdftotext ${p} -`, { encoding: "utf8", maxBuffer: 512 * 1024 * 1024 });
  writeFileSync(`/tmp/r126-ref-${key}.txt`, ref);
  console.log(`${n}: head ${h.length} chars -> cured ${c.length} chars (dumps at /tmp/r126-*)`);
}
