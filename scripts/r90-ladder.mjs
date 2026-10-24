#!/usr/bin/env node
// r90-ladder.mjs — session-90 / parity round 89: the FULL STANDING LADDER
// opening read. The r90 deploy-watch read the 60TH LOGIN DEPLOY (login JS
// index-BWZiPLrS → index-CrrEG27W, login CSS index-BD8HgQNX → index-BlYK4iZ6,
// app side QUIET) → protocol: ladder every observed generation.
//   Step 1  the fresh logged-out REF login pair byte-compare vs the
//           69aa4241… baseline (545-login-standing-ref.png)
//   Step 2  standing audits (probe-r37-standing — expects 5/5)
//   Step 3  route sweep (probe-r41-routesweep — expects 12/12)
//   verify-r49 + verify-r45 run separately (their own zero-tenant boots).
// Standing contracts honored: ref re-auth FIRST (the r83 between-rounds
// cookie-expiry protocol), the loc session authed on the seeded standalone,
// the fill-settle-click pattern, the single-quoted password, the experiment-
// assignment probe BEFORE any variant classification (the r89 adoption).
import { execSync, spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
function run(cmd, t = 120000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
const md5 = (p) => crypto.createHash("md5").update(fs.readFileSync(p)).digest("hex").slice(0, 12);

// ---------- Step 1: the fresh logged-out login pair ----------
run(`agent-browser --session ref90probe close 2>/dev/null; true`);
run(`agent-browser --session ref90probe set viewport 1440 900`);
run(`agent-browser --session ref90probe eval "localStorage.setItem('darkMode','false')"`);
run(`agent-browser --session ref90probe open https://eon.base44.app/login`);
await new Promise(r => setTimeout(r, 3500));
// the experiment-assignment probe (the r89 standing adoption)
const expRaw = run(`agent-browser --session ref90probe eval "JSON.stringify((window.__APP_CONFIG__||{}).PRE_AUTH_EXPERIMENTS||null)"`);
console.log("experiment probe (pre-auth):", expRaw.trim().slice(0, 220));
const cap = `/tmp/r90-probe-login-ref.png`;
run(`agent-browser --session ref90probe screenshot ${cap}`);
const now = md5(cap);
const base = md5(`${shots}/545-login-standing-ref.png`);
console.log(`STEP 1 — fresh login pair: probe ${now} vs baseline ${base} (545-login-standing-ref)`);
console.log(now === base ? "  BYTE-IDENTICAL — the login surface unchanged (NON-VISUAL hold)" : "  BYTES DIFFER — the 60th RENDERED; audit member by member");
run(`agent-browser --session ref90probe close 2>/dev/null; true`);

// ---------- boot the seeded standalone (final build) ----------
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="r90-standalone-dev-secret-32chars" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r90.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN", run("tail -3 /tmp/loc3200-r90.log")); process.exit(1); }
console.log("seeded standalone up on :3200");

// ---------- auth ref + loc (the careful fill-settle-click) ----------
async function auth(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3000));
  run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  await new Promise(r => setTimeout(r, 400));
  run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
  await new Promise(r => setTimeout(r, 600));
  run(`agent-browser --session ${session} click 'button[type=submit]'`);
  await new Promise(r => setTimeout(r, 5000));
  return run(`agent-browser --session ${session} get url`).trim();
}
const refUrl = await auth("ref", "https://eon.base44.app");
console.log("ref session:", refUrl);
const locUrl = await auth("loc", "http://127.0.0.1:3200");
console.log("loc session:", locUrl);
if (locUrl.includes("/login")) { console.log("LOC AUTH FAILED"); process.exit(1); }

// ---------- Step 2 + 3: the standing audits + the route sweep ----------
console.log("\n########## STANDING AUDITS (expect 5/5) ##########");
console.log(run("node scripts/probe-r37-standing.mjs"));
console.log("\n########## ROUTE SWEEP (expect 12/12) ##########");
console.log(run("node scripts/probe-r41-routesweep.mjs"));
process.exit(0);
