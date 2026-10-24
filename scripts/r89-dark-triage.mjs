#!/usr/bin/env node
// r89-dark-triage.mjs — session-89: the text-digest triage for the dark-band
// structural routes (the r88-mobile-triage pattern). Per route: a DOM text
// digest (headings/buttons/inputs/classes census) on both sides at 390x844
// DARK, so clone-authored members can be separated from data-driven /
// REF-broken reads without VLM misreads.
import { execSync } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 120); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const ROUTES = (process.argv[2] || "").split(",").filter(Boolean);
const pairs = [["ref89dark", "https://eon.base44.app"], ["loc89dark", "http://127.0.0.1:3200"]];

const DIGEST = `(() => {
  const t = (sel) => [...document.querySelectorAll(sel)].map(e => (e.textContent || '').trim().slice(0, 28)).filter(Boolean).slice(0, 10);
  const first = (sel) => { const e = document.querySelector(sel); return e ? { cls: (e.className || '').toString().slice(0, 70), x: Math.round(e.getBoundingClientRect().x), y: Math.round(e.getBoundingClientRect().y), w: Math.round(e.getBoundingClientRect().width) } : null; };
  return {
    h1: t('h1,h2,h3').slice(0, 5),
    buttons: t('button').slice(0, 10),
    inputs: [...document.querySelectorAll('input,select,textarea')].map(i => ({ type: i.type || i.tagName, cls: (i.className || '').toString().slice(0, 40), w: Math.round(i.getBoundingClientRect().width) })).slice(0, 6),
    cards: document.querySelectorAll('[data-slot=card], .rounded-2xl, .rounded-xl').length,
    main: first('main > div:last-child'),
    pageSW: document.documentElement.scrollWidth,
    headerBg: (() => { const h = document.querySelector('header'); return h ? getComputedStyle(h).backgroundColor : 'none'; })(),
  };
})()`;

for (const route of ROUTES) {
  console.log(`\n########## ${route} ##########`);
  for (const [session, base] of pairs) {
    run(`agent-browser --session ${session} set viewport 390 844`);
    run(`agent-browser --session ${session} eval "localStorage.setItem('darkMode','true')"`);
    run(`agent-browser --session ${session} open ${base}/${route}`);
    await new Promise(r => setTimeout(r, 3500));
    const d = await evalOn(session, DIGEST);
    console.log(`[${session}] ${JSON.stringify(d).slice(0, 640)}`);
  }
}
process.exit(0);
