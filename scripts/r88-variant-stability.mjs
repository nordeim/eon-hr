#!/usr/bin/env node
// r88-variant-stability.mjs — the REF serves a documented SECOND BUILD
// VARIANT per page load (the r87 standing finding). Before writing the
// remediation plan, re-verify each key REF measurement 3x (fresh loads)
// to confirm the recipe is the STABLE variant, not the flipped one.
import { execSync } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const base = "https://eon.base44.app";

const CHECKS = {
  // shiftswap: the stat-card tile question (inline vs tile)
  shiftswap: `(() => { const cards = [...document.querySelectorAll('div')].filter(e => (e.getAttribute('class')||'') === 'p-4 flex items-center gap-3'); const c = cards[0]; if (!c) return 'NO-CARD'; const tile = c.querySelector('div.w-10'); const svg = c.querySelector('svg'); return { hasTile: !!tile, tileCls: tile ? tile.getAttribute('class') : null, iconCls: svg ? (svg.getAttribute('class')||'').match(/lucide-[a-z0-9-]+/)?.[0] : null, iconSize: svg ? svg.getAttribute('class') : null }; })()`,
  // chat: the conversations sidebar visibility
  chat: `(() => { const list = [...document.querySelectorAll('div')].find(e => /w-80/.test(e.getAttribute('class')||'') && /Messages/i.test(e.textContent||'')); return { listCls: list ? list.getAttribute('class') : null, w: list ? Math.round(list.getBoundingClientRect().width) : null }; })()`,
  // shiftcalendar: the table min-width
  shiftcalendar: `(() => { const t = document.querySelector('table'); return { style: t ? t.getAttribute('style') : null, w: t ? Math.round(t.getBoundingClientRect().width) : null }; })()`,
  // attendancedashboard: the month input
  attendancedashboard: `(() => { const hdr = [...document.querySelectorAll('div')].find(d => /All Departments/.test(d.textContent||'') && d.querySelectorAll('button').length >= 1 && d.textContent.length < 150 && !/Dashboard/i.test(d.textContent)); const inp = hdr ? hdr.querySelector('input') : null; return { hasInput: !!inp, type: inp ? inp.type : null, w: inp ? Math.round(inp.getBoundingClientRect().width) : null }; })()`,
  // profile: the icon family
  profile: `(() => { const btn = [...document.querySelectorAll('button')].find(b => /Change Photo/i.test(b.textContent||'')); const tabs = [...document.querySelectorAll('[role=tab], button')].filter(t => /^(General|Social Accounts)$/.test((t.textContent||'').trim())); const ic = (el) => el && el.querySelector('svg') ? (el.querySelector('svg').getAttribute('class')||'').match(/lucide-[a-z0-9-]+/)?.[0] : null; return { changePhoto: ic(btn), general: ic(tabs[0]), social: ic(tabs[1]) }; })()`,
  // reports: the category icon family
  reports: `(() => { const els = [...document.querySelectorAll('button')].filter(e => /Leave & Absence|Payroll & Compensation|Employee Relations|Contracts & Compliance/.test(e.textContent||'') && e.querySelectorAll('svg').length >= 1 && e.textContent.length < 60); const out = {}; for (const e of els) { const svg = e.querySelector('svg'); out[(e.textContent||'').trim().slice(0,22)] = svg ? (svg.getAttribute('class')||'').match(/lucide-[a-z0-9-]+/)?.[0] : null; } return out; })()`,
  // analyticsdashboard: the cluster wrap
  analyticsdashboard: `(() => { const bar = [...document.querySelectorAll('div')].find(d => /Last 6 months/.test(d.textContent||'') && d.textContent.length < 120 && d.querySelectorAll('button').length >= 2); const cluster = [...bar.children].find(c => (c.getAttribute('class')||'').includes('flex')); return { clusterCls: cluster ? cluster.getAttribute('class') : null }; })()`,
};

for (const [route, probe] of Object.entries(CHECKS)) {
  const reads = [];
  for (let i = 0; i < 3; i++) {
    run(`agent-browser --session ref88v set viewport 390 844`);
    run(`agent-browser --session ref88v open ${base}/${route}?_v=${Date.now()}_${i}`);
    await new Promise(r => setTimeout(r, 3200));
    reads.push(await evalOn("ref88v", probe));
  }
  const stable = JSON.stringify(reads[0]) === JSON.stringify(reads[1]) && JSON.stringify(reads[1]) === JSON.stringify(reads[2]);
  console.log(`\n## ${route} — ${stable ? "STABLE (3/3 identical)" : "UNSTABLE (variant flip!)"}`);
  reads.forEach((r, i) => console.log(`  read${i}: ${JSON.stringify(r).slice(0, 300)}`));
}
process.exit(0);
