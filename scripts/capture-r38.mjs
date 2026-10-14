#!/usr/bin/env node
// capture-r38.mjs — session-39 / parity round 38 screenshots: the login
// re-audit — the desktop pair, the mobile pair (the 44px inputs + the
// stacked links row + the spacer scroll), the placeholder/logo close-up
// pair (760x700), and the links-row bottom crop pair.
import { execSync } from "node:child_process";

const SHOTS = "/home/z/my-project/eon-hr/docs/screenshots";
function run(cmd) {
  try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); }
  catch (e) { return "ERR:" + String(e).slice(0, 140); }
}
async function openAt(session, url, w, h, ms = 3200) {
  run(`agent-browser --session ${session} set viewport ${w} ${h}`);
  run(`agent-browser --session ${session} open "${url}"`);
  await new Promise(r => setTimeout(r, ms));
}
const shot = (session, name) => run(`agent-browser --session ${session} screenshot ${SHOTS}/${name}.png`);

// 144: the login desktop pair (the main root, the glow logo, the -ml-4
// Google cluster, the placeholder slate-600, the zinc typed-text)
await openAt("ref", "https://eon.base44.app/login", 1440, 900);
await openAt("loc", "http://127.0.0.1:3200/login", 1440, 900);
shot("ref", "144-ref-login-desktop");
shot("loc", "144b-loc-login-desktop");

// 145: the login mobile pair (the 44px inputs at 16px, the stacked links
// row, the card pinned to y=16 with the 18px spacer scroll)
await openAt("ref", "https://eon.base44.app/login", 390, 844);
await openAt("loc", "http://127.0.0.1:3200/login", 390, 844);
shot("ref", "145-ref-login-mobile");
shot("loc", "145b-loc-login-mobile");

// 146: the placeholder + logo-glow close-up at 760x700 (the card fills
// more of the frame — the desktop page itself never scrolls)
await openAt("ref", "https://eon.base44.app/login", 760, 700);
await openAt("loc", "http://127.0.0.1:3200/login", 760, 700);
shot("ref", "146-ref-login-placeholder-glow");
shot("loc", "146b-loc-login-placeholder-glow");

// 147: the links-row + social-icon pair at mobile (the stacked Forgot /
// Need account row; the page only scrolls 18px so this is the at-rest
// view cropped to the lower half by the diff tool)
await openAt("ref", "https://eon.base44.app/login", 390, 844);
await openAt("loc", "http://127.0.0.1:3200/login", 390, 844);
shot("ref", "147-ref-login-links-mobile");
shot("loc", "147b-loc-login-links-mobile");

console.log("done");
