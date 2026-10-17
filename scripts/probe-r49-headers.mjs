#!/usr/bin/env node
// probe-r49-headers.mjs — session-49 / parity round 48 census:
// the BARE-family headers + the C-page header zones. For each route dump
// the title-element inventory (h1/h2/h3), the kicker bar classes, the
// content-root classes, and a shallow outline of the first content
// children. Side flag: "ref" (default, needs only the daemon) or "loc"
// (boots the standalone server in the same process tree first).
// Usage: node scripts/probe-r49-headers.mjs ref /organogram /settings
import { execSync, spawn } from "node:child_process";

function run(cmd) {
  try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); }
  catch (e) { return "ERR:" + String(e).slice(0, 140); }
}
async function evalOn(session, expr, ms = 0) {
  if (ms) await new Promise(r => setTimeout(r, ms));
  const oneLine = expr.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try {
    return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " "));
  } catch { return { error: out.slice(0, 300) }; }
}

const side = process.argv[2] || "ref";
const routes = process.argv.slice(3);
const BASE = side === "ref" ? "https://eon.base44.app" : "http://127.0.0.1:3201";

// boot the LOC standalone server inside this process tree when needed
let server = null;
if (side === "loc") {
  server = spawn("bash", ["-c",
    'cd /home/z/my-project/eon-hr && mkdir -p db && DATABASE_URL="file:../db/e2e-zero.db" npx prisma db push --skip-generate >/dev/null 2>&1; DATABASE_URL="file:../db/e2e-zero.db" AUTH_SECRET=zero-tenant-secret PORT=3201 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc0.log 2>&1'],
    { detached: false, stdio: "ignore" });
  let up = false;
  for (let i = 0; i < 90; i++) {
    const probe = run('curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3201/api/health');
    if (!probe.startsWith("ERR")) { up = true; break; }
    await new Promise(r => setTimeout(r, 500));
  }
  console.log("loc server:", up ? "up" : "DOWN");
}

const READER = `(() => {
  const main = document.querySelector('main');
  const sc = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!sc) return { gone: true, path: location.pathname };
  const kick = sc.querySelector(':scope > div, :scope > *');
  const kickCls = kick ? (kick.className || '').slice(0, 220) : null;
  const titles = [];
  for (const t of sc.querySelectorAll('h1, h2, h3')) {
    titles.push(t.tagName + ' [' + (t.className || '').slice(0, 130) + '] ' + t.textContent.trim().slice(0, 40));
    if (titles.length >= 8) break;
  }
  const outline = [];
  const walk = (el, d) => {
    if (outline.length >= 26 || d > 5) return;
    const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').replace(/\\s+/g, ' ').trim();
    if (own || el.tagName !== 'DIV') outline.push(' '.repeat(d * 2) + el.tagName + '[' + (el.className || '').toString().slice(0, 95) + ']' + (own ? ':' + own.slice(0, 34) : ''));
    for (const c of el.children) walk(c, d + 1);
  };
  walk(sc, 0);
  const svgGlyphs = [...sc.querySelectorAll('svg')].slice(0, 6).map(s => (s.getAttribute('class') || '').slice(0, 90));
  return { kickCls, titles, outline, svgGlyphs };
})()`;

for (const route of routes) {
  run(`agent-browser --session ${side === "ref" ? "ref" : "loc0"} open "${BASE}${route}"`);
  await new Promise(r => setTimeout(r, side === "ref" ? 2600 : 2100));
  const r = await evalOn(side === "ref" ? "ref" : "loc0", READER);
  console.log(`\n===== ${route} =====`);
  console.log(JSON.stringify(r, null, 1).slice(0, 3200));
}

if (server) { try { process.kill(-server.pid); } catch {} }
