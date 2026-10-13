#!/usr/bin/env node
// verify-r33.mjs — session-34 / parity round 33 LIVE VERIFICATION:
// (1) the at-rest inventory sweep on the six rebuilt pages,
// (2) the login stack + error Alert pair,
// (3) the light regression sweep (h1s on the standing 12).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(expr)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
let fails = 0;
const check = (label, ref, loc) => {
  const same = JSON.stringify(ref) === JSON.stringify(loc);
  if (!same) fails++;
  console.log(`${same ? "MATCH" : "**DIFF**"} ${label}: ref=${JSON.stringify(ref)} loc=${JSON.stringify(loc)}`);
};

async function openBoth(route, ms = 3200) {
  for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
    run(`agent-browser --session ${s} open "${base}${route}"`);
    await new Promise(r => setTimeout(r, ms));
  }
}

// ---- 1) the at-rest inventory sweep (buttons + geometry anchors) ----
const INV = `(() => { const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }; const main = document.querySelector('main') || document.body; const btns = [...main.querySelectorAll('button')].filter(vis).map(b => b.textContent.trim().slice(0, 24)).filter(t => t && !t.includes('Toggle')); const h1 = [...document.querySelectorAll('main h1')].filter(vis)[0]; return { btns, h1: h1 ? { t: h1.textContent.trim().slice(0, 30), x: Math.round(h1.getBoundingClientRect().x), y: Math.round(h1.getBoundingClientRect().y) } : null }; })()`;

console.log("=== 1) at-rest inventory sweep ===");
for (const route of ["/payrollreports", "/requestreports", "/requestsettings", "/shiftswap", "/payrollai"]) {
  await openBoth(route);
  const ref = await evalOn("ref", INV), loc = await evalOn("loc", INV);
  check(route, ref, loc);
}

// ---- 2) the login pair (stack anchors + the Alert) ----
console.log("\n=== 2) login stack + Alert ===");
await openBoth("/login", 2600);
const STACK = `(() => { const out = {}; const card = [...document.querySelectorAll('div')].find(el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return cs.boxShadow.includes('0 25px') === false && cs.borderWidth === '0px' && r.width === 448; }) || (document.querySelector('form') ? document.querySelector('form').closest('div.rounded-2xl') : null); if (card) { const r = card.getBoundingClientRect(); out.cardY = Math.round(r.y); } const logo = [...document.querySelectorAll('img')].find(i => i.getBoundingClientRect().width > 40); if (logo) out.logoY = Math.round(logo.getBoundingClientRect().y); const btns = [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().height > 0); const google = btns.find(b => b.textContent.includes('Google')); if (google) out.googleY = Math.round(google.getBoundingClientRect().y); const pw = document.querySelector('input[type=password]'); if (pw) out.pwY = Math.round(pw.getBoundingClientRect().y); return out; })()`;
check("login stack", await evalOn("ref", STACK), await evalOn("loc", STACK));

for (const s of ["ref", "loc"]) {
  await evalOn(s, `(() => { const e = document.querySelector('input[type=email]'); const p = document.querySelector('input[type=password]'); const set = (el, v) => { const proto = Object.getPrototypeOf(el); Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); }; set(e, 'wronguser@test.invalid'); set(p, 'WrongPass123!'); const b = [...document.querySelectorAll('button')].find(b => b.textContent.trim().toLowerCase().includes('sign in')); if (b) b.click(); return 'ok'; })()`, 4200);
}
const ALERT = `(() => { const alert = [...document.querySelectorAll('div')].find(el => { const cs = getComputedStyle(el); const t = el.textContent.trim(); return t === 'Invalid email or password' && cs.borderWidth === '1px'; }); if (!alert) return { found: false }; const cs = getComputedStyle(alert); const r = alert.getBoundingClientRect(); const desc = alert.children[0]; return { rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], radius: cs.borderRadius, pad: cs.padding, descColor: desc ? getComputedStyle(desc).color : null }; })()`;
check("login alert", await evalOn("ref", ALERT), await evalOn("loc", ALERT));

// ---- 3) light regression sweep (the standing 12) ----
console.log("\n=== 3) light regression sweep ===");
const H1 = `(() => { const h = [...document.querySelectorAll('main h1')].filter(x => x.getBoundingClientRect().width > 0)[0]; if (!h) return null; const cs = getComputedStyle(h); const r = h.getBoundingClientRect(); return { fs: cs.fontSize, t: h.textContent.trim().slice(0, 22), x: Math.round(r.x), y: Math.round(r.y) }; })()`;
for (const route of ["/dashboard", "/employees", "/payroll", "/taskmanager", "/settings", "/hrreports", "/analytics", "/notificationpreferences", "/staffrequests", "/leavemanagement", "/expenses", "/profile"]) {
  await openBoth(route, 2600);
  check(route, await evalOn("ref", H1), await evalOn("loc", H1));
}

console.log(`\n${fails} DIFF(S) FOUND`);
