#!/usr/bin/env node
// r52-analyze.mjs — capture the full drawer-group reads both sides and
// diff them member-wise (sorted class members + geometry) to classify the
// raw DIFFs (member-order allowances vs real deltas).
import { execSync, spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
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

// boot LOC (self-contained tree)
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r52d.log 2>&1`],
  { stdio: "ignore" });
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) break;
  await new Promise(r => setTimeout(r, 500));
}
console.log("server up");

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

const OPEN_DRAWER = `(() => { const btn = [...document.querySelectorAll('button')].find(b => (b.getAttribute('aria-label') || '') === 'Toggle Sidebar' || (b.textContent || '').includes('Toggle Sidebar')); if (!btn) return 'NOTRIGGER'; btn.click(); return 'ok'; })()`;
const EXPAND = (label) => `(() => { const panels = [...document.querySelectorAll('[data-state=open]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 200 && r.width < 350; }); if (!panels.length) return 'NOPANEL'; const g = [...panels[0].querySelectorAll('button')].find(b => (b.textContent || '').trim().startsWith('${label}')); if (!g) return 'NOGROUP'; const wasOpen = g.getAttribute('aria-expanded') === 'true'; if (!wasOpen) g.click(); return { wasOpen }; })()`;
const HEAD = (label) => `(() => { const panels = [...document.querySelectorAll('[data-state=open]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 200 && r.width < 350; }); if (!panels.length) return { gone: 'panel' }; const g = [...panels[0].querySelectorAll('button')].find(b => (b.textContent || '').trim().startsWith('${label}')); if (!g) return { gone: 'group' }; const gr = g.getBoundingClientRect(); const cs = getComputedStyle(g); return { h: Math.round(gr.height), x: Math.round(gr.x), y: Math.round(gr.y), fs: cs.fontSize, fw: cs.fontWeight, cls: g.getAttribute('class'), expanded: g.getAttribute('aria-expanded') }; })()`;
const SUBS = (label) => `(() => { const panels = [...document.querySelectorAll('[data-state=open]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 200 && r.width < 350; }); if (!panels.length) return { gone: 'panel' }; const g = [...panels[0].querySelectorAll('button')].find(b => (b.textContent || '').trim().startsWith('${label}')); if (!g) return { gone: 'group' }; const wrap = g.parentElement; const subs = [...(wrap ? wrap.querySelectorAll('a[href]') : [])].map(a => { const r = a.getBoundingClientRect(); const cs = getComputedStyle(a); const svg = a.querySelector('svg'); return { href: a.getAttribute('href'), h: Math.round(r.height), x: Math.round(r.x), fs: cs.fontSize, fw: cs.fontWeight, col: cs.color, cls: a.getAttribute('class'), icon: svg ? Math.round(svg.getBoundingClientRect().width) : 0 }; }); return subs; })()`;

const out = {};
for (const label of ["Employees", "Analytics"]) {
  out[label] = {};
  for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
    run(`agent-browser --session ${session} open ${base}/dashboard`);
    await new Promise(r => setTimeout(r, 2600));
    await evalOn(session, OPEN_DRAWER);
    await new Promise(r => setTimeout(r, 900));
    await evalOn(session, EXPAND(label));
    await new Promise(r => setTimeout(r, 900));
    const head = await evalOn(session, HEAD(label));
    await new Promise(r => setTimeout(r, 500));
    const subs = await evalOn(session, SUBS(label));
    out[label][session] = { head, subs };
    await evalOn(session, `(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); return 'esc'; })()`);
    await new Promise(r => setTimeout(r, 600));
  }
  // member-wise analysis
  const r = out[label].ref, l = out[label].loc;
  const sortSet = (cls) => (cls || "").split(" ").sort().join(" ");
  const headNorm = (h) => h && !h.gone ? { h: h.h, x: h.x, fs: h.fs, fw: h.fw, expanded: h.expanded, clsSorted: sortSet(h.cls) } : h;
  const subsNorm = (subs) => Array.isArray(subs) ? subs.map(s => ({ href: s.href, h: s.h, x: s.x, fs: s.fs, fw: s.fw, col: s.col, icon: s.icon, clsSorted: sortSet(s.cls) })) : subs;
  const headMatch = JSON.stringify(headNorm(r.head)) === JSON.stringify(headNorm(l.head));
  const subsMatch = JSON.stringify(subsNorm(r.subs)) === JSON.stringify(subsNorm(l.subs));
  console.log(`\n### ${label}: head(sorted)=${headMatch ? "MATCH" : "DIFF"} subs(sorted)=${subsMatch ? "MATCH" : "DIFF"}`);
  if (!headMatch) {
    console.log("head ref:", JSON.stringify(headNorm(r.head)).slice(0, 500));
    console.log("head loc:", JSON.stringify(headNorm(l.head)).slice(0, 500));
    // find the raw-cls order difference
    if (r.head && l.head && r.head.cls && l.head.cls) {
      const rm = new Set((r.head.cls || "").split(" ")), lm = new Set((l.head.cls || "").split(" "));
      console.log("head ref-only members:", [...rm].filter(m => !lm.has(m)));
      console.log("head loc-only members:", [...lm].filter(m => !rm.has(m)));
    }
  }
  if (!subsMatch) {
    console.log("subs ref:", JSON.stringify(subsNorm(r.subs)).slice(0, 800));
    console.log("subs loc:", JSON.stringify(subsNorm(l.subs)).slice(0, 800));
  }
}
writeFileSync("/tmp/r52-drawergroup.json", JSON.stringify(out, null, 2));
console.log("\nfull reads -> /tmp/r52-drawergroup.json");
process.exit(0);
