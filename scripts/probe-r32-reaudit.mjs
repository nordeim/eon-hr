#!/usr/bin/env node
// probe-r32-reaudit.mjs — re-verify the two DIFFs from audit-r31 with fresh
// loads + settle: (1) the mobile dashboard kicker y (89 vs 101), (2) the
// desktop sidebar navmap (REF read empty).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

// (1) kicker — fresh load, scroll to top, settle 5s
const KICKER = `(() => {
  window.scrollTo(0, 0);
  const k = [...document.querySelectorAll('h1')].find(h => h.getBoundingClientRect().y > 40 && h.getBoundingClientRect().y < 200);
  if (!k) return { found: false };
  const r = k.getBoundingClientRect(); const cs = getComputedStyle(k);
  return { t: k.textContent.trim().slice(0, 20), y: Math.round(r.y + window.scrollY), h: Math.round(r.height), fs: cs.fontSize, fw: cs.fontWeight, scrollY: window.scrollY };
})()`;
console.log("=== kicker re-audit (390x844, fresh /dashboard) ===");
for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${s} set viewport 390 844`);
  run(`agent-browser --session ${s} open "${base}/login"`);
  await new Promise(r => setTimeout(r, 2000));
  run(`agent-browser --session ${s} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 5000));
  console.log(`${s}: ${JSON.stringify(await evalOn(s, KICKER))}`);
  // second read for stability
  await new Promise(r => setTimeout(r, 1500));
  console.log(`${s} (2nd read): ${JSON.stringify(await evalOn(s, KICKER))}`);
}

// (2) sidebar navmap — fresh load at 1440x900
const NAVMAP = `(() => {
  window.scrollTo(0, 0);
  const aside = document.querySelector('aside');
  if (!aside) return { aside: false };
  const els = [...aside.querySelectorAll('button, a')].filter(e => e.getBoundingClientRect().width > 0);
  return els.map(e => { const r = e.getBoundingClientRect(); return { t: (e.textContent || '').trim().slice(0, 18), y: Math.round(r.y + window.scrollY) }; }).filter(e => e.t);
})()`;
console.log("\n=== sidebar navmap re-audit (1440x900, fresh /dashboard) ===");
for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  run(`agent-browser --session ${s} open "${base}/login"`);
  await new Promise(r => setTimeout(r, 2000));
  run(`agent-browser --session ${s} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 5000));
  const nav = await evalOn(s, NAVMAP);
  const ai = (nav || []).findIndex(e => e.t.includes("AI HR Assistant"));
  const sg = (nav || []).findIndex(e => e.t.includes("Settings"));
  console.log(`${s}: aside=${Array.isArray(nav)} items=${(nav || []).length} AI=${nav?.[ai]?.y} Settings=${nav?.[sg]?.y}`);
  console.log(JSON.stringify(nav).slice(0, 600));
}
