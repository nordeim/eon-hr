#!/usr/bin/env node
// r60-probe8.mjs — the remaining census findings, light+dark both sides:
// (G) the /onboardingtemplates 404 Go Home button; (D) the compliance
// notify text tints in LIGHT; (E) the blue-600 text colors in LIGHT;
// (F) the payrollengine Generate Payroll in LIGHT (the gradient bug).
import { execSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r60p8.log 2>&1`],
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
await auth("loc", "http://127.0.0.1:3200");
await auth("ref", "https://eon.base44.app");
for (const s of ["loc", "ref"]) await evalOn(s, `localStorage.setItem('darkMode','false')`);

const BTN = (sel) => `(() => {
  const btns = [...document.querySelectorAll('${sel}')].filter(b => b.getBoundingClientRect().height > 0);
  return btns.map(b => { const cs = getComputedStyle(b); const r = b.getBoundingClientRect(); return { t: (b.textContent||'').trim().slice(0,24), bg: cs.backgroundColor, bgi: cs.backgroundImage === 'none' ? '' : cs.backgroundImage.slice(0,80), c: cs.color, w: Math.round(r.width), h: Math.round(r.height), clsTail: b.className.slice(-110) }; });
})()`;

async function paired(route, sel, label, dark) {
  run(`agent-browser --session ref open "https://eon.base44.app${route}"`);
  run(`agent-browser --session loc open "http://127.0.0.1:3200${route}"`);
  await new Promise(r => setTimeout(r, 4200));
  console.log(`\n===== ${label} (${dark ? "DARK" : "LIGHT"}) ${route} =====`);
  console.log("REF:", JSON.stringify(await evalOn("ref", BTN(sel), 2200)));
  console.log("LOC:", JSON.stringify(await evalOn("loc", BTN(sel), 600)));
}

// (G) the 404 page — /onboardingtemplates
await paired("/onboardingtemplates", "main button, main a", "404 Go Home", false);
const PAGE = `(() => ({ h1: (document.querySelector('h1')||{}).textContent, text: (document.querySelector('main') ? document.querySelector('main').textContent : document.body.textContent).replace(/\\s+/g,' ').trim().slice(0,220), title: document.title }))()`;
console.log("\nREF 404 page:", JSON.stringify(await evalOn("ref", PAGE, 0)));
console.log("LOC 404 page:", JSON.stringify(await evalOn("loc", PAGE, 0)));

// (D) compliance notify — light
await paired("/compliancedashboard", "main button", "compliance notify", false);

// (F) payrollengine Generate Payroll — light
await paired("/payrollengine", "main button", "payrollengine", false);

// (E) blue-600 + chat — light
await paired("/workflowconfigpage", "main button", "workflowconfigpage", false);
await paired("/notificationpreferences", "main button", "notificationpreferences", false);
await paired("/chat", "main button", "chat new-chat", false);

// DARK pass for the same set
for (const s of ["loc", "ref"]) { await evalOn(s, `localStorage.setItem('darkMode','true')`); }
await paired("/onboardingtemplates", "main button, main a", "404 Go Home", true);
await paired("/compliancedashboard", "main button", "compliance notify", true);
await paired("/payrollengine", "main button", "payrollengine", true);
for (const s of ["loc", "ref"]) await evalOn(s, `localStorage.setItem('darkMode','false')`);
process.exit(0);
