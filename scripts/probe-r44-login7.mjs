#!/usr/bin/env node
// probe-r44-login7.mjs — session-45 / parity round 44: the FULL svg glyph
// sweep on the login — every <svg>'s innerHTML compared (catches lucide
// version drift like the Mail icon's rect/path order + flap variant).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim()); } catch { try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 400) }; } } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
}

const SWEEP = `(() => [...document.querySelectorAll('svg')].map((v, i) => ({ i, cls: (v.getAttribute('class')||'').slice(0,60), vb: v.getAttribute('viewBox'), inner: v.innerHTML.replace(/\\s+/g,' ').trim().slice(0, 220) })))()`;
const refSvgs = await evalOn("ref", SWEEP), locSvgs = await evalOn("loc", SWEEP);
console.log(`ref svgs: ${refSvgs.length} · loc svgs: ${locSvgs.length}`);
let match = 0, diff = 0;
for (let i = 0; i < Math.max(refSvgs.length, locSvgs.length); i++) {
  const a = refSvgs[i], b = locSvgs[i];
  if (!a || !b) { console.log(`#${i} MISSING on ${a ? "loc" : "ref"}`); diff++; continue; }
  if (a.inner === b.inner) { match++; continue; }
  diff++;
  console.log(`#${i} GLYPH DIFF  cls="${a.cls.slice(0,40)}"`);
  console.log(`  ref: ${a.inner.slice(0, 190)}`);
  console.log(`  loc: ${b.inner.slice(0, 190)}`);
}
console.log(`\n${match} svgs glyph-identical · ${diff} diffs`);
