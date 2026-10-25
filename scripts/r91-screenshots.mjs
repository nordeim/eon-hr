#!/usr/bin/env node
// r91-screenshots.mjs — the round's dev-server evidence chain (1469-1483):
// the remediated surfaces on the seeded standalone (:3200).
import { execSync } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 300); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const shots = "/home/z/my-project/eon-hr/docs/screenshots";
const base = "http://127.0.0.1:3200";
const s = "loc";

async function shot(name, route, vp, settle, action) {
  run(`agent-browser --session ${s} set viewport ${vp[0]} ${vp[1]}`);
  run(`agent-browser --session ${s} open ${base}${route}`);
  await sleep(settle);
  if (action) { await action(); await sleep(1200); }
  run(`agent-browser --session ${s} screenshot ${shots}/${name}`);
  console.log("captured", name);
}

// 1469 — the dev dashboard (desktop)
await shot("1469-dev-dashboard.png", "/dashboard", [1440, 900], 5500);
// 1471 — staffrequests with the category select OPEN (desktop popper)
await shot("1471-dev-staffrequests-category.png", "/staffrequests", [1440, 900], 5500, async () => {
  await evalOn(s, `(() => {
    const ts = [...document.querySelectorAll('button')].filter(t => t.offsetParent !== null && /all categories/i.test(t.textContent || ''));
    if (ts[0]) ts[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  })()`);
});
// 1473 — hrreports with the entity select OPEN
await shot("1473-dev-hrreports-entities.png", "/hrreports", [1440, 900], 5500, async () => {
  await evalOn(s, `(() => {
    const ts = [...document.querySelectorAll('button[role=combobox], button[aria-haspopup=listbox]')].filter(t => t.offsetParent !== null);
    if (ts[0]) ts[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  })()`);
});
// 1475 — hrreports on the staff-requests entity (the table headers)
await shot("1475-dev-hrreports-staffrequests.png", "/hrreports", [1440, 900], 5500, async () => {
  await evalOn(s, `(() => {
    const ts = [...document.querySelectorAll('button[role=combobox], button[aria-haspopup=listbox]')].filter(t => t.offsetParent !== null);
    if (ts[0]) ts[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  })()`);
  await sleep(900);
  await evalOn(s, `(() => {
    const lbs = [...document.querySelectorAll('[role=listbox]')];
    if (!lbs.length) return false;
    const opt = [...lbs[lbs.length-1].querySelectorAll('[role=option]')].find(o => /Staff Requests/.test(o.textContent));
    if (opt) opt.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  })()`);
});
// 1477 — recruitment with the status filter OPEN
await shot("1477-dev-recruitment-status.png", "/recruitment", [1440, 900], 5500, async () => {
  await evalOn(s, `(() => {
    const ts = [...document.querySelectorAll('button')].filter(t => t.offsetParent !== null && /all status/i.test(t.textContent || ''));
    if (ts[0]) ts[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  })()`);
});
// 1479 — the Add Applicant dialog (the new field contract)
await shot("1479-dev-add-applicant.png", "/recruitmentkanban", [1440, 900], 5500, async () => {
  await evalOn(s, `(() => {
    const b = [...document.querySelectorAll('button')].find(x => /add applicant/i.test(x.textContent));
    if (b) b.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  })()`);
});
// 1481 — the mobile sheet on the new staffrequests category select
await shot("1481-dev-mobile-sheet.png", "/staffrequests", [390, 844], 5500, async () => {
  await evalOn(s, `(() => {
    const ts = [...document.querySelectorAll('button')].filter(t => t.offsetParent !== null && /all categories/i.test(t.textContent || ''));
    if (ts[0]) ts[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  })()`);
});
// 1483 — the mobile-menu cycle proof (/training after the drawer nav)
run(`agent-browser --session ${s} set viewport 390 844`);
run(`agent-browser --session ${s} open ${base}/dashboard`);
await sleep(5500);
await evalOn(s, `(() => {
  const b = [...document.querySelectorAll('button')].find(x => /toggle sidebar/i.test(x.textContent));
  if (b) b.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  return true;
})()`);
await sleep(1800);
await evalOn(s, `(() => {
  const links = [...document.querySelectorAll('a')].filter(a => a.offsetParent !== null);
  const t = links.find(a => /training lms/i.test(a.textContent || ''));
  if (t) t.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  return true;
})()`);
await sleep(2500);
run(`agent-browser --session ${s} screenshot ${shots}/1483-dev-mobile-cycle.png`);
console.log("captured 1483-dev-mobile-cycle.png");
process.exit(0);
