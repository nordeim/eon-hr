#!/usr/bin/env node
// r60-darkfill-recon.mjs — session-60 / parity round 59 reconnaissance:
// the DARK-MODE fill family. The r57 census covered every CTA/button fill
// and the r58 census the non-button badge/chip fills — both in LIGHT mode.
// This probe takes the same fill dimension into DARK mode (html.dark, the
// localStorage darkMode="true" contract both apps share — session 33's
// live measurement). Reads BOTH button fills and non-button leaf fills,
// paired live REF vs LOC (:3200, this process tree). Re-auths both
// sessions at the start (the REF short-TTL session lesson — this window
// the ref cookie dies within ~5 min of idle/sequential loads).
import { execSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r60.log 2>&1`],
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

// Arm dark mode on BOTH sides via the shared localStorage contract
// (session 33: both apps read darkMode="true" and apply html.dark at
// app-page boot). Then reload to let each app's own theme boot run.
for (const [session, base] of [["loc", "http://127.0.0.1:3200"], ["ref", "https://eon.base44.app"]]) {
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 3000));
  await evalOn(session, `localStorage.setItem('darkMode','true')`);
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 3000));
  const state = await evalOn(session, `(() => ({ dark: document.documentElement.classList.contains('dark'), stored: localStorage.getItem('darkMode'), bg: getComputedStyle(document.body).backgroundColor }))()`);
  console.log(`${session} dark state:`, JSON.stringify(state));
}

// The union read: button fills (r58 family) + non-button leaf badge/chip
// fills (r59 family), computed, in dark mode.
const READ = `(() => {
  const out = [];
  const seen = new Set();
  const push = (el, kind) => {
    const cs = getComputedStyle(el);
    const bg = cs.backgroundColor;
    const bgi = cs.backgroundImage === 'none' ? '' : cs.backgroundImage.slice(0, 60);
    const txt = (el.textContent || '').trim();
    const key = kind + '|' + txt + '|' + bg + '|' + bgi;
    if (seen.has(key)) return;
    seen.add(key);
    const r = el.getBoundingClientRect();
    if (r.width === 0) return;
    out.push({ k: kind, t: txt.slice(0, 20), bg: bg.replace(/, /g, ','), bgi, c: cs.color.replace(/, /g, ','), h: Math.round(r.height) });
  };
  for (const el of document.querySelectorAll('main button')) {
    const cs = getComputedStyle(el);
    const bg = cs.backgroundColor;
    const plain = bg === 'rgba(0, 0, 0, 0)';
    const bgi = cs.backgroundImage !== 'none';
    if (plain && !bgi) continue;
    push(el, 'btn');
  }
  for (const el of document.querySelectorAll('main span, main div, main td, main a, main p')) {
    if (el.closest('button')) continue;
    if (el.children.length > 0) continue;
    const cs = getComputedStyle(el);
    const bg = cs.backgroundColor;
    const isPlain = bg === 'rgba(0, 0, 0, 0)' || bg === 'rgb(255, 255, 255)' || bg === 'rgb(250, 250, 250)';
    if (isPlain) continue;
    const txt = (el.textContent || '').trim();
    if (!txt || txt.length > 24) continue;
    push(el, 'leaf');
  }
  return out.slice(0, 44);
})()`;

const ROUTES = process.argv.slice(2).length > 0 ? process.argv.slice(2) : [
  "/taskmanager", "/securitysettings", "/leavemanagement", "/documenttracker",
  "/expenses", "/settings", "/recruitmentkanban", "/employees",
];
for (const route of ROUTES) {
  run(`agent-browser --session ref open "https://eon.base44.app${route}"`);
  run(`agent-browser --session loc open "http://127.0.0.1:3200${route}"`);
  await new Promise(r => setTimeout(r, 4200));
  const ref = await evalOn("ref", READ, 2200);
  const loc = await evalOn("loc", READ, 2200);
  const same = JSON.stringify(ref) === JSON.stringify(loc);
  console.log(`${same ? "MATCH" : "DIFF "} ${route} (ref ${Array.isArray(ref) ? ref.length : "?"} / loc ${Array.isArray(loc) ? loc.length : "?"} fills)`);
  if (!same) {
    console.log(`  ref: ${JSON.stringify(ref).slice(0, 1400)}`);
    console.log(`  loc: ${JSON.stringify(loc).slice(0, 1400)}`);
  }
}
// restore light mode on both sides (leave the sessions clean)
for (const [session, base] of [["loc", "http://127.0.0.1:3200"], ["ref", "https://eon.base44.app"]]) {
  await evalOn(session, `localStorage.setItem('darkMode','false')`);
}
process.exit(0);
