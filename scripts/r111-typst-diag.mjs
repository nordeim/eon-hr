// r111-typst-diag.mjs — replicate cv-text's scan phases against the Typst
// specimen to find which leg of the f0-resolution chain breaks:
//   1. the raw F-pair scan (F\w+ — uppercase only)
//   2. the /Font-dict-region collector (general names)
//   3. the font-object /ToUnicode census (raw + ObjStm)
//   4. the ObjStm expansion (are the fonts inside object streams?)
// Usage: node scripts/r111-typst-diag.mjs
import { readFileSync } from "node:fs";
import zlib from "node:zlib";

const raw = readFileSync("/tmp/typst-cv/resume.pdf");
const ascii = Buffer.from(raw).toString("latin1");

console.log("== file shape ==");
console.log("size:", raw.length);
console.log("has /ObjStm:", ascii.includes("/ObjStm"));
const objstmCount = (ascii.match(/\/ObjStm/g) || []).length;
console.log("/ObjStm occurrences:", objstmCount);
console.log("/Font dict regions:", (ascii.match(/\/Font\s*<<</g) || []).length);
console.log("f-pairs (lowercase /fN):", (ascii.match(/\/f\d+\s+\d+\s+0\s+R/g) || []).length);

// leg 1: the raw F-pair scan (case-sensitive uppercase F)
const leg1 = [...ascii.matchAll(/\/(F\w+(?:\.\w+)*)\s+(\d+)\s+0\s+R/g)].map(m => `${m[1]}→${m[2]}`);
console.log("\n== leg 1: raw F-pair scan (uppercase F) ==");
console.log(leg1.length ? leg1.slice(0, 8).join(", ") : "NO MATCHES (the Typst names are lowercase)");

// leg 2: the /Font-dict-region collector
console.log("\n== leg 2: /Font-dict-region collector ==");
let collected = [];
for (const rm of ascii.matchAll(/\/Font\s*<<\s*([\w#+\-./\s]+)>>/g)) {
  for (const fm of rm[1].matchAll(/\/(F\w+(?:\.\w+)*|[\w#+.-]+)\s+(\d+)\s+0\s+R/g)) {
    if (fm[1] !== "Font") collected.push(`${fm[1]}→${fm[2]}`);
  }
}
console.log(collected.length ? [...new Set(collected)].join(", ") : "NO MATCHES");
console.log("unique:", new Set(collected.map(x=>x.split("→")[0])).size);

// leg 3: the font-object /ToUnicode census — where do the font objects live?
// find every "N 0 obj" that mentions /Type /Font — raw level
const rawFontObjs = [];
for (const fm of ascii.matchAll(/(\d+)\s+0\s+obj\s*<<([^<>]*(?:<<[^<>]*>>[^<>]*)*)>>/g)) {
  if (/\/Type\s*\/Font\b/.test(fm[2])) {
    const tu = fm[2].match(/\/ToUnicode\s+(\d+)\s+0\s+R/);
    rawFontObjs.push(`obj${fm[1]}${tu ? ` tu=${tu[1]}` : " NO-TU"}`);
  }
}
console.log("\n== leg 3: raw font-object census ==");
console.log(rawFontObjs.length ? rawFontObjs.slice(0, 12).join(", ") : "none at the raw level");

// leg 4: ObjStm expansion — find ObjStm objects and decompress
console.log("\n== leg 4: ObjStm census ==");
let objstmFonts = 0, objstmFontDicts = 0, objstmPages = 0;
for (const m of ascii.matchAll(/(\d+)\s+0\s+obj\s*<<([^>]*)>>\s*stream\r?\n?/g)) {
  if (!/\/ObjStm/.test(m[2])) continue;
  const first = m[0].length + m.index;
  const next = ascii.indexOf("endstream", first);
  if (next < 0) continue;
  let bytes = raw.subarray(first, next);
  let text = "";
  try { text = zlib.inflateSync(Buffer.from(bytes)).toString("latin1"); } catch {
    try { text = zlib.inflateRawSync(Buffer.from(bytes)).toString("latin1"); } catch { continue; }
  }
  const n = /\/N\s+(\d+)/.exec(m[2]);
  if (/\/Type\s*\/Font\b/.test(text)) {
    objstmFonts++;
    if (/\/ToUnicode\s+(\d+)\s+0\s+R/.test(text)) {
      const tuCount = [...text.matchAll(/\/ToUnicode\s+(\d+)\s+0\s+R/g)].length;
      console.log(`  ObjStm obj${m[1]} (N=${n?.[1] ?? "?"}): carries /Type /Font + ${tuCount} /ToUnicode refs`);
    }
  }
  if (/\/Font\s*<</.test(text)) objstmFontDicts++;
  if (/\/Type\s*\/Page\b/.test(text)) objstmPages++;
}
console.log(`ObjStms carrying font objects: ${objstmFonts}, /Font dicts: ${objstmFontDicts}, /Page objects: ${objstmPages}`);

// leg 5: the content streams — are they Flate? do the Tf names match the pieces walk?
console.log("\n== leg 5: content-stream font names (Tf operators) ==");
const tfNames = new Set();
for (const m of ascii.matchAll(/(\d+)\s+0\s+obj\s*<<([^>]*)>>\s*stream\r?\n?/g)) {
  const first = m[0].length + m.index;
  const next = ascii.indexOf("endstream", first);
  if (next < 0) continue;
  let bytes = raw.subarray(first, next);
  let text = "";
  try { text = zlib.inflateSync(Buffer.from(bytes)).toString("latin1"); } catch {
    try { text = zlib.inflateRawSync(Buffer.from(bytes)).toString("latin1"); } catch { text = Buffer.from(bytes).toString("latin1"); }
  }
  if (!/Tf/.test(text) || !/(?:\)|\]|>)\s*(?:Tj|TJ|'|")/.test(text)) continue;
  for (const tf of text.matchAll(/\/(\S+)\s+[\d.+-]+\s+Tf/g)) tfNames.add(tf[1]);
  // sample the ToUnicode CMaps too
  if (text.includes("beginbfchar") || text.includes("beginbfrange")) {
    const sample = text.slice(0, 200).replace(/\n/g, "\\n");
    console.log(`  CMap stream (obj${m[1]}): ${sample.slice(0, 160)}`);
  }
}
console.log("Tf font names seen in content streams:", [...tfNames].join(", "));
