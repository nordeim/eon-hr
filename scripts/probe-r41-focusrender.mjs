#!/usr/bin/env node
// probe-r41-focusrender.mjs — capture the keyboard-focus rendering of the
// four footer controls (bell / moon / عربي / user trigger) on both apps:
// outline style/width/color + boxShadow + authored focus classes.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const raw = out.trim(); try { return JSON.parse(raw); } catch { try { return JSON.parse(`"${raw.replace(/^"|"$/g, "").replace(/"/g, '\\"')}"`); } catch { return { error: raw.slice(0, 300) }; } } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

const FOCUS_READ = `(() => {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return { tag: el.tagName, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
    oStyle: cs.outlineStyle, oWidth: cs.outlineWidth, oColor: cs.outlineColor, oOffset: cs.outlineOffset,
    shadow: cs.boxShadow === 'none' ? 'none' : cs.boxShadow.slice(0, 140),
    hasFVClass: /focus-visible/.test(el.className) };
})()`;

async function probe(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 3000));
  // blur everything, then Tab until the footer cluster (y>780) — collect
  // every focused element's rendering until we leave the footer.
  await evalOn(session, `document.activeElement && document.activeElement.blur(); 'ok'`);
  const found = [];
  for (let i = 0; i < 24; i++) {
    run(`agent-browser --session ${session} press Tab`);
    await new Promise(r => setTimeout(r, 200));
    const read = await evalOn(session, FOCUS_READ);
    if (!read) continue;
    if (read.y > 780 && read.x < 300) found.push(read); // footer cluster
    if (read.y > 780 && read.w > 200) break;            // user trigger = last
  }
  return found;
}

const ref = await probe("ref", baseRef);
const loc = await probe("loc", baseLoc);
console.log("REF footer focus walk:");
for (const f of ref) console.log("  " + JSON.stringify(f));
console.log("LOC footer focus walk:");
for (const f of loc) console.log("  " + JSON.stringify(f));
