#!/usr/bin/env node
// probe-r31-assets-full.mjs — REF /assets full structural census: page root
// classes (canvas), card tree (border/header/content), mobile kicker.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

run("agent-browser --session ref set viewport 1440 900");
run("agent-browser --session ref open https://eon.base44.app/assets");
await new Promise(r => setTimeout(r, 3500));

const ROOT = `(() => {
  const main = document.querySelector('main');
  const pageRoot = main ? main.firstElementChild : null;
  const cs = pageRoot ? getComputedStyle(pageRoot) : null;
  const card = document.querySelector('main .rounded-xl');
  const cardCs = card ? getComputedStyle(card) : null;
  const cardR = card ? card.getBoundingClientRect() : null;
  const hdr = card ? card.firstElementChild : null;
  const body = card ? card.lastElementChild : null;
  const desc = (el) => el ? { cls: el.className.toString().slice(0,90), y: Math.round(el.getBoundingClientRect().y), h: Math.round(el.getBoundingClientRect().height) } : null;
  return JSON.stringify({
    pageRootCls: pageRoot ? pageRoot.className.toString().slice(0,110) : null,
    pageRootBg: cs ? cs.backgroundImage.slice(0,90) : null,
    card: card ? { cls: card.className.toString().slice(0,90), br: cardCs.borderRightWidth + '/' + cardCs.borderRightColor, x: Math.round(cardR.x), y: Math.round(cardR.y), w: Math.round(cardR.width), h: Math.round(cardR.height) } : null,
    hdr: desc(hdr), body: desc(body)
  });
})()`;
console.log("DESKTOP ROOT+CARD:", JSON.stringify(await evalOn("ref", ROOT)));

run("agent-browser --session ref set viewport 390 844");
run("agent-browser --session ref open https://eon.base44.app/assets");
await new Promise(r => setTimeout(r, 3500));
const MOB = `(() => {
  const main = document.querySelector('main');
  const out = [];
  const walk = (el, d) => {
    for (const c of el.children) {
      const r = c.getBoundingClientRect();
      if (r.width === 0) continue;
      const cs = getComputedStyle(c);
      const own = [...c.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim();
      out.push({ d, tag: c.tagName, t: own.slice(0,30) || undefined, cls: c.className.toString().slice(0,60), y: Math.round(r.y), x: Math.round(r.x), w: Math.round(r.width), fs: cs.fontSize, fw: cs.fontWeight });
      if (d < 4) walk(c, d + 1);
    }
  };
  walk(main || document.body, 0);
  return JSON.stringify(out.slice(0, 16));
})()`;
console.log("\nMOBILE TREE:", JSON.stringify(await evalOn("ref", MOB)).replace(/\},\{/g, '}\n{'));
