#!/usr/bin/env node
// r86-loc-reauth.mjs — session-86: careful loc-session re-auth (the r49
// orchestrator's snapshot-ref click missed this boot — the r78 fill-timing
// lesson; re-auth then verify the URL before the standing/sweep re-run).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

run(`agent-browser --session loc close 2>/dev/null; true`);
run(`agent-browser --session loc set viewport 1440 900`);
run(`agent-browser --session loc open http://127.0.0.1:3200/login`);
await new Promise(r => setTimeout(r, 3000));

async function attempt() {
  run(`agent-browser --session loc fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  await new Promise(r => setTimeout(r, 600));
  run(`agent-browser --session loc fill 'input[type=password]' '$Abcd1234'`);
  await new Promise(r => setTimeout(r, 800));
  run(`agent-browser --session loc click 'button[type=submit]'`);
  await new Promise(r => setTimeout(r, 4500));
  return run(`agent-browser --session loc get url`).trim();
}
let url = await attempt();
if (url.includes("/login")) {
  console.log("miss — careful retry");
  url = await attempt();
}
console.log("loc session URL:", url);
console.log(url.includes("/login") ? "LOC AUTH FAILED" : "LOC SESSION AUTHENTICATED");
process.exit(0);
