#!/usr/bin/env node
// r80-viewport-recon.mjs — session 80 / parity round 79 fresh-eyes RECON:
// the program's byte-parity proof covers 1440x900 (the 8 standing surfaces)
// + 390x844 (the drawer pair ONLY). The mobile-width rendering of the other
// standing surfaces has never been byte-compared. This recon captures
// /dashboard at 390x844 on BOTH sides (warm authed ref + loc sessions,
// LIGHT mode pinned) to decide whether the full MOBILE VIEWPORT MATRIX is
// a viable fresh-eyes instrument for the round.
import { execSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
const md5 = (p) => crypto.createHash("md5").update(fs.readFileSync(p)).digest("hex");

// LIGHT mode pinned on both sides (applies pre-paint on next navigation)
for (const s of ["ref", "loc"]) {
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false')"`);
  run(`agent-browser --session ${s} set viewport 390 844`);
}
const bases = { ref: "https://eon.base44.app", loc: "http://127.0.0.1:3200" };
for (const s of ["ref", "loc"]) {
  run(`agent-browser --session ${s} open ${bases[s]}/dashboard`);
  await new Promise(r => setTimeout(r, 800));
  run(`agent-browser --session ${s} set viewport 390 844`);
  await new Promise(r => setTimeout(r, 3400));
  run(`agent-browser --session ${s} screenshot /tmp/r80-recon-${s}.png`);
  console.log(s, "captured @390x844 /dashboard");
}
const refMd5 = md5("/tmp/r80-recon-ref.png");
const locMd5 = md5("/tmp/r80-recon-loc.png");
console.log("ref md5:", refMd5);
console.log("loc md5:", locMd5);
console.log(refMd5 === locMd5
  ? "RECON: BYTE-IDENTICAL at 390x844 — the mobile viewport matrix is viable"
  : "RECON: BYTES DIFFER at 390x844 — classify the delta before building the matrix");
run(`rm -f /tmp/r80-recon-ref.png /tmp/r80-recon-loc.png`);
