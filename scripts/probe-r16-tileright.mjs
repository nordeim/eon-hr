#!/usr/bin/env node
// probe-r16-tileright.mjs — dump the tile-right StatCard interior structure
// on REF vs LOC at 768 to see how REF contains the 48px tile in a 94px card.
import { execSync } from "node:child_process";

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString();
  } catch (e) {
    return "ERR:" + String(e).slice(0, 100);
  }
}

const PROBE = `(() => {
  const out = {};
  const grid = document.querySelector("main .grid");
  if (!grid) return JSON.stringify({ err: "no grid" });
  const card = grid.children[3];
  const lines = [];
  const walk = (el, d) => {
    if (!el || d > 5) return;
    if (["SCRIPT","STYLE"].includes(el.tagName)) return;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    lines.push({ d, tag: el.tagName.toLowerCase(), cls: String(el.className).slice(0, 42), x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height), minW: cs.minWidth, ow: cs.overflow, t: (el.textContent || "").trim().slice(0, 18) });
    [...el.children].forEach(c => walk(c, d + 1));
  };
  walk(card, 0);
  out.card = lines;
  out.docW = document.documentElement.scrollWidth;
  return JSON.stringify(out);
})()`;

async function probe(session, base) {
  run(`agent-browser --session ${session} set viewport 768 844`);
  run(`agent-browser --session ${session} open "${base}/analytics"`);
  await new Promise(r => setTimeout(r, 2200));
  const oneLine = PROBE.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try {
    return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"'));
  } catch {
    return { card: [], parseErr: out.slice(0, 80) };
  }
}

const ref = await probe("ref", "https://eon.base44.app");
const loc = await probe("loc", "http://127.0.0.1:3200");
console.log(`REF (docW=${ref.docW}):`);
(ref.card || []).forEach(l => console.log(`${"  ".repeat(l.d)}${l.tag} x=${l.x} ${l.w}x${l.h} minW=${l.minW} "${l.t}"`));
console.log(`\nLOC (docW=${loc.docW}):`);
(loc.card || []).forEach(l => console.log(`${"  ".repeat(l.d)}${l.tag} x=${l.x} ${l.w}x${l.h} minW=${l.minW} "${l.t}"`));
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session loc set viewport 1440 900`);
