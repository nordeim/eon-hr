#!/usr/bin/env node
// r60-probe2.mjs — full-class reads + the light/dark 4-way mapping for the
// three candidates + the REF settings Edit button's press behavior.
import { execSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r60p2.log 2>&1`],
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

async function setDark(session, val) {
  await evalOn(session, `localStorage.setItem('darkMode','${val}')`);
}
async function openBoth(route) {
  run(`agent-browser --session ref open "https://eon.base44.app${route}"`);
  run(`agent-browser --session loc open "http://127.0.0.1:3200${route}"`);
  await new Promise(r => setTimeout(r, 4200));
}

// ---- LIGHT MODE reads first (the sessions boot light by default) ----
await openBoth("/securitysettings");
const CB = `(() => {
  const boxes = [...document.querySelectorAll('main button')].filter(b => b.className.includes('peer h-4 w-4'));
  const checked = boxes.find(b => b.dataset.state === 'checked');
  if (!checked) return { found: false };
  const cs = getComputedStyle(checked);
  const svg = checked.querySelector('svg');
  return { found: true, cls: checked.className, bg: cs.backgroundColor, c: cs.color, svgCls: svg ? svg.getAttribute('class') : null, svgC: svg ? getComputedStyle(svg).color : null };
})()`;
console.log("\n===== checkbox LIGHT (ref/loc) =====");
console.log("REF:", JSON.stringify(await evalOn("ref", CB, 2000)));
console.log("LOC:", JSON.stringify(await evalOn("loc", CB, 600)));

await openBoth("/employees");
const TOGFULL = `(() => {
  const btns = [...document.querySelectorAll('main button')].filter(b => (b.getAttribute('aria-label')||'').includes('view'));
  return btns.map(b => { const cs = getComputedStyle(b); const r = b.getBoundingClientRect(); return { aria: b.getAttribute('aria-label'), cls: b.className, bg: cs.backgroundColor, c: cs.color, w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x) }; });
})()`;
console.log("\n===== toggle pair LIGHT (ref/loc) =====");
console.log("REF:", JSON.stringify(await evalOn("ref", TOGFULL, 2000)));
console.log("LOC:", JSON.stringify(await evalOn("loc", TOGFULL, 600)));

const SETLIGHT = `(() => {
  const btns = [...document.querySelectorAll('main button')].filter(b => b.getBoundingClientRect().height > 0);
  return btns.map(b => { const cs = getComputedStyle(b); return { t: (b.textContent||'').trim().slice(0,20), cls: b.className, bg: cs.backgroundColor, c: cs.color }; });
})()`;
console.log("\n===== settings buttons LIGHT (ref) =====");
console.log("REF:", JSON.stringify(await evalOn("ref", SETLIGHT, 2000)));

// ---- REF settings Edit button: press it (light mode) and see what opens ----
const EDIT_CLICK = `(() => {
  const btn = [...document.querySelectorAll('main button')].find(b => (b.textContent||'').trim() === 'Edit');
  if (!btn) return { found: false };
  btn.click();
  return { found: true, clicked: true };
})()`;
console.log("\n===== REF settings Edit press =====");
console.log("click:", JSON.stringify(await evalOn("ref", EDIT_CLICK)));
await new Promise(r => setTimeout(r, 2500));
const EDIT_STATE = `(() => {
  const dlg = document.querySelector('[role=dialog], [data-state=open]');
  const inputs = [...document.querySelectorAll('input, textarea, select')].filter(i => i.getBoundingClientRect().height > 0).length;
  const headings = [...document.querySelectorAll('h1,h2,h3,[role=dialog] h2')].filter(h => h.getBoundingClientRect().height > 0).map(h => (h.textContent||'').trim().slice(0,40));
  return { dialog: !!dlg, dlgText: dlg ? (dlg.textContent||'').trim().slice(0, 600) : null, inputCount: inputs, headings: headings.slice(0, 12) };
})()`;
console.log("state:", JSON.stringify(await evalOn("ref", EDIT_STATE, 0)));

// ---- DARK MODE reads ----
for (const s of ["loc", "ref"]) await setDark(s, "true");
await openBoth("/employees");
console.log("\n===== toggle pair DARK (ref/loc) =====");
console.log("REF:", JSON.stringify(await evalOn("ref", TOGFULL, 2200)));
console.log("LOC:", JSON.stringify(await evalOn("loc", TOGFULL, 600)));

await openBoth("/securitysettings");
console.log("\n===== checkbox DARK (ref) =====");
console.log("REF:", JSON.stringify(await evalOn("ref", CB, 2200)));

// restore light
for (const s of ["loc", "ref"]) await setDark(s, "false");
process.exit(0);
