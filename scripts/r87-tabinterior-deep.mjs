#!/usr/bin/env node
// r87-tabinterior-deep.mjs — session-87 / parity round 86: the deep DOM
// probe of the payrollreports tab interiors (Tax/History/Custom) on both
// sides — extracts the active tabpanel's structural recipe (headers,
// description, toolbar, table columns, inputs, buttons) with classes,
// tags, text, and geometry, so the LOC panels can be rebuilt to the
// REF-measured contract.
import { execSync } from "node:child_process";
import fs from "node:fs";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const OUT = `${repo}/docs/screenshots/r87-tab-STRUCT.json`;
const sessions = [["ref", "https://eon.base44.app"], ["loc", "http://127.0.0.1:3200"]];
const TABS = [
  { key: "tax", label: "Tax & Deductions" },
  { key: "history", label: "History" },
  { key: "custom", label: "Custom" },
];

const PROBE = `(() => {
  const panel = document.querySelector('[role=tabpanel][data-state=active]');
  if (!panel) return JSON.stringify({error: 'no panel'});
  const walk = (el, depth) => {
    if (depth > 7) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const kid = [...el.children].map(c => walk(c, depth + 1)).filter(Boolean);
    return {
      tag: el.tagName,
      cls: (el.getAttribute('class') || '').slice(0, 200),
      txt: el.children.length === 0 ? (el.textContent || '').trim().slice(0, 80) : null,
      rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
      display: cs.display, fs: cs.fontSize, fw: cs.fontWeight, color: cs.color,
      bg: cs.backgroundColor, kids: kid.length ? kid : undefined,
    };
  };
  return JSON.stringify(walk(panel, 0)).slice(0, 30000);
})()`.split("\n").join(" ");

const TABLEPROBE = `(() => {
  const panel = document.querySelector('[role=tabpanel][data-state=active]');
  if (!panel) return JSON.stringify({error: 'no panel'});
  const ths = [...panel.querySelectorAll('th')].map(th => {
    const r = th.getBoundingClientRect();
    const cs = getComputedStyle(th);
    const thead = th.closest('thead');
    return { t: th.textContent.trim().slice(0, 40), cls: (th.getAttribute('class')||'').slice(0,120),
      x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
      align: cs.textAlign, fs: cs.fontSize, tt: cs.textTransform,
      theadCls: thead ? (thead.getAttribute('class')||'').slice(0,150) : null };
  });
  const tds0 = [...panel.querySelectorAll('tbody tr')].slice(0, 2).map(tr =>
    [...tr.children].map(td => ({ t: td.textContent.trim().slice(0, 30), cls: (td.getAttribute('class')||'').slice(0,100) })));
  const inputs = [...panel.querySelectorAll('input')].map(i => {
    const r = i.getBoundingClientRect();
    return { type: i.type, value: i.value, cls: (i.getAttribute('class')||'').slice(0,150), w: Math.round(r.width) };
  });
  const selects = [...panel.querySelectorAll('button[role=combobox]')].map(b => {
    const r = b.getBoundingClientRect();
    return { txt: b.textContent.trim().slice(0, 40), cls: (b.getAttribute('class')||'').slice(0,150), w: Math.round(r.width) };
  });
  const btns = [...panel.querySelectorAll('button')].map(b => {
    const r = b.getBoundingClientRect();
    const cs = getComputedStyle(b);
    return { txt: b.textContent.trim().slice(0, 40), cls: (b.getAttribute('class')||'').slice(0,180),
      w: Math.round(r.width), h: Math.round(r.height), bg: cs.backgroundColor, c: cs.color };
  });
  const checkboxes = [...panel.querySelectorAll('[role=checkbox]')].map(cb => {
    const r = cb.getBoundingClientRect();
    const label = cb.closest('label') || cb.parentElement;
    return { state: cb.getAttribute('data-state'), txt: label ? label.textContent.trim().slice(0, 40) : null,
      x: Math.round(r.x), y: Math.round(r.y) };
  });
  return JSON.stringify({ ths, tds0, inputs, selects, btns, checkboxes, ncheckboxes: checkboxes.length }).slice(0, 20000);
})()`.split("\n").join(" ");

const result = {};
for (const [side, base] of sessions) {
  result[side] = {};
  // auth the session first (the capture script's close --all retires every
  // standing session — each instrument owns its own auth)
  run(`agent-browser --session ${side} set viewport 1440 900`);
  run(`agent-browser --session ${side} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
  run(`agent-browser --session ${side} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3000));
  run(`agent-browser --session ${side} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  await new Promise(r => setTimeout(r, 400));
  run(`agent-browser --session ${side} fill 'input[type=password]' '$Abcd1234'`);
  await new Promise(r => setTimeout(r, 400));
  const snapA = run(`agent-browser --session ${side} snapshot -i -c`);
  const btnRef = (snapA.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
  if (btnRef) run(`agent-browser --session ${side} click @${btnRef}`);
  await new Promise(r => setTimeout(r, 4200));
  console.log(side, "authed:", run(`agent-browser --session ${side} get url`).trim());
  for (const tab of TABS) {
    run(`agent-browser --session ${side} open ${base}/payrollreports`);
    await new Promise(r => setTimeout(r, 3500));
    const snap = run(`agent-browser --session ${side} snapshot -i -c`);
    const ref = (snap.match(new RegExp(`- tab "${tab.label}"[^\\n]*\\[ref=(\\w+)\\]`)) || [])[1];
    if (ref) run(`agent-browser --session ${side} click @${ref}`);
    await new Promise(r => setTimeout(r, 2600));
    const struct = run(`agent-browser --session ${side} eval ${JSON.stringify(PROBE)}`);
    const table = run(`agent-browser --session ${side} eval ${JSON.stringify(TABLEPROBE)}`);
    result[side][tab.key] = { struct: struct.trim().slice(0, 30000), table: table.trim().slice(0, 20000) };
    console.log(`${side}/${tab.key} probed`);
  }
}
fs.writeFileSync(OUT, JSON.stringify(result, null, 1));
console.log("saved", OUT);
process.exit(0);
