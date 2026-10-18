#!/usr/bin/env node
// r56-probe3.mjs — session-56 reconnaissance round 3: the SCROLL mechanics.
// Walk from each page's CONTENT heading (not the topbar EonHR h1) to its
// scroll parent; find the scroller both sides actually use; then the
// navigate→back scroll-restoration behavior on /settings.
import { execSync } from "node:child_process";
function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
const settle = (ms) => new Promise(r => setTimeout(r, ms));
function evalStr(expr) { return JSON.stringify(expr.split("\n").join(" ")); }
async function ev(session, expr) {
  const out = run(`agent-browser --session ${session} eval ${evalStr(expr)}`);
  try { return JSON.parse(JSON.parse(out.trim())); } catch { return "ERR:" + out.slice(0, 300); }
}

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

// find the scroller: walk up from the LAST h2 in the main content (pages
// render their content h2s below the topbar brand h1) — plus dump all
// scrollable elements with real overflow anywhere in the tree.
const SCROLLER = `JSON.stringify((() => {
  const hs = [...document.querySelectorAll('main h1, main h2')];
  const h = hs[hs.length - 1];
  let found = null;
  if (h) {
    let el = h;
    while (el && el !== document.documentElement) {
      const cs = getComputedStyle(el);
      if (/(auto|scroll)/.test(cs.overflowY)) { found = { from: 'walk', tag: el.tagName, cls: (el.className||'').toString().slice(0,70), sh: el.scrollHeight, ch: el.clientHeight, st: el.scrollTop }; break; }
      el = el.parentElement;
    }
  }
  const all = [];
  document.querySelectorAll('*').forEach(el => {
    const cs = getComputedStyle(el);
    if (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 100 && el.clientHeight > 300) {
      all.push({ tag: el.tagName, cls: (el.className||'').toString().slice(0,70), sh: el.scrollHeight, ch: el.clientHeight, st: el.scrollTop });
    }
  });
  return { docSh: document.documentElement.scrollHeight, winSt: window.scrollY, walk: found, scrollables: all.slice(0, 5) };
})())`;

async function side(session, base, tag) {
  console.log(`\n===== ${tag} =====`);
  run(`agent-browser --session ${session} set viewport 1440 900`);

  for (const path of ["/settings", "/hrreports", "/compliance"]) {
    run(`agent-browser --session ${session} open ${base}${path}`);
    await settle(3000);
    console.log(`${path}:`, JSON.stringify(await ev(session, SCROLLER)).slice(0, 700));
  }

  // THE RESTORATION TEST on /settings (or the scrollable-est page):
  run(`agent-browser --session ${session} open ${base}/settings`);
  await settle(3000);
  const setScroll = await ev(session, `(() => {
    const hs = [...document.querySelectorAll('main h1, main h2')];
    const h = hs[hs.length - 1];
    let sc = window;
    if (h) { let el = h; while (el && el !== document.documentElement) { const cs = getComputedStyle(el); if (/(auto|scroll)/.test(cs.overflowY)) { sc = el; break; } el = el.parentElement; } }
    if (sc === window) { window.scrollTo(0, 600); return { sc: 'window', set: window.scrollY }; }
    sc.scrollTop = 600;
    return { sc: sc.tagName + '.' + (sc.className||'').toString().slice(0,40), set: sc.scrollTop };
  })()`);
  console.log("scrolled:", JSON.stringify(setScroll));
  // navigate to /training via a visible sidebar link
  await ev(session, `(() => { const a = [...document.querySelectorAll('[data-sidebar=menu-button]')].filter(x => x.tagName==='A' && /training/i.test(x.textContent||'') && x.offsetParent !== null)[0]; if (a) { a.click(); return 'ok'; } return 'NOTFOUND'; })()`);
  await settle(2500);
  console.log("  after nav url:", run(`agent-browser --session ${session} get url`).trim().replace(base, ""));
  // back
  run(`agent-browser --session ${session} back`);
  await settle(3000);
  const afterBack = await ev(session, `(() => {
    const hs = [...document.querySelectorAll('main h1, main h2')];
    const h = hs[hs.length - 1];
    let sc = window;
    if (h) { let el = h; while (el && el !== document.documentElement) { const cs = getComputedStyle(el); if (/(auto|scroll)/.test(cs.overflowY)) { sc = el; break; } el = el.parentElement; } }
    if (sc === window) return { sc: 'window', st: window.scrollY };
    return { sc: sc.tagName + '.' + (sc.className||'').toString().slice(0,40), st: sc.scrollTop };
  })()`);
  console.log("  after BACK url:", run(`agent-browser --session ${session} get url`).trim().replace(base, ""), "scroll:", JSON.stringify(afterBack));
}

await side("ref56", baseRef, "REF");
await side("loc", baseLoc, "LOC");
process.exit(0);
