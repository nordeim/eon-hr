#!/usr/bin/env node
// verify-r40.mjs — session-41 / parity round 40 live verification:
// the careers family pair (wrapper + zero-card family + the with-data
// card via an API-seeded job + the org view), the external page pair,
// and the login Sign in button's class members.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const results = [];
function rec(name, a, b) { results.push({ name, ref: a, loc: b, match: JSON.stringify(a) === JSON.stringify(b) }); }

// ---------- 0. seed one job on LOC (the with-data surfaces) ----------
// auth: reuse the loc browser session's cookie via the page itself.
run(`agent-browser --session loc set viewport 1440 900`);
run(`agent-browser --session loc open ${baseLoc}/careers`);
await new Promise(r => setTimeout(r, 3000));
const seeded = await evalOn("loc", `(() => {
  return fetch('/api/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'System Admin', company: 'Company', department: 'IT', location: 'Jeddah', type: 'full_time', status: 'open', salaryRange: '12000-15000', description: 'We are looking for a detail-oriented and technology-forward administrator to join our growing platform team. You will own critical infrastructure, mentor peers, and shape the engineering culture across the organization.' }) }).then(r => r.json()).then(j => JSON.stringify(j));
})()`);
const seedJson = typeof seeded === "string" ? seeded : JSON.stringify(seeded);
let jobId = null;
try { jobId = JSON.parse(seedJson).data?.job?.id ?? null; } catch {}
console.log(`seeded job: ${jobId ?? "FAILED: " + seedJson.slice(0, 120)}`);

// ---------- 1. the careers board pair (desktop 1440) ----------
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session ref open ${baseRef}/careers`);
await new Promise(r => setTimeout(r, 4000));
run(`agent-browser --session loc reload`);
await new Promise(r => setTimeout(r, 3000));

const board = async (s) => evalOn(s, `(() => {
  const content = [...document.querySelectorAll('div')].find(d => d.className === 'max-w-6xl mx-auto px-4 py-12' && d.getBoundingClientRect().y > 200);
  const row = [...document.querySelectorAll('div')].find(d => d.className === 'mb-4 flex items-center justify-between');
  const grid = [...document.querySelectorAll('div')].find(d => /grid-cols/.test(d.className) && d.children.length > 0 && d.getBoundingClientRect().y > 200);
  const card = grid ? grid.children[0] : null;
  return { contentCls: content ? content.className : null, contentY: content ? Math.round(content.getBoundingClientRect().y) : null, rowCls: row ? row.className : null, rowH3: row && row.querySelector('h3') ? row.querySelector('h3').textContent : null, gridCls: grid ? grid.className : null, cardCls: card ? card.className : null };
})()`);
rec("careers board (wrapper/rhythm/row/grid/card)", await board("ref"), await board("loc"));

// the card interior pair
const cardInterior = async (s) => evalOn(s, `(() => {
  const grid = [...document.querySelectorAll('div')].find(d => /grid-cols/.test(d.className) && d.children.length > 0 && d.getBoundingClientRect().y > 200);
  if (!grid) return null;
  const card = grid.children[0];
  const badge = card.querySelector('div.rounded-md.border');
  const title = card.querySelector('.text-xl.font-semibold');
  const company = card.querySelector('p.text-sm.text-slate-600');
  const meta = card.querySelector('.space-y-2');
  const desc = card.querySelector('p.line-clamp-3');
  const btn = [...card.querySelectorAll('button')].pop();
  return { badgeCls: badge ? badge.className.slice(0, 200) : null, badgeT: badge ? badge.textContent : null, titleT: title ? title.textContent : null, titleCls: title ? title.className : null, companyT: company ? company.textContent : null, metaCls: meta ? meta.className : null, metaRows: meta ? [...meta.children].map(r => ({ cls: r.className, t: r.textContent.trim().slice(0, 24) })) : null, descCls: desc ? desc.className : null, descClamp: desc ? getComputedStyle(desc).webkitLineClamp : null, btnT: btn ? btn.textContent.trim() : null, btnCls: btn ? btn.className.slice(-90) : null, btnW: btn ? Math.round(btn.getBoundingClientRect().width) : null };
})()`);
rec("careers job card interior (badge/company/meta/clamp/CTA)", await cardInterior("ref"), await cardInterior("loc"));

// ---------- 2. the zero-card family pair (REF filtered vs LOC org-zero) ----------
// REF: search nonsense → the filtered zero; LOC: ?org=<no-jobs company> — hmm,
// org only resolves with jobs; use a direct compare of the filtered state on both.
for (const s of ["ref", "loc"]) {
  await evalOn(s, `(() => { const i = document.querySelector('input'); if (!i) return 'no-input'; const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(i, 'zzzzqqqqxxxx'); i.dispatchEvent(new Event('input', { bubbles: true })); return 'typed'; })()`);
  await new Promise(r => setTimeout(r, 1200));
}
const zeroCard = async (s) => evalOn(s, `(() => {
  const card = [...document.querySelectorAll('div')].find(d => /No Open Positions/i.test(d.textContent||'') && d.className.includes('py-12'));
  if (!card) return null;
  const svg = card.querySelector('svg'); const h3 = card.querySelector('h3'); const p = card.querySelector('p');
  return { cardCls: card.className, border: getComputedStyle(card).borderTopColor, shadow: getComputedStyle(card).boxShadow.includes('rgb') || getComputedStyle(card).boxShadow.includes('rgba'), padTop: getComputedStyle(card).paddingTop, svgCls: svg ? svg.getAttribute('class') : null, svgW: svg ? Math.round(svg.getBoundingClientRect().width) : null, h3Cls: h3 ? h3.className : null, pCls: p ? p.className : null, pT: p ? p.textContent : null };
})()`);
rec("zero-card family (filtered state, both sides)", await zeroCard("ref"), await zeroCard("loc"));
// clear the searches
for (const s of ["ref", "loc"]) {
  await evalOn(s, `(() => { const i = document.querySelector('input'); if (!i) return 'no-input'; const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(i, ''); i.dispatchEvent(new Event('input', { bubbles: true })); return 'cleared'; })()`);
  await new Promise(r => setTimeout(r, 800));
}

// ---------- 3. the org view pair ----------
await evalOn("ref", `(() => { const chips = [...document.querySelectorAll('button')].filter(b => { const p = b.parentElement; return p && /flex-wrap/.test((p.className||'')); }); const t = chips.find(c => c.textContent.trim() === 'Company'); (t || chips[0]).click(); return 'ok'; })()`);
await evalOn("loc", `(() => { const chips = [...document.querySelectorAll('button')].filter(b => { const p = b.parentElement; return p && /flex-wrap/.test((p.className||'')); }); const t = chips.find(c => c.textContent.trim() === 'Company'); (t || chips[0]).click(); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 2500));
const orgView = async (s) => evalOn(s, `(() => {
  const content = [...document.querySelectorAll('div')].find(d => d.className === 'max-w-6xl mx-auto px-4 py-12' && d.getBoundingClientRect().y > 200);
  const section = content ? [...content.children].find(c => c.className === 'mb-8') : null;
  const back = section ? section.querySelector('button') : null;
  const h2 = section ? section.querySelector('h2') : null;
  const row = content ? [...content.children].find(c => c.className === 'mb-4 flex items-center justify-between') : null;
  return { search: location.search, sectionCls: section ? section.className : null, backCls: back ? back.className.slice(-80) : null, backT: back ? back.textContent.trim() : null, h2Cls: h2 ? h2.className : null, h2T: h2 ? h2.textContent : null, rowCls: row ? row.className : null };
})()`);
rec("org view (section/back/h2/row)", await orgView("ref"), await orgView("loc"));

// ---------- 4. the external page pair ----------
const extPage = async (s, base) => {
  run(`agent-browser --session ${s} open ${base}/externaljobapplication`);
  await new Promise(r => setTimeout(r, 3500));
  return evalOn(s, `(() => {
    const canvas = [...document.querySelectorAll('div')].find(d => /min-h-screen/.test(d.className) && /from-blue-50/.test(d.className));
    const wrapper = canvas ? [...canvas.children].find(c => /max-w-6xl/.test(c.className)) : null;
    const header = wrapper ? wrapper.firstElementChild : null;
    const h1 = header ? header.querySelector('h1') : null;
    const card = wrapper ? [...wrapper.children].find(c => /py-12/.test(c.className)) : null;
    const svg = card ? card.querySelector('svg') : null;
    const h3 = card ? card.querySelector('h3') : null;
    return { canvasCls: canvas ? canvas.className : null, wrapperCls: wrapper ? wrapper.className : null, headerCls: header ? header.className : null, h1Cls: h1 ? h1.className : null, cardCls: card ? card.className : null, cardBorder: card ? getComputedStyle(card).borderTopColor : null, svgCls: svg ? svg.getAttribute('class') : null, h3Cls: h3 ? h3.className : null, h3T: h3 ? h3.textContent : null };
  })()`);
};
rec("external page (wrapper/header/card family)", await extPage("ref", baseRef), await extPage("loc", baseLoc));

// ---------- 5. the LOC external params resolution (the superset) ----------
run(`agent-browser --session loc open "${baseLoc}/externaljobapplication?org=company&job=system-admin"`);
await new Promise(r => setTimeout(r, 3000));
const extParams = await evalOn("loc", `(() => {
  const listed = [...document.querySelectorAll('div.px-2 > p')].map(p => p.textContent.trim()).slice(0, 3);
  return { path: location.pathname + location.search, listed };
})()`);
console.log("LOC external params (the superset):", JSON.stringify(extParams));

// ---------- 6. the login Sign in members (class parity) ----------
for (const [label, session, base] of [["ref", "ref", baseRef], ["loc", "loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3000));
}
const signCls = async (s) => evalOn(s, `(() => { const b = [...document.querySelectorAll('button')].find(x => /^sign in$/i.test((x.textContent||'').trim())); return { hasOffsetBg: b.className.includes('ring-offset-background'), hasSvgGuards: b.className.includes('[&_svg]:size-4'), ringColor: b.className.match(/focus-visible:ring-(ring|#09090b)/) ? b.className.match(/focus-visible:ring-(ring|#09090b)/)[1] : null, h: Math.round(b.getBoundingClientRect().height) }; })()`);
const refSign = await signCls("ref"), locSign = await signCls("loc");
rec("login Sign in members (offset+guards+height)", { h: refSign.h, hasOffsetBg: refSign.hasOffsetBg, hasSvgGuards: refSign.hasSvgGuards }, { h: locSign.h, hasOffsetBg: locSign.hasOffsetBg, hasSvgGuards: locSign.hasSvgGuards });

// ---------- 7. cleanup: delete the seeded job ----------
if (jobId) {
  const del = await evalOn("loc", `(() => fetch('/api/jobs?id=${jobId}', { method: 'DELETE' }).then(r => r.json()).then(j => JSON.stringify(j)))()`);
  console.log(`seeded job deleted: ${del}`);
}

console.log("\n===== RESULTS =====");
for (const r of results) {
  console.log(`${r.match ? "MATCH " : "DIFF  "} ${r.name}`);
  if (!r.match) {
    console.log(`  ref: ${JSON.stringify(r.ref).slice(0, 500)}`);
    console.log(`  loc: ${JSON.stringify(r.loc).slice(0, 500)}`);
  }
}
const m = results.filter(r => r.match).length;
console.log(`\n${m}/${results.length} MATCH`);
