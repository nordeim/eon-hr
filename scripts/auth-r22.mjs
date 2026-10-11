#!/usr/bin/env node
// auth-r22.mjs — authenticate agent-browser sessions "loc" and "ref".
// Fixes the documented password-fill flake: the $ in $Abcd1234 expands to
// empty inside double-quoted shell words — fills use single quotes.
import { execSync } from "node:child_process";

const EMAIL = "sepnetflix2023@outlook.com";
const PASSWORD = "$Abcd1234";

function run(cmd) {
  try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); }
  catch (e) { return "ERR:" + String(e).slice(0, 140); }
}

function findButtonRef(session, label) {
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const re = new RegExp(`- button "[^"]*${label}[^"]*" \\[ref=(\\w+)\\]`, "i");
  const m = snap.match(re);
  return m ? m[1] : null;
}

async function auth(session, base) {
  console.log(`[${session}] opening ${base}/login ...`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3000));
  // single-quoted fills — the $ survives the shell
  run(`agent-browser --session ${session} fill 'input[type=email]' '${EMAIL}'`);
  await new Promise(r => setTimeout(r, 500));
  run(`agent-browser --session ${session} fill 'input[type=password]' '${PASSWORD}'`);
  await new Promise(r => setTimeout(r, 500));
  // verify the password field actually holds 9 chars (the flake guard)
  const len = run(`agent-browser --session ${session} eval "document.querySelector('input[type=password]').value.length"`)
    .trim().replace(/^"|"$/g, "");
  if (len !== "9") {
    console.log(`[${session}] password fill came up ${len} chars — refilling`);
    run(`agent-browser --session ${session} fill 'input[type=password]' '${PASSWORD}'`);
    await new Promise(r => setTimeout(r, 500));
  }
  const ref = findButtonRef(session, "sign in");
  if (!ref) { console.log(`[${session}] no Sign in button found`); return "/login"; }
  run(`agent-browser --session ${session} click @${ref}`);
  await new Promise(r => setTimeout(r, 5000));
  const url = run(`agent-browser --session ${session} eval "location.pathname"`)
    .trim().replace(/^"|"$/g, "");
  console.log(`[${session}] post-login path: ${url}`);
  return url;
}

const refPath = await auth("ref", "https://eon.base44.app");
const locPath = await auth("loc", "http://127.0.0.1:3200");
console.log(refPath.includes("login") || locPath.includes("login") ? "AUTH-FAIL" : "AUTH-OK");
