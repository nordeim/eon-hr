#!/usr/bin/env node
// r108-dialog-a11y-census2.mjs — the CONTROLLED-dialog pass of the s199
// doctrine census: pages that open dialogs via state-setting buttons
// (<Dialog open={x}> + onClick setX(true)) carry NO aria-haspopup trigger —
// the first pass missed them. This pass clicks every create-ish action
// button per page and censuses any [role=dialog] that opens.
// Usage: node scripts/r108-dialog-a11y-census2.mjs
import { execSync } from "node:child_process";

function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 300); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const base = "http://127.0.0.1:3200";
const session = "loc108c2";

// login once
run(`agent-browser --session ${session} close 2>/dev/null; true`);
run(`agent-browser --session ${session} set viewport 1440 900`);
run(`agent-browser --session ${session} open ${base}/login`);
await new Promise(r => setTimeout(r, 3000));
run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise(r => setTimeout(r, 500));
run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
await new Promise(r => setTimeout(r, 500));
const snap = run(`agent-browser --session ${session} snapshot -i -c`);
const m = snap.match(/- button "[^"]*[Ss]ign in[^"]*" \[ref=(\w+)\]/);
if (m) run(`agent-browser --session ${session} click @${m[1]}`);
await new Promise(r => setTimeout(r, 5000));
console.log("login landed:", run(`agent-browser --session ${session} eval "location.pathname"`).trim());

const routes = ["/announcements", "/documenttracker", "/surveys", "/staffrequests", "/settings", "/templates", "/allleaverequests", "/payrollreports", "/shiftcalendar", "/chat", "/communications", "/assetmanagement", "/expenses", "/payroll", "/hrletters", "/profile", "/workflowautomation", "/leavemanagement", "/taskmanager", "/training", "/hrassistantchat", "/performancemanagement", "/payrollmodule", "/shiftswap", "/attendance", "/evaluations", "/recruitmentkanban", "/offboarding", "/dashboard"];

// the create-ish verbs (the controlled-dialog openers)
const VERBS = "add|new|create|request|submit|generate|schedule|initiate|mark|import|configure|send|invite|assign|record|log|apply|write|compose|post|start|plan|book|issue|draft";

const ACC_NAME = `(() => {
  const dlg = [...document.querySelectorAll('[role=dialog]')].find(e => e.getBoundingClientRect().width > 0);
  if (!dlg) return { open: false };
  const nameOf = (el) => {
    if (el.getAttribute('aria-label')) return 'aria-label';
    const lb = el.getAttribute('aria-labelledby');
    if (lb && document.getElementById(lb)) return 'aria-labelledby';
    if (el.id && document.querySelector('label[for="' + el.id + '"]')) return 'label[for]';
    const lab = el.closest('label');
    if (lab && lab.textContent.trim()) return 'label-wrap';
    if (el.getAttribute('placeholder')) return 'placeholder';
    if (el.getAttribute('title')) return 'title';
    return null;
  };
  /* skip aria-hidden mirrors */ const ctrls = [...dlg.querySelectorAll('input, select, textarea, [role=combobox]')].filter(el => el.type !== 'hidden' && el.getAttribute('aria-hidden') !== 'true' && el.getAttribute('tabindex') !== '-1');
  const unnamed = ctrls.map(el => ({ tag: el.tagName.toLowerCase(), type: el.type || '', name: el.name || el.id || '', via: nameOf(el) })).filter(x => !x.via);
  const btns = [...dlg.querySelectorAll('button')].filter(b => getComputedStyle(b).display !== 'none');
  const unnamedBtns = btns.filter(b => !nameOf(b) && !(b.textContent || '').trim()).map(b => ({ tag: 'button', cls: (b.getAttribute('class') || '').slice(0, 40) }));
  const title = (dlg.querySelector('h2, [role=heading]')?.textContent || '').trim().slice(0, 40);
  return { open: true, title, controls: ctrls.length, unnamed, unnamedBtns };
})()`;

let defects = 0;
let dialogStates = 0;
const seen = new Set();
for (const route of routes) {
  run(`agent-browser --session ${session} open ${base}${route}`);
  await new Promise(r => setTimeout(r, 2500));
  const cands = await evalOn(session, `(() => [...document.querySelectorAll('button')].filter(b => { const t = ((b.textContent || '') + ' ' + (b.getAttribute('aria-label') || '')).trim(); return new RegExp('\\\\b(${VERBS})\\\\b', 'i').test(t) && !/sign out|export/i.test(t) && getComputedStyle(b).display !== 'none'; }).map(b => ((b.textContent || '') + (b.getAttribute('aria-label') || '')).trim().replace(/\\s+/g, ' ').slice(0, 36)))()`);
  if (!Array.isArray(cands) || cands.length === 0) { console.log(`${route}: no create-ish buttons`); continue; }
  for (let i = 0; i < Math.min(cands.length, 8); i++) {
    const label = cands[i];
    const key = `${route}::${label}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const clickExpr = "(() => { const btns=[...document.querySelectorAll('button')].filter(b => { const t = ((b.textContent || '') + ' ' + (b.getAttribute('aria-label') || '')).trim(); return new RegExp('\\\\b(" + VERBS + ")\\\\b', 'i').test(t) && !/sign out|export/i.test(t) && getComputedStyle(b).display !== 'none'; }); const b = btns[" + i + "]; if (b) { b.click(); return 'CLICKED'; } return 'NOTRIGGER'; })()";
    const clicked = run(`agent-browser --session ${session} eval ${JSON.stringify(clickExpr)}`).trim();
    if (!clicked.includes("CLICKED")) { continue; }
    await new Promise(r => setTimeout(r, 1100));
    const census = await evalOn(session, ACC_NAME, 300);
    if (!census.open) {
      run(`agent-browser --session ${session} press Escape`);
      await new Promise(r => setTimeout(r, 400));
      continue;
    }
    dialogStates++;
    if (census.unnamed?.length || census.unnamedBtns?.length) {
      defects++;
      console.log(`${route} [${label}] "${census.title}": ${census.controls} controls — UNNAMED: ` + JSON.stringify([...(census.unnamed || []), ...(census.unnamedBtns || [])]).slice(0, 280));
    } else {
      console.log(`${route} [${label}] "${census.title}": ${census.controls} controls — all named`);
    }
    run(`agent-browser --session ${session} press Escape`);
    await new Promise(r => setTimeout(r, 500));
  }
}
console.log(`\nCONTROLLED-DIALOG CENSUS COMPLETE: ${dialogStates} dialog-open states censused · ${defects} with unnamed controls`);
run(`agent-browser --session ${session} close 2>/dev/null; true`);
process.exit(0);
