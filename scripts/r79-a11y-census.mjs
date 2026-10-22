#!/usr/bin/env node
// r79-a11y-census.mjs — session 79 / parity round 78 fresh-eyes
// instrument: THE FULL-ROUTE ACCESSIBILITY CENSUS — the program's first
// a11y evidence angle. The prior rounds proved pixels (byte-parity PNGs),
// runtime cleanliness (the r78 console census), transfer weight (r76) and
// Chrome's own installability verdict (r75) — but the WCAG 2.2 AA claim
// ("the baseline for all user-facing UI") has never been measured across
// the surface. This census walks the ENTIRE 61-route registry on the LOC
// standalone (:3200, seeded DB, authed) and reads DOM-declarative a11y
// signals per route:
//   FAIL-class findings (count against the route):
//     - img without alt (and without role=presentation/aria-hidden)
//     - non-hidden text-like input/textarea/select without ANY accessible
//       name (no label[for], aria-label, aria-labelledby, placeholder,
//       title)
//     - button/a without accessible text (no textContent, aria-label, title)
//     - iframe without title
//     - positive tabindex (tabindex > 0)
//     - skipped heading levels among visible headings (e.g. h2 -> h4)
//   WEAK-class findings (recorded, not failing): placeholder-only form
//   control names; missing <html lang>; empty <title>.
// PASS = 61/61 routes with zero FAIL-class findings.
// The route list is imported from the codebase's own registry
// (src/lib/sitemap-routes.ts APP_ROUTES — the sitemap contract).
import { execSync } from "node:child_process";
import fs from "node:fs";

const repo = "/home/z/my-project/eon-hr";
const baseLoc = "http://127.0.0.1:3200";
function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 160); } }
// base64 eval (the agent-browser -b mode) — the long a11y CHECK payload
// trips /bin/sh quote processing when passed as a plain argv string; the
// base64 route is the documented escaping-safe path.
function evalB64(session, expr) {
  const b64 = Buffer.from(expr, "utf8").toString("base64");
  return run(`agent-browser --session ${session} eval -b ${b64}`);
}

// extract APP_ROUTES from the registry (no ts import needed in plain node)
const src = fs.readFileSync(`${repo}/src/lib/sitemap-routes.ts`, "utf8");
const seg = src.slice(src.indexOf("APP_ROUTES"), src.indexOf("APP_ROUTES") + 4000).split("];")[0];
const routes = [...seg.matchAll(/"\/([a-z]+)"/g)].map(m => "/" + m[1]);
console.log(`route registry: ${routes.length} routes`);
if (routes.length !== 61) { console.log("ROUTE EXTRACTION FAILED — expected 61"); process.exit(1); }

// health check
if (run(`curl -sf --max-time 3 ${baseLoc}/api/health`).startsWith("ERR")) { console.log("SERVER DOWN on :3200"); process.exit(1); }

// dedicated census session: 1440x900, authed
const S = "loc79census";
run(`agent-browser --session ${S} close 2>/dev/null; true`);
run(`agent-browser --session ${S} set viewport 1440 900`);
run(`agent-browser --session ${S} open ${baseLoc}/login`);
await new Promise(r => setTimeout(r, 2600));
run(`agent-browser --session ${S} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise(r => setTimeout(r, 400));
run(`agent-browser --session ${S} fill 'input[type=password]' '$Abcd1234'`);
await new Promise(r => setTimeout(r, 500));
const snap = run(`agent-browser --session ${S} snapshot -i -c`);
const btnRef = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
if (btnRef) run(`agent-browser --session ${S} click @${btnRef}`);
await new Promise(r => setTimeout(r, 4200));
const postAuth = run(`agent-browser --session ${S} get url`).trim();
console.log("census session authed:", postAuth);
if (postAuth.includes("/login")) { console.log("AUTH FAILED — aborting"); process.exit(1); }

const CHECK = `(() => {
  const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 || r.height > 0; };
  const fails = []; const weaks = [];
  // 1. document-level signals
  const html = document.documentElement;
  if (!html.getAttribute('lang')) weaks.push('html-lang-missing');
  if (!document.title || !document.title.trim()) weaks.push('title-empty');
  if (!document.querySelector('meta[name=viewport]')) weaks.push('viewport-meta-missing');
  // 2. images without alt (decorative role/aria-hidden exempt)
  for (const img of document.querySelectorAll('img')) {
    if (img.getAttribute('role') === 'presentation' || img.getAttribute('aria-hidden') === 'true') continue;
    if (img.getAttribute('alt') === null) fails.push('img-no-alt: ' + (img.getAttribute('src')||'').slice(-40));
  }
  // 3. form controls without any accessible name
  const labelledBy = (el) => {
    const lb = el.getAttribute('aria-labelledby');
    if (lb && lb.split(/\\s+/).some(id => document.getElementById(id))) return true;
    const id = el.id;
    if (id && document.querySelector('label[for="' + id + '"]')) return true;
    const p = el.closest('label');
    if (p) return true;
    if (el.getAttribute('aria-label')) return true;
    if (el.getAttribute('title')) return true;
    if (el.getAttribute('placeholder')) return 'weak';
    return false;
  };
  for (const el of document.querySelectorAll('input, textarea, select')) {
    const type = (el.getAttribute('type') || 'text').toLowerCase();
    if (['hidden','submit','button','reset','image','checkbox','radio','file'].includes(type)) continue;
    if (!visible(el)) continue;
    const res = labelledBy(el);
    if (res === false) fails.push('control-no-name: ' + type + ':' + (el.name || el.id || '?').slice(0,24));
    else if (res === 'weak') weaks.push('placeholder-only: ' + type + ':' + (el.name || el.id || '?').slice(0,24));
  }
  // 4. buttons/links without accessible text
  for (const el of document.querySelectorAll('button, a')) {
    if (el.getAttribute('aria-hidden') === 'true') continue;
    if (!visible(el)) continue;
    const name = (el.textContent || '').trim() || el.getAttribute('aria-label') || el.getAttribute('title');
    if (!name) fails.push((el.tagName === 'A' ? 'link' : 'button') + '-no-name');
  }
  // 5. iframes without title
  for (const f of document.querySelectorAll('iframe')) {
    if (!f.getAttribute('title')) fails.push('iframe-no-title');
  }
  // 6. positive tabindex
  for (const el of document.querySelectorAll('[tabindex]')) {
    const ti = parseInt(el.getAttribute('tabindex'), 10);
    if (ti > 0) { fails.push('positive-tabindex: ' + ti); break; }
  }
  // 7. skipped heading levels among visible headings
  const levels = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(visible).map(h => parseInt(h.tagName[1], 10));
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] - levels[i-1] > 1) { fails.push('heading-skip: h' + levels[i-1] + '->h' + levels[i]); break; }
  }
  return { fails, weaks, headings: levels.slice(0, 10) };
})()`;

// the census: per route open -> settle -> read the a11y signals
const results = [];
let clean = 0;
for (const route of routes) {
  run(`agent-browser --session ${S} open ${baseLoc}${route}`);
  await new Promise(r => setTimeout(r, 2400));
  const raw = evalB64(S, CHECK);
  let res;
  try { res = JSON.parse(raw.trim()); } catch { try { res = JSON.parse(raw.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { res = { error: raw.slice(0, 200) }; } }
  const fails = res.fails || [];
  const weaks = res.weaks || [];
  const ok = !res.error && fails.length === 0;
  if (ok) clean++;
  results.push({ route, ok, fails, weaks, headings: res.headdings || res.headings });
  console.log(`${ok ? "CLEAN" : "FIND "} ${route.padEnd(24)} fails=${fails.length} weaks=${weaks.length}${fails.length ? " :: " + fails.slice(0, 4).join(" | ") : ""}${weaks.length ? " :: WEAK: " + [...new Set(weaks)].slice(0, 3).join(",") : ""}`);
}

console.log(`\n=== a11y census: ${clean}/${routes.length} routes FAIL-class-CLEAN ===`);
const allFails = results.filter(r => r.fails.length);
if (allFails.length) {
  console.log("routes with FAIL-class findings:");
  for (const r of allFails) console.log(`  ${r.route}: ${JSON.stringify(r.fails)}`);
}
const allWeaks = results.filter(r => r.weaks.length);
console.log(`\nroutes with WEAK-class notes: ${allWeaks.length}`);
for (const r of allWeaks.slice(0, 12)) console.log(`  ${r.route}: ${JSON.stringify([...new Set(r.weaks)])}`);
run(`agent-browser --session ${S} close 2>/dev/null; true`);
process.exit(0);
