#!/usr/bin/env node
// probe-r32-navmap.mjs — sidebar navmap re-audit, probe-r30-navmap pattern
// (double-stringify to survive the CLI escaping).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const NAVMAP = `(() => {
  window.scrollTo(0, 0);
  const aside = document.querySelector('aside');
  if (!aside) return JSON.stringify({aside:false});
  const els = [...aside.querySelectorAll('button, a')].filter(e => e.getBoundingClientRect().width > 0);
  return JSON.stringify(els.map(e => { const r = e.getBoundingClientRect(); return { t: (e.textContent || '').trim().slice(0, 18), y: Math.round(r.y + window.scrollY) }; }).filter(e => e.t));
})()`;
console.log("=== sidebar navmap re-audit (1440x900, fresh /dashboard) ===");
for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  run(`agent-browser --session ${s} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 5000));
  const nav = await evalOn(s, NAVMAP);
  if (Array.isArray(nav)) {
    const ai = nav.findIndex(e => e.t.includes("AI HR Assistant"));
    const sg = nav.findIndex(e => e.t.includes("Settings"));
    console.log(`${s}: items=${nav.length} AI=${nav[ai]?.y} Settings=${nav[sg]?.y}`);
    console.log(JSON.stringify(nav));
  } else {
    console.log(`${s}: NOT-ARRAY ${JSON.stringify(nav).slice(0, 400)}`);
  }
}
