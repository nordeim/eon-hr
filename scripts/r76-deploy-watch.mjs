#!/usr/bin/env node
// r76-deploy-watch.mjs — session-78 / parity round 76 deploy watch.
// The r76 round read TWO deploys, both LADDERED NON-VISUAL:
//   the 37TH (login JS index-CiBFwtqW→index-BVGv30vf) and
//   the 38TH mid-round (login JS index-BVGv30vf→index-CXV35yah — a
//   ~10-minute follow-up deploy detected while diffing the 37th's bundle);
//   both times: the frontend-config preload holding, login CSS QUIET
//   index-B9rzNd1e, the app side QUIET C-IrDy5f/BGNH4KkS, and the full
//   ladder green both times (fresh login pair BYTE-IDENTICAL to the
//   69aa4241… baseline + standing 5/5 + sweep 12/12 + verify-r49 13/13
//   + verify-r45 13/13). RE-ARMED at the post-38th finals:
//   login JS  index-CXV35yah  + login CSS index-B9rzNd1e
//   app   JS  C-IrDy5f         + app   CSS BGNH4KkS
// Quiet = the post-38th contract still live; CHANGED = the 39th deploy
// arrived → the full confirmation ladder (fresh login pair byte-compare
// vs the 69aa4241… REF baseline + standing 5/5 + sweep 12/12 +
// verify-r49 13/13 + verify-r45 13/13) before classification.
// NOTE (the r60 lesson, standing): the password fill MUST be single-quoted —
// '$Abcd1234' inside a double-quoted shell string expands the unset
// variable to EMPTY and the re-auth silently fails.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app";
const FINALS = { loginJs: "index-CXV35yah", loginCss: "index-B9rzNd1e", appJs: "C-IrDy5f", appCss: "BGNH4KkS" };
const FP = `(() => {
  const fp = (el) => { const m = (el.getAttribute('href') || el.getAttribute('src') || '').match(/([A-Za-z0-9_-]{6,})\\.(?:css|js)/); return m ? m[1] : null; };
  const css = [...document.querySelectorAll('link[rel=stylesheet]')].map(fp).filter(Boolean);
  const js = [...document.querySelectorAll('script[src]')].map(fp).filter(Boolean);
  return { css, js };
})()`;

// Login side (unauthenticated page — direct open, no auth needed)
run(`agent-browser --session ref76 open ${baseRef}/login`);
await new Promise(r => setTimeout(r, 3000));
const loginFp = await evalOn("ref76", FP);
console.log("REF login fingerprints:", JSON.stringify(loginFp));
const loginJs = (loginFp.js || []).join(",");
const loginCss = (loginFp.css || []).join(",");
const loginQuiet = loginJs.includes(FINALS.loginJs) && loginCss.includes(FINALS.loginCss);
console.log(`  login JS ${loginJs.includes(FINALS.loginJs) ? "QUIET" : "CHANGED"} (${FINALS.loginJs} expected)`);
console.log(`  login CSS ${loginCss.includes(FINALS.loginCss) ? "QUIET" : "CHANGED"} (${FINALS.loginCss} expected)`);

// App side: sign in via the agent-browser fill (the controlled-input-safe
// pattern the r55 census used), then read the authed app's fingerprints.
run(`agent-browser --session ref76 fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
run(`agent-browser --session ref76 fill 'input[type=password]' '$Abcd1234'`);
run(`agent-browser --session ref76 click 'button[type=submit]'`);
await new Promise(r => setTimeout(r, 6000));
const urlNow = await evalOn("ref76", "location.href");
console.log("post-login URL:", JSON.stringify(urlNow));
const appFp = await evalOn("ref76", FP);
console.log("REF app fingerprints:", JSON.stringify(appFp));
const appJs = (appFp.js || []).join(",");
const appCss = (appFp.css || []).join(",");
console.log(`  app JS ${appJs.includes(FINALS.appJs) ? "QUIET" : "CHANGED"} (${FINALS.appJs} expected)`);
console.log(`  app CSS ${appCss.includes(FINALS.appCss) ? "QUIET" : "CHANGED"} (${FINALS.appCss} expected)`);
const appQuiet = appJs.includes(FINALS.appJs) && appCss.includes(FINALS.appCss);
console.log("VERDICT:", loginQuiet && appQuiet ? "BOTH SIDES QUIET — no new deploy" : "DEPLOY DETECTED — re-audit required");
console.log("LOGIN-VERDICT:", loginQuiet ? "LOGIN QUIET" : `LOGIN DEPLOYED — new fingerprints: JS ${loginJs} / CSS ${loginCss}`);
console.log("APP-VERDICT:", appQuiet ? "APP QUIET" : `APP DEPLOYED — new fingerprints: JS ${appJs} / CSS ${appCss}`);
process.exit(0);
