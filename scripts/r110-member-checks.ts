// r110-member-checks.ts — the Prawn member's ground-truth checks (the r109
// standard): our prototype's extraction vs pdftotext, member-for-member.
// Usage: bun scripts/r110-member-checks.ts
import { readFileSync } from "node:fs";

// the R108-A lesson: a literal .ts-extension import breaks tsc/build on
// any tree without the file — the variable-path form is invisible to the
// static resolver, resolved at runtime
const protoPath = process.argv[2] ?? "/home/z/my-project/eon-hr/src/lib/cv-text";
const protoMod = await import(protoPath);
const raw = readFileSync("/tmp/r110-prawn-manual.pdf");
const ours = await protoMod.extractTextFromFile(new File([new Uint8Array(raw)], "prawn.pdf"));
const ref = readFileSync("/tmp/r110-prawn-pdftotext.txt", "utf8");

const norm = (s: string) => s.replace(/[^A-Za-z0-9]+/g, "");
const oa = norm(ours), ra = norm(ref);
console.log("ours alnums:", oa.length, "| pdftotext alnums:", ra.length);
console.log("alnum-identical:", oa === ra ? "YES — member-for-member" : "NO — inspecting diffs…");
if (oa !== ra) {
  // find the first divergence
  let i = 0;
  while (i < Math.min(oa.length, ra.length) && oa[i] === ra[i]) i++;
  console.log(`first divergence at alnum ${i}:`);
  console.log("  ours: …", JSON.stringify(oa.slice(Math.max(0, i - 40), i + 40)));
  console.log("  ref : …", JSON.stringify(ra.slice(Math.max(0, i - 40), i + 40)));
}

// the r109-style member checks: high-code glyphs, no U+FFFD, real probes
const checks: [string, boolean][] = [
  ["bullet • (U+2022, code 0xa5)", ours.includes("•")],
  ["pi π (U+03C0, code 0xb9)", ours.includes("π")],
  ["degree ° (U+00B0, code 0xa1)", ours.includes("°")],
  ["fhook ƒ (U+0192, code 0xc4)", ours.includes("ƒ")],
  ["ò (U+00F2, code 0x98)", ours.includes("ò")],
  ["nbsp (U+00A0, code 0xca)", ours.includes(" ")],
  ["probe 'Prawn'", ours.includes("Prawn")],
  ["probe 'Document'", ours.includes("Document")],
  ["probe 'Table'", ours.includes("Table")],
  ["ZERO U+FFFD", !ours.includes("\uFFFD")],
];
for (const [n, ok] of checks) console.log(`${ok ? "PASS" : "*** FAIL ***"} — ${n}`);
const bullets = (ours.match(/•/g) ?? []).length;
const refBullets = (ref.match(/•/g) ?? []).length;
console.log(`bullets: ours ${bullets} | pdftotext ${refBullets}`);
const pis = (ours.match(/π/g) ?? []).length;
const refPis = (ref.match(/π/g) ?? []).length;
console.log(`π: ours ${pis} | pdftotext ${refPis}`);
