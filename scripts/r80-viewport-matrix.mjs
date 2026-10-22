#!/usr/bin/env node
// r80-viewport-matrix.mjs — session 80 / parity round 79: the fresh-eyes
// instrument — THE MOBILE VIEWPORT MATRIX. The program's parity proof at
// mobile width (390x844) had only ever covered the nav surfaces (the
// standing mobile-tabs + mobile-drawer audits); the CONTENT routes' mobile
// rendering was never audited. This census walks the 12-route sweep set on
// BOTH sides at 390x844 (LIGHT, authed sessions) reading shell+geometry
// signals per route — header class + height, main content rect, sidebar
// visibility, HORIZONTAL OVERFLOW (the classic TW-v4 responsive-bug
// detector: a mis-applied min-w/max-w/absolute utility at mobile width
// makes scrollWidth exceed innerWidth), the base44-edit-badge, and the
// sidebar-toggle naming mechanism — then compares member-wise under the
// two DOCUMENTED translations: (1) the badge is REF-only chrome (the
// session-2 deliberate deviation — the builder badge is not cloned);
// (2) the toggle's accessible name rides the aria-label on LOC (the
// session-46 superset) vs the sr-only span on REF — both mechanisms
// accepted. Everything else must MATCH.
// The /dashboard recon (r80-viewport-recon + r80-viewport-classify) already
// classified the raw PNG diff on this surface as the documented chrome —
// zero horizontal overflow, identical header/main geometry.
import { execSync } from "node:child_process";

function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
// The r79 lesson: long payloads go through the -b BASE64 eval mode.
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const b64 = Buffer.from(expr, "utf8").toString("base64"); const out = run(`agent-browser --session ${session} eval -b ${b64}`); const t = out.trim(); try { return JSON.parse(t); } catch { try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } } }

const ROUTES = ["/dashboard", "/employees", "/payroll", "/taskmanager", "/attendance", "/recruitment", "/training", "/documenttracker", "/profile", "/settings", "/staffrequests", "/careers"];
const BASES = { ref: "https://eon.base44.app", loc: "http://127.0.0.1:3200" };

const SIGNALS = `(() => {
  const badge = document.querySelector('#base44-edit-badge, [class*=base44-edit], [id*=base44]');
  const aside = document.querySelector('aside');
  const sidebarVisible = !!(aside && aside.getBoundingClientRect().width > 0);
  const header = document.querySelector('header');
  const headerInfo = header ? { cls: (header.className || '').replace(/\\s+/g, ' ').trim(), h: Math.round(header.getBoundingClientRect().height) } : null;
  const main = document.querySelector('main');
  const mainRect = main ? { x: Math.round(main.getBoundingClientRect().x), w: Math.round(main.getBoundingClientRect().width) } : null;
  const toggle = [...document.querySelectorAll('button')].find(b => {
    const label = b.getAttribute('aria-label') || '';
    if (/toggle sidebar/i.test(label)) return true;
    const sr = b.querySelector('span[class*=sr-only]');
    return sr && /toggle sidebar/i.test(sr.textContent || '');
  });
  return {
    innerW: window.innerWidth,
    scrollW: document.documentElement.scrollWidth,
    hOverflow: document.documentElement.scrollWidth > window.innerWidth,
    badge: badge ? Math.round(badge.getBoundingClientRect().width) + 'x' + Math.round(badge.getBoundingClientRect().height) : null,
    sidebarVisible,
    headerInfo,
    mainRect,
    hasToggle: !!toggle,
    toggleMechanism: toggle ? (toggle.getAttribute('aria-label') ? 'aria-label' : 'sr-only-span') : null
  };
})()`;

// LIGHT pinned + viewport 390x844 on both sides (applies on navigation)
for (const s of ["ref", "loc"]) {
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false')"`);
  run(`agent-browser --session ${s} set viewport 390 844`);
}

let match = 0, flagged = 0, expectedDiff = 0;
const rows = [];
for (const route of ROUTES) {
  const reads = {};
  for (const s of ["ref", "loc"]) {
    run(`agent-browser --session ${s} open ${BASES[s]}${route}`);
    await new Promise(r => setTimeout(r, 800));
    run(`agent-browser --session ${s} set viewport 390 844`); // re-assert (the r79 drawer pattern)
    await new Promise(r => setTimeout(r, 2800));
    reads[s] = await evalOn(s, SIGNALS);
  }
  const R = reads.ref, L = reads.loc;
  if (!R || !L || R.error || L.error) { rows.push(`ERR     ${route}: ref=${JSON.stringify(R).slice(0, 80)} loc=${JSON.stringify(L).slice(0, 80)}`); flagged++; continue; }
  const checks = {
    "hOverflow=false": R.hOverflow === false && L.hOverflow === false,
    "headerCls": R.headerInfo && L.headerInfo && R.headerInfo.cls === L.headerInfo.cls,
    "headerH": R.headerInfo && L.headerInfo && R.headerInfo.h === L.headerInfo.h,
    "mainRect": R.mainRect && L.mainRect && R.mainRect.x === L.mainRect.x && R.mainRect.w === L.mainRect.w,
    "sidebarHidden": R.sidebarVisible === false && L.sidebarVisible === false,
    "hasToggle": R.hasToggle === true && L.hasToggle === true,
    // the two DOCUMENTED translations (expected diffs):
    "badge(ref-only)": R.badge !== null && L.badge === null,
    "toggleNaming(dual-mechanism)": R.toggleMechanism === 'sr-only-span' && L.toggleMechanism === 'aria-label',
  };
  const fails = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
  if (fails.length === 0) { rows.push(`MATCH   ${route} — shell ${L.headerInfo ? L.headerInfo.h + 'px header' : '?'}, main ${L.mainRect ? L.mainRect.w + 'px' : '?'}, overflow ${L.scrollW}/${L.innerW}, badge ${R.badge}, toggle ${R.toggleMechanism}/${L.toggleMechanism}`); match++; }
  else if (fails.every(f => f.startsWith("badge") || f.startsWith("toggleNaming"))) { rows.push(`PARTIAL ${route} — expected-diff translation failed: ${fails.join(",")}`); flagged++; }
  else { rows.push(`FIND    ${route} — fails: ${fails.join(", ")} | ref=${JSON.stringify({ h: R.headerInfo, m: R.mainRect, o: R.scrollW + '/' + R.innerW })} loc=${JSON.stringify({ h: L.headerInfo, m: L.mainRect, o: L.scrollW + '/' + L.innerW })}`); flagged++; }
}
console.log(rows.join("\n"));
console.log(`\n==== MOBILE VIEWPORT MATRIX: ${match}/${ROUTES.length} routes member-wise MATCH (both documented translations satisfied) ====`);
console.log(flagged === 0 ? "VERDICT: ZERO clone-authored mobile-width defects — the 390x844 surface is parity-locked across the sweep set" : `VERDICT: ${flagged} route(s) flagged — classify each FIND before remediation`);
