#!/usr/bin/env node
// r76-login-probe.mjs — session-78 / parity round 76: classify the 37TH
// REF LOGIN DEPLOY (detected by the r76 deploy watch: login JS
// index-CiBFwtqW→index-BVGv30vf + the frontend-config preload holding;
// login CSS QUIET index-B9rzNd1e; the app side QUIET C-IrDy5f/BGNH4KkS).
// Step 1 of the confirmation ladder: capture the FRESH logged-out REF
// login page (1440x900, LIGHT, fresh browser session) and byte-compare
// against the r73..r75 post-36th baseline (the 527/545 login standing
// REF PNG, md5 69aa4241…). Byte-identical → the deploy is NON-VISUAL;
// a diff means the JS change RENDERED and the delta must be audited
// member by member before any remediation decision.
// Usage: node scripts/r76-login-probe.mjs
import { execSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
const md5 = (p) => crypto.createHash("md5").update(fs.readFileSync(p)).digest("hex");

// fresh session, logged-out, LIGHT, 1440x900 (the r63 stale-viewport lesson)
run(`agent-browser --session ref76probe close 2>/dev/null; true`);
run(`agent-browser --session ref76probe set viewport 1440 900`);
run(`agent-browser --session ref76probe eval "localStorage.setItem('darkMode','false')"`);
run(`agent-browser --session ref76probe open https://eon.base44.app/login`);
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
const out = run(`agent-browser --session ref76probe eval ${JSON.stringify(oneLine)}`);
let census;
try { census = JSON.parse(out.trim()); } catch { try { census = JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { census = { error: out.slice(0, 300) }; } }
console.log("REF login census:", JSON.stringify(census, null, 1));

// capture + byte-compare vs the post-36th baseline (the 545 login pair)
const cap = `${shots}/r76-probe-login-ref.png`;
run(`agent-browser --session ref76probe screenshot ${cap}`);
const now = md5(cap);
const base = md5(`${shots}/545-login-standing-ref.png`);
console.log(`probe: ${now}`);
console.log(`base : ${base} (r75 545-login-standing-ref)`);
console.log(now === base ? "BYTE-IDENTICAL — the 37th deploy is NON-VISUAL on the login surface" : "BYTES DIFFER — the JS deploy RENDERED; audit the delta");
run(`rm -f ${cap}`);
run(`agent-browser --session ref76probe close 2>/dev/null; true`);
process.exit(0);
