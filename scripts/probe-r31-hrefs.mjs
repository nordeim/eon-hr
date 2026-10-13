#!/usr/bin/env node
// probe-r31-hrefs.mjs — dump every sidebar nav href on both apps (desktop
// 1440x900) to resolve the real route paths for Assets / Staff Requests /
// AI HR Assistant / Training LMS.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

const HREFS = `(() => {
  const root = document.querySelector('aside') || document.querySelector('div.min-h-screen');
  const out = [];
  for (const a of [...root.querySelectorAll('a')]) {
    const r = a.getBoundingClientRect();
    if (r.width === 0 || r.y > 760) continue;
    out.push({ t: (a.textContent||'').trim().slice(0,24), href: a.getAttribute('href') });
  }
  return JSON.stringify(out);
})()`;

for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  run(`agent-browser --session ${s} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 3500));
  const d = await evalOn(s, HREFS);
  console.log(`${s.toUpperCase()}:`);
  console.log(JSON.stringify(d).replace(/\},\{/g, '}\n{'));
}
