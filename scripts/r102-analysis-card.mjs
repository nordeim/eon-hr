#!/usr/bin/env node
// r102-analysis-card.mjs — the live post-fix verify: a LibreOffice-shaped
// PDF (the 8th writer family: an /Image member + the two-font chain + the
// +110 T-overhang kern splits — every keyword rides F2's font-scoped hex
// atoms) through the :3200 UI → the analysis card screenshot → the API row
// → the cleanup. Snapshot-ref clicks (the §109 reliable path).
import { execSync } from "node:child_process";

function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 160); } }

// ---- build the LibreOffice-shaped PDF (the E2E-audited design) ----
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

const words = ["technology", "systems", "securely", "support", "specialist", "platform"];
const letters = [...new Set(words.join(""))];
const codeOf = new Map(letters.map((ch, i) => [ch, (i + 1).toString(16).padStart(2, "0").toUpperCase()]));
const SPACE = (letters.length + 1).toString(16).padStart(2, "0").toUpperCase();
const f2Map = [
  ...letters.map((ch) => [codeOf.get(ch), ch.charCodeAt(0).toString(16).padStart(4, "0").toUpperCase()]),
  [SPACE, "0020"],
];
const decoys = "qwzvxjkbmqwzvxjkbm";
const f1Map = f2Map.map(([c], i) => [c, decoys.charCodeAt(i % decoys.length).toString(16).padStart(4, "0").toUpperCase()]);
const wordArray = (w) =>
  `[<${codeOf.get(w[0])}> 110 <${[...w.slice(1)].map((ch) => codeOf.get(ch)).join("")}${SPACE}>] TJ`;
const content = `BT /F2 11 Tf ${words.map(wordArray).join(" ")} ET`;

const pdf = await pdfObjects([
  { raw: "<< /Type /Catalog /Pages 8 0 R >>" },
  { dict: "/Filter /FlateDecode", stream: cmap(f1Map) },
  { raw: "<< /Type /Font /Subtype /TrueType /BaseFont /Decoy /ToUnicode 2 0 R >>" },
  { dict: "/Filter /FlateDecode", stream: cmap(f2Map) },
  { raw: "<< /Type /Font /Subtype /TrueType /BaseFont /Vocabulary /ToUnicode 4 0 R >>" },
  { raw: "<< /Font << /F1 3 0 R /F2 5 0 R >> >>" },
  { dict: "/Type /XObject /Subtype /Image /Width 320 /Height 240 /ColorSpace /DeviceRGB", stream: "(imagegarbage filler noise) Tj ".repeat(40) },
  { dict: "/Filter /FlateDecode", stream: content },
]);
const pdfPath = "/home/z/my-project/tmp-r102/r102-live-cv.pdf";
await (await import("node:fs/promises")).writeFile(pdfPath, pdf);
console.log(`pdf built: ${pdfPath} (${pdf.length} bytes)`);

// ---- the UI walk: login → recruitment → the AI CV Upload tab → upload ----
const S = "loc102verify";
run(`agent-browser --session ${S} close 2>/dev/null; true`);
run(`agent-browser --session ${S} set viewport 1440 900`);
run(`agent-browser --session ${S} open http://127.0.0.1:3200/login`);
await new Promise((r) => setTimeout(r, 3000));
run(`agent-browser --session ${S} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise((r) => setTimeout(r, 400));
run(`agent-browser --session ${S} fill 'input[type=password]' '$Abcd1234'`);
await new Promise((r) => setTimeout(r, 400));
const snap = run(`agent-browser --session ${S} snapshot -i -c`);
const m = snap.match(/- button "[^"]*[Ss]ign in[^"]*" \[ref=(\w+)\]/);
if (m) run(`agent-browser --session ${S} click @${m[1]}`);
await new Promise((r) => setTimeout(r, 5000));

run(`agent-browser --session ${S} open http://127.0.0.1:3200/recruitment`);
await new Promise((r) => setTimeout(r, 4500));

// the AI CV Upload tab (the controlled Radix tabs — the snapshot-ref click)
const snap2 = run(`agent-browser --session ${S} snapshot -i -c`);
const tab = snap2.match(/- tab "\s*AI CV Upload" \[ref=(\w+)\]/);
if (!tab) { console.log("TAB NOT FOUND"); run(`agent-browser --session ${S} close`); process.exit(1); }
run(`agent-browser --session ${S} click @${tab[1]}`);
await new Promise((r) => setTimeout(r, 1500));
run(`agent-browser --session ${S} screenshot /home/z/my-project/eon-hr/docs/screenshots/r102-cv-tab.png`);

// the job combobox → System Admin — IT
const snap3 = run(`agent-browser --session ${S} snapshot -i -c`);
const combo = snap3.match(/- combobox "[^"]*" \[[^\]]*ref=(\w+)\]/);
if (combo) {
  run(`agent-browser --session ${S} click @${combo[1]}`);
  await new Promise((r) => setTimeout(r, 900));
  const snap4 = run(`agent-browser --session ${S} snapshot -i -c`);
  const opt = snap4.match(/- option "System Admin[^"]*" \[ref=(\w+)\]/);
  if (opt) run(`agent-browser --session ${S} click @${opt[1]}`);
  await new Promise((r) => setTimeout(r, 800));
}

// the upload (the standing agent-browser upload command — the r101 path)
const up = run(`agent-browser --session ${S} upload 'input[type=file]' ${pdfPath}`);
console.log("upload:", up.trim().slice(0, 80));
await new Promise((r) => setTimeout(r, 7000));

run(`agent-browser --session ${S} screenshot /home/z/my-project/eon-hr/docs/screenshots/r102-analysis-card.png`);

// the card read (the VISIBLE panel — the r101 pattern)
const card = run(`agent-browser --session ${S} eval "(() => { const p=[...document.querySelectorAll('[role=tabpanel]')].find(p=>p.getBoundingClientRect().width>100); const t=(p.innerText||''); return JSON.stringify({hasName: t.includes('r102 live cv'), hasScore: /AI Score/i.test(t), hasSkills: /Skills match/i.test(t), tail: t.slice(-260)}); })()"`);
console.log("card:", card.trim().slice(0, 420));

// the API row + the cleanup (the in-page fetch — the cookie rides along)
const apiGet = run(`agent-browser --session ${S} eval "fetch('/api/candidates').then(r=>r.json()).then(j=>{ const c=(j.data?.candidates||[]).filter(x=>x.name==='r102 live cv'); return JSON.stringify({count: c.length, id: c[0]?.id ?? null, score: c[0]?.aiScore ?? null, skills: c[0]?.skillsMatch ?? null}); })"`);
console.log("api row:", apiGet.trim().slice(0, 160));
const row = (() => { try { return JSON.parse(apiGet.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"')); } catch { return null; } })();
if (row?.id) {
  const del = run(`agent-browser --session ${S} eval "fetch('/api/candidates?id=${'$'}{row.id}'`, {method:'DELETE'}).then(r=>r.status)")`);
  console.log("cleanup DELETE:", del.trim().slice(0, 40));
}
run(`agent-browser --session ${S} close`);
