#!/usr/bin/env node
// verify-r26b.mjs — session-27: the dropdown + drawer animation duration
// reads under reduce vs default (the take-2 group transition + unmount
// contract already verified; this closes the dropdown surface).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const DROPDOWN = `(() => { const c = document.querySelector('[role=menu]'); return JSON.stringify({ anim: c ? getComputedStyle(c).animationDuration : null, name: c ? getComputedStyle(c).animationName : null }); })()`;

async function readDropdown(session, base, label) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 3500));
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const m = snap.match(/- button "sepnetflix2023[^\"]*" \[[^\]]*ref=(\w+)/);
  if (!m) { console.log(`${label}: user trigger not found`); return; }
  run(`agent-browser --session ${session} click @${m[1]}`);
  await new Promise(r => setTimeout(r, 1100));
  const d = await evalOn(session, DROPDOWN);
  console.log(`${label}: ${JSON.stringify(d)}`);
  run(`agent-browser --session ${session} press Escape`);
  await new Promise(r => setTimeout(r, 500));
}

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
run("agent-browser --session ref set media reduced-motion");
run("agent-browser --session loc set media reduced-motion");
await readDropdown("ref", baseRef, "REF reduce   ");
await readDropdown("loc", baseLoc, "LOC reduce   ");
run("agent-browser --session ref set media");
run("agent-browser --session loc set media");
await readDropdown("loc", baseLoc, "LOC default  ");
await readDropdown("ref", baseRef, "REF default  ");
