#!/usr/bin/env node
// r87-crossdiff-triage.mjs — session-87: classify the 39 STRUCTURAL
// clusters from the full-registry cross-side pixel-diff pass. For each
// route: (a) both sides' visible-text digest (the data-driven classifier —
// the REF's progressively-emptied tenant + role-restricted views render
// empty/restricted states vs the LOC's seeded content), (b) the
// elementFromPoint chain at the biggest-cluster center (the structural
// classifier — same visible content but different element identity =
// clone-authored). Parses the diff output for cluster bboxes.
// Usage: node scripts/r87-crossdiff-triage.mjs
import { execSync } from "node:child_process";
import fs from "node:fs";
function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const DIFF = fs.readFileSync("/tmp/r87-diff-full.txt", "utf8");
const CASES = [];
for (const m of DIFF.matchAll(/^([a-z]+): cells=(\d+) clusters=\d+ maxdelta=(\d+) biggest_cluster_bbox=\((\d+), (\d+), (\d+), (\d+)\) -> STRUCTURAL/gm)) {
  const [, route, cells, maxd, x0, y0, x1, y1] = m;
  CASES.push({ route, cells: +cells, maxd: +maxd, cx: Math.round((+x0 + +x1) / 2), cy: Math.round((+y0 + +y1) / 2) });
}
console.log(`triaging ${CASES.length} STRUCTURAL routes`);

const digest = `(() => {
  const main = document.querySelector('main') || document.body;
  const txt = (main.innerText || '').replace(/\\s+/g, ' ').trim();
  const h1 = document.querySelector('h1');
  return { title: h1 ? h1.textContent.trim() : null, len: txt.length, head: txt.slice(0, 180) };
})()`;

const probe = (x, y) => `(() => {
  const el = document.elementFromPoint(${x}, ${y});
  if (!el) return null;
  const describe = (e) => {
    if (!e) return null;
    const r = e.getBoundingClientRect();
    const cs = getComputedStyle(e);
    return { tag: e.tagName.toLowerCase(), cls: (e.className && typeof e.className === 'string' ? e.className : '').split(/\\s+/).slice(0, 6).join('.'), text: (e.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 50), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), fs: cs.fontSize, fw: cs.fontWeight, color: cs.color, bg: cs.backgroundColor };
  };
  let node = el;
  const chain = [describe(el)];
  for (let i = 0; i < 2 && node.parentElement; i++) { node = node.parentElement; chain.push(describe(node)); }
  return chain;
})()`;

for (const c of CASES) {
  run(`agent-browser --session ref87x open https://eon.base44.app/${c.route}`);
  run(`agent-browser --session loc87x open http://127.0.0.1:3200/${c.route}`);
  await new Promise(r => setTimeout(r, 3200));
  const rd = await evalOn("ref87x", digest);
  const ld = await evalOn("loc87x", digest);
  console.log(`\n########## ${c.route} (cells=${c.cells} maxd=${c.maxd} @${c.cx},${c.cy})`);
  console.log("  REF digest:", JSON.stringify(rd).slice(0, 260));
  console.log("  LOC digest:", JSON.stringify(ld).slice(0, 260));
  if (JSON.stringify(rd && rd.head) !== JSON.stringify(ld && ld.head)) {
    const rp = await evalOn("ref87x", probe(c.cx, c.cy));
    const lp = await evalOn("loc87x", probe(c.cx, c.cy));
    console.log(`  --- probe @(${c.cx},${c.cy})`);
    console.log("   REF:", JSON.stringify(Array.isArray(rp) ? rp.slice(0, 2) : rp).slice(0, 380));
    console.log("   LOC:", JSON.stringify(Array.isArray(lp) ? lp.slice(0, 2) : lp).slice(0, 380));
  } else {
    console.log("  (digests MATCH — probing anyway)");
    const rp = await evalOn("ref87x", probe(c.cx, c.cy));
    const lp = await evalOn("loc87x", probe(c.cx, c.cy));
    console.log(`  --- probe @(${c.cx},${c.cy})`);
    console.log("   REF:", JSON.stringify(Array.isArray(rp) ? rp.slice(0, 2) : rp).slice(0, 380));
    console.log("   LOC:", JSON.stringify(Array.isArray(lp) ? lp.slice(0, 2) : lp).slice(0, 380));
  }
}
process.exit(0);
