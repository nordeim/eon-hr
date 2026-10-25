#!/usr/bin/env node
// r91-newreq-dialog-probe.mjs — read the REF's staffrequests New Request
// dialog: the field labels + the category select's options + any priority.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 300); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const side = process.argv[2] || "ref";
const base = side === "ref" ? "https://eon.base44.app" : "http://127.0.0.1:3200";
const session = side === "ref" ? "ref" : "loc";
run(`agent-browser --session ${session} set viewport 1440 900`);
run(`agent-browser --session ${session} open ${base}/staffrequests`);
await sleep(6000);
const open = await evalOn(session, `(() => {
  const b = [...document.querySelectorAll('button')].find(x => /new request|submit request|create request/i.test(x.textContent));
  if (!b) return { found: false, all: [...document.querySelectorAll('button')].map(x => x.textContent.trim()).filter(Boolean).slice(0, 12) };
  b.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  return { found: true, text: b.textContent.trim() };
})()`);
console.log("new-request trigger:", JSON.stringify(open));
await sleep(2200);
const dlg = await evalOn(session, `(() => {
  const r = (el) => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
  const d = [...document.querySelectorAll('[role=dialog]')].filter(x => x.getBoundingClientRect().width > 0)[0];
  if (!d) return { none: true };
  return { rect: r(d), heading: d.querySelector('h1,h2,h3')?.textContent?.trim() ?? null,
    labels: [...d.querySelectorAll('label')].map(l => l.textContent.trim()),
    triggers: [...d.querySelectorAll('button[role=combobox]')].map(t => ({ text: t.textContent.trim().slice(0,30), rect: r(t) })),
    buttons: [...d.querySelectorAll('button')].map(b => b.textContent.trim()).filter(Boolean).slice(0, 8),
    textareas: d.querySelectorAll('textarea').length, inputs: d.querySelectorAll('input').length };
})()`);
console.log("dialog:", JSON.stringify(dlg, null, 1));
// open the category select inside the dialog
await evalOn(session, `(() => {
  const d = [...document.querySelectorAll('[role=dialog]')].filter(x => x.getBoundingClientRect().width > 0)[0];
  if (!d) return false;
  const t = d.querySelector('button[role=combobox]');
  if (t) t.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  return !!t;
})()`);
await sleep(1200);
const catOpts = await evalOn(session, `(() => {
  const lbs = [...document.querySelectorAll('[role=listbox]')];
  if (!lbs.length) return { none: true };
  return { opts: [...lbs[lbs.length-1].querySelectorAll('[role=option]')].map(o => o.textContent.trim()) };
})()`);
console.log("category options in dialog:", JSON.stringify(catOpts));
process.exit(0);
