#!/usr/bin/env node
// r56-screenshots.mjs — session-56 / parity round 55 captures: the
// read-only surface family's post-fix state, paired REF vs LOC:
//   250 — the settings Company Information tiles (1440×900)
//   251 — the settings Company grid at 390×844 (the 2-track implicit form)
//   252 — the profile General form (the disabled identity email + the
//         bare phone/job-title fields)
//   253 — the hrreports thead slate header
// Boots the seeded :3200 standalone inside this process tree.
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
const settle = (ms) => new Promise(r => setTimeout(r, ms));

const repo = "/home/z/my-project/eon-hr";
const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const shotDir = `${repo}/docs/screenshots`;

run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r56s.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await settle(500);
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }
console.log("seeded server up on :3200");

async function pair(num, label, path, viewport, waitText) {
  for (const [session, base, tag] of [["ref56", baseRef, "ref"], ["loc", baseLoc, "loc"]]) {
    run(`agent-browser --session ${session} set viewport ${viewport[0]} ${viewport[1]}`);
    run(`agent-browser --session ${session} open ${base}${path}`);
    await settle(3000);
    if (waitText) {
      // wait for the data-gated render (the Loader2 phases)
      for (let i = 0; i < 12; i++) {
        const has = run(`agent-browser --session ${session} eval ${JSON.stringify(`document.body.textContent.includes('${waitText}')`)}`).trim();
        if (has.includes("true")) break;
        await settle(800);
      }
    }
    const file = `${shotDir}/${num}-${label}-${tag}.png`;
    run(`agent-browser --session ${session} screenshot ${file}`);
    console.log(`${num}-${label}-${tag}.png`);
  }
}

// 250 — the settings Company tiles (desktop, the post-fix slate recipe)
await pair(250, "settings-tiles", "/settings", [1440, 900], "Company Information");
// 251 — the settings Company grid at 390 (the 2-track implicit form)
await pair(251, "settings-mobile-grid", "/settings", [390, 844], "Company Information");
// 252 — the profile General form (the disabled identity email)
await pair(252, "profile-general", "/profile", [1440, 900], "Personal Information");
// 253 — the hrreports thead slate header
await pair(253, "hrreports-thead", "/hrreports", [1440, 900], "full name");

console.log("captures complete");
process.exit(0);
