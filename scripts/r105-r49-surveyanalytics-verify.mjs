#!/usr/bin/env node
// r105-r49-surveyanalytics-verify.mjs — the definitive surveyanalytics
// cross-side svg census at VERIFIED 1440x900 viewports (the r49 ladder's
// stats-surveyanalytics DIFF was the REFRESH-SESSION VIEWPORT DRIFT class —
// the ref session relaunched at 1280 mid-ladder and every container read
// 160px narrower; the verified-viewport re-read must be identical).
import { execSync } from "node:child_process";

function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }

const READ = `(() => { return JSON.stringify({vp: window.innerWidth, svgs: [...document.querySelectorAll('svg')].filter(x => (x.getAttribute('class')||'').match(/recharts-surface|lucide-download/)).map(x => { const r = x.getBoundingClientRect(); return (x.getAttribute('class')||'') + '||' + Math.round(r.width) + 'x' + Math.round(r.height); })}); })()`;

async function readSide(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  await new Promise((r) => setTimeout(r, 800));
  run(`agent-browser --session ${session} open ${base}/surveyanalytics`);
  await new Promise((r) => setTimeout(r, 8000));
  run(`agent-browser --session ${session} set viewport 1440 900`); // the VERIFIED-VIEWPORT guard
  await new Promise((r) => setTimeout(r, 1500));
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(READ)}`);
  try {
    return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " "));
  } catch {
    return { error: out.slice(0, 300) };
  }
}

const ref = await readSide("ref", "https://eon.base44.app");
const loc = await readSide("loc0", "http://127.0.0.1:3201");
console.log("REF vp:", ref.vp, "svgs:", JSON.stringify(ref.svgs));
console.log("LOC vp:", loc.vp, "svgs:", JSON.stringify(loc.svgs));
console.log(ref.error || loc.error ? "READ ERROR — retry" : ref.svgs.join("|") === loc.svgs.join("|") ? "IDENTICAL — the ladder DIFF was the viewport drift" : "REAL DIFF — audit member by member");
