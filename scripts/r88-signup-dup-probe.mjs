#!/usr/bin/env node
// r88-signup-dup-probe.mjs — manual verification of the verify-r45 (6) DIFF:
// does the REF render ANY feedback on a duplicate-email signup? Reads the
// full card state (view, buttons, alerts, error texts) rather than only
// [role=alert], to distinguish a fill-timing miss from a REF-side behavior
// drift. Reads both sides for comparison.
import { execSync } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const t = out.trim(); try { return JSON.parse(t); } catch { try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } } }

async function probe(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3000));
  // go to signup view
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const ref = (snap.match(/- link "Sign up" \[ref=(\w+)\]/) || snap.match(/- link "Need an account\? Sign up" \[ref=(\w+)\]/) || snap.match(/- link "Sign up"[^\n]*\[ref=(\w+)\]/) || [])[1];
  if (ref) run(`agent-browser --session ${session} click @${ref}`);
  await new Promise(r => setTimeout(r, 1200));
  // fill the signup form
  run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  await new Promise(r => setTimeout(r, 400));
  run(`agent-browser --session ${session} fill 'input[type=password]' 'VerifyPass1!'`);
  await new Promise(r => setTimeout(r, 400));
  // the confirm field (3rd input) via the native setter
  await evalOn(session, `(() => { const i = [...document.querySelectorAll('form input')][2]; if(!i) return 'no-third-input'; const d = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; d.call(i, 'VerifyPass1!'); i.dispatchEvent(new Event('input', { bubbles: true })); return 'set'; })()`);
  await evalOn(session, `(() => { document.querySelector('form').requestSubmit(); return 'sent'; })()`);
  await new Promise(r => setTimeout(r, 4000));
  const read = await evalOn(session, `(() => {
    const card = document.querySelector('.rounded-2xl');
    const alerts = [...document.querySelectorAll('[role=alert]')].map(a => (a.textContent||'').trim().slice(0,60));
    const headings = [...document.querySelectorAll('h1,h2,h3')].map(h => (h.textContent||'').trim().slice(0,40));
    const reds = [...document.querySelectorAll('p,span,div')].filter(el => { const c = getComputedStyle(el).color; return c.includes('185, 28, 28') || c.includes('220, 38, 38'); }).map(el => (el.textContent||'').trim().slice(0,80)).filter(Boolean).slice(0,3);
    const buttons = [...document.querySelectorAll('button')].map(b => (b.textContent||'').trim()).filter(Boolean);
    return { url: location.href, cardH: card ? Math.round(card.getBoundingClientRect().height) : null, alerts, headings, reds, buttons: buttons.slice(0,8) };
  })()`);
  return read;
}

console.log("REF:", JSON.stringify(await probe("ref88dup", "https://eon.base44.app"), null, 1));
console.log("LOC:", JSON.stringify(await probe("loc88dup", "http://127.0.0.1:3200"), null, 1));
run('agent-browser --session ref88dup close 2>/dev/null; true');
run('agent-browser --session loc88dup close 2>/dev/null; true');
process.exit(0);
