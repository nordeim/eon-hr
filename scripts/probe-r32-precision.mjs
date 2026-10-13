#!/usr/bin/env node
// probe-r32-precision.mjs — targeted re-measurement of the 7 DIFF pages.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }
const baseRef = "https://eon.base44.app";
run(`agent-browser --session ref set viewport 1440 900`);

async function open(route) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  await new Promise(r => setTimeout(r, 3800));
}

console.log("=== /employeeportal card internals ===");
await open("/employeeportal");
console.log(JSON.stringify(await evalOn("ref", `(() => {
  const card = document.querySelector('main .rounded-xl');
  const kids = card ? [...card.children[0].children].map(k => ({ tag: k.tagName, fs: getComputedStyle(k).fontSize, fw: getComputedStyle(k).fontWeight, y: Math.round(k.getBoundingClientRect().y), h: Math.round(k.getBoundingClientRect().height), t: k.textContent.trim().slice(0, 30) })) : [];
  return { cardY: card ? Math.round(card.getBoundingClientRect().y) : null, cardH: card ? Math.round(card.getBoundingClientRect().height) : null, kids };
})()`), null, 1));

console.log("\n=== /externaljobapplication card order ===");
await open("/externaljobapplication");
console.log(JSON.stringify(await evalOn("ref", `(() => {
  const card = document.querySelector('main .rounded-xl');
  const walk = (el, depth, out) => { for (const k of el.children) { const r = k.getBoundingClientRect(); if (r.width > 0) out.push({ d: depth, tag: k.tagName, cls: String(k.className).slice(0, 60), y: Math.round(r.y), h: Math.round(r.height), fs: getComputedStyle(k).fontSize, t: (k.children.length === 0 ? k.textContent.trim().slice(0, 26) : '') }); if (depth < 3) walk(k, depth + 1, out); } return out; };
  return card ? walk(card, 0, []).slice(0, 12) : null;
})()`), null, 1));

console.log("\n=== /payrollreports header ===");
await open("/payrollreports");
console.log(JSON.stringify(await evalOn("ref", `(() => {
  const h1 = [...document.querySelectorAll('h1')].filter(e => e.getBoundingClientRect().width > 0)[0];
  let n = h1, chain = [];
  while (n && n.tagName !== 'MAIN' && chain.length < 5) { chain.push({ tag: n.tagName, cls: String(n.className).slice(0, 90) }); n = n.parentElement; }
  const spans = [...document.querySelectorAll('span')].filter(s => { const r = s.getBoundingClientRect(); return r.width > 0 && r.y > 20 && r.y < 120 && r.x > 260; });
  const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('WhatsApp'));
  return { h1y: Math.round(h1.getBoundingClientRect().y), chain, spans: spans.slice(0, 3).map(s => ({ t: s.textContent.trim().slice(0, 24), y: Math.round(s.getBoundingClientRect().y), x: Math.round(s.getBoundingClientRect().x), w: Math.round(s.getBoundingClientRect().width) })), btnY: btn ? Math.round(btn.getBoundingClientRect().y) : null };
})()`), null, 1));

console.log("\n=== /requestreports header spacing ===");
await open("/requestreports");
console.log(JSON.stringify(await evalOn("ref", `(() => {
  const h1 = [...document.querySelectorAll('h1')].filter(e => e.getBoundingClientRect().width > 0)[0];
  const p = [...document.querySelectorAll('p')].find(e => e.textContent.includes('Analytics and reporting'));
  const r1 = h1.getBoundingClientRect(); const r2 = p.getBoundingClientRect();
  return { h1y: Math.round(r1.y), h1h: Math.round(r1.height), pY: Math.round(r2.y), gap: Math.round(r2.y - r1.y - r1.height), pCls: String(p.className).slice(0, 80) };
})()`)));

console.log("\n=== /tenantsetup card internals ===");
await open("/tenantsetup");
console.log(JSON.stringify(await evalOn("ref", `(() => {
  const card = document.querySelector('main .rounded-xl');
  const walk = (el, depth, out) => { for (const k of el.children) { const r = k.getBoundingClientRect(); if (r.width > 0) out.push({ d: depth, tag: k.tagName, cls: String(k.className).slice(0, 70), y: Math.round(r.y), h: Math.round(r.height), fs: getComputedStyle(k).fontSize, fw: getComputedStyle(k).fontWeight, t: (k.children.length === 0 ? k.textContent.trim().slice(0, 30) : '') }); if (depth < 3) walk(k, depth + 1, out); } return out; };
  return { cardY: Math.round(card.getBoundingClientRect().y), cardH: Math.round(card.getBoundingClientRect().height), tree: walk(card, 0, []).slice(0, 16) };
})()`), null, 1));

console.log("\n=== /careers REF lines detail ===");
await open("/careers");
console.log(JSON.stringify(await evalOn("ref", `(() => {
  const cards = [...document.querySelectorAll('main .rounded-xl')];
  const heroP = [...document.querySelectorAll('p')].find(p => p.textContent.includes('Explore opportunities'));
  const heroP2 = heroP ? heroP.getBoundingClientRect() : null;
  const firstCard = cards[0];
  return { heroPY: heroP2 ? Math.round(heroP2.y) : null, heroPH: heroP2 ? Math.round(heroP2.height) : null, cardCount: cards.length, firstCardY: firstCard ? Math.round(firstCard.getBoundingClientRect().y) : null, firstCardTxt: firstCard ? firstCard.textContent.trim().replace(/\\s+/g, ' ').slice(0, 60) : null, bodyLen: document.body.innerText.length };
})()`)));
