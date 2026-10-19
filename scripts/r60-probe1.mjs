#!/usr/bin/env node
// r60-probe1.mjs — the three dark-mode recon candidates, precisely:
// (A) securitysettings lock-button dark-mode fill; (B) the employees
// view-toggle pair's dark-mode order + fills; (C) REF's settings Edit
// button. Boots :3200 in this tree; re-auths both sessions (the TTL lesson).
import { execSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r60p1.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }
console.log("server up on :3200");

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
for (const s of ["loc", "ref"]) await evalOn(s, `localStorage.setItem('darkMode','true')`);

async function openDark(session, base, route) {
  run(`agent-browser --session ${session} open ${base}${route}`);
  await new Promise(r => setTimeout(r, 4000));
}

// (A) securitysettings: every button in the save row — full class lists
await openDark("ref", "https://eon.base44.app", "/securitysettings");
await openDark("loc", "http://127.0.0.1:3200", "/securitysettings");
const SEC = `(() => {
  const btns = [...document.querySelectorAll('main button')].filter(b => b.getBoundingClientRect().height > 0);
  return btns.map(b => { const cs = getComputedStyle(b); const r = b.getBoundingClientRect(); return { cls: b.className.slice(0, 220), bg: cs.backgroundColor, c: cs.color, w: Math.round(r.width), h: Math.round(r.height), t: (b.textContent||'').trim().slice(0,16), svg: (b.querySelector('svg')||{}).className ? b.querySelector('svg').className.baseVal.slice(0,60) : null }; });
})()`;
console.log("\n===== (A) securitysettings buttons (dark) =====");
console.log("REF:", JSON.stringify(await evalOn("ref", SEC, 1500)));
console.log("LOC:", JSON.stringify(await evalOn("loc", SEC, 500)));

// (B) employees toggle pair: order + classes + geometry + aria
await openDark("ref", "https://eon.base44.app", "/employees");
await openDark("loc", "http://127.0.0.1:3200", "/employees");
const TOG = `(() => {
  const btns = [...document.querySelectorAll('main button')].filter(b => { const r = b.getBoundingClientRect(); return r.height > 20 && r.height < 45 && (b.querySelector('svg') || b.getAttribute('aria-label')); });
  return btns.slice(0, 8).map(b => { const cs = getComputedStyle(b); const r = b.getBoundingClientRect(); const svg = b.querySelector('svg'); return { cls: b.className.slice(0, 240), bg: cs.backgroundColor, c: cs.color, x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height), aria: b.getAttribute('aria-label'), pressed: b.getAttribute('aria-pressed'), svgCls: svg ? svg.getAttribute('class') : null }; });
})()`;
console.log("\n===== (B) employees toggle pair (dark) =====");
console.log("REF:", JSON.stringify(await evalOn("ref", TOG, 1500)));
console.log("LOC:", JSON.stringify(await evalOn("loc", TOG, 500)));

// (C) settings: every button — hunting REF's Edit
await openDark("ref", "https://eon.base44.app", "/settings");
await openDark("loc", "http://127.0.0.1:3200", "/settings");
const SET = `(() => {
  const btns = [...document.querySelectorAll('main button')].filter(b => b.getBoundingClientRect().height > 0);
  return btns.map(b => { const cs = getComputedStyle(b); const r = b.getBoundingClientRect(); return { cls: b.className.slice(0, 200), bg: cs.backgroundColor, c: cs.color, w: Math.round(r.width), h: Math.round(r.height), t: (b.textContent||'').trim().slice(0,20) }; });
})()`;
console.log("\n===== (C) settings buttons (dark) =====");
console.log("REF:", JSON.stringify(await evalOn("ref", SET, 1500)));
console.log("LOC:", JSON.stringify(await evalOn("loc", SET, 500)));
process.exit(0);
