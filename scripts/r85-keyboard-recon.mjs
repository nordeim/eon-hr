#!/usr/bin/env node
// r85-keyboard-recon.mjs — session-85 / parity round 84 fresh-eyes
// instrument: THE KEYBOARD-NAVIGATION CYCLE (the last of the r83
// close-out's named candidates, never audited): the focus-visible rings
// (the computed focus styles on keyboard focus), the TAB WALKS (the
// sequential focus order on the login + dashboard shells), and the
// MOBILE DRAWER'S KEYBOARD CONTRACT (where focus lands on open, the
// focus trap, the Escape close, the link-Enter navigation).
// Method: agent-browser press Tab + document.activeElement reads with
// getComputedStyle (the computed-truth doctrine — §18 T8: assert via
// computed styles, never class names alone).
// NOTE (the r85 truncation lesson): read box-shadow FULL — never
// slice() the string (the leading transparent --tw-inset-* slots once
// produced a false "transparent ring" alarm).
// Surfaces:
//   A. LOGIN  tab walk (fresh sessions, 1440x900, 12 stops) both sides
//   B. DASHBOARD tab walk (authed sessions, 1440x900, 15 stops) both sides
//   C. DRAWER keyboard contract (390x844) both sides:
//      open → focus landing → 3 in-drawer tabs (trap read) → Escape
import { execSync } from "node:child_process";
function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const txt = out.trim(); try { return JSON.parse(txt); } catch {} try { return JSON.parse(txt.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

// the focused-element read: identity + the computed focus recipe
const FOCUSED = `(() => {
  const el = document.activeElement;
  if (!el || el === document.body) return { stop: 'BODY' };
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return {
    tag: el.tagName,
    type: el.getAttribute('type'),
    name: el.getAttribute('name'),
    text: (el.textContent || '').trim().replace(/\\s+/g,' ').slice(0, 22),
    aria: el.getAttribute('aria-label'),
    href: el.getAttribute('href') ? String(el.getAttribute('href')).slice(0, 28) : null,
    outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor,
    shadow: cs.boxShadow, // FULL — never truncated (the r85 lesson)
    x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height)
  };
})()`;

async function tabWalk(session, label, stops) {
  const seq = [];
  for (let i = 0; i < stops; i++) {
    run(`agent-browser --session ${session} press Tab`);
    await new Promise(r => setTimeout(r, 260));
    const read = await evalOn(session, FOCUSED);
    seq.push(read);
    if (read && read.stop === "BODY" && i > 0) break; // wrapped past the end
  }
  console.log(`\n===== ${label} (${stops} stops) =====`);
  seq.forEach((s, i) => console.log(`  ${String(i + 1).padStart(2)}. ${JSON.stringify(s)}`));
  return seq;
}

// ---------- A. LOGIN tab walk (fresh sessions) ----------
for (const [session, base, side] of [["r85kbref", baseRef, "REF"], ["r85kbloc", baseLoc, "LOC"]]) {
  run(`agent-browser --session ${session} close 2>/dev/null; true`);
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
  await tabWalk(session, `A. LOGIN ${side} tab walk`, 12);
  run(`agent-browser --session ${session} close 2>/dev/null; true`);
}

// ---------- B. DASHBOARD tab walk (the standing authed sessions) ----------
async function auth(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3000));
  run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  await new Promise(r => setTimeout(r, 500));
  run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
  await new Promise(r => setTimeout(r, 500));
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const ref = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
  if (ref) run(`agent-browser --session ${session} click @${ref}`);
  await new Promise(r => setTimeout(r, 5000));
  return run(`agent-browser --session ${session} get url`).trim();
}
console.log("ref auth:", await auth("ref", baseRef));
console.log("loc auth:", await auth("loc", baseLoc));
for (const [session, base, side] of [["ref", baseRef, "REF"], ["loc", baseLoc, "LOC"]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 3500));
  await tabWalk(session, `B. DASHBOARD ${side} tab walk`, 15);
}

// ---------- C. DRAWER keyboard contract (390x844) ----------
const OPEN_DRAWER = `(() => { const btn = [...document.querySelectorAll('button')].find(b => (b.getAttribute('aria-label') || '') === 'Toggle Sidebar' || (b.textContent || '').includes('Toggle Sidebar')); if (!btn) return 'NOTRIGGER'; btn.click(); return 'opened'; })()`;
const DRAWER_STATE = `(() => { const dlg = document.querySelector('[role=dialog], [data-state=open]'); return { dialog: !!dlg, state: dlg ? dlg.getAttribute('data-state') : null, ariaModal: dlg ? dlg.getAttribute('aria-modal') : null }; })()`;

for (const [session, base, side] of [["ref", baseRef, "REF"], ["loc", baseLoc, "LOC"]]) {
  console.log(`\n===== C. DRAWER keyboard contract ${side} (390x844) =====`);
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 3200));
  const opened = await evalOn(session, OPEN_DRAWER);
  console.log(`  open: ${JSON.stringify(opened)}`);
  await new Promise(r => setTimeout(r, 900));
  const landing = await evalOn(session, FOCUSED);
  console.log(`  focus landing: ${JSON.stringify(landing)}`);
  for (let i = 1; i <= 3; i++) {
    run(`agent-browser --session ${session} press Tab`);
    await new Promise(r => setTimeout(r, 260));
    const t = await evalOn(session, FOCUSED);
    console.log(`  in-drawer tab ${i}: ${JSON.stringify(t)}`);
  }
  run(`agent-browser --session ${session} press Escape`);
  await new Promise(r => setTimeout(r, 800));
  const postEsc = await evalOn(session, DRAWER_STATE);
  console.log(`  after Escape: ${JSON.stringify(postEsc)}`);
  const postEscFocus = await evalOn(session, FOCUSED);
  console.log(`  post-Escape focus: ${JSON.stringify(postEscFocus)}`);
}

console.log("\nRECON COMPLETE");
process.exit(0);
