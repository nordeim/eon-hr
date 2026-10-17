#!/usr/bin/env node
// probe-r51-zone.mjs — session-51 targeted mobile reads: (1) the kicker
// on /dashboard both sides (full class + at-rest y + the SCROLL-stuck
// position), (2) the drawer footer button census, (3) the REAL mobile
// drawer panel (the z-50 w>0 fixed panel — not the desktop sidebar
// container), (4) the bottom-bar + tab full class strings + computed
// geometry, (5) the tab active-state colors.
// Usage: node scripts/probe-r51-zone.mjs
import { execSync } from "node:child_process";

function run(cmd, t = 60000) {
  try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); }
  catch (e) { return "ERR:" + String(e).slice(0, 160); }
}
async function evalOn(session, expr, ms = 0) {
  if (ms) await new Promise(r => setTimeout(r, ms));
  const oneLine = expr.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  const t = out.trim();
  try { return JSON.parse(t); } catch {}
  try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); }
  catch { return { error: out.slice(0, 300) }; }
}

const out = {};
for (const tag of ["ref", "loc"]) {
  const base = tag === "ref" ? "https://eon.base44.app" : "http://127.0.0.1:3200";
  run(`agent-browser --session ${tag} set viewport 390 844`);
  run(`agent-browser --session ${tag} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 4200));

  // (1) the kicker: find ALL md:hidden sticky divs below the header, with
  // full class + geometry; then scroll 240px and re-read the stuck state
  const kickerAtRest = await evalOn(tag, `(() => {
    const header = document.querySelector('header');
    const cands = [...document.querySelectorAll('div')].filter(e => { const c = (e.getAttribute('class')||''); return c.includes('md:hidden') && c.includes('sticky'); }).map(e => ({ cls: (e.getAttribute('class')||''), y: Math.round(e.getBoundingClientRect().y), h: Math.round(e.getBoundingClientRect().height), txt: (e.textContent||'').trim().slice(0,40) }));
    return { headerH: header ? Math.round(header.getBoundingClientRect().height) : null, cands };
  })()`);
  await evalOn(tag, `window.scrollTo(0, 240)`);
  await new Promise(r => setTimeout(r, 600));
  const kickerStuck = await evalOn(tag, `(() => {
    const cands = [...document.querySelectorAll('div')].filter(e => { const c = (e.getAttribute('class')||''); return c.includes('md:hidden') && c.includes('sticky'); }).map(e => ({ cls: (e.getAttribute('class')||'').slice(0,160), y: Math.round(e.getBoundingClientRect().y), h: Math.round(e.getBoundingClientRect().height), txt: (e.textContent||'').trim().slice(0,40) }));
    const header = document.querySelector('header');
    return { scrollY: window.scrollY, headerY: header ? Math.round(header.getBoundingClientRect().y) : null, cands };
  })()`);
  await evalOn(tag, `window.scrollTo(0, 0)`);

  // (2)+(3) open the drawer; read the REAL panel + the footer census
  await evalOn(tag, `document.querySelector('header button').click()`);
  await new Promise(r => setTimeout(r, 1200));
  const drawer = await evalOn(tag, `(() => {
    const gc = (el) => (el && el.getAttribute && el.getAttribute('class')) || '';
    const panels = [...document.querySelectorAll('div,aside')].filter(e => { const c = gc(e); return c.includes('fixed') && c.includes('z-50') && e.getBoundingClientRect().width > 50; });
    const panel = panels.sort((a,b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0];
    if (!panel) return { noDrawer: true };
    const r = panel.getBoundingClientRect();
    // the footer zone: everything after the nav scroll container
    const footerBtns = [...panel.querySelectorAll('button')].map(b => ({ txt: (b.textContent||'').trim().slice(0,26), aria: b.getAttribute('aria-label')||'', cls: gc(b).slice(0,90) }));
    const h2orUser = panel.querySelector('h2, [class*=font-semibold]');
    return {
      panel: { cls: gc(panel), w: Math.round(r.width), x: Math.round(r.x), borderR: getComputedStyle(panel).borderRightWidth + ' ' + getComputedStyle(panel).borderRightColor, bg: getComputedStyle(panel).backgroundColor },
      footerBtns, btnCount: footerBtns.length,
      firstText: (panel.querySelector('button')||{textContent:''}).textContent.trim().slice(0,30)
    };
  })()`);
  // close it
  await evalOn(tag, `(() => { const o = [...document.querySelectorAll('div')].find(e => (e.getAttribute('class')||'').includes('fixed inset-0')); if (o) o.dispatchEvent(new MouseEvent('click', {bubbles:true})); return 1; })()`);
  await new Promise(r => setTimeout(r, 600));

  // (4)+(5) the bottom bar: full classes + computed geometry + active tab
  const bottom = await evalOn(tag, `(() => {
    const gc = (el) => (el && el.getAttribute && el.getAttribute('class')) || '';
    const bt = [...document.querySelectorAll('div,nav')].find(e => gc(e).includes('fixed bottom-0'));
    const tabs = bt ? [...bt.querySelectorAll('button,a')].map(a => { const cs = getComputedStyle(a); return { label: (a.textContent||'').trim().slice(0,14), cls: gc(a), color: cs.color, bg: cs.backgroundColor }; }) : [];
    return { barCls: bt ? gc(bt) : null, tabCount: tabs.length, tabs };
  })()`);

  out[tag] = { kickerAtRest, kickerStuck, drawer, bottom };
  console.log(`\n========== ${tag.toUpperCase()} ==========`);
  console.log(JSON.stringify(out[tag], null, 1));
}

const flat = (o, p = "") => Object.entries(o || {}).flatMap(([k, v]) => typeof v === "object" && v !== null ? flat(v, p + k + ".") : [[p + k, JSON.stringify(v)]]);
const refMap = new Map(flat(out.ref)), locMap = new Map(flat(out.loc));
let same = 0, diff = 0;
console.log("\n===== PAIRED DIFF (member-wise, raw) =====");
for (const [k, v] of refMap) {
  if (!locMap.has(k)) { console.log(`ONLY-REF ${k} = ${v.slice(0,150)}`); diff++; continue; }
  if (locMap.get(k) === v) { same++; continue; }
  console.log(`DIFF ${k}\n  ref: ${v.slice(0,170)}\n  loc: ${locMap.get(k).slice(0,170)}`); diff++;
}
for (const [k, v] of locMap) if (!refMap.has(k)) { console.log(`ONLY-LOC ${k} = ${v.slice(0,150)}`); diff++; }
console.log(`\nzone paired: ${same} same / ${diff} diff`);
