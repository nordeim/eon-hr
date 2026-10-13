#!/usr/bin/env node
// probe-r32-measure.mjs — structured DOM measurement of the 10 real orphan
// pages on REF (the replication contract). Saves JSON to /tmp/orphan-pages.json.
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }
const baseRef = "https://eon.base44.app";

const ROUTES = ["/careers","/employeeportal","/externaljobapplication","/hrassistant","/payrollai","/payrollreports","/requestreports","/requestsettings","/shiftswap","/tenantsetup"];

// Structured page dump: header block, stat row, cards with their headers,
// buttons with geometry, empty states, canvases.
const DUMP = `(() => {
  const out = { title: document.title, root: null, header: {}, stats: [], cards: [], buttons: [], empties: [], texts: [] };
  const main = document.querySelector('main');
  if (!main) return { ...out, noMain: true };

  let wrap = main.firstElementChild;
  while (wrap && wrap.children.length === 1) wrap = wrap.firstElementChild;
  const wrapCls = wrap ? String(wrap.className).slice(0, 160) : null;

  const h1 = [...document.querySelectorAll('h1')].filter(e => e.getBoundingClientRect().width > 0)[0];
  let canvas = h1;
  while (canvas && canvas !== document.body) {
    const cs = getComputedStyle(canvas);
    if (cs.backgroundImage !== 'none' || (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'rgb(255, 255, 255)')) break;
    canvas = canvas.parentElement;
  }
  out.root = canvas ? { tag: canvas.tagName, cls: String(canvas.className).slice(0, 200), bg: getComputedStyle(canvas).backgroundImage !== 'none' ? getComputedStyle(canvas).backgroundImage.slice(0, 120) : getComputedStyle(canvas).backgroundColor } : null;
  out.wrapCls = wrapCls;
  if (h1) {
    const r = h1.getBoundingClientRect(); const cs = getComputedStyle(h1);
    out.header.h1 = { t: h1.textContent.trim().slice(0, 50), fs: cs.fontSize, fw: cs.fontWeight, y: Math.round(r.y), x: Math.round(r.x) };

    const sec = h1.closest('section, div');
    const spans = [...document.querySelectorAll('span')].filter(s => s.getBoundingClientRect().width > 0 && s.children.length === 0 && s !== h1);
    const kick = spans.find(s => { const sr = s.getBoundingClientRect(); return sr.y < r.y && r.y - sr.y < 40 && sr.x >= r.x - 8 && sr.x <= r.x + 40 && sr.height < 30; });
    if (kick) out.header.kicker = { t: kick.textContent.trim().slice(0, 30), y: Math.round(kick.getBoundingClientRect().y), x: Math.round(kick.getBoundingClientRect().x) };

    const subs = [...document.querySelectorAll('p')].filter(p => p.getBoundingClientRect().width > 0);
    const sub = subs.find(p => { const pr = p.getBoundingClientRect(); return pr.y > r.y && pr.y - r.y < 60 && pr.x >= r.x - 8 && p.children.length === 0; });
    if (sub) out.header.sub = { t: sub.textContent.trim().slice(0, 60), y: Math.round(sub.getBoundingClientRect().y), fs: getComputedStyle(sub).fontSize, col: getComputedStyle(sub).color };
  }

  const grids = [...main.querySelectorAll('div')].filter(d => { const cs = getComputedStyle(d); return cs.display.includes('grid') && d.children.length >= 2 && d.querySelectorAll('div').length < 40 && d.getBoundingClientRect().height > 40 && d.getBoundingClientRect().height < 400; });
  for (const g of grids.slice(0, 3)) {
    const tiles = [...g.children].map(c => ({ txt: c.textContent.trim().replace(/\\s+/g, ' ').slice(0, 50), h: Math.round(c.getBoundingClientRect().height) }));
    if (tiles.length && tiles[0].txt) out.stats.push({ cols: getComputedStyle(g).gridTemplateColumns.split(' ').length, gap: getComputedStyle(g).gap, tiles });
  }

  const cards = [...main.querySelectorAll('.rounded-xl')].slice(0, 8);
  for (const c of cards) {
    const r = c.getBoundingClientRect();
    const hdr = c.querySelector(':scope > div');
    const h3 = c.querySelector('h3');
    out.cards.push({ y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), hdrCls: hdr ? String(hdr.className).slice(0, 120) : null, h3: h3 ? { t: h3.textContent.trim().slice(0, 30), fs: getComputedStyle(h3).fontSize } : null, txt: c.textContent.trim().replace(/\\s+/g, ' ').slice(0, 110) });
  }

  const btns = [...main.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0);
  for (const b of btns.slice(0, 10)) {
    const r = b.getBoundingClientRect(); const cs = getComputedStyle(b);
    out.buttons.push({ t: b.textContent.trim().slice(0, 26), y: Math.round(r.y), x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height), bg: cs.backgroundImage !== 'none' ? 'grad' : cs.backgroundColor, fs: cs.fontSize });
  }

  const ps = [...main.querySelectorAll('p')].filter(p => p.children.length === 0 && p.getBoundingClientRect().width > 0);
  for (const p of ps.slice(0, 12)) {
    const r = p.getBoundingClientRect(); const cs = getComputedStyle(p);
    out.texts.push({ t: p.textContent.trim().slice(0, 70), y: Math.round(r.y), x: Math.round(r.x), fs: cs.fontSize, col: cs.color, align: cs.textAlign });
  }

  const svgs = [...main.querySelectorAll('svg')].filter(s => { const r = s.getBoundingClientRect(); return r.width >= 40 && r.width <= 80 && r.x > 100; });
  out.icons = svgs.slice(0, 4).map(s => { const r = s.getBoundingClientRect(); return { y: Math.round(r.y), x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height), col: getComputedStyle(s).color, path: (s.querySelector('path') ? s.querySelector('path').getAttribute('d') : '').slice(0, 40) }; });
  return out;
})()`;

run(`agent-browser --session ref set viewport 1440 900`);
const result = {};
for (const route of ROUTES) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  await new Promise(r => setTimeout(r, 4200));
  result[route] = await evalOn("ref", DUMP);
  console.log(`measured ${route}: h1=${JSON.stringify(result[route].header.h1?.t)} cards=${result[route].cards.length} btns=${result[route].buttons.length}`);
}
writeFileSync("/tmp/orphan-pages.json", JSON.stringify(result, null, 1));
console.log("\nsaved /tmp/orphan-pages.json");
