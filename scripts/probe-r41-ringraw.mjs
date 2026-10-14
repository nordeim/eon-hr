#!/usr/bin/env node
// probe-r41-ringraw.mjs — raw focus boxShadow strings for the sidebar nav
// elements on both apps (the bucket classifier was flaky; get ground truth).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const raw = out.trim(); try { return JSON.parse(raw); } catch { try { return JSON.parse(`"${raw.replace(/^"|"$/g, "").replace(/"/g, '\\"')}"`); } catch { return { error: raw.slice(0, 300) }; } } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

const READ = `(() => {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  return { d: el.tagName.toLowerCase() + ' ' + (el.textContent || '').trim().slice(0, 12) + ' ' + Math.round(r.x) + ',' + Math.round(r.y), shadow: cs.boxShadow };
})()`;

async function sweep(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 3000));
  await evalOn(session, `document.activeElement && document.activeElement.blur(); 'ok'`);
  const seq = [];
  for (let i = 0; i < 14; i++) {
    run(`agent-browser --session ${session} press Tab`);
    await new Promise(r => setTimeout(r, 400));
    const read = await evalOn(session, READ);
    if (read) seq.push(read.d + ' :: ' + read.shadow);
  }
  return seq;
}

const ref = await sweep("ref", baseRef);
const loc = await sweep("loc", baseLoc);
for (let i = 0; i < Math.max(ref.length, loc.length); i++) {
  console.log(`REF ${String(i).padStart(2)}: ${ref[i] || ''}`);
  console.log(`LOC ${String(i).padStart(2)}: ${loc[i] || ''}`);
  console.log('');
}
