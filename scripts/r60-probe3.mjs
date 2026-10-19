#!/usr/bin/env node
// r60-probe3.mjs — verified-theme reads: the 4-way (light/dark x ref/loc)
// mapping for the checkbox + toggle pair; REF's settings Edit press walk;
// the switch in dark; the clone's settings button census.
import { execSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r60p3.log 2>&1`],
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

async function theme(session, base, val) {
  await evalOn(session, `localStorage.setItem('darkMode','${val}')`);
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 2500));
  const st = await evalOn(session, `(() => ({ dark: document.documentElement.classList.contains('dark') }))()`);
  return st;
}

// ---------- LIGHT MODE ----------
console.log("\n########## LIGHT MODE ##########");
console.log("ref:", JSON.stringify(await theme("ref", "https://eon.base44.app", "false")));
console.log("loc:", JSON.stringify(await theme("loc", "http://127.0.0.1:3200", "false")));

const CB = `(() => {
  const boxes = [...document.querySelectorAll('main button')].filter(b => b.className.includes('peer h-4 w-4'));
  const checked = boxes.find(b => b.dataset.state === 'checked');
  if (!checked) return { found: false };
  const cs = getComputedStyle(checked);
  const svg = checked.querySelector('svg');
  return { found: true, bg: cs.backgroundColor, c: cs.color, svgCls: svg ? svg.getAttribute('class') : null, svgC: svg ? getComputedStyle(svg).color : null, w: Math.round(checked.getBoundingClientRect().width) };
})()`;
run('agent-browser --session ref open "https://eon.base44.app/securitysettings"');
run('agent-browser --session loc open "http://127.0.0.1:3200/securitysettings"');
await new Promise(r => setTimeout(r, 4200));
console.log("\n===== checkbox LIGHT =====");
console.log("REF:", JSON.stringify(await evalOn("ref", CB, 2200)));
console.log("LOC:", JSON.stringify(await evalOn("loc", CB, 600)));

const TOG = `(() => {
  const btns = [...document.querySelectorAll('main button')].filter(b => { const r = b.getBoundingClientRect(); return r.height >= 28 && r.height <= 40 && r.x > 1250 && b.querySelector('svg') && (b.textContent||'').trim() === ''; });
  return btns.map(b => { const cs = getComputedStyle(b); const r = b.getBoundingClientRect(); return { cls: b.className, bg: cs.backgroundColor, c: cs.color, w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), svg: (b.querySelector('svg').getAttribute('class')||'').slice(0,50) }; });
})()`;
run('agent-browser --session ref open "https://eon.base44.app/employees"');
run('agent-browser --session loc open "http://127.0.0.1:3200/employees"');
await new Promise(r => setTimeout(r, 4200));
console.log("\n===== toggle pair LIGHT =====");
console.log("REF:", JSON.stringify(await evalOn("ref", TOG, 2200)));
console.log("LOC:", JSON.stringify(await evalOn("loc", TOG, 600)));

const SETB = `(() => {
  const btns = [...document.querySelectorAll('main button')].filter(b => b.getBoundingClientRect().height > 0);
  return btns.map(b => { const cs = getComputedStyle(b); const r = b.getBoundingClientRect(); return { t: (b.textContent||'').trim().slice(0,24), bg: cs.backgroundColor, c: cs.color, w: Math.round(r.width), h: Math.round(r.height), clsTail: b.className.slice(-140) }; });
})()`;
run('agent-browser --session ref open "https://eon.base44.app/settings"');
run('agent-browser --session loc open "http://127.0.0.1:3200/settings"');
await new Promise(r => setTimeout(r, 4200));
console.log("\n===== settings buttons LIGHT =====");
console.log("REF:", JSON.stringify(await evalOn("ref", SETB, 2200)));
console.log("LOC:", JSON.stringify(await evalOn("loc", SETB, 600)));

// REF settings Edit press walk (light mode)
const EDIT = `(() => {
  const btn = [...document.querySelectorAll('main button')].find(b => (b.textContent||'').trim() === 'Edit');
  if (!btn) return { found: false };
  const cs = getComputedStyle(btn);
  return { found: true, cls: btn.className, bg: cs.backgroundColor, c: cs.color };
})()`;
console.log("\n===== REF settings Edit (light, at-rest) =====");
console.log(JSON.stringify(await evalOn("ref", EDIT, 0)));
const CLICK = `(() => {
  const btn = [...document.querySelectorAll('main button')].find(b => (b.textContent||'').trim() === 'Edit');
  if (!btn) return { found: false };
  btn.click(); return { clicked: true };
})()`;
console.log("press:", JSON.stringify(await evalOn("ref", CLICK)));
await new Promise(r => setTimeout(r, 2600));
const DLG = `(() => {
  const dlg = document.querySelector('[role=dialog]');
  if (!dlg) return { dialog: false };
  const cs = getComputedStyle(dlg);
  const r = dlg.getBoundingClientRect();
  const fields = [...dlg.querySelectorAll('label, input, textarea, select')].map(el => ({ tag: el.tagName.toLowerCase(), t: (el.textContent||el.getAttribute('placeholder')||'').trim().slice(0,30), val: (el.value||'').slice(0,24) }));
  const btns = [...dlg.querySelectorAll('button')].map(b => ({ t: (b.textContent||'').trim().slice(0,24), clsTail: b.className.slice(-90) }));
  return { dialog: true, w: Math.round(r.width), h: Math.round(r.height), bg: cs.backgroundColor, fields, btns, text: (dlg.textContent||'').replace(/\\s+/g,' ').trim().slice(0, 400) };
})()`;
console.log("dialog state:", JSON.stringify(await evalOn("ref", DLG)));

// ---------- DARK MODE ----------
console.log("\n########## DARK MODE ##########");
console.log("ref:", JSON.stringify(await theme("ref", "https://eon.base44.app", "true")));
console.log("loc:", JSON.stringify(await theme("loc", "http://127.0.0.1:3200", "true")));

run('agent-browser --session ref open "https://eon.base44.app/employees"');
run('agent-browser --session loc open "http://127.0.0.1:3200/employees"');
await new Promise(r => setTimeout(r, 4200));
console.log("\n===== toggle pair DARK =====");
console.log("REF:", JSON.stringify(await evalOn("ref", TOG, 2200)));
console.log("LOC:", JSON.stringify(await evalOn("loc", TOG, 600)));

run('agent-browser --session ref open "https://eon.base44.app/securitysettings"');
run('agent-browser --session loc open "http://127.0.0.1:3200/securitysettings"');
await new Promise(r => setTimeout(r, 4200));
console.log("\n===== checkbox DARK =====");
console.log("REF:", JSON.stringify(await evalOn("ref", CB, 2200)));
console.log("LOC:", JSON.stringify(await evalOn("loc", CB, 600)));

// the switch in dark (notificationpreferences)
run('agent-browser --session ref open "https://eon.base44.app/notificationpreferences"');
run('agent-browser --session loc open "http://127.0.0.1:3200/notificationpreferences"');
await new Promise(r => setTimeout(r, 4200));
const SW = `(() => {
  const sw = document.querySelector('main button[role=switch][data-state=checked]');
  if (!sw) return { found: false };
  const cs = getComputedStyle(sw);
  const thumb = sw.querySelector('span');
  const tcs = thumb ? getComputedStyle(thumb) : null;
  return { found: true, bg: cs.backgroundColor, c: cs.color, thumbBg: tcs ? tcs.backgroundColor : null, cls: sw.className.slice(0, 200) };
})()`;
console.log("\n===== switch DARK (notificationpreferences) =====");
console.log("REF:", JSON.stringify(await evalOn("ref", SW, 2200)));
console.log("LOC:", JSON.stringify(await evalOn("loc", SW, 600)));

// settings in dark — the Edit button + clone census
run('agent-browser --session ref open "https://eon.base44.app/settings"');
run('agent-browser --session loc open "http://127.0.0.1:3200/settings"');
await new Promise(r => setTimeout(r, 4200));
console.log("\n===== settings buttons DARK (tail compare) =====");
console.log("REF:", JSON.stringify(await evalOn("ref", SETB, 2200)));
console.log("LOC:", JSON.stringify(await evalOn("loc", SETB, 600)));
process.exit(0);
