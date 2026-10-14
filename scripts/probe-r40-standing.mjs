#!/usr/bin/env node
// probe-r40-standing.mjs — session-41 / parity round 40 standing audits:
// mobile bottom nav + drawer + kicker (390x844), desktop navmap + bell +
// Quick Actions (1440x900). Post-restructure toggle selector: REF's toggle
// carries data-sidebar=trigger (no aria-label); the clone keeps BOTH (a11y
// superset) — [data-sidebar=trigger] matches on the two sides.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const results = [];
function rec(name, a, b) { results.push({ name, ref: a, loc: b, match: JSON.stringify(a) === JSON.stringify(b) }); }

const TABS = `(() => {
  const nav = [...document.querySelectorAll('nav')].find(n => n.getBoundingClientRect().y > 700);
  if (!nav) return {found:false};
  const r = nav.getBoundingClientRect(); const cs = getComputedStyle(nav);
  const tabs = [...nav.querySelectorAll('a')].map(a => { const ar = a.getBoundingClientRect(); return { x: Math.round(ar.x), y: Math.round(ar.y), w: Math.round(ar.width), t: (a.textContent||'').trim().slice(0,10) }; });
  return {found:true, nav:{y:Math.round(r.y),h:Math.round(r.height),w:Math.round(r.width),bg:cs.backgroundColor}, tabs};
})()`;

// Escape-reset first (the r36/r37 lesson: a second run through an
// already-open drawer reads the mid-exit frame), THEN click the trigger.
const DRAWER_RESET = `(() => { document.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape', bubbles:true})); return 'escaped'; })()`;
const DRAWER_OPEN = `(() => {
  const btn = document.querySelector('button[data-sidebar="trigger"]');
  if (!btn) return {found:false};
  btn.click(); return {clicked:true};
})()`;

const DRAWER_PANEL = `(() => {
  const panels = [...document.querySelectorAll('[data-state=open]')].filter(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 200 && r.width < 350 && cs.backgroundColor !== 'rgba(0, 0, 0, 0.8)' && cs.backgroundColor !== 'rgba(0,0,0,0.8)'; });
  if (!panels.length) return {found:false};
  const p = panels[0]; const r = p.getBoundingClientRect(); const cs = getComputedStyle(p);
  return {found:true, w:Math.round(r.width), x:Math.round(r.x), bg:cs.backgroundColor, brd: cs.borderRightWidth + ' ' + cs.borderRightColor};
})()`;

const NAVMAP = `(() => {
  const scroller = document.querySelector('main');
  (scroller ? [...scroller.children].find(c => (c.className||'').includes('overflow-auto')) || scroller : window).scrollTo(0, 0);
  const els = [...document.querySelectorAll('[data-sidebar="sidebar"] button, [data-sidebar="sidebar"] a, div.min-h-screen button, div.min-h-screen a')];
  const items = [];
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.y > 700 || r.x > 260 || r.x < 0) continue;
    items.push({ y: Math.round(r.y), tag: el.tagName.toLowerCase(), t: (el.textContent||'').trim().slice(0,16) || '[icon]' });
  }
  return {found:true, items};
})()`;

function bellRefBySnapshot(session) {
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const lines = snap.split("\n");
  const named = lines.find((l) => l.includes('button "Notifications"'));
  if (named) { const m = named.match(/ref=(\w+)\]/); if (m) return m[1]; }
  const arIdx = lines.findIndex((l) => l.includes("عربي"));
  for (let i = arIdx - 1; i >= Math.max(0, arIdx - 4); i--) {
    const m = lines[i].match(/- button \[expanded=[a-z]+, ref=(\w+)\]/);
    if (m) return m[1];
  }
  return null;
}
const BELL_PANEL = `(() => {
  const pops = [...document.querySelectorAll('[data-radix-popper-content-wrapper]')];
  const pop = pops[pops.length - 1];
  if (!pop) return {found:false};
  const inner = pop.firstElementChild; if (!inner) return {found:false};
  const r = inner.getBoundingClientRect(); const cs = getComputedStyle(inner);
  return {found:true, w:Math.round(r.width), h:Math.round(r.height), x:Math.round(r.x), y:Math.round(r.y), radius:cs.borderRadius};
})()`;

const QUICK = `(() => {
  const card = [...document.querySelectorAll('div')].find(d => (d.textContent||'').trim().startsWith('Quick Actions') && d.getBoundingClientRect().width > 200 && d.getBoundingClientRect().width < 500);
  if (!card) return {found:false};
  const tiles = [...card.querySelectorAll('a')].map(a => { const r = a.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; });
  return {found:true, tiles};
})()`;

// ---- mobile pass (390x844) ----
async function mobilePass(session, base) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 3500));
  const tabs = await evalOn(session, TABS);
  await evalOn(session, DRAWER_RESET);
  await new Promise(r => setTimeout(r, 700));
  await evalOn(session, DRAWER_OPEN);
  await new Promise(r => setTimeout(r, 900));
  const drawer = await evalOn(session, DRAWER_PANEL);
  return { tabs, drawer };
}

// ---- desktop pass (1440x900) ----
async function desktopPass(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 3500));
  const navmap = await evalOn(session, NAVMAP);
  const bRef = bellRefBySnapshot(session);
  if (bRef) run(`agent-browser --session ${session} click @${bRef}`);
  await new Promise(r => setTimeout(r, 900));
  const bell = await evalOn(session, BELL_PANEL);
  run(`agent-browser --session ${session} press Escape`);
  const quick = await evalOn(session, QUICK);
  return { navmap, bell, quick };
}

const refM = await mobilePass("ref", baseRef);
const locM = await mobilePass("loc", baseLoc);
rec("mobile tabs", refM.tabs, locM.tabs);
rec("mobile drawer", refM.drawer, locM.drawer);

const refD = await desktopPass("ref", baseRef);
const locD = await desktopPass("loc", baseLoc);
rec("desktop navmap", refD.navmap, locD.navmap);
rec("bell popover", refD.bell, locD.bell);
rec("quick actions", refD.quick, locD.quick);

let pass = 0, fail = 0;
for (const r of results) {
  const ok = r.match && !("error" in (r.ref||{})) && !("error" in (r.loc||{})) && (r.ref?.found !== false) && (r.loc?.found !== false);
  if (ok) pass++; else fail++;
  console.log(`${ok ? "MATCH " : "DIFF  "} ${r.name}`);
  if (!ok) { console.log("  ref: " + JSON.stringify(r.ref)); console.log("  loc: " + JSON.stringify(r.loc)); }
}
console.log(`\n${pass}/${pass + fail} standing audits MATCH`);
