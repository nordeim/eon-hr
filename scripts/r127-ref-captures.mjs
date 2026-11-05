#!/usr/bin/env node
// r127-ref-captures.mjs — session 127 / parity round 126: the AUDIT-A
// REF-watch leg, the 91st-deploy watch (the standing protocol from the r126
// plan reproduced exactly):
//   PHASE A (desktop, 1280x800): the logged-out login asset census (pins:
//     JS index-DyOb2xUE.js / CSS index-Bt66wgTd.css — the r126 close values,
//     HELD/CHURNED) + the warm-token computed census (the BUTTON itself
//     measured, not the [data-ds] wrapper — the r124 artifact lesson) + the
//     r127-ref-login.png capture; then ONE clean login → 6s settle →
//     viewport re-set → 2s → the r127-ref-dashboard.png capture (the cards
//     animate in — an in-flight capture is the documented trap) + the
//     app-side asset census (pins: index-C-IrDy5f.js / index-BGNH4KkS.css,
//     the r42 baseline).
//   PHASE B (mobile, 390x844 FROM SESSION START — the r125 trap: a
//     mid-session viewport switch does not re-render the mobile a11y tree,
//     so the mobile leg rides its OWN fresh session, logged in at 390):
//     open / → wait 4s → hamburger (tolerant ref regex) → 1.8s →
//     r127-ref-mobilenav-open.png → Training LMS → 3.5s →
//     r127-ref-training-mobile.png + the drawer-state eval (the REF
//     STAYS-OPEN regression watch: 288px z:50 opacity 1 since the 69th
//     deploy) + location.pathname.
//   PHASE C: the md5/byte compare vs the r126 pins (login e04112c8 /
//   167,497 B, dashboard 965b41b0 / 190,117 B).
// The $-in-password trap: every fill rides a single-quoted shell string
// inside this file — never an inline double-quoted eval. Login budget:
// ONE attempt per session (2 of the 10/15min total).
// Usage: node scripts/r127-ref-captures.mjs
import { execSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";

const base = "https://eon.base44.app";
const out = "/home/z/my-project/eon-hr/docs/screenshots";
const shots = {
  login: `${out}/r127-ref-login.png`,
  dashboard: `${out}/r127-ref-dashboard.png`,
  mobilenav: `${out}/r127-ref-mobilenav-open.png`,
  training: `${out}/r127-ref-training-mobile.png`,
};
const PINS = {
  login: { md5: "e04112c8dd3086c5edbed14994c49f26", bytes: 167497 },
  dashboard: { md5: "965b41b0956375b5afb980fad64c53b4", bytes: 190117 },
};
const ASSET_PINS = {
  loginJS: "index-DyOb2xUE.js",
  loginCSS: "index-Bt66wgTd.css",
  appJS: "index-C-IrDy5f.js",
  appCSS: "index-BGNH4KkS.css",
};

function run(cmd, t = 90000) {
  try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); }
  catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 300); }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const md5 = (p) => crypto.createHash("md5").update(fs.readFileSync(p)).digest("hex");

// agent-browser eval returns a JSON-quoted string — unwrap + parse (r118 pattern)
function deepParse(raw) {
  let s = String(raw).trim();
  for (let i = 0; i < 3; i++) {
    try { const p = JSON.parse(s); if (typeof p === "string") { s = p; continue; } return p; }
    catch (e) { break; }
  }
  try { return JSON.parse(s.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); }
  catch (e) { return s; }
}

// ---------- the eval expressions (no dollar signs, single-quoted only) ----------
const ASSETS = `JSON.stringify([...document.querySelectorAll('script[src],link[rel=stylesheet]')].map(e=>e.src||e.href))`;

const WARM = `(() => { const out = {}; const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 || r.height > 0; }; const btn = [...document.querySelectorAll('button')].find(b => { const t = (b.textContent || '').trim().toLowerCase(); return (t.indexOf('continue with') >= 0 || t.indexOf('google') >= 0 || t.indexOf('microsoft') >= 0 || t.indexOf('apple') >= 0) && vis(b); }); if (btn) { const cs = getComputedStyle(btn); out.socialBtn = { text: (btn.textContent || '').trim().slice(0, 40), color: cs.color, backgroundColor: cs.backgroundColor, borderColor: cs.borderColor, fontSize: cs.fontSize }; } else { out.socialBtn = 'NOT-FOUND'; } const chip = [...document.querySelectorAll('div,span')].filter(e => e.children.length === 0 && (e.textContent || '').trim().toLowerCase() === 'or' && vis(e))[0]; if (chip) { const cs = getComputedStyle(chip); out.orChip = { color: cs.color, fontSize: cs.fontSize, fontWeight: cs.fontWeight, letterSpacing: cs.letterSpacing }; } else { out.orChip = 'NOT-FOUND'; } const h1 = document.querySelector('h1'); if (h1) { const cs = getComputedStyle(h1); out.h1 = { text: (h1.textContent || '').trim().slice(0, 60), color: cs.color, fontSize: cs.fontSize }; } else { out.h1 = 'NOT-FOUND'; } const em = document.querySelector('input[type=email]'); if (em) { const cs = getComputedStyle(em); out.emailInput = { borderColor: cs.borderColor, borderWidth: cs.borderWidth, color: cs.color, backgroundColor: cs.backgroundColor }; } else { out.emailInput = 'NOT-FOUND'; } out.darkMode = localStorage.getItem('darkMode'); out.turnstile = !!document.querySelector('iframe[src*=turnstile]'); return JSON.stringify(out); })()`;

const DOMCENSUS = `(() => { const btns = [...document.querySelectorAll('button')].map(b => (b.textContent || '').trim()).filter(Boolean); const links = [...document.querySelectorAll('a')].map(a => ((a.textContent || '').trim() + ' -> ' + (a.getAttribute('href') || ''))).filter(x => x.length > 5).slice(0, 10); const h1 = document.querySelector('h1'); const h2 = document.querySelector('h2'); return JSON.stringify({ title: document.title, h1: h1 ? (h1.textContent || '').trim() : null, h2: h2 ? (h2.textContent || '').trim().slice(0, 60) : null, buttons: btns, links: links }); })()`;

const CLICKSIGNIN = `(() => { const b = [...document.querySelectorAll('button')].find(x => { const t = (x.textContent || '').trim().toLowerCase(); return t === 'sign in' || t === 'log in'; }); if (b) { b.click(); return 'CLICKED'; } return 'NOBTN'; })()`;

const CLICKTOGGLE = `(() => { const b = [...document.querySelectorAll('header button')].find(x => (((x.getAttribute('aria-label') || '') + ' ' + (x.textContent || '')).indexOf('Toggle Sidebar') >= 0)); if (b) { b.click(); return 'CLICKED'; } return 'NOBTN'; })()`;

const HAMGEO = `(() => { const b = [...document.querySelectorAll('header button')].find(x => (((x.getAttribute('aria-label') || '') + ' ' + (x.textContent || '')).indexOf('Toggle Sidebar') >= 0)); if (!b) return 'NOBTN'; const r = b.getBoundingClientRect(); const svg = b.querySelector('svg'); return JSON.stringify({ w: Math.round(r.width), h: Math.round(r.height), svgClass: svg ? (svg.getAttribute('class') || '') : null, ariaLabel: b.getAttribute('aria-label') }); })()`;

const DRAWER = `(function(){const cand=[...document.querySelectorAll('div')].filter(d=>{const cs=getComputedStyle(d);if(cs.display==='none'||cs.visibility==='hidden')return false;const r=d.getBoundingClientRect();return cs.position==='fixed'&&r.width>=250&&r.width<=320&&r.left<50&&r.height>400});if(!cand.length)return 'DRAWER UNMOUNTED (auto-closed)';const d=cand[0];const cs=getComputedStyle(d);return JSON.stringify({w:cs.width,left:Math.round(d.getBoundingClientRect().left),z:cs.zIndex,opacity:cs.opacity})})()`;

function classifyAssets(label, assetsRaw) {
  const arr = deepParse(assetsRaw);
  const urls = Array.isArray(arr) ? arr : [];
  const names = urls.map((u) => String(u).split("/").pop());
  const idx = names.filter((n) => /^index-/.test(n));
  console.log(`[${label}] asset URLs (${names.length}):`, JSON.stringify(names));
  console.log(`[${label}] index-* entries:`, JSON.stringify(idx));
  if (label.includes("LOGIN")) {
    console.log(`[${label}] login JS pin ${ASSET_PINS.loginJS}:`, idx.includes(ASSET_PINS.loginJS) ? "HELD" : "CHURNED");
    console.log(`[${label}] login CSS pin ${ASSET_PINS.loginCSS}:`, idx.includes(ASSET_PINS.loginCSS) ? "HELD" : "CHURNED");
  } else {
    console.log(`[${label}] app JS pin ${ASSET_PINS.appJS}:`, idx.includes(ASSET_PINS.appJS) ? "HELD" : "CHURNED");
    console.log(`[${label}] app CSS pin ${ASSET_PINS.appCSS}:`, idx.includes(ASSET_PINS.appCSS) ? "HELD" : "CHURNED");
  }
  return idx;
}

// ================= PHASE A — desktop 1280x800 =================
console.log("===== PHASE A: desktop (1280x800), session ref127cap =====");
const A = "ref127cap";
run(`agent-browser --session ${A} close 2>/dev/null; true`);
run(`agent-browser --session ${A} set viewport 1280 800`);
run(`agent-browser --session ${A} open ${base}/login`);
await sleep(4000);
run(`agent-browser --session ${A} set viewport 1280 800`);
run(`agent-browser --session ${A} screenshot ${shots.login}`);
console.log("[A] r127-ref-login.png captured (logged-out, 1280x800)");
const vpA = deepParse(run(`agent-browser --session ${A} eval "window.innerWidth + 'x' + window.innerHeight"`));
console.log("[A] viewport verified:", vpA);

const loginAssetsRaw = run(`agent-browser --session ${A} eval "${ASSETS}"`);
classifyAssets("A-LOGIN", loginAssetsRaw);

const warmRaw = run(`agent-browser --session ${A} eval "${WARM}"`);
console.log("[A] WARM TOKENS (computed, at-rest login page):");
console.log(JSON.stringify(deepParse(warmRaw), null, 1));

const censusRaw = run(`agent-browser --session ${A} eval "${DOMCENSUS}"`);
console.log("[A] LOGIN DOM CENSUS (anomaly check):");
console.log(JSON.stringify(deepParse(censusRaw), null, 1));

// ONE clean login (single-quoted fills — the dollar-sign trap)
run(`agent-browser --session ${A} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await sleep(600);
run(`agent-browser --session ${A} fill 'input[type=password]' '$Abcd1234'`);
await sleep(600);
const snapA = run(`agent-browser --session ${A} snapshot -i -c`);
const mA = snapA.match(/- button "[^"]*[Ss]ign in[^"]*" \[[^\]]*ref=(\w+)\]/) || snapA.match(/- button "[^"]*[Ll]og in[^"]*" \[[^\]]*ref=(\w+)\]/);
if (mA) {
  run(`agent-browser --session ${A} click @${mA[1]}`);
  console.log("[A] sign-in clicked via ref", mA[1]);
} else {
  console.log("[A] sign-in ref not matched — eval fallback:", run(`agent-browser --session ${A} eval "${CLICKSIGNIN}"`).trim());
}
await sleep(6000); // the card animations settle
run(`agent-browser --session ${A} set viewport 1280 800`);
await sleep(2000);
run(`agent-browser --session ${A} screenshot ${shots.dashboard}`);
console.log("[A] r127-ref-dashboard.png captured (post-login, 1280x800)");
const pathA = deepParse(run(`agent-browser --session ${A} eval "location.pathname"`));
console.log("[A] post-login pathname:", pathA, pathA === "/login" ? "!! LOGIN FAILED — do not retry (rate limiter)" : "(the dashboard landing)");

const appAssetsRaw = run(`agent-browser --session ${A} eval "${ASSETS}"`);
classifyAssets("A-APP", appAssetsRaw);
run(`agent-browser --session ${A} close 2>/dev/null; true`);

// ================= PHASE B — mobile 390x844, own session from the start =================
console.log("\n===== PHASE B: mobile (390x844 from session start), session ref127mob =====");
const B = "ref127mob";
run(`agent-browser --session ${B} close 2>/dev/null; true`);
run(`agent-browser --session ${B} set viewport 390 844`);
run(`agent-browser --session ${B} open ${base}/login`);
await sleep(3500);
run(`agent-browser --session ${B} set viewport 390 844`);
await sleep(800);

// login #2 (attempt 2 of the 10-per-15min budget — the mobile session needs its own auth)
run(`agent-browser --session ${B} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await sleep(600);
run(`agent-browser --session ${B} fill 'input[type=password]' '$Abcd1234'`);
await sleep(600);
const snapB0 = run(`agent-browser --session ${B} snapshot -i -c`);
const mB0 = snapB0.match(/- button "[^"]*[Ss]ign in[^"]*" \[[^\]]*ref=(\w+)\]/);
if (mB0) {
  run(`agent-browser --session ${B} click @${mB0[1]}`);
  console.log("[B] sign-in clicked via ref", mB0[1]);
} else {
  console.log("[B] sign-in ref not matched — eval fallback:", run(`agent-browser --session ${B} eval "${CLICKSIGNIN}"`).trim());
}
await sleep(6500);

// the mobile root per the protocol: fresh load at 390 width
run(`agent-browser --session ${B} set viewport 390 844`);
run(`agent-browser --session ${B} open ${base}/`);
await sleep(4000);
run(`agent-browser --session ${B} set viewport 390 844`);
await sleep(1000);
const vpB = deepParse(run(`agent-browser --session ${B} eval "window.innerWidth + 'x' + window.innerHeight + ' @ ' + location.pathname"`));
console.log("[B] mobile viewport + path:", vpB);

const snapB1 = run(`agent-browser --session ${B} snapshot -i -c`);
const ham = snapB1.match(/- button "[^"]*[Tt]oggle[^"]*" \[[^\]]*ref=(\w+)\]/)
  || snapB1.match(/- button "[^"]*menu[^"]*" \[[^\]]*ref=(\w+)\]/i)
  || snapB1.match(/- button "[^"]*panel[^"]*" \[[^\]]*ref=(\w+)\]/i);
if (ham) {
  run(`agent-browser --session ${B} click @${ham[1]}`);
  console.log("[B] hamburger clicked via ref", ham[1]);
} else {
  console.log("[B] WARN: hamburger not matched — snapshot head:", snapB1.slice(0, 400));
  console.log("[B] hamburger eval fallback:", run(`agent-browser --session ${B} eval "${CLICKTOGGLE}"`).trim());
}
await sleep(1800);
run(`agent-browser --session ${B} screenshot ${shots.mobilenav}`);
console.log("[B] r127-ref-mobilenav-open.png captured (drawer open, 390x844)");
console.log("[B] hamburger geometry:", JSON.stringify(deepParse(run(`agent-browser --session ${B} eval "${HAMGEO}"`))));

const snapB2 = run(`agent-browser --session ${B} snapshot -i -c`);
const tr = snapB2.match(/- link "[^"]*Training[^"]*" \[[^\]]*ref=(\w+)\]/);
if (tr) {
  run(`agent-browser --session ${B} click @${tr[1]}`);
  console.log("[B] Training LMS clicked via ref", tr[1]);
} else {
  console.log("[B] WARN: Training LMS link not matched — snapshot head:", snapB2.slice(0, 400));
}
await sleep(3500);
run(`agent-browser --session ${B} screenshot ${shots.training}`);
console.log("[B] r127-ref-training-mobile.png captured");

const drawerRaw = run(`agent-browser --session ${B} eval "${DRAWER}"`).trim();
console.log("[B] REF drawer state post-training:", drawerRaw.slice(0, 300));
const pathB = deepParse(run(`agent-browser --session ${B} eval "location.pathname"`));
console.log("[B] post-training pathname:", pathB);
run(`agent-browser --session ${B} close 2>/dev/null; true`);

// ================= PHASE C — the byte-compare vs the r126 pins =================
console.log("\n===== PHASE C: md5 + byte compare vs the r126 standing pins =====");
for (const [k, p] of Object.entries(shots)) {
  if (!fs.existsSync(p)) { console.log(`${k}: MISSING — ${p}`); continue; }
  const h = md5(p);
  const b = fs.statSync(p).size;
  let verdict = "(no strict standing pin — informational)";
  if (PINS[k]) {
    verdict = (h === PINS[k].md5 && b === PINS[k].bytes)
      ? `IDENTICAL to the r126 pin (${PINS[k].md5.slice(0, 8)} / ${PINS[k].bytes} B)`
      : `DIFFERENT (pin was ${PINS[k].md5.slice(0, 8)} / ${PINS[k].bytes} B)`;
  }
  console.log(`${p.split("/").pop()}: md5 ${h} · ${b} B — ${verdict}`);
}
const mobStanding = `${out}/r123-ref-mobilenav-open.png`;
if (fs.existsSync(shots.mobilenav) && fs.existsSync(mobStanding)) {
  console.log(`(info) standing r123-ref-mobilenav-open.png: md5 ${md5(mobStanding).slice(0, 8)} · ${fs.statSync(mobStanding).size} B — the drawer-open captures have historically varied a few hundred bytes between rounds (overlay timing); no strict pin`);
}
console.log("\ndone");
process.exit(0);
