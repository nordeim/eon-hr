#!/usr/bin/env node
// r85-keyboard-deep.mjs — the decisive probe on the focus-ring read:
// matches(':focus'/' :focus-visible'), the FULL untruncated box-shadow,
// --tw-ring-color, --ring, the class tail — on the login inputs/CTA and
// the dashboard nav, both sides. (The r85 lesson: never truncate the
// box-shadow string — the leading transparent --tw-inset-* slots once
// produced a false "transparent ring" alarm in the recon phase.)
import { execSync } from "node:child_process";
function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const txt = out.trim(); try { return JSON.parse(txt); } catch {} try { return JSON.parse(txt.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

const PROBE = `(() => {
  const el = document.activeElement;
  if (!el || el === document.body) return { stop: 'BODY' };
  const cs = getComputedStyle(el);
  return {
    tag: el.tagName, type: el.getAttribute('type'),
    text: (el.textContent || '').trim().slice(0, 18),
    matchesFocus: el.matches(':focus'),
    matchesFocusVisible: el.matches(':focus-visible'),
    outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, outlineColor: cs.outlineColor,
    boxShadowFull: cs.boxShadow, // FULL — never truncated (the r85 lesson)
    ringColorVar: cs.getPropertyValue('--tw-ring-color').trim(),
    ringToken: cs.getPropertyValue('--ring').trim(),
    colorScheme: getComputedStyle(document.documentElement).colorScheme
  };
})()`;

for (const [session, base, side] of [["r85dref", baseRef, "REF"], ["r85dloc", baseLoc, "LOC"]]) {
  run(`agent-browser --session ${session} close 2>/dev/null; true`);
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
  console.log(`\n===== ${side} /login: 4 Tabs -> the email input =====`);
  for (let i = 0; i < 4; i++) { run(`agent-browser --session ${session} press Tab`); await new Promise(r => setTimeout(r, 280)); }
  console.log(JSON.stringify(await evalOn(session, PROBE), null, 1));
  console.log(`\n===== ${side}: 2 more Tabs -> the Sign-in button =====`);
  for (let i = 0; i < 2; i++) { run(`agent-browser --session ${session} press Tab`); await new Promise(r => setTimeout(r, 280)); }
  console.log(JSON.stringify(await evalOn(session, PROBE), null, 1));
  run(`agent-browser --session ${session} close 2>/dev/null; true`);
}

// the dashboard nav link (the blue-500 ring on the REF)
for (const [session, side] of [["ref", "REF"], ["loc", "LOC"]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${session === "ref" ? baseRef : baseLoc}/dashboard`);
  await new Promise(r => setTimeout(r, 3200));
  console.log(`\n===== ${side} /dashboard: 1 Tab -> the Dashboard nav link =====`);
  run(`agent-browser --session ${session} press Tab`);
  await new Promise(r => setTimeout(r, 300));
  console.log(JSON.stringify(await evalOn(session, PROBE), null, 1));
}
console.log("\nDEEP PROBE COMPLETE");
process.exit(0);
