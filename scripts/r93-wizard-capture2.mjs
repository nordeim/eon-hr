#!/usr/bin/env node
// r93-wizard-capture2.mjs — the REF employee wizard steps 2-4 (fixed fills by
// placeholder, not name). No creation — Cancel at the end.
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
      ctrl = { tag: el.tagName, ph: el.getAttribute('placeholder') || '', x: Math.round(r2.x), y: Math.round(r2.y), w: Math.round(r2.width), h: Math.round(r2.height) };
    }
    return { text, x: Math.round(rect.x), y: Math.round(rect.y), ctrl };
  }).filter(l => l.text);
  const buttons = [...root.querySelectorAll('button')].map(b => (b.textContent || '').replace(/\\s+/g,' ').trim()).filter(Boolean);
  return { labels, buttons };
})()`;
const setPh = (ph, val) => `(() => { const el = [...document.querySelectorAll('input,textarea')].find(i => i.placeholder === ${JSON.stringify(ph)}); if (!el) return 'missing ' + ${JSON.stringify(ph)}; const proto = Object.getPrototypeOf(el); Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, ${JSON.stringify(val)}); el.dispatchEvent(new Event('input', { bubbles: true })); return 'ok'; })()`;
const clickText = (re) => `(() => { const b = [...document.querySelectorAll('button')].find(x => ${re}.test((x.textContent||'').trim()) && (x.textContent||'').trim().length < 20); if (b) { b.click(); return 'clicked:' + b.textContent.trim(); } return 'NOT FOUND'; })()`;

run(`agent-browser --session ref open https://eon.base44.app/employees`);
await new Promise((r) => setTimeout(r, 3500));
console.log("open wizard:", await evalOn(clickText(`/^Add Employee$/`)));
await new Promise((r) => setTimeout(r, 1800));

// fill required step-1 fields by placeholder, then Next
console.log("fill name:", await evalOn(setPh("John Doe", "Probe User")));
console.log("fill email:", await evalOn(setPh("john@company.com", "probe-r93@example.com")));
await new Promise((r) => setTimeout(r, 400));
console.log("next:", await evalOn(clickText(`/^Next$|^Continue$|Next ›|Continue →/`)));
await new Promise((r) => setTimeout(r, 1800));
let s2 = await evalOn(FIELDS);
fs.writeFileSync("/tmp/r93/ref-wizard-step2.json", JSON.stringify(s2, null, 1));
console.log("STEP 2 labels:", s2.labels.map((l) => l.text + "@" + l.x + "," + l.y).join(" | "));

// step 2: fill Job Title by placeholder, pick Employment Type, Next
const s2ph = s2.labels.map((l) => (l.ctrl && l.ctrl.ph) || null).filter(Boolean);
console.log("step2 placeholders:", s2ph);
for (const cand of ["e.g. Software Engineer", "e.g. Senior Developer"]) {
  const r = await evalOn(setPh(cand, "Probe Title"));
  if (!String(r).startsWith("missing")) { console.log("filled job title via", cand); break; }
}
// open first combobox (Employment Type) and read options
console.log("open combo:", await evalOn(`(() => { const b = [...document.querySelectorAll('button[role=combobox]')][0]; if (b) { b.click(); return 'opened'; } return 'none'; })()`));
await new Promise((r) => setTimeout(r, 900));
const opts = await evalOn(`(() => [...document.querySelectorAll('[role=option]')].map(o => o.textContent.trim()))()`);
console.log("step2 combo options:", JSON.stringify(opts));
await evalOn(`(() => { const o = [...document.querySelectorAll('[role=option]')][0]; if (o) o.click(); return 'picked'; })()`);
await new Promise((r) => setTimeout(r, 600));
console.log("next2:", await evalOn(clickText(`/^Next$|^Continue$/`)));
await new Promise((r) => setTimeout(r, 1800));
let s3 = await evalOn(FIELDS);
fs.writeFileSync("/tmp/r93/ref-wizard-step3.json", JSON.stringify(s3, null, 1));
console.log("STEP 3 labels:", s3.labels.map((l) => l.text + "@" + l.x + "," + l.y).join(" | "));

// step 3: read Contract Type options
console.log("open ct:", await evalOn(`(() => { const b = [...document.querySelectorAll('button[role=combobox]')].find(x => /Contract/i.test(x.textContent||'')); if (b) { b.click(); return 'opened'; } return 'none'; })()`));
await new Promise((r) => setTimeout(r, 900));
const ct = await evalOn(`(() => [...document.querySelectorAll('[role=option]')].map(o => o.textContent.trim()))()`);
console.log("contract type options:", JSON.stringify(ct));
await evalOn(`(() => { const o = [...document.querySelectorAll('[role=option]')][0]; if (o) o.click(); return 'picked'; })()`);
await new Promise((r) => setTimeout(r, 400));
console.log("next3:", await evalOn(clickText(`/^Next$|^Continue$/`)));
await new Promise((r) => setTimeout(r, 1800));
let s4 = await evalOn(FIELDS);
fs.writeFileSync("/tmp/r93/ref-wizard-step4.json", JSON.stringify(s4, null, 1));
console.log("STEP 4 labels:", s4.labels.map((l) => l.text + "@" + l.x + "," + l.y).join(" | "));
console.log("STEP 4 buttons:", s4.buttons.join(" | "));

// onboarding template options on step 4
console.log("tpl options:", await evalOn(`(() => { const b = [...document.querySelectorAll('button[role=combobox]')][0]; if (b) { b.click(); return 'opened'; } return 'none'; })()`));
await new Promise((r) => setTimeout(r, 900));
console.log(JSON.stringify(await evalOn(`(() => [...document.querySelectorAll('[role=option]')].map(o => o.textContent.trim()))()`)));

// cancel — NO creation on the REF
console.log("cancel:", await evalOn(clickText(`/^Cancel$/`)));
await new Promise((r) => setTimeout(r, 1200));
console.log("final url:", run(`agent-browser --session ref get url`).trim());
