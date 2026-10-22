#!/usr/bin/env node
// r78-console-census.mjs — session 78 / parity round 77 fresh-eyes
// instrument: THE FULL-ROUTE CONSOLE CENSUS. Byte-parity PNGs prove the
// pixels match, but they cannot prove zero RUNTIME errors — a route can
// render pixel-identical while throwing console errors (a swallowed
// hydration mismatch, a failed background fetch, a 4xx/5xx XHR). This
// census walks the ENTIRE 61-route registry on the LOC standalone
// (:3200, seeded DB, authed) and reads the browser's own console buffer
// per route: clear → open → settle → read error/warning/httpFail counts.
// PASS = 61/61 routes console-CLEAN (zero errors, zero warnings).
// The route list is imported from the codebase's own registry
// (src/lib/sitemap-routes.ts APP_ROUTES — the sitemap contract).
import { execSync } from "node:child_process";
import fs from "node:fs";

const repo = "/home/z/my-project/eon-hr";
const baseLoc = "http://127.0.0.1:3200";
function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 160); } }

// extract APP_ROUTES from the registry (no ts import needed in plain node)
const src = fs.readFileSync(`${repo}/src/lib/sitemap-routes.ts`, "utf8");
const seg = src.slice(src.indexOf("APP_ROUTES"), src.indexOf("APP_ROUTES") + 4000).split("];")[0];
const routes = [...seg.matchAll(/"\/([a-z]+)"/g)].map(m => "/" + m[1]);
console.log(`route registry: ${routes.length} routes`);
if (routes.length !== 61) { console.log("ROUTE EXTRACTION FAILED — expected 61"); process.exit(1); }

// health check
if (run(`curl -sf --max-time 3 ${baseLoc}/api/health`).startsWith("ERR")) { console.log("SERVER DOWN on :3200"); process.exit(1); }

// dedicated census session: 1440x900, authed
const S = "loc78census";
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

// the census: per route clear → open → settle → read
const results = [];
let clean = 0;
for (const route of routes) {
  run(`agent-browser --session ${S} console --clear`);
  run(`agent-browser --session ${S} open ${baseLoc}${route}`);
  await new Promise(r => setTimeout(r, 2600));
  const raw = run(`agent-browser --session ${S} console --json`);
  let entries = [];
  try { const j = JSON.parse(raw); entries = Array.isArray(j) ? j : (j.logs || j.entries || []); } catch { try { const j2 = JSON.parse(raw.trim().replace(/^"|"$/g, "")); entries = Array.isArray(j2) ? j2 : (j2.logs || []); } catch { entries = [{ level: "PARSE-FAIL", text: raw.slice(0, 120) }]; } }
  const errors = entries.filter(e => /error/i.test(e.level || e.type || ""));
  const warnings = entries.filter(e => /warn/i.test(e.level || e.type || ""));
  const httpFails = entries.filter(e => /\b(40[0-9]|50[0-9])\b/.test(String(e.text || "")));
  const bad = errors.length + warnings.length + httpFails.length;
  const status = bad === 0 ? "CLEAN" : `NOISE e=${errors.length} w=${warnings.length} http=${httpFails.length}`;
  if (bad === 0) clean++;
  results.push({ route, status, sample: bad ? (errors[0] || warnings[0] || httpFails[0] || {}).text : "" });
  console.log(`${bad === 0 ? "CLEAN" : "NOISE"}  ${route.padEnd(24)} ${bad ? String((errors[0] || warnings[0] || {}).text || "").slice(0, 100) : ""}`);
}

console.log(`\n==== CONSOLE CENSUS: ${clean}/${routes.length} routes console-CLEAN ====`);
const noisy = results.filter(r => r.status !== "CLEAN");
if (noisy.length) { console.log("NOISY ROUTES:"); for (const n of noisy) console.log(`  ${n.route}: ${n.status} — ${String(n.sample).slice(0, 160)}`); }
run(`agent-browser --session ${S} close 2>/dev/null; true`);
process.exit(noisy.length ? 2 : 0);
