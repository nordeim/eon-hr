#!/usr/bin/env node
// r81-tablet-matrix.mjs — session 81 / parity round 80: the fresh-eyes
// instrument — THE TABLET (md-BOUNDARY) VIEWPORT MATRIX. Walks the 12-route
// sweep set on BOTH sides at 768x1024 (LIGHT, authed sessions) reading the
// shell+geometry signals per route — the mobile header must be UNMOUNTED
// (md:hidden → h=0, identical class), the desktop sidebar MOUNTED (mainRect
// x=256 = the 256px sidebar live), the mobile bottom bar GONE, HORIZONTAL
// OVERFLOW (the TW-v4 detector), the badge + h1 (the standing translations)
// — compared member-wise. Expected-diff translations: the badge is REF-only
// chrome (session-2 deliberate deviation); the h1 "EonHR" 16px title is the
// standing shell translation. Everything else must MATCH. Data-authored
// overflow deltas (REF production tables vs LOC seed) get the r80
// same-author classification in the detail read.
import { execSync } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const b64 = Buffer.from(expr, "utf8").toString("base64"); const out = run(`agent-browser --session ${session} eval -b ${b64}`); const t = out.trim(); try { return JSON.parse(t); } catch { try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } } }

const ROUTES = ["/dashboard", "/employees", "/payroll", "/taskmanager", "/attendance", "/recruitment", "/training", "/documenttracker", "/profile", "/settings", "/staffrequests", "/careers"];
const BASES = { ref: "https://eon.base44.app", loc: "http://127.0.0.1:3200" };

const SIGNALS = `(() => {
  const badge = document.querySelector('#base44-edit-badge, [class*=base44-edit], [id*=base44]');
  const header = document.querySelector('header');
  const headerInfo = header ? { cls: (header.className || '').replace(/\\s+/g, ' ').trim(), h: Math.round(header.getBoundingClientRect().height) } : null;
  const main = document.querySelector('main');
  const mainRect = main ? { x: Math.round(main.getBoundingClientRect().x), w: Math.round(main.getBoundingClientRect().width) } : null;
  // the mobile bottom bar: a bottom-fixed VISIBLE nav (must be GONE at 768)
  const bottomBar = [...document.querySelectorAll('nav')].find(el => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && r.width > 200 && r.height > 40 && Math.abs(r.y + r.height - window.innerHeight) < 4;
  });
  const h1 = document.querySelector('h1');
  return {
    innerW: window.innerWidth,
    scrollW: document.documentElement.scrollWidth,
    hOverflow: document.documentElement.scrollWidth > window.innerWidth,
    badge: badge ? Math.round(badge.getBoundingClientRect().width) + 'x' + Math.round(badge.getBoundingClientRect().height) : null,
    headerInfo, mainRect,
    bottomBarVisible: !!bottomBar,
    h1: h1 ? { t: (h1.textContent || '').trim().slice(0, 40), fs: getComputedStyle(h1).fontSize } : null
  };
})()`;

// LIGHT pinned + viewport 768x1024 on both sides (applies on navigation)
for (const s of ["ref", "loc"]) {
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false')"`);
  run(`agent-browser --session ${s} set viewport 768 1024`);
}

let match = 0, flagged = 0;
const rows = [];
for (const route of ROUTES) {
  const reads = {};
  for (const s of ["ref", "loc"]) {
    run(`agent-browser --session ${s} open ${BASES[s]}${route}`);
    await new Promise(r => setTimeout(r, 800));
    run(`agent-browser --session ${s} set viewport 768 1024`);
    await new Promise(r => setTimeout(r, 2800));
    reads[s] = await evalOn(s, SIGNALS);
  }
  const R = reads.ref, L = reads.loc;
  if (!R || !L || R.error || L.error) { rows.push(`ERR     ${route}: ref=${JSON.stringify(R).slice(0, 80)} loc=${JSON.stringify(L).slice(0, 80)}`); flagged++; continue; }
  const checks = {
    "hOverflow=false": R.hOverflow === false && L.hOverflow === false,
    "headerCls": R.headerInfo && L.headerInfo && R.headerInfo.cls === L.headerInfo.cls,
    "headerHidden(h=0)": R.headerInfo && L.headerInfo && R.headerInfo.h === 0 && L.headerInfo.h === 0,
    "mainRect": R.mainRect && L.mainRect && R.mainRect.x === L.mainRect.x && R.mainRect.w === L.mainRect.w,
    "sidebarMounted(x>0)": R.mainRect && L.mainRect && R.mainRect.x > 0 && L.mainRect.x > 0,
    "bottomBarGone": R.bottomBarVisible === false && L.bottomBarVisible === false,
    // the DOCUMENTED translations (expected diffs):
    "badge(ref-only)": R.badge !== null && L.badge === null,
    "h1(EonHR 16px)": R.h1 && L.h1 && R.h1.t === L.h1.t && R.h1.fs === L.h1.fs,
  };
  const fails = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
  if (fails.length === 0) { rows.push(`MATCH   ${route} — main ${L.mainRect ? L.mainRect.x + '+' + L.mainRect.w : '?'}, overflow ${L.scrollW}/${L.innerW}, badge ${R.badge}, h1 ${JSON.stringify(L.h1 && L.h1.t)}`); match++; }
  else { rows.push(`FIND    ${route} — fails: ${fails.join(", ")} | ref=${JSON.stringify({ h: R.headerInfo && R.headerInfo.h, m: R.mainRect, o: R.scrollW + '/' + R.innerW, bb: R.bottomBarVisible })} loc=${JSON.stringify({ h: L.headerInfo && L.headerInfo.h, m: L.mainRect, o: L.scrollW + '/' + L.innerW, bb: L.bottomBarVisible })}`); flagged++; }
}
console.log(rows.join("\n"));
console.log(`\n==== TABLET (md-BOUNDARY) VIEWPORT MATRIX: ${match}/${ROUTES.length} routes member-wise MATCH (documented translations satisfied) ====`);
console.log(flagged === 0 ? "VERDICT: ZERO clone-authored tablet-width defects — the 768x1024 surface is parity-locked across the sweep set" : `VERDICT: ${flagged} route(s) flagged — classify each FIND before remediation`);
process.exit(0);
