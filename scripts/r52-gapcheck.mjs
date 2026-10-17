#!/usr/bin/env node
// r52-gapcheck.mjs — the computed ground-truth for the drawer sub-item
// family: REF's cls carries gap-2 gap-3 (runtime concatenation) while the
// clone's cn() merges to gap-3. The rendered truth is the computed gap.
import { execSync, spawn } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
async function evalOn(session, expr, ms = 0, retries = 2) {
  if (ms) await new Promise(r => setTimeout(r, ms));
  const oneLine = expr.split("\n").join(" ");
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const out = execSync(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`, { stdio: "pipe", timeout: 45000 }).toString();
      const t = out.trim();
      try { return JSON.parse(t); } catch {}
      const m = t.match(/^"([\s\S]*)"$/);
      return m ? m[1] : t.slice(0, 300);
    } catch (e) {
      if (attempt === retries) return { error: String(e.stderr || e.stdout || e).slice(0, 300) };
      await new Promise(r => setTimeout(r, 900));
    }
  }
}
const repo = "/home/z/my-project/eon-hr";
const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r52e.log 2>&1`],
  { stdio: "ignore" });
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) break;
  await new Promise(r => setTimeout(r, 500));
}
console.log("server up");

const GAP = (label) => `(() => {
  const panels = [...document.querySelectorAll('[data-state=open]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 200 && r.width < 350; });
  if (!panels.length) return { gone: 'panel' };
  const g = [...panels[0].querySelectorAll('button')].find(b => (b.textContent || '').trim().startsWith('${label}'));
  if (!g) return { gone: 'group' };
  if (g.getAttribute('aria-expanded') !== 'true') g.click();
  const wrap = g.parentElement;
  const subs = [...(wrap ? wrap.querySelectorAll('a[href]') : [])].map(a => { const cs = getComputedStyle(a); const r = a.getBoundingClientRect(); return { href: a.getAttribute('href'), gap: cs.gap, display: cs.display, padX: cs.paddingLeft + ' ' + cs.paddingRight, padY: cs.paddingTop + ' ' + cs.paddingBottom, h: Math.round(r.height), y: Math.round(r.y) }; });
  return subs;
})()`;

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
}
await auth("ref", baseRef);
await auth("loc", baseLoc);

for (const label of ["Employees", "Analytics"]) {
  const reads = [];
  for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
    run(`agent-browser --session ${session} open ${base}/dashboard`);
    await new Promise(r => setTimeout(r, 2600));
    await evalOn(session, `(() => { const btn = [...document.querySelectorAll('button')].find(b => (b.getAttribute('aria-label') || '') === 'Toggle Sidebar' || (b.textContent || '').includes('Toggle Sidebar')); if (!btn) return 'NOTRIGGER'; btn.click(); return 'ok'; })()`);
    await new Promise(r => setTimeout(r, 900));
    reads.push(await evalOn(session, GAP(label)));
    await evalOn(session, `(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); return 'esc'; })()`);
    await new Promise(r => setTimeout(r, 500));
  }
  const match = JSON.stringify(reads[0]) === JSON.stringify(reads[1]);
  console.log(`${match ? "MATCH" : "DIFF "} the ${label} sub-items' computed gap/display/padding/geometry`);
  if (!match) {
    console.log("  ref:", JSON.stringify(reads[0]).slice(0, 600));
    console.log("  loc:", JSON.stringify(reads[1]).slice(0, 600));
  }
}
process.exit(0);
