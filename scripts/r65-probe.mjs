#!/usr/bin/env node
// r65-probe.mjs — session-65 / parity round 64: the element-level geometry
// decomposition. For each DIFF route from the r65 census, dump EVERY
// geometry-bearing element in main: tag, padding, radius, class string
// (compact), text snippet, and rect — both sides — so DIFF tuples can be
// attributed to concrete elements (the r64-probe pattern).
// Usage: node scripts/r65-probe.mjs [route ...]
import { execSync, spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r65p.log 2>&1`],
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
async function authedRef() {
  const url = run(`agent-browser --session ref get url`).trim();
  if (url.includes("/login")) { await auth("ref", "https://eon.base44.app"); }
}

const READ = `(() => {
  const out = [];
  const px = (v) => { const m = String(v).match(/^-?\\d+(?:\\.\\d+)?px$/); return m ? String(parseFloat(v)) : String(v); };
  const rad = (v) => { const n = parseFloat(v); return (!isNaN(n) && n >= 9999) ? 'full' : String(v); };
  for (const el of document.querySelectorAll('main, main *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const cs = getComputedStyle(el);
    const pt = px(cs.paddingTop), pr = px(cs.paddingRight), pb = px(cs.paddingBottom), pl = px(cs.paddingLeft);
    const br = rad(px(cs.borderRadius));
    if (pt === '0' && pr === '0' && pb === '0' && pl === '0' && br === '0') continue;
    out.push({
      tg: el.tagName.toLowerCase(),
      p: pt + ',' + pr + ',' + pb + ',' + pl,
      r: br,
      x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
      cls: (el.className && typeof el.className === 'string') ? el.className.replace(/\\s+/g, ' ').slice(0, 90) : '',
      t: (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 26)
    });
  }
  return out;
})()`;

const ROUTES = process.argv.slice(2).length > 0 ? process.argv.slice(2) : [
  "/employees", "/payroll", "/expenses", "/recruitment", "/compliancedashboard",
  "/assetmanagement", "/chat", "/surveys", "/attendance", "/interviewassistant",
  "/securitysettings", "/payrollmodule", "/shiftcalendar", "/hrassistant",
  "/requestreports", "/onboardingtemplates", "/careers",
];
const dumpName = process.env.R65P_DUMP || "/tmp/r65-probe.log";
const all = [];
for (let i = 0; i < ROUTES.length; i++) {
  const route = ROUTES[i];
  if (i > 0 && i % 10 === 0) { await authedRef(); }
  run(`agent-browser --session ref open "https://eon.base44.app${route}"`);
  run(`agent-browser --session loc open "http://127.0.0.1:3200${route}"`);
  await new Promise(r => setTimeout(r, 4200));
  let ref = await evalOn("ref", READ, 2200);
  if (Array.isArray(ref) && ref.some(x => x.tg === "h1" && (x.t || "").includes("Welcome to Eon HR") && x.w < 700)) { await auth("ref", "https://eon.base44.app"); run(`agent-browser --session ref open "https://eon.base44.app${route}"`); await new Promise(r => setTimeout(r, 4200)); ref = await evalOn("ref", READ, 2200); }
  const loc = await evalOn("loc", READ, 500);
  console.log(`\n=== ${route} ===`);
  console.log("REF count:", Array.isArray(ref) ? ref.length : ref, "| LOC count:", Array.isArray(loc) ? loc.length : loc);
  all.push({ route, ref, loc });
  writeFileSync(dumpName, JSON.stringify(all, null, 1));
}
console.log(`probe dump: ${dumpName}`);
process.exit(0);
