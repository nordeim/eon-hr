#!/usr/bin/env node
// r59-badge-recon.mjs — session-59 / parity round 58 reconnaissance:
// the badge/chip fill family. The r58 census covered every main BUTTON
// fill; this probe reads the NON-button fills (badges, status pills,
// table status cells, kanban chips, count chips) — the next layer of
// "any non-plain fill" the r58 lesson pointed at. Boot :3200 in this
// process tree (the tool-session kill pattern), ride the authed loc +
// ref sessions.
import { execSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r59.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }
console.log("server up on :3200");
run('agent-browser --session ref set viewport 1440 900');
run('agent-browser --session loc set viewport 1440 900');

const READ = `(() => {
  const out = [];
  const seen = new Set();
  for (const el of document.querySelectorAll('main span, main div, main td, main a')) {
    if (el.closest('button')) continue;
    if (el.children.length > 0) continue;
    const cs = getComputedStyle(el);
    const bg = cs.backgroundColor;
    const isPlain = bg === 'rgba(0, 0, 0, 0)' || bg === 'rgb(255, 255, 255)' || bg === 'rgb(250, 250, 250)';
    const txt = (el.textContent || '').trim();
    if (!txt || txt.length > 28) continue;
    const radius = cs.borderRadius;
    const isBadge = !isPlain && (radius.includes('9999') || parseFloat(radius) >= 4);
    const isChip = !isPlain && parseFloat(radius) < 4 && el.tagName !== 'TD';
    if (!isBadge && !isChip) continue;
    const key = txt + '|' + bg + '|' + radius;
    if (seen.has(key)) continue;
    seen.add(key);
    const r = el.getBoundingClientRect();
    if (r.width === 0) continue;
    out.push({ t: txt.slice(0, 24), bg: bg.replace(/, /g, ','), c: cs.color.replace(/, /g, ','), rad: radius, w: Math.round(r.width), h: Math.round(r.height) });
  }
  return out.slice(0, 40);
})()`;

const ROUTES = process.argv.slice(2).length > 0 ? process.argv.slice(2) : [
  "/leavemanagement", "/taskmanager", "/documenttracker", "/recruitmentkanban",
  "/staffrequests", "/employees", "/loans", "/surveys",
];
for (const route of ROUTES) {
  run(`agent-browser --session ref open "https://eon.base44.app${route}"`);
  run(`agent-browser --session loc open "http://127.0.0.1:3200${route}"`);
  await new Promise(r => setTimeout(r, 4200));
  const ref = await evalOn("ref", READ, 400);
  const loc = await evalOn("loc", READ, 300);
  const same = JSON.stringify(ref) === JSON.stringify(loc);
  console.log(`${same ? "MATCH" : "DIFF "} ${route} (ref ${Array.isArray(ref) ? ref.length : "?"} / loc ${Array.isArray(loc) ? loc.length : "?"} badges)`);
  if (!same) {
    console.log(`  ref: ${JSON.stringify(ref).slice(0, 900)}`);
    console.log(`  loc: ${JSON.stringify(loc).slice(0, 900)}`);
  }
}
process.exit(0);
