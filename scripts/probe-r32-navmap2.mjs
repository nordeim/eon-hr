#!/usr/bin/env node
// probe-r32-navmap2.mjs — definitive sidebar navmap census (round-30 pattern):
// sidebar items via div.min-h-screen + x<260 filter; collapsed map AND the
// expanded-Analytics roots (the pinned 865/905).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const MAP = `(() => {
  window.scrollTo(0, 0);
  const els = [...document.querySelectorAll('aside button, aside a, div.min-h-screen button, div.min-h-screen a')];
  const out = [];
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.y > 1200 || r.x > 260 || r.x < 0) continue;
    out.push({ t: (el.textContent || '').trim().slice(0, 20) || el.getAttribute('aria-label') || '[icon]', y: Math.round(r.y) });
  }
  return JSON.stringify(out);
})()`;
const EXPAND = `(() => {
  const analytics = [...document.querySelectorAll('button, a')].find(e => (e.textContent || '').trim() === 'Analytics' && e.getBoundingClientRect().x < 260);
  if (analytics) analytics.click();
  return analytics ? 'clicked' : 'not-found';
})()`;

for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  run(`agent-browser --session ${s} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 5000));
  const collapsed = await evalOn(s, MAP);
  const expandedClick = await evalOn(s, EXPAND, 900);
  const expanded = await evalOn(s, MAP);
  console.log(`${s.toUpperCase()} collapsed: ${JSON.stringify(collapsed)}`);
  console.log(`${s.toUpperCase()} expanded (${expandedClick}): ${JSON.stringify(expanded)}`);
}
