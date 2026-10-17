#!/usr/bin/env node
// probe-r48-textverify.mjs — raw textContent verification of the
// suspected "space-in-template" diffs (the census/zone instruments JOIN
// child text nodes with ' ' — adjacent JSX text nodes produce phantom
// spaces). Reads the exact elements' raw textContent both sides.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 250) }; } }

const baseRef = "https://eon.base44.app", baseZero = "http://127.0.0.1:3201";

const CASES = [
  ["/shiftswap", "Peer Approval", "button"],
  ["/surveys", "0", "*"],
  ["/hrreports", "Data Table", "*"],
  ["/advancedanalytics", "Turnover", "*"],
  ["/securitysettings", "Two-Factor", "strong"],
  ["/analytics", "Completion", "*"],
];

for (const [route, needle, tag] of CASES) {
  const out = {};
  for (const [side, base] of [["ref", baseRef], ["loc0", baseZero]]) {
    run(`agent-browser --session ${side} open "${base}${route}"`);
    await new Promise(r => setTimeout(r, 2200));
    const sel = tag === "*" ? "*" : tag;
    const r = await evalOn(side, `(() => {
      const els = [...document.querySelectorAll('main ${sel}')];
      const el = els.find(e => (e.textContent || '').includes('${needle}'));
      if (!el) return null;
      const direct = [...el.childNodes].filter(n => n.nodeType === 3).map(n => JSON.stringify(n.textContent)).join(' + ');
      return { tag: el.tagName, textContent: JSON.stringify(el.textContent), childTextNodes: direct };
    })()`);
    out[side] = r;
  }
  console.log(`\n### ${route} [${needle}]`);
  console.log(`REF ${JSON.stringify(out.ref)}`);
  console.log(`LOC ${JSON.stringify(out.loc0)}`);
}
