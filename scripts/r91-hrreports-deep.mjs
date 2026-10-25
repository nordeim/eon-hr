#!/usr/bin/env node
// r91-hrreports-deep.mjs — the REF's hrreports multi-entity contract: select
// each report entity, re-read the group-by + status options, run the report,
// read the table headers + the chart. Documents the full functional surface.
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

async function readSelects(label) {
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
    await sleep(900);
    const opts = await evalOn(session, `(() => {
      const lbs = [...document.querySelectorAll('[role=listbox]')];
      if (!lbs.length) return null;
      return [...lbs[lbs.length-1].querySelectorAll('[role=option]')].map(o => o.textContent.trim());
    })()`);
    out[t.text] = opts;
    await evalOn(session, `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); true`);
    await sleep(400);
  }
  console.log(`--- ${label}: ${JSON.stringify(out)}`);
  return out;
}

// baseline
await readSelects("employees (default)");

// select "Staff Requests" in the FIRST select (entity), then re-read all
await evalOn(session, `(() => {
  const ts = [...document.querySelectorAll('button[role=combobox], button[aria-haspopup=listbox]')].filter(t => t.offsetParent !== null);
  if (ts[0]) ts[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  return true;
})()`);
await sleep(900);
await evalOn(session, `(() => {
  const lbs = [...document.querySelectorAll('[role=listbox]')];
  if (!lbs.length) return false;
  const opt = [...lbs[lbs.length-1].querySelectorAll('[role=option]')].find(o => /staff requests/i.test(o.textContent));
  if (opt) opt.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  return !!opt;
})()`);
await sleep(1500);
await readSelects("staff-requests entity");

// read the table headers + rows after the entity switch
const table = await evalOn(session, `(() => {
  const ths = [...document.querySelectorAll('table th')].map(t => t.textContent.trim());
  const rows = document.querySelectorAll('table tbody tr').length;
  const stats = [...document.querySelectorAll('[class*=stat], .grid .text-2xl')].slice(0, 6).map(e => e.textContent.trim().slice(0, 30));
  return { ths, rows, stats };
})()`);
console.log("staff-requests table:", JSON.stringify(table));

// also read the page's network: what API the page hits (performance entries)
const api = await evalOn(session, `(() => {
  return JSON.stringify(performance.getEntriesByType('resource').filter(e => /api|report/i.test(e.name)).map(e => e.name.split('?')[0]).filter((v, i, a) => a.indexOf(v) === i).slice(0, 10));
})()`);
console.log("api endpoints touched:", api);
process.exit(0);
