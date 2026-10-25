#!/usr/bin/env node
// r92-dialog-sweep.mjs — the DIALOG-INTERIOR inventory sweep: for each route,
// open the primary New/Add dialog, read every select's option set + the
// dialog's labels/geometry. Run side=ref and side=loc, then diff.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 300); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const side = process.argv[2] || "ref";
const base = side === "ref" ? "https://eon.base44.app" : "http://127.0.0.1:3200";
const session = side === "ref" ? "ref" : "loc";
const routes = (process.argv[3] || "leavemanagement,allleaverequests,documenttracker,payroll,training,announcements,hrletters,expenses,shiftcalendar,taskmanager,performancemanagement,evaluations,assets,offboarding,templates").split(",");

run(`agent-browser --session ${session} set viewport 1440 900`);
const out = {};
for (const route of routes) {
  run(`agent-browser --session ${session} open ${base}/${route}`);
  await sleep(5500);
  // find + click the first dialog-opening button (New/Add/Create/Assign/Upload/Schedule/Request)
  const opened = await evalOn(session, `(() => {
    const labels = ['New Leave Request','Add Document','Add Payroll','New Training Platform','New Announcement','New Letter Request','New Expense','Assign Shift','Create Task','New Goal','Create Review','Add Asset','New Offboarding','Create Template','New Request'];
    for (const L of labels) {
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent.trim().startsWith(L) && b.offsetParent !== null);
      if (btn) { btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); return L; }
    }
    return null;
  })()`);
  await sleep(1300);
  const dlg = await evalOn(session, `(() => {
    const r = (el) => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
    const dr = [...document.querySelectorAll('[role=dialog]')].pop();
    if (!dr) return null;
    return {
      rect: r(dr),
      title: (dr.querySelector('h2') || {}).textContent || null,
      labels: [...dr.querySelectorAll('label')].map(l => l.textContent.trim().slice(0, 44)),
      selects: [...dr.querySelectorAll('button[role=combobox], button[aria-haspopup=listbox]')].map(s => s.textContent.trim().slice(0, 40))
    };
  })()`);
  const inventories = [];
  if (dlg && dlg.selects.length) {
    for (let i = 0; i < dlg.selects.length; i++) {
      await evalOn(session, `(() => {
        const dr = [...document.querySelectorAll('[role=dialog]')].pop();
        if (!dr) return false;
        const ts = [...dr.querySelectorAll('button[role=combobox], button[aria-haspopup=listbox]')];
        if (ts[${i}]) ts[${i}].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        return true;
      })()`);
      await sleep(950);
      const opts = await evalOn(session, `(() => {
        const lbs = [...document.querySelectorAll('[role=listbox]')];
        if (!lbs.length) return null;
        return [...lbs[lbs.length - 1].querySelectorAll('[role=option]')].map(o => o.textContent.trim());
      })()`);
      inventories.push({ trigger: dlg.selects[i], options: opts });
      await evalOn(session, `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); true`);
      await sleep(350);
    }
  }
  out[route] = { openedWith: opened, dialog: dlg, inventories };
  console.error(`${side} ${route}: opened=${opened} selects=${inventories.length}`);
  await evalOn(session, `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); true`);
  await sleep(300);
}
console.log(JSON.stringify(out, null, 1));
process.exit(0);
