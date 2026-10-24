#!/usr/bin/env node
// r88-recipes.mjs — level-2 probes: the exact recipes for each defect member.
import { execSync } from "node:child_process";
function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const t = out.trim(); try { return JSON.parse(t); } catch { try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } } }
async function open(session, base, route) {
  run(`agent-browser --session ${session} open ${base}/${route}`);
  await new Promise(r => setTimeout(r, 3000));
}
const SIDES = [["REF", "ref88x", "https://eon.base44.app"], ["LOC", "loc88x", "http://127.0.0.1:3200"]];

// ---- 1. tenantsetup: the header inner members ----
for (const [name, s, base] of SIDES) {
  await open(s, base, "tenantsetup");
  const r = await evalOn(s, `(() => {
    const card = document.querySelector('.rounded-xl');
    const header = card.firstElementChild;
    const h2 = header.querySelector('h1,h2,h3,[class*=text-2xl],[class*=text-3xl]');
    const ps = [...header.children].map(c => ({ tag: c.tagName, cls: (c.getAttribute('class')||'').slice(0,80), y: Math.round(c.getBoundingClientRect().y), h: Math.round(c.getBoundingClientRect().height), txt: (c.textContent||'').trim().slice(0,30) }));
    const hr = { cls: (header.getAttribute('class')||'').slice(0,100), y: Math.round(header.getBoundingClientRect().y), h: Math.round(header.getBoundingClientRect().height), kids: ps };
    let h2d = null;
    if (h2) { const cs = getComputedStyle(h2); h2d = { txt: h2.textContent.trim().slice(0,30), cls: (h2.getAttribute('class')||'').slice(0,80), fs: cs.fontSize, lh: cs.lineHeight, fw: cs.fontWeight, h: Math.round(h2.getBoundingClientRect().height) }; }
    return { header: hr, h2: h2d, cardH: Math.round(card.getBoundingClientRect().height) };
  })()`);
  console.log(`[tenantsetup ${name}]`, JSON.stringify(r));
}

// ---- 2. reports: the TabsList + the inner block ----
for (const [name, s, base] of SIDES) {
  await open(s, base, "reports");
  const r = await evalOn(s, `(() => {
    const tabs = [...document.querySelectorAll('[role=tablist]')].map(t => ({ cls: (t.getAttribute('class')||'').slice(0,110), y: Math.round(t.getBoundingClientRect().y), h: Math.round(t.getBoundingClientRect().height), w: Math.round(t.getBoundingClientRect().width), cs: getComputedStyle(t).backgroundColor + ' ' + getComputedStyle(t).border }));
    const tabBtns = [...document.querySelectorAll('[role=tab]')].slice(0,3).map(b => ({ txt: b.textContent.trim().slice(0,16), x: Math.round(b.getBoundingClientRect().x), y: Math.round(b.getBoundingClientRect().y), w: Math.round(b.getBoundingClientRect().width), h: Math.round(b.getBoundingClientRect().height), cls: (b.getAttribute('class')||'').slice(0,90) }));
    return { tabs, tabBtns };
  })()`);
  console.log(`[reports-tabs ${name}]`, JSON.stringify(r));
  const r2 = await evalOn(s, `(() => {
    const cards = [...document.querySelectorAll('.rounded-xl.border')];
    const first = cards[0];
    const body = first.children[1];
    const inner = body.firstElementChild;
    return { bodyCls: (body.getAttribute('class')||'').slice(0,80), bodyKids: [...body.children].map(c => ({ tag: c.tagName, cls: (c.getAttribute('class')||'').slice(0,90), h: Math.round(c.getBoundingClientRect().height) })), innerTxt: inner ? inner.textContent.trim().slice(0,40) : null };
  })()`);
  console.log(`[reports-inner ${name}]`, JSON.stringify(r2));
}

// ---- 3. attendancedashboard: the header actions + chart ticks + table ----
for (const [name, s, base] of SIDES) {
  await open(s, base, "attendancedashboard");
  const r = await evalOn(s, `(() => {
    const main = document.querySelector('main .space-y-8, main [class*=space-y-8]');
    const header = main.firstElementChild;
    const hdrCls = (header.getAttribute('class')||'').slice(0,100);
    const hdrH = Math.round(header.getBoundingClientRect().height);
    const hdrY = Math.round(header.getBoundingClientRect().y);
    // the header's inner rows
    const rows = [...header.children].map(c => ({ cls: (c.getAttribute('class')||'').slice(0,80), y: Math.round(c.getBoundingClientRect().y), h: Math.round(c.getBoundingClientRect().height), txt: (c.textContent||'').trim().slice(0,40) }));
    // the filters area: selects + inputs + buttons in the header region
    const inputs = [...header.querySelectorAll('input')].map(i => ({ x: Math.round(i.getBoundingClientRect().x), y: Math.round(i.getBoundingClientRect().y), w: Math.round(i.getBoundingClientRect().width), h: Math.round(i.getBoundingClientRect().height), type: i.type, val: i.value }));
    const selects = [...header.querySelectorAll('button[role=combobox]')].map(b => ({ x: Math.round(b.getBoundingClientRect().x), y: Math.round(b.getBoundingClientRect().y), w: Math.round(b.getBoundingClientRect().width), h: Math.round(b.getBoundingClientRect().height), txt: b.textContent.trim().slice(0,20) }));
    const buttons = [...header.querySelectorAll('button:not([role=combobox])')].map(b => ({ x: Math.round(b.getBoundingClientRect().x), y: Math.round(b.getBoundingClientRect().y), w: Math.round(b.getBoundingClientRect().width), h: Math.round(b.getBoundingClientRect().height), txt: b.textContent.trim().slice(0,20) }));
    return { hdrCls: hdrCls, hdrH: hdrH, hdrY: hdrY, rows: rows, inputs: inputs, selects: selects, buttons: buttons };
  })()`);
  console.log(`[att-hdr ${name}]`, JSON.stringify(r));
  const c = await evalOn(s, `(() => {
    const svgs = [...document.querySelectorAll('svg.recharts-surface')];
    const s1 = svgs[0];
    const xt = [...s1.querySelectorAll('[class*=xAxis] text')].map(t => t.textContent.trim());
    const yt = [...s1.querySelectorAll('[class*=yAxis] text')].map(t => t.textContent.trim());
    const gridN = s1.querySelectorAll('.recharts-cartesian-grid line').length;
    const legend = [...s1.parentElement.querySelectorAll('.recharts-legend-item-text')].map(t => t.textContent.trim());
    // the bottom table
    const table = document.querySelector('table');
    const ths = table ? [...table.querySelectorAll('th')].map(th => ({ txt: th.textContent.trim().slice(0,14), cls: (th.getAttribute('class')||'').slice(0,60), x: Math.round(th.getBoundingClientRect().x), w: Math.round(th.getBoundingClientRect().width) })) : null;
    const tableCls = table ? (table.getAttribute('class')||'').slice(0,60) : null;
    return { xt: xt, yt: yt, gridN: gridN, legend: legend, ths: ths, tableCls: tableCls };
  })()`);
  console.log(`[att-chart ${name}]`, JSON.stringify(c));
}

// ---- 4. hrreports: the chart gridlines + the top-right buttons ----
for (const [name, s, base] of SIDES) {
  await open(s, base, "hrreports");
  const r = await evalOn(s, `(() => {
    const svg = document.querySelector('svg.recharts-surface');
    const xt = [...svg.querySelectorAll('[class*=xAxis] text')].map(t => t.textContent.trim());
    const yt = [...svg.querySelectorAll('[class*=yAxis] text')].map(t => t.textContent.trim());
    const grid = svg.querySelectorAll('.recharts-cartesian-grid line').length;
    const axis = svg.querySelectorAll('.recharts-cartesian-axis-line').length;
    const bars = svg.querySelectorAll('.recharts-bar-rectangle').length;
    const buttons = [...document.querySelectorAll('header button, [class*=max-w-7xl] > div:first-child button')].map(b => ({ txt: b.textContent.trim().slice(0,16), x: Math.round(b.getBoundingClientRect().x), y: Math.round(b.getBoundingClientRect().y), w: Math.round(b.getBoundingClientRect().width), h: Math.round(b.getBoundingClientRect().height), svgN: b.querySelectorAll('svg').length, svgCls: b.querySelector('svg') ? (b.querySelector('svg').getAttribute('class')||'').slice(0,40) : null }));
    return { xt: xt, yt: yt, grid: grid, axis: axis, bars: bars, buttons: buttons };
  })()`);
  console.log(`[hrreports ${name}]`, JSON.stringify(r));
}

// ---- 5. shiftswap: the stat card icon tile ----
for (const [name, s, base] of SIDES) {
  await open(s, base, "shiftswap");
  const r = await evalOn(s, `(() => {
    const card = document.querySelector('.grid [class*=rounded-xl], .grid > div');
    const inner = card.firstElementChild;
    const tile = card.querySelector('[class*=w-10]');
    const value = [...card.querySelectorAll('p,span,div')].filter(el => el.children.length === 0 && (el.textContent||'').trim().match(/^[0-9]/))[0];
    const label = [...card.querySelectorAll('p,span,div')].filter(el => el.children.length === 0 && (el.textContent||'').trim() && !el.textContent.trim().match(/^[0-9]/))[0];
    return { cardCls: (card.getAttribute('class')||'').slice(0,80), innerCls: inner ? (inner.getAttribute('class')||'').slice(0,80) : null, tileCls: tile ? (tile.getAttribute('class')||'').slice(0,90) : null, tileHtml: tile ? tile.outerHTML.slice(0,300) : null, value: value ? { txt: value.textContent.trim(), x: Math.round(value.getBoundingClientRect().x), y: Math.round(value.getBoundingClientRect().y), fs: getComputedStyle(value).fontSize } : null, label: label ? label.textContent.trim().slice(0,20) : null };
  })()`);
  console.log(`[shiftswap ${name}]`, JSON.stringify(r));
}

// ---- 6. companywall: the composer inner structure ----
for (const [name, s, base] of SIDES) {
  await open(s, base, "companywall");
  const r = await evalOn(s, `(() => {
    const composer = document.querySelector('textarea') ? document.querySelector('textarea').closest('.rounded-xl') : null;
    if (!composer) return null;
    const inner = [...composer.children].map(c => ({ cls: (c.getAttribute('class')||'').slice(0,70), h: Math.round(c.getBoundingClientRect().height), y: Math.round(c.getBoundingClientRect().y) }));
    const ta = composer.querySelector('textarea');
    const taR = ta.getBoundingClientRect();
    const row = composer.querySelector('[class*=items-center]:last-of-type, [class*=justify-between]');
    return { composerH: Math.round(composer.getBoundingClientRect().height), inner: inner, ta: { y: Math.round(taR.y), h: Math.round(taR.height), rows: ta.getAttribute('rows'), cls: (ta.getAttribute('class')||'').slice(0,70) }, row: row ? { cls: (row.getAttribute('class')||'').slice(0,70), y: Math.round(row.getBoundingClientRect().y), h: Math.round(row.getBoundingClientRect().height) } : null };
  })()`);
  console.log(`[companywall ${name}]`, JSON.stringify(r));
}
process.exit(0);
