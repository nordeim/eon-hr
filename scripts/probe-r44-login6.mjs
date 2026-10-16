#!/usr/bin/env node
// probe-r44-login6.mjs — session-45 / parity round 44: the tree pair with
// the DOCUMENTED authored-form differences normalized away (the round-43
// convention: text-card-foreground→hex, the v3 gradient syntax→sRGB
// arbitrary, lab/rgba + transparent-zeros serializations) so only NOVEL
// diffs surface.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 400) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
}

const TREE = `(() => { const card = document.querySelector('main form')?.closest('div.rounded-2xl') || document.querySelector('.rounded-2xl'); const out = []; const walk = (el, d) => { const r = el.getBoundingClientRect(); const cls = (el.className && typeof el.className === 'string') ? el.className : ''; out.push({ d, t: el.tagName.toLowerCase(), c: cls.split(/\\s+/).filter(Boolean).sort().join(' '), w: Math.round(r.width), h: Math.round(r.height) }); for (const ch of [...el.children]) walk(ch, d+1); }; walk(card, 0); return out; })()`;
const refTree = await evalOn("ref", TREE), locTree = await evalOn("loc", TREE);

// normalize: map the documented REF↔LOC authored-form equivalents
const EQUIV = [
  [/^text-card-foreground$/, "#09090b:token"],
  [/^text-\[#09090b\]$/, "#09090b:token"],
  [/^bg-gradient-to-r$/, "gradient:top-bar"],
  [/^from-slate-200$/, "gradstop:e2e8f0"],
  [/^via-slate-300$/, "gradstop:cbd5e1"],
  [/^to-slate-200$/, "gradstop:e2e8f0"],
  [/^bg-\[linear-gradient\(to_right,#e2e8f0,#cbd5e1,#e2e8f0\)\]$/, "gradient:top-bar"],
  [/^bg-gradient-to-br$/, "gradient:glow"],
  [/^to-slate-300$/, "gradstop:cbd5e1:glow"],
  [/^bg-\[linear-gradient\(to_bottom_right,#e2e8f0,#cbd5e1\)\]$/, "gradient:glow"],
];
const norm = (cls) => { for (const [re, tag] of EQUIV) if (re.test(cls)) return tag; return cls; };
const stripAuto = (n) => n; // autocomplete attrs not in class strings

let novel = 0, checked = 0;
const len = Math.max(refTree.length, locTree.length);
for (let i = 0; i < len; i++) {
  const a = refTree[i], b = locTree[i]; checked++;
  if (!a || !b) { console.log(`NOVEL node#${i}: missing on ${a ? "loc" : "ref"}:`, JSON.stringify(a || b).slice(0,200)); novel++; continue; }
  const aSet = a.c.split(" ").map(norm).join(" ");
  const bSet = b.c.split(" ").map(norm).join(" ");
  if (a.t !== b.t || a.w !== b.w || a.h !== b.h || aSet !== bSet) {
    console.log(`NOVEL node#${i} d${a.d} <${a.t} w${a.w} h${a.h}>`);
    console.log(`  ref: ${aSet.slice(0, 320)}`);
    console.log(`  loc: ${bSet.slice(0, 320)}`);
    novel++;
  }
}
console.log(`\n${checked} nodes compared · ${novel} NOVEL diffs (documented pins normalized)`);
