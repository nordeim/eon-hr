#!/usr/bin/env node
// r88-variant-stability2.mjs — single authenticated REF session, one
// process, sequential 3x reloads per route. Verifies each key recipe is
// the STABLE REF variant (the r87 second-build-variant finding means
// every recipe must be re-read on fresh loads before pinning).
import { execSync } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 120); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 160) }; } }

const base = "https://eon.base44.app";
const S = "ref88s";

// auth once
run(`agent-browser --session ${S} set viewport 390 844`);
run(`agent-browser --session ${S} eval "localStorage.setItem('darkMode','false'); localStorage.removeItem('app_lang');"`);
run(`agent-browser --session ${S} open ${base}/login`);
await new Promise(r => setTimeout(r, 3000));
run(`agent-browser --session ${S} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise(r => setTimeout(r, 400));
run(`agent-browser --session ${S} fill 'input[type=password]' '$Abcd1234'`);
await new Promise(r => setTimeout(r, 400));
const snap = run(`agent-browser --session ${S} snapshot -i -c`);
const bref = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
if (bref) run(`agent-browser --session ${S} click @${bref}`);
await new Promise(r => setTimeout(r, 4200));
console.log("auth:", run(`agent-browser --session ${S} get url`).trim());

const CHECKS = {
  shiftswap: `(() => { const cards = [...document.querySelectorAll('div')].filter(e => (e.getAttribute('class')||'') === 'p-4 flex items-center gap-3'); const c = cards[0]; if (!c) return 'NO-CARD'; const tile = c.querySelector('div.w-10'); const svg = c.querySelector('svg'); return { hasTile: !!tile, tileCls: tile ? tile.getAttribute('class') : null, icon: svg ? (svg.getAttribute('class')||'') : null }; })()`,
  chat: `(() => { const list = [...document.querySelectorAll('div')].find(e => /w-80/.test(e.getAttribute('class')||'') && /Messages/i.test(e.textContent||'')); return { listCls: list ? list.getAttribute('class') : null, w: list ? Math.round(list.getBoundingClientRect().width) : null }; })()`,
  shiftcalendar: `(() => { const t = document.querySelector('table'); return { style: t ? t.getAttribute('style') : null, w: t ? Math.round(t.getBoundingClientRect().width) : null }; })()`,
  attendancedashboard: `(() => { const hdr = [...document.querySelectorAll('div')].find(d => /All Departments/.test(d.textContent||'') && d.querySelectorAll('button').length >= 1 && d.textContent.length < 150 && !/Dashboard/i.test(d.textContent)); const inp = hdr ? hdr.querySelector('input') : null; return { hasInput: !!inp, type: inp ? inp.type : null, w: inp ? Math.round(inp.getBoundingClientRect().width) : null }; })()`,
  profile: `(() => { const btn = [...document.querySelectorAll('button')].find(b => /Change Photo/i.test(b.textContent||'')); const tabs = [...document.querySelectorAll('[role=tab], button')].filter(t => /^(General|Social Accounts)$/.test((t.textContent||'').trim())); const ic = (el) => el && el.querySelector('svg') ? (el.querySelector('svg').getAttribute('class')||'').match(/lucide-[a-z0-9-]+/)?.[0] : null; return { changePhoto: ic(btn), general: ic(tabs[0]), social: ic(tabs[1]) }; })()`,
  reports: `(() => { const els = [...document.querySelectorAll('button')].filter(e => /Leave & Absence|Payroll & Compensation|Employee Relations|Contracts & Compliance/.test(e.textContent||'') && e.querySelectorAll('svg').length >= 1 && e.textContent.length < 60); const out = {}; for (const e of els) { const svg = e.querySelector('svg'); out[(e.textContent||'').trim().slice(0,22)] = svg ? (svg.getAttribute('class')||'').match(/lucide-[a-z0-9-]+/)?.[0] : null; } return out; })()`,
  analyticsdashboard: `(() => { const bar = [...document.querySelectorAll('div')].find(d => /Last 6 months/.test(d.textContent||'') && d.textContent.length < 120 && d.querySelectorAll('button').length >= 2); if (!bar) return 'NOBAR'; const cluster = [...bar.children].find(c => (c.getAttribute('class')||'').includes('flex')); return { clusterCls: cluster ? cluster.getAttribute('class') : null }; })()`,
};

for (const [route, probe] of Object.entries(CHECKS)) {
  const reads = [];
  for (let i = 0; i < 3; i++) {
    run(`agent-browser --session ${S} set viewport 390 844`);
    run(`agent-browser --session ${S} open ${base}/${route}?r=${i}`);
    await new Promise(r => setTimeout(r, 3500));
    reads.push(await evalOn(S, probe));
  }
  const stable = JSON.stringify(reads[0]) === JSON.stringify(reads[1]) && JSON.stringify(reads[1]) === JSON.stringify(reads[2]);
  console.log(`\n## ${route} — ${stable ? "STABLE (3/3)" : "UNSTABLE"}`);
  reads.forEach((r, i) => console.log(`  read${i}: ${JSON.stringify(r).slice(0, 260)}`));
}
process.exit(0);
