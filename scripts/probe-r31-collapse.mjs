#!/usr/bin/env node
// probe-r31-collapse.mjs — session-31 / parity round 30 census:
// collapsed-group boundary geometry on desktop. The standing audits pin h1
// only; round 29 found the expanded-group trailing gap. This probe maps the
// COLLAPSED-state nav (dashboard default) and the expand/collapse boundary
// transition on both apps (viewports pinned 1440x900 — the round-27/28 lesson).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const NAVMAP = `(() => {
  const out = [];
  const root = document.querySelector('aside') || document.querySelector('div.min-h-screen');
  if (!root) return JSON.stringify({error:'no-root'});
  const els = [...root.querySelectorAll('button, a')];
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.y > 1200) continue;
    out.push({ t: (el.textContent||'').trim().slice(0,22) || el.getAttribute('aria-label') || '[icon]', tag: el.tagName, y: Math.round(r.y), h: Math.round(r.height), x: Math.round(r.x), exp: el.getAttribute('aria-expanded') });
  }
  return JSON.stringify(out);
})()`;

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

run("agent-browser --session ref set viewport 1440 900");
run("agent-browser --session loc set viewport 1440 900");

async function sweep(route) {
  console.log(`\n=== ${route} (collapsed-state default) ===`);
  for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
    run(`agent-browser --session ${s} open "${base}${route}"`);
    await new Promise(r => setTimeout(r, 3200));
    const d = await evalOn(s, NAVMAP);
    console.log(`${s.toUpperCase()}:`);
    console.log(JSON.stringify(d).replace(/\},\{/g, '}\n{'));
  }
}

// 1) collapsed-state nav map (dashboard = all groups collapsed by default)
await sweep("/dashboard");

// 2) the expand boundary: click the Analytics group button, measure after
console.log("\n=== /dashboard after clicking Analytics group (expand) ===");
for (const s of ["ref", "loc"]) {
  const btn = await evalOn(s, `(() => {
    const els = [...document.querySelectorAll('aside button, div.min-h-screen button')];
    const b = els.find(e => (e.textContent||'').trim().startsWith('Analytics') && e.getAttribute('aria-expanded') === 'false');
    if (!b) return JSON.stringify({found:false});
    b.click();
    return JSON.stringify({found:true});
  })()`);
  await new Promise(r => setTimeout(r, 1200));
  const d = await evalOn(s, NAVMAP);
  console.log(`${s.toUpperCase()} (click=${JSON.stringify(btn)}):`);
  console.log(JSON.stringify(d).replace(/\},\{/g, '}\n{'));
}

// 3) the collapse boundary: click it back closed, re-measure the trailing edge
console.log("\n=== /dashboard after re-collapsing Analytics ===");
for (const s of ["ref", "loc"]) {
  await evalOn(s, `(() => {
    const els = [...document.querySelectorAll('aside button, div.min-h-screen button')];
    const b = els.find(e => (e.textContent||'').trim().startsWith('Analytics') && e.getAttribute('aria-expanded') === 'true');
    if (b) b.click();
    return 'ok';
  })()`);
  await new Promise(r => setTimeout(r, 1200));
  const d = await evalOn(s, NAVMAP);
  console.log(`${s.toUpperCase()}:`);
  console.log(JSON.stringify(d).replace(/\},\{/g, '}\n{'));
}
