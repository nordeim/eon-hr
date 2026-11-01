// r116-family-checks.ts — session 116 / parity round 115: the regenerated
// families verified at the FINAL source. Every member's alnum pin = its own
// pdftotext count (the r115 pin-label-swap trap hit again in-round — the
// labels below verified member-by-member against pdftotext).
// Usage: bun scripts/r116-family-checks.ts
import { readFileSync } from "node:fs";
import crypto from "node:crypto";

const mod = await import("/home/z/my-project/eon-hr/src/lib/cv-text");
const md5 = (s: string) => crypto.createHash("md5").update(s).digest("hex").slice(0, 8);
const na = (s: string) => s.replace(/[^A-Za-z0-9]/g, "");
const families: [string, string, number][] = [
  ["/tmp/skia-cv/john-smith-cv.pdf", "Skia CV", 1553],
  ["/tmp/skia-cv/variant-control.pdf", "Skia control", 423],
  ["/tmp/skia-cv/variant-absolute.pdf", "Skia absolute", 433],
  ["/tmp/skia-cv/variant-floatlast.pdf", "Skia floatlast", 438],
  ["/tmp/skia-cv/variant-twopage.pdf", "Skia twopage", 1616],
  ["/tmp/r113-writers/weasy-cv.pdf", "WeasyPrint CV", 782],
  ["/tmp/r113-writers/weasy-variant-control.pdf", "Weasy control", 423],
  ["/tmp/r113-writers/weasy-variant-absolute.pdf", "Weasy absolute", 433],
  ["/tmp/r113-writers/weasy-variant-floatlast.pdf", "Weasy floatlast", 438],
  ["/tmp/r113-writers/weasy-variant-twopage.pdf", "Weasy twopage", 1616],
  ["/tmp/r113-writers/weasy-variant-display.pdf", "Weasy display", 243],
  ["/tmp/r114-writers/fpdf-variant-control.pdf", "fpdf2 control", 860],
  ["/tmp/r114-writers/fpdf-variant-absolute.pdf", "fpdf2 absolute", 860],
  ["/tmp/r114-writers/fpdf-variant-twopage.pdf", "fpdf2 twopage", 1020],
  ["/tmp/r114-writers/fpdf-variant-letterspaced.pdf", "fpdf2 letterspaced", 860],
  ["/tmp/r114-writers/fpdf-variant-corefont.pdf", "fpdf2 corefont", 860],
];
let drift = 0;
for (const [p, n, pin] of families) {
  const raw = readFileSync(p);
  const t = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
  const alnums = na(t).length;
  const ok = alnums === pin;
  if (!ok) drift++;
  console.log(`${n}: alnums ${alnums} (pin ${pin}) ${ok ? "PIN HOLDS" : "*** DRIFT ***"} md5 ${md5(t)} | U+FFFD ${t.includes("\uFFFD") ? "YES" : "no"}`);
}
console.log(drift === 0 ? "ALL 16 REGENERATED FAMILY MEMBERS EXACT" : `${drift} MEMBERS DRIFTED`);
