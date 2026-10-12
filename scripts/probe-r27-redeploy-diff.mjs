#!/usr/bin/env node
// probe-r27-redeploy-diff.mjs — investigate the /payroll and /profile DIFFs
// from the r27 redeploy check: h1 y-offset on payroll, h1 x-offset on profile.
// Reads the full header block geometry on both apps with long settling.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

// Full header census: the h1's parent chain geometry + the badge if any.
const READER = `(() => {
  const h = [...document.querySelectorAll('h1')].find(h => h.offsetParent !== null);
  if (!h) return JSON.stringify({found:false});
  const out = { t: h.textContent.trim().slice(0,30), tag: h.tagName };
  const cs = getComputedStyle(h); const r = h.getBoundingClientRect();
  out.h1 = { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), fs: cs.fontSize, fw: cs.fontWeight, mt: cs.marginTop, mb: cs.marginBottom };
  // walk up 4 levels
  let el = h; out.chain = [];
  for (let i = 0; i < 4 && el.parentElement; i++) {
    el = el.parentElement;
    const pr = el.getBoundingClientRect();
    const pcs = getComputedStyle(el);
    out.chain.push({ tag: el.tagName, cls: (el.className.baseVal || el.className || '').toString().slice(0,90), x: Math.round(pr.x), y: Math.round(pr.y), w: Math.round(pr.width), display: pcs.display, items: pcs.alignItems, pt: pcs.paddingTop, mt: pcs.marginTop, gap: pcs.gap });
  }
  // the preceding sibling of the h1's row (badge?)
  const row = h.parentElement;
  if (row) {
    const sibs = [...row.children].map(c => { const cr = c.getBoundingClientRect(); return { tag: c.tagName, cls: (c.className.baseVal || c.className || '').toString().slice(0,60), x: Math.round(cr.x), y: Math.round(cr.y), w: Math.round(cr.width), h: Math.round(cr.height) }; });
    out.rowChildren = sibs;
  }
  // any badge div before the h1 in the page?
  const pageHeader = h.closest('div');
  return JSON.stringify(out);
})()`;

for (const route of ["/payroll", "/profile"]) {
  console.log(`\n===== ${route} =====`);
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  await new Promise(r => setTimeout(r, 5000));
  const ref = await evalOn("ref", READER);
  run(`agent-browser --session loc open "${baseLoc}${route}"`);
  await new Promise(r => setTimeout(r, 4000));
  const loc = await evalOn("loc", READER);
  console.log("REF: " + JSON.stringify(ref, null, 1));
  console.log("LOC: " + JSON.stringify(loc, null, 1));
}
