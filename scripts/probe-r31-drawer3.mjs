#!/usr/bin/env node
// probe-r31-drawer3.mjs — find the drawer PANEL (Radix sibling of the overlay)
// and map its internals + expand the Analytics group inside it.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

const PANEL = `(() => {
  const cands = [...document.querySelectorAll('div')].filter(d => {
    const cs = getComputedStyle(d);
    const r = d.getBoundingClientRect();
    return cs.position === 'fixed' && r.width >= 200 && r.width <= 340 && Math.round(r.height) >= 800 && r.x < 20 && cs.backgroundColor !== 'rgba(0, 0, 0, 0.8)' && d.querySelectorAll('button, a').length > 3;
  });
  if (!cands.length) return JSON.stringify({found:false});
  const panel = cands[0];
  const pr = panel.getBoundingClientRect(); const pcs = getComputedStyle(panel);
  const items = [...panel.querySelectorAll('button, a')].map(el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0) return null;
    return { t: (el.textContent||'').trim().slice(0,22) || el.getAttribute('aria-label') || '[icon]', tag: el.tagName, y: Math.round(r.y), h: Math.round(r.height), x: Math.round(r.x) };
  }).filter(Boolean);
  return JSON.stringify({found:true, panel:{w:Math.round(pr.width),h:Math.round(pr.height),x:Math.round(pr.x),bg:pcs.backgroundColor,border:pcs.borderRightWidth+' '+pcs.borderRightColor}, items});
})()`;

async function openDrawerAndMap(s, base, label) {
  run(`agent-browser --session ${s} set viewport 390 844`);
  run(`agent-browser --session ${s} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 3500));
  await evalOn(s, `(() => {
    const btns = [...document.querySelectorAll('button')];
    const b = btns.find(e => { const r = e.getBoundingClientRect(); return r.y < 100 && r.x < 60 && r.width > 20 && r.width < 60 && (e.querySelector('svg') || (e.textContent||'').trim() === ''); });
    if (b) b.click();
    return 'clicked';
  })()`, 1500);
  console.log(`\n=== ${label} (drawer open, groups collapsed) ===`);
  let d = await evalOn(s, PANEL);
  console.log(`${s.toUpperCase()}:`);
  console.log(JSON.stringify(d).replace(/\},\{/g, '}\n{'));
  // expand Analytics inside the drawer
  await evalOn(s, `(() => {
    const cands = [...document.querySelectorAll('div')].filter(d => {
      const cs = getComputedStyle(d);
      const r = d.getBoundingClientRect();
      return cs.position === 'fixed' && r.width >= 200 && r.width <= 340 && Math.round(r.height) >= 800 && r.x < 20 && cs.backgroundColor !== 'rgba(0, 0, 0, 0.8)' && d.querySelectorAll('button, a').length > 3;
    });
    if (!cands.length) return 'no-panel';
    const b = [...cands[0].querySelectorAll('button')].find(e => (e.textContent||'').trim().startsWith('Analytics') && e.getAttribute('aria-expanded') === 'false');
    if (b) { b.click(); return 'expanded'; }
    return 'no-btn';
  })()`, 1200);
  console.log(`\n=== ${label} (Analytics expanded inside drawer) ===`);
  d = await evalOn(s, PANEL);
  console.log(`${s.toUpperCase()}:`);
  console.log(JSON.stringify(d).replace(/\},\{/g, '}\n{'));
}

await openDrawerAndMap("ref", baseRef, "REF");
await openDrawerAndMap("loc", baseLoc, "LOC");
