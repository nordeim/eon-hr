#!/usr/bin/env node
// r56-probe2.mjs — session-56 reconnaissance round 2 (explicit 1440×900 both
// sides): the sidebar leaf carrier, the main scroll container (walk up from
// the page's first heading), the click→back→forward smoke, drawer carrier.
import { execSync } from "node:child_process";
function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
const settle = (ms) => new Promise(r => setTimeout(r, ms));
function evalStr(expr) { return JSON.stringify(expr.split("\n").join(" ")); }
async function ev(session, expr) {
  const out = run(`agent-browser --session ${session} eval ${evalStr(expr)}`);
  try { return JSON.parse(JSON.parse(out.trim())); } catch { return "ERR:" + out.slice(0, 300); }
}

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

const LEAVES = `JSON.stringify((() => {
  const btns = [...document.querySelectorAll('[data-sidebar=menu-button]')];
  return btns.filter(b => b.tagName === 'A').slice(0, 10).map(a => ({
    href: a.getAttribute('href'), text: (a.textContent||'').trim().slice(0,16),
    ac: a.getAttribute('aria-current'),
    bg: getComputedStyle(a).backgroundColor, visible: a.offsetParent !== null
  }));
})())`;

const SCROLLPARENT = `JSON.stringify((() => {
  const h = document.querySelector('h1') || document.querySelector('h2');
  if (!h) return { noHeading: true };
  let el = h;
  while (el && el !== document.documentElement) {
    const cs = getComputedStyle(el);
    if (/(auto|scroll)/.test(cs.overflowY)) {
      return { cls: (el.className||'').toString().slice(0,80), sh: el.scrollHeight, ch: el.clientHeight, st: el.scrollTop, tag: el.tagName };
    }
    el = el.parentElement;
  }
  return { windowScroller: true, st: window.scrollY, sh: document.documentElement.scrollHeight };
})())`;

const H1 = `JSON.stringify((document.querySelector('h1')||{textContent:null}).textContent)`;

async function side(session, base, tag) {
  console.log(`\n===== ${tag} =====`);
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/`);
  await settle(3000);
  console.log("root:", run(`agent-browser --session ${session} get url`).trim().replace(base, ""));
  console.log("h1:", JSON.stringify(await ev(session, H1)));
  console.log("leaves@root:", JSON.stringify(await ev(session, LEAVES)).slice(0, 800));
  console.log("scrollparent@root:", JSON.stringify(await ev(session, SCROLLPARENT)));

  // click the Staff leaf (visible only)
  const clicked = await ev(session, `(() => { const a = [...document.querySelectorAll('[data-sidebar=menu-button]')].filter(x => x.tagName==='A' && /staff/i.test(x.textContent||'') && x.offsetParent !== null)[0]; if (a) { a.click(); return a.getAttribute('href'); } return 'NOTFOUND'; })()`);
  await settle(2500);
  console.log("clicked Staff →", JSON.stringify(clicked), "url:", run(`agent-browser --session ${session} get url`).trim().replace(base, ""));
  console.log("h1@employees:", JSON.stringify(await ev(session, H1)));
  console.log("leaves@employees:", JSON.stringify(await ev(session, LEAVES)).slice(0, 800));
  console.log("scrollparent@employees:", JSON.stringify(await ev(session, SCROLLPARENT)));

  // back
  run(`agent-browser --session ${session} back`);
  await settle(2800);
  console.log("after BACK url:", run(`agent-browser --session ${session} get url`).trim().replace(base, ""), "h1:", JSON.stringify(await ev(session, H1)));
  console.log("leaves@back:", JSON.stringify(await ev(session, LEAVES)).slice(0, 800));

  // forward
  run(`agent-browser --session ${session} forward`);
  await settle(2800);
  console.log("after FORWARD url:", run(`agent-browser --session ${session} get url`).trim().replace(base, ""), "h1:", JSON.stringify(await ev(session, H1)));
  console.log("leaves@forward:", JSON.stringify(await ev(session, LEAVES)).slice(0, 800));

  // settings scroll (tall page probe)
  run(`agent-browser --session ${session} open ${base}/settings`);
  await settle(3000);
  console.log("scrollparent@settings:", JSON.stringify(await ev(session, SCROLLPARENT)));
}

await side("ref56", baseRef, "REF");
await side("loc", baseLoc, "LOC");
process.exit(0);
