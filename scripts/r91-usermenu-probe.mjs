#!/usr/bin/env node
// r91-usermenu-probe.mjs — the user-menu dropdown at MOBILE 390x844 on both
// sides: open the drawer, click the CircleUser trigger, read the open state
// (Radix popper role=menu vs bottom-sheet) + the geometry + items.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const READ_OPEN = `(() => {
  const r = (el) => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
  const menus = [...document.querySelectorAll('[role=menu]')].map(m => ({ kind: 'menu', rect: r(m), dir: m.getAttribute('dir'), classes: (m.getAttribute('class')||'').slice(0,200), items: [...m.querySelectorAll('[role=menuitem]')].map(i => i.textContent.trim()) }));
  const dialogs = [...document.querySelectorAll('[role=dialog]')].map(d => ({ kind: 'dialog', rect: r(d), classes: (d.getAttribute('class')||'').slice(0,200), heading: d.querySelector('h1,h2,h3')?.textContent?.trim() ?? null }));
  const popperWrap = document.querySelector('[data-radix-popper-content-wrapper]');
  const sheetLike = [...document.querySelectorAll('body > div')].filter(d => { const s = getComputedStyle(d); return s.position === 'fixed' && parseFloat(s.bottom||'9999') === 0 && d.textContent.length > 0; }).map(d => ({ kind: 'fixed-bottom', rect: r(d), classes: (d.getAttribute('class')||'').slice(0,200) }));
  return { menus, dialogs, popperWrap: popperWrap ? r(popperWrap) : null, sheetLike };
})()`;

const OPEN_DRAWER_AND_CLICK = `(() => {
  const toggle = [...document.querySelectorAll('button')].find(b => /toggle sidebar/i.test(b.textContent) || /toggle sidebar/i.test(b.getAttribute('aria-label')||''));
  if (toggle) toggle.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  return { toggled: !!toggle };
})()`;

const FIND_USER_TRIGGER = `(() => {
  const btns = [...document.querySelectorAll('button')];
  const byAria = btns.filter(b => /user|account|profile/i.test(b.getAttribute('aria-label')||''));
  const byText = btns.filter(b => /sepnetflix|demo/i.test(b.textContent));
  return { byAria: byAria.map(b => ({ text: b.textContent.trim().slice(0,30), aria: b.getAttribute('aria-label'), svgs: b.querySelectorAll('svg').length, cls: (b.getAttribute('class')||'').slice(0,80) })), byText: byText.map(b => ({ text: b.textContent.trim().slice(0,40), svgs: b.querySelectorAll('svg').length })) };
})()`;

const side = process.argv[2] || "ref";
const base = side === "ref" ? "https://eon.base44.app" : "http://127.0.0.1:3200";
const session = side === "ref" ? "ref" : "loc";
run(`agent-browser --session ${session} set viewport 390 844`);
run(`agent-browser --session ${session} open ${base}/dashboard`);
await new Promise(r => setTimeout(r, 6000));
const t = await evalOn(session, OPEN_DRAWER_AND_CLICK);
console.log("drawer toggle:", JSON.stringify(t));
await new Promise(r => setTimeout(r, 1500));
const trig = await evalOn(session, FIND_USER_TRIGGER);
console.log("user triggers in drawer:", JSON.stringify(trig).slice(0, 600));
// click the first candidate trigger
const click = await evalOn(session, `(() => {
  const btns = [...document.querySelectorAll('button')];
  const byAria = btns.filter(b => /user|account|profile/i.test(b.getAttribute('aria-label')||''));
  const byText = btns.filter(b => /sepnetflix|demo/i.test(b.textContent));
  const target = byAria[0] || byText[0];
  if (!target) return { clicked: false };
  target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  return { clicked: true, text: target.textContent.trim().slice(0, 40) };
})()`);
console.log("trigger click:", JSON.stringify(click));
await new Promise(r => setTimeout(r, 1400));
const open = await evalOn(session, READ_OPEN);
console.log("OPEN STATE:", JSON.stringify(open).slice(0, 1200));
process.exit(0);
