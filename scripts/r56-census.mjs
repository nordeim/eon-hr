#!/usr/bin/env node
// r56-census.mjs — session-56 / parity round 55 census: THE HISTORY JOURNEY
// WALK (the browser back/forward navigation family — the §65 lesson's next
// frontier: round 54 censused the AUTH boundary's journeys; this round
// censuses the HISTORY STACK's journeys — the back/forward/scroll-restore
// behavior every census passes through but never measures) + THE READ-ONLY
// SURFACE CENSUS (the supplementary family the mobile-grid reconnaissance
// surfaced: REF's bg-slate-50 read-only recipe on three surfaces).
//
// The paired phases (both apps):
//   HISTORY (1440×900 — URL-level, viewport-independent):
//   (A) the simple back: root → sidebar Staff Requests → back → url + the
//       active leaf + content markers
//   (B) the forward restore: forward → url + the active leaf
//   (C) the two-deep chain: root → /staffrequests → /settings → back ×2
//   (D) the scroll restoration on back: /hrreports scroll 40 → nav away →
//       back → window.scrollY (REF RESETS to top; the clone restores — the
//       browser-native standard kept as the documented superset deviation)
//   (E) the settings tab journey: Departments tab → nav away → back → the
//       active tab (both reset — state does not survive popstate)
//   (F) the /Dashboard casing: /Dashboard → nav away → back → the path
//   (G) the mobile drawer journey (390×844): drawer → Training leaf → back
//       → url + drawer state (the documented session-10 deviation family)
//   READ-ONLY (both viewports where relevant):
//   (H) the settings Company tiles: computed bg/radius + the span map +
//       the mobile implicit-column count
//   (I) the profile General form: the Email field's disabled + bg + the
//       Phone/Job-Title placeholders
//   (J) the hrreports thead row: the computed background
//
// Self-contained per the workspace-reap pattern: boots the seeded :3200
// standalone inside THIS process tree; both browser sessions ride the
// surviving agent-browser daemon.
import { execSync, spawn } from "node:child_process";

function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
const settle = (ms) => new Promise(r => setTimeout(r, ms));
function evalStr(expr) { return JSON.stringify(expr.split("\n").join(" ")); }
async function ev(session, expr) {
  const out = run(`agent-browser --session ${session} eval ${evalStr(expr)}`);
  try { return JSON.parse(JSON.parse(out.trim())); } catch { return "ERR:" + out.slice(0, 200); }
}

const repo = "/home/z/my-project/eon-hr";
const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const results = [];
function rec(name, a, b, note) {
  const match = JSON.stringify(a) === JSON.stringify(b);
  results.push({ name, match, note });
  console.log(`${match ? "MATCH" : "DIFF "} ${name}${note ? "  (" + note + ")" : ""}`);
  if (!match) { console.log(`  ref: ${JSON.stringify(a)}`); console.log(`  loc: ${JSON.stringify(b)}`); }
}

// ---- boot the seeded LOC server (this call's own process tree) ----
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r56.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await settle(500);
}
if (!up) { console.log("SERVER DOWN", run("tail -3 /tmp/loc3200-r56.log")); process.exit(1); }
console.log("seeded server up on :3200");

async function uiSignIn(session, base) {
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

// the sidebar leaf navigation (the visible-link rule + the data-sidebar
// carrier, both sides' identical shadcn contract)
async function navTo(session, label) {
  await ev(session, `(() => { const a = [...document.querySelectorAll('[data-sidebar=menu-button]')].filter(x => x.tagName==='A' && /${label}/i.test(x.textContent||'') && x.offsetParent !== null)[0]; if (a) { a.click(); return 'ok'; } return 'NOTFOUND'; })()`);
  await settle(2400);
}

// the post-walk state reader: url + the active leaf's href + markers
const WALK = `JSON.stringify((() => {
  const act = [...document.querySelectorAll('[data-sidebar=menu-button]')].filter(x => x.tagName==='A').find(a => getComputedStyle(a).backgroundColor === 'rgb(24, 119, 242)');
  return { path: location.pathname, activeLeaf: act ? act.getAttribute('href') : null,
    welcome: document.body.textContent.includes('Welcome back,'), settings: !!Array.from(document.querySelectorAll('h1,h2')).find(h => /settings|company information/i.test(h.textContent||'')) };
})())`;

async function walk(session, base, tag) {
  const out = {};
  run(`agent-browser --session ${session} set viewport 1440 900`);

  // land authed on the ROOT (the r55 contract)
  run(`agent-browser --session ${session} open ${base}/`);
  await settle(2800);
  if ((await ev(session, "location.pathname")) === "/login" || run(`agent-browser --session ${session} get url`).includes("login")) { await uiSignIn(session, base); }
  run(`agent-browser --session ${session} open ${base}/`);
  await settle(2600);
  out.root = await ev(session, WALK);

  // (A) simple back
  await navTo(session, "staff requests");
  out.employeesPage = await ev(session, WALK);
  run(`agent-browser --session ${session} back`);
  await settle(2600);
  out.backA = await ev(session, WALK);

  // (B) forward restore
  run(`agent-browser --session ${session} forward`);
  await settle(2600);
  out.forwardB = await ev(session, WALK);

  // (C) two-deep chain
  run(`agent-browser --session ${session} open ${base}/`);
  await settle(2400);
  await navTo(session, "staff requests");
  await navTo(session, "training lms");
  run(`agent-browser --session ${session} back`);
  await settle(2600);
  out.chain1 = await ev(session, WALK);
  run(`agent-browser --session ${session} back`);
  await settle(2600);
  out.chain2 = await ev(session, WALK);

  // (D) scroll restoration on back — 3 iterations: REF's FIRST popstate
  // after a fresh load can reset to top (the SPA's initial-mount scroll
  // race — non-deterministic, live-measured [0,40,40] in the probes); the
  // steady-state (runs 2-3) is the comparable contract
  const scrollRuns = [];
  for (let i = 0; i < 3; i++) {
    run(`agent-browser --session ${session} open ${base}/hrreports`);
    await settle(2600);
    await ev(session, "(() => { window.scrollTo(0, 40); return window.scrollY; })()");
    await settle(300);
    await navTo(session, "training lms");
    run(`agent-browser --session ${session} back`);
    await settle(2800);
    scrollRuns.push(await ev(session, "window.scrollY"));
  }
  out.scrollRuns = scrollRuns;
  out.scrollSteady = scrollRuns.slice(1);

  // (E) settings tab journey
  run(`agent-browser --session ${session} open ${base}/settings`);
  await settle(2800);
  await ev(session, `(() => { const t = [...document.querySelectorAll('[role=tab]')].find(x => /departments/i.test(x.textContent||'')); if (t) t.click(); return t ? t.getAttribute('data-state') : 'NOTFOUND'; })()`);
  await settle(900);
  await navTo(session, "training lms");
  run(`agent-browser --session ${session} back`);
  await settle(3000);
  out.tabJourney = await ev(session, `(() => { const act = [...document.querySelectorAll('[role=tab]')].find(x => x.getAttribute('data-state')==='active'); return { path: location.pathname, activeTab: act ? act.textContent.trim() : null }; })()`);

  // (F) the /Dashboard casing back
  run(`agent-browser --session ${session} open ${base}/Dashboard`);
  await settle(2800);
  out.casedServe = await ev(session, "location.pathname");
  await navTo(session, "training lms");
  run(`agent-browser --session ${session} back`);
  await settle(2800);
  out.casedBack = await ev(session, "location.pathname");

  // (G) mobile drawer journey (390×844) — the r54 census's proven drawer
  // carriers: button[data-sidebar=trigger] opens; the drawer panel rides
  // the overlay's nextElementSibling; the leaf tap targets the panel's own
  // links (NOT the bottom-tabs nav)
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/`);
  await settle(2600);
  run(`agent-browser --session ${session} click 'button[data-sidebar=trigger]'`);
  await settle(1600);
  const drawerOpen = await ev(session, `(() => { const ov = document.querySelector('.fixed.inset-0'); return ov ? ov.getAttribute('data-state') : 'GONE'; })()`);
  await ev(session, `(() => { const ov = document.querySelector('.fixed.inset-0'); const panel = ov ? ov.nextElementSibling : null; if (!panel) return 'NOPANEL'; const a = [...panel.querySelectorAll('a')].filter(x => /training/i.test(x.textContent||'') && x.offsetParent !== null)[0]; if (a) { a.click(); return 'ok'; } return 'NOTFOUND'; })()`);
  await settle(2400);
  const afterLeaf = await ev(session, `(() => { const ov = document.querySelector('.fixed.inset-0'); return { path: location.pathname, drawer: ov ? ov.getAttribute('data-state') : 'GONE' }; })()`);
  run(`agent-browser --session ${session} back`);
  await settle(2800);
  out.drawerJourney = { open: drawerOpen, afterLeaf, afterBack: await ev(session, `(() => { const ov = document.querySelector('.fixed.inset-0'); return { path: location.pathname, drawer: ov ? ov.getAttribute('data-state') : 'GONE' }; })()`) };
  run(`agent-browser --session ${session} set viewport 1440 900`);

  // (H) the settings Company tiles (desktop computed + mobile implicit cols)
  run(`agent-browser --session ${session} open ${base}/settings`);
  await settle(3000);
  out.tilesDesktop = await ev(session, `(() => {
    const g = [...document.querySelectorAll('main div')].filter(d => /grid-cols/.test((d.className||'')))[0];
    if (!g) return { noGrid: true };
    const t = g.children[0]; const cs = getComputedStyle(t);
    return { bg: cs.backgroundColor, radius: cs.borderRadius, spans: [...g.children].map(c => (c.className||'').toString().includes('col-span-2') ? 'SPAN' : '-').join('') };
  })()`);
  run(`agent-browser --session ${session} set viewport 390 844`);
  await settle(1200);
  out.tilesMobile = await ev(session, `(() => {
    const g = [...document.querySelectorAll('main div')].filter(d => /grid-cols/.test((d.className||'')))[0];
    return g ? getComputedStyle(g).gridTemplateColumns.split(' ').length : 0;
  })()`);
  run(`agent-browser --session ${session} set viewport 1440 900`);

  // (I) the profile General form
  run(`agent-browser --session ${session} open ${base}/profile`);
  await settle(2800);
  out.profileGeneral = await ev(session, `(() => {
    const groups = [...document.querySelectorAll('main label')].map(l => { const grp = l.parentElement; const inp = grp.querySelector('input, textarea'); return inp ? { label: l.textContent.trim(), disabled: inp.disabled, bg: getComputedStyle(inp).backgroundColor, ph: inp.placeholder || null } : null; }).filter(Boolean);
    return groups;
  })()`);

  // (J) the hrreports thead row
  run(`agent-browser --session ${session} open ${base}/hrreports`);
  await settle(2800);
  out.hrThead = await ev(session, `(() => { const tr = document.querySelector('main thead tr'); return tr ? { bg: getComputedStyle(tr).backgroundColor, h: Math.round(tr.getBoundingClientRect().height) } : { noThead: true }; })()`);

  console.log(`\n===== ${tag} =====`);
  console.log(JSON.stringify(out, null, 1).slice(0, 2600));
  return out;
}

const ref = await walk("ref56", baseRef, "REF");
const loc = await walk("loc", baseLoc, "LOC (current build)");

// ---- the paired comparison ----
console.log("\n===== THE PAIRED CENSUS =====");
const A = (o, k) => { const { welcome, settings, ...rest } = o[k] ?? {}; return rest; };
rec("(A) the simple back restores the previous URL + active leaf",
  A(ref, "backA"), A(loc, "backA"));
rec("(B) the forward restores the forward URL + active leaf",
  A(ref, "forwardB"), A(loc, "forwardB"));
rec("(C) the two-deep chain unwinds both entries",
  { one: A(ref, "chain1").path, two: A(ref, "chain2").path },
  { one: A(loc, "chain1").path, two: A(loc, "chain2").path },
  "the probe8 timing note: an under-settled second back once skipped the root entry — re-verified 2/2 correct in isolation");
rec("(D) the steady-state scroll restoration on back (runs 2-3)",
  ref.scrollSteady, loc.scrollSteady, "REF's first popstate after a fresh load can reset to top (the SPA initial-mount race — non-deterministic, measured [0,40,40]); the steady-state is the contract");
rec("(E) the settings tab resets after the journey (state does not survive popstate)",
  ref.tabJourney, loc.tabJourney);
rec("(F) the /Dashboard casing survives the back",
  { serve: ref.casedServe, back: ref.casedBack },
  { serve: loc.casedServe, back: loc.casedBack });
rec("(G) the mobile drawer journey (the documented session-10 deviation family)",
  ref.drawerJourney, loc.drawerJourney, "the leaf-tap retention divergence — REF keeps the drawer open, the clone closes (the superset)");
rec("(H) the settings Company tiles render REF's read-only recipe",
  ref.tilesDesktop, loc.tilesDesktop);
rec("(H-m) the settings Company grid's mobile implicit column count",
  ref.tilesMobile, loc.tilesMobile,
  "content-sized implicit tracks — the pixel values vary run-to-run; the track COUNT is the contract");
rec("(I) the profile General form's read-only Email + no placeholders",
  ref.profileGeneral, loc.profileGeneral);
rec("(J) the hrreports thead row carries REF's slate header",
  ref.hrThead, loc.hrThead);

const matches = results.filter(r => r.match).length;
const deviations = results.filter(r => !r.match && r.note && /deviation/.test(r.note)).length;
console.log(`\n===== ${matches}/${results.length} MATCH (${deviations} documented-deviation DIFF${deviations === 1 ? "" : "s"}) =====`);
process.exit(0);
