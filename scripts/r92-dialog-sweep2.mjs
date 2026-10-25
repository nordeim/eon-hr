#!/usr/bin/env node
// r92-dialog-sweep2.mjs — second pass with the REF's actual button labels
// + longer settles (the first pass raced some dialogs).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 300); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const side = process.argv[2] || "ref";
const base = side === "ref" ? "https://eon.base44.app" : "http://127.0.0.1:3200";
const session = side === "ref" ? "ref" : "loc";
// route → the button label + optional nth occurrence
const PLAN = {
  leavemanagement: ["New Leave Request"],
  expenses: ["New Expense"],
  taskmanager: ["New Task", "New Project"],
  performancemanagement: ["Set New Goal"],
  evaluations: ["New Review"],
  templates: ["Create Template"],
  shiftcalendar: ["assign"],
};
run(`agent-browser --session ${session} set viewport 1440 900`);
const out = {};
for (const [route, labels] of Object.entries(PLAN)) {
  run(`agent-browser --session ${session} open ${base}/${route}`);
  await sleep(6000);
  for (const label of labels) {
    await evalOn(session, `(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === '${label}' && b.offsetParent !== null);
      if (btn) btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return !!btn;
    })()`);
    await sleep(2200);
    const dlg = await evalOn(session, `(() => {
      const r = (el) => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
      const dr = [...document.querySelectorAll('[role=dialog]')].pop();
      if (!dr) return null;
      return { rect: r(dr), title: (dr.querySelector('h2') || {}).textContent || null,
        labels: [...dr.querySelectorAll('label')].map(l => l.textContent.trim().slice(0, 44)),
        selects: [...dr.querySelectorAll('button[role=combobox], button[aria-haspopup=listbox]')].map(s => s.textContent.trim().slice(0, 40)) };
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
        await sleep(1100);
        const opts = await evalOn(session, `(() => {
          const lbs = [...document.querySelectorAll('[role=listbox]')];
          if (!lbs.length) return null;
          return [...lbs[lbs.length - 1].querySelectorAll('[role=option]')].map(o => o.textContent.trim());
        })()`);
        inventories.push({ trigger: dlg.selects[i], options: opts });
        await evalOn(session, `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); true`);
        await sleep(400);
      }
    }
    out[route + ":" + label] = { dialog: dlg, inventories };
    console.error(`${side} ${route} [${label}]: ${dlg ? dlg.title : "NO-DIALOG"} selects=${inventories.length}`);
    await evalOn(session, `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); true`);
    await sleep(400);
  }
}
console.log(JSON.stringify(out, null, 1));
process.exit(0);
