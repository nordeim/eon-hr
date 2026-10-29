#!/usr/bin/env node
// r108-dialog-a11y-census.mjs — the neo-crm session-199 doctrine transfer:
// the dialog-open a11y coverage census. A Radix Dialog's content is ABSENT
// from the DOM while closed — every dialog-open state deserves open-surface
// a11y teeth (the s199 F-172c criterion). The eon-hr form: a lightweight
// accessible-name census per open dialog (no new dependency — Playwright/
// agent-browser DOM reads, the eon-hr computed-truth doctrine):
//   for every dialog in the app's runtime inventory:
//     open it → census every input/select/textarea/button for an
//     accessible name (label[for] | aria-label | aria-labelledby |
//     placeholder | title | text content) → close it.
//   DEFECT = a form control with NO accessible name in ANY open dialog.
// Usage: node scripts/r108-dialog-a11y-census.mjs
import { execSync } from "node:child_process";

function run(cmd, t = 90000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 300); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const base = "http://127.0.0.1:3200";
const session = "loc108census";

// login once (the nav-pair pattern)
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

// the dialog inventory is RUNTIME-derived: Radix DialogTriggers carry
// aria-haspopup="dialog" (the R25-pinned contract) — enumerate them per
// page, click each, census the open dialog, close, repeat
const routes = ["/dashboard", "/announcements", "/documenttracker", "/surveys", "/staffrequests", "/settings", "/templates", "/allleaverequests", "/payrollreports", "/shiftcalendar", "/chat", "/communications", "/loans", "/assetmanagement", "/expenses", "/payroll", "/hrletters", "/profile", "/advancedanalytics", "/workflowautomation", "/leavemanagement", "/taskmanager", "/training", "/hrassistantchat", "/performancemanagement", "/assets", "/payrollmodule", "/shiftswap", "/attendance", "/evaluations", "/recruitmentkanban", "/offboarding"];

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
  /* aria-hidden/tabindex=-1 mirrors (Radix BubbleSelect) are not in the a11y tree */ const ctrls = [...dlg.querySelectorAll('input, select, textarea, [role=combobox]')].filter(el => el.type !== 'hidden' && el.getAttribute('aria-hidden') !== 'true' && el.getAttribute('tabindex') !== '-1');
  const unnamed = ctrls.map(el => ({ tag: el.tagName.toLowerCase(), type: el.type || '', name: el.name || el.id || '', via: nameOf(el) })).filter(x => !x.via);
  const btns = [...dlg.querySelectorAll('button')].filter(b => getComputedStyle(b).display !== 'none');
  const unnamedBtns = btns.filter(b => !nameOf(b) && !(b.textContent || '').trim()).map(b => ({ tag: 'button', cls: (b.getAttribute('class') || '').slice(0, 40) }));
  const title = (dlg.querySelector('h2, [role=heading]')?.textContent || '').trim().slice(0, 40);
  return { open: true, title, controls: ctrls.length, unnamed, unnamedBtns };
})()`;

let defects = 0;
let dialogStates = 0;
for (const route of routes) {
  run(`agent-browser --session ${session} open ${base}${route}`);
  await new Promise(r => setTimeout(r, 2500));
  const triggers = await evalOn(session, `(() => [...document.querySelectorAll('button[aria-haspopup="dialog"], [role=button][aria-haspopup="dialog"]')].map(b => (b.textContent || b.getAttribute('aria-label') || '').trim().slice(0, 36)))()`);
  if (!Array.isArray(triggers) || triggers.length === 0) { console.log(`${route}: no dialog triggers`); continue; }
  for (let i = 0; i < triggers.length; i++) {
    const label = triggers[i];
    // index-based click (label matching through the shell quoting is fragile)
    const clickExpr = "(() => { const btns=[...document.querySelectorAll(\"button[aria-haspopup='dialog'], [role=button][aria-haspopup='dialog']\")]; const b=btns[" + i + "]; if(b){b.click(); return 'CLICKED';} return 'NOTRIGGER'; })()";
    const clicked = run(`agent-browser --session ${session} eval ${JSON.stringify(clickExpr)}`).trim();
    if (!clicked.includes("CLICKED")) { console.log(`${route} [${label}]: trigger vanished (${clicked.slice(0, 60)})`); continue; }
    await new Promise(r => setTimeout(r, 1100));
    const census = await evalOn(session, ACC_NAME, 300);
    if (!census.open) { console.log(`${route} [${label}]: DIALOG DID NOT OPEN`); defects++; continue; }
    dialogStates++;
    if (census.unnamed?.length || census.unnamedBtns?.length) {
      defects++;
      console.log(`${route} [${label}] "${census.title}": ${census.controls} controls — UNNAMED: ` + JSON.stringify([...(census.unnamed || []), ...(census.unnamedBtns || [])]).slice(0, 260));
    } else {
      console.log(`${route} [${label}] "${census.title}": ${census.controls} controls — all named`);
    }
    run(`agent-browser --session ${session} press Escape`);
    await new Promise(r => setTimeout(r, 500));
  }
}
console.log(`\nCENSUS COMPLETE: ${dialogStates} dialog-open states censused · ${defects} with unnamed controls`);
run(`agent-browser --session ${session} close 2>/dev/null; true`);
process.exit(0);
