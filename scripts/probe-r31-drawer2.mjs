#!/usr/bin/env node
// probe-r31-drawer2.mjs — inspect the drawer overlay DOM structure on both apps.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

const DUMP = `(() => {
  const overlay = [...document.querySelectorAll('div')].find(d => {
    const cs = getComputedStyle(d);
    return cs.backgroundColor === 'rgba(0, 0, 0, 0.8)' && d.getBoundingClientRect().width === 390 && parseFloat(cs.zIndex) === 50;
  });
  if (!overlay) return JSON.stringify({found:false});
  const desc = (el, depth) => {
    if (depth > 3) return [];
    return [...el.children].map(c => {
      const r = c.getBoundingClientRect(); const cs = getComputedStyle(c);
      return { tag: c.tagName, cls: (c.className.baseVal !== undefined ? c.className.baseVal : c.className || '').toString().slice(0,60), kids: c.children.length, btns: c.querySelectorAll('button').length, links: c.querySelectorAll('a').length, w: Math.round(r.width), x: Math.round(r.x), bg: cs.backgroundColor.slice(0,40), sub: desc(c, depth+1) };
    });
  };
  return JSON.stringify({found:true, overlayCls: overlay.className.toString().slice(0,60), tree: desc(overlay, 0)});
})()`;

for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${s} set viewport 390 844`);
  run(`agent-browser --session ${s} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 3500));
  await evalOn(s, `(() => {
    const btns = [...document.querySelectorAll('button')];
    const b = btns.find(e => { const r = e.getBoundingClientRect(); return r.y < 100 && r.x < 60 && r.width > 20 && r.width < 60 && (e.querySelector('svg') || (e.textContent||'').trim() === ''); });
    if (b) b.click();
    return 'clicked';
  })()`, 1500);
  const d = await evalOn(s, DUMP);
  console.log(`${s.toUpperCase()}:`);
  console.log(JSON.stringify(d).replace(/\},\{/g, '}\n{').slice(0, 3000));
}
