#!/usr/bin/env node
// r86-ref-reauth.mjs — session-86 / parity round 85: the r83 ref-session
// re-auth protocol (the ref session's cookie expires BETWEEN rounds —
// the r83 0/5+0/12 all-DIFF lesson; re-auth BEFORE every standing/sweep
// run). Signs in on the `ref` agent-browser session (the session name
// the r37 standing probe + r41 routesweep read).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

run(`agent-browser --session ref close 2>/dev/null; true`);
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session ref open https://eon.base44.app/login`);
await new Promise(r => setTimeout(r, 3000));

async function attempt() {
  run(`agent-browser --session ref fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  run(`agent-browser --session ref fill 'input[type=password]' '$Abcd1234'`);
  await new Promise(r => setTimeout(r, 800));
  run(`agent-browser --session ref click 'button[type=submit]'`);
  await new Promise(r => setTimeout(r, 6000));
  return run(`agent-browser --session ref get url`).trim();
}
let url = await attempt();
if (url.includes("/login")) {
  console.log("fill-timing miss — careful retry (fill → settle → click)");
  url = await attempt();
}
console.log("ref session URL:", url);
console.log(url.includes("/login") ? "RE-AUTH FAILED" : "REF SESSION AUTHENTICATED");
process.exit(0);
