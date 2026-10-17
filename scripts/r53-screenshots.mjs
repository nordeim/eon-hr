#!/usr/bin/env node
// r53-screenshots.mjs — parity round 52's evidence captures: the round's
// census surfaces — the bottom-nav ACTIVE-STATE family at 390×844 (two
// representative tab routes: /employees Staff-active + /profile
// Profile-active) and the desktop sidebar with ALL groups expanded (the
// nav-registry drift re-check surface re-read through the 20th deploy).
// REF + seeded LOC pairs, one process tree with the :3200 server.
// Numbers continue from 238.
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-shots-r53.log 2>&1`],
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

const wait = (ms) => new Promise(r => setTimeout(r, ms));
const EXPAND_ALL = `(() => { const t = [...document.querySelectorAll('[data-sidebar] button[aria-expanded="false"]')]; t.forEach(b => b.click()); return t.length; })()`;

// (1) 239 — the bottom-nav ACTIVE state on /employees (Staff tab active,
// blue-600 on the blue-50 pill; Home inactive slate-600) at 390×844
for (const [session, base, suffix] of [["ref", "https://eon.base44.app", "ref"], ["loc", "http://127.0.0.1:3200", "loc"]]) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/employees`);
  await wait(2800);
  run(`agent-browser --session ${session} screenshot ${shots}/239-bottomnav-employees-active-${suffix}.png`);
  console.log("239", suffix, "captured");
}

// (2) 240 — the bottom-nav ACTIVE state on /profile (Profile tab active)
for (const [session, base, suffix] of [["ref", "https://eon.base44.app", "ref"], ["loc", "http://127.0.0.1:3200", "loc"]]) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/profile`);
  await wait(2800);
  run(`agent-browser --session ${session} screenshot ${shots}/240-bottomnav-profile-active-${suffix}.png`);
  console.log("240", suffix, "captured");
}

// (3) 241 — the desktop fully-expanded sidebar (the registry drift
// re-check surface — the 52-entry tree, 10 triggers + 44 leaves)
for (const [session, base, suffix] of [["ref", "https://eon.base44.app", "ref"], ["loc", "http://127.0.0.1:3200", "loc"]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await wait(3000);
  run(`agent-browser --session ${session} eval ${JSON.stringify(EXPAND_ALL)}`);
  await wait(1000);
  run(`agent-browser --session ${session} screenshot ${shots}/241-navregistry-expanded-${suffix}.png`);
  console.log("241", suffix, "captured");
}

console.log(run(`ls -la ${shots} | grep -c "23[9]\\|24[01]"`));
console.log("all captures done");
server.kill();
process.exit(0);
