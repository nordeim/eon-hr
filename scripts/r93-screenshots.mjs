#!/usr/bin/env node
// r93-screenshots.mjs — the evidence chain 1510-1522 (13 PNGs) on the
// remediated :3200 standalone (the loc session is authed, 1440×900) + the
// mobile captures (the locm session, 390×844).
import { execSync } from "node:child_process";

function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise((r) => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const t2 = out.trim(); try { return JSON.parse(t2); } catch {} try { return JSON.parse(t2.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }
async function go(session, url, ms = 2800) { run(`agent-browser --session ${session} open ${url}`); await new Promise((r) => setTimeout(r, ms)); }
const shots = "/home/z/my-project/eon-hr/docs/screenshots";
let n = 1510;
const shot = (session, name) => { run(`agent-browser --session ${session} screenshot ${shots}/${n}-${name}.png`); console.log("captured", n, name); n += 1; };

// 1510: the dashboard (the dev-server evidence)
await go("loc", "http://127.0.0.1:3200/dashboard", 3500);
shot("loc", "dev-dashboard");

// 1511: the wizard step 1 (the placeholders)
await go("loc", "http://127.0.0.1:3200/employees");
await evalOn("loc", `(() => { const b = [...document.querySelectorAll('button')].find(x => /Add Employee/.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 1400));
shot("loc", "dev-wizard-step1");
// 1512: step 3 (the Contract Type + Basic Salary)
await evalOn("loc", `(() => { const el = [...document.querySelectorAll('input')].find(i => i.placeholder === 'John Doe'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, 'Probe User'); el.dispatchEvent(new Event('input', { bubbles: true })); const em = [...document.querySelectorAll('input')].find(i => i.placeholder === 'john@company.com'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(em, 'probe-r93@eon-hr.test'); em.dispatchEvent(new Event('input', { bubbles: true })); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 250));
await evalOn("loc", `(() => { [...document.querySelectorAll('button')].find(x => /^Next$/.test((x.textContent||'').trim())).click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 900));
await evalOn("loc", `(() => { const el = [...document.querySelectorAll('input')].find(i => i.placeholder === 'Software Engineer'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, 'QA Probe'); el.dispatchEvent(new Event('input', { bubbles: true })); const d = document.querySelector('input[type=date]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(d, '2026-11-01'); d.dispatchEvent(new Event('input', { bubbles: true })); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 250));
await evalOn("loc", `(() => { [...document.querySelectorAll('button')].find(x => /^Next$/.test((x.textContent||'').trim())).click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 1100));
shot("loc", "dev-wizard-step3");
await evalOn("loc", `(() => { const b = [...document.querySelectorAll('button')].find(x => /^Cancel$/.test((x.textContent||'').trim())); if (b) b.click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 700));

// 1513: the Post New Job inline form
await go("loc", "http://127.0.0.1:3200/recruitment");
await evalOn("loc", `(() => { const b = [...document.querySelectorAll('button')].find(x => /^Post New Job$/.test((x.textContent||'').trim())); if (b) b.click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 1100));
shot("loc", "dev-postjob-form");
await evalOn("loc", `(() => { const b = [...document.querySelectorAll('button')].find(x => /^Cancel$/.test((x.textContent||'').trim())); if (b) b.click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 600));

// 1514: the Job Postings cards (the three-job tenant)
const SNAP = run(`agent-browser --session loc snapshot`);
const tab = (SNAP.match(/tab "Job Postings" \[ref=(e\d+)\]/) || [])[1];
if (tab) run(`agent-browser --session loc click @${tab}`);
await new Promise((r) => setTimeout(r, 1300));
shot("loc", "dev-jobpostings-cards");

// 1515: the workflow editor
await go("loc", "http://127.0.0.1:3200/workflowconfigpage");
await evalOn("loc", `(() => { const b = [...document.querySelectorAll('button')].find(x => /New Workflow/.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 1200));
shot("loc", "dev-wf-editor");
// 1516: the editor + an added level
await evalOn("loc", `(() => { const b = [...document.querySelectorAll('button')].find(x => /Add Level/.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 800));
shot("loc", "dev-wf-editor-2levels");
await evalOn("loc", `(() => { const b = [...document.querySelectorAll('button').find ? [] : []]; return 'ok'; })()`);

// 1517: the Schedule Recurring Report dialog
await go("loc", "http://127.0.0.1:3200/advancedanalytics");
await evalOn("loc", `(() => { const b = [...document.querySelectorAll('button')].find(x => /Schedule Report/.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 1200));
shot("loc", "dev-schedule-dialog");
run(`agent-browser --session loc keyboard Escape`);
await new Promise((r) => setTimeout(r, 500));

// 1518: the Send Payslips dialog
await go("loc", "http://127.0.0.1:3200/payrollreports");
await evalOn("loc", `(() => { const b = [...document.querySelectorAll('button')].find(x => /Send Payslips/.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 1200));
shot("loc", "dev-payslips-dialog");
run(`agent-browser --session loc keyboard Escape`);
await new Promise((r) => setTimeout(r, 500));

// 1519: the Start New Chat dialog
await go("loc", "http://127.0.0.1:3200/hrassistantchat");
await evalOn("loc", `(() => { const b = [...document.querySelectorAll('button')].find(x => /New Chat/.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 1200));
shot("loc", "dev-newchat-dialog");
run(`agent-browser --session loc keyboard Escape`);
await new Promise((r) => setTimeout(r, 500));

// 1520: the Add Applicant bare form
await go("loc", "http://127.0.0.1:3200/recruitmentkanban");
await evalOn("loc", `(() => { const b = [...document.querySelectorAll('button')].find(x => /Add Applicant/.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 1200));
shot("loc", "dev-addapplicant-dialog");
run(`agent-browser --session loc keyboard Escape`);
await new Promise((r) => setTimeout(r, 500));

// 1521: the careers board (the active-only set)
await go("loc", "http://127.0.0.1:3200/careers", 3200);
shot("loc", "dev-careers-active");

// 1522: the mobile wizard sheet (the locm session is authed at 390)
run(`agent-browser --session locm open http://127.0.0.1:3200/employees`);
await new Promise((r) => setTimeout(r, 2800));
await evalOn("locm", `(() => { const b = [...document.querySelectorAll('button')].find(x => /Add Employee/.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 1400));
await evalOn("locm", `(() => { const el = [...document.querySelectorAll('input')].find(i => i.placeholder === 'John Doe'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, 'Probe User'); el.dispatchEvent(new Event('input', { bubbles: true })); const em = [...document.querySelectorAll('input')].find(i => i.placeholder === 'john@company.com'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(em, 'probe-r93@eon-hr.test'); em.dispatchEvent(new Event('input', { bubbles: true })); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 250));
await evalOn("locm", `(() => { [...document.querySelectorAll('button')].find(x => /^Next$/.test((x.textContent||'').trim())).click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 1000));
await evalOn("locm", `(() => { const el = [...document.querySelectorAll('input')].find(i => i.placeholder === 'Software Engineer'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, 'QA Probe'); el.dispatchEvent(new Event('input', { bubbles: true })); const d = document.querySelector('input[type=date]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(d, '2026-11-01'); d.dispatchEvent(new Event('input', { bubbles: true })); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 250));
await evalOn("locm", `(() => { [...document.querySelectorAll('button')].find(x => /^Next$/.test((x.textContent||'').trim())).click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 1000));
const snap3 = run(`agent-browser --session locm snapshot`);
const ct = (snap3.match(/button "Contract Type" \[ref=(e\d+)\]/) || [])[1];
if (ct) run(`agent-browser --session locm click @${ct}`);
await new Promise((r) => setTimeout(r, 1300));
shot("locm", "dev-mobile-wizard-sheet");

console.log("evidence chain 1510-" + (n - 1) + " complete");
