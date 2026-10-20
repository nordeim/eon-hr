#!/usr/bin/env node
// r65-probe2.mjs — session-65 / parity round 64: the STAT-TILE recipe probe.
// For every stat-tile-family page (the StatCard variant map), read every
// element in main whose class carries rounded-xl/rounded-lg + a bg-*-100
// tile color: its computed padding, radius, size, and class tail — both
// sides. This maps REF's LIVE tile recipe per page (p-3 padding-driven vs
// the clone's fixed w-12 h-12) and closes the set-blindness question.
import { execSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r65p2.log 2>&1`],
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
await auth("loc", "http://127.0.0.1:3200");
await auth("ref", "https://eon.base44.app");

const READ = `(() => {
  const out = [];
  const px = (v) => { const m = String(v).match(/^-?\\d+(?:\\.\\d+)?px$/); return m ? String(parseFloat(v)) : String(v); };
  const rad = (v) => { const n = parseFloat(v); return (!isNaN(n) && n >= 9999) ? 'full' : String(v); };
  for (const el of document.querySelectorAll('main div, main span, main p, main button')) {
    const cls = typeof el.className === 'string' ? el.className : '';
    if (!/rounded-(xl|lg|md|full|sm)/.test(cls)) continue;
    if (!/bg-(blue|green|purple|orange|yellow|teal|red|slate|indigo|pink|cyan|amber|emerald|violet)-100/.test(cls)) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const cs = getComputedStyle(el);
    out.push({
      tg: el.tagName.toLowerCase(),
      p: [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map(px).join(','),
      r: rad(px(cs.borderRadius)),
      w: Math.round(r.width), h: Math.round(r.height),
      cls: cls.replace(/\\s+/g, ' ').slice(0, 80)
    });
  }
  return out;
})()`;

const ROUTES = [
  "/payroll", "/expenses", "/surveys", "/attendance", "/advancedanalytics",
  "/analytics", "/recruitment", "/compliancedashboard", "/assetmanagement",
  "/attendancedashboard", "/surveyanalytics", "/analyticsdashboard",
  "/payrollmodule", "/documenttracker", "/requestreports", "/evaluations",
  "/allleaverequests", "/payrollai",
];
for (let i = 0; i < ROUTES.length; i++) {
  const route = ROUTES[i];
  if (i > 0 && i % 8 === 0) { await authedRef(); }
  run(`agent-browser --session ref open "https://eon.base44.app${route}"`);
  run(`agent-browser --session loc open "http://127.0.0.1:3200${route}"`);
  await new Promise(r => setTimeout(r, 4200));
  const ref = await evalOn("ref", READ, 2200);
  const loc = await evalOn("loc", READ, 500);
  const fmt = (arr) => Array.isArray(arr) ? arr.map(e => `${e.tg} p=${e.p} r=${e.r} ${e.w}x${e.h} "${e.cls.slice(0, 46)}"`) : String(arr).slice(0, 120);
  console.log(`\n=== ${route} ===`);
  console.log("REF:", JSON.stringify(fmt(ref)));
  console.log("LOC:", JSON.stringify(fmt(loc)));
}
process.exit(0);
