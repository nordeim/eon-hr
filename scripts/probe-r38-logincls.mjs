#!/usr/bin/env node
// probe-r38-logincls.mjs — read REF + LOC login element classNames precisely
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); return out.trim(); }

const READ = `(() => {
  const email = document.querySelector('input[type=email], input[name=email]');
  const pass = document.querySelector('input[type=password]');
  const btns = Array.from(document.querySelectorAll('button'));
  const signin = btns.find(b => b.textContent.trim() === 'Sign in');
  const google = btns.find(b => b.textContent.includes('Google'));
  const label = email ? email.closest('div').parentElement.querySelector('label, Label') : null;
  const h1 = document.querySelector('h1');
  const readEl = (el) => el ? { cls: el.getAttribute('class'), tag: el.tagName, style: el.getAttribute('style') } : null;
  const cs = (el) => { if (!el) return null; const s = getComputedStyle(el); return { shadow: s.boxShadow, color: s.color, pad: s.padding, textAlign: s.textAlign, display: s.display }; };
  return JSON.stringify({
    email: { ...readEl(email), cs: cs(email), ac: email ? email.getAttribute('autocomplete') : null, parentCls: email ? email.parentElement.getAttribute('class') : null, labelCls: label ? label.getAttribute('class') : null },
    pass: { ...readEl(pass), cs: cs(pass), ac: pass ? pass.getAttribute('autocomplete') : null },
    signin: { ...readEl(signin), cs: cs(signin), type: signin ? signin.type : null, parentCls: signin ? signin.parentElement.getAttribute('class') : null, inner: signin ? signin.innerHTML.slice(0, 250) : null },
    google: { ...readEl(google), cs: cs(google), type: google ? google.type : null, inner: google ? google.innerHTML.slice(0, 300) : null },
    h1: { ...readEl(h1), cs: cs(h1) },
  });
})()`;

for (const [name, session, url] of [["REF", "ref2", "https://eon.base44.app/login"], ["LOC", "loc2", "http://127.0.0.1:3200/login"]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open "${url}"`);
  await new Promise(r => setTimeout(r, 3000));
  console.log(`\n========== ${name} ==========`);
  const out = await evalOn(session, READ);
  try {
    const obj = JSON.parse(out.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " "));
    console.log(JSON.stringify(obj, null, 1));
  } catch { console.log(out); }
}
