#!/usr/bin/env node
// r92-mobile-verify.mjs — the standing mobile-menu cycle (open → Training LMS
// → /training → auto-close superset) + the mobile bottom-sheet spot-check on
// the NEW session92 selects (the R90-B interplay) at 390x844.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 300); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const base = "http://127.0.0.1:3200";
run(`agent-browser --session locm close 2>/dev/null; true`);
run(`agent-browser --session locm set viewport 390 844`);
run(`agent-browser --session locm open ${base}/login`);
await sleep(2500);
run(`agent-browser --session locm fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
await sleep(400);
run(`agent-browser --session locm fill 'input[type=password]' '$Abcd1234'`);
await sleep(600);
run(`agent-browser --session locm click 'button[type=submit]'`);
await sleep(4000);

// --- the mobile-menu cycle: open drawer → Training LMS → /training → auto-close
// (the r73 working mechanism: the "Toggle Sidebar" snapshot ref + the native click)
run(`agent-browser --session locm open ${base}/dashboard`);
await sleep(2500);
const snap = run(`agent-browser --session locm snapshot -i -c`);
const line = (snap.split("\n").find(l => l.includes("Toggle Sidebar")) || "");
const menuRef = (line.match(/ref=(\w+)/) || [])[1];
if (menuRef) run(`agent-browser --session locm click @${menuRef}`);
await sleep(1200);
const drawer = await evalOn("locm", `(() => !!document.querySelector('[role=dialog]'))()`);
const trainingLink = await evalOn("locm", `(() => {
  const links = [...document.querySelectorAll('a')].filter(a => a.offsetParent !== null);
  const t = links.find(a => a.textContent.includes('Training LMS'));
  if (t) { t.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); return t.getAttribute('href'); }
  return null;
})()`);
await sleep(2500);
const afterNav = await evalOn("locm", `(() => ({ url: location.pathname, drawerOpen: !!document.querySelector('[role=dialog]') }))()`);
console.log("MOBILE-MENU CYCLE:", JSON.stringify({ drawerOpened: drawer, trainingHref: trainingLink, afterNav }));

// --- the mobile bottom-sheet spot-check on the NEW requestsettings selects
run(`agent-browser --session locm open ${base}/requestsettings`);
await sleep(4500);
await evalOn("locm", `(() => {
  // at mobile the R90-B trigger is a PLAIN button (no combobox role) — find by text
  const btn = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Finance' && b.offsetParent !== null);
  if (btn) btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  return !!btn;
})()`);
await sleep(1300);
const sheet = await evalOn("locm", `(() => {
  const h2 = [...document.querySelectorAll('h2')].find(h => h.textContent.trim() === 'Select an option' && h.offsetParent !== null);
  if (!h2) return { sheet: false };
  const sheetEl = h2.closest('div.fixed');
  const opts = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null && b.textContent.trim().length > 0 && b.closest('.fixed.inset-x-0.bottom-0')).map(b => b.textContent.trim());
  return { sheet: true, options: opts.slice(0, 10) };
})()`);
console.log("MOBILE SHEET (requestsettings category):", JSON.stringify(sheet));

// --- the leave dialog at mobile (the new 672 dialog's mobile form)
run(`agent-browser --session locm open ${base}/allleaverequests`);
await sleep(4500);
await evalOn("locm", `(() => {
  const btn = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'New Leave Request' && b.offsetParent !== null);
  if (btn) btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  return !!btn;
})()`);
await sleep(1400);
const leaveDlg = await evalOn("locm", `(() => {
  const dr = [...document.querySelectorAll('[role=dialog]')].pop();
  if (!dr) return { open: false };
  return { open: true, labels: [...dr.querySelectorAll('label')].map(l => l.textContent.trim()).slice(0, 8) };
})()`);
console.log("LEAVE DIALOG @390:", JSON.stringify(leaveDlg));
run(`agent-browser --session locm close 2>/dev/null; true`);
process.exit(0);
