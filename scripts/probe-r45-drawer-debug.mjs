#!/usr/bin/env node
// probe-r45-drawer-debug.mjs — the standing-audit drawer DIFF: read the
// REF + LOC drawer open state manually at 390x844 (button presence, click,
// the panel + its geometry + data-state after the settle).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 250) }; } }
const log = (...a) => console.log(...a);

for (const [session, base] of [["ref", "https://eon.base44.app"], ["loc", "http://127.0.0.1:3200"]]) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 3200));
  const btn = await evalOn(session, `(() => {
    const b = [...document.querySelectorAll('button')].find(x => (x.getAttribute('aria-label') || '') === 'Toggle Sidebar');
    if (!b) return { found: false, ariaLabels: [...document.querySelectorAll('button')].map(x => x.getAttribute('aria-label')).filter(Boolean).slice(0, 8) };
    b.click();
    return { found: true, clicked: true };
  })()`);
  log(`${session} toggle: ${JSON.stringify(btn)}`);
  await new Promise(r => setTimeout(r, 900));
  const panel = await evalOn(session, `(() => {
    const cands = [...document.querySelectorAll('[data-state]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 150 && r.height > 300; });
    return cands.map(e => { const r = e.getBoundingClientRect(); return { state: e.getAttribute('data-state'), w: Math.round(r.width), x: Math.round(r.x), h: Math.round(r.height), cls: (e.getAttribute('class')||'').slice(0, 90) }; });
  })()`);
  log(`${session} panels: ${JSON.stringify(panel)}`);
}
