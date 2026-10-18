#!/usr/bin/env node
// r55-census.mjs — session-55 / parity round 54 census: the AUTH-BOUNDARY
// NAVIGATION WALK (the URL-level user journey at the session boundary —
// the family every prior round passed through but never censused as a
// walk: every census SIGNS IN and SIGNS OUT to reach its surface, yet
// the landing URLs themselves were never the measured object).
//
// The paired phases (both apps, desktop 1440×900 — the boundary family
// is URL-level, viewport-independent):
//   (D) the deep-route logged-out guard: /settings logged-out → the
//       settled /login URL + the from_url param's extracted path
//   (E) the from_url ROUND-TRIP: sign in from (D)'s landing → the
//       landing URL (REF returns the user to the page they asked for)
//   (G) authed /login: REF has NO redirect-away guard — the sign-in
//       form stays renderable while authed
//   (F) the LOGOUT walk: user menu → Logout from /settings → the
//       settled URL + from_url (REF carries the CURRENT page's URL)
//   (A) the post-login landing (no from_url — a DIRECT /login visit):
//       REF lands on the ROOT `/` (which serves the dashboard); the
//       clone lands on /dashboard
//   (B) the root-route serve: `/` authed → REF serves the dashboard
//       URL-UNCHANGED; the clone redirects to /dashboard (URL changes)
//   (C) the root-route guard: `/` logged-out → the settled URL + the
//       from_url param (REF carries the root URL)
//
// Self-contained per the workspace-reap pattern: boots the seeded :3200
// standalone inside THIS process tree; both browser sessions ride the
// surviving agent-browser daemon.
import { execSync, spawn } from "node:child_process";

function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
const settle = (ms) => new Promise(r => setTimeout(r, ms));

const repo = "/home/z/my-project/eon-hr";
const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const results = [];
function rec(name, a, b, note) {
  const match = JSON.stringify(a) === JSON.stringify(b);
  results.push({ name, match });
  console.log(`${match ? "MATCH" : "DIFF "} ${name}${note ? "  (" + note + ")" : ""}`);
  if (!match) { console.log(`  ref: ${JSON.stringify(a)}`); console.log(`  loc: ${JSON.stringify(b)}`); }
}

// ---- boot the seeded LOC server (this call's own process tree) ----
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r55.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await settle(500);
}
if (!up) { console.log("SERVER DOWN", run("tail -3 /tmp/loc3200-r55.log")); process.exit(1); }
console.log("seeded server up on :3200");

// evalStr — the r54 oneLine lesson: multi-line expressions hit
// "Invalid or unexpected token" (literal \n between tokens); every
// eval expression is one-lined BEFORE stringify.
function evalStr(expr) { return JSON.stringify(expr.split("\n").join(" ")); }
async function uiSignIn(session, base) {
  // a DIRECT /login visit — no from_url param (the (A) precondition)
  run(`agent-browser --session ${session} open ${base}/login`);
  await settle(2800);
  run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  await settle(400);
  run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
  await settle(400);
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const btn = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
  if (btn) run(`agent-browser --session ${session} click @${btn}`);
  await settle(4200);
}

// the settled-URL + content reader (the post-landing state)
const LANDING = `JSON.stringify({
  path: location.pathname,
  hasWelcome: document.body.textContent.includes('Welcome back,'),
  hasQuickActions: document.body.textContent.includes('Quick Actions'),
  hasSettings: !!Array.from(document.querySelectorAll('h1,h2,h3')).find(h => /settings/i.test(h.textContent||'')),
  hasPw: !!document.querySelector('input[type=password]')
})`;
async function readLanding(session) {
  const out = run(`agent-browser --session ${session} eval ${evalStr(LANDING)}`);
  try { return JSON.parse(JSON.parse(out.trim())); } catch { return { error: out.slice(0, 200) }; }
}

// the from_url extractor: reads the CURRENT URL's from_url param and
// normalizes it to a path (absolute URLs → pathname; path-forms as-is)
const FROM_URL = `JSON.stringify((() => {
  const u = new URL(location.href);
  const f = u.searchParams.get('from_url');
  if (!f) return null;
  try { return new URL(f).pathname; } catch { return f; }
})())`;
async function readFromUrl(session) {
  const out = run(`agent-browser --session ${session} eval ${evalStr(FROM_URL)}`);
  try { return JSON.parse(JSON.parse(out.trim())); } catch { return "ERR:" + out.slice(0, 120); }
}

// the user-menu LOGOUT walk (both sides have the same interior:
// the /sepnetflix2023/ trigger + the two-item menu with Logout)
async function userMenuLogout(session, base, phase) {
  const pre = location_path(session);
  const snap1 = run(`agent-browser --session ${session} snapshot -i -c`);
  const trig = (snap1.match(/- button "sepnetflix2023[^"]*" \[expanded=false, ref=(\w+)\]/) || [])[1];
  if (!trig) { console.log(`  [dbg ${session} ${phase}] no trigger — pre=${pre} snap=${snap1.split("\n").filter(l => l.includes("button")).slice(-4).join(" | ").slice(0, 260)}`); return { error: "no user trigger", path: pre }; }
  run(`agent-browser --session ${session} click @${trig}`);
  await settle(1300);
  const snap2 = run(`agent-browser --session ${session} snapshot -i -c`);
  const lo = (snap2.match(/- menuitem "Logout" \[ref=(\w+)\]/) || [])[1];
  if (!lo) { console.log(`  [dbg ${session} ${phase}] trigger ok, no Logout item — snap=${snap2.split("\n").filter(l => l.includes("menuitem")).join(" | ").slice(0, 260)}`); return { error: "no Logout item", path: pre }; }
  run(`agent-browser --session ${session} click @${lo}`);
  await settle(2800);
  return null;
}
function location_path(session) { return run(`agent-browser --session ${session} get url`).trim(); }

// ---- the per-side walk ----
async function walk(session, base, tag) {
  const out = {};
  run(`agent-browser --session ${session} set viewport 1440 900`);

  // normalize: land authed on /settings (sign in if the session died)
  run(`agent-browser --session ${session} open ${base}/settings`);
  await settle(2500);
  let url = location_path(session);
  if (url.includes("/login")) { await uiSignIn(session, base); run(`agent-browser --session ${session} open ${base}/settings`); await settle(2000); }

  // (D) the deep-route logged-out guard
  const dErr = await userMenuLogout(session, base, "D");
  if (dErr) console.log(`  [dbg ${session}] (D) logout failed: ${JSON.stringify(dErr).slice(0, 200)}`);
  run(`agent-browser --session ${session} open ${base}/settings`);
  await settle(2800);
  out.guardUrl = location_path(session).replace(base, "");
  out.guardFrom = await readFromUrl(session);

  // (E) the from_url round-trip: sign in from (D)'s landing
  run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  await settle(400);
  run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
  await settle(400);
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const btn = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
  if (btn) run(`agent-browser --session ${session} click @${btn}`);
  await settle(4200);
  out.roundTrip = (await readLanding(session));

  // (G) authed /login
  run(`agent-browser --session ${session} open ${base}/login`);
  await settle(2800);
  out.authedLogin = await readLanding(session);

  // (F) the logout walk from /settings
  run(`agent-browser --session ${session} open ${base}/settings`);
  await settle(2200);
  console.log(`  [dbg ${session}] (F) pre-walk url=${location_path(session)}`);
  const fErr = await userMenuLogout(session, base, "F");
  out.logoutWalk = fErr ? fErr : { path: location_path(session).replace(base, "").split("?")[0], from: await readFromUrl(session) };

  // (A) the post-login landing (no from_url)
  await uiSignIn(session, base);
  out.postLogin = await readLanding(session);

  // (B) the root-route serve
  run(`agent-browser --session ${session} open ${base}/`);
  await settle(2800);
  out.rootServe = await readLanding(session);

  // (C) the root-route guard
  const cErr = await userMenuLogout(session, base, "C");
  if (cErr) console.log(`  [dbg ${session}] (C) logout failed: ${JSON.stringify(cErr).slice(0, 160)}`);
  run(`agent-browser --session ${session} open ${base}/`);
  await settle(3000);
  out.rootGuard = { path: location_path(session).replace(base, "").split("?")[0], from: await readFromUrl(session) };

  console.log(`\n===== ${tag} =====`);
  console.log(JSON.stringify(out, null, 1));
  return out;
}

const ref = await walk("ref", baseRef, "REF");
const loc = await walk("loc", baseLoc, "LOC (current build)");

// ---- the paired comparison (normalized: paths + markers) ----
console.log("\n===== THE PAIRED CENSUS =====");
rec("(D) deep-route guard: /settings logged-out → /login + from_url path",
  { path: ref.guardUrl.split("?")[0], from: ref.guardFrom },
  { path: loc.guardUrl.split("?")[0], from: loc.guardFrom });
rec("(E) the from_url round-trip lands back on the guarded page",
  { path: ref.roundTrip.path, settings: ref.roundTrip.hasSettings },
  { path: loc.roundTrip.path, settings: loc.roundTrip.hasSettings });
rec("(G) authed /login stays (no redirect-away guard)",
  { path: ref.authedLogin.path, pw: ref.authedLogin.hasPw },
  { path: loc.authedLogin.path, pw: loc.authedLogin.hasPw });
rec("(F) the logout walk carries the current page as from_url",
  ref.logoutWalk.error ? ref.logoutWalk : { path: ref.logoutWalk.path, from: ref.logoutWalk.from },
  loc.logoutWalk.error ? loc.logoutWalk : { path: loc.logoutWalk.path, from: loc.logoutWalk.from });
rec("(A) the post-login landing (no from_url) is the ROOT",
  { path: ref.postLogin.path, welcome: ref.postLogin.hasWelcome },
  { path: loc.postLogin.path, welcome: loc.postLogin.hasWelcome });
rec("(B) the root serves the dashboard URL-unchanged",
  { path: ref.rootServe.path, welcome: ref.rootServe.hasWelcome, quick: ref.rootServe.hasQuickActions },
  { path: loc.rootServe.path, welcome: loc.rootServe.hasWelcome, quick: loc.rootServe.hasQuickActions });
rec("(C) the root-route guard carries the root as from_url",
  ref.rootGuard, loc.rootGuard);

const matches = results.filter(r => r.match).length;
console.log(`\n===== ${matches}/${results.length} MATCH =====`);
process.exit(0);
