#!/usr/bin/env node
// auth-sessions.mjs — authenticate agent-browser sessions "loc" and "ref"
// with the demo account via snapshot-ref clicking (has-text selectors are
// unreliable in agent-browser). Usage: node scripts/auth-sessions.mjs
import { execSync } from "node:child_process";

const EMAIL = "sepnetflix2023@outlook.com";
const PASSWORD = "$Abcd1234";

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

async function auth(session, base) {
  console.log(`[${session}] opening ${base}/login ...`);
  run(`agent-browser --session ${session} open "${base}/login"`);
  await new Promise(r => setTimeout(r, 2500));
  run(`agent-browser --session ${session} fill "input[type=email]" "${EMAIL}"`);
  await new Promise(r => setTimeout(r, 400));
  run(`agent-browser --session ${session} fill "input[type=password]" "${PASSWORD}"`);
  await new Promise(r => setTimeout(r, 400));
  const ref = findButtonRef(session, "sign in");
  if (!ref) { console.log(`[${session}] no Sign in button found`); return "/login"; }
  run(`agent-browser --session ${session} click @${ref}`);
  await new Promise(r => setTimeout(r, 4500));
  const url = run(`agent-browser --session ${session} eval "location.pathname"`)
    .trim().replace(/^"|"$/g, "");
  console.log(`[${session}] post-login path: ${url}`);
  return url;
}

const refUrl = await auth("ref", "https://eon.base44.app");
const locUrl = await auth("loc", "http://127.0.0.1:3200");
console.log(`ref=${refUrl} loc=${locUrl}`);
console.log(
  !refUrl.includes("login") && !locUrl.includes("login") ? "AUTH-OK" : "AUTH-FAIL"
);
