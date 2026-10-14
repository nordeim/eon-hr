#!/usr/bin/env node
// probe-r40-toaster.mjs — the toaster interior (the standing frontier:
// unfireable on zero-data REF) — attempted via the login error path
// (wrong password → REF's error toast, if any). Budget: 1 attempt.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 500) }; } }

const baseRef = "https://eon.base44.app";
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session ref open ${baseRef}/login`);
await new Promise(r => setTimeout(r, 3000));

// fill a wrong password and submit
await evalOn("ref", `(() => { const e = document.querySelector('input[type=email]'); const p = document.querySelector('input[type=password]'); const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(e, 'sepnetflix2023@outlook.com'); e.dispatchEvent(new Event('input', { bubbles: true })); setter.call(p, 'WrongPassword123!'); p.dispatchEvent(new Event('input', { bubbles: true })); return 'filled'; })()`);
await new Promise(r => setTimeout(r, 500));
await evalOn("ref", `(() => { const sign = [...document.querySelectorAll('button')].find(b => /^sign in$/i.test((b.textContent||'').trim())); sign.click(); return 'submitted'; })()`);
await new Promise(r => setTimeout(r, 4000));

// observe: any toast/sonner/role=status nodes + the page state
const toast = await evalOn("ref", `(() => {
  const toasts = [...document.querySelectorAll('[data-sonner-toast], [role=status], [role=alert], .toast, [data-radix-popper-content-wrapper], ol[data-sonner-toaster] li')];
  const errs = [...document.querySelectorAll('p, div, span')].filter(e => /invalid|wrong|error|incorrect|failed/i.test(e.textContent||'') && e.children.length === 0 && e.getBoundingClientRect().height > 0 && e.getBoundingClientRect().height < 60).slice(0, 4);
  return { toastCount: toasts.length, toasts: toasts.slice(0, 3).map(t => ({ tag: t.tagName, cls: (t.className||'').toString().slice(0, 150), t: (t.textContent||'').trim().slice(0, 80), dataAttrs: Object.fromEntries([...t.attributes].filter(a => a.name.startsWith('data-')).map(a => [a.name, a.value.slice(0, 30)])) })), inlineErrs: errs.map(e => ({ t: e.textContent.trim().slice(0, 60), cls: (e.className||'').toString().slice(0, 100) })), path: location.pathname };
})()`);
console.log("LOGIN-ERROR STATE:", JSON.stringify(toast, null, 1));
