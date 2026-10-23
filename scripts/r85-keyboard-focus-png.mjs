#!/usr/bin/env node
// r85-keyboard-focus-png.mjs — the focused-state screenshot pair: the
// program's FIRST cross-side focused-state pixel comparison (1 Tab →
// the Google social button, the ring settled, both sides captured and
// diffed via scripts/r85-focus-png-diff.py). Pre-fix the diff read 515
// cells (the ring edges + the missing badge); post-fix 6 AA-noise cells.
import { execSync } from "node:child_process";
function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(expr.split("\n").join(" "))}`); const t = out.trim(); try { return JSON.parse(t); } catch { try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 400) }; } } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const shots = "/home/z/my-project/eon-hr/docs/screenshots";

for (const [session, base, tag] of [["r85pref", baseRef, "ref"], ["r85ploc", baseLoc, "loc"]]) {
  run(`agent-browser --session ${session} close 2>/dev/null; true`);
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
  run(`agent-browser --session ${session} press Tab`);
  await new Promise(r => setTimeout(r, 500));
  const focusRead = await evalOn(session, `(() => ({ t: (document.activeElement.textContent||'').trim().slice(0,24), fv: document.activeElement.matches(':focus-visible') }))()`);
  console.log(`${tag} focused element:`, JSON.stringify(focusRead));
  run(`agent-browser --session ${session} screenshot ${shots}/r85-focus-social-${tag}.png`);
}
console.log("captured r85-focus-social-{ref,loc}.png — diff via: python3 scripts/r85-focus-png-diff.py");
process.exit(0);
