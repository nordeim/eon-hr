#!/usr/bin/env node
// r120-ui-verify.mjs — the LIVE post-fix verify (the r104 protocol): the
// WeasyPrint CV (the round's real corpus member — the general-name font
// bindings + the width un-blinding) through the actual UI — the recruitment
// AI-CV-Upload tab's upload → the deterministic parse → the candidate's
// STORED cvText carries the r120 column split ("…TechCorp\nMar 2021 - …")
// where the pre-fix build read the join. Sweeps the probe candidate
// afterwards (the DB-pristine protocol). Usage: node scripts/r120-ui-verify.mjs
import { execSync } from "node:child_process";

function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 300); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const base = "http://127.0.0.1:3200";
const session = "loc120ui";

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

run(`agent-browser --session ${session} open ${base}/recruitment`);
await new Promise(r => setTimeout(r, 3500));
{
  const s1 = run(`agent-browser --session ${session} snapshot -i -c`);
  const tab = s1.match(/- tab "AI CV Upload" \[ref=(\w+)\]/);
  if (tab) run(`agent-browser --session ${session} click @${tab[1]}`);
  await new Promise(r => setTimeout(r, 1200));
  const s2 = run(`agent-browser --session ${session} snapshot -i -c`);
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
const set = run(`agent-browser --session ${session} upload 'input[type=file]' /tmp/r113-writers/weasy-cv.pdf`);
console.log("file set:", set.trim().slice(0, 80));
await new Promise(r => setTimeout(r, 14000));
const read = await evalOn(session, `(async () => {
  const res = await fetch('/api/candidates');
  const json = await res.json();
  const c = (json.data?.candidates ?? []).find((x) => /weasy/i.test(x.name || '') || /john.smith@/i.test(x.email || ''));
  if (!c) return { found: false, names: (json.data?.candidates ?? []).map((x) => x.name).slice(0, 5) };
  const cv = c.cvText || '';
  const NL = String.fromCharCode(10);
  return { found: true, name: c.name, aiScore: c.aiScore, id: c.id, namePos: cv.indexOf('John Smith'), dateSplit: cv.includes('TechCorp' + NL + 'Mar 2021'), dateSplit2: cv.includes('InnovateLLC' + NL + 'Jun 2018'), fffd: cv.includes(String.fromCharCode(0xFFFD)), payroll: cv.includes('payroll'), head: cv.slice(0, 60) };
})()`);
console.log("stored cvText probe:", JSON.stringify(read, null, 1));

// the sweep — by the REAL id (the r112 lesson: unknown-id DELETEs are no-ops)
if (read && read.found && read.id) {
  const del = await evalOn(session, `(async () => { const r = await fetch('/api/candidates?id=' + ${JSON.stringify("$id")} , { method: 'DELETE' }); return r.status; })()`.replace('"$id"', JSON.stringify(read.id)));
  console.log("sweep:", JSON.stringify(del));
}
run(`agent-browser --session ${session} close 2>/dev/null; true`);
