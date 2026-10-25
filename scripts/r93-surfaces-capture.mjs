#!/usr/bin/env node
// r93-surfaces-capture.mjs — the remaining R93 REF surfaces:
//   B: /recruitment Post New Job (inline form) + Job Postings cards + stats
//   C: /workflowconfigpage New Workflow (inline editor)
//   D: /advancedanalytics Schedule Report dialog
//   E: /payrollreports Send Payslips via WhatsApp dialog
//   F: /hrassistantchat New Chat dialog
//   G: /recruitmentkanban Add Applicant dialog
// Usage: node scripts/r93-surfaces-capture.mjs
import { execSync } from "node:child_process";
import fs from "node:fs";

function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise((r) => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const t2 = out.trim(); try { return JSON.parse(t2); } catch {} try { return JSON.parse(t2.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 400) }; } }
async function go(session, url, ms = 3200) { run(`agent-browser --session ${session} open ${url}`); await new Promise((r) => setTimeout(r, ms)); }

const PAGE = `(() => {
  const root = document.querySelector('main') || document.body;
  const text = (el) => (el.textContent || '').replace(/\\s+/g, ' ').trim();
  const h = [...root.querySelectorAll('h1,h2,h3')].map(text).filter(Boolean).slice(0, 6);
  const buttons = [...root.querySelectorAll('button')].map(text).filter(Boolean).filter(t => t.length < 32);
  const labels = [...root.querySelectorAll('label')].map(l => { const r = l.getBoundingClientRect(); return { t: text(l), x: Math.round(r.x), y: Math.round(r.y) }; }).filter(l => l.t);
  const inputs = [...root.querySelectorAll('input,textarea')].map(i => ({ tag: i.tagName, type: i.getAttribute('type') || '', ph: i.getAttribute('placeholder') || '', req: i.required }));
  const selects = [...root.querySelectorAll('select')].map(s => ({ ph: s.className.includes('w-full') ? '' : '', opts: [...s.options].map(o => o.textContent.trim()) }));
  const combos = [...root.querySelectorAll('button[role=combobox]')].map(b => { const r = b.getBoundingClientRect(); return { t: text(b), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) }; });
  return { h, buttons, labels, inputs, selects, combos };
})()`;

// ---------- B: /recruitment ----------
await go("ref", "https://eon.base44.app/recruitment");
let rec = await evalOn("ref", PAGE);
fs.writeFileSync("/tmp/r93/ref-recruitment.json", JSON.stringify(rec, null, 1));
console.log("RECRUITMENT h:", rec.h.join(" | "));
console.log("RECRUITMENT buttons:", rec.buttons.join(" | "));
console.log("RECRUITMENT labels:", rec.labels.map((l) => l.t).join(" | "));
console.log("RECRUITMENT combos:", JSON.stringify(rec.combos));
console.log("RECRUITMENT inputs:", JSON.stringify(rec.inputs.map((i) => i.tag + ":" + (i.ph || i.type))));

// the stats trio + the Job Postings tab cards
const stats = await evalOn("ref", `(() => { const root = document.querySelector('main'); const cards = [...root.querySelectorAll('[class*=grid] > div')].map(d => text = (d.textContent||'').replace(/\\s+/g,' ').trim()).filter(t => t && t.length < 90).slice(0, 12); return cards; })()`);
console.log("RECRUITMENT stats/cards:", JSON.stringify(stats, null, 1));

// the tabs
const tabs = await evalOn("ref", `(() => [...document.querySelectorAll('[role=tab], button')].map(b => (b.getAttribute('role') === 'tab' ? 'TAB:' : '') + (b.textContent||'').replace(/\\s+/g,' ').trim()).filter(t => t.length > 2 && t.length < 40).slice(0, 14))()`);
console.log("RECRUITMENT tabs:", JSON.stringify(tabs));

// click Post New Job → inline form read
console.log("click postjob:", await evalOn("ref", `(() => { const b = [...document.querySelectorAll('button')].find(x => /Post New Job/i.test(x.textContent||'')); if (b) { b.click(); return 'clicked'; } return 'NOT FOUND'; })()`));
await new Promise((r) => setTimeout(r, 1500));
let postJob = await evalOn("ref", PAGE);
fs.writeFileSync("/tmp/r93/ref-postjob.json", JSON.stringify(postJob, null, 1));
console.log("POST NEW JOB h:", postJob.h.join(" | "));
console.log("POST NEW JOB labels:", postJob.labels.map((l) => l.t + "@" + l.x + "," + l.y).join(" | "));
console.log("POST NEW JOB inputs:", JSON.stringify(postJob.inputs.map((i) => i.tag + ":" + (i.ph || i.type) + (i.req ? "*" : ""))));
console.log("POST NEW JOB combos:", JSON.stringify(postJob.combos));
console.log("POST NEW JOB buttons:", postJob.buttons.join(" | "));

// Employment Type options in the post-job form
await evalOn("ref", `(() => { const b = [...document.querySelectorAll('button[role=combobox]')].find(x => /Employment|Full Time|Select/i.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 800));
console.log("POSTJOB combo opts:", JSON.stringify(await evalOn("ref", `(() => [...document.querySelectorAll('[role=option]')].map(o => o.textContent.trim()))()`)));

// Job Postings tab cards (navigate back + open the tab)
await go("ref", "https://eon.base44.app/recruitment");
const postings = await evalOn("ref", `(() => { const b = [...document.querySelectorAll('button,[role=tab]')].find(x => /Job Postings/i.test(x.textContent||'')); if (b) { b.click(); return 'clicked'; } return 'NOT FOUND'; })()`);
console.log("postings tab:", postings);
await new Promise((r) => setTimeout(r, 1500));
const cards = await evalOn("ref", `(() => { const root = document.querySelector('main'); const out = []; for (const c of root.querySelectorAll('div')) { const t = (c.textContent||'').replace(/\\s+/g,' ').trim(); if (/HR Manager|HR Director|System Admin|Draft|Active/i.test(t) && t.length < 220 && t.length > 20) { const r = c.getBoundingClientRect(); if (r.width > 200 && r.width < 700 && r.height > 60 && r.height < 400) out.push({ t: t.slice(0, 200), w: Math.round(r.width), h: Math.round(r.height) }); } } return [...new Map(out.map(o => [o.t, o])).values()].slice(0, 6); })()`);
console.log("JOB POSTINGS cards:", JSON.stringify(cards, null, 1));
// screenshot for the record
run(`agent-browser --session ref screenshot /tmp/r93/ref-jobpostings.png`);

// ---------- C: /workflowconfigpage ----------
await go("ref", "https://eon.base44.app/workflowconfigpage");
let wfp = await evalOn("ref", PAGE);
fs.writeFileSync("/tmp/r93/ref-wfp.json", JSON.stringify(wfp, null, 1));
console.log("\nWFP h:", wfp.h.join(" | "));
console.log("WFP buttons:", wfp.buttons.join(" | "));
console.log("WFP labels:", wfp.labels.map((l) => l.t).join(" | "));

console.log("click new workflow:", await evalOn("ref", `(() => { const b = [...document.querySelectorAll('button')].find(x => /New Workflow/i.test(x.textContent||'')); if (b) { b.click(); return 'clicked'; } return 'NOT FOUND'; })()`));
await new Promise((r) => setTimeout(r, 1800));
let wfEditor = await evalOn("ref", PAGE);
fs.writeFileSync("/tmp/r93/ref-wf-editor.json", JSON.stringify(wfEditor, null, 1));
console.log("WF EDITOR h:", wfEditor.h.join(" | "));
console.log("WF EDITOR labels:", wfEditor.labels.map((l) => l.t + "@" + l.x + "," + l.y).join(" | "));
console.log("WF EDITOR inputs:", JSON.stringify(wfEditor.inputs.map((i) => i.tag + ":" + (i.ph || i.type))));
console.log("WF EDITOR combos:", JSON.stringify(wfEditor.combos));
console.log("WF EDITOR buttons:", wfEditor.buttons.join(" | "));
run(`agent-browser --session ref screenshot /tmp/r93/ref-wf-editor.png`);
