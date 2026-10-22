#!/usr/bin/env node
// r79-final-pairs.mjs — the round-FINAL byte-stability re-proof on the
// newest deploy generation (login JS index-C-2DbpoC + CSS index-COIHZiZl,
// detected at the round-end watch read). The full ladder is already green
// on this generation (the fresh login pair BYTE-IDENTICAL to 69aa4241… +
// standing 5/5 + sweep 12/12 + verify-r49 13/13 + verify-r45 13/13); this
// re-captures the two STANDING byte-chain pairs on the final generation so
// the round's chain claims (632≡615 the FIFTEEN-round chain + 616≡599
// the login pair) are made on the generation the round closes on.
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup node .next/standalone/server.js > /tmp/loc3200-final-r79.log 2>&1 < /dev/null &`],
  { stdio: "ignore", detached: true });
server.unref();
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }
console.log("server up on :3200");

run(`agent-browser close --all 2>/dev/null; true`);
for (const s of [["ref79f", "https://eon.base44.app"], ["loc79f", "http://127.0.0.1:3200"]]) {
  run(`agent-browser --session ${s[0]} set viewport 1440 900`);
  run(`agent-browser --session ${s[0]} eval "localStorage.setItem('darkMode','false')"`);
}
const pairs = [["ref79f", "https://eon.base44.app", "ref"], ["loc79f", "http://127.0.0.1:3200", "loc"]];

// ---- 599 (re-capture on the final generation): the LOGIN pair ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
  run(`agent-browser --session ${session} screenshot ${shots}/616-login-standing-${suffix}.png`);
  console.log("re-captured 616-login-standing-" + suffix);
}

// ---- auth both sides for the drawer pair ----
async function auth(session, base) {
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
await auth("ref79f", "https://eon.base44.app");
await auth("loc79f", "http://127.0.0.1:3200");

// ---- 615 (re-capture on the final generation): the mobile drawer pair
//      @390x844 via the r71 corrected snapshot-ref mechanism ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} eval "localStorage.setItem('darkMode','false')"`);
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
  run(`agent-browser --session ${session} screenshot ${shots}/632-mobile-drawer-light-${suffix}.png`);
  console.log("re-captured 632-mobile-drawer-light-" + suffix);
}

// ---- the byte-stability verdicts on the final generation ----
const md5 = (f) => run(`md5sum ${shots}/${f}.png 2>/dev/null | awk '{print $1}'`).trim();
console.log("\n==== FINAL-GEN BYTE-STABILITY (632 vs the r78 615 pair) ====");
console.log("loc 632:", md5("632-mobile-drawer-light-loc"), "(r78 615: e3df921135be28f60031af57d58df879)", md5("632-mobile-drawer-light-loc") === "e3df921135be28f60031af57d58df879" ? "STABLE" : "DRIFT");
console.log("ref 632:", md5("632-mobile-drawer-light-ref"), "(r78 615: bfaa0da55e77277d910bd13c25d4e618)", md5("632-mobile-drawer-light-ref") === "bfaa0da55e77277d910bd13c25d4e618" ? "STABLE" : "DRIFT");
console.log("\n==== FINAL-GEN LOGIN-PAIR STABILITY (616 vs the r78 599 pair) ====");
console.log("loc 616:", md5("616-login-standing-loc"), "(r78 599: bd718ed052ff48124b11b8919c8b9b4d)", md5("616-login-standing-loc") === "bd718ed052ff48124b11b8919c8b9b4d" ? "STABLE" : "DRIFT");
console.log("ref 616:", md5("616-login-standing-ref"), "(r78 599: 69aa4241efa1a2b4994b698fc5cad2a4)", md5("616-login-standing-ref") === "69aa4241efa1a2b4994b698fc5cad2a4" ? "STABLE" : "DRIFT");
console.log("done");
