#!/usr/bin/env node
// r52-screenshots.mjs — parity round 51's evidence captures: the round's
// census surfaces — the mobile drawer's EXPANDED groups (390×844, the
// Employees + Analytics pairs) and the desktop sidebar with ALL groups
// expanded (the nav-registry drift-check surface). REF + seeded LOC
// pairs, one process tree with the :3200 server. Numbers continue
// from 236.
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-shots-r52.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }

async function auth(session, base) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3000));
  run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  await new Promise(r => setTimeout(r, 400));
  run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
  await new Promise(r => setTimeout(r, 400));
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const ref = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
  if (ref) run(`agent-browser --session ${session} click @${ref}`);
  await new Promise(r => setTimeout(r, 4200));
  console.log(session, "->", run(`agent-browser --session ${session} get url`).trim());
}
await auth("ref", "https://eon.base44.app");
await auth("loc", "http://127.0.0.1:3200");

const wait = (ms) => new Promise(r => setTimeout(r, ms));
const OPEN_DRAWER = `(() => { const btn = [...document.querySelectorAll('button')].find(b => (b.getAttribute('aria-label') || '') === 'Toggle Sidebar' || (b.textContent || '').includes('Toggle Sidebar')); if (!btn) return 'NOTRIGGER'; btn.click(); return 'ok'; })()`;
const EXPAND = (label) => `(() => { const panels = [...document.querySelectorAll('[data-state=open]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 200 && r.width < 350; }); if (!panels.length) return 'NOPANEL'; const g = [...panels[0].querySelectorAll('button')].find(b => (b.textContent || '').trim().startsWith('${label}')); if (!g) return 'NOGROUP'; if (g.getAttribute('aria-expanded') !== 'true') g.click(); return 'ok'; })()`;
const ESC = `(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); return 'esc'; })()`;

// (1) 236 — the mobile drawer's EXPANDED Employees group (390×844)
for (const [session, base, suffix] of [["ref", "https://eon.base44.app", "ref"], ["loc", "http://127.0.0.1:3200", "loc"]]) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await wait(3000);
  run(`agent-browser --session ${session} eval ${JSON.stringify(OPEN_DRAWER)}`);
  await wait(1000);
  run(`agent-browser --session ${session} eval ${JSON.stringify(EXPAND("Employees"))}`);
  await wait(1200);
  run(`agent-browser --session ${session} screenshot "${shots}/236-drawer-employees-group-${suffix}.png"`);
  run(`agent-browser --session ${session} eval ${JSON.stringify(ESC)}`);
  await wait(700);
  console.log(`236 ${suffix} captured`);
}

// (2) 237 — the mobile drawer's EXPANDED Analytics group (390×844)
for (const [session, base, suffix] of [["ref", "https://eon.base44.app", "ref"], ["loc", "http://127.0.0.1:3200", "loc"]]) {
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await wait(3000);
  run(`agent-browser --session ${session} eval ${JSON.stringify(OPEN_DRAWER)}`);
  await wait(1000);
  run(`agent-browser --session ${session} eval ${JSON.stringify(EXPAND("Analytics"))}`);
  await wait(1200);
  run(`agent-browser --session ${session} screenshot "${shots}/237-drawer-analytics-group-${suffix}.png"`);
  run(`agent-browser --session ${session} eval ${JSON.stringify(ESC)}`);
  await wait(700);
  console.log(`237 ${suffix} captured`);
}

// (3) 238 — the desktop sidebar with ALL 8 groups expanded (the registry census surface, 1440×900)
const EXPAND_ALL = `(() => { const sb = document.querySelector('[data-sidebar="sidebar"]') || document.querySelector('[data-sidebar="content"]'); if (!sb) return 'NOSIDEBAR'; const groups = [...sb.querySelectorAll('[data-sidebar="group"] button')].filter(b => /chevron/i.test((b.querySelector('svg')||{getAttribute:()=>''}).getAttribute('class')||'')); groups.forEach(g => { if (g.getAttribute('aria-expanded') === 'false') g.click(); }); return groups.length; })()`;
for (const [session, base, suffix] of [["ref", "https://eon.base44.app", "ref"], ["loc", "http://127.0.0.1:3200", "loc"]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await wait(3000);
  run(`agent-browser --session ${session} eval ${JSON.stringify(EXPAND_ALL)}`);
  await wait(1500);
  run(`agent-browser --session ${session} screenshot "${shots}/238-navregistry-expanded-${suffix}.png"`);
  console.log(`238 ${suffix} captured`);
}

console.log("done — 236/237/238 pairs");
process.exit(0);
