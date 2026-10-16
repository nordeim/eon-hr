#!/usr/bin/env node
// probe-r45-census-b10.mjs — phase B10: the signup view's label htmlFor /
// input id conventions + the reset form's button type + the view-swap
// state reset semantics (back from signup → sign-in intact).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 250) }; } }
const log = (...a) => console.log(...a);

run(`agent-browser --session ref open https://eon.base44.app/login`);
await new Promise(r => setTimeout(r, 3200));
await evalOn("ref", `(() => { const b = [...document.querySelectorAll('button')].find(x => /sign up/i.test(x.textContent||'')); if (!b) return 'NOBTN'; b.click(); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 900));
const S1 = await evalOn("ref", `(() => {
  return { labels: [...document.querySelectorAll('form label')].map(l => ({ for: l.getAttribute('for'), t: l.textContent.trim() })), inputs: [...document.querySelectorAll('form input')].map(i => ({ id: i.id, t: i.type, req: i.required })), ctaType: [...document.querySelectorAll('form button')].map(b => b.getAttribute('type')) };
})()`);
log("=== SIGNUP: labels/inputs/cta types ===");
log(JSON.stringify(S1, null, 1));

// the reset view's CTA type + the back button type
await evalOn("ref", `(() => { const b = [...document.querySelectorAll('button')].find(x => /back to sign in/i.test(x.textContent||'')); if (!b) return 'NOBTN'; b.click(); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 700));
await evalOn("ref", `(() => { const b = [...document.querySelectorAll('button')].find(x => /forgot password/i.test(x.textContent||'')); if (!b) return 'NOBTN'; b.click(); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 900));
const S2 = await evalOn("ref", `(() => {
  const btns = [...document.querySelectorAll('button')];
  return { allTypes: btns.map(b => ({ t: (b.textContent||'').trim().slice(0, 22), type: b.getAttribute('type') })) };
})()`);
log("\n=== RESET: all button types ===");
log(JSON.stringify(S2, null, 1));
