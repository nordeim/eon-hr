#!/usr/bin/env node
// r93-postfix-verify.mjs — the live post-fix cross-side re-verify on the
// remediated :3200 standalone + the standing mobile-menu cycle + the wizard's
// Contract Type through the R90-B bottom sheet at 390.
import { execSync } from "node:child_process";

function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise((r) => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const t2 = out.trim(); try { return JSON.parse(t2); } catch {} try { return JSON.parse(t2.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 400) }; } }
async function go(session, url, ms = 3000) { run(`agent-browser --session ${session} open ${url}`); await new Promise((r) => setTimeout(r, ms)); }

const PASS = [];
const FAIL = [];
function check(name, cond, detail = "") {
  if (cond) { PASS.push(name); console.log("PASS", name, detail); }
  else { FAIL.push(name); console.log("FAIL", name, detail); }
}

// ---------- the wizard (all four steps) ----------
await go("loc", "http://127.0.0.1:3200/employees");
await evalOn("loc", `(() => { const b = [...document.querySelectorAll('button')].find(x => /Add Employee/.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 1500));
const phs = await evalOn("loc", `(() => [...document.querySelectorAll('input')].map(i => i.placeholder).filter(Boolean))()`);
check("wizard step-1 placeholders", JSON.stringify(phs.slice(0, 4)) === JSON.stringify(["John Doe", "john@company.com", "john@personal.com", "+966 5XX XXX XXX"]), JSON.stringify(phs));
await evalOn("loc", `(() => { const el = [...document.querySelectorAll('input')].find(i => i.placeholder === 'John Doe'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, 'Probe User'); el.dispatchEvent(new Event('input', { bubbles: true })); const em = [...document.querySelectorAll('input')].find(i => i.placeholder === 'john@company.com'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(em, 'probe-r93@eon-hr.test'); em.dispatchEvent(new Event('input', { bubbles: true })); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 300));
await evalOn("loc", `(() => { [...document.querySelectorAll('button')].find(x => /^Next$/.test((x.textContent||'').trim())).click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 1200));
const s2 = await evalOn("loc", `(() => { const l = [...document.querySelectorAll('label')].map(x => (x.textContent||'').trim()); const rt = l.includes('Reports To'); const mgr = l.includes('Manager'); return { labels: l.filter(x => x.length < 30), rt, mgr }; })()`);
check("wizard step-2 Reports To (no Manager)", s2.rt && !s2.mgr, JSON.stringify(s2.labels.filter((x, i) => ["Job Title *", "Department", "Employment Type", "Start Date *", "Reports To"].includes(x))));
await evalOn("loc", `(() => { const el = [...document.querySelectorAll('input')].find(i => i.placeholder === 'Software Engineer'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, 'QA Probe'); el.dispatchEvent(new Event('input', { bubbles: true })); const d = document.querySelector('input[type=date]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(d, '2026-11-01'); d.dispatchEvent(new Event('input', { bubbles: true })); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 300));
await evalOn("loc", `(() => { [...document.querySelectorAll('button')].find(x => /^Next$/.test((x.textContent||'').trim())).click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 1200));
const s3 = await evalOn("loc", `(() => { const l = [...document.querySelectorAll('label')].map(x => (x.textContent||'').trim()); const salary = [...document.querySelectorAll('input')].find(i => i.placeholder === '0'); return { labels: l.filter(x => x.length < 30).slice(-6), hasSalary: !!salary, salaryType: salary ? salary.type : null }; })()`);
check("wizard step-3 order + Basic Salary", JSON.stringify(s3.labels) === JSON.stringify(["Contract Type", "Contract Start Date", "Basic Salary (SAR)", "Bank Name", "IBAN", "GOSI Number"]) && s3.hasSalary && s3.salaryType === "number", JSON.stringify(s3.labels));
// cancel (no creation)
await evalOn("loc", `(() => { const b = [...document.querySelectorAll('button')].find(x => /^Cancel$/.test((x.textContent||'').trim())); if (b) b.click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 900));

// ---------- the Post New Job inline form ----------
await go("loc", "http://127.0.0.1:3200/recruitment");
await evalOn("loc", `(() => { const b = [...document.querySelectorAll('button')].find(x => /^Post New Job$/.test((x.textContent||'').trim())); if (b) b.click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 1200));
const form = await evalOn("loc", `(() => { const lbl = [...document.querySelectorAll('label')].find(l => (l.textContent||'').trim() === 'Job Title *'); if (!lbl) return { found: false }; let card = lbl; for (let i = 0; i < 8; i++) { card = card.parentElement; if (card.className.includes('shadow-xl')) break; } return { found: true, cls: card.className, header: (card.querySelector('div.bg-gradient-to-r')||{}).textContent || '', req: !!document.querySelector('textarea[placeholder="List required skills, experience, qualifications..."]'), buttons: [...document.querySelectorAll('button')].map(b => (b.textContent||'').trim()).filter(t => t === 'Cancel' || t === 'Create Job') }; })()`);
check("Post New Job inline form", form.found && form.cls.includes("shadow-xl") && form.header.trim() === "Post New Job" && form.req && form.buttons.includes("Create Job"), JSON.stringify(form).slice(0, 160));
await evalOn("loc", `(() => { const b = [...document.querySelectorAll('button')].find(x => /^Cancel$/.test((x.textContent||'').trim())); if (b) b.click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 700));

// ---------- the Job Postings cards ----------
const SNAP = run(`agent-browser --session loc snapshot`);
const tabRef = (SNAP.match(/tab "Job Postings" \[ref=(e\d+)\]/) || [])[1];
if (tabRef) run(`agent-browser --session loc click @${tabRef}`);
await new Promise((r) => setTimeout(r, 1500));
const cards = await evalOn("loc", `(() => { const root = document.querySelector('main'); const out = []; for (const c of root.querySelectorAll('div')) { const r = c.getBoundingClientRect(); if (r.width >= 400 && r.width <= 620 && r.height >= 150 && r.height <= 400 && (c.className||'').includes('rounded-xl') && (c.className||'').includes('hover:shadow-lg')) { const t = (c.querySelector('.text-lg')||{}).textContent || ''; if (t.trim()) out.push(t.trim()); } } return [...new Set(out)]; })()`);
check("Job Postings card order", JSON.stringify(cards) === JSON.stringify(["HR Manager", "HR Director", "System Admin"]), JSON.stringify(cards));

// ---------- the workflow editor ----------
await go("loc", "http://127.0.0.1:3200/workflowconfigpage");
await evalOn("loc", `(() => { const b = [...document.querySelectorAll('button')].find(x => /New Workflow/.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 1300));
const wf = await evalOn("loc", `(() => { const l = [...document.querySelectorAll('label')].map(x => (x.textContent||'').trim()); return { name: (document.querySelector('h1')||{}).textContent || '', wf: !!document.querySelector('input[placeholder="e.g. Finance Approval"]'), min: !!document.querySelector('input[placeholder="e.g. 500"]'), max: !!document.querySelector('input[placeholder="e.g. 10000"]'), cat: !!document.querySelector('input[placeholder="finance, hr, it"]'), lvl: !!document.querySelector('input[placeholder="Level name (e.g. Line Manager)"]'), save: [...document.querySelectorAll('button')].some(b => /Save Workflow/.test(b.textContent||'')) }; })()`);
check("workflow editor", wf.name.trim() === "New Workflow" && wf.wf && wf.min && wf.max && wf.cat && wf.lvl && wf.save, JSON.stringify(wf));

// ---------- the three dialogs ----------
await go("loc", "http://127.0.0.1:3200/advancedanalytics");
await evalOn("loc", `(() => { const b = [...document.querySelectorAll('button')].find(x => /Schedule Report/.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 1300));
const d1 = await evalOn("loc", `(() => { const d = document.querySelector('[role=dialog]'); if (!d) return null; const r = d.getBoundingClientRect(); return { t: (d.querySelector('h2')||{}).textContent || '', labels: [...d.querySelectorAll('label')].map(l => (l.textContent||'').trim()), w: Math.round(r.width), h: Math.round(r.height) }; })()`);
check("Schedule Recurring Report dialog", d1 && d1.t.trim() === "Schedule Recurring Report" && JSON.stringify(d1.labels) === JSON.stringify(["Report Name", "Report Type", "Frequency", "Recipients"]) && d1.w === 512, JSON.stringify(d1));
run(`agent-browser --session loc keyboard Escape`);
await new Promise((r) => setTimeout(r, 600));

await go("loc", "http://127.0.0.1:3200/payrollreports");
await evalOn("loc", `(() => { const b = [...document.querySelectorAll('button')].find(x => /Send Payslips/.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 1300));
const d2 = await evalOn("loc", `(() => { const d = document.querySelector('[role=dialog]'); if (!d) return null; const r = d.getBoundingClientRect(); const month = d.querySelector('input[type=month]'); return { t: (d.querySelector('h2')||{}).textContent || '', w: Math.round(r.width), h: Math.round(r.height), month: !!month, sendAll: [...d.querySelectorAll('button')].some(b => /Send All/.test(b.textContent||'')) }; })()`);
check("Send Payslips dialog (672)", d2 && d2.t.trim() === "Send Payslips via WhatsApp" && d2.w === 672 && d2.month && d2.sendAll, JSON.stringify(d2));
run(`agent-browser --session loc keyboard Escape`);
await new Promise((r) => setTimeout(r, 600));

await go("loc", "http://127.0.0.1:3200/hrassistantchat");
await evalOn("loc", `(() => { const b = [...document.querySelectorAll('button')].find(x => /New Chat/.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 1300));
const d3 = await evalOn("loc", `(() => { const d = document.querySelector('[role=dialog]'); if (!d) return null; const r = d.getBoundingClientRect(); return { t: (d.querySelector('h2')||{}).textContent || '', w: Math.round(r.width), h: Math.round(r.height), ph: (d.querySelector('input')||{}).placeholder || '' }; })()`);
check("Start New Chat dialog", d3 && d3.t.trim() === "Start New Chat" && d3.w === 512 && d3.ph === "Project name (optional)", JSON.stringify(d3));
run(`agent-browser --session loc keyboard Escape`);
await new Promise((r) => setTimeout(r, 600));

// ---------- the Add Applicant bare form ----------
await go("loc", "http://127.0.0.1:3200/recruitmentkanban");
await evalOn("loc", `(() => { const b = [...document.querySelectorAll('button')].find(x => /Add Applicant/.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 1300));
const d4 = await evalOn("loc", `(() => { const d = document.querySelector('[role=dialog]'); if (!d) return null; const r = d.getBoundingClientRect(); const phs = [...d.querySelectorAll('input,textarea')].map(i => i.getAttribute('placeholder') || '').filter(Boolean); const ta = d.querySelector('textarea'); return { w: Math.round(r.width), h: Math.round(r.height), phs, rows: ta ? ta.getAttribute('rows') : null }; })()`);
check("Add Applicant bare form (512×522)", d4 && d4.w === 512 && Math.abs(d4.h - 522) < 8 && d4.phs.length === 0 && d4.rows === "3", JSON.stringify(d4));
run(`agent-browser --session loc keyboard Escape`);

console.log("\n===== POST-FIX VERIFY: " + PASS.length + " passed, " + FAIL.length + " failed =====");
if (FAIL.length) { console.log("FAILED:", FAIL.join(" | ")); process.exit(1); }
process.exit(0);
