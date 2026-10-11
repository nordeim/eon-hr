#!/usr/bin/env node
// probe-r16-hrreports-y.mjs — why does LOC's hrreports h1 sit at y=28 vs
// REF y=24 at 900/1024 (both y=24 at 1440)? Dump the h1's ancestor chain
// with offsets at 1024 on both sides.
import { execSync } from "node:child_process";

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString();
  } catch (e) {
    return "ERR:" + String(e).slice(0, 100);
  }
}

const PROBE = `(() => {
  const h1 = [...document.querySelectorAll("h1")].find(h => h.offsetParent !== null);
  if (!h1) return JSON.stringify({});
  const chain = [];
  let el = h1;
  for (let i = 0; i < 6 && el; i++) {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    chain.push({ tag: el.tagName.toLowerCase(), cls: String(el.className).slice(0, 46), y: Math.round(r.y), h: Math.round(r.height), mt: cs.marginTop, pt: cs.paddingTop, bt: cs.borderTopWidth });
    el = el.parentElement;
  }
  return JSON.stringify({ chain });
})()`;

async function probe(session, base, vp) {
  run(`agent-browser --session ${session} set viewport ${vp} 844`);
  run(`agent-browser --session ${session} open "${base}/hrreports"`);
  await new Promise(r => setTimeout(r, 2200));
  const oneLine = PROBE.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try {
    return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"'));
  } catch {
    return { chain: [] };
  }
}

for (const vp of [1024, 1440]) {
  const ref = await probe("ref", "https://eon.base44.app", vp);
  const loc = await probe("loc", "http://127.0.0.1:3200", vp);
  console.log(`\n== hrreports @${vp} ==`);
  console.log("REF chain:");
  (ref.chain || []).forEach(c => console.log(`  ${c.tag}.${c.cls.slice(0, 34)} y=${c.y} h=${c.h} mt=${c.mt} pt=${c.pt} bt=${c.bt}`));
  console.log("LOC chain:");
  (loc.chain || []).forEach(c => console.log(`  ${c.tag}.${c.cls.slice(0, 34)} y=${c.y} h=${c.h} mt=${c.mt} pt=${c.pt} bt=${c.bt}`));
}
