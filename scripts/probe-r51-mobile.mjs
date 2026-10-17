#!/usr/bin/env node
// probe-r51-mobile.mjs — session-51 / parity round 50 census: the MOBILE
// NAVIGATION MENU, paired REF vs LOC at 390×844 (the reference's mobile
// band). Reads the top bar, the drawer (opened via the hamburger), the
// overlay, the bottom tab bar, and a category-A page's mobile kicker.
// Usage: node scripts/probe-r51-mobile.mjs   (expects LOC seeded on :3200)
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

const reads = {};
for (const [tag, base] of [["ref", "https://eon.base44.app"], ["loc", "http://127.0.0.1:3200"]]) {
  run(`agent-browser --session ${tag} set viewport 390 844`);
  run(`agent-browser --session ${tag} open ${base}/Dashboard`);
  await new Promise(r => setTimeout(r, 4200));

  // (1) the at-rest mobile chrome: top bar + bottom tabs + the kicker
  const atRest = await evalOn(tag, `(() => {
    const header = document.querySelector('header');
    const bt = [...document.querySelectorAll('div,nav')].find(e => (e.getAttribute('class')||'').includes('fixed bottom-0'));
    const kicker = [...document.querySelectorAll('div')].find(e => { const c = (e.getAttribute('class')||''); return c.includes('md:hidden') && c.includes('sticky') && c.includes('border-b') && e.getBoundingClientRect().height > 0 && e.getBoundingClientRect().height < 80; });
    const gc = (el) => (el && el.getAttribute && el.getAttribute('class')) || '';
    const btns = header ? [...header.querySelectorAll('button')].map(b => ({ label: b.getAttribute('aria-label') || (b.textContent||'').trim().slice(0,20), cls: gc(b).slice(0,120) })) : [];
    const tabs = bt ? [...bt.querySelectorAll('button,a')].map(a => ({ label: (a.textContent||'').trim().slice(0,18), cls: gc(a).slice(0,160) })) : [];
    return {
      header: header ? { cls: gc(header).slice(0,200), h: Math.round(header.getBoundingClientRect().height), pos: getComputedStyle(header).position } : null,
      headerButtons: btns,
      bottomBar: bt ? { cls: gc(bt).slice(0,200), tabCount: tabs.length, tabs } : null,
      kicker: kicker ? { cls: gc(kicker).slice(0,200), top: kicker.getBoundingClientRect().top } : null,
      desktopSidebarVisible: (() => { const s = document.querySelector('[data-sidebar-container], aside'); return s ? getComputedStyle(s).display !== 'none' : false; })()
    };
  })()`);

  // (2) open the drawer via the hamburger — both sides carry exactly ONE
  // header button at 390px (REF: unlabeled; LOC: the a11y-superset label)
  const openRes = await evalOn(tag, `(() => {
    const header = document.querySelector('header');
    const burger = header ? header.querySelector('button') : null;
    if (!burger) return { noBurger: true, headerBtns: header ? [...header.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||'').slice(0,24)) : [] };
    burger.click(); return { clicked: true, label: burger.getAttribute('aria-label') || '' };
  })()`);
  await new Promise(r => setTimeout(r, 1300));

  const drawer = await evalOn(tag, `(() => {
    const gc = (el) => (el && el.getAttribute && el.getAttribute('class')) || '';
    const panel = [...document.querySelectorAll('div,aside')].find(e => { const c = gc(e); return c.includes('fixed') && c.includes('inset-y-0'); });
    const overlay = [...document.querySelectorAll('div')].find(e => { const c = gc(e); return c.includes('fixed') && c.includes('inset-0') && getComputedStyle(e).backgroundColor !== 'rgba(0, 0, 0, 0)'; });
    if (!panel) return { noDrawer: true };
    const r = panel.getBoundingClientRect();
    const groups = [...panel.querySelectorAll('button')].filter(b => (gc(b).includes('items-center') && b.querySelector('svg.lucide-chevron-down, svg.lucide-chevron-right'))).length;
    const navButtons = [...panel.querySelectorAll('nav button, nav a')].length;
    const footerBtns = [...panel.querySelectorAll('button')].filter(b => !b.closest('nav')).length;
    return {
      panel: { cls: gc(panel).slice(0,260), w: Math.round(r.width), x: Math.round(r.x), borderR: getComputedStyle(panel).borderRightWidth + ' ' + getComputedStyle(panel).borderRightColor },
      overlay: overlay ? { cls: gc(overlay).slice(0,160), bg: getComputedStyle(overlay).backgroundColor } : null,
      navButtons, groups, footerBtns,
      firstNavLabel: (panel.querySelector('nav button, nav a')||{textContent:''}).textContent.trim().slice(0,24)
    };
  })()`);

  // (3) close the drawer via overlay click, then verify it closed
  await evalOn(tag, `(() => { const o = [...document.querySelectorAll('div')].find(e => (e.getAttribute('class')||'').includes('fixed inset-0')); if (o) { o.dispatchEvent(new MouseEvent('click', {bubbles:true})); } return 'ok'; })()`);
  await new Promise(r => setTimeout(r, 700));
  const closed = await evalOn(tag, `(() => { const panel = [...document.querySelectorAll('div,aside')].find(e => { const c = (e.getAttribute('class')||''); return c.includes('fixed') && c.includes('inset-y-0'); }); return panel ? { stillOpen: getComputedStyle(panel).transform !== 'none' || panel.getBoundingClientRect().x > -50 } : { closed: true }; })()`);

  reads[tag] = { atRest, openRes, drawer, closed };
  console.log(`\n========== ${tag.toUpperCase()} ==========`);
  console.log(JSON.stringify(reads[tag], null, 1));
}

// member-wise compare
const flat = (o, p = "") => Object.entries(o || {}).flatMap(([k, v]) => typeof v === "object" && v !== null ? flat(v, p + k + ".") : [[p + k, JSON.stringify(v)]]);
const refMap = new Map(flat(reads.ref)), locMap = new Map(flat(reads.loc));
let same = 0, diff = 0;
console.log("\n===== PAIRED DIFF (member-wise) =====");
for (const [k, v] of refMap) {
  if (!locMap.has(k)) { console.log(`ONLY-REF ${k} = ${v.slice(0,110)}`); diff++; continue; }
  if (locMap.get(k) === v) { same++; continue; }
  console.log(`DIFF ${k}\n  ref: ${v.slice(0,130)}\n  loc: ${locMap.get(k).slice(0,130)}`); diff++;
}
for (const [k, v] of locMap) if (!refMap.has(k)) { console.log(`ONLY-LOC ${k} = ${v.slice(0,110)}`); diff++; }
console.log(`\nmobile-nav paired: ${same} same / ${diff} diff`);
