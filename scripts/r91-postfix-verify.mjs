#!/usr/bin/env node
// r91-postfix-verify.mjs — the live post-fix verification:
//   1. boot the remediated standalone on :3200
//   2. re-run the LOC inventory sweep on the three fixed surfaces
//      (staffrequests, hrreports, recruitment) + compare to the REF reads
//   3. the mobile-menu cycle (the standing user emphasis)
//   4. the mobile sheet spot-check on the new selects (the R90-B interplay)
import { execSync, spawn } from "node:child_process";
function run(cmd, t = 120000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 300); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const repo = "/home/z/my-project/eon-hr";
// boot the standalone
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="r91-standalone-dev-secret-32chars" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r91b.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await sleep(500);
}
if (!up) { console.log("SERVER DOWN", run("tail -3 /tmp/loc3200-r91b.log")); process.exit(1); }
console.log("remediated standalone up on :3200");

// re-auth both sessions
async function auth(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await sleep(3000);
  run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  await sleep(400);
  run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
  await sleep(600);
  run(`agent-browser --session ${session} click 'button[type=submit]'`);
  await sleep(5000);
  return run(`agent-browser --session ${session} get url`).trim();
}
console.log("ref:", await auth("ref", "https://eon.base44.app"));
console.log("loc:", await auth("loc", "http://127.0.0.1:3200"));

async function readSelects(session, base, route) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}${route}`);
  await sleep(5500);
  const triggers = await evalOn(session, `(() => {
    const ts = [...document.querySelectorAll('button[role=combobox], button[aria-haspopup=listbox]')].filter(t => t.offsetParent !== null);
    return ts.map((t, i) => ({ i, text: t.textContent.trim().slice(0, 40) }));
  })()`);
  const out = [];
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
    out.push({ trigger: t.text, options: opts });
    await evalOn(session, `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); true`);
    await sleep(400);
  }
  return out;
}

// 1. the LOC inventory re-read on the fixed surfaces
for (const route of ["/staffrequests", "/hrreports", "/recruitment"]) {
  const loc = await readSelects("loc", "http://127.0.0.1:3200", route);
  console.log(`\nLOC ${route} (post-fix):`);
  loc.forEach(s => console.log(`  [${s.trigger}] ${s.options ? s.options.join(" | ") : "NULL"}`));
}

// 2. the hrreports entity switch on the LOC
run(`agent-browser --session loc open http://127.0.0.1:3200/hrreports`);
await sleep(5500);
await evalOn("loc", `(() => {
  const ts = [...document.querySelectorAll('button[role=combobox], button[aria-haspopup=listbox]')].filter(t => t.offsetParent !== null);
  if (ts[0]) ts[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  return true;
})()`);
await sleep(900);
await evalOn("loc", `(() => {
  const lbs = [...document.querySelectorAll('[role=listbox]')];
  if (!lbs.length) return false;
  const opt = [...lbs[lbs.length-1].querySelectorAll('[role=option]')].find(o => /Staff Requests/.test(o.textContent));
  if (opt) opt.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  return !!opt;
})()`);
await sleep(1200);
const srHeaders = await evalOn("loc", `(() => [...document.querySelectorAll('table th')].map(t => t.textContent.trim()))()`);
console.log("\nLOC hrreports staff-requests table headers:", JSON.stringify(srHeaders));

// 3. the mobile-menu cycle (the standing user emphasis)
run(`agent-browser --session loc set viewport 390 844`);
run(`agent-browser --session loc open http://127.0.0.1:3200/dashboard`);
await sleep(5000);
run(`agent-browser --session loc click "//placeholder//" 2>/dev/null; true`);
const toggle = await evalOn("loc", `(() => {
  const b = [...document.querySelectorAll('button')].find(x => /toggle sidebar/i.test(x.textContent));
  if (b) { b.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); return true; }
  return false;
})()`);
await sleep(1800);
const navRead = await evalOn("loc", `(() => {
  const links = [...document.querySelectorAll('a')].filter(a => a.offsetParent !== null);
  const training = links.find(a => /training lms/i.test(a.textContent || ''));
  if (training) { training.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); return { clicked: true }; }
  return { clicked: false, count: links.length };
})()`);
await sleep(2500);
const cycle = await evalOn("loc", `(() => ({
  url: location.href,
  drawerOpen: !!document.querySelector('[data-state=open][role=dialog]'),
}))()`);
console.log("\nMOBILE-MENU CYCLE (toggle=" + JSON.stringify(toggle) + ", nav=" + JSON.stringify(navRead) + "):", JSON.stringify(cycle));

// 4. the mobile sheet spot-check on the NEW selects (the R90-B interplay)
run(`agent-browser --session loc set viewport 390 844`);
run(`agent-browser --session loc open http://127.0.0.1:3200/staffrequests`);
await sleep(5500);
await evalOn("loc", `(() => {
  const ts = [...document.querySelectorAll('button')].filter(t => t.offsetParent !== null && /all categories/i.test(t.textContent || ''));
  if (ts[0]) ts[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  return ts.length;
})()`);
await sleep(1400);
const sheet = await evalOn("loc", `(() => {
  const h2s = [...document.querySelectorAll('h2')].map(h => h.textContent.trim());
  const sheet = [...document.querySelectorAll('body > div')].find(d => { const s = getComputedStyle(d); return s.position === 'fixed' && parseFloat(s.bottom || '9999') === 0 && d.textContent.length > 20; });
  const opts = sheet ? [...sheet.querySelectorAll('button')].map(b => b.textContent.trim()).filter(Boolean).slice(0, 10) : null;
  return { h2s: h2s.slice(0, 4), sheetFound: !!sheet, sheetOptions: opts };
})()`);
console.log("\nMOBILE SHEET on staffrequests category (the R90-B interplay):", JSON.stringify(sheet));
process.exit(0);
