#!/usr/bin/env node
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }
const baseRef = "https://eon.base44.app";
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session ref open "${baseRef}/careers"`);
await new Promise(r => setTimeout(r, 4500));
const D = `(() => {
  const h1 = [...document.querySelectorAll('h1')].filter(e => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().y > 50)[0];
  const hero = h1 ? h1.closest('div') : null;
  const cards = [...document.querySelectorAll('main .rounded-xl')];
  const empty = cards[cards.length - 1];
  const ps = empty ? [...empty.querySelectorAll('p')].map(p => ({ t: p.textContent.trim().slice(0, 50), y: Math.round(p.getBoundingClientRect().y), fs: getComputedStyle(p).fontSize, col: getComputedStyle(p).color, fw: getComputedStyle(p).fontWeight })) : [];
  const h3 = empty ? empty.querySelector('h3') : null;
  const svg = empty ? empty.querySelector('svg') : null;
  return { h1: h1 ? { t: h1.textContent.trim(), y: Math.round(h1.getBoundingClientRect().y), fs: getComputedStyle(h1).fontSize, col: getComputedStyle(h1).color } : null, heroCls: hero ? String(hero.className).slice(0, 120) : null, heroH: hero ? Math.round(hero.getBoundingClientRect().height) : null, emptyCard: empty ? { y: Math.round(empty.getBoundingClientRect().y), w: Math.round(empty.getBoundingClientRect().width), h: Math.round(empty.getBoundingClientRect().height), cls: String(empty.className).slice(0, 100) } : null, h3: h3 ? { t: h3.textContent.trim(), fs: getComputedStyle(h3).fontSize, y: Math.round(h3.getBoundingClientRect().y) } : null, icon: svg ? { w: Math.round(svg.getBoundingClientRect().width), y: Math.round(svg.getBoundingClientRect().y), col: getComputedStyle(svg).color } : null, ps };
})()`;
console.log(JSON.stringify(await evalOn("ref", D), null, 1));
