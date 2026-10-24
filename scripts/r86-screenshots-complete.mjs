#!/usr/bin/env node
// r86-screenshots-complete.mjs — the truncated tail of r86-screenshots:
// the RTL settings pair (1219) + the two theme drawer pairs (1221/1223)
// + the final LIGHT sweep + the byte-stability proof block.
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
// the standalone should still be up from the main run; verify + re-boot if needed
if (run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) {
  run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
  const server = spawn("bash", ["-c",
    `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup node .next/standalone/server.js > /tmp/loc3200-shots-r86c.log 2>&1 < /dev/null &`],
    { stdio: "ignore", detached: true });
  server.unref();
  for (let i = 0; i < 120; i++) {
    if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) break;
    await new Promise(r => setTimeout(r, 500));
  }
}
console.log("server up");
run(`agent-browser close --all 2>/dev/null; true`);
for (const s of ["ref86c", "loc86c"]) {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
}
const pairs = [["ref86c", "https://eon.base44.app", "ref"], ["loc86c", "http://127.0.0.1:3200", "loc"]];
function cap(session, name) {
  run(`agent-browser --session ${session} screenshot ${shots}/${name}.png`);
  console.log("captured", name);
}
async function auth(session, base) {
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3000));
  run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  await new Promise(r => setTimeout(r, 500));
  run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
  await new Promise(r => setTimeout(r, 600));
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const ref = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
  if (ref) run(`agent-browser --session ${session} click @${ref}`);
  await new Promise(r => setTimeout(r, 4200));
  const url = run(`agent-browser --session ${session} get url`).trim();
  if (url.includes("/login")) {
    run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
    await new Promise(r => setTimeout(r, 600));
    run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
    await new Promise(r => setTimeout(r, 600));
    const snap2 = run(`agent-browser --session ${session} snapshot -i -c`);
    const ref2 = (snap2.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
    if (ref2) run(`agent-browser --session ${session} click @${ref2}`);
    await new Promise(r => setTimeout(r, 4200));
  }
  console.log(session, "->", run(`agent-browser --session ${session} get url`).trim());
}
await auth("ref86c", "https://eon.base44.app");
await auth("loc86c", "http://127.0.0.1:3200");

async function themeRoutePair(route, name, setup) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} eval "${setup}"`);
    run(`agent-browser --session ${session} set viewport 1440 900`);
    await new Promise(r => setTimeout(r, 400));
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 800));
    run(`agent-browser --session ${session} set viewport 1440 900`);
    await new Promise(r => setTimeout(r, 4600));
    cap(session, `${name}-${suffix}`);
  }
}
const RTL = "localStorage.setItem('darkMode','false'); localStorage.setItem('app_lang','ar');";
const DARK = "localStorage.setItem('darkMode','true'); localStorage.removeItem('app_lang');";
await themeRoutePair("/settings", "1219-rtl-settings", RTL);

async function drawerPair(name, setup) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} eval "${setup}"`);
    run(`agent-browser --session ${session} set viewport 390 844`);
    await new Promise(r => setTimeout(r, 400));
    run(`agent-browser --session ${session} open ${base}/dashboard`);
    await new Promise(r => setTimeout(r, 800));
    run(`agent-browser --session ${session} set viewport 390 844`);
    await new Promise(r => setTimeout(r, 3000));
    const snap = run(`agent-browser --session ${session} snapshot -i -c`);
    const line = (snap.split("\n").find(l => l.includes("Toggle Sidebar")) || "");
    const ref = (line.match(/ref=(\w+)/) || [])[1];
    if (ref) run(`agent-browser --session ${session} click @${ref}`);
    await new Promise(r => setTimeout(r, 1200));
    cap(session, `${name}-${suffix}`);
  }
}
await drawerPair("1221-mobile-drawer-dark", DARK);
await drawerPair("1223-mobile-drawer-rtl", RTL);
for (const s of ["ref86c", "loc86c"]) {
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
}

const md5 = (f) => run(`md5sum ${shots}/${f}.png 2>/dev/null | awk '{print $1}'`).trim();
function cmp(now, was) {
  const ln = md5(now + "-loc"), rn = md5(now + "-ref");
  const lw = md5(was + "-loc"), rw = md5(was + "-ref");
  return `${now}: loc ${ln === lw ? "STABLE" : "DRIFT-BY-DESIGN"} / ref ${rn === rw ? "STABLE" : "DRIFT!! " + rn}`;
}
console.log("\n==== RTL SETTINGS (1219 vs 1107) ====");
console.log(cmp("1219-rtl-settings", "1107-rtl-settings"));
console.log("\n==== THEME DRAWER PAIRS (1221/1223 vs 1109/1111) ====");
console.log(cmp("1221-mobile-drawer-dark", "1109-mobile-drawer-dark"));
console.log(cmp("1223-mobile-drawer-rtl", "1111-mobile-drawer-rtl"));
console.log("done");
