#!/usr/bin/env node
// r60-probe4.mjs — is REF's employees view toggle persisted? Read the
// localStorage keys, clear view-ish keys, reload, re-measure the pair;
// then click list, reload, re-measure — the persistence contract.
import { execSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r60p4.log 2>&1`],
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
await auth("ref", "https://eon.base44.app");
await evalOn("ref", `localStorage.setItem('darkMode','false')`);

run('agent-browser --session ref open "https://eon.base44.app/employees"');
await new Promise(r => setTimeout(r, 4000));
const KEYS = `(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k).slice(0, 40); } return o; })()`;
console.log("REF localStorage:", JSON.stringify(await evalOn("ref", KEYS, 2000)));

const TOGSTATE = `(() => {
  const btns = [...document.querySelectorAll('main button')].filter(b => { const s = (b.querySelector('svg')||{}).getAttribute ? (b.querySelector('svg').getAttribute('class')||'') : ''; return s.includes('grid3x3') || s.includes('lucide-list'); });
  return btns.map(b => { const cs = getComputedStyle(b); const svg = b.querySelector('svg'); return { icon: (svg.getAttribute('class')||'').includes('grid3x3') ? 'GRID' : 'LIST', bg: cs.backgroundColor, w: Math.round(b.getBoundingClientRect().width) }; });
})()`;
console.log("pair at-rest:", JSON.stringify(await evalOn("ref", TOGSTATE)));

// Click LIST on REF, then reload — does the state persist?
const CLICK_LIST = `(() => {
  const btn = [...document.querySelectorAll('main button')].find(b => { const svg = b.querySelector('svg'); return svg && (svg.getAttribute('class')||'').includes('lucide-list'); });
  if (!btn) return { found: false }; btn.click(); return { clicked: true };
})()`;
console.log("click list:", JSON.stringify(await evalOn("ref", CLICK_LIST)));
await new Promise(r => setTimeout(r, 1200));
console.log("pair after click:", JSON.stringify(await evalOn("ref", TOGSTATE)));
console.log("localStorage after click:", JSON.stringify(await evalOn("ref", KEYS)));
run('agent-browser --session ref open "https://eon.base44.app/employees"');
await new Promise(r => setTimeout(r, 4000));
console.log("pair after RELOAD:", JSON.stringify(await evalOn("ref", TOGSTATE, 2000)));
console.log("localStorage after reload:", JSON.stringify(await evalOn("ref", KEYS)));

// What does the page render — table or cards? (the view state the pair controls)
const VIEWSTATE = `(() => {
  const table = document.querySelector('main table');
  const cards = [...document.querySelectorAll('main [class*=grid]')].filter(g => g.getBoundingClientRect().height > 100);
  return { hasTable: !!table, gridish: cards.length, text: (document.querySelector('main').textContent||'').replace(/\\s+/g,' ').trim().slice(0, 200) };
})()`;
console.log("view state after reload:", JSON.stringify(await evalOn("ref", VIEWSTATE)));
process.exit(0);
