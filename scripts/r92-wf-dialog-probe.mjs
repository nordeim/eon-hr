#!/usr/bin/env node
// r92-wf-dialog-probe.mjs — open the REF's Create Workflow dialog and read
// every select interior (module, trigger, any condition/action selects) —
// the unopened dialog-interior frontier.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 300); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const side = process.argv[2] || "ref";
const base = side === "ref" ? "https://eon.base44.app" : "http://127.0.0.1:3200";
const session = side === "ref" ? "ref" : "loc";
run(`agent-browser --session ${session} set viewport 1440 900`);
run(`agent-browser --session ${session} open ${base}/workflowautomation`);
await sleep(6000);

// open the Create Workflow dialog (a real button click)
await evalOn(session, `(() => {
  const btn = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Create Workflow' && b.offsetParent !== null);
  if (btn) btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  return !!btn;
})()`);
await sleep(1500);

// read the dialog structure
const dlg = await evalOn(session, `(() => {
  const vis = (el) => el.offsetParent !== null;
  const r = (el) => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
  const dr = [...document.querySelectorAll('[role=dialog]')].pop();
  if (!dr) return { dialog: false };
  return {
    dialog: true, rect: r(dr),
    title: (dr.querySelector('[role=dialog] h2, h2') || {}).textContent || null,
    labels: [...dr.querySelectorAll('label')].map(l => l.textContent.trim().slice(0, 50)),
    inputs: [...dr.querySelectorAll('input')].map(i => ({ ph: (i.placeholder || '').slice(0, 50), type: i.type })),
    textareas: [...dr.querySelectorAll('textarea')].map(t => (t.placeholder || '').slice(0, 60)),
    selects: [...dr.querySelectorAll('button[role=combobox], button[aria-haspopup=listbox]')].map(s => ({ t: s.textContent.trim().slice(0, 44), rect: r(s) })),
    buttons: [...dr.querySelectorAll('button')].filter(vis).map(b => b.textContent.trim().slice(0, 30)).filter(Boolean)
  };
})()`);
console.log("DIALOG STRUCTURE:", JSON.stringify(dlg, null, 1));

// open each select inside the dialog and read options
const nSel = (dlg.selects || []).length;
const inventories = [];
for (let i = 0; i < nSel; i++) {
  await evalOn(session, `(() => {
    const dr = [...document.querySelectorAll('[role=dialog]')].pop();
    if (!dr) return false;
    const ts = [...dr.querySelectorAll('button[role=combobox], button[aria-haspopup=listbox]')];
    if (ts[${i}]) ts[${i}].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  })()`);
  await sleep(1000);
  const opts = await evalOn(session, `(() => {
    const lbs = [...document.querySelectorAll('[role=listbox]')];
    if (!lbs.length) return null;
    return [...lbs[lbs.length - 1].querySelectorAll('[role=option]')].map(o => o.textContent.trim());
  })()`);
  inventories.push({ trigger: dlg.selects[i].t, options: opts });
  await evalOn(session, `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); true`);
  await sleep(400);
}
console.log("DIALOG SELECT INVENTORIES:", JSON.stringify(inventories, null, 1));
process.exit(0);
