#!/usr/bin/env node
// probe-r39-frontier.mjs — the remaining census frontiers:
// 1. careers with-data surface (REF carries cross-tenant demo data —
//    chips + count + card + the ?org= view)
// 2. tenantsetup at mobile (canvas p-4, input h-9, 16px card margin)
// 3. externaljobapplication interior
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 400) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

// --- 1. CAREERS (public board, both sides) ---
for (const [label, session, base] of [["REF", "ref", baseRef], ["LOC", "loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/careers`);
  await new Promise(r => setTimeout(r, 4000));
  const careers = await evalOn(session, `(() => {
    const chips = [...document.querySelectorAll('button, a')].filter(e => { const p = e.parentElement; return p && /flex-wrap|flex flex-wrap/.test((p.className || '')); });
    const h1 = document.querySelector('h1');
    const h2s = [...document.querySelectorAll('h2')].slice(0, 4).map(h => ({ t: h.textContent.slice(0, 40), cls: h.className.slice(0, 120) }));
    const search = document.querySelector('input');
    const cards = [...document.querySelectorAll('a[href*="job"], a[href*="career"]')].slice(0, 2).map(a => ({ href: a.getAttribute('href').slice(0, 60), cls: a.className.slice(0, 200) }));
    return { path: location.pathname, search: location.search, h1: h1 ? { t: h1.textContent.slice(0, 60), cls: h1.className.slice(0, 140) } : null, h2s, searchInput: search ? { cls: search.className.slice(0, 220), h: Math.round(search.getBoundingClientRect().height), ph: search.placeholder.slice(0, 40) } : null, chipCount: chips.length, firstChip: chips[0] ? { tag: chips[0].tagName, cls: chips[0].className.slice(0, 200), t: chips[0].textContent.slice(0, 24) } : null, cards, docH: document.documentElement.scrollHeight };
  })()`);
  console.log(`=== ${label} CAREERS ===`);
  console.log(JSON.stringify(careers, null, 1).slice(0, 1600));
}

// REF org view: click the first chip
const orgNav = await evalOn("ref", `(() => { const chips = [...document.querySelectorAll('button, a')].filter(e => { const p = e.parentElement; return p && /flex-wrap/.test((p.className || '')); }); if (!chips.length) return null; chips[0].click(); return { clicked: chips[0].textContent.slice(0, 24) }; })()`);
await new Promise(r => setTimeout(r, 3000));
const orgView = await evalOn("ref", `(() => { const h2s = [...document.querySelectorAll('h2')].slice(0, 3).map(h => ({ t: h.textContent.slice(0, 50), cls: h.className.slice(0, 120) })); const back = [...document.querySelectorAll('a, button')].find(e => /back to all/i.test(e.textContent || '')); return { path: location.pathname, search: location.search, h2s, backLink: back ? { tag: back.tagName, cls: back.className.slice(0, 140), t: back.textContent.trim().slice(0, 30) } : null }; })()`);
console.log("=== REF ORG VIEW ===");
console.log(JSON.stringify({ orgNav, orgView }, null, 1));
