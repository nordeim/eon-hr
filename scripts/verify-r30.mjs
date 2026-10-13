#!/usr/bin/env node
// verify-r30.mjs — session-31 / parity round 30 live verification:
// (1) the drawer border contract, (2) the chat-page y-map, (3) the /assets
// y-map (desktop + mobile), on both apps; viewports pinned.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
let fails = 0;
const check = (label, ref, loc) => {
  const same = JSON.stringify(ref) === JSON.stringify(loc);
  if (!same) fails++;
  console.log(`${same ? "MATCH" : "**DIFF**"} ${label}: ref=${JSON.stringify(ref)} loc=${JSON.stringify(loc)}`);
};

// ---- 1) the drawer border (mobile 390x844) ----
const DRAWER = `(() => {
  const cands = [...document.querySelectorAll('div')].filter(d => {
    const cs = getComputedStyle(d);
    const r = d.getBoundingClientRect();
    return cs.position === 'fixed' && r.width >= 200 && r.width <= 340 && Math.round(r.height) >= 800 && cs.backgroundColor !== 'rgba(0, 0, 0, 0.8)' && d.querySelectorAll('button, a').length > 3;
  });
  if (!cands.length) return { found: false };
  const cs = getComputedStyle(cands[0]);
  return { found: true, w: Math.round(cands[0].getBoundingClientRect().width), br: cs.borderRightWidth, brc: cs.borderRightColor };
})()`;
console.log("=== 1) drawer border ===");
for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${s} set viewport 390 844`);
  run(`agent-browser --session ${s} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 4000));
  await evalOn(s, `(() => {
    const btns = [...document.querySelectorAll('button')];
    const b = btns.find(e => { const r = e.getBoundingClientRect(); return r.y < 100 && r.x < 60 && r.width > 20 && r.width < 60 && (e.querySelector('svg') || (e.textContent||'').trim() === ''); });
    if (b) b.click();
    return 'ok';
  })()`, 900);
}
check("drawer panel border", await evalOn("ref", DRAWER), await evalOn("loc", DRAWER));

// ---- 2) the chat page y-map (desktop 1440x900) ----
const CHAT = `(() => {
  const find = (txt, tag) => [...document.querySelectorAll('main ' + tag + ', main div')].filter(e => e.children.length === 0 && e.textContent.trim() === txt && e.getBoundingClientRect().width > 0)[0];
  const out = {};
  const title = find('Active Chats', 'h1,h2,h3');
  out.title = title ? { y: Math.round(title.getBoundingClientRect().y), fs: getComputedStyle(title).fontSize, fw: getComputedStyle(title).fontWeight, col: getComputedStyle(title).color } : null;
  const nochats = find('No chats', 'p');
  out.nochats = nochats ? { y: Math.round(nochats.getBoundingClientRect().y), x: Math.round(nochats.getBoundingClientRect().x), fs: getComputedStyle(nochats).fontSize, col: getComputedStyle(nochats).color } : null;
  const line = find('Select a chat or start a new one', 'p');
  out.line = line ? { y: Math.round(line.getBoundingClientRect().y), x: Math.round(line.getBoundingClientRect().x) } : null;
  const icon = document.querySelector('main svg.h-16, main [class*="h-16"]');
  out.icon = icon ? { y: Math.round(icon.getBoundingClientRect().y), x: Math.round(icon.getBoundingClientRect().x), w: Math.round(icon.getBoundingClientRect().width) } : null;
  out.extraCopy = document.body.innerText.includes('Your HR assistant answers questions') || document.body.innerText.includes('Start a new chat to ask');
  return out;
})()`;
console.log("\n=== 2) chat page y-map ===");
for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  run(`agent-browser --session ${s} open "${base}/hrassistantchat"`);
  await new Promise(r => setTimeout(r, 3500));
}
check("chat empty states", await evalOn("ref", CHAT), await evalOn("loc", CHAT));

// ---- 3) the /assets page y-map (desktop) ----
const ASSETS = `(() => {
  const out = {};
  const span = [...document.querySelectorAll('main span')].find(e => e.textContent.trim() === 'Asset Management' && e.getBoundingClientRect().width > 0);
  out.kicker = span ? { y: Math.round(span.getBoundingClientRect().y), x: Math.round(span.getBoundingClientRect().x) } : null;
  const h1 = [...document.querySelectorAll('main h1')].find(e => e.getBoundingClientRect().y > 50);
  out.h1 = h1 ? { t: h1.textContent.trim(), y: Math.round(h1.getBoundingClientRect().y), fs: getComputedStyle(h1).fontSize } : null;
  const sub = [...document.querySelectorAll('main p')].find(e => e.textContent.trim() === 'Track and manage company assets');
  out.sub = sub ? { y: Math.round(sub.getBoundingClientRect().y) } : null;
  const btn = [...document.querySelectorAll('main button')].find(e => e.textContent.trim() === 'Add Asset');
  out.btn = btn ? { y: Math.round(btn.getBoundingClientRect().y), x: Math.round(btn.getBoundingClientRect().x), w: Math.round(btn.getBoundingClientRect().width) } : null;
  const card = document.querySelector('main .rounded-xl');
  out.card = card ? { y: Math.round(card.getBoundingClientRect().y), x: Math.round(card.getBoundingClientRect().x) } : null;
  const band = card ? card.querySelector('.bg-slate-50') : null;
  out.band = band ? { y: Math.round(band.getBoundingClientRect().y), h: Math.round(band.getBoundingClientRect().height), bg: getComputedStyle(band).backgroundColor } : null;
  const title = band ? [...band.querySelectorAll('*')].find(e => e.textContent.trim() === 'Assets') : null;
  out.bandTitle = title ? { y: Math.round(title.getBoundingClientRect().y), h: Math.round(title.getBoundingClientRect().height), fs: getComputedStyle(title).fontSize } : null;
  const empty = [...document.querySelectorAll('main p')].find(e => e.textContent.trim() === 'No assets yet');
  out.empty = empty ? { y: Math.round(empty.getBoundingClientRect().y), x: Math.round(empty.getBoundingClientRect().x) } : null;
  out.is404 = document.body.innerText.includes('Page Not Found');
  return out;
})()`;
console.log("\n=== 3) /assets y-map (desktop) ===");
for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  run(`agent-browser --session ${s} open "${base}/assets"`);
  await new Promise(r => setTimeout(r, 3500));
}
check("legacy /assets page", await evalOn("ref", ASSETS), await evalOn("loc", ASSETS));

// ---- 3b) /assets mobile (390x844) ----
const ASSETSM = `(() => {
  const h1 = [...document.querySelectorAll('h1')].filter(e => e.getBoundingClientRect().width > 0 && e.textContent.trim() === 'Assets')[0];
  const btn = [...document.querySelectorAll('button')].find(e => e.textContent.trim() === 'Add Asset');
  const card = document.querySelector('main .rounded-xl');
  return {
    h1: h1 ? { y: Math.round(h1.getBoundingClientRect().y), fs: getComputedStyle(h1).fontSize } : null,
    btn: btn ? { y: Math.round(btn.getBoundingClientRect().y), x: Math.round(btn.getBoundingClientRect().x) } : null,
    card: card ? { y: Math.round(card.getBoundingClientRect().y), x: Math.round(card.getBoundingClientRect().x) } : null,
  };
})()`;
console.log("\n=== 3b) /assets mobile ===");
for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${s} set viewport 390 844`);
  run(`agent-browser --session ${s} open "${base}/assets"`);
  await new Promise(r => setTimeout(r, 3500));
}
check("legacy /assets mobile", await evalOn("ref", ASSETSM), await evalOn("loc", ASSETSM));

console.log(`\n${fails === 0 ? "ALL LIVE CHECKS MATCH" : fails + " DIFF(S) FOUND"}`);
