#!/usr/bin/env node
// r87-tabinterior-capture.mjs — session-87 / parity round 86: the
// payrollreports TAB-INTERIOR cross-side capture (the r86 close-out's
// named frontier #1 — the Tax/History/Custom panels were wired as the
// session-35 superset on controlled state but NEVER cross-compared
// against the REF; the r86 round only reached the at-rest Monthly tab).
// Captures the three unexplored tab interiors + the Monthly control pair
// @1440x900 LIGHT LTR, both sides authed via the careful fill-settle-click.
// Standing capture contracts honored: darkMode/app_lang pinned, the badge
// VISIBLE (never dismiss mid-script), fresh seeded standalone on :3200.
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;

// fresh boot of the SEEDED standalone (kill any stale :3200 by PID)
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup node .next/standalone/server.js > /tmp/loc3200-r87tabs.log 2>&1 < /dev/null &`],
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
for (const s of ["ref87t", "loc87t"]) {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
}

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
  const url = run(`agent-browser --session ${session} get url`).trim();
  if (url.includes("/login")) {
    console.log(session, "fill-timing miss — careful retry");
    run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
    await new Promise(r => setTimeout(r, 500));
    run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
    await new Promise(r => setTimeout(r, 600));
    const snap2 = run(`agent-browser --session ${session} snapshot -i -c`);
    const ref2 = (snap2.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
    if (ref2) run(`agent-browser --session ${session} click @${ref2}`);
    await new Promise(r => setTimeout(r, 4200));
  }
}

await auth("ref87t", "https://eon.base44.app");
await auth("loc87t", "http://127.0.0.1:3200");
console.log("ref url:", run(`agent-browser --session ref87t get url`).trim());
console.log("loc url:", run(`agent-browser --session loc87t get url`).trim());

const pairs = [["ref87t", "https://eon.base44.app", "ref"], ["loc87t", "http://127.0.0.1:3200", "loc"]];

// tab labels as the REF renders them (the snapshot-visible names)
const TABS = [
  { key: "monthly", label: "Monthly" },
  { key: "tax", label: "Tax & Deductions" },
  { key: "history", label: "History" },
  { key: "custom", label: "Custom" },
];

for (const tab of TABS) {
  for (const [session, base, suffix] of pairs) {
    run(`agent-browser --session ${session} open ${base}/payrollreports`);
    await new Promise(r => setTimeout(r, 3500));
    // snapshot-ref click (the DOM .click() does NOT activate Radix tabs —
    // the trigger's pointerdown-based activation needs the full pointer
    // event sequence that agent-browser's native click dispatches)
    const snap = run(`agent-browser --session ${session} snapshot -i -c`);
    const ref = (snap.match(new RegExp(`- tab "${tab.label}"[^\\n]*\\[ref=(\\w+)\\]`)) || [])[1];
    if (ref) {
      run(`agent-browser --session ${session} click @${ref}`);
    } else {
      console.log(`${tab.key}-${suffix}: TAB REF NOT FOUND — capturing at-rest`);
    }
    await new Promise(r => setTimeout(r, 2800));
    // FOCUS-STATE NORMALIZATION: the click leaves the trigger focused —
    // the LOC's newer Radix programmatic-focuses it (focus-visible ring
    // rendered; the REF's older Radix does not — an a11y SUPERSET the
    // at-rest protocol must not measure). Blur to capture the SETTLED
    // at-rest panel state both sides.
    run(`agent-browser --session ${session} eval "document.activeElement && document.activeElement.blur()"`);
    // settle-state census of the tab interior (the DOM triage companion)
    const state = run(`agent-browser --session ${session} eval "JSON.stringify({active: (document.querySelector('[role=tab][data-state=active]')||{}).textContent || null, panel: ((document.querySelector('[role=tabpanel][data-state=active]')||{}).textContent||'').slice(0,140)})"`);
    console.log(`${tab.key}-${suffix}: ${String(state).trim().slice(0, 220)}`);
    run(`agent-browser --session ${session} screenshot ${shots}/r87-tab-${tab.key}-${suffix}.png`);
    console.log(`captured r87-tab-${tab.key}-${suffix}`);
  }
}

run(`agent-browser close --all 2>/dev/null; true`);
process.exit(0);
