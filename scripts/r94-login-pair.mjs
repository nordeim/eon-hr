#!/usr/bin/env node
// r93-login-pair.mjs — session-94 / parity round 93 opening ladder step 1:
// capture the FRESH logged-out REF login page (1440x900, LIGHT, fresh session,
// viewport screenshot — the r88 instrument pattern) and byte-compare against
// the standing baseline (docs/screenshots/493-login-standing-ref.png, md5
// 69aa4241…). Byte-identical → the login surface still holds NON-VISUAL.
// Usage: node scripts/r93-login-pair.mjs
import { execSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
const md5 = (p) => crypto.createHash("md5").update(fs.readFileSync(p)).digest("hex");

// fresh session, logged-out, LIGHT, 1440x900 (the r63 stale-viewport lesson)
run(`agent-browser --session ref94probe close 2>/dev/null; true`);
run(`agent-browser --session ref94probe set viewport 1440 900`);
run(`agent-browser --session ref94probe eval "localStorage.setItem('darkMode','false')"`);
run(`agent-browser --session ref94probe open https://eon.base44.app/login`);
await new Promise((r) => setTimeout(r, 3500));

// DOM census of the login structure (the 7-button set + form + fields)
const CENSUS = `(() => {
  const buttons = [...document.querySelectorAll('button')].map(b => (b.textContent || '').trim()).filter(Boolean);
  const inputs = [...document.querySelectorAll('input')].map(i => i.type + ':' + (i.name || i.placeholder || ''));
  const h1 = document.querySelector('h1');
  const title = (h1 && h1.textContent || '').trim();
  return { buttons, inputs, title, turnstile: !!document.querySelector('[class*=turnstile], iframe[src*=turnstile]') };
})()`;
const oneLine = CENSUS.split("\n").join(" ");
const out = run(`agent-browser --session ref94probe eval ${JSON.stringify(oneLine)}`);
let census;
try { census = JSON.parse(out.trim()); } catch { try { census = JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { census = { error: out.slice(0, 300) }; } }
console.log("REF login census:", JSON.stringify(census, null, 1));

// capture + byte-compare vs the standing baseline
const cap = `${shots}/r94-probe-login-ref.png`;
run(`agent-browser --session ref94probe screenshot ${cap}`);
const now = md5(cap);
const base = md5(`${shots}/493-login-standing-ref.png`);
console.log(`fresh  REF login md5: ${now}`);
console.log(`base   REF login md5: ${base}`);
console.log(now === base ? "VERDICT: BYTE-IDENTICAL — the login surface holds NON-VISUAL" : "VERDICT: DIFF — a newer deploy RENDERED; run the full ladder");
run(`agent-browser --session ref94probe close`);
