#!/usr/bin/env node
// r82-boundary-detail.mjs — session 82 / parity round 81: the detail reads
// classifying the boundary-matrix FINDs. Three FIND classes at the sm/xl
// edges: (1) /employees renders an extra LOC grid the REF lacks at BOTH
// 640 and 1280; (2) /attendance carries an extra LOC grid (`grid gap-4
// lg:grid-cols-2`) + a mainRect delta at 1280; (3) /careers renders a REF
// grid the LOC lacks (the r80-known empty-board case). Each gets the
// same-author classification: read the full DOM structure around the
// divergence (tables vs grids, card vs list, the records section) on both
// sides before any remediation decision.
import { execSync } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const b64 = Buffer.from(expr, "utf8").toString("base64"); const out = run(`agent-browser --session ${session} eval -b ${b64}`); const t = out.trim(); try { return JSON.parse(t); } catch { try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } } }

const BASES = { ref: "https://eon.base44.app", loc: "http://127.0.0.1:3200" };

// The structural census: tables, grids, lists + the section headings — what
// each side's main content is BUILT from (independent of data count).
const STRUCT = `(() => {
  const main = document.querySelector('main') || document.body;
  const tables = [...main.querySelectorAll('table')].map(t => ({
    rows: t.querySelectorAll('tbody tr').length,
    cls: (t.closest('[class]') && t.closest('[class]').className || '').replace(/\\s+/g, ' ').trim().slice(0, 60)
  }));
  const grids = [...main.querySelectorAll('[class*=grid-cols]')].filter(el => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).display === 'grid';
  }).map(el => ({
    cols: getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length,
    children: el.children.length,
    cls: (el.className || '').replace(/\\s+/g, ' ').trim().slice(0, 80)
  }));
  const headings = [...main.querySelectorAll('h2, h3')].map(h => (h.textContent || '').trim().slice(0, 50)).filter(Boolean).slice(0, 12);
  const cardCount = main.querySelectorAll('[class*=card], [class*=Card]').length;
  return { tables, grids, headings, cardCount };
})()`;

async function readStruct(side, route, w) {
  run(`agent-browser --session ${side} set viewport ${w} 1024`);
  run(`agent-browser --session ${side} open ${BASES[side]}${route}`);
  await new Promise(r => setTimeout(r, 800));
  run(`agent-browser --session ${side} set viewport ${w} 1024`);
  await new Promise(r => setTimeout(r, 2600));
  return await evalOn(side, STRUCT);
}

for (const route of ["/employees", "/attendance", "/careers"]) {
  for (const w of [1280]) {
    const ref = await readStruct("ref", route, w);
    const loc = await readStruct("loc", route, w);
    console.log(`\n===== ${route} @${w} STRUCTURE =====`);
    console.log("REF:", JSON.stringify(ref, null, 1));
    console.log("LOC:", JSON.stringify(loc, null, 1));
  }
}

// The attendance mainRect detail at 1280 (the matrix FIND)
run(`agent-browser --session ref set viewport 1280 1024`);
run(`agent-browser --session ref open ${BASES.ref}/attendance`);
await new Promise(r => setTimeout(r, 800));
run(`agent-browser --session ref set viewport 1280 1024`);
await new Promise(r => setTimeout(r, 2600));
const refGeo = await evalOn("ref", `(() => {
  const main = document.querySelector('main');
  const r = main ? main.getBoundingClientRect() : null;
  return { main: r ? { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } : null, scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth };
})()`);
run(`agent-browser --session loc set viewport 1280 1024`);
run(`agent-browser --session loc open ${BASES.loc}/attendance`);
await new Promise(r => setTimeout(r, 800));
run(`agent-browser --session loc set viewport 1280 1024`);
await new Promise(r => setTimeout(r, 2600));
const locGeo = await evalOn("loc", `(() => {
  const main = document.querySelector('main');
  const r = main ? main.getBoundingClientRect() : null;
  return { main: r ? { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } : null, scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth };
})()`);
console.log("\n===== /attendance @1280 GEOMETRY =====");
console.log("REF:", JSON.stringify(refGeo));
console.log("LOC:", JSON.stringify(locGeo));
process.exit(0);
