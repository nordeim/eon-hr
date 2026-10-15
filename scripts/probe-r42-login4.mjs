#!/usr/bin/env node
// probe-r42-login4.mjs — social button class strings, or-divider recipe,
// and the SHIFT+TAB REVERSE WALK on the login + dashboard (the session-38
// named remainder: reverse focus walks were never read).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

// ---------- login: social + divider class strings ----------
for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
}
const socialCls = `(() => { const bs = [...document.querySelectorAll('button')].filter(b => /google|microsoft|apple/i.test(b.textContent||'')); return bs.map(b => ({ t:(b.textContent||'').trim().slice(0,10), cls:b.className })); })()`;
const dividerCls = `(() => { const chip = [...document.querySelectorAll('div,span')].filter(e => /^or$/i.test((e.textContent||'').trim()) && e.getBoundingClientRect().width > 0); const wrap = chip[0]?.parentElement; return { chipCls: chip[0]?.className || 'NONE', wrapCls: wrap?.className || 'NONE', wrapH: wrap ? Math.round(wrap.getBoundingClientRect().height) : null }; })()`;
for (const [name, expr] of [["social classes", socialCls], ["or-divider", dividerCls]]) {
  const ref = await evalOn("ref", expr), loc = await evalOn("loc", expr);
  const match = JSON.stringify(ref) === JSON.stringify(loc);
  console.log(`${match ? "MATCH" : "DIFF "} login ${name}`);
  console.log(`  ref: ${JSON.stringify(ref).slice(0, 600)}`);
  if (!match) console.log(`  loc: ${JSON.stringify(loc).slice(0, 600)}`);
}

// ---------- the Shift+Tab reverse walk on the login ----------
// instrument: focus the LAST tabbable (or the Sign in), then Shift+Tab ×5
const walkExpr = (n) => `(() => {
  const tabbables = [...document.querySelectorAll('a[href],button:not([disabled]),input,select,textarea')].filter(e => e.getBoundingClientRect().width > 0);
  const start = [...document.querySelectorAll('button')].find(b => (b.textContent||'').trim() === 'Sign in') || tabbables[tabbables.length-1];
  start.focus();
  const seq = [];
  for (let i = 0; i < ${n}; i++) { document.dispatchEvent(new KeyboardEvent('keydown', {key:'Tab', shiftKey:true, bubbles:true})); }
  return { start: start.tagName + ':' + (start.textContent||'').trim().slice(0,12), count: tabbables.length };
})()`;
console.log("\n--- login Shift+Tab via agent-browser press (real keys) ---");
// synthetic keydown does not move focus — use agent-browser press (real CDP).
// Walk on both apps: focus Sign in via script, then press Shift+Tab x4, reading activeElement each time.
async function walkLogin(session) {
  await evalOn(session, `(() => { const b = [...document.querySelectorAll('button')].find(x => (x.textContent||'').trim() === 'Sign in'); b.focus(); return document.activeElement?.textContent?.trim().slice(0,14); })()`);
  const seq = [];
  for (let i = 0; i < 4; i++) {
    run(`agent-browser --session ${session} press Shift+Tab`);
    await new Promise(r => setTimeout(r, 250));
    const el = await evalOn(session, `(() => { const a = document.activeElement; if (!a || a === document.body) return 'BODY'; return a.tagName + ':' + (a.textContent || a.placeholder || a.getAttribute('aria-label') || '').trim().slice(0,16); })()`);
    seq.push(typeof el === "string" ? el : JSON.stringify(el));
  }
  return seq;
}
const refWalk = await walkLogin("ref");
const locWalk = await walkLogin("loc");
console.log(`[ref] login Shift+Tab walk: ${JSON.stringify(refWalk)}`);
console.log(`[loc] login Shift+Tab walk: ${JSON.stringify(locWalk)}`);
console.log(refWalk.join("|") === locWalk.join("|") ? "MATCH login reverse walk" : "DIFF login reverse walk");

// ---------- the Shift+Tab reverse walk on the dashboard (from the footer backwards) ----------
for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 4000));
}
async function walkDash(session) {
  // focus the last footer control (عربي) via script, then Shift+Tab x6
  await evalOn(session, `(() => { const btns = [...document.querySelectorAll('button')]; const ar = btns.find(b => (b.textContent||'').includes('عربي')); (ar || btns[btns.length-1]).focus(); return 'armed'; })()`);
  const seq = [];
  for (let i = 0; i < 6; i++) {
    run(`agent-browser --session ${session} press Shift+Tab`);
    await new Promise(r => setTimeout(r, 250));
    const el = await evalOn(session, `(() => { const a = document.activeElement; if (!a || a === document.body) return 'BODY'; const t = (a.textContent || a.getAttribute('aria-label') || '').trim().slice(0,16); return a.tagName + ':' + t; })()`);
    seq.push(typeof el === "string" ? el : JSON.stringify(el));
  }
  return seq;
}
const refDash = await walkDash("ref");
const locDash = await walkDash("loc");
console.log(`\n[ref] dashboard reverse walk: ${JSON.stringify(refDash)}`);
console.log(`[loc] dashboard reverse walk: ${JSON.stringify(locDash)}`);
console.log(refDash.join("|") === locDash.join("|") ? "MATCH dashboard reverse walk" : "DIFF dashboard reverse walk");
