#!/usr/bin/env node
// probe-r27-mobile-chrome.mjs — session-28 / parity round 27 mobile chrome audit:
// bottom tabs, drawer, kicker at 390x844 on both apps (the standing audit).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

async function prep(session, base) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 3500));
}

const TABS = `(() => {
  const nav = [...document.querySelectorAll('nav')].find(n => n.getBoundingClientRect().y > 700);
  if (!nav) return JSON.stringify({found:false});
  const r = nav.getBoundingClientRect(); const cs = getComputedStyle(nav);
  const tabs = [...nav.querySelectorAll('a')].map(a => { const ar = a.getBoundingClientRect(); const acs = getComputedStyle(a); const t = a.querySelector('span'); return { x: Math.round(ar.x), y: Math.round(ar.y), w: Math.round(ar.width), t: (a.textContent||'').trim().slice(0,10), color: acs.color, bg: acs.backgroundColor }; });
  return JSON.stringify({found:true, nav:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),bg:cs.backgroundColor,border:cs.borderTopWidth+' '+cs.borderTopColor,pos:cs.position,bottom:cs.bottom}, tabs});
})()`;

const KICKER = `(() => {
  const els = [...document.querySelectorAll('h1')];
  const k = els.find(h => h.getBoundingClientRect().y > 60 && h.getBoundingClientRect().y < 160);
  if (!k) return JSON.stringify({found:false});
  const r = k.getBoundingClientRect(); const cs = getComputedStyle(k);
  const bar = k.closest('div');
  const br = bar ? bar.getBoundingClientRect() : null;
  return JSON.stringify({found:true, t:k.textContent.trim().slice(0,20), y:Math.round(r.y), h:Math.round(r.height), fs:cs.fontSize, fw:cs.fontWeight, barCls: bar ? String(bar.className).slice(0,90) : null, barY: br ? Math.round(br.y) : null, barH: br ? Math.round(br.height) : null});
})()`;

const DRAWER = `(() => {
  const btn = [...document.querySelectorAll('button')].find(b => (b.textContent || '').includes('Toggle Sidebar') || (b.getAttribute('aria-label') || '') === 'Toggle Sidebar');
  if (!btn) return JSON.stringify({found:false});
  btn.click();
  return JSON.stringify({clicked:true});
})()`;

const DRAWER_PANEL = `(() => {
  const panels = [...document.querySelectorAll('[data-state=open]')].filter(e => e.getBoundingClientRect().width > 200 && e.getBoundingClientRect().width < 400);
  if (!panels.length) return JSON.stringify({found:false});
  const p = panels[0]; const r = p.getBoundingClientRect(); const cs = getComputedStyle(p);
  return JSON.stringify({found:true, w:Math.round(r.width), h:Math.round(r.height), x:Math.round(r.x), bg:cs.backgroundColor, z:cs.zIndex, role:p.getAttribute('role')});
})()`;

async function audit(label, session) {
  console.log(`\n[${label}] TABS:`);
  const tabs = await evalOn(session, TABS);
  console.log(JSON.stringify(tabs));
  console.log(`[${label}] KICKER:`);
  const kicker = await evalOn(session, KICKER);
  console.log(JSON.stringify(kicker));
  console.log(`[${label}] open drawer:`);
  await evalOn(session, DRAWER, 800);
  const panel = await evalOn(session, DRAWER_PANEL);
  console.log(JSON.stringify(panel));
  // close drawer via Escape
  run(`agent-browser --session ${session} press Escape`);
}

await prep("ref", baseRef);
await prep("loc", baseLoc);
await audit("REF", "ref");
await audit("LOC", "loc");
