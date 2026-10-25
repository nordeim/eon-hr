#!/usr/bin/env node
// r91-inventory-sweep.mjs — the SYSTEMATIC option-inventory sweep: for each
// route, read every combobox trigger's option set (desktop popper form) on
// ONE side, dump as JSON. Run with side=ref and side=loc, then diff.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 300); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const ROUTES = process.argv[3] ? process.argv[3].split(",") : [
  "/leavemanagement", "/allleaverequests", "/attendance", "/documenttracker",
  "/payroll", "/payrollmodule", "/compliancedashboard", "/hrreports",
  "/recruitment", "/training", "/announcements", "/hrletters",
];

const side = process.argv[2] || "ref";
const base = side === "ref" ? "https://eon.base44.app" : "http://127.0.0.1:3200";
const session = side === "ref" ? "ref" : "loc";
run(`agent-browser --session ${session} set viewport 1440 900`);
const out = {};
for (const route of ROUTES) {
  run(`agent-browser --session ${session} open ${base}${route}`);
  await sleep(5500);
  const triggers = await evalOn(session, `(() => {
    const r = (el) => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width) }; };
    const ts = [...document.querySelectorAll('button[role=combobox], button[aria-haspopup=listbox]')].filter(t => t.offsetParent !== null);
    return ts.map((t, i) => ({ i, text: t.textContent.trim().slice(0, 40), rect: r(t), aria: t.getAttribute('aria-label') }));
  })()`);
  const pageInventories = [];
  for (const t of triggers || []) {
    await evalOn(session, `(() => {
      const ts = [...document.querySelectorAll('button[role=combobox], button[aria-haspopup=listbox]')].filter(t => t.offsetParent !== null);
      if (ts[${t.i}]) ts[${t.i}].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return true;
    })()`);
    await sleep(900);
    const opts = await evalOn(session, `(() => {
      const lbs = [...document.querySelectorAll('[role=listbox]')];
      if (!lbs.length) return null;
      return [...lbs[lbs.length-1].querySelectorAll('[role=option]')].map(o => o.textContent.trim());
    })()`);
    pageInventories.push({ trigger: t.text, aria: t.aria, rect: t.rect, options: opts });
    await evalOn(session, `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); true`);
    await sleep(400);
  }
  out[route] = pageInventories;
  console.error(`${side} ${route}: ${pageInventories.length} selects`);
}
console.log(JSON.stringify(out, null, 1));
process.exit(0);
