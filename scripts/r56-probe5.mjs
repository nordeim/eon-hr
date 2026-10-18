#!/usr/bin/env node
// r56-probe5.mjs — session-56 reconnaissance round 5: (1) re-verify the
// scroll-restoration divergence on a second page with a clean sequence;
// (2) the mobile /settings Company tab structure — the form grid columns,
// field labels, and section inventory (the 887-vs-1283 doc height).
import { execSync } from "node:child_process";
function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
const settle = (ms) => new Promise(r => setTimeout(r, ms));
function evalStr(expr) { return JSON.stringify(expr.split("\n").join(" ")); }
async function ev(session, expr) {
  const out = run(`agent-browser --session ${session} eval ${evalStr(expr)}`);
  try { return JSON.parse(JSON.parse(out.trim())); } catch { return "ERR:" + out.slice(0, 300); }
}

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

async function side(session, base, tag) {
  console.log(`\n===== ${tag} =====`);

  // (1) scroll restore, second page, clean: /compliance (docSh 900? use
  // hrreports where docSh 949) — scroll 40, nav, back, read at 500ms AND
  // 2500ms (the settle-dependence check)
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/hrreports`);
  await settle(3000);
  await ev(session, "(() => { window.scrollTo(0, 40); return window.scrollY; })()");
  await ev(session, `(() => { const a = [...document.querySelectorAll('[data-sidebar=menu-button]')].filter(x => x.tagName==='A' && /training/i.test(x.textContent||'') && x.offsetParent !== null)[0]; if (a) a.click(); return 'nav'; })()`);
  await settle(2500);
  run(`agent-browser --session ${session} back`);
  await settle(600);
  const early = await ev(session, "window.scrollY");
  await settle(2400);
  const late = await ev(session, "window.scrollY");
  console.log("scroll after back (600ms / 3000ms):", JSON.stringify(early), "/", JSON.stringify(late));

  // also: the outbound navigation's scroll behavior (push → scroll top?)
  await ev(session, "(() => { window.scrollTo(0, 40); return window.scrollY; })()");
  const preNav = await ev(session, "window.scrollY");
  await ev(session, `(() => { const a = [...document.querySelectorAll('[data-sidebar=menu-button]')].filter(x => x.tagName==='A' && /compliance/i.test(x.textContent||'') && x.offsetParent !== null)[0]; if (a) a.click(); return 'nav'; })()`);
  await settle(2500);
  console.log("scroll after FORWARD nav (push):", JSON.stringify(await ev(session, "window.scrollY")), "(pre-nav:", JSON.stringify(preNav) + ")");

  // (2) mobile /settings Company structure
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/settings`);
  await settle(3200);
  const structure = await ev(session, `(() => {
    const labels = [...document.querySelectorAll('main label')].map(l => (l.textContent||'').trim().slice(0,28)).filter(Boolean);
    const grids = [...document.querySelectorAll('main div')].filter(d => /grid/.test((d.className||''))).slice(0, 6).map(d => ({ cls: (d.className||'').toString().slice(0,80), cols: getComputedStyle(d).gridTemplateColumns ? getComputedStyle(d).gridTemplateColumns.split(' ').length : 0, childCount: d.children.length }));
    const main = document.querySelector('main');
    const mainH = main ? main.scrollHeight : null;
    return { docSh: document.documentElement.scrollHeight, mainH, labels: labels.slice(0, 24), grids };
  })()`);
  console.log("mobile /settings structure:", JSON.stringify(structure).slice(0, 1400));
}

await side("ref56", baseRef, "REF");
await side("loc", baseLoc, "LOC");
process.exit(0);
