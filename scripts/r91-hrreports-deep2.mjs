#!/usr/bin/env node
// r91-hrreports-deep2.mjs — complete the entity contract: Expense Claims +
// Leave Requests group-bys + table headers + the run-report flow on Employees
// (with a group selected — what the chart + stats render).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 300); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const side = process.argv[2] || "ref";
const base = side === "ref" ? "https://eon.base44.app" : "http://127.0.0.1:3200";
const session = side === "ref" ? "ref" : "loc";
run(`agent-browser --session ${session} set viewport 1440 900`);
run(`agent-browser --session ${session} open ${base}/hrreports`);
await sleep(6000);

async function selectEntity(name) {
  await evalOn(session, `(() => {
    const ts = [...document.querySelectorAll('button[role=combobox], button[aria-haspopup=listbox]')].filter(t => t.offsetParent !== null);
    if (ts[0]) ts[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  })()`);
  await sleep(900);
  const picked = await evalOn(session, `(() => {
    const lbs = [...document.querySelectorAll('[role=listbox]')];
    if (!lbs.length) return false;
    const opt = [...lbs[lbs.length-1].querySelectorAll('[role=option]')].find(o => /${name}/i.test(o.textContent));
    if (opt) opt.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return !!opt;
  })()`);
  await sleep(1600);
  return picked;
}

async function snapshotPage(label) {
  const out = {};
  const triggers = await evalOn(session, `(() => {
    const ts = [...document.querySelectorAll('button[role=combobox], button[aria-haspopup=listbox]')].filter(t => t.offsetParent !== null);
    return ts.map((t, i) => ({ i, text: t.textContent.trim().slice(0, 40) }));
  })()`);
  for (const t of triggers || []) {
    await evalOn(session, `(() => {
      const ts = [...document.querySelectorAll('button[role=combobox], button[aria-haspopup=listbox]')].filter(t => t.offsetParent !== null);
      if (ts[${t.i}]) ts[${t.i}].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return true;
    })()`);
    await sleep(850);
    const opts = await evalOn(session, `(() => {
      const lbs = [...document.querySelectorAll('[role=listbox]')];
      if (!lbs.length) return null;
      return [...lbs[lbs.length-1].querySelectorAll('[role=option]')].map(o => o.textContent.trim());
    })()`);
    out[t.text] = opts;
    await evalOn(session, `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); true`);
    await sleep(400);
  }
  const table = await evalOn(session, `(() => ({
    ths: [...document.querySelectorAll('table th')].map(t => t.textContent.trim()),
    rows: document.querySelectorAll('table tbody tr').length
  }))()`);
  console.log(`--- ${label}: selects=${JSON.stringify(out)} table=${JSON.stringify(table)}`);
}

await selectEntity("Expense Claims");
await snapshotPage("expense-claims");
await selectEntity("Leave Requests");
await snapshotPage("leave-requests");
await selectEntity("Employees");
await snapshotPage("employees-back");

// now pick a group-by on employees and read what the page renders (chart etc.)
await evalOn(session, `(() => {
  const ts = [...document.querySelectorAll('button[role=combobox], button[aria-haspopup=listbox]')].filter(t => t.offsetParent !== null);
  if (ts[1]) ts[1].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  return true;
})()`);
await sleep(900);
await evalOn(session, `(() => {
  const lbs = [...document.querySelectorAll('[role=listbox]')];
  if (!lbs.length) return false;
  const opt = [...lbs[lbs.length-1].querySelectorAll('[role=option]')].find(o => /department id/i.test(o.textContent));
  if (opt) opt.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  return !!opt;
})()`);
await sleep(2500);
const runState = await evalOn(session, `(() => ({
  ths: [...document.querySelectorAll('table th')].map(t => t.textContent.trim()),
  rows: document.querySelectorAll('table tbody tr').length,
  chartSvg: document.querySelectorAll('svg.recharts-surface, [class*=recharts]').length,
  statTexts: [...document.querySelectorAll('.text-2xl, [class*=text-3xl]')].map(e => e.textContent.trim().slice(0, 24)).slice(0, 8),
  bodySnippet: document.body.textContent.replace(/\\s+/g, ' ').slice(0, 400)
}))()`);
console.log("after group-by=department id:", JSON.stringify(runState, null, 1).slice(0, 1200));
process.exit(0);
