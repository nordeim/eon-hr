#!/usr/bin/env node
// r77-login-probe.mjs — session 77 / parity round 76: classify the 39TH
// REF LOGIN DEPLOY (detected by the r77 deploy-watch read of the r76
// instrument: login JS index-CXV35yah→index-BOwtYlPm AND login CSS
// index-B9rzNd1e→index-DS1aCkan — the FIRST login-CSS movement since the
// 35th deploy; the frontend-config preload holding; the app side QUIET
// C-IrDy5f/BGNH4KkS). Step 1 of the confirmation ladder: capture the
// FRESH logged-out REF login page (1440x900, LIGHT, fresh browser
// session) and byte-compare against the standing r73..r76 baseline (the
// 545 login standing REF PNG, md5 69aa4241…). Byte-identical → the
// deploy is NON-VISUAL despite the CSS movement; a diff means the deploy
// RENDERED and the delta must be audited member by member before any
// remediation decision.
// Usage: node scripts/r77-login-probe.mjs
import { execSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
const md5 = (p) => crypto.createHash("md5").update(fs.readFileSync(p)).digest("hex");

// fresh session, logged-out, LIGHT, 1440x900 (the r63 stale-viewport lesson)
run(`agent-browser --session ref77probe close 2>/dev/null; true`);
run(`agent-browser --session ref77probe set viewport 1440 900`);
run(`agent-browser --session ref77probe eval "localStorage.setItem('darkMode','false')"`);
run(`agent-browser --session ref77probe open https://eon.base44.app/login`);
await new Promise(r => setTimeout(r, 3500));

// DOM census of the login structure (the standing button set + form +
// fields — the r68 recon contract) so a visual diff can be localized.
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
const out = run(`agent-browser --session ref77probe eval ${JSON.stringify(oneLine)}`);
let census;
try { census = JSON.parse(out.trim()); } catch { try { census = JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { census = { error: out.slice(0, 300) }; } }
console.log("REF login census:", JSON.stringify(census, null, 1));

// capture + byte-compare vs the standing baseline (the 545 login pair)
const cap = `${shots}/r77-probe-login-ref.png`;
run(`agent-browser --session ref77probe screenshot ${cap}`);
const now = md5(cap);
const base = md5(`${shots}/545-login-standing-ref.png`);
console.log(`probe: ${now}`);
console.log(`base : ${base} (r75 545-login-standing-ref)`);
console.log(now === base ? "BYTE-IDENTICAL — the 39th deploy is NON-VISUAL on the login surface (despite the CSS movement)" : "BYTES DIFFER — the deploy RENDERED; audit the delta member by member");
run(`rm -f ${cap}`);
run(`agent-browser --session ref77probe close 2>/dev/null; true`);
process.exit(0);
