#!/usr/bin/env node
// r82-boundary-matrix.mjs — session 82 / parity round 81: the fresh-eyes
// instrument — THE BREAKPOINT-BOUNDARY MATRIX. Walks the 12-route sweep set
// on BOTH sides at the two never-measured breakpoint boundaries — the sm
// edge (640x1024: the mobile shell with the sm: members live) and the xl
// edge (1280x1024: the desktop shell with the xl: members live) — LIGHT,
// authed sessions, reading shell+geometry+grid signals member-wise.
// The xl edge carries THE GRID-COLUMN CENSUS (the R81-A detector: computed
// grid-template-columns of every visible stats/records grid — an xl:-vs-lg:
// member bug bites exactly here, invisible to the standing 390/768/1440
// audits). The sm edge carries the mobile-shell signals (header live,
// bottom tabs live, main x=0).
// Expected-diff translations: the badge is REF-only chrome (session-2
// deliberate deviation); the h1 "EonHR" 16px title is the standing shell
// translation. Data-authored overflow deltas (REF production tables vs LOC
// seed) get the r80/r81 same-author classification in the detail read.
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
  const bottomBar = [...document.querySelectorAll('nav')].find(el => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && r.width > 200 && r.height > 40 && Math.abs(r.y + r.height - window.innerHeight) < 4;
  });
  // THE GRID-COLUMN CENSUS: every visible grid's computed column count (the
  // xl:-vs-lg: member detector — the R81-A class). Reads the COMPUTED
  // grid-template-columns track count, immune to class-string truncation.
  const grids = [...document.querySelectorAll('main [class*=grid-cols]')].filter(el => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).display === 'grid';
  }).map(el => {
    const cols = getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length;
    return { cols, cls: (el.className || '').replace(/\\s+/g, ' ').trim().slice(0, 90) };
  });
  const h1 = document.querySelector('h1');
  return {
    innerW: window.innerWidth,
    scrollW: document.documentElement.scrollWidth,
    hOverflow: document.documentElement.scrollWidth > window.innerWidth,
    badge: badge ? Math.round(badge.getBoundingClientRect().width) + 'x' + Math.round(badge.getBoundingClientRect().height) : null,
    headerInfo, mainRect, grids,
    bottomBarVisible: !!bottomBar,
    h1: h1 ? { t: (h1.textContent || '').trim().slice(0, 40), fs: getComputedStyle(h1).fontSize } : null
  };
})()`;

async function matrixAt(width, shell) {
  // LIGHT pinned + viewport on both sides (applies on navigation)
  for (const s of ["ref", "loc"]) {
    run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false')"`);
    run(`agent-browser --session ${s} set viewport ${width} 1024`);
  }
  let match = 0, flagged = 0;
  const rows = [];
  for (const route of ROUTES) {
    const reads = {};
    for (const s of ["ref", "loc"]) {
      run(`agent-browser --session ${s} open ${BASES[s]}${route}`);
      await new Promise(r => setTimeout(r, 800));
      run(`agent-browser --session ${s} set viewport ${width} 1024`);
      await new Promise(r => setTimeout(r, 2600));
      reads[s] = await evalOn(s, SIGNALS);
    }
    const R = reads.ref, L = reads.loc;
    if (!R || !L || R.error || L.error) { rows.push(`ERR     ${route}: ref=${JSON.stringify(R).slice(0, 80)} loc=${JSON.stringify(L).slice(0, 80)}`); flagged++; continue; }
    const checks = {
      "headerCls": R.headerInfo && L.headerInfo && R.headerInfo.cls === L.headerInfo.cls,
      "mainRect": R.mainRect && L.mainRect && R.mainRect.x === L.mainRect.x && R.mainRect.w === L.mainRect.w,
      "gridsCols": JSON.stringify((R.grids || []).map(g => g.cols)) === JSON.stringify((L.grids || []).map(g => g.cols)),
      "badge(ref-only)": R.badge !== null && L.badge === null,
      "h1": R.h1 && L.h1 && R.h1.t === L.h1.t && R.h1.fs === L.h1.fs,
    };
    if (shell === "mobile") {
      checks["headerLive"] = R.headerInfo && L.headerInfo && R.headerInfo.h > 0 && L.headerInfo.h > 0;
      checks["tabsLive"] = R.bottomBarVisible === true && L.bottomBarVisible === true;
    } else {
      checks["headerHidden"] = R.headerInfo && L.headerInfo && R.headerInfo.h === 0 && L.headerInfo.h === 0;
      checks["tabsGone"] = R.bottomBarVisible === false && L.bottomBarVisible === false;
    }
    const fails = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
    const gridSig = (g) => JSON.stringify((g || []).map(x => x.cols));
    if (fails.length === 0) { rows.push(`MATCH   ${route} — main ${L.mainRect ? L.mainRect.x + '+' + L.mainRect.w : '?'}, overflow ${L.scrollW}/${L.innerW}${(L.grids || []).length ? ', gridCols ' + (L.grids || []).map(g => g.cols).join('/') : ''}`); match++; }
    else {
      rows.push(`FIND    ${route} — fails: ${fails.join(", ")}`);
      rows.push(`       ref: overflow ${R.scrollW}/${R.innerW}, grids ${gridSig(R.grids)}${(R.grids || []).length ? ' cls=' + JSON.stringify((R.grids || []).map(g => g.cls.slice(0, 55))) : ''}`);
      rows.push(`       loc: overflow ${L.scrollW}/${L.innerW}, grids ${gridSig(L.grids)}${(L.grids || []).length ? ' cls=' + JSON.stringify((L.grids || []).map(g => g.cls.slice(0, 55))) : ''}`);
      flagged++;
    }
  }
  console.log(`\n===== ${shell.toUpperCase()} SHELL @${width}x1024 — THE BREAKPOINT-BOUNDARY MATRIX =====`);
  console.log(rows.join("\n"));
  console.log(`==== @${width}: ${match}/${ROUTES.length} routes member-wise MATCH (documented translations satisfied) ====`);
}

await matrixAt(640, "mobile");   // the sm boundary — mobile shell + sm: members
await matrixAt(1280, "desktop"); // the xl boundary — desktop shell + xl: members (the grid census)
process.exit(0);
