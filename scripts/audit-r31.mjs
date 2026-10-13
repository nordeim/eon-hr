#!/usr/bin/env node
// audit-r31.mjs — session-32 / parity round 31 STANDING AUDITS:
// (1) redeploy check 12 routes (h1 geometry, 1440x900),
// (2) mobile chrome (tabs/kicker/drawer overlay+border, 390x844),
// (3) with-data re-check (REF still zero-data?),
// (4) sidebar navmap (roots 865/905, the round-29/30 census).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
let fails = 0;
const check = (label, ref, loc) => {
  const same = JSON.stringify(ref) === JSON.stringify(loc);
  if (!same) fails++;
  console.log(`${same ? "MATCH" : "**DIFF**"} ${label}: ref=${JSON.stringify(ref)} loc=${JSON.stringify(loc)}`);
};

// ---- 1) redeploy check: 12 routes h1 geometry ----
const ROUTES = ["/dashboard","/employees","/payroll","/taskmanager","/settings","/hrreports","/analytics","/notificationpreferences","/staffrequests","/leavemanagement","/expenses","/profile"];
const H1 = `(() => {
  const h1 = [...document.querySelectorAll('h1')].find(e => e.getBoundingClientRect().width > 0);
  if (!h1) return null;
  const r = h1.getBoundingClientRect(); const cs = getComputedStyle(h1);
  return { t: h1.textContent.trim().slice(0, 26), fs: cs.fontSize, fw: cs.fontWeight, x: Math.round(r.x), y: Math.round(r.y) };
})()`;
console.log("=== 1) redeploy check (12 routes, 1440x900) ===");
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session loc set viewport 1440 900`);
for (const route of ROUTES) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  run(`agent-browser --session loc open "${baseLoc}${route}"`);
  await new Promise(r => setTimeout(r, 2600));
  const ref = await evalOn("ref", H1), loc = await evalOn("loc", H1);
  const same = JSON.stringify(ref) === JSON.stringify(loc);
  if (!same) fails++;
  console.log(`${same ? "MATCH" : "**DIFF**"} ${route}: ref=${JSON.stringify(ref)} loc=${JSON.stringify(loc)}`);
}

// ---- 2) mobile chrome (390x844) ----
const TABS = `(() => {
  const nav = [...document.querySelectorAll('nav')].find(n => n.getBoundingClientRect().y > 700);
  if (!nav) return { found: false };
  const r = nav.getBoundingClientRect(); const cs = getComputedStyle(nav);
  const tabs = [...nav.querySelectorAll('a')].map(a => { const ar = a.getBoundingClientRect(); const acs = getComputedStyle(a); return { x: Math.round(ar.x), t: (a.textContent || '').trim().slice(0, 10), color: acs.color }; });
  return { nav: { y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), pos: cs.position, bottom: cs.bottom }, tabs };
})()`;
const KICKER = `(() => {
  const k = [...document.querySelectorAll('h1')].find(h => h.getBoundingClientRect().y > 60 && h.getBoundingClientRect().y < 160);
  if (!k) return { found: false };
  const r = k.getBoundingClientRect(); const cs = getComputedStyle(k);
  return { t: k.textContent.trim().slice(0, 20), y: Math.round(r.y), h: Math.round(r.height), fs: cs.fontSize, fw: cs.fontWeight };
})()`;
const OPEN_DRAWER = `(() => {
  const btn = [...document.querySelectorAll('button')].find(b => b.getBoundingClientRect().y < 100 && b.getBoundingClientRect().x < 60 && (b.querySelector('svg') || (b.textContent || '').trim() === ''));
  if (btn) btn.click();
  return 'ok';
})()`;
const DRAWER = `(() => {
  const cands = [...document.querySelectorAll('div')].filter(d => {
    const cs = getComputedStyle(d); const r = d.getBoundingClientRect();
    return cs.position === 'fixed' && r.width >= 200 && r.width <= 340 && Math.round(r.height) >= 800 && cs.backgroundColor !== 'rgba(0, 0, 0, 0.8)' && d.querySelectorAll('button, a').length > 3;
  });
  if (!cands.length) return { found: false };
  const cs = getComputedStyle(cands[0]); const r = cands[0].getBoundingClientRect();
  const ov = [...document.querySelectorAll('div')].find(d => { const ocs = getComputedStyle(d); const or = d.getBoundingClientRect(); return ocs.backgroundColor === 'rgba(0, 0, 0, 0.8)' && or.width >= 380; });
  return { w: Math.round(r.width), bg: cs.backgroundColor, brw: cs.borderRightWidth, brc: cs.borderRightColor, overlay: ov ? { w: Math.round(ov.getBoundingClientRect().width), z: getComputedStyle(ov).zIndex } : null };
})()`;
console.log("\n=== 2) mobile chrome (390x844) ===");
for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${s} set viewport 390 844`);
  run(`agent-browser --session ${s} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 3200));
}
check("bottom tabs", await evalOn("ref", TABS), await evalOn("loc", TABS));
check("kicker", await evalOn("ref", KICKER), await evalOn("loc", KICKER));
for (const s of ["ref", "loc"]) { await evalOn(s, OPEN_DRAWER, 900); }
check("drawer panel + overlay", await evalOn("ref", DRAWER), await evalOn("loc", DRAWER));
for (const s of ["ref", "loc"]) { run(`agent-browser --session ${s} press Escape`); }

// ---- 3) with-data re-check ----
const ROWS = `(() => {
  const rows = document.querySelectorAll('main table tbody tr, main [role=row]').length;
  const cards = document.querySelectorAll('main .rounded-xl').length;
  const empty = (document.body.innerText.match(/No (employees|records|data|results|tasks|leave requests|payslips)/i) || [null])[0];
  return { rows, cards, empty };
})()`;
console.log("\n=== 3) with-data re-check (REF) ===");
run(`agent-browser --session ref set viewport 1440 900`);
for (const route of ["/employees", "/payroll", "/leavemanagement", "/taskmanager"]) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  await new Promise(r => setTimeout(r, 2600));
  console.log(`${route}: ${JSON.stringify(await evalOn("ref", ROWS))}`);
}

// ---- 4) sidebar navmap (desktop 1440x900) ----
const NAVMAP = `(() => {
  const as = [...document.querySelectorAll('aside a, aside button')].filter(e => e.getBoundingClientRect().width > 0);
  const map = as.map(e => { const r = e.getBoundingClientRect(); return { t: (e.textContent || '').trim().slice(0, 18), y: Math.round(r.y) }; });
  return map.filter(e => e.t);
})()`;
console.log("\n=== 4) sidebar navmap (roots 865/905) ===");
for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  run(`agent-browser --session ${s} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 3200));
}
const refNav = await evalOn("ref", NAVMAP), locNav = await evalOn("loc", NAVMAP);
const ai = refNav.findIndex(e => e.t.includes("AI HR Assistant"));
const sg = refNav.findIndex(e => e.t.includes("Settings"));
console.log(`REF roots: AI=${refNav[ai]?.y} Settings=${refNav[sg]?.y} | LOC roots: AI=${locNav[ai]?.y} Settings=${locNav[sg]?.y}`);
check("sidebar navmap (full)", refNav, locNav);

console.log(`\n${fails === 0 ? "ALL STANDING AUDITS GREEN" : fails + " DIFF(S) FOUND"}`);
