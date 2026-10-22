#!/usr/bin/env node
// r79-a11y-detail.mjs — session 79 / parity round 78: detail-read the a11y
// census findings so they can be classified (REF-authored parity vs
// clone-authored defect) before any remediation decision. Reads the
// unnamed buttons (outerHTML) and the heading structure on the flagged
// LOC routes, then the same signals on the REF equivalents.
import { execSync } from "node:child_process";
function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 160); } }
function evalB64(session, expr) { return run(`agent-browser --session ${session} eval -b ${Buffer.from(expr, "utf8").toString("base64")}`); }

const PROBE = `(() => {
  const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 || r.height > 0; };
  const btns = [...document.querySelectorAll('button')].filter(b => visible(b) && !b.textContent.trim() && !b.getAttribute('aria-label') && !b.getAttribute('title')).map(b => ({ html: b.outerHTML.replace(/\\s+/g, ' ').slice(0, 160) }));
  const heads = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(visible).map(h => h.tagName + ':' + (h.textContent || '').trim().slice(0, 28));
  return { btns, heads: heads.slice(0, 12) };
})()`;

const baseLoc = "http://127.0.0.1:3200";
const baseRef = "https://eon.base44.app";

// LOC reads (authed session loc79probe)
const SL = "loc79probe";
run(`agent-browser --session ${SL} set viewport 1440 900`);
run(`agent-browser --session ${SL} open ${baseLoc}/login`);
await new Promise(r => setTimeout(r, 2400));
run(`agent-browser --session ${SL} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise(r => setTimeout(r, 400));
run(`agent-browser --session ${SL} fill 'input[type=password]' '$Abcd1234'`);
await new Promise(r => setTimeout(r, 500));
const snap = run(`agent-browser --session ${SL} snapshot -i -c`);
const btnRef = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
if (btnRef) run(`agent-browser --session ${SL} click @${btnRef}`);
await new Promise(r => setTimeout(r, 4200));
console.log("loc probe authed:", run(`agent-browser --session ${SL} get url`).trim());

// REF reads (authed session ref79probe2)
const SR = "ref79probe2";
run(`agent-browser --session ${SR} set viewport 1440 900`);
run(`agent-browser --session ${SR} open ${baseRef}/login`);
await new Promise(r => setTimeout(r, 2400));
run(`agent-browser --session ${SR} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise(r => setTimeout(r, 400));
run(`agent-browser --session ${SR} fill 'input[type=password]' '$Abcd1234'`);
await new Promise(r => setTimeout(r, 500));
const snap2 = run(`agent-browser --session ${SR} snapshot -i -c`);
const btnRef2 = (snap2.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
if (btnRef2) run(`agent-browser --session ${SR} click @${btnRef2}`);
await new Promise(r => setTimeout(r, 5200));
console.log("ref probe authed:", run(`agent-browser --session ${SR} get url`).trim());

for (const route of ["/securitysettings", "/hrassistant", "/hrreports", "/payroll", "/taskmanager"]) {
  run(`agent-browser --session ${SL} open ${baseLoc}${route}`);
  await new Promise(r => setTimeout(r, 2200));
  const loc = evalB64(SL, PROBE);
  run(`agent-browser --session ${SR} open ${baseRef}${route}`);
  await new Promise(r => setTimeout(r, 3200));
  const ref = evalB64(SR, PROBE);
  console.log(`\n===== ${route} =====`);
  console.log("LOC:", loc.trim().slice(0, 900));
  console.log("REF:", ref.trim().slice(0, 900));
}
process.exit(0);
