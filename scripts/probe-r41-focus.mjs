#!/usr/bin/env node
// probe-r41-focus.mjs — session-42 / parity round 41 frontier census:
// the KEYBOARD/FOCUS dimension on the popover/menu family (the named
// session-38 remainder): the bell Popover, the user DropdownMenu, and the
// employees Select. Initial focus on open, the Tab/Arrow sequence, the
// Escape restore, the trigger aria contracts. Both apps, structural compare.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const raw = out.trim(); try { return JSON.parse(raw); } catch { /* string result: agent-browser returns it JSON-quoted */ try { return JSON.parse(`"${raw.replace(/^"|"$/g, "").replace(/"/g, '\\"')}"`); } catch { return { error: raw.slice(0, 300) }; } } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

function findRef(session, pattern, kind = "button") {
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const lines = snap.split("\n");
  const re = new RegExp(`- ${kind} "[^"]*${pattern}[^"]*"((?!\\])[^\\n])*ref=(\\w+)\\]`);
  for (const line of lines) { const m = line.match(re); if (m) return m[2]; }
  const re2 = new RegExp(`- ${kind} [^\\[]*\\[[^\\]]*${pattern}[^\\]]*ref=(\\w+)\\]`);
  for (const line of lines) { const m = line2(line); if (m) return m[1]; function line2(l) { return l.match(re2); } }
  return null;
}
// REF's bell carries NO accessible name (bare button); find the button
// 1-3 lines above عربي — the established r40 pattern.
function bellRef(session) {
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const lines = snap.split("\n");
  const arIdx = lines.findIndex((l) => l.includes("عربي"));
  for (let i = arIdx - 1; i >= Math.max(0, arIdx - 3); i--) {
    const m = lines[i].match(/- button (\["[^"]*"\] )?\[[^\\]]*?expanded=false, ref=(\w+)\]/) || lines[i].match(/- button \[expanded=false, ref=(\w+)\]/);
    if (m) return m[2] || m[1];
  }
  return null;
}

const DESCRIBE = `(() => {
  const el = document.activeElement;
  if (!el || el === document.body) return 'BODY';
  const tag = el.tagName.toLowerCase();
  const bits = [tag];
  if (el.type) bits.push('type=' + el.type);
  if (el.getAttribute('role')) bits.push('role=' + el.getAttribute('role'));
  if (el.getAttribute('aria-expanded') !== null) bits.push('ax=' + el.getAttribute('aria-expanded'));
  const lbl = el.getAttribute('aria-label');
  if (lbl) bits.push('al=' + lbl);
  const txt = (el.textContent || '').trim().slice(0, 20);
  if (txt && tag !== 'input' && tag !== 'textarea') bits.push('txt=' + txt);
  const r = el.getBoundingClientRect();
  bits.push(Math.round(r.x) + ',' + Math.round(r.y) + ',' + Math.round(r.width) + 'x' + Math.round(r.height));
  return bits.join(' ');
})()`;

const POP_STATE = `(() => {
  const open = [...document.querySelectorAll('[data-state=open], [role=menu], [role=listbox]')].filter(e => {
    const r = e.getBoundingClientRect();
    return r.width > 0;
  }).map(e => {
    const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
    return { role: e.getAttribute('role'), tag: e.tagName.toLowerCase(), w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y), bg: cs.backgroundColor };
  });
  return { openSurfaces: open };
})()`;

const TRIGGER_ARIA = `(() => {
  const el = document.activeElement;
  return { expanded: el.getAttribute('aria-expanded'), haspopup: el.getAttribute('aria-haspopup'), controls: el.getAttribute('aria-controls') ? 'present' : null, role: el.getAttribute('role'), tabindex: el.getAttribute('tabindex') };
})()`;

// ---------- 1. THE BELL POPOVER ----------
async function probeBell(label, session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 3000));
  const ref = bellRef(session) || findRef(session, "Notifications");
  if (!ref) return { error: "no bell ref" };
  run(`agent-browser --session ${session} click @${ref}`);
  await new Promise(r => setTimeout(r, 1200));
  const state = await evalOn(session, POP_STATE);
  const focus0 = await evalOn(session, DESCRIBE);
  const seq = [];
  for (let i = 0; i < 8; i++) {
    run(`agent-browser --session ${session} press Tab`);
    await new Promise(r => setTimeout(r, 220));
    seq.push(await evalOn(session, DESCRIBE));
  }
  run(`agent-browser --session ${session} press Escape`);
  await new Promise(r => setTimeout(r, 900));
  const afterEsc = await evalOn(session, DESCRIBE);
  const stateAfter = await evalOn(session, POP_STATE);
  return { state, focus0, seq, afterEsc, closedAfterEsc: stateAfter.openSurfaces.length === 0 };
}

// ---------- 2. THE USER DROPDOWN MENU ----------
async function probeUserMenu(label, session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 3000));
  const ref = findRef(session, "sepnetflix2023");
  if (!ref) return { error: "no user trigger ref" };
  // measure the trigger's aria contract BEFORE opening
  run(`agent-browser --session ${session} click @${ref}`);
  await new Promise(r => setTimeout(r, 500));
  run(`agent-browser --session ${session} press Escape`);
  await new Promise(r => setTimeout(r, 600));
  run(`agent-browser --session ${session} click @${ref}`);
  await new Promise(r => setTimeout(r, 1200));
  const state = await evalOn(session, POP_STATE);
  const focus0 = await evalOn(session, DESCRIBE);
  const seq = [];
  for (const key of ["ArrowDown", "ArrowDown", "ArrowDown", "ArrowUp", "Home", "End"]) {
    run(`agent-browser --session ${session} press ${key}`);
    await new Promise(r => setTimeout(r, 260));
    seq.push({ key, focus: await evalOn(session, DESCRIBE) });
  }
  run(`agent-browser --session ${session} press Escape`);
  await new Promise(r => setTimeout(r, 900));
  const afterEsc = await evalOn(session, DESCRIBE);
  const stateAfter = await evalOn(session, POP_STATE);
  return { state, focus0, seq, afterEsc, closedAfterEsc: stateAfter.openSurfaces.length === 0 };
}

// ---------- 3. THE SELECT (employees status combobox) ----------
async function probeSelect(label, session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/employees`);
  await new Promise(r => setTimeout(r, 3500));
  // the status combobox carries no accessible name — bare `combobox
  // [expanded=false, ref=…]: Active` in the snapshot.
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const m = snap.match(/- combobox \[[^\]]*ref=(\w+)\]: Active/);
  const ref = m ? m[1] : findRef(session, "Active", "combobox");
  if (!ref) return { error: "no select ref" };
  run(`agent-browser --session ${session} click @${ref}`);
  await new Promise(r => setTimeout(r, 1200));
  const state = await evalOn(session, POP_STATE);
  const focus0 = await evalOn(session, DESCRIBE);
  const seq = [];
  for (const key of ["ArrowDown", "ArrowDown", "ArrowUp"]) {
    run(`agent-browser --session ${session} press ${key}`);
    await new Promise(r => setTimeout(r, 260));
    seq.push({ key, focus: await evalOn(session, DESCRIBE) });
  }
  run(`agent-browser --session ${session} press Escape`);
  await new Promise(r => setTimeout(r, 900));
  const afterEsc = await evalOn(session, DESCRIBE);
  const stateAfter = await evalOn(session, POP_STATE);
  return { state, focus0, seq, afterEsc, closedAfterEsc: stateAfter.openSurfaces.length === 0 };
}

const probes = { bell: probeBell, userMenu: probeUserMenu, select: probeSelect };
const norm = (o) => JSON.parse(JSON.stringify(o, (k, v) => v === undefined ? null : v));
const only = process.argv[2];
for (const [name, fn] of Object.entries(probes)) {
  if (only && name !== only) continue;
  const ref = norm(await fn(name, "ref", baseRef));
  const loc = norm(await fn(name, "loc", baseLoc));
  const match = JSON.stringify(ref) === JSON.stringify(loc);
  console.log(`\n===== ${name} ===== ${match ? "MATCH" : "DIFF"}`);
  console.log(`REF: ${JSON.stringify(ref, null, 1)}`);
  console.log(`LOC: ${JSON.stringify(loc, null, 1)}`);
}
