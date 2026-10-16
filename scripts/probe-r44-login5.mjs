#!/usr/bin/env node
// probe-r44-login5.mjs — session-45 / parity round 44: the full card DOM
// tree pair as ARRAYS (the joined-string parse trap), with class strings
// compared as SORTED SETS (the tw-merge convention) + raw for reference.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 400) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const results = [];
function rec(name, a, b) { const match = JSON.stringify(a) === JSON.stringify(b); results.push({ name, match }); console.log(`${match ? "MATCH" : "DIFF "} ${name}`); if (!match) { console.log(`  ref: ${JSON.stringify(a).slice(0, 900)}`); console.log(`  loc: ${JSON.stringify(b).slice(0, 900)}`); } }

for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
}

// the tree as an array of {depth, tag, clsSet, w, h} — sets for the tw-merge convention
const TREE = `(() => { const card = document.querySelector('main form')?.closest('div.rounded-2xl') || document.querySelector('.rounded-2xl'); const out = []; const walk = (el, d) => { const r = el.getBoundingClientRect(); const cls = (el.className && typeof el.className === 'string') ? el.className : ''; out.push({ d, t: el.tagName.toLowerCase(), c: cls.split(/\\s+/).filter(Boolean).sort().join(' '), w: Math.round(r.width), h: Math.round(r.height) }); for (const ch of [...el.children]) walk(ch, d+1); }; walk(card, 0); return out; })()`;
const refTree = await evalOn("ref", TREE), locTree = await evalOn("loc", TREE);
rec("card DOM tree (sorted sets + geometry)", refTree, locTree);

const sum = results.filter(r => r.match).length;
console.log(`\n${sum}/${results.length} MATCH`);
