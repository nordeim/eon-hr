#!/usr/bin/env node
// r93-wizard-capture.mjs — the REF employee wizard full read (the R93-A member).
// The REF's Add Employee opens a FULL-PAGE 4-step wizard (Personal Info →
// Job Info → Contract Info → Documents & Attachments). This capture walks all
// four steps WITHOUT creating anything (Cancel at the end — no REF mutation).
// Usage: node scripts/r93-wizard-capture.mjs
import { execSync } from "node:child_process";
import fs from "node:fs";

function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
async function evalOn(expr, ms = 0) { if (ms) await new Promise((r) => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ref eval ${JSON.stringify(oneLine)}`); const t2 = out.trim(); try { return JSON.parse(t2); } catch {} try { return JSON.parse(t2.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 400) }; } }

const FIELDS = `(() => {
  const root = document.querySelector('main') || document.body;
  const labels = [...root.querySelectorAll('label')].map(l => {
    const text = (l.textContent || '').replace(/\\s+/g, ' ').trim();
    const rect = l.getBoundingClientRect();
    let ctrl = null;
    const forId = l.getAttribute('for');
    let el = forId ? root.querySelector('#' + CSS.escape(forId)) : (l.control || l.querySelector('input,select,textarea,button'));
    if (el) {
      const r2 = el.getBoundingClientRect();
      ctrl = { tag: el.tagName, type: el.getAttribute('type') || '', ph: el.getAttribute('placeholder') || '',
               x: Math.round(r2.x), y: Math.round(r2.y), w: Math.round(r2.width), h: Math.round(r2.height) };
    }
    return { text, x: Math.round(rect.x), y: Math.round(rect.y) };
  }).filter(l => l.text);
  const inputs = [...root.querySelectorAll('input,select,textarea')].map(i => ({
    tag: i.tagName, name: i.getAttribute('name') || '', ph: i.getAttribute('placeholder') || '',
    type: i.getAttribute('type') || '', required: i.required }));
  const buttons = [...root.querySelectorAll('button')].map(b => (b.textContent || '').replace(/\\s+/g,' ').trim()).filter(Boolean);
  const stepper = [...root.querySelectorAll('[class*=step], ol li')].map(s => (s.textContent || '').replace(/\\s+/g,' ').trim()).filter(t => t && t.length < 40).slice(0, 10);
  return { labels, inputs, buttons, stepper };
})()`;

// open employees and click Add Employee
run(`agent-browser --session ref open https://eon.base44.app/employees`);
await new Promise((r) => setTimeout(r, 3500));
const btn = await evalOn(`(() => { const b = [...document.querySelectorAll('button')].find(x => /Add Employee/i.test(x.textContent||'')); return b ? b.textContent.trim() : 'NOT FOUND'; })()`);
console.log("Add Employee button:", JSON.stringify(btn));
await evalOn(`(() => { const b = [...document.querySelectorAll('button')].find(x => /Add Employee/i.test(x.textContent||'')); if (b) b.click(); return 'clicked'; })()`);
await new Promise((r) => setTimeout(r, 2000));

const step1 = await evalOn(FIELDS);
fs.writeFileSync("/tmp/r93/ref-wizard-step1.json", JSON.stringify(step1, null, 1));
console.log("STEP 1 (Personal Info):", JSON.stringify(step1, null, 1).slice(0, 1800));

// step 1: fill required fields to advance
await evalOn(`(() => {
  const set = (sel, val) => { const el = document.querySelector(sel); if (!el) return 'missing ' + sel; const proto = Object.getPrototypeOf(el); Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, val); el.dispatchEvent(new Event('input', { bubbles: true })); return 'ok'; };
  return [set('input[name=firstName]', 'Probe'), set('input[name=lastName]', 'User'), set('input[type=email]', 'probe-user-r93@example.com')];
})()`);
await new Promise((r) => setTimeout(r, 500));
console.log("advance:", await evalOn(`(() => { const b = [...document.querySelectorAll('button')].find(x => /^(Next|Continue)/i.test((x.textContent||'').trim())); if (b) { b.click(); return 'clicked ' + b.textContent.trim(); } return 'no next'; })()`));
await new Promise((r) => setTimeout(r, 1500));

const step2 = await evalOn(FIELDS);
fs.writeFileSync("/tmp/r93/ref-wizard-step2.json", JSON.stringify(step2, null, 1));
console.log("STEP 2 (Job Info):", JSON.stringify(step2, null, 1).slice(0, 1800));

// read the Employment Type options (open the first combobox-like trigger)
console.log("empType options:", JSON.stringify(await evalOn(`(() => { const t = [...document.querySelectorAll('button[role=combobox], [data-radix-collection-item]')].map(x => x.textContent.trim()).filter(Boolean); return t; })()`)));

// fill step 2 and advance
await evalOn(`(() => {
  const set = (name, val) => { const el = document.querySelector('input[name=' + name + '], [name=' + name + ']'); if (!el) return 'missing ' + name; const proto = Object.getPrototypeOf(el); Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, val); el.dispatchEvent(new Event('input', { bubbles: true })); return 'ok'; };
  return [set('jobTitle', 'Probe Title'), set('department', '')];
})()`);
// select Employment Type via the native click on the trigger then option
await evalOn(`(() => { const b = [...document.querySelectorAll('button[role=combobox]')][0]; if (b) b.click(); return b ? 'opened' : 'no combobox'; })()`);
await new Promise((r) => setTimeout(r, 800));
const opts = await evalOn(`(() => [...document.querySelectorAll('[role=option]')].map(o => o.textContent.trim()))()`);
console.log("combo options:", JSON.stringify(opts));
await evalOn(`(() => { const o = [...document.querySelectorAll('[role=option]')][0]; if (o) o.click(); return 'picked'; })()`);
await new Promise((r) => setTimeout(r, 500));
console.log("advance2:", await evalOn(`(() => { const b = [...document.querySelectorAll('button')].find(x => /^(Next|Continue)/i.test((x.textContent||'').trim())); if (b) { b.click(); return 'clicked'; } return 'no next'; })()`));
await new Promise((r) => setTimeout(r, 1500));

const step3 = await evalOn(FIELDS);
fs.writeFileSync("/tmp/r93/ref-wizard-step3.json", JSON.stringify(step3, null, 1));
console.log("STEP 3 (Contract Info):", JSON.stringify(step3, null, 1).slice(0, 2000));

// contract type options
await evalOn(`(() => { const b = [...document.querySelectorAll('button[role=combobox]')].find(x => /Contract/i.test(x.textContent||'')); if (b) b.click(); return b ? 'opened' : 'no ct combo'; })()`);
await new Promise((r) => setTimeout(r, 800));
const ctOpts = await evalOn(`(() => [...document.querySelectorAll('[role=option]')].map(o => o.textContent.trim()))()`);
console.log("contract type options:", JSON.stringify(ctOpts));
await evalOn(`(() => { const o = [...document.querySelectorAll('[role=option]')][0]; if (o) o.click(); return 'picked'; })()`);
await new Promise((r) => setTimeout(r, 400));
console.log("advance3:", await evalOn(`(() => { const b = [...document.querySelectorAll('button')].find(x => /^(Next|Continue)/i.test((x.textContent||'').trim())); if (b) { b.click(); return 'clicked'; } return 'no next'; })()`));
await new Promise((r) => setTimeout(r, 1500));

const step4 = await evalOn(FIELDS);
fs.writeFileSync("/tmp/r93/ref-wizard-step4.json", JSON.stringify(step4, null, 1));
console.log("STEP 4 (Documents):", JSON.stringify(step4, null, 1).slice(0, 1500));

// cancel — NO creation on the REF
await evalOn(`(() => { const b = [...document.querySelectorAll('button')].find(x => /^Cancel/i.test((x.textContent||'').trim())); if (b) b.click(); return 'cancelled'; })()`);
await new Promise((r) => setTimeout(r, 1200));
console.log("final url:", run(`agent-browser --session ref get url`).trim());
