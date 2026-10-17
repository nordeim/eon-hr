#!/usr/bin/env node
// r53-census.mjs — session-53 / parity round 52 census: TWO fresh paired
// measurements responding to the 20TH login deploy (JS CimHfPLG→C2ujlke6
// AND CSS CpjiugAb→D5oCh2kx — the first CSS change in ~15 deploys):
//   (A) the NAV-REGISTRY drift re-check — REF's complete desktop nav tree
//       re-read live (all groups expanded) vs the clone's, label+href+
//       order. The R52-A1 pin guards the clone side only; a REF-side
//       module addition needs a live re-read (the 20th deploy changed
//       both chunks — the strongest re-read justification yet).
//   (B) the BOTTOM-NAV ACTIVE-STATE family — rounds 50/51 censused the
//       active tab on /dashboard only (Home). This round pairs the
//       computed active/inactive truth on ALL FIVE tab routes
//       (dashboard/employees/taskmanager/attendance/profile) at 390x844 —
//       completing the called-out mobile-nav surface's state family.
// Self-contained per the workspace-reap pattern: boots the seeded :3200
// standalone inside THIS process tree, auths loc fresh, ref rides the
// surviving daemon session.
import { execSync, spawn } from "node:child_process";

function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
// evalOn — the r52 pattern: parse the pretty-printed object output
// directly, unwrap quoted scalars, retry once on command failure (the
// long-eval flake lesson: keep one-shots small, split composite reads).
async function evalOn(session, expr, ms = 0, retries = 1) {
  if (ms) await new Promise(r => setTimeout(r, ms));
  const oneLine = expr.split("\n").join(" ");
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const out = execSync(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`, { stdio: "pipe", timeout: 45000 }).toString();
      const t = out.trim();
      try { return JSON.parse(t); } catch { /* scalar or bare text */ }
      const m = t.match(/^"([\s\S]*)"$/); // a JSON-encoded scalar string
      return m ? m[1] : t.slice(0, 300);
    } catch (e) {
      if (attempt === retries) return { error: String(e.stderr || e.stdout || e).slice(0, 300) };
      await new Promise(r => setTimeout(r, 900));
    }
  }
}

const repo = "/home/z/my-project/eon-hr";
const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const results = [];
function rec(name, a, b) {
  const match = JSON.stringify(a) === JSON.stringify(b);
  results.push({ name, match });
  console.log(`${match ? "MATCH" : "DIFF "} ${name}`);
  if (!match) { console.log(`  ref: ${JSON.stringify(a).slice(0, 700)}`); console.log(`  loc: ${JSON.stringify(b).slice(0, 700)}`); }
}

// ---- boot the seeded LOC server (this call's own process tree) ----
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r53a.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN", run("tail -3 /tmp/loc3200-r53a.log")); process.exit(1); }
console.log("seeded server up on :3200");

// ---- auth helper (the $-password single-quote rule) ----
async function auth(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
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
}
// ref rides the daemon (already authed from the deploy-watch reads, but
// re-auth if the login page rendered instead of the dashboard)
const refUrl = run('agent-browser --session ref get url').trim();
if (!refUrl.includes("/dashboard")) { await auth("ref", baseRef); }
await auth("loc", baseLoc);
console.log("ref:", run('agent-browser --session ref get url').trim());
console.log("loc:", run('agent-browser --session loc get url').trim());

// ============================================================
// PART A — the nav-registry drift re-check (desktop 1440x900)
// ============================================================
console.log("\n########## A. NAV-REGISTRY DRIFT RE-CHECK (20th deploy) ##########");
const EXPAND = `(() => {
  const triggers = [...document.querySelectorAll('[data-sidebar] button[aria-expanded="false"]')];
  triggers.forEach(b => b.click());
  return { expanded: triggers.length };
})()`;
const READ_TREE = `(() => {
  const menu = document.querySelector('[data-sidebar="menu"]');
  if (!menu) return { gone: 'menu' };
  const seq = [...menu.querySelectorAll('a[href], button[aria-expanded]')].map(el => {
    const isBtn = el.tagName === 'BUTTON';
    return { k: isBtn ? 'G' : 'L', t: (el.textContent || '').trim().slice(0, 26), h: isBtn ? null : el.getAttribute('href') };
  });
  return seq;
})()`;

async function registryRead(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 2600));
  const e1 = await evalOn(session, EXPAND);
  await new Promise(r => setTimeout(r, 900));
  // the split-read + retry guard (the long-eval flake lesson)
  let tree = await evalOn(session, READ_TREE);
  if (!Array.isArray(tree)) { await new Promise(r => setTimeout(r, 900)); tree = await evalOn(session, READ_TREE); }
  return { expand: e1, tree };
}
const refA = await registryRead("ref", baseRef);
const locA = await registryRead("loc", baseLoc);
const refLeaves = (refA.tree || []).filter(x => x.k === "L").map(x => x.h);
const locLeaves = (locA.tree || []).filter(x => x.k === "L").map(x => x.h);
console.log(`ref tree entries: ${(refA.tree || []).length} (${refLeaves.length} leaves, expanded ${JSON.stringify(refA.expand)})`);
console.log(`loc tree entries: ${(locA.tree || []).length} (${locLeaves.length} leaves, expanded ${JSON.stringify(locA.expand)})`);
rec("A1: the complete ordered nav tree (groups + leaves, label+href+order)", refA.tree, locA.tree);
rec("A2: the ordered 44-href leaf registry", refLeaves, locLeaves);

// ============================================================
// PART B — the bottom-nav active-state family (mobile 390x844)
// ============================================================
console.log("\n########## B. BOTTOM-NAV ACTIVE-STATE FAMILY (5 tab routes) ##########");
const TAB_ROUTES = ["/dashboard", "/employees", "/taskmanager", "/attendance", "/profile"];
const READ_TABS = `(() => {
  const bt = [...document.querySelectorAll('div,nav')].find(e => (e.getAttribute('class')||'').includes('fixed bottom-0'));
  if (!bt) return { gone: 'bottombar' };
  return [...bt.querySelectorAll('button,a')].map(a => {
    const cs = getComputedStyle(a);
    const svg = a.querySelector('svg');
    return { l: (a.textContent||'').trim().slice(0, 12), c: cs.color, b: cs.backgroundColor, w: cs.fontWeight, ic: svg ? getComputedStyle(svg).color : null };
  });
})()`;
async function tabRead(session, base, route) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}${route}`);
  await new Promise(r => setTimeout(r, 2400));
  let tabs = await evalOn(session, READ_TABS);
  if (!Array.isArray(tabs)) { await new Promise(r => setTimeout(r, 900)); tabs = await evalOn(session, READ_TABS); }
  return tabs;
}
for (const route of TAB_ROUTES) {
  const r = await tabRead("ref", baseRef, route);
  const l = await tabRead("loc", baseLoc, route);
  const active = (arr) => (arr || []).find(t => t.c === "rgb(37, 99, 235)")?.l ?? "(none)";
  console.log(`  ${route}: active tab ref=${active(r)} loc=${active(l)}`);
  rec(`B ${route}: the 5-tab computed family (color/bg/weight/icon-color)`, r, l);
}

console.log("\n===== CENSUS SUMMARY =====");
const diffs = results.filter(x => !x.match).map(x => x.name);
console.log(diffs.length ? `DIFFS: ${diffs.join(" | ")}` : "ALL CENSUS PAIRS MATCH");
server.kill();
process.exit(0);
