#!/usr/bin/env node
// r91-dropdown-probe.mjs — session-91 / parity round 90: THE DROPDOWN-MENU
// FAMILY'S RESPONSIVE QUESTION (the r91 queue's #1 frontier).
// r90 verified the REF swaps its SELECTS to a bottom-sheet below 768 — but
// the DROPDOWN-MENU family was never cross-compared at mobile. This probe
// reads, on BOTH sides at 390×844 (light LTR):
//   1. /loans — the row-actions MoreHorizontal dropdown
//   2. /taskmanager — the row-actions MoreHorizontal dropdown
//   3. /recruitmentkanban — the card "Move to" ChevronDown dropdown
// For each: find the trigger by census, click it via eval, then read the
// opened overlay's structural identity (Radix popper role=menu vs
// bottom-sheet dialog vs native select) + geometry + the item set.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const READ_OVERLAY = `(() => {
  const r = (el) => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
  const menus = [...document.querySelectorAll('[role=menu]')].map(m => ({ kind: 'menu', attrs: { role: 'menu', dir: m.getAttribute('dir'), 'data-state': m.getAttribute('data-state') }, rect: r(m), classes: m.getAttribute('class')?.slice(0, 220), items: [...m.querySelectorAll('[role=menuitem]')].map(i => i.textContent.trim()).slice(0, 12) }));
  const dialogs = [...document.querySelectorAll('[role=dialog]')].map(d => ({ kind: 'dialog', rect: r(d), classes: d.getAttribute('class')?.slice(0, 220), heading: d.querySelector('h1,h2,h3')?.textContent?.trim() ?? null, textLen: d.textContent.length, options: [...d.querySelectorAll('button')].map(b => b.textContent.trim()).filter(Boolean).slice(0, 12) }));
  const listboxes = [...document.querySelectorAll('[role=listbox]')].map(l => ({ kind: 'listbox', rect: r(l), classes: l.getAttribute('class')?.slice(0, 220), opts: [...l.querySelectorAll('[role=option]')].map(o => o.textContent.trim()).slice(0, 12) }));
  const popperWrap = document.querySelector('[data-radix-popper-content-wrapper]');
  const overlay = document.querySelector('.bg-black\\\\/80, [style*="rgba(0, 0, 0, 0.8)"], [style*="background-color: rgba(0"]');
  return { menus, dialogs, listboxes, popperWrap: popperWrap ? r(popperWrap) : null, hasOverlay: !!overlay, bodyChildren: document.body.children.length };
})()`;

// CLICK: find the Nth icon-only button (MoreHorizontal row actions) or the
// 'Move to' text button, and click it via the DOM.
const CLICK_ICON_BTN = (idx) => `(() => {
  const btns = [...document.querySelectorAll('button')].filter(b => b.querySelectorAll('svg').length >= 1 && b.textContent.trim().length === 0 && b.offsetParent !== null);
  if (!btns[${idx}]) return { clicked: false, count: btns.length };
  btns[${idx}].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  return { clicked: true, count: btns.length };
})()`;
const CLICK_TEXT_BTN = (txt) => `(() => {
  const btns = [...document.querySelectorAll('button')].filter(b => b.textContent.toLowerCase().includes('${txt}') && b.offsetParent !== null);
  if (!btns[0]) return { clicked: false, count: 0 };
  btns[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  return { clicked: true, count: btns.length };
})()`;

async function probe(side, base, session, route, mode, label) {
  console.log(`\n===== ${side.toUpperCase()} ${route} — ${label} =====`);
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}${route}`);
  await new Promise(r => setTimeout(r, 6000)); // the capture-settle rule
  const clickRes = mode.startsWith("icon:")
    ? await evalOn(session, CLICK_ICON_BTN(mode.split(":")[1]))
    : await evalOn(session, CLICK_TEXT_BTN(mode));
  console.log("click result:", JSON.stringify(clickRes));
  if (!(clickRes && clickRes.clicked)) { console.log("NO TRIGGER FOUND — skipping read"); return; }
  await new Promise(r => setTimeout(r, 1400));
  const read = await evalOn(session, READ_OVERLAY);
  console.log("OPEN STATE:", JSON.stringify(read).slice(0, 1400));
}

const side = process.argv[2] || "ref";
const base = side === "ref" ? "https://eon.base44.app" : "http://127.0.0.1:3200";
const session = side === "ref" ? "ref" : "loc";

await probe(side, base, session, "/loans", "icon:1", "row-actions MoreHorizontal (2nd icon btn — skip header bell)");
await probe(side, base, session, "/taskmanager", "icon:1", "row-actions MoreHorizontal");
await probe(side, base, session, "/recruitmentkanban", "move to", "card Move-to ChevronDown");
process.exit(0);
