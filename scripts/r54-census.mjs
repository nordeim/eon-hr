#!/usr/bin/env node
// r54-census.mjs — session-54 / parity round 53 census: the MOBILE-NAV
// FULL INTERACTION WALK (the user-called-out surface at its deepest
// level). Rounds 50–52 censused the mobile nav's at-rest chrome, the
// drawer panel/footer, the expanded-group interiors, and the per-route
// active-state family — all STATIC states. This round pairs the full
// user journey paired-live at 390×844 on both apps:
//   (A) the at-rest chrome (hamburger geometry + the 5-tab bar)
//   (B) hamburger tap → the drawer opens (settled overlay + panel)
//   (C) the drawer's default group states (aria-expanded map)
//   (D) group expansion round-trip (tap Payroll → sub-items render)
//   (E) THE LEAF-TAP ROUND-TRIP — tap the Training LMS leaf, watch the
//       path change AND the drawer's retention state over time. The
//       live REF probes this round found REF's drawer STAYS OPEN after
//       leaf navigation (two clean tests: /payroll + /training, real
//       CDP clicks, drawer still open 1.9s later) while the clone
//       closes it (E2E-pinned since session 9) — the never-paired-live
//       interaction divergence.
//   (F) overlay tap (full pointerdown/up sequence — Radix ignores bare
//       click() dispatches) → the drawer closes
//   (G) bottom-tab tap → route lands + the active computed pair
// Self-contained per the workspace-reap pattern: boots the seeded :3200
// standalone inside THIS process tree, auths loc fresh, ref rides the
// surviving daemon session (re-auth if expired).
import { execSync, spawn } from "node:child_process";

function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
// evalOn — the r52 pattern: parse the pretty-printed object output
// directly, unwrap quoted scalars, retry once on command failure.
async function evalOn(session, expr, ms = 0, retries = 1) {
  if (ms) await new Promise(r => setTimeout(r, ms));
  const oneLine = expr.split("\n").join(" ");
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const out = execSync(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`, { stdio: "pipe", timeout: 45000 }).toString();
      const t = out.trim();
      try { return JSON.parse(t); } catch { /* scalar or bare text */ }
      const m = t.match(/^"([\s\S]*)"$/); // a JSON-encoded scalar string
      return m ? m[1] : t.slice(0, 300);
    } catch (e) {
      if (attempt === retries) return { error: String(e.stderr || e.stdout || e).slice(0, 300) };
      await new Promise(r => setTimeout(r, 900));
    }
  }
}

const repo = "/home/z/my-project/eon-hr";
const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const results = [];
function rec(name, a, b, note) {
  const match = JSON.stringify(a) === JSON.stringify(b);
  results.push({ name, match });
  console.log(`${match ? "MATCH" : "DIFF "} ${name}${note ? "  (" + note + ")" : ""}`);
  if (!match) { console.log(`  ref: ${JSON.stringify(a).slice(0, 500)}`); console.log(`  loc: ${JSON.stringify(b).slice(0, 500)}`); }
}

// ---- boot the seeded LOC server (this call's own process tree) ----
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r54.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN", run("tail -3 /tmp/loc3200-r54.log")); process.exit(1); }
console.log("seeded server up on :3200");

// ---- auth helper (the $-password single-quote rule) ----
async function auth(session, base) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3000));
  run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  await new Promise(r => setTimeout(r, 400));
  run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
  await new Promise(r => setTimeout(r, 400));
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const ref = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
  if (ref) run(`agent-browser --session ${session} click @${ref}`);
  await new Promise(r => setTimeout(r, 4200));
}

// ---- ref: mobile viewport + (re)auth + dashboard ----
run(`agent-browser --session ref set viewport 390 844`);
let refUrl = run('agent-browser --session ref get url').trim();
if (!refUrl.includes("eon.base44.app") || refUrl.includes("login")) {
  await auth("ref", baseRef);
}
run(`agent-browser --session ref open ${baseRef}/dashboard`);
await new Promise(r => setTimeout(r, 2500));

// ---- loc: fresh auth at mobile viewport ----
await auth("loc", baseLoc);
run(`agent-browser --session loc open ${baseLoc}/dashboard`);
await new Promise(r => setTimeout(r, 2000));

// ---------- read helpers (shared on both sides) ----------
const AT_REST = `JSON.stringify({
  path: location.pathname,
  trigger: (function(){ var b=document.querySelector('button[data-sidebar=trigger]'); return b ? {w: b.offsetWidth, h: b.offsetHeight, sr: (b.querySelector('.sr-only')||{}).textContent} : null })(),
  bottomBar: (function(){ var navs=Array.from(document.querySelectorAll('nav')); var nav=navs.find(function(n){return getComputedStyle(n).position==='fixed' && n.getBoundingClientRect().top>300}); return nav ? {tabs: Array.from(nav.querySelectorAll('a')).map(function(a){return a.textContent.trim()}), h: nav.offsetHeight} : null })()
})`;

const DRAWER_STATE = `JSON.stringify((function(){
  var ov=document.querySelector('.fixed.inset-0');
  if(!ov || ov.getAttribute('data-state')!=='open') return null;
  var p=ov.nextElementSibling;
  var cs=getComputedStyle(p);
  // computed truth only — the panelCls bytes are the documented
  // class-construction allowance (REF concatenates the shadcn Sheet
  // base; the clone hand-authors the geometry — the rendered family
  // is identical, the r52 cn()-merge lesson)
  return {ovBg: getComputedStyle(ov).backgroundColor, ovState: ov.getAttribute('data-state'),
          panelW: p.offsetWidth, panelBg: cs.backgroundColor, panelBR: cs.borderRightColor,
          panelTransform: cs.transform};
})())`;

const GROUP_MAP = `JSON.stringify((function(){
  var ov=document.querySelector('.fixed.inset-0');
  if(!ov) return null;
  var sib=ov.nextElementSibling;
  var gs=Array.from(sib.querySelectorAll('[aria-controls]'));
  return gs.map(function(g){return {l: g.textContent.trim().slice(0,18), e: g.getAttribute('aria-expanded')}});
})())`;

const SUBITEMS = `JSON.stringify((function(){
  var ov=document.querySelector('.fixed.inset-0');
  if(!ov) return null;
  var sib=ov.nextElementSibling;
  var gs=Array.from(sib.querySelectorAll('[aria-controls]'));
  var payroll=gs.find(function(g){return g.textContent.trim()==='Payroll'});
  if(!payroll) return 'NO PAYROLL GROUP';
  var c=document.getElementById(payroll.getAttribute('aria-controls'));
  return {expanded: payroll.getAttribute('aria-expanded'),
          subs: c ? Array.from(c.querySelectorAll('a')).map(function(a){return a.textContent.trim()}) : null};
})())`;

const LEAF_TAP_STATE = `JSON.stringify({path: location.pathname, drawer: (function(){ var ov=document.querySelector('.fixed.inset-0'); return ov ? ov.getAttribute('data-state') : 'GONE' })()})`;

const ACTIVE_LEAF_IN_DRAWER = `JSON.stringify((function(){
  var ov=document.querySelector('.fixed.inset-0');
  if(!ov) return null;
  var sib=ov.nextElementSibling;
  var links=Array.from(sib.querySelectorAll('a'));
  var act=links.find(function(a){return a.getAttribute('href')===location.pathname});
  return act ? {label: act.textContent.trim(), bg: getComputedStyle(act).backgroundColor, color: getComputedStyle(act).color} : null;
})())`;

// ---------- (A) at-rest chrome ----------
console.log("\n===== (A) AT-REST CHROME @390x844 =====");
const aRestRef = await evalOn("ref", AT_REST, 300);
const aRestLoc = await evalOn("loc", AT_REST, 300);
rec("at-rest chrome (hamburger + 5-tab bar)", aRestRef, aRestLoc);

// ---------- (B) hamburger tap → drawer opens ----------
console.log("\n===== (B) HAMBURGER TAP → DRAWER OPENS =====");
run(`agent-browser --session ref click 'button[data-sidebar=trigger]'`);
run(`agent-browser --session loc click 'button[data-sidebar=trigger]'`);
const bRef = await evalOn("ref", DRAWER_STATE, 1600);
const bLoc = await evalOn("loc", DRAWER_STATE, 1600);
rec("drawer settled state after hamburger tap", bRef, bLoc);

// ---------- (C) default group states ----------
console.log("\n===== (C) DRAWER DEFAULT GROUP STATES =====");
const cRef = await evalOn("ref", GROUP_MAP, 200);
const cLoc = await evalOn("loc", GROUP_MAP, 200);
rec("default aria-expanded map (9 group triggers)", cRef, cLoc);

// ---------- (D) group expansion round-trip ----------
console.log("\n===== (D) PAYROLL GROUP EXPANSION =====");
// tap the Payroll group trigger via a click on the button whose text is exactly Payroll
const tapPayroll = `agent-browser --session REF eval "var ov=document.querySelector('.fixed.inset-0'); var gs=Array.from(ov.nextElementSibling.querySelectorAll('[aria-controls]')); gs.find(function(g){return g.textContent.trim()==='Payroll'}).click(); 'tapped'"`;
run(tapPayroll.replace(/REF/g, "ref"));
run(tapPayroll.replace(/REF/g, "loc"));
const dRef = await evalOn("ref", SUBITEMS, 700);
const dLoc = await evalOn("loc", SUBITEMS, 700);
rec("Payroll group expansion (aria + 5 sub-items)", dRef, dLoc);

// ---------- (E) THE LEAF-TAP ROUND-TRIP (the round's finding zone) ----------
console.log("\n===== (E) LEAF TAP → NAVIGATION vs DRAWER RETENTION =====");
// eval-click the VISIBLE Training LMS link on both sides — the raw
// selector click hits the hidden desktop-sidebar copy on the clone
// (DOM order differs between the platforms); the visible-link find is
// the fair instrument.
const tapLeaf = `var links=Array.from(document.querySelectorAll('a[href="/training"]')); var vis=links.find(function(a){return a.offsetParent!==null}); if(vis){vis.click()} 'clicked:' + (vis ? vis.textContent.trim() : 'none')`;
await evalOn("ref", tapLeaf);
await evalOn("loc", tapLeaf);
const eRef400 = await evalOn("ref", LEAF_TAP_STATE, 500);
const eLoc400 = await evalOn("loc", LEAF_TAP_STATE, 500);
rec("leaf tap @500ms (path + drawer retention)", eRef400, eLoc400, "REF: drawer stays open / LOC: drawer closes — the divergence");
const eRef1900 = await evalOn("ref", LEAF_TAP_STATE, 1400);
const eLoc1900 = await evalOn("loc", LEAF_TAP_STATE, 1400);
rec("leaf tap @1900ms (path + drawer retention)", eRef1900, eLoc1900);

// REF's drawer is still open — read the active-leaf highlight inside it
// (the drawer re-rendered onto the new route: does the active item update?)
if (eRef1900 && eRef1900.drawer === "open") {
  const actRef = await evalOn("ref", ACTIVE_LEAF_IN_DRAWER, 200);
  console.log(`  ref active-leaf-in-open-drawer: ${JSON.stringify(actRef)}`);
}
// LOC's drawer closed — read the page h1 both sides for the landing check
const landRef = await evalOn("ref", `JSON.stringify({h1: (document.querySelector('h1')||{textContent:null}).textContent})`, 200);
const landLoc = await evalOn("loc", `JSON.stringify({h1: (document.querySelector('h1')||{textContent:null}).textContent})`, 200);
rec("landing page h1 after leaf tap", landRef, landLoc);

// ---------- (F) overlay tap closes (full pointer sequence) ----------
console.log("\n===== (F) OVERLAY TAP (POINTER SEQUENCE) CLOSES =====");
// REF: drawer open from (E); re-open it if it somehow closed
let refDrawer = await evalOn("ref", `document.querySelector('.fixed.inset-0') ? document.querySelector('.fixed.inset-0').getAttribute('data-state') : 'GONE'`);
if (refDrawer !== "open") {
  run(`agent-browser --session ref click 'button[data-sidebar=trigger]'`);
  await new Promise(r => setTimeout(r, 1500));
}
// LOC: re-open the drawer
run(`agent-browser --session loc click 'button[data-sidebar=trigger]'`);
await new Promise(r => setTimeout(r, 1500));
const overlayTap = `var ov=document.querySelector('.fixed.inset-0'); if(!ov){'already gone'} else {var r={bubbles:true,cancelable:true,clientX:340,clientY:400,pointerId:1}; ov.dispatchEvent(new PointerEvent('pointerdown',r)); ov.dispatchEvent(new PointerEvent('pointerup',r)); ov.dispatchEvent(new MouseEvent('click',r)); 'dispatched'}`;
await evalOn("ref", overlayTap);
await evalOn("loc", overlayTap);
// SYMMETRIC settling delay before either read (the first draft read loc
// ~0ms after its dispatch — mid-exit-animation — while ref had 1.2s)
await new Promise(r => setTimeout(r, 1500));
const fRef = await evalOn("ref", `document.querySelector('.fixed.inset-0') ? document.querySelector('.fixed.inset-0').getAttribute('data-state') : 'GONE'`);
const fLoc = await evalOn("loc", `document.querySelector('.fixed.inset-0') ? document.querySelector('.fixed.inset-0').getAttribute('data-state') : 'GONE'`);
rec("overlay tap closes the drawer", fRef, fLoc);

// ---------- (G) bottom-tab tap → route + active state ----------
console.log("\n===== (G) BOTTOM-TAB TAP → ROUTE + ACTIVE STATE =====");
const tapStaffRef = `agent-browser --session ref eval "var navs=Array.from(document.querySelectorAll('nav')); var nav=navs.find(function(n){return getComputedStyle(n).position==='fixed' && n.getBoundingClientRect().top>300}); var a=Array.from(nav.querySelectorAll('a')).find(function(x){return x.textContent.trim()==='Staff'}); a.click(); 'tapped'"`;
run(tapStaffRef);
await new Promise(r => setTimeout(r, 2200));
const tapStaffLoc = `agent-browser --session loc eval "var navs=Array.from(document.querySelectorAll('nav')); var nav=navs.find(function(n){return getComputedStyle(n).position==='fixed' && n.getBoundingClientRect().top>300}); var a=Array.from(nav.querySelectorAll('a')).find(function(x){return x.textContent.trim()==='Staff'}); a.click(); 'tapped'"`;
run(tapStaffLoc);
await new Promise(r => setTimeout(r, 2200));
const ACTIVE_TAB = `JSON.stringify((function(){
  var navs=Array.from(document.querySelectorAll('nav'));
  var nav=navs.find(function(n){return getComputedStyle(n).position==='fixed' && n.getBoundingClientRect().top>300});
  if(!nav) return null;
  var act=Array.from(nav.querySelectorAll('a')).find(function(a){return a.textContent.trim()==='Staff'});
  var home=Array.from(nav.querySelectorAll('a')).find(function(a){return a.textContent.trim()==='Home'});
  return {path: location.pathname, staff: act ? {color: getComputedStyle(act).color, bg: getComputedStyle(act).backgroundColor} : null, home: home ? {color: getComputedStyle(home).color, bg: getComputedStyle(home).backgroundColor} : null};
})())`;
const gRef = await evalOn("ref", ACTIVE_TAB, 300);
const gLoc = await evalOn("loc", ACTIVE_TAB, 300);
rec("bottom-tab tap lands + active computed pair", gRef, gLoc);

// ---------- summary ----------
console.log("\n===== CENSUS SUMMARY =====");
const matches = results.filter(r => r.match).length;
console.log(`${matches}/${results.length} MATCH`);
const diffs = results.filter(r => !r.match);
if (diffs.length) console.log("DIFFS: " + diffs.map(d => d.name).join(" | "));
process.exit(0);
