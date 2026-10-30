#!/usr/bin/env node
// r109-rl-ui-verify.mjs — the LIVE post-fix verify (the r104 protocol):
// the REAL ReportLab user guide through the actual UI — the recruitment
// CV tab's upload → the deterministic parse → the candidate's text
// carries the em-dash "To die\u2014to sleep" (U+2014, the raw 0x97 atom) and
// the Symbol bullets (\u2022) where the pre-fix build read NOTHING (the
// ASCII85 armor blocked every stream). Sweeps the probe candidate + user
// afterwards (the DB-pristine protocol).
// Usage: node scripts/r109-rl-ui-verify.mjs
import { execSync } from "node:child_process";

function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 300); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const base = "http://127.0.0.1:3200";
const session = "loc109ui";

run(`agent-browser --session ${session} close 2>/dev/null; true`);
run(`agent-browser --session ${session} set viewport 1440 900`);
run(`agent-browser --session ${session} open ${base}/login`);
await new Promise(r => setTimeout(r, 3000));
run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise(r => setTimeout(r, 500));
run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
await new Promise(r => setTimeout(r, 500));
const snap = run(`agent-browser --session ${session} snapshot -i -c`);
const m = snap.match(/- button "[^"]*[Ss]ign in[^"]*" \[ref=(\w+)\]/);
if (m) run(`agent-browser --session ${session} click @${m[1]}`);
await new Promise(r => setTimeout(r, 5000));

// the recruitment CV tab: open the AI CV Upload tab, pick the first job
// (the drop zone + hidden input only render with cvJobId set), then upload
run(`agent-browser --session ${session} open ${base}/recruitment`);
await new Promise(r => setTimeout(r, 3500));
// Radix Tabs/Select need REAL pointer events — the ref-click protocol
{
  const s1 = run(`agent-browser --session ${session} snapshot -i -c`);
  const tab = s1.match(/- tab "AI CV Upload" \[ref=(\w+)\]/);
  if (tab) run(`agent-browser --session ${session} click @${tab[1]}`);
  await new Promise(r => setTimeout(r, 1200));
  const s2 = run(`agent-browser --session ${session} snapshot -i -c`);
  // the §3.90 composite attribute form: [expanded=false, ref=e60]
  const trg = s2.match(/- combobox "Select Job Position" \[[^\]]*ref=(\w+)\]/);
  if (trg) {
    const ref = trg[1];
    run(`agent-browser --session ${session} click @${ref}`);
    await new Promise(r => setTimeout(r, 900));
    const s3 = run(`agent-browser --session ${session} snapshot -i -c`);
    const opt = s3.match(/- option "([^"]+)" \[ref=(\w+)\]/);
    if (opt) run(`agent-browser --session ${session} click @${opt[2]}`);
    await new Promise(r => setTimeout(r, 900));
  }
}
const jobSet = await evalOn(session, "(() => !!document.querySelector('input[type=file]'))()", 300);
console.log("drop zone + file input rendered:", JSON.stringify(jobSet));
const set = run(`agent-browser --session ${session} upload 'input[type=file]' /tmp/r109-rl-probe-cv.pdf`);
console.log("file set:", set.trim().slice(0, 80));
await new Promise(r => setTimeout(r, 6000));
// read the STORED cvText — the analysis panel renders the score, not the
// raw text; the candidate's row (fetched through the app's own session)
// carries the extracted cvText the parse persisted
const read = await evalOn(session, `(async () => {
  const res = await fetch('/api/candidates');
  const json = await res.json();
  const c = (json.data?.candidates ?? []).find((x) => /rl probe cv/i.test(x.name || ''));
  if (!c) return { found: false, names: (json.data?.candidates ?? []).map((x) => x.name).slice(0, 5) };
  const cv = c.cvText || '';
    const j = cv.indexOf('To die');
  return { found: true, name: c.name, aiScore: c.aiScore, emDash: cv.includes('To die\u2014to sleep'), bullets: (cv.match(/\u2022/g) || []).length, quote: cv.includes('It\u2019s'), fffd: cv.includes('\uFFFD'), around: j >= 0 ? cv.slice(j, j + 18) : 'NOT IN CV' };
})()`, 400);
console.log("parsed candidate read:", JSON.stringify(read));
run(`agent-browser --session ${session} screenshot /home/z/my-project/eon-hr/docs/screenshots/r109-3200-reportlab-cvtab-desktop.png`);

// sweep the probe candidates via the API (the DB-pristine protocol — the
// API login + the DELETE loop; the UI verify may run more than once)
{
  const login = run(`curl -s -c /tmp/r109-cookies.txt -X POST ${base}/api/auth/login -H "Content-Type: application/json" -d '{"email":"sepnetflix2023@outlook.com","password":"$Abcd1234"}'`);
  if (!login.includes('"ok":true')) console.log("sweep login FAILED:", login.slice(0, 120));
  for (let i = 0; i < 5; i++) {
    const list = run(`curl -s -b /tmp/r109-cookies.txt ${base}/api/candidates`);
    const m = list.match(/"id":"([^"]+)","createdAt":[^}]*?"name":"rl probe cv"/) || list.match(/"name":"rl probe cv"[^}]*?"id":"([^"]+)"/);
    const id = m ? m[1] : null;
    if (!id) { console.log("sweep complete (no rl-probe-cv candidates remain)"); break; }
    run(`curl -s -b /tmp/r109-cookies.txt -X DELETE "${base}/api/candidates?id=${id}"`);
    console.log("swept", id);
  }
}
console.log("DONE");
process.exit(0);
