#!/usr/bin/env node
// r83-theme-matrix.mjs — session-83 / parity round 82: THE DARK-MODE +
// RTL (THEME-DIRECTION) MATRIX — the round's fresh-eyes instrument.
// The parity program's 966 standing PNGs are ALL LIGHT + LTR; both apps
// carry the two toggle states (the REF: localStorage darkMode/app_lang →
// html.dark + dir=rtl; the clone: the session-33 R32-B عربي button + the
// session-40 THEME_BOOT contract — the Moon buttons measured
// GEOMETRY-IDENTICAL @1440: x=60 y=796 36×36 both sides; the عربي pair
// 80×32 @ x=104 both sides). This matrix walks the SEVEN standing routes
// on BOTH sides in EACH state, reading the theme census (htmlCls, body
// bg, sidebar fg, first-card bg, heading color) + the geometry census
// (sidebar x/w, main x/w, scrollW — the INVARIANCE contract: the toggle
// re-paints, it must NOT re-flow) and classifies every FIND.
// Sidebar selector: main.previousElementSibling (the div.group.peer —
// the DOM contract IDENTICAL on both sides, live-verified @1440:
// REF/LOC sb x=0 w=256 + main x=256 w=1184).
// Phases: dark (darkMode=true, LTR) → rtl (app_lang=ar, LIGHT) → sweep.
import { execSync } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const ROUTES = ["/dashboard", "/payroll", "/employees", "/attendance", "/training", "/recruitment", "/settings"];

const READ = `(() => {
  const g = (el, prop) => { if (!el) return null; try { return getComputedStyle(el)[prop]; } catch (e) { return 'ERR'; } };
  const rect = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: Math.round(b.x), w: Math.round(b.width) }; };
  const html = document.documentElement;
  const main = document.querySelector('main');
  const sb = main ? main.previousElementSibling : null;
  const card = main ? main.querySelector('[class*=rounded-xl], [class*=rounded-lg]') : null;
  const heading = main ? (main.querySelector('h2') || main.querySelector('h1')) : null;
  return {
    htmlCls: html.className || '(none)', dir: html.getAttribute('dir') || 'ltr',
    bodyBg: g(document.body, 'backgroundColor'),
    sbFg: g(sb, 'color'), sbRect: rect(sb), mainRect: rect(main),
    cardBg: g(card, 'backgroundColor'), headCol: g(heading, 'color'),
    scrollW: html.scrollWidth, innerW: window.innerWidth,
  };
})()`;

async function walk(phase, lsKey, lsVal, clearKey) {
  console.log(`\n########## PHASE: ${phase} ##########`);
  const reads = { REF: {}, LOC: {} };
  for (const [name, session, base] of [["REF", "ref", baseRef], ["LOC", "loc", baseLoc]]) {
    run(`agent-browser --session ${session} set viewport 1440 900`);
    if (clearKey) run(`agent-browser --session ${session} eval "localStorage.removeItem('${clearKey}')"`);
    run(`agent-browser --session ${session} eval "localStorage.setItem('${lsKey}','${lsVal}')"`);
    await new Promise(r => setTimeout(r, 400));
    for (const route of ROUTES) {
      run(`agent-browser --session ${session} open ${base}${route}`);
      await new Promise(r => setTimeout(r, 2600));
      reads[name][route] = await evalOn(session, READ);
    }
    console.log(`${name} [${phase}] raw:`, JSON.stringify(reads[name]).slice(0, 1200));
  }
  let match = 0;
  for (const route of ROUTES) {
    const a = reads.REF[route], b = reads.LOC[route];
    const diffs = [];
    for (const k of Object.keys(a)) {
      if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) diffs.push(`${k}: ref=${JSON.stringify(a[k])} loc=${JSON.stringify(b[k])}`);
    }
    if (diffs.length === 0) { match++; console.log(`MATCH ${route}`); }
    else console.log(`DIFF  ${route}\n    ${diffs.join("\n    ").slice(0, 1400)}`);
  }
  console.log(`${phase}: ${match}/${ROUTES.length} MATCH`);
  return match;
}

// phase 1: DARK (darkMode=true, LTR) — the app side (login is theme-inert)
const darkMatch = await walk("dark", "darkMode", "true", "app_lang");
// phase 2: RTL (app_lang=ar, LIGHT)
const rtlMatch = await walk("rtl", "app_lang", "ar", "darkMode");

// sweep both keys back to the standing LIGHT+LTR state
for (const s of ["ref", "loc"]) {
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
}
console.log("\ntheme state swept back to LIGHT+LTR (both sessions)");
console.log(`\nVERDICT: dark ${darkMatch}/7 · rtl ${rtlMatch}/7`);
process.exit(0);
