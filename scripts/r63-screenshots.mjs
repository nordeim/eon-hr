#!/usr/bin/env node
// r63-screenshots.mjs — parity round 62's evidence captures: the
// light-mode text-color family — the payroll search-placeholder pair
// (the #737373 muted literal), the hrreports Group By trigger pair (the
// empty trigger's foreground pair), the shiftcalendar assign-affordance
// pair (the Plus-iconed empty-cell buttons), the shiftcalendar summary
// pair (the Users-iconed pb-3 header), the recruitment AI Score th pair
// (the TrendingUp icon), and the profile mobile-kicker pair @390 (the
// flipping subtitle). REF + seeded LOC pairs, one process tree with the
// :3200 server. LIGHT armed (the round's theme). Numbers continue from
// 314. R63-G (the attendance restricted card) has NO pair surface: the
// card renders for non-admins only — REF's census session user sees it,
// the LOC admin seed does not; the unit pin holds it (documented).
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }

const repo = "/home/z/my-project/eon-hr";
const shots = `${repo}/docs/screenshots`;
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/custom.db" AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-shots-r63.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }
console.log("server up on :3200");

async function auth(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
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
  console.log(session, "->", run(`agent-browser --session ${session} get url`).trim());
}
await auth("ref", "https://eon.base44.app");
await auth("loc", "http://127.0.0.1:3200");
// arm LIGHT on both (the shared localStorage contract) — the round's theme
for (const s of ["ref", "loc"]) {
  run(`agent-browser --session ${s} open ${s === "ref" ? "https://eon.base44.app/dashboard" : "http://127.0.0.1:3200/dashboard"}`);
  await new Promise(r => setTimeout(r, 2500));
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false')"`);
}

function cap(session, name) {
  run(`agent-browser --session ${session} screenshot ${shots}/${name}.png`);
  console.log("captured", name);
}
// scroll a text-matched element into view (the r61 inner-scroller
// lesson: the app scrolls its inner div, not the document)
function scrollInto(session, text) {
  run(`agent-browser --session ${session} eval "const el=[...document.querySelectorAll('main *')].find(e=>e.children.length===0&&(e.textContent||'').trim()==='${text}'); el?el.scrollIntoView({block:'center'}):0"`);
}
const pairs = [["ref", "https://eon.base44.app", "ref"], ["loc", "http://127.0.0.1:3200", "loc"]];

// ---- 314/315: the payroll search placeholder pair (light — #737373) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/payroll`);
  await new Promise(r => setTimeout(r, 4600));
  cap(session, `314-payroll-placeholder-${suffix}`);
}

// ---- 316/317: the hrreports Group By trigger pair (light — the
// empty trigger's #0a0a0a foreground, not the neutral literal) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/hrreports`);
  await new Promise(r => setTimeout(r, 4600));
  run(`agent-browser --session ${session} eval "document.querySelector('#hr-group')?.scrollIntoView({block:'center'}); document.querySelector('[id*=group],[data-placeholder]')?.scrollIntoView({block:'center'});0"`);
  await new Promise(r => setTimeout(r, 600));
  cap(session, `316-hrreports-groupby-${suffix}`);
}

// ---- 318/319: the shiftcalendar assign-affordance pair (light — the
// Plus-iconed empty-cell buttons, gap-0.5 mt-1) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/shiftcalendar`);
  await new Promise(r => setTimeout(r, 5200));
  run(`agent-browser --session ${session} eval "const b=[...document.querySelectorAll('main button')].find(e=>(e.textContent||'').trim()==='assign'); b?b.scrollIntoView({block:'center'}):window.scrollTo(0,560)"`);
  await new Promise(r => setTimeout(r, 700));
  cap(session, `318-shiftcalendar-assign-${suffix}`);
}

// ---- 320/321: the shiftcalendar summary pair (light — the Users-iconed
// pb-3 header + the text-base flex title) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} eval "const t=[...document.querySelectorAll('main div')].find(e=>(e.textContent||'').includes('Employee Schedule Summary')&&e.className.includes('font-semibold')); t?t.scrollIntoView({block:'center'}):window.scrollTo(0,1600)"`);
  await new Promise(r => setTimeout(r, 700));
  cap(session, `320-shiftcalendar-summary-${suffix}`);
}

// ---- 322/323: the recruitment AI Score th pair (light — the TrendingUp
// icon inside the flex gap-1 wrapper) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} open ${base}/recruitment`);
  await new Promise(r => setTimeout(r, 4600));
  scrollInto(session, "AI Score");
  await new Promise(r => setTimeout(r, 600));
  cap(session, `322-recruitment-aiscore-${suffix}`);
}

// ---- 324/325: the profile mobile-kicker pair @390 (light — the
// flipping subtitle, slate-500 on the light side) ----
for (const [session, base, suffix] of pairs) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/profile`);
  await new Promise(r => setTimeout(r, 4600));
  cap(session, `324-profile-kicker-${suffix}`);
  run(`agent-browser --session ${session} set viewport 1440 900`);
}

// ---- verify: all files distinct (the r62 duplicate-hash lesson) ----
const md5 = run(`cd ${shots} && md5sum 31[4-9]-*.png 32[0-5]-*.png | awk '{print $1}' | sort | uniq -d | wc -l`).trim();
console.log("duplicate hashes:", md5);
const count = run(`cd ${shots} && md5sum 31[4-9]-*.png 32[0-5]-*.png | wc -l`).trim();
console.log("r63 pair files:", count);
const total = run(`cd ${shots} && ls *.png | wc -l`).trim();
console.log("total screenshot files:", total);
process.exit(0);
