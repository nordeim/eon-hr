#!/usr/bin/env node
// r66-probe.mjs — session-66 / parity round 65: the element-level
// margin/gap decomposition. For each DIFF route from the r66 census, dump
// EVERY margin/gap-bearing element in main: tag, margins (the SAME
// space-y/space-x normalization as the census), gaps, class string
// (compact), text snippet, and rect — both sides — so DIFF tuples can be
// attributed to concrete elements (the r64/r65 probe pattern).
// Usage: node scripts/r66-probe.mjs [route ...]
import { execSync, spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r66p.log 2>&1`],
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
  if (url.includes("/login")) { await auth("ref", "https://eon.base44.app"); await evalOn("ref", `localStorage.setItem('darkMode','false')`); }
}

// The margin/gap element inventory — same normalization as the census
// (mark II: the parent's space-y-N value parsed from the class; every
// child pair (0,0)/(N,0)/(0,N)/(N,N) → 'v:N' — position-independent).
const READ = `(() => {
  const out = [];
  const px = (v) => { const m = String(v).match(/^-?\\d+(?:\\.\\d+)?px$/); return m ? String(parseFloat(v)) : String(v); };
  const gp = (v) => { const s = px(v); return s === 'normal' ? '0' : s; };
  const syScale = { '0': 0, '0.5': 2, '1': 4, '1.5': 6, '2': 8, '2.5': 10, '3': 12, '3.5': 14, '4': 16, '5': 20, '6': 24, '7': 28, '8': 32, '9': 36, '10': 40, '11': 44, '12': 48, '14': 56, '16': 64, '20': 80, '24': 96, '28': 112, '32': 128, 'px': 1 };
  const tokVal = (pcls, axis) => {
    let v = null;
    for (const t of pcls.split(/\\s+/)) {
      const m = t.match(new RegExp('^(?:[a-z0-9]+:)?space-' + axis + '-([a-z0-9.]+)$'));
      if (m && (m[1] in syScale)) v = syScale[m[1]];
    }
    return v;
  };
  const normPairV = (a, b, N) => {
    const na = parseFloat(a), nb = parseFloat(b);
    if (isNaN(na) || isNaN(nb)) return [a, b];
    if ((na === 0 && nb === 0 && N !== null) || (N !== null && ((na === N && nb === 0) || (na === 0 && nb === N) || (na === N && nb === N)))) return ['v:' + N, 'v:' + N];
    if (na === nb) return ['v:' + na, 'v:' + na];
    if (na === 0) return ['v:' + nb, 'v:' + nb];
    if (nb === 0) return ['v:' + na, 'v:' + na];
    return [a, b];
  };
  for (const el of document.querySelectorAll('main, main *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const cs = getComputedStyle(el);
    let mt = px(cs.marginTop), mr = px(cs.marginRight), mb = px(cs.marginBottom), ml = px(cs.marginLeft);
    const rg = gp(cs.rowGap), cg = gp(cs.columnGap);
    const pcls = (el.parentElement && el.parentElement.getAttribute('class')) || '';
    const isSy = /(^|\\s)\\S*space-y-/.test(pcls);
    const isSx = /(^|\\s)\\S*space-x-/.test(pcls);
    if (isSy) { const p = normPairV(mt, mb, tokVal(pcls, 'y')); mt = p[0]; mb = p[1]; }
    if (isSx) { const p = normPairV(ml, mr, tokVal(pcls, 'x')); ml = p[0]; mr = p[1]; }
    if (mt === '0' && mr === '0' && mb === '0' && ml === '0' && rg === '0' && cg === '0') continue;
    out.push({
      tg: el.tagName.toLowerCase(),
      m: mt + ',' + mr + ',' + mb + ',' + ml,
      g: rg + ',' + cg,
      x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
      cls: ((el.getAttribute && el.getAttribute('class')) || '').replace(/\\s+/g, ' ').slice(0, 110),
      t: (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 30)
    });
  }
  return out;
})()`;

const ROUTES = process.argv.slice(2).length > 0 ? process.argv.slice(2) : [
  "/dashboard", "/employees", "/payroll", "/taskmanager", "/leavemanagement",
  "/expenses", "/loans", "/recruitment", "/training", "/compliancedashboard",
  "/evaluations", "/assetmanagement", "/staffrequests", "/companywall", "/chat",
  "/documenttracker",
];
const dumpName = process.env.R66P_DUMP || "/tmp/r66-probe.log";
const all = [];
for (let i = 0; i < ROUTES.length; i++) {
  const route = ROUTES[i];
  if (i > 0 && i % 10 === 0) { await authedRef(); }
  run(`agent-browser --session ref open "https://eon.base44.app${route}"`);
  run(`agent-browser --session loc open "http://127.0.0.1:3200${route}"`);
  await new Promise(r => setTimeout(r, 4200));
  let ref = await evalOn("ref", READ, 2200);
  if (Array.isArray(ref) && ref.some(x => x.tg === "h1" && (x.t || "").includes("Welcome to Eon HR") && x.w < 700)) { await auth("ref", "https://eon.base44.app"); await evalOn("ref", `localStorage.setItem('darkMode','false')`); run(`agent-browser --session ref open "https://eon.base44.app${route}"`); await new Promise(r => setTimeout(r, 4200)); ref = await evalOn("ref", READ, 2200); }
  const loc = await evalOn("loc", READ, 500);
  console.log(`\n=== ${route} ===`);
  console.log("REF count:", Array.isArray(ref) ? ref.length : ref, "| LOC count:", Array.isArray(loc) ? loc.length : loc);
  all.push({ route, ref, loc });
  writeFileSync(dumpName, JSON.stringify(all, null, 1));
}
console.log(`probe dump: ${dumpName}`);
process.exit(0);
