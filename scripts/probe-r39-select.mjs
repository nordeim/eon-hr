#!/usr/bin/env node
// probe-r39-select.mjs — full Select class strings + computed placeholder
// colors, both apps, loans dialog.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 400) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

for (const [label, session, base] of [["REF", "ref", baseRef], ["LOC", "loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/loans`);
  await new Promise(r => setTimeout(r, 3500));
  await evalOn(session, `(() => { const b = [...document.querySelectorAll('button')].find(b => /new loan/i.test(b.textContent || '')); if (b) b.click(); return 'ok'; })()`);
  await new Promise(r => setTimeout(r, 1500));
  const sel = await evalOn(session, `(() => {
    const dlg = [...document.querySelectorAll('[role=dialog]')][0];
    if (!dlg) return null;
    const s = dlg.querySelector('button[role=combobox]');
    if (!s) return null;
    const cs = getComputedStyle(s);
    return { cls: s.className, h: Math.round(s.getBoundingClientRect().height), placeholderColor: cs.color, atRestShadow: cs.boxShadow, bg: cs.backgroundColor };
  })()`);
  console.log(`=== ${label} ===`);
  console.log(JSON.stringify(sel));
  run(`agent-browser --session ${session} press Escape`);
  await new Promise(r => setTimeout(r, 600));
}
