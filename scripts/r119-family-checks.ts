// r119-family-checks.ts — the 16 family members at the final source
// (Skia x5, WeasyPrint x6, fpdf2 x5): alnum-exact + form probes.
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const mod = await import("/home/z/my-project/eon-hr/src/lib/cv-text");
const members: [string, string][] = [
  ["/tmp/skia-cv/john-smith-cv.pdf", "Skia CV"],
  ["/tmp/skia-cv/variant-control.pdf", "Skia control"],
  ["/tmp/skia-cv/variant-floatlast.pdf", "Skia floatlast"],
  ["/tmp/skia-cv/variant-absolute.pdf", "Skia absolute"],
  ["/tmp/skia-cv/variant-twopage.pdf", "Skia twopage"],
  ["/tmp/r113-writers/weasy-cv.pdf", "WeasyPrint CV"],
  ["/tmp/r113-writers/weasy-variant-control.pdf", "WeasyPrint control"],
  ["/tmp/r113-writers/weasy-variant-floatlast.pdf", "WeasyPrint floatlast"],
  ["/tmp/r113-writers/weasy-variant-absolute.pdf", "WeasyPrint absolute"],
  ["/tmp/r113-writers/weasy-variant-twopage.pdf", "WeasyPrint twopage"],
  ["/tmp/r113-writers/weasy-variant-display.pdf", "WeasyPrint letterspaced"],
  ["/tmp/r114-writers/fpdf-variant-control.pdf", "fpdf2 control"],
  ["/tmp/r114-writers/fpdf-variant-absolute.pdf", "fpdf2 dates"],
  ["/tmp/r114-writers/fpdf-variant-twopage.pdf", "fpdf2 twopage"],
  ["/tmp/r114-writers/fpdf-variant-letterspaced.pdf", "fpdf2 letterspaced"],
  ["/tmp/r114-writers/fpdf-variant-corefont.pdf", "fpdf2 core14"],
];
let bad = 0;
for (const [p, n] of members) {
  try {
    const raw = readFileSync(p);
    const t = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
    const ref = execSync(`pdftotext ${p} -`, { encoding: "utf8", maxBuffer: 512 * 1024 * 1024 });
    const alnum = (s: string) => (s.match(/[A-Za-z0-9]/g) ?? []).join("");
    const pct = ref.length ? (100 * (t.replace(/[^A-Za-z0-9]/g, "").length) / Math.max(1, alnum(ref).length)).toFixed(2) : "0";
    const ok = alnum(t).length === alnum(ref).length && !t.includes("\uFFFD");
    if (!ok) bad++;
    console.log(`${n}: alnums ${alnum(t).length}/${alnum(ref).length} (${pct}%) ${ok ? "EXACT" : "*** DRIFT ***"}`);
  } catch (e) {
    console.log(`${n}: FILE MISSING (${String(e).slice(0, 40)})`);
  }
}
console.log(bad === 0 ? "ALL 16 FAMILY MEMBERS EXACT" : `${bad} MEMBERS DRIFTED`);
