#!/usr/bin/env node
// probe-r31-border6.mjs — pin the exact border contract of the PAINTED
// desktop sidebar + the drawer panel on both apps. REF's desktop outer div
// is a wrapper; the painted panel (bg rgb(250,250,250), w=256) is nested.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

// desktop: find the PAINTED sidebar (bg 250,250,250, x=0, w=256)
const PAINTED = `(() => {
  const cands = [...document.querySelectorAll('div, aside')].filter(d => {
    const cs = getComputedStyle(d);
    const r = d.getBoundingClientRect();
    return cs.backgroundColor === 'rgb(250, 250, 250)' && Math.round(r.x) === 0 && Math.round(r.width) === 256 && Math.round(r.height) >= 700;
  });
  if (!cands.length) return JSON.stringify({found:false});
  const out = cands.map(el => {
    const cs = getComputedStyle(el);
    return { tag: el.tagName, cls: el.className.toString().slice(0,90), br: cs.borderRightWidth, brc: cs.borderRightColor, bl: cs.borderLeftWidth, h: Math.round(el.getBoundingClientRect().height) };
  });
  return JSON.stringify({found:true, panels:out});
})()`;

// drawer: full border read on the settled panel
const DRAWER = `(() => {
  const cands = [...document.querySelectorAll('div')].filter(d => {
    const cs = getComputedStyle(d);
    const r = d.getBoundingClientRect();
    return cs.position === 'fixed' && r.width >= 200 && r.width <= 340 && Math.round(r.height) >= 800 && cs.backgroundColor !== 'rgba(0, 0, 0, 0.8)' && d.querySelectorAll('button, a').length > 3;
  });
  if (!cands.length) return JSON.stringify({found:false});
  const cs = getComputedStyle(cands[0]);
  return JSON.stringify({found:true, x:Math.round(cands[0].getBoundingClientRect().x), br: cs.borderRightWidth, brc: cs.borderRightColor, boxShadow: cs.boxShadow.slice(0,80)});
})()`;

for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  run(`agent-browser --session ${s} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 3500));
  const d = await evalOn(s, PAINTED);
  console.log(`DESKTOP ${s.toUpperCase()}: ${JSON.stringify(d)}`);
}
for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${s} set viewport 390 844`);
  run(`agent-browser --session ${s} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 4000));
  await evalOn(s, `(() => {
    const btns = [...document.querySelectorAll('button')];
    const b = btns.find(e => { const r = e.getBoundingClientRect(); return r.y < 100 && r.x < 60 && r.width > 20 && r.width < 60 && (e.querySelector('svg') || (e.textContent||'').trim() === ''); });
    if (b) b.click();
    return 'clicked';
  })()`);
  await new Promise(r => setTimeout(r, 1500));
  const d = await evalOn(s, DRAWER);
  console.log(`DRAWER ${s.toUpperCase()}: ${JSON.stringify(d)}`);
}
