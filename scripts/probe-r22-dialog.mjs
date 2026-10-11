#!/usr/bin/env node
// probe-r22-dialog.mjs — session-23 / parity round 22: the dialog surface.
// REF vs LOC dialog geometry + scroll contract. NOTE: single quotes in
// browser JS (the documented agent-browser escaping lesson).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) {
  if (ms) await new Promise(r => setTimeout(r, ms));
  const oneLine = expr.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try {
    let raw = out.trim();
    try { const once = JSON.parse(raw); if (typeof once === "string") raw = once; } catch {}
    return JSON.parse(raw);
  } catch { return { error: out.slice(0, 300) }; }
}

const CASES = [
  ["loans", "/loans", "new loan"],
  ["expenses", "/expenses", "expense"],
];

for (const [tag, session, base] of [
  ["REF", "ref", "https://eon.base44.app"],
  ["LOC", "loc", "http://127.0.0.1:3200"],
]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  for (const [name, route, label] of CASES) {
    run(`agent-browser --session ${session} open ${base}${route}`);
    await new Promise(r => setTimeout(r, 4000));
    const opened = await evalOn(session, `(() => { const b = [...document.querySelectorAll('button')].find(x => (x.textContent || '').toLowerCase().includes('${label}')); if (b) { b.click(); return 'clicked'; } return 'no-btn'; })()`);
    await new Promise(r => setTimeout(r, 1400));
    const read = await evalOn(session, `(() => { const d = document.querySelector('[role=dialog]'); if (!d) return JSON.stringify({ open: false }); const cs = getComputedStyle(d); const r = d.getBoundingClientRect(); return JSON.stringify({ w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y), maxW: cs.maxWidth, oy: cs.overflowY, maxH: cs.maxHeight, sbw: cs.scrollbarWidth, sbc: cs.scrollbarColor }); })()`);
    console.log(`${tag} ${name}: open=${JSON.stringify(opened)} dlg=${JSON.stringify(read)}`);
    await evalOn(session, `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); 'esc'`);
    await new Promise(r => setTimeout(r, 800));
  }
}
