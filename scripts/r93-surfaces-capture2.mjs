#!/usr/bin/env node
// r93-surfaces-capture2.mjs — the remaining REF surfaces:
//   Job Postings tab cards, WF combos, Schedule Report dialog, Send Payslips
//   dialog, New Chat dialog, Add Applicant dialog geometry.
import { execSync } from "node:child_process";
import fs from "node:fs";

function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise((r) => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const t2 = out.trim(); try { return JSON.parse(t2); } catch {} try { return JSON.parse(t2.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 400) }; } }
async function go(session, url, ms = 3200) { run(`agent-browser --session ${session} open ${url}`); await new Promise((r) => setTimeout(r, ms)); }
const DIALOG = `(() => {
  const d = document.querySelector('[role=dialog]');
  if (!d) return null;
  const r = d.getBoundingClientRect();
  const text = (el) => (el.textContent || '').replace(/\\s+/g, ' ').trim();
  const labels = [...d.querySelectorAll('label')].map(l => { const lr = l.getBoundingClientRect(); return { t: text(l), x: Math.round(lr.x), y: Math.round(lr.y) }; }).filter(l => l.t);
  const inputs = [...d.querySelectorAll('input,textarea')].map(i => ({ tag: i.tagName, type: i.getAttribute('type') || '', ph: i.getAttribute('placeholder') || '' }));
  const combos = [...d.querySelectorAll('button[role=combobox]')].map(b => text(b));
  const buttons = [...d.querySelectorAll('button')].map(text).filter(Boolean).filter(t => t.length < 30);
  const texts = [...d.querySelectorAll('p,span,div')].map(text).filter(t => t.length > 3 && t.length < 120).slice(0, 18);
  return { rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, labels, inputs, combos, buttons, texts };
})()`;

// ---------- Job Postings tab (proper read) ----------
await go("ref", "https://eon.base44.app/recruitment");
await evalOn("ref", `(() => { const b = [...document.querySelectorAll('[role=tab]')].find(x => /Job Postings/i.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 1800));
const jp = await evalOn("ref", `(() => { const root = document.querySelector('main'); const text = (el) => (el.textContent || '').replace(/\\s+/g, ' ').trim(); const cards = []; for (const c of root.querySelectorAll('div')) { const r = c.getBoundingClientRect(); const cls = c.className || ''; if (cls.includes('card') || (r.width > 300 && r.width < 620 && r.height > 80 && r.height < 420)) { const t = text(c); if (t.length > 30 && t.length < 400 && (/(Jeddah|HR|System Admin|Riyadh)/i.test(t))) cards.push({ t: t.slice(0, 300), w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y) }); } } const uq = [...new Map(cards.map(c => [c.t.slice(0, 60), c])).values()]; return uq.slice(0, 5); })()`);
console.log("JOB POSTINGS cards:", JSON.stringify(jp, null, 1));
run(`agent-browser --session ref screenshot /tmp/r93/ref-jobpostings.png`);

// the All Jobs filter options
await evalOn("ref", `(() => { const b = [...document.querySelectorAll('button[role=combobox]')].find(x => /All Jobs/.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 800));
console.log("All Jobs filter options:", JSON.stringify(await evalOn("ref", `(() => [...document.querySelectorAll('[role=option]')].map(o => o.textContent.trim()))()`)));

// ---------- WF combos ----------
await go("ref", "https://eon.base44.app/workflowconfigpage");
await evalOn("ref", `(() => { const b = [...document.querySelectorAll('button')].find(x => /New Workflow/i.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 1500));
await evalOn("ref", `(() => { const b = [...document.querySelectorAll('button[role=combobox]')].find(x => /Staff Requests/.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 800));
console.log("WF AppliesTo options:", JSON.stringify(await evalOn("ref", `(() => [...document.querySelectorAll('[role=option]')].map(o => o.textContent.trim()))()`)));
await evalOn("ref", `(() => { const b = [...document.querySelectorAll('button[role=combobox]')].find(x => /Direct Manager/.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 800));
console.log("WF ApproverType options:", JSON.stringify(await evalOn("ref", `(() => [...document.querySelectorAll('[role=option]')].map(o => o.textContent.trim()))()`)));
// add a level to read the level builder row
console.log("add level:", await evalOn("ref", `(() => { const b = [...document.querySelectorAll('button')].find(x => /Add Level/i.test(x.textContent||'')); if (b) { b.click(); return 'clicked'; } return 'NOT FOUND'; })()`));
await new Promise((r) => setTimeout(r, 800));
const wfLevel = await evalOn("ref", `(() => { const labels = [...document.querySelectorAll('label')].map(l => { const r = l.getBoundingClientRect(); return { t: (l.textContent||'').replace(/\\s+/g,' ').trim(), y: Math.round(r.y), x: Math.round(r.x) }; }).filter(l => l.t); return labels; })()`);
console.log("WF after Add Level labels:", JSON.stringify(wfLevel, null, 1));
run(`agent-browser --session ref screenshot /tmp/r93/ref-wf-levels.png`);

// ---------- D: Schedule Recurring Report ----------
await go("ref", "https://eon.base44.app/advancedanalytics");
const aaBtns = await evalOn("ref", `(() => [...document.querySelectorAll('button')].map(b => (b.textContent||'').replace(/\\s+/g,' ').trim()).filter(t => t.length > 2 && t.length < 40))()`);
console.log("\nADVANALYTICS buttons:", JSON.stringify(aaBtns.slice(0, 16)));
await evalOn("ref", `(() => { const b = [...document.querySelectorAll('button')].find(x => /Schedule/i.test(x.textContent||'')); if (b) { b.click(); return 'clicked'; } return 'NOT FOUND'; })()`);
await new Promise((r) => setTimeout(r, 1500));
let d1 = await evalOn("ref", DIALOG);
console.log("SCHEDULE DIALOG:", JSON.stringify(d1, null, 1));
run(`agent-browser --session ref screenshot /tmp/r93/ref-schedule-dialog.png`);

// ---------- E: Send Payslips via WhatsApp ----------
await go("ref", "https://eon.base44.app/payrollreports");
const prBtns = await evalOn("ref", `(() => [...document.querySelectorAll('button')].map(b => (b.textContent||'').replace(/\\s+/g,' ').trim()).filter(t => t.length > 2 && t.length < 44))()`);
console.log("\nPAYROLLREPORTS buttons:", JSON.stringify(prBtns.slice(0, 16)));
await evalOn("ref", `(() => { const b = [...document.querySelectorAll('button')].find(x => /Send Payslips|WhatsApp/i.test(x.textContent||'')); if (b) { b.click(); return 'clicked'; } return 'NOT FOUND'; })()`);
await new Promise((r) => setTimeout(r, 1500));
let d2 = await evalOn("ref", DIALOG);
console.log("PAYSLIPS DIALOG:", JSON.stringify(d2, null, 1));
run(`agent-browser --session ref screenshot /tmp/r93/ref-payslips-dialog.png`);

// ---------- F: New Chat ----------
await go("ref", "https://eon.base44.app/hrassistantchat");
const chBtns = await evalOn("ref", `(() => [...document.querySelectorAll('button')].map(b => (b.textContent||'').replace(/\\s+/g,' ').trim()).filter(t => t.length > 1 && t.length < 34))()`);
console.log("\nCHAT buttons:", JSON.stringify(chBtns.slice(0, 16)));
await evalOn("ref", `(() => { const b = [...document.querySelectorAll('button')].find(x => /New Chat/i.test(x.textContent||'')); if (b) { b.click(); return 'clicked'; } return 'NOT FOUND'; })()`);
await new Promise((r) => setTimeout(r, 1500));
let d3 = await evalOn("ref", DIALOG);
console.log("NEW CHAT DIALOG:", JSON.stringify(d3, null, 1));
run(`agent-browser --session ref screenshot /tmp/r93/ref-newchat-dialog.png`);

// ---------- G: Add Applicant (recruitmentkanban) ----------
await go("ref", "https://eon.base44.app/recruitmentkanban");
await evalOn("ref", `(() => { const b = [...document.querySelectorAll('button')].find(x => /Add Applicant/i.test(x.textContent||'')); if (b) { b.click(); return 'clicked'; } return 'NOT FOUND'; })()`);
await new Promise((r) => setTimeout(r, 1500));
let d4 = await evalOn("ref", DIALOG);
console.log("ADD APPLICANT DIALOG:", JSON.stringify(d4, null, 1));
run(`agent-browser --session ref screenshot /tmp/r93/ref-addapplicant-dialog.png`);
