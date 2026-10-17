#!/usr/bin/env node
// r54-probe.mjs — quick DOM probe: count the drawer's aria-expanded buttons
// on the clone (for the R54-A pin's exact selectors).
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }

const repo = "/home/z/my-project/eon-hr";
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r54p.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }

run(`agent-browser --session loc set viewport 390 844`);
run(`agent-browser --session loc open http://127.0.0.1:3200/login`);
await new Promise(r => setTimeout(r, 3000));
run(`agent-browser --session loc fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
run(`agent-browser --session loc fill 'input[type=password]' '$Abcd1234'`);
const snap = run(`agent-browser --session loc snapshot -i -c`);
const btn = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
if (btn) run(`agent-browser --session loc click @${btn}`);
await new Promise(r => setTimeout(r, 4000));

run(`agent-browser --session loc open http://127.0.0.1:3200/dashboard`);
await new Promise(r => setTimeout(r, 2000));
run(`agent-browser --session loc click 'button[data-sidebar=trigger]'`);
await new Promise(r => setTimeout(r, 1500));

const out = run(`agent-browser --session loc eval "JSON.stringify(Array.from(document.querySelectorAll('.fixed.inset-0')).length ? (function(){ var sib=document.querySelector('.fixed.inset-0').nextElementSibling; var btns=Array.from(sib.querySelectorAll('button[aria-expanded]')); return btns.map(function(b){return {name: (b.getAttribute('aria-label') || b.textContent.trim() || '(empty)').slice(0,24), expanded: b.getAttribute('aria-expanded'), hasControls: !!b.getAttribute('aria-controls')}}) })() : 'NO DRAWER')"`);
console.log("DRAWER aria-expanded buttons:", out);
process.exit(0);
