#!/usr/bin/env node
// capture-r44.mjs — session-45 / parity round 44 screenshots (172-175):
// the login interior evidence — the at-rest card with the migrated icon
// colors (black Apple, REF's Microsoft squares, slate-500 field icons),
// the keyboard-focused inputs rendering the slate-400 ring (the round's
// core — the runtime-cascade mirror), the social row detail, and the
// mobile band. REF + LOC pairs.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const raw = out.trim(); try { return JSON.parse(raw); } catch { return raw; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const OUT = "/home/z/my-project/eon-hr/docs/screenshots";

async function openBoth(path, vp = [1440, 900]) {
  run(`agent-browser --session ref set viewport ${vp[0]} ${vp[1]}`);
  run(`agent-browser --session ref open ${baseRef}${path}`);
  await new Promise(r => setTimeout(r, 3200));
  run(`agent-browser --session loc set viewport ${vp[0]} ${vp[1]}`);
  run(`agent-browser --session loc open ${baseLoc}${path}`);
  await new Promise(r => setTimeout(r, 2600));
}
const shot = (session, name) => run(`agent-browser --session ${session} screenshot "${OUT}/${name}.png"`);

// ---------- 172: the at-rest login card (the migrated icon colors) ----------
await openBoth("/login");
await shot("ref", "172-ref-login-at-rest-icons");
await shot("loc", "172b-loc-login-at-rest-icons");

// ---------- 173: the keyboard-focused inputs — the slate-400 ring ----------
// Tab 4× into the email input (settled), capture; then 1 more Tab into
// the password, capture both.
for (const s of ["ref", "loc"]) {
  for (let i = 0; i < 4; i++) { run(`agent-browser --session ${s} press Tab`); await new Promise(r => setTimeout(r, 130)); }
  await new Promise(r => setTimeout(r, 600)); // the transition settle
}
await shot("ref", "173-ref-login-email-focused-ring");
await shot("loc", "173b-loc-login-email-focused-ring");

// ---------- 174: the social row detail (the fills + the title order) ----------
// scroll the social row into view + a tight viewport crop around it
await openBoth("/login", [480, 420]);
await shot("ref", "174-ref-login-social-row-detail");
await shot("loc", "174b-loc-login-social-row-detail");

// ---------- 175: the mobile band login (the icons at 390px) ----------
await openBoth("/login", [390, 844]);
await shot("ref", "175-ref-login-mobile");
await shot("loc", "175b-loc-login-mobile");

console.log("captures done: 172-175 (8 PNGs)");
