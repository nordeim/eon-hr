#!/usr/bin/env node
// probe-r20-activecss.mjs — enumerate :active rules in BOTH apps' stylesheets
// to target the pressed-state audit. Also counts hover-media wrappers.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }

const PROBE = `(() => {
  const out = { sheets: 0, rules: [], hoverWrapped: 0 };
  function scan(rules, wrap) {
    for (const r of rules) {
      if (r.selectorText && r.selectorText.includes(':active')) {
        out.rules.push({ sel: r.selectorText.slice(0, 120), css: r.style.cssText.slice(0, 140), wrapped: !!wrap });
      } else if (r.cssRules && r.cssRules.length) {
        const isHover = r.media && /hover:\\s*hover/.test(r.media.mediaText);
        if (isHover) out.hoverWrapped += r.cssRules.length;
        scan(r.cssRules, wrap || isHover);
      }
    }
  }
  for (const ss of document.styleSheets) { try { out.sheets++; scan(ss.cssRules, false); } catch(e){} }
  return JSON.stringify(out);
})()`;

async function measure(session, url) {
  run(`agent-browser --session ${session} open "${url}"`);
  await new Promise(r => setTimeout(r, 3000));
  const oneLine = PROBE.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); }
  catch { return { error: out.slice(0, 300) }; }
}

for (const [name, url] of [["REF", "https://eon.base44.app/dashboard"], ["LOC", "http://127.0.0.1:3200/dashboard"]]) {
  const r = await measure(name.toLowerCase(), url);
  console.log(`\n===== ${name} (${r.sheets} sheets, ${r.hoverWrapped} hover-wrapped rules) =====`);
  if (r.error) { console.log("ERR", r.error); continue; }
  for (const rule of r.rules) console.log(`${rule.wrapped ? "[in-hover-media]" : "[bare]        "} ${rule.sel}  =>  ${rule.css}`);
  console.log(`total :active rules: ${r.rules.length}`);
}
