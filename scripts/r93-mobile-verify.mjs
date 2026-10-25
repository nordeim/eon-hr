#!/usr/bin/env node
// r93-mobile-verify.mjs — the standing mobile-menu cycle + the wizard's
// Contract Type through the R90-B bottom sheet at 390 (the user emphasis).
import { execSync } from "node:child_process";

function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 300); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise((r) => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const t2 = out.trim(); try { return JSON.parse(t2); } catch {} try { return JSON.parse(t2.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 400) }; } }

// ---------- the mobile-menu cycle at 390×844 ----------
run(`agent-browser --session locm close 2>/dev/null; true`);
run(`agent-browser --session locm set viewport 390 844`);
run(`agent-browser --session locm open http://127.0.0.1:3200/login`);
await new Promise((r) => setTimeout(r, 3000));
run(`agent-browser --session locm fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await new Promise((r) => setTimeout(r, 400));
run(`agent-browser --session locm fill 'input[type=password]' '$Abcd1234'`);
await new Promise((r) => setTimeout(r, 600));
run(`agent-browser --session locm click 'button[type=submit]'`);
await new Promise((r) => setTimeout(r, 5000));
console.log("locm:", run(`agent-browser --session locm get url`).trim());

run(`agent-browser --session locm open http://127.0.0.1:3200/dashboard`);
await new Promise((r) => setTimeout(r, 3500));
// open the drawer via the hamburger (the snapshot-ref native click)
const snap1 = run(`agent-browser --session locm snapshot`);
const burger = (snap1.match(/button "Toggle Sidebar" \[[^\]]*ref=(e\d+)\]/) || [])[1];
console.log("burger ref:", burger);
if (burger) run(`agent-browser --session locm click @${burger}`);
await new Promise((r) => setTimeout(r, 1200));
const drawer = await evalOn("locm", `(() => { const d = document.querySelector('[role=dialog]'); if (!d) return { open: false }; return { open: true, links: [...d.querySelectorAll('a')].length, training: [...d.querySelectorAll('a')].some(a => /Training LMS/.test(a.textContent || '')) }; })()`);
console.log("DRAWER:", JSON.stringify(drawer));
// navigate to Training LMS via the ref click
const snap2 = run(`agent-browser --session locm snapshot`);
const training = (snap2.match(/link "Training LMS"[^\[]*\[ref=(e\d+)\]/) || [])[1] || (snap2.match(/link "Training LMS" \[ref=(e\d+)\]/) || [])[1];
if (training) run(`agent-browser --session locm click @${training}`);
await new Promise((r) => setTimeout(r, 2500));
const afterNav = await evalOn("locm", `(() => ({ url: location.pathname, drawerStillOpen: (() => { const d = document.querySelector('[role=dialog]'); return d ? d.getBoundingClientRect().width > 50 : false; })() }))()`);
console.log("AFTER TRAINING LMS:", JSON.stringify(afterNav));
const menuCycle = drawer.open && afterNav.url === "/training" && !afterNav.drawerStillOpen;
console.log(menuCycle ? "PASS mobile-menu cycle (open → Training LMS → /training → auto-close)" : "FAIL mobile-menu cycle");

// ---------- the wizard's Contract Type through the R90-B sheet ----------
run(`agent-browser --session locm open http://127.0.0.1:3200/employees`);
await new Promise((r) => setTimeout(r, 3000));
await evalOn("locm", `(() => { const b = [...document.querySelectorAll('button')].find(x => /Add Employee/.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 1500));
await evalOn("locm", `(() => { const el = [...document.querySelectorAll('input')].find(i => i.placeholder === 'John Doe'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, 'Probe User'); el.dispatchEvent(new Event('input', { bubbles: true })); const em = [...document.querySelectorAll('input')].find(i => i.placeholder === 'john@company.com'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(em, 'probe-r93@eon-hr.test'); em.dispatchEvent(new Event('input', { bubbles: true })); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 300));
await evalOn("locm", `(() => { [...document.querySelectorAll('button')].find(x => /^Next$/.test((x.textContent||'').trim())).click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 1200));
await evalOn("locm", `(() => { const el = [...document.querySelectorAll('input')].find(i => i.placeholder === 'Software Engineer'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, 'QA Probe'); el.dispatchEvent(new Event('input', { bubbles: true })); const d = document.querySelector('input[type=date]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(d, '2026-11-01'); d.dispatchEvent(new Event('input', { bubbles: true })); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 300));
await evalOn("locm", `(() => { [...document.querySelectorAll('button')].find(x => /^Next$/.test((x.textContent||'').trim())).click(); return 'ok'; })()`);
await new Promise((r) => setTimeout(r, 1200));
// the Contract Type select at 390 opens the bottom sheet (R90-B)
const snap3 = run(`agent-browser --session locm snapshot`);
const ct = (snap3.match(/button "Contract Type" \[ref=(e\d+)\]/) || [])[1];
console.log("contract-type trigger ref:", ct);
if (ct) run(`agent-browser --session locm click @${ct}`);
await new Promise((r) => setTimeout(r, 1500));
const sheet = await evalOn("locm", `(() => { const h2 = [...document.querySelectorAll('h2')].find(h => (h.textContent||'').trim() === 'Select an option'); if (!h2) return { open: false }; const opts = [...new Set([...document.querySelectorAll('button')].map(b => (b.textContent||'').trim()).filter(t => ['Indefinite','Fixed Term','Probation','Internship'].includes(t)))]; return { open: true, opts }; })()`);
console.log("SHEET:", JSON.stringify(sheet));
const sheetOk = sheet.open && JSON.stringify(sheet.opts) === JSON.stringify(["Indefinite", "Fixed Term", "Probation", "Internship"]);
console.log(sheetOk ? "PASS wizard Contract Type through the R90-B sheet (the four options)" : "FAIL wizard sheet");
process.exit(menuCycle && sheetOk ? 0 : 1);
