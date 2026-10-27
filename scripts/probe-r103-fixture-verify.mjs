// probe-r103-fixture-verify.mjs — build the EXACT E2E fixture and run it
// through the extractor + the scorer's logic: the FIX yield, the score
// components, and the mutation simulations (M1/M2 applied as text-level
// transforms mirroring the code mutations).
import { extractTextFromFile } from "../src/lib/cv-text.ts";

// ---- the fixture (verbatim from the spec) ----
async function pdfObjects(objects) {
  const enc = (s) => new TextEncoder().encode(s);
  const parts = [];
  for (let i = 0; i < objects.length; i++) {
    const obj = objects[i];
    if ("raw" in obj) {
      parts.push(enc(`${i + 1} 0 obj\n${obj.raw}\nendobj\n`));
    } else {
      const zlib = new CompressionStream("deflate");
      const deflated = new Uint8Array(await new Response(new Blob([obj.stream]).stream().pipeThrough(zlib)).arrayBuffer());
      parts.push(enc(`${i + 1} 0 obj\n<< ${obj.dict} /Length ${deflated.length} >>\nstream\r\n`));
      parts.push(deflated);
      parts.push(enc("\r\nendstream\nendobj\n"));
    }
  }
  parts.push(enc("trailer\n<< /Root 1 0 R >>\n%%EOF"));
  const total = parts.reduce((n, p) => n + p.length, 0);
  const pdf = new Uint8Array(total);
  let o = 0;
  for (const p of parts) { pdf.set(p, o); o += p.length; }
  return pdf;
}
function cmap(pairs) {
  const entries = pairs.map(([c, u]) => `<${c}> <${u}>`).join("\n");
  return `/CIDInit/ProcSet findresource begin\n12 dict begin\nbegincmap\n/CIDSystemInfo<< /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def\n/CMapName/Adobe-Identity-UCS def\n/CMapType 2 def\n1 begincodespacerange\n<00> <FF>\nendcodespacerange\n${pairs.length} beginbfchar\n${entries}\nendbfchar\nendcmap\nCMapName currentdict /CMap defineresource pop\nend\nend`;
}

const skiaWords = ["securely", "support", "specialist", "closely", "people"];
const luatexWords = ["admin", "technology", "oriented", "management", "optimization"];
const words = [...skiaWords, "systems", "detail", "platform", ...luatexWords];
const letters = [...new Set(words.join(""))];
const codeOf = new Map(letters.map((ch, i) => [ch, (i + 1).toString(16).padStart(2, "0").toUpperCase()]));
const SPACE = (letters.length + 1).toString(16).padStart(2, "0").toUpperCase();
const f2Map = [
  ...letters.map((ch) => [codeOf.get(ch), ch.charCodeAt(0).toString(16).padStart(4, "0").toUpperCase()]),
  [SPACE, "0020"],
];
const hexOf = (w) => [...w].map((ch) => codeOf.get(ch)).join("");

let tx = 0;
const skiaBlocks = [];
const skiaWord = (w, width) => { skiaBlocks.push(`BT /F2 16 Tf 1 0 0 -1 100 50 Tm ${tx.toFixed(1)} -14.2578125 Td <${hexOf(w)}> Tj ET`); tx += width + 4; };
const skiaSpace = () => { skiaBlocks.push(`BT /F2 16 Tf 1 0 0 -1 100 50 Tm ${tx.toFixed(1)} -14.2578125 Td <${SPACE}> Tj ET`); tx += 4; };
const skiaSplit = (first, rest, firstWidth) => {
  skiaBlocks.push(`BT /F2 16 Tf 1 0 0 -1 100 50 Tm ${tx.toFixed(1)} -14.2578125 Td <${hexOf(first)}> Tj ${firstWidth.toFixed(1)} 0 Td <${hexOf(rest)}> Tj ET`);
  tx += firstWidth + (rest.length + 1) * 9 + 4;
};
skiaWord("securely", 60); skiaSpace(); skiaWord("support", 56); skiaSpace(); skiaWord("specialist", 78);
skiaSpace(); skiaWord("closely", 52); skiaSpace(); skiaWord("people", 50); skiaSpace();
skiaSplit("sys", "tems", 24.0); skiaSpace(); skiaSplit("det", "ail", 23.6); skiaSpace(); skiaSplit("pla", "tform", 22.0);
const stream1 = skiaBlocks.join("\n");

const glyphBlocks = [];
let x = 100;
const glyph = (ch, dx) => { x += dx; glyphBlocks.push(`BT /F2 10 Tf 1 0 0 1 ${x.toFixed(1)} 650 Tm [<${codeOf.get(ch)}>]TJ ET`); };
for (const w of luatexWords) {
  for (const ch of w) glyph(ch, 4.8 + (ch.charCodeAt(0) % 3) * 0.4);
  x += 12.5;
}
const stream2 = glyphBlocks.join("\n");

const pdf = await pdfObjects([
  { raw: "<< /Type /Catalog /Pages 8 0 R >>" },
  { dict: "/Filter /FlateDecode", stream: cmap(f2Map) },
  { raw: "<< /Type /Font /Subtype /TrueType /BaseFont /Vocabulary /ToUnicode 2 0 R >>" },
  { raw: "<< /Font << /F2 3 0 R >> >>" },
  { dict: "/Filter /FlateDecode", stream: stream1 },
  { dict: "/Filter /FlateDecode", stream: stream2 },
  { raw: "<< /Type /Pages /Kids [] >>" },
]);

const file = new File([pdf], "r103 gdocs luatex cv.pdf", { type: "application/pdf" });
const text = await extractTextFromFile(file);
console.log("=== the FIX yield ===");
console.log(JSON.stringify(text));
const alnum = text.replace(/[^A-Za-z0-9]/g, "").length;
console.log("alnum count:", alnum, "(guard 40:", alnum >= 40 ? "CLEARS" : "FAILS" + "}");

// ---- the scorer (verbatim from the route) ----
const STOPWORDS = new Set(["the","and","for","with","that","this","from","have","will","are","was","you","your","our","their","they","who","what","when","where","how","why","all","any","can","has","had","not","but","out","use","using","work","working","role","team","teams","job","jobs","company","companies","years","year","looking","join","joining","seeking","candidate","candidates","experience","experienced","strong","good","great","excellent","must","should","plus"]);
const tokenize = (t) => t.toLowerCase().split(/[^a-z0-9+#]+/).filter((t) => t.length >= 3);
const JOB_KEYWORDS = ["system","admin","detail","oriented","tech","savvy","technology","specialist","support","implementation","management","optimization","driven","platform","closely","people","leaders","ensure","systems","run","smoothly","securely","effectively","key"];
const containsToken = (tokens, k) => tokens.includes(k) || tokens.some((t) => (t.startsWith(k) || k.startsWith(t)) && Math.min(t.length, k.length) >= 4);
const score = (cvText) => {
  const cvTokens = tokenize(cvText);
  const matched = JOB_KEYWORDS.filter((k) => containsToken(cvTokens, k));
  const skillsMatch = Math.round((matched.length / JOB_KEYWORDS.length) * 100);
  const wordCount = cvText.trim().split(/\s+/).filter(Boolean).length;
  const aiScore = Math.max(5, Math.min(98, Math.round(skillsMatch * 0.6 + Math.min(18, 0) + Math.min(10, 0) + Math.min(10, Math.floor(wordCount / 60)))));
  return { matched, skillsMatch, aiScore, wordCount };
};
console.log("\nFIX:", JSON.stringify(score(text)));

// ---- the mutation simulations (text-level mirrors of the code mutations) ----
// M1: the Tm rule reverted — the LuaTeX region's letters space apart
const m1Text = text.replace(new RegExp(`(${luatexWords.join("")}).*?`), "") + " " + luatexWords.map((w) => w.split("").join(" ")).join(" ");
// simpler robust mirror: take the FIX yield, replace each luatex word with its letter-spaced form
let m1 = text;
for (const w of luatexWords) m1 = m1.replace(new RegExp(`\\b${w}\\b`), w.split("").join(" "));
console.log("M1 (luatex soup'd):", JSON.stringify(score(m1)));

// M2: the conditional removed — the split words stay split
let m2 = text;
for (const [a, b] of [["s", "ystems"], ["d", "etail"], ["p", "latform"]]) m2 = m2.replace(new RegExp(`\\b${a}${b}\\b`), `${a} ${b}`);
console.log("M2 (splits stay split):", JSON.stringify(score(m2)));
