#!/usr/bin/env node
// verify-r41.mjs — session-42 / parity round 41 live verification:
// the footer ghost family (strings + keyboard-focus rings), the moon's
// conditional glyph, the user-menu item stretch, the employees filter row,
// and the shadcn Sidebar attribute family. Both apps, structural compare.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const raw = out.trim(); try { return JSON.parse(raw); } catch { try { return JSON.parse(`"${raw.replace(/^"|"$/g, "").replace(/"/g, '\\"')}"`); } catch { return { error: raw.slice(0, 300) }; } } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const results = [];
function rec(name, a, b) { const m = JSON.stringify(a) === JSON.stringify(b); results.push({ name, m }); console.log(`${m ? "MATCH " : "DIFF  "} ${name}` + (m ? "" : `\n  REF: ${JSON.stringify(a)}\n  LOC: ${JSON.stringify(b)}`)); }

async function openBoth(path) {
  run(`agent-browser --session ref set viewport 1440 900`);
  run(`agent-browser --session ref open ${baseRef}${path}`);
  await new Promise(r => setTimeout(r, 2600));
  run(`agent-browser --session loc set viewport 1440 900`);
  run(`agent-browser --session loc open ${baseLoc}${path}`);
  await new Promise(r => setTimeout(r, 2200));
}

// ---------- 1. the footer family: strings + conditional glyph ----------
await openBoth("/dashboard");
const FOOTER = `(() => {
  const btns = [...document.querySelectorAll('button')].filter(b => { const r = b.getBoundingClientRect(); return r.y > 700 && r.x < 260 && r.width > 0; });
  return btns.map(b => {
    const svgs = [...b.querySelectorAll('svg')].map(s => { const r = s.getBoundingClientRect(); return { cls: s.getAttribute('class'), w: Math.round(r.width), color: getComputedStyle(s).color }; });
    return { w: Math.round(b.getBoundingClientRect().width), svgs };
  });
})()`;
const footRef = await evalOn("ref", FOOTER);
const footLoc = await evalOn("loc", FOOTER);
rec("footer family (svg classes + rendered sizes/colors)", footRef, footLoc);

// ---------- 2. the keyboard-focus rings (Tab to the bell, then walk) ----------
async function focusWalk(session) {
  await evalOn(session, `document.activeElement && document.activeElement.blur(); 'ok'`);
  for (let i = 0; i < 24; i++) {
    run(`agent-browser --session ${session} press Tab`);
    await new Promise(r => setTimeout(r, 170));
    const hit = await evalOn(session, `(() => { const el = document.activeElement; return !!el && (el.getAttribute('aria-label') === 'Notifications' || (el.textContent||'').includes('عربي')); })()`);
    if (hit) break;
  }
  const reads = [];
  for (let i = 0; i < 3; i++) {
    reads.push(await evalOn(session, `(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      return { id: el.getAttribute('aria-label') || (el.textContent||'').trim().slice(0, 8), ring: cs.boxShadow.includes('rgb(10, 10, 10) 0px 0px 0px 1px'), outline: cs.outlineStyle };
    })()`));
    run(`agent-browser --session ${session} press Tab`);
    await new Promise(r => setTimeout(r, 180));
  }
  return reads;
}
const fRef = await focusWalk("ref");
const fLoc = await focusWalk("loc");
rec("footer keyboard-focus rings (bell/moon/arabic)", fRef, fLoc);

// ---------- 3. the user-menu item stretch ----------
async function menuItems(session) {
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const m = snap.match(/- button "sepnetflix2023[^"]*" \[[^\]]*ref=(\w+)\]/);
  if (!m) return { error: "no trigger" };
  run(`agent-browser --session ${session} click @${m[1]}`);
  await new Promise(r => setTimeout(r, 1300));
  const items = await evalOn(session, `(() => {
    return [...document.querySelectorAll('[role=menuitem]')].map(i => ({ tag: i.tagName.toLowerCase(), w: Math.round(i.getBoundingClientRect().width) }));
  })()`);
  run(`agent-browser --session ${session} press Escape`);
  await new Promise(r => setTimeout(r, 700));
  return items;
}
rec("user-menu items (tag + width)", await menuItems("ref"), await menuItems("loc"));

// ---------- 4. the employees filter row ----------
await openBoth("/employees");
const ROW = `(() => {
  const search = document.querySelector('input[placeholder*=Search]');
  const select = document.querySelector('select');
  const scs = getComputedStyle(select);
  return { searchW: Math.round(search.getBoundingClientRect().width), selectX: Math.round(select.getBoundingClientRect().x), selectH: Math.round(select.getBoundingClientRect().height), value: select.value, bg: scs.backgroundColor };
})()`;
rec("employees filter row", await evalOn("ref", ROW), await evalOn("loc", ROW));

// ---------- 5. the data-sidebar family ----------
await openBoth("/dashboard");
const DSCOUNT = `(() => { const out = {}; for (const el of document.querySelectorAll('[data-sidebar]')) { const k = el.getAttribute('data-sidebar'); out[k] = (out[k] || 0) + 1; } return out; })()`;
rec("data-sidebar attribute map", await evalOn("ref", DSCOUNT), await evalOn("loc", DSCOUNT));

// ---------- 6. the moon in DARK (the conditional sun, inherited color) ----------
async function darkMoon(session, base) {
  await evalOn(session, `localStorage.setItem('darkMode','true'); 'set'`);
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 2600));
  const read = await evalOn(session, `(() => {
    const b = [...document.querySelectorAll('button')].filter(x => { const r = x.getBoundingClientRect(); return r.y > 700 && r.x < 260 && r.width > 0; });
    const moon = b[1];
    const svgs = [...moon.querySelectorAll('svg')].map(s => ({ cls: s.getAttribute('class'), color: getComputedStyle(s).color }));
    return { svgs, htmlDark: document.documentElement.classList.contains('dark') };
  })()`);
  await evalOn(session, `localStorage.setItem('darkMode','false'); 'reset'`);
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 2000));
  return read;
}
rec("moon in dark (single sun glyph + inherited color)", await darkMoon("ref", baseRef), await darkMoon("loc", baseLoc));

console.log(`\n${results.filter(r => r.m).length}/${results.length} verify-r41 MATCH`);
