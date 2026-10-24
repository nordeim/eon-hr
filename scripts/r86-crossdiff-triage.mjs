#!/usr/bin/env node
// r86-crossdiff-triage.mjs — session-86: classify the cross-side at-rest
// pixel-diff clusters (the fresh-eyes instrument's findings): for each
// cluster bbox, read document.elementFromPoint on BOTH sides to identify
// WHAT element differs — separating DATA-driven deltas (the REF's
// progressively-emptied tenant vs the seeded LOC — legitimate, the
// standing role-parity note) from STYLE/GEOMETRY deltas (potential
// clone-authored parity defects).
// Cluster bboxes from r86-crossdiff-diff.py's first pass (biggest clusters).
import { execSync } from "node:child_process";
function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const probe = (x, y) => `(() => {
  const el = document.elementFromPoint(${x}, ${y});
  if (!el) return null;
  const describe = (e) => {
    if (!e) return null;
    const r = e.getBoundingClientRect();
    const cs = getComputedStyle(e);
    return { tag: e.tagName.toLowerCase(), id: e.id || undefined, cls: (e.className && typeof e.className === 'string' ? e.className : '').split(/\\s+/).slice(0, 6).join('.'), text: (e.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 60), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), fs: cs.fontSize, fw: cs.fontWeight, color: cs.color, bg: cs.backgroundColor };
  };
  let node = el;
  const chain = [describe(el)];
  for (let i = 0; i < 3 && node.parentElement; i++) { node = node.parentElement; chain.push(describe(node)); }
  return chain;
})()`;

// cluster probe points: the biggest-cluster center per route (from the
// first diff pass) + the secondary clusters where noted
const CASES = [
  ["dashboard", [[24, 456]]],
  ["payroll", [[1272, 480]]],
  ["employees", [[456, 288], [240, 288], [600, 336]]],
  ["attendance", [[864, 648], [400, 648], [1300, 700]]],
  ["training", [[864, 432]]],
  ["recruitment", [[408, 408], [360, 240], [500, 460]]],
  ["settings", [[384, 216], [336, 456]]],
  ["assetmanagement", [[1320, 408]]],
  ["payrollreports", [[800, 300], [400, 100], [600, 550], [1000, 150]]],
];

for (const [route, points] of CASES) {
  console.log(`\n########## ${route} ##########`);
  // navigate both sessions to the route first (at-rest, settled)
  run(`agent-browser --session ref86x open https://eon.base44.app/${route}`);
  run(`agent-browser --session loc86x open http://127.0.0.1:3200/${route}`);
  await new Promise(r => setTimeout(r, 3500));
  for (const [x, y] of points) {
    const ref = await evalOn("ref86x", probe(x, y));
    const loc = await evalOn("loc86x", probe(x, y));
    console.log(`--- @(${x},${y})`);
    console.log("  REF:", JSON.stringify(Array.isArray(ref) ? ref.slice(0, 2) : ref).slice(0, 420));
    console.log("  LOC:", JSON.stringify(Array.isArray(loc) ? loc.slice(0, 2) : loc).slice(0, 420));
  }
}
process.exit(0);
