#!/usr/bin/env node
// probe-r41-shellfocus.mjs — the whole-shell keyboard focus sweep: from
// body, Tab x N on /dashboard at 1440x900, recording each focused
// element's tag/geom/outline/boxShadow. Structural compare both apps.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const raw = out.trim(); try { return JSON.parse(raw); } catch { try { return JSON.parse(`"${raw.replace(/^"|"$/g, "").replace(/"/g, '\\"')}"`); } catch { return { error: raw.slice(0, 300) }; } } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

const READ = `(() => {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  const desc = [el.tagName.toLowerCase()];
  const lbl = el.getAttribute('aria-label'); if (lbl) desc.push('al=' + lbl.slice(0, 14));
  const txt = (el.textContent || '').trim().slice(0, 12); if (txt) desc.push('t=' + txt);
  desc.push(Math.round(r.x) + ',' + Math.round(r.y) + ',' + Math.round(r.width));
  return { d: desc.join(' '), o: cs.outlineStyle + '/' + cs.outlineWidth, s: cs.boxShadow === 'none' ? 'none' : (cs.boxShadow.includes('rgb(10, 10, 10)') || cs.boxShadow.includes('rgb(24, 119, 242)') || cs.boxShadow.includes('rgb(59, 130, 246)') ? 'RING' : 'other') };
})()`;

async function sweep(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 3000));
  await evalOn(session, `document.activeElement && document.activeElement.blur(); 'ok'`);
  const seq = [];
  for (let i = 0; i < 36; i++) {
    run(`agent-browser --session ${session} press Tab`);
    await new Promise(r => setTimeout(r, 170));
    const read = await evalOn(session, READ);
    if (read) seq.push(read.d + ' | ' + read.o + ' | ' + read.s);
  }
  return seq;
}

const ref = await sweep("ref", baseRef);
const loc = await sweep("loc", baseLoc);
const max = Math.max(ref.length, loc.length);
let diffs = 0;
for (let i = 0; i < max; i++) {
  const a = ref[i] || "(none)", b = loc[i] || "(none)";
  if (a === b) console.log(`  ${String(i + 1).padStart(2)} OK   ${a}`);
  else { diffs++; console.log(`  ${String(i + 1).padStart(2)} DIFF\n       REF: ${a}\n       LOC: ${b}`); }
}
console.log(`\n${diffs} diffs of ${max} focused elements`);
