#!/usr/bin/env node
// r100-analysis-card.mjs — the live post-fix verify: a real-shaped
// per-glyph PDF (the Acrobat/LiveCycle writer form — every keyword rides
// per-glyph (X)Tj + glyph-advance Td runs, plus an ObjStm-shaped stream)
// through the :3200 UI → the analysis card screenshot → the API row →
// the cleanup. Snapshot-ref clicks (the §109 reliable path).
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 160); } }

// ---- build the real-shaped per-glyph PDF ----
const perGlyph = (word) => {
  const moves = [0.55, 0.6, 0.62, 0.58, 0.5, 0.45, 0.35, 0.65, 0.52, 0.4, 0.61, 0.57];
  return word.split("").map((ch, i) => `(${ch})Tj ${moves[i % moves.length]} 0 Td`).join(" ") + " ";
};
const words = ["onboarding", "hris", "administration", "specialist", "training", "compliance", "senior", "manager", "experience", "5", "years", "platform"];
const objstmBody =
  "12 dict begin\n" +
  "6 0 obj\n<< /Type /Page /Parent 2 0 R /Contents 4 0 R >>\nendobj\n" +
  "7 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n" +
  "end";
const content = ["BT /T1_0 1 Tf 6.79 0 0 7 472 676.002 Tm", ...words.map((w) => perGlyph(w) + " 2.0 0 Td"), "ET"].join("\n");

const deflate = async (s) => {
  const zlib = new CompressionStream("deflate");
  return new Uint8Array(await new Response(new Blob([s]).stream().pipeThrough(zlib)).arrayBuffer());
};
const enc = (s) => new TextEncoder().encode(s);
const parts = [];
for (const [i, c] of [objstmBody, content].entries()) {
  const d = await deflate(c);
  parts.push(enc(`${i + 1} 0 obj\n<< /Length ${d.length} >>\nstream\r\n`));
  parts.push(d);
  parts.push(enc("\r\nendstream\r\nendobj\n"));
}
parts.push(enc("trailer\n<< /Root 3 0 R >>\n%%EOF"));
const total = parts.reduce((n, p) => n + p.length, 0);
const pdf = new Uint8Array(total);
let o = 0;
for (const p of parts) { pdf.set(p, o); o += p.length; }
writeFileSync("/tmp/r100-real-cv.pdf", pdf);
console.log("fixture: /tmp/r100-real-cv.pdf", pdf.length, "bytes");

// ---- the UI flow ----
const S = "r100card";
const shots = "/home/z/my-project/eon-hr/docs/screenshots";

run(`agent-browser --session ${S} close 2>/dev/null; true`);
run(`agent-browser --session ${S} set viewport 1440 900`);

// auth (fill + single-quoted words — the $-password trap cure)
run(`agent-browser --session ${S} open http://127.0.0.1:3200/login`);
await new Promise((r) => setTimeout(r, 4000));
run(`agent-browser --session ${S} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise((r) => setTimeout(r, 700));
run(`agent-browser --session ${S} fill 'input[type=password]' '$Abcd1234'`);
await new Promise((r) => setTimeout(r, 700));
const snap0 = run(`agent-browser --session ${S} snapshot -i -c`);
const m0 = snap0.match(/- button "Sign in" \[ref=(\w+)\]/);
if (m0) run(`agent-browser --session ${S} click @${m0[1]}`);
await new Promise((r) => setTimeout(r, 6000));
const path1 = run(`agent-browser --session ${S} eval "location.pathname"`).trim();
console.log("post-login:", path1);
if (path1.includes("login")) { console.log("AUTH FAILED — aborting"); process.exit(1); }

// the recruitment page
run(`agent-browser --session ${S} open http://127.0.0.1:3200/recruitment`);
await new Promise((r) => setTimeout(r, 6000));

// the AI CV Upload tab — snapshot-ref click + the first-click absorption guard
// (the accessible name can carry a LEADING SPACE — " AI CV Upload" — the
// tolerant \\s* match is required)
let snap = run(`agent-browser --session ${S} snapshot -i -c`);
let mt = snap.match(/- tab "\s*AI CV Upload\s*" \[ref=(\w+)\]/);
if (mt) run(`agent-browser --session ${S} click @${mt[1]}`);
await new Promise((r) => setTimeout(r, 2500));
const selNow = run(`agent-browser --session ${S} eval "(() => { const t=[...document.querySelectorAll('[role=tab]')].find(t=>/AI CV Upload/i.test(t.textContent||'')); return t?t.getAttribute('aria-selected'):'notab'; })()"`).trim();
if (selNow !== '"true"') {
  snap = run(`agent-browser --session ${S} snapshot -i -c`);
  mt = snap.match(/- tab "\s*AI CV Upload\s*" \[ref=(\w+)\]/);
  if (mt) run(`agent-browser --session ${S} click @${mt[1]}`);
  await new Promise((r) => setTimeout(r, 2000));
}
run(`agent-browser --session ${S} screenshot ${shots}/r100-loc-cvtab-rest.png`);

// the job combobox — the eval path primary (the trigger by its placeholder
// text — deterministic), the snapshot-ref fallback
const trig = run(`agent-browser --session ${S} eval "(() => { const b=[...document.querySelectorAll('[role=tabpanel] button[role=combobox]')].find(x=>(x.textContent||'').includes('Choose a job posting')); if(b){ b.click(); return 'CLICKED'; } return 'NOTRIGGER'; })()"`).trim();
console.log("combo:", trig.slice(0, 60));
if (trig.includes("NOTRIGGER")) {
  snap = run(`agent-browser --session ${S} snapshot -i -c`);
  const mc = snap.match(/- combobox "[^"]*" \[ref=(\w+)\]/);
  if (mc) run(`agent-browser --session ${S} click @${mc[1]}`);
}
await new Promise((r) => setTimeout(r, 2000));
snap = run(`agent-browser --session ${S} snapshot -i -c`);
const mo = snap.match(/- option "System Admin[^\"]*" \[ref=(\w+)\]/);
if (mo) run(`agent-browser --session ${S} click @${mo[1]}`);
else {
  const opt = run(`agent-browser --session ${S} eval "(() => { const o=[...document.querySelectorAll('[role=option]')].find(x=>(x.textContent||'').includes('System Admin')); if(o){ o.click(); return 'CLICKED'; } return 'NOOPT'; })()"`).trim();
  console.log("option fallback:", opt.slice(0, 60));
}
await new Promise((r) => setTimeout(r, 2000));
run(`agent-browser --session ${S} screenshot ${shots}/r100-loc-cvtab-active.png`);

// the per-glyph PDF upload
const up = run(`agent-browser --session ${S} upload 'input[type=file]' /tmp/r100-real-cv.pdf`);
console.log("upload:", up.trim().slice(0, 60));
await new Promise((r) => setTimeout(r, 7000));
const card = run(`agent-browser --session ${S} eval "(() => { const p=[...document.querySelectorAll('[role=tabpanel]')].find(p=>p.getBoundingClientRect().width>100); const t=(p.innerText||''); return JSON.stringify({hasName: t.includes('r100 real cv'), hasScore: /AI Score/i.test(t), hasSkills: /Skills match/i.test(t), tail: t.slice(-200)}); })()"`).trim();
console.log("card:", card.slice(0, 380));
run(`agent-browser --session ${S} screenshot ${shots}/r100-loc-cv-analysis.png`);

// the API row + the cleanup (DB pristine at close)
const apiGet = run(`agent-browser --session ${S} eval "fetch('/api/candidates').then(r=>r.json()).then(j=>{ const c=(j.data?.candidates||[]).filter(x=>x.name==='r100 real cv'); return JSON.stringify({count: c.length, id: c[0]?.id ?? null, score: c[0]?.aiScore ?? null, skills: c[0]?.skillsMatch ?? null}); })"`);
console.log("api row:", apiGet.trim().slice(0, 160));
const row = (() => { try { return JSON.parse(apiGet.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"')); } catch { return null; } })();
if (row?.id) {
  const del = run(`agent-browser --session ${S} eval "fetch('/api/candidates?id=${row.id}', {method:'DELETE'}).then(r=>r.status)"`);
  console.log("cleanup DELETE:", del.trim().slice(0, 40));
}
run(`agent-browser --session ${S} close`);
