#!/usr/bin/env node
// r63-probe.mjs — session-63 / parity round 62: the element-level
// decomposition probe for the LIGHT-mode text-color census DIFFs.
// For every text-bearing element in `main` (buttons + svgs + placeholders
// included), on BOTH apps: the tag, the computed color, an identifying
// signature (text snippet / aria-label / heading text), and a kicker flag
// (is the element inside a `md:hidden` mobile kicker? — the census reads
// computed colors even on display:none elements, so the hidden kicker's
// light-mode colors are REAL mobile-surface data, not pollution).
// The w:0 filter (r61 lesson): rect 0x0 elements are display:none or
// off-layout — flagged `hidden:true` in the inventory (kept, not skipped —
// this round needs the kicker data), but the compare script separates
// hidden from visible so no false DIFFs from the shell chrome.
import { execSync, spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r63p.log 2>&1`],
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
  run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  await new Promise(r => setTimeout(r, 350));
  run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
  await new Promise(r => setTimeout(r, 350));
  run(`agent-browser --session ${session} click 'button[type=submit]'`);
  await new Promise(r => setTimeout(r, 5000));
}
async function authedRef() {
  const url = run(`agent-browser --session ref get url`).trim();
  if (url.includes("/login")) { await auth("ref", "https://eon.base44.app"); }
}
await auth("loc", "http://127.0.0.1:3200");
await auth("ref", "https://eon.base44.app");
for (const s of ["loc", "ref"]) await evalOn(s, `localStorage.setItem('darkMode','false')`);

// The inventory read — visible + hidden-flagged, with signatures.
const INV = `(() => {
  const out = [];
  const sig = (el) => {
    const t = (el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 28);
    if (t) return t;
    const a = el.getAttribute && (el.getAttribute('aria-label') || el.getAttribute('data-slot'));
    return a || (el.className && typeof el.className === 'string' ? el.className.split(' ').slice(0, 2).join('.') : '');
  };
  const kicker = (el) => { const k = el.closest('[class*="md:hidden"]'); return k && k.querySelector('h1') && !!k.querySelector('h1') && k.tagName ? true : false; };
  const add = (el, tg) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (!cs.color || cs.color === 'rgba(0, 0, 0, 0)') return;
    out.push({ tg, c: cs.color.replace(/, /g, ','), s: sig(el), k: kicker(el) ? 1 : 0, h: (r.width === 0 && r.height === 0) ? 1 : 0 });
  };
  for (const el of document.querySelectorAll('main h1, main h2, main h3, main h4, main h5, main h6')) add(el, el.tagName.toLowerCase());
  for (const el of document.querySelectorAll('main span, main div, main td, main th, main label, main a, main p, main li')) {
    if (el.children.length > 0) continue;
    if (!(el.textContent || '').trim()) continue;
    add(el, el.tagName.toLowerCase());
  }
  for (const el of document.querySelectorAll('main svg')) add(el, el.closest('button') ? 'button-svg' : 'svg');
  for (const el of document.querySelectorAll('main button')) add(el, 'button');
  for (const el of document.querySelectorAll('main input, main textarea')) {
    const cs = getComputedStyle(el, '::placeholder');
    if (cs.color && cs.color !== 'rgba(0, 0, 0, 0)') out.push({ tg: 'placeholder', c: cs.color.replace(/, /g, ','), s: sig(el), k: 0, h: 0 });
  }
  out.sort((a, b) => (a.tg + a.c + a.s).localeCompare(b.tg + b.c + b.s));
  return out.slice(0, 140);
})()`;

const ROUTES = process.argv.slice(2);
const all = {};
for (let i = 0; i < ROUTES.length; i++) {
  const route = ROUTES[i];
  run(`agent-browser --session ref open "https://eon.base44.app${route}"`);
  run(`agent-browser --session loc open "http://127.0.0.1:3200${route}"`);
  await new Promise(r => setTimeout(r, 4200));
  let ref = await evalOn("ref", INV, 2200);
  if (Array.isArray(ref) && ref.some(x => (x.tg || '') === 'h1' && (x.s || '').match(/sign in/i))) { await authedRef(); await evalOn("ref", `localStorage.setItem('darkMode','false')`); run(`agent-browser --session ref open "https://eon.base44.app${route}"`); await new Promise(r => setTimeout(r, 4200)); ref = await evalOn("ref", INV, 2200); }
  const loc = await evalOn("loc", INV, 500);
  all[route] = { ref, loc };
  console.log(`probed ${route}: ref ${Array.isArray(ref) ? ref.length : '?'} loc ${Array.isArray(loc) ? loc.length : '?'}`);
}
const dumpPath = process.env.R63P_DUMP || "/tmp/r63-probe.json";
writeFileSync(dumpPath, JSON.stringify(all, null, 1));
console.log("probe dump saved to " + dumpPath);
process.exit(0);
