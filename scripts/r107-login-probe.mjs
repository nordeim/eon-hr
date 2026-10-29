#!/usr/bin/env node
// r107-login-probe.mjs — session 107 / parity round 106: the OPENING READ
// deploy-watch. Detects whether the REF shipped a 71st deploy since the
// session-106 close (the 70th state: login JS index-C8D2zqWd, login CSS
// index-CZZ4z0cl, app side C-IrDy5f/BGNH4KkS) and classifies it:
//   step 1 — asset-hash census of the fresh logged-out login page;
//   step 2 — byte-compare the login capture at the VERIFIED 1440x900 LIGHT
//            viewport against the standing render baseline (69aa4241… — the
//            render state unchanged since the 69th deploy). Identical →
//            NON-VISUAL; a diff → the deploy RENDERED and the delta must be
//            audited member by member before any remediation decision.
// Usage: node scripts/r107-login-probe.mjs
import { execSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
const md5 = (p) => crypto.createHash("md5").update(fs.readFileSync(p)).digest("hex");

// fresh session, logged-out, LIGHT, 1440x900 (the r63 stale-viewport lesson —
// re-apply + verify the viewport AFTER every open; the r104/r105 fresh-session
// viewport drift trap)
run(`agent-browser --session ref107probe close 2>/dev/null; true`);
run(`agent-browser --session ref107probe set viewport 1440 900`);
run(`agent-browser --session ref107probe eval "localStorage.setItem('darkMode','false')"`);
run(`agent-browser --session ref107probe open https://eon.base44.app/login`);
await new Promise(r => setTimeout(r, 3500));
run(`agent-browser --session ref107probe set viewport 1440 900`);
const vp = run(`agent-browser --session ref107probe eval "window.innerWidth + 'x' + window.innerHeight"`).trim();
console.log("viewport verified:", vp);

// DOM census of the login structure (the standing button set + form + fields)
// so a visual diff can be localized + the asset fingerprint for deploy watch.
const CENSUS = `(() => {
  const fp = (el) => { const m = (el.getAttribute('href') || el.getAttribute('src') || '').match(/([A-Za-z0-9_-]{6,})\\.(?:css|js)/); return m ? m[1] : null; };
  const css = [...document.querySelectorAll('link[rel=stylesheet]')].map(fp).filter(Boolean);
  const js = [...document.querySelectorAll('script[src]')].map(fp).filter(Boolean);
  const buttons = [...document.querySelectorAll('button')].map(b => (b.textContent || '').trim()).filter(Boolean);
  const inputs = [...document.querySelectorAll('input')].map(i => i.type + ':' + (i.name || i.placeholder || ''));
  const h1 = document.querySelector('h1');
  const title = (h1 && h1.textContent || '').trim();
  return { css, js, buttons, inputs, title, turnstile: !!document.querySelector('[class*=turnstile], iframe[src*=turnstile]') };
})()`;
const oneLine = CENSUS.split("\n").join(" ");
const out = run(`agent-browser --session ref107probe eval ${JSON.stringify(oneLine)}`);
let census;
try { census = JSON.parse(out.trim()); } catch { try { census = JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { census = { error: out.slice(0, 300) }; } }
console.log("REF login census (fresh read):", JSON.stringify(census, null, 1));

// capture + byte-compare vs the standing baseline (the r106 probe capture —
// itself byte-identical to the 69aa render state through the 70th deploy)
const cap = `${shots}/r107-probe-login-ref.png`;
run(`agent-browser --session ref107probe screenshot ${cap}`);
const now = md5(cap);
const base = md5(`${shots}/r105-probe-login-ref.png`);
console.log(`probe: ${now}`);
console.log(`base : ${base} (r105-probe-login-ref — the standing 69aa render baseline)`);
console.log(now === base ? "BYTE-IDENTICAL — no visual movement on the login surface" : "BYTES DIFFER — the deploy RENDERED; audit the delta member by member");
run(`agent-browser --session ref107probe close 2>/dev/null; true`);
process.exit(0);
