#!/usr/bin/env node
// r64-probe-cmp.mjs — session-64 / parity round 63: compare the two sides'
// bordered-inventories for a route in LIGHT mode: dump each side's inventory
// JSON to /tmp, then print the classes present ONLY on ref and ONLY on loc
// (the symmetric difference) — the inversion check for the census's
// set-comparison blind spot (same (tag|color) sets on different elements).
// Usage: node scripts/r64-probe-cmp.mjs /payroll
import { execSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r64c.log 2>&1`],
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
  run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  await new Promise(r => setTimeout(r, 350));
  run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
  await new Promise(r => setTimeout(r, 350));
  run(`agent-browser --session ${session} click 'button[type=submit]'`);
  await new Promise(r => setTimeout(r, 5000));
}
const route = process.argv[2];
if (!route) { console.log("usage: node r64-probe-cmp.mjs /route"); process.exit(1); }
await auth("loc", "http://127.0.0.1:3200");
const refUrl = run(`agent-browser --session ref get url`).trim();
if (refUrl.includes("/login") || !refUrl.includes("eon.base44.app")) await auth("ref", "https://eon.base44.app");
// LIGHT mode explicit
for (const s of ["loc", "ref"]) await evalOn(s, `localStorage.setItem('darkMode','false')`);
run(`agent-browser --session ref open "https://eon.base44.app${route}"`);
run(`agent-browser --session loc open "http://127.0.0.1:3200${route}"`);
await new Promise(r => setTimeout(r, 4500));

const INV = `(() => {
  const out = [];
  for (const el of document.querySelectorAll('main, main *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const cs = getComputedStyle(el);
    const sides = [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth];
    const styles = [cs.borderTopStyle, cs.borderRightStyle, cs.borderBottomStyle, cs.borderLeftStyle];
    const cols = [cs.borderTopColor, cs.borderRightColor, cs.borderBottomColor, cs.borderLeftColor];
    let has = false;
    for (let i = 0; i < 4; i++) if (parseFloat(sides[i]) > 0 && styles[i] !== 'none' && cols[i] !== 'rgba(0, 0, 0, 0)' && cols[i] !== 'transparent') has = true;
    if (!has) continue;
    const cls = (el.className && typeof el.className === 'string') ? el.className.replace(/\\s+/g, ' ') : '';
    const txt = (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 30);
    out.push(el.tagName.toLowerCase() + ' | ' + cls + ' | ' + txt);
  }
  return out;
})()`;

const refInv = await evalOn("ref", INV, 2000);
const locInv = await evalOn("loc", INV, 800);
if (!Array.isArray(refInv) || !Array.isArray(locInv)) { console.log("READ ERR", JSON.stringify(refInv).slice(0,200), JSON.stringify(locInv).slice(0,200)); process.exit(1); }
const refSet = new Set(refInv), locSet = new Set(locInv);
console.log(`\n===== ${route}: REF-only (${[...refSet].filter(x => !locSet.has(x)).length}) =====`);
for (const x of refInv) if (!locSet.has(x)) console.log("R:", x.slice(0, 170));
console.log(`\n===== ${route}: LOC-only (${[...locSet].filter(x => !refSet.has(x)).length}) =====`);
for (const x of locInv) if (!refSet.has(x)) console.log("L:", x.slice(0, 170));
process.exit(0);
