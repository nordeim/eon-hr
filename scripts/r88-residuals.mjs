#!/usr/bin/env node
// r88-residuals.mjs — the post-fix residual probes: att chart1 geometry,
// tenantsetup fields, hrreports data table, companywall action row,
// reports tab glyph paths.
import { execSync } from "node:child_process";
function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const t = out.trim(); try { return JSON.parse(t); } catch { try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } } }
async function open(session, base, route, ms = 4500) {
  run(`agent-browser --session ${session} open ${base}/${route}`);
  await new Promise(r => setTimeout(r, ms));
}
const SIDES = [["REF", "ref88x", "https://eon.base44.app"], ["LOC", "loc88x", "http://127.0.0.1:3200"]];

// 1. att chart1 grid geometry
for (const [name, s, base] of SIDES) {
  await open(s, base, "attendancedashboard");
  const r = await evalOn(s, `(() => {
    const svgs = [...document.querySelectorAll('svg.recharts-surface')].filter(v => Math.round(v.getBoundingClientRect().width) === 498 && v.getBoundingClientRect().x < 800);
    const svg = svgs[0];
    const hs = [...svg.querySelectorAll('.recharts-cartesian-grid line')].filter(l => l.getAttribute('x1') !== l.getAttribute('x2')).map(l => l.getAttribute('y1'));
    const vs = [...svg.querySelectorAll('.recharts-cartesian-grid line')].filter(l => l.getAttribute('y1') === l.getAttribute('y2')).map(l => l.getAttribute('x1'));
    const axis = [...svg.querySelectorAll('.recharts-cartesian-axis-line')].map(l => l.getAttribute('x1') + ',' + l.getAttribute('y1') + '-' + l.getAttribute('x2') + ',' + l.getAttribute('y2'));
    const xt = [...svg.querySelectorAll('text')].map(t => t.textContent.trim()).slice(0, 20);
    return JSON.stringify({ hs: hs, vs: vs, axis: axis, xt: xt });
  })()`);
  console.log(`[att-c1 ${name}]`, r);
}

// 2. tenantsetup fields
for (const [name, s, base] of SIDES) {
  await open(s, base, "tenantsetup");
  const r = await evalOn(s, `(() => {
    const form = document.querySelector('form');
    const kids = [...form.querySelectorAll('.space-y-2')].map(g => { const r = g.getBoundingClientRect(); return { y: Math.round(r.y), h: Math.round(r.height) }; });
    const inputs = [...form.querySelectorAll('input')].map(i => { const r = i.getBoundingClientRect(); return { y: Math.round(r.y), h: Math.round(r.height), w: Math.round(r.width), x: Math.round(r.x), ph: i.placeholder || '' }; });
    return JSON.stringify({ kids: kids, inputs: inputs });
  })()`);
  console.log(`[tenant ${name}]`, r);
}

// 3. hrreports data table body
for (const [name, s, base] of SIDES) {
  await open(s, base, "hrreports");
  const r = await evalOn(s, `(() => {
    const cards = [...document.querySelectorAll('[class*=rounded-xl][class*=border]')];
    const c = cards.find(k => (k.textContent||'').includes('Data Table'));
    const body = [...c.children].find(k => (k.getAttribute('class')||'').includes('p-6') && !k.textContent.includes('Data Table'));
    const bodyKids = [...body.children].map(k => { const r = k.getBoundingClientRect(); return { tag: k.tagName, cls: (k.getAttribute('class')||'').slice(0,60), y: Math.round(r.y), h: Math.round(r.height), txt: (k.textContent||'').trim().slice(0,40) }; });
    return JSON.stringify({ bodyKids: bodyKids, bodyH: Math.round(body.getBoundingClientRect().height) });
  })()`);
  console.log(`[hr-dt ${name}]`, r);
}

// 4. companywall action row + Post button
for (const [name, s, base] of SIDES) {
  await open(s, base, "companywall");
  const r = await evalOn(s, `(() => {
    const post = [...document.querySelectorAll('button')].find(b => (b.textContent||'').trim() === 'Post');
    const row = post.parentElement;
    const rowR = row.getBoundingClientRect();
    const postR = post.getBoundingClientRect();
    const btns = [...row.querySelectorAll('button')].map(b => { const r = b.getBoundingClientRect(); return { txt: (b.textContent||'').trim().slice(0,10), x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height), svg: b.querySelector('svg') ? b.querySelector('svg').getAttribute('class').slice(0,40) : null }; });
    return JSON.stringify({ rowCls: (row.getAttribute('class')||'').slice(0,80), rowY: Math.round(rowR.y), rowH: Math.round(rowR.height), btns: btns });
  })()`);
  console.log(`[wall-row ${name}]`, r);
}

// 5. reports tab glyph paths (Plane + DollarSign)
for (const [name, s, base] of SIDES) {
  await open(s, base, "reports");
  const r = await evalOn(s, `(() => {
    const tab = [...document.querySelectorAll('[role=tab]')].find(b => (b.textContent||'').includes('Leave'));
    const svg = tab.querySelector('svg');
    const paths = [...svg.querySelectorAll('path')].map(p => (p.getAttribute('d')||'').slice(0,30)).join('|') + ' ## ' + [...svg.querySelectorAll('line')].map(l => 'L').join('');
    return JSON.stringify({ plane: paths });
  })()`);
  console.log(`[rep-plane ${name}]`, r);
  const r2 = await evalOn(s, `(() => {
    const tab = [...document.querySelectorAll('[role=tab]')].find(b => (b.textContent||'').includes('Payroll'));
    const svg = tab.querySelector('svg');
    const kids = [...svg.children].map(k => k.tagName + ':' + (k.getAttribute('d') || k.getAttribute('points') || '').slice(0,20)).join('|');
    return JSON.stringify({ dollar: kids });
  })()`);
  console.log(`[rep-dollar ${name}]`, r2);
}
process.exit(0);
