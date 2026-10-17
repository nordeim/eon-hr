#!/usr/bin/env node
// r51-screenshots.mjs — parity round 50's evidence captures: the round's
// surfaces — the MOBILE navigation menu (390×844: the at-rest chrome with
// the kicker + bottom tabs, the drawer OPEN) and the /Dashboard
// route-casing alias (desktop + mobile). REF + zero-tenant LOC pairs,
// one process tree with the :3201 server. Numbers continue from 232.
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3201$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
run(`rm -f ${repo}/db/zero.db ${repo}/db/zero.db-journal`);
run(`cd ${repo} && DATABASE_URL="file:../db/zero.db" npx prisma db push --skip-generate >/dev/null 2>&1`);
run(`cd ${repo} && DATABASE_URL="file:../db/zero.db" npx tsx prisma/seed.ts >/dev/null 2>&1`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/zero.db" AUTH_SECRET=zero-tenant-secret PORT=3201 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc0-shots-r51.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3201/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }

run('agent-browser --session loc0 set viewport 1440 900');
run('agent-browser --session loc0 open http://127.0.0.1:3201/login');
await new Promise(r => setTimeout(r, 2200));
run('agent-browser --session loc0 fill "input[type=email]" "sepnetflix2023@outlook.com"');
await new Promise(r => setTimeout(r, 350));
run("agent-browser --session loc0 fill 'input[type=password]' '$Abcd1234'");
await new Promise(r => setTimeout(r, 350));
const snap = run('agent-browser --session loc0 snapshot -i -c');
const btnRef = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
if (btnRef) run(`agent-browser --session loc0 click @${btnRef}`);
await new Promise(r => setTimeout(r, 4200));
console.log("loc0:", run('agent-browser --session loc0 get url').trim());

const openDrawer = (session) => run(`agent-browser --session ${session} eval "document.querySelector('header button').click(); 'ok'"`);
const wait = (ms) => new Promise(r => setTimeout(r, ms));

// (1) 232 — the mobile at-rest chrome (kicker + header + bottom tabs), 390×844
run('agent-browser --session ref set viewport 390 844');
run('agent-browser --session ref open "https://eon.base44.app/dashboard"');
await wait(4200);
run(`agent-browser --session ref screenshot "${shots}/232-mobilenav-atrest-ref.png"`);
run('agent-browser --session loc0 set viewport 390 844');
run('agent-browser --session loc0 open "http://127.0.0.1:3201/dashboard"');
await wait(3400);
run(`agent-browser --session loc0 screenshot "${shots}/232-mobilenav-atrest-loc.png"`);
console.log("232 mobilenav-atrest");

// (2) 233 — the mobile drawer OPEN (the nav tree + footer), 390×844
run('agent-browser --session ref set viewport 390 844');
run('agent-browser --session ref open "https://eon.base44.app/dashboard"');
await wait(3600);
openDrawer("ref");
await wait(1300);
run(`agent-browser --session ref screenshot "${shots}/233-mobilenav-drawer-ref.png"`);
run('agent-browser --session loc0 open "http://127.0.0.1:3201/dashboard"');
await wait(3000);
openDrawer("loc0");
await wait(1300);
run(`agent-browser --session loc0 screenshot "${shots}/233-mobilenav-drawer-loc.png"`);
console.log("233 mobilenav-drawer");

// (3) 234 — the /Dashboard route-casing alias, desktop 1440×900
run('agent-browser --session ref set viewport 1440 900');
run('agent-browser --session ref open "https://eon.base44.app/Dashboard"');
await wait(3600);
run(`agent-browser --session ref screenshot "${shots}/234-casing-Dashboard-desktop-ref.png"`);
run('agent-browser --session loc0 set viewport 1440 900');
run('agent-browser --session loc0 open "http://127.0.0.1:3201/Dashboard"');
await wait(3000);
run(`agent-browser --session loc0 screenshot "${shots}/234-casing-Dashboard-desktop-loc.png"`);
console.log("234 casing-Dashboard-desktop");

// (4) 235 — the /Dashboard route-casing alias, mobile 390×844 (kicker form)
run('agent-browser --session ref set viewport 390 844');
run('agent-browser --session ref open "https://eon.base44.app/Dashboard"');
await wait(3600);
run(`agent-browser --session ref screenshot "${shots}/235-casing-Dashboard-mobile-ref.png"`);
run('agent-browser --session loc0 set viewport 390 844');
run('agent-browser --session loc0 open "http://127.0.0.1:3201/Dashboard"');
await wait(3000);
run(`agent-browser --session loc0 screenshot "${shots}/235-casing-Dashboard-mobile-loc.png"`);
console.log("235 casing-Dashboard-mobile");

console.log(`done — 4 pairs`);
process.exit(0);
