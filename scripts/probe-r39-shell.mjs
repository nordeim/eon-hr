#!/usr/bin/env node
// probe-r39-shell.mjs — session-40 / round 39: the app-shell structural
// comparison. Interrupted-session finding: REF wraps ALL page content in a
// flex-1 overflow-auto scroll container (header INSIDE main); the canvas
// wraps sidebar+main; the sidebar is a div.peer (not <aside>); the bottom
// nav is a canvas-div sibling.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 400) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

// desktop shell tree: 3 levels under body > div
const TREE = `(() => {
  const describe = (el, depth) => {
    if (!el || depth > 4) return null;
    const r = el.getBoundingClientRect();
    return { tag: el.tagName, cls: (el.className || '').toString().slice(0, 160), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), kids: [...el.children].slice(0, 8).map(c => describe(c, depth + 1)) };
  };
  const root = document.body.firstElementChild;
  return describe(root, 0);
})()`;

// sidebar element tag + brand block
const SIDEBAR = `(() => {
  const w = 256;
  const cand = [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return r.width >= 240 && r.width <= 270 && r.height > 600 && r.x < 30; });
  const sb = cand[0];
  if (!sb) return { found: false };
  const brand = sb.querySelector('h2');
  const brandContainer = brand ? brand.parentElement : null;
  return { found: true, tag: sb.tagName, cls: sb.className.slice(0, 220), peer: sb.classList.contains('peer'),
    brand: brand ? { h: Math.round(brand.getBoundingClientRect().height), w: Math.round(brand.getBoundingClientRect().width), tag: brand.tagName, containerCls: (brandContainer.className || '').slice(0, 160), siblingTags: brandContainer ? [...brandContainer.children].map(c => c.tagName) : [] } : null };
})()`;

// the scroll container: which element scrolls the page content?
const SCROLLER = `(() => {
  const main = document.querySelector('main');
  if (!main) return { main: false };
  const kids = [...main.children].map(c => ({ tag: c.tagName, cls: (c.className || '').toString().slice(0, 200) }));
  const cs = getComputedStyle(main.firstElementChild || main);
  return { main: true, mainCls: main.className.slice(0, 160), kids, innerOverflow: cs.overflow, docScrollH: document.documentElement.scrollHeight, innerScrollH: (main.firstElementChild || main).scrollHeight };
})()`;

for (const [label, session, base] of [["REF", "ref", baseRef], ["LOC", "loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 3500));
  console.log(`=== ${label} DESKTOP SHELL ===`);
  const tree = await evalOn(session, TREE);
  console.log(JSON.stringify(tree).slice(0, 1500));
  const sidebar = await evalOn(session, SIDEBAR);
  console.log(`sidebar: ${JSON.stringify(sidebar)}`);
  const scroller = await evalOn(session, SCROLLER);
  console.log(`scroller: ${JSON.stringify(scroller)}`);
}
