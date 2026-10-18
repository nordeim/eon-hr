#!/usr/bin/env node
// r54-screenshots.mjs — parity round 53's evidence captures: the
// interaction-walk surfaces — the drawer's at-rest open state (the
// collapsed group map), the Payroll group expansion round-trip, and the
// leaf-tap RETENTION divergence evidence (REF keeps the drawer open on
// /training, the clone closes it — the documented superset re-verified).
// REF + seeded LOC pairs, one process tree with the :3200 server.
// Numbers continue from 241.
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-shots-r54.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }

async function auth(session, base) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3000));
  run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  await new Promise(r => setTimeout(r, 400));
  run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
  await new Promise(r => setTimeout(r, 400));
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const ref = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
  if (ref) run(`agent-browser --session ${session} click @${ref}`);
  await new Promise(r => setTimeout(r, 4200));
  console.log(session, "->", run(`agent-browser --session ${session} get url`).trim());
}
await auth("ref", "https://eon.base44.app");
await auth("loc", "http://127.0.0.1:3200");

// ---- 242: the drawer's at-rest open state (the collapsed group map) ----
for (const [session, base, suffix] of [["ref", "https://eon.base44.app", "ref"], ["loc", "http://127.0.0.1:3200", "loc"]]) {
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 2200));
  run(`agent-browser --session ${session} click 'button[data-sidebar=trigger]'`);
  await new Promise(r => setTimeout(r, 1600));
  run(`agent-browser --session ${session} screenshot ${shots}/242-drawer-atrest-collapsedmap-${suffix}.png`);
  console.log(`242-drawer-atrest-collapsedmap-${suffix}.png`);

  // ---- 243: the Payroll group expansion round-trip ----
  run(`agent-browser --session ${session} eval "var ov=document.querySelector('.fixed.inset-0'); var gs=Array.from(ov.nextElementSibling.querySelectorAll('[aria-controls]')); gs.find(function(g){return g.textContent.trim()==='Payroll'}).click(); 'expanded'"`);
  await new Promise(r => setTimeout(r, 900));
  run(`agent-browser --session ${session} screenshot ${shots}/243-drawer-payroll-expanded-${suffix}.png`);
  console.log(`243-drawer-payroll-expanded-${suffix}.png`);

  // ---- 244: the leaf-tap retention divergence (the evidence) ----
  // tap the VISIBLE Training LMS link; REF keeps the drawer open on the
  // new route, the clone closes it — the divergence, captured
  run(`agent-browser --session ${session} eval "var links=Array.from(document.querySelectorAll('a[href=\"/training\"]')); var vis=links.find(function(a){return a.offsetParent!==null}); if(vis){vis.click()} 'tapped'"`);
  await new Promise(r => setTimeout(r, 1900));
  run(`agent-browser --session ${session} screenshot ${shots}/244-leaftap-retention-${suffix}.png`);
  console.log(`244-leaftap-retention-${suffix}.png`);
}

// ---- 245: the desktop sidebar at-rest (the interaction-walk's bookend:
// the same NAV registry the drawer serves, at 1440x900) ----
for (const [session, base, suffix] of [["ref", "https://eon.base44.app", "ref"], ["loc", "http://127.0.0.1:3200", "loc"]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 2400));
  run(`agent-browser --session ${session} screenshot ${shots}/245-sidebar-atrest-desktop-${suffix}.png`);
  console.log(`245-sidebar-atrest-desktop-${suffix}.png`);
}

const files = run(`ls ${shots} | wc -l`).trim();
console.log(`\ntotal files in docs/screenshots: ${files}`);
process.exit(0);
