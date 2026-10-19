#!/usr/bin/env node
// r60-probe5.mjs — (C) re-verify: LOC settings Edit with content waits +
// the clone's working dialog (the superset); REF's Edit press with a full
// before/after state diff (is it a no-op?).
import { execSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r60p5.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }

async function auth(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 2200));
  run(`agent-browser --session ${session} fill "input[type=email]" "sepnetflix2023@outlook.com"`);
  await new Promise(r => setTimeout(r, 350));
  run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
  await new Promise(r => setTimeout(r, 350));
  run(`agent-browser --session ${session} click 'button[type=submit]'`);
  await new Promise(r => setTimeout(r, 5000));
}
await auth("loc", "http://127.0.0.1:3200");
await auth("ref", "https://eon.base44.app");
await evalOn("loc", `localStorage.setItem('darkMode','false')`);
await evalOn("ref", `localStorage.setItem('darkMode','false')`);

// LOC: settings with CONTENT waits (the Company card + its Edit)
run('agent-browser --session loc open "http://127.0.0.1:3200/settings"');
for (let i = 0; i < 20; i++) {
  const found = await evalOn("loc", `(() => !![...document.querySelectorAll('main button')].find(b => (b.textContent||'').trim() === 'Edit'))()`);
  if (found) break;
  await new Promise(r => setTimeout(r, 700));
}
const LOCEDIT = `(() => {
  const btn = [...document.querySelectorAll('main button')].find(b => (b.textContent||'').trim() === 'Edit');
  if (!btn) return { found: false };
  const cs = getComputedStyle(btn); const r = btn.getBoundingClientRect();
  return { found: true, cls: btn.className, bg: cs.backgroundColor, c: cs.color, w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y), svg: btn.querySelector('svg') ? btn.querySelector('svg').getAttribute('class') : null };
})()`;
console.log("===== LOC settings Edit (light, content-waited) =====");
console.log(JSON.stringify(await evalOn("loc", LOCEDIT)));
await evalOn("loc", `(() => { const b = [...document.querySelectorAll('main button')].find(x => (x.textContent||'').trim() === 'Edit'); if (b) b.click(); return b ? 'clicked' : 'missing'; })()`);
await new Promise(r => setTimeout(r, 2000));
const LOCDLG = `(() => {
  const dlg = document.querySelector('[role=dialog]');
  if (!dlg) return { dialog: false };
  const r = dlg.getBoundingClientRect();
  const labels = [...dlg.querySelectorAll('label')].map(l => (l.textContent||'').trim());
  const btns = [...dlg.querySelectorAll('button')].map(b => (b.textContent||'').trim().slice(0,20));
  return { dialog: true, w: Math.round(r.width), labels, btns, title: (dlg.querySelector('h2')||{}).textContent };
})()`;
console.log("LOC Edit dialog:", JSON.stringify(await evalOn("loc", LOCDLG)));

// REF: settings Edit — full before/after diff
run('agent-browser --session ref open "https://eon.base44.app/settings"');
await new Promise(r => setTimeout(r, 5000));
const REFEDIT = `(() => {
  const btn = [...document.querySelectorAll('main button')].find(b => (b.textContent||'').trim() === 'Edit');
  if (!btn) return { found: false };
  const cs = getComputedStyle(btn); const r = btn.getBoundingClientRect();
  return { found: true, cls: btn.className, bg: cs.backgroundColor, c: cs.color, w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) };
})()`;
console.log("\n===== REF settings Edit (light, content-waited) =====");
console.log(JSON.stringify(await evalOn("ref", REFEDIT, 2000)));
const BEFORE = `(() => ({ text: (document.querySelector('main').textContent||'').replace(/\\s+/g,' ').trim().slice(0,300), inputs: [...document.querySelectorAll('main input')].filter(i => i.getBoundingClientRect().height > 0).length, dialog: !!document.querySelector('[role=dialog]') }))()`;
const before = await evalOn("ref", BEFORE);
console.log("REF before:", JSON.stringify(before));
await evalOn("ref", `(() => { const b = [...document.querySelectorAll('main button')].find(x => (x.textContent||'').trim() === 'Edit'); if (b) b.click(); return b ? 'clicked' : 'missing'; })()`);
await new Promise(r => setTimeout(r, 3500));
const AFTER = `(() => ({ text: (document.querySelector('main').textContent||'').replace(/\\s+/g,' ').trim().slice(0,300), inputs: [...document.querySelectorAll('main input')].filter(i => i.getBoundingClientRect().height > 0).length, dialog: !!document.querySelector('[role=dialog]'), dlgText: document.querySelector('[role=dialog]') ? (document.querySelector('[role=dialog]').textContent||'').replace(/\\s+/g,' ').trim().slice(0,400) : null }))()`;
const after = await evalOn("ref", AFTER);
console.log("REF after press:", JSON.stringify(after));
console.log("REF Edit press changed state:", JSON.stringify(before) !== JSON.stringify(after) ? "YES (real behavior)" : "NO (silent no-op)");
process.exit(0);
