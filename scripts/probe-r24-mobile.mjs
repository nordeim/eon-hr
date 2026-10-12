#!/usr/bin/env node
// probe-r24-mobile.mjs — session-25 / parity round 24: the standing mobile
// navigation audit (user priority every round). @390×844: top bar geometry,
// bottom tab x-positions, drawer (288×844 #FAFAFA z-50), kicker heights,
// md boundary behavior (767 vs 800).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }
function findRef(session, re) { const snap = run(`agent-browser --session ${session} snapshot -i -c`); const m = snap.match(re); return m ? m[1] : null; }

const TOPBAR = `(() => { const b = [...document.querySelectorAll('button')].find(x => (x.getAttribute('aria-label')||'') === 'Toggle Sidebar' || (x.querySelector('svg.lucide-menu') && x.getBoundingClientRect().y < 100)); if (!b) return JSON.stringify({topbar:false}); const bar = b.closest('div'); const r = bar.getBoundingClientRect(); const cs = getComputedStyle(bar); return JSON.stringify({topbar:true, w: Math.round(r.width), h: Math.round(r.height), bg: cs.backgroundColor, pos: cs.position}); })()`;
const TABS = `(() => { const as = [...document.querySelectorAll('a')].filter(a => a.getBoundingClientRect().y > 700 && ['Home','Staff','Tasks','Attendance','Profile'].includes(a.textContent.trim())); return JSON.stringify(as.map(a => { const r = a.getBoundingClientRect(); return { t: a.textContent.trim(), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) }; })); })()`;
const DRAWER = `(() => { const d = [...document.querySelectorAll('div')].find(x => x.getBoundingClientRect().width >= 280 && x.getBoundingClientRect().width <= 296 && x.getBoundingClientRect().height >= 800); if (!d) return JSON.stringify({drawer:false}); const r = d.getBoundingClientRect(); const cs = getComputedStyle(d); return JSON.stringify({drawer:true, w: Math.round(r.width), h: Math.round(r.height), bg: cs.backgroundColor, z: cs.zIndex}); })()`;
const KICKERS = `(() => { const ks = [...document.querySelectorAll('h1, h2, h3, p, span, div')].filter(e => e.children.length === 0 && e.textContent.trim() && e.getBoundingClientRect().y > 73 && e.getBoundingClientRect().y < 160 && e.getBoundingClientRect().x < 60 && !e.closest('[role=dialog]')).slice(0, 3); return JSON.stringify(ks.map(k => { const r = k.getBoundingClientRect(); return { t: k.textContent.trim().slice(0, 18), y: Math.round(r.y), h: Math.round(r.height), fs: getComputedStyle(k).fontSize }; })); })()`;

async function audit(session, base) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 3200));
  const top = await evalOn(session, TOPBAR);
  const tabs = await evalOn(session, TABS);
  const kick = await evalOn(session, KICKERS);
  // open the drawer
  const href_ = findRef(session, /- button "Toggle Sidebar" \[[^\]]*ref=(\w+)/);
  if (href_) { run(`agent-browser --session ${session} click @${href_}`); await new Promise(r => setTimeout(r, 1500)); }
  const drawer = await evalOn(session, DRAWER);
  // close drawer via Escape
  run(`agent-browser --session ${session} press Escape`);
  await new Promise(r => setTimeout(r, 800));
  // md boundary: 767 (mobile) vs 800 (desktop)
  run(`agent-browser --session ${session} set viewport 767 900`);
  await new Promise(r => setTimeout(r, 1200));
  const b767 = await evalOn(session, `JSON.stringify({tabs: [...document.querySelectorAll('a')].filter(a => a.getBoundingClientRect().y > 700 && ['Home','Staff','Tasks','Attendance','Profile'].includes(a.textContent.trim())).length, sidebar: [...document.querySelectorAll('nav,aside')].some(n => n.getBoundingClientRect().x >= 0 && n.getBoundingClientRect().width > 100)})`);
  run(`agent-browser --session ${session} set viewport 800 900`);
  await new Promise(r => setTimeout(r, 1200));
  const b800 = await evalOn(session, `JSON.stringify({tabs: [...document.querySelectorAll('a')].filter(a => a.getBoundingClientRect().y > 700 && ['Home','Staff','Tasks','Attendance','Profile'].includes(a.textContent.trim())).length, sidebar: [...document.querySelectorAll('nav,aside')].some(n => n.getBoundingClientRect().x >= 0 && n.getBoundingClientRect().width > 100)})`);
  return { top, tabs, kick, drawer, b767, b800 };
}

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const ref = await audit("ref", baseRef);
const loc = await audit("loc", baseLoc);
const J = (x) => JSON.stringify(x);
console.log("REF:", J(ref));
console.log("LOC:", J(loc));
const topSame = ref.top.topbar && loc.top.topbar && ref.top.w === loc.top.w && ref.top.h === loc.top.h && ref.top.bg === loc.top.bg;
const tabsSame = JSON.stringify(ref.tabs) === JSON.stringify(loc.tabs);
const drawerSame = ref.drawer.drawer && loc.drawer.drawer && ref.drawer.w === loc.drawer.w && ref.drawer.h === loc.drawer.h && ref.drawer.bg === loc.drawer.bg;
console.log(`\nTOP BAR: ${topSame ? "MATCH" : "**DIFF**"} (expect 390x73)`);
console.log(`TABS:    ${tabsSame ? "MATCH" : "**DIFF**"} (expect x 10/79/139/204/313)`);
console.log(`DRAWER:  ${drawerSame ? "MATCH" : "**DIFF**"} (expect 288x844 #FAFAFA)`);
console.log(`BOUNDS:  ref 767=${J(ref.b767)} 800=${J(ref.b800)} | loc 767=${J(loc.b767)} 800=${J(loc.b800)}`);
