#!/usr/bin/env node
// r56-probe4.mjs — session-56 reconnaissance round 4: scrollRestoration
// flags, window-scroll restore on back (desktop, a page with real doc
// overflow), the mobile scroll carrier (390×844 /settings), the settings
// tab journey after back, and the /Dashboard casing after back.
import { execSync } from "node:child_process";
function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
const settle = (ms) => new Promise(r => setTimeout(r, ms));
function evalStr(expr) { return JSON.stringify(expr.split("\n").join(" ")); }
async function ev(session, expr) {
  const out = run(`agent-browser --session ${session} eval ${evalStr(expr)}`);
  try { return JSON.parse(JSON.parse(out.trim())); } catch { return "ERR:" + out.slice(0, 300); }
}

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

async function side(session, base, tag) {
  console.log(`\n===== ${tag} =====`);

  // -- 1. scrollRestoration + window scroll restore on back (desktop) --
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/hrreports`);
  await settle(3000);
  const sr = await ev(session, "history.scrollRestoration");
  console.log("scrollRestoration:", JSON.stringify(sr), "docSh:", JSON.stringify(await ev(session, "document.documentElement.scrollHeight")));
  const wscroll = await ev(session, "(() => { window.scrollTo(0, 40); return window.scrollY; })()");
  console.log("window scrolled to:", JSON.stringify(wscroll));
  await ev(session, `(() => { const a = [...document.querySelectorAll('[data-sidebar=menu-button]')].filter(x => x.tagName==='A' && /training/i.test(x.textContent||'') && x.offsetParent !== null)[0]; if (a) a.click(); return 'nav'; })()`);
  await settle(2500);
  run(`agent-browser --session ${session} back`);
  await settle(3000);
  console.log("after BACK url:", run(`agent-browser --session ${session} get url`).trim().replace(base, ""), "window.scrollY:", JSON.stringify(await ev(session, "window.scrollY")));

  // -- 2. the settings TAB journey: switch tab, nav away, back --
  run(`agent-browser --session ${session} open ${base}/settings`);
  await settle(3000);
  const tab2 = await ev(session, `(() => { const t = [...document.querySelectorAll('[role=tab]')].find(x => /departments/i.test(x.textContent||'')); if (t) { t.click(); return t.getAttribute('data-state'); } return 'NOTFOUND'; })()`);
  await settle(800);
  console.log("clicked Departments tab, state:", JSON.stringify(tab2));
  await ev(session, `(() => { const a = [...document.querySelectorAll('[data-sidebar=menu-button]')].filter(x => x.tagName==='A' && /training/i.test(x.textContent||'') && x.offsetParent !== null)[0]; if (a) a.click(); return 'nav'; })()`);
  await settle(2500);
  run(`agent-browser --session ${session} back`);
  await settle(3000);
  const afterTabBack = await ev(session, `(() => { const act = [...document.querySelectorAll('[role=tab]')].find(x => x.getAttribute('data-state')==='active'); return { url: location.pathname, activeTab: act ? act.textContent.trim() : null }; })()`);
  console.log("after BACK from tab journey:", JSON.stringify(afterTabBack));

  // -- 3. the /Dashboard casing after back --
  run(`agent-browser --session ${session} open ${base}/Dashboard`);
  await settle(3000);
  const cased = await ev(session, "location.pathname");
  console.log("/Dashboard serves at:", JSON.stringify(cased));
  await ev(session, `(() => { const a = [...document.querySelectorAll('[data-sidebar=menu-button]')].filter(x => x.tagName==='A' && /training/i.test(x.textContent||'') && x.offsetParent !== null)[0]; if (a) a.click(); return 'nav'; })()`);
  await settle(2500);
  run(`agent-browser --session ${session} back`);
  await settle(3000);
  console.log("after BACK from /Dashboard:", JSON.stringify(await ev(session, "location.pathname")));

  // -- 4. MOBILE (390×844): the scroll carrier + the drawer journey --
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/settings`);
  await settle(3000);
  const mScroller = await ev(session, `(() => {
    const hs = [...document.querySelectorAll('main h1, main h2')];
    const h = hs[hs.length - 1];
    let sc = null;
    if (h) { let el = h; while (el && el !== document.documentElement) { const cs = getComputedStyle(el); if (/(auto|scroll)/.test(cs.overflowY)) { sc = el; break; } el = el.parentElement; } }
    if (sc) { sc.scrollTop = 600; return { sc: 'container', sh: sc.scrollHeight, ch: sc.clientHeight, st: sc.scrollTop }; }
    window.scrollTo(0, 600);
    return { sc: 'window', docSh: document.documentElement.scrollHeight, st: window.scrollY };
  })()`);
  console.log("mobile /settings scrolled:", JSON.stringify(mScroller));
  await ev(session, `(() => { const a = [...document.querySelectorAll('nav a[href]')].filter(x => /training/i.test(x.textContent||'') && x.offsetParent !== null)[0]; if (a) a.click(); return 'nav'; })()`);
  await settle(2500);
  run(`agent-browser --session ${session} back`);
  await settle(3000);
  const mAfter = await ev(session, `(() => {
    const hs = [...document.querySelectorAll('main h1, main h2')];
    const h = hs[hs.length - 1];
    let sc = null;
    if (h) { let el = h; while (el && el !== document.documentElement) { const cs = getComputedStyle(el); if (/(auto|scroll)/.test(cs.overflowY)) { sc = el; break; } el = el.parentElement; } }
    if (sc) return { sc: 'container', st: sc.scrollTop };
    return { sc: 'window', st: window.scrollY };
  })()`);
  console.log("mobile after BACK url:", run(`agent-browser --session ${session} get url`).trim().replace(base, ""), "scroll:", JSON.stringify(mAfter));
}

await side("ref56", baseRef, "REF");
await side("loc", baseLoc, "LOC");
process.exit(0);
