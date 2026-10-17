#!/usr/bin/env node
// probe-r52-drawergroup.mjs — session-52 / parity round 51 census: the
// mobile drawer's EXPANDED-GROUP interior at 390x844. Round 50 pinned the
// at-rest chrome (kicker/header/bar/tabs) + the drawer panel/footer; the
// group-expanded sub-item family inside the MOBILE drawer was never
// paired-live. This probe opens the drawer on both apps, expands the
// Employees + Analytics groups, and byte-compares the group trigger + the
// sub-item family (classes, geometry, icon sizes, colors).
import { execSync, spawn } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
// evalOn — parses agent-browser's pretty-printed object output; scalar
// string results come back quote-wrapped ("ok") so they unwrap to the raw
// text. Retries once — the round-51 long-eval flake (a ~1.2k-char one-shot
// fails under rapid sequencing while the same eval runs clean standalone).
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
function rec(name, a, b) { const match = JSON.stringify(a) === JSON.stringify(b); results.push({ name, match }); console.log(`${match ? "MATCH" : "DIFF "} ${name}`); if (!match) { console.log(`  ref: ${JSON.stringify(a).slice(0, 700)}`); console.log(`  loc: ${JSON.stringify(b).slice(0, 700)}`); } }

// ---- boot the seeded LOC server (this call's own process tree) ----
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r52c.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }
console.log("seeded server up on :3200");

// ---- auth helper (the $-password single-quote rule) ----
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
await auth("ref", baseRef);
await auth("loc", baseLoc);

// ---- the drawer opener (the session-46 either-mechanism finder) ----
const OPEN_DRAWER = `(() => {
  const btn = [...document.querySelectorAll('button')].find(b => (b.getAttribute('aria-label') || '') === 'Toggle Sidebar' || (b.textContent || '').includes('Toggle Sidebar'));
  if (!btn) return 'NOTRIGGER';
  btn.click(); return 'ok';
})()`;
// ---- the group expander: clicks a named group chevron INSIDE the open drawer panel ----
const EXPAND = (label) => `(() => {
  const panels = [...document.querySelectorAll('[data-state=open]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 200 && r.width < 350; });
  if (!panels.length) return 'NOPANEL';
  const p = panels[0];
  const g = [...p.querySelectorAll('button')].find(b => (b.textContent || '').trim().startsWith('${label}'));
  if (!g) return 'NOGROUP';
  const wasOpen = g.getAttribute('aria-expanded') === 'true';
  if (!wasOpen) g.click();
  return { wasOpen };
})()`;
// ---- the group + sub-item family reader — SPLIT into two small evals
// (the round-51 long-eval flake: ~1.2k one-shots fail under sequencing) ----
// Read 1: the group trigger button (geometry + classes).
const GROUP_HEAD = (label) => `(() => {
  const panels = [...document.querySelectorAll('[data-state=open]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 200 && r.width < 350; });
  if (!panels.length) return { gone: 'panel' };
  const g = [...panels[0].querySelectorAll('button')].find(b => (b.textContent || '').trim().startsWith('${label}'));
  if (!g) return { gone: 'group' };
  const gr = g.getBoundingClientRect(); const cs = getComputedStyle(g);
  return { h: Math.round(gr.height), x: Math.round(gr.x), y: Math.round(gr.y), fs: cs.fontSize, fw: cs.fontWeight, cls: g.getAttribute('class') };
})()`;
// Read 2: the sub-item family under the group's li wrapper.
const GROUP_SUBS = (label) => `(() => {
  const panels = [...document.querySelectorAll('[data-state=open]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 200 && r.width < 350; });
  if (!panels.length) return { gone: 'panel' };
  const g = [...panels[0].querySelectorAll('button')].find(b => (b.textContent || '').trim().startsWith('${label}'));
  if (!g) return { gone: 'group' };
  const wrap = g.parentElement;
  const subs = [...(wrap ? wrap.querySelectorAll('a[href]') : [])].map(a => { const r = a.getBoundingClientRect(); const cs = getComputedStyle(a); const svg = a.querySelector('svg'); return { h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y), fs: cs.fontSize, fw: cs.fontWeight, col: cs.color, cls: a.getAttribute('class'), icon: svg ? Math.round(svg.getBoundingClientRect().width) : 0 }; });
  return subs;
})()`;

for (const label of ["Employees", "Analytics"]) {
  const reads = [];
  for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
    run(`agent-browser --session ${session} open ${base}/dashboard`);
    await new Promise(r => setTimeout(r, 2600));
    const opened = await evalOn(session, OPEN_DRAWER);
    await new Promise(r => setTimeout(r, 900));
    const expanded = await evalOn(session, EXPAND(label));
    await new Promise(r => setTimeout(r, 900));
    const head = await evalOn(session, GROUP_HEAD(label));
    await new Promise(r => setTimeout(r, 500));
    const subs = await evalOn(session, GROUP_SUBS(label));
    reads.push({ opened, expanded, head, subs });
    // close the drawer for the next iteration (re-open fresh)
    await evalOn(session, `(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); return 'esc'; })()`);
    await new Promise(r => setTimeout(r, 600));
  }
  rec(`the mobile drawer's ${label} group + sub-item family (390x844)`, reads[0], reads[1]);
}

console.log(`\nprobe-r52-drawergroup: ${results.filter(r => r.match).length}/${results.length} MATCH`);
process.exit(0);
