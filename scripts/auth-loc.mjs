#!/usr/bin/env node
// auth-loc.mjs — authenticate the agent-browser "loc" session against the
// LOC standalone server (:3200) with the demo account.
import { execSync } from "node:child_process";

const EMAIL = "sepnetflix2023@outlook.com";
const PASSWORD = "$Abcd1234";
const BASE = "http://127.0.0.1:3200";

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString();
  } catch (e) {
    return "ERR:" + String(e).slice(0, 120);
  }
}

function findButtonRef(session, label) {
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const re = new RegExp(`- button "[^"]*${label}[^"]*" \\[ref=(\\w+)\\]`, "i");
  const m = snap.match(re);
  return m ? m[1] : null;
}

run(`agent-browser --session loc open "${BASE}/login"`);
await new Promise(r => setTimeout(r, 2500));
run(`agent-browser --session loc fill "input[type=email]" "${EMAIL}"`);
await new Promise(r => setTimeout(r, 400));
run(`agent-browser --session loc fill "input[type=password]" "${PASSWORD}"`);
await new Promise(r => setTimeout(r, 400));
const ref = findButtonRef("loc", "sign in");
if (ref) run(`agent-browser --session loc click @${ref}`);
await new Promise(r => setTimeout(r, 4500));
const url = run(`agent-browser --session loc eval "location.pathname"`)
  .trim().replace(/^"|"$/g, "");
console.log(`loc=${url}`);
console.log(!url.includes("login") ? "AUTH-OK" : "AUTH-FAIL");
