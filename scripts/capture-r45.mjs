#!/usr/bin/env node
// capture-r45.mjs — session-46 / parity round 45 screenshots (176-179):
// the hidden login flows evidence — the password-reset view (the back
// button + the title group + the sibling input), the reset-success view
// (the icon circle + the green Alert + the email span), the signup view
// with the duplicate-email error, and the mobile band of both views.
// REF + LOC pairs.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const raw = out.trim(); try { return JSON.parse(raw); } catch { return raw; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const OUT = "/home/z/my-project/eon-hr/docs/screenshots";

async function openLogin(session, base, vp = [1440, 900]) {
  run(`agent-browser --session ${session} set viewport ${vp[0]} ${vp[1]}`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
}
const shot = (session, name) => run(`agent-browser --session ${session} screenshot "${OUT}/${name}.png"`);
const evalSet = (session, sel, val) => evalOn(session, `(() => { const i = document.querySelector('${sel}'); const d = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; d.call(i, '${val}'); i.dispatchEvent(new Event('input', { bubbles: true })); return 'set'; })()`);
const clickBtn = (session, re) => evalOn(session, `(() => { const b = [...document.querySelectorAll('button')].find(x => /${re}/i.test(x.textContent||'')); if (!b) return 'NOTFOUND'; b.click(); return 'ok'; })()`);

// ---------- 176: the password-reset view ----------
for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  await openLogin(session, base);
  await clickBtn(session, "forgot password");
  await new Promise(r => setTimeout(r, 1000));
  await shot(session, session === "ref" ? "176-ref-reset-view" : "176b-loc-reset-view");
}

// ---------- 177: the reset-success view (the icon circle + green Alert) ----------
for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  await openLogin(session, base);
  await clickBtn(session, "forgot password");
  await new Promise(r => setTimeout(r, 900));
  await evalSet(session, "form input[type=email]", "capture-r45@example.com");
  await evalOn(session, `(() => { document.querySelector('form').requestSubmit(); return 'sent'; })()`);
  await new Promise(r => setTimeout(r, 2800));
  await shot(session, session === "ref" ? "177-ref-reset-success" : "177b-loc-reset-success");
}

// ---------- 178: the signup view + the duplicate-email error ----------
for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  await openLogin(session, base);
  await clickBtn(session, "sign up");
  await new Promise(r => setTimeout(r, 900));
  await evalSet(session, "form input[type=email]", "sepnetflix2023@outlook.com");
  await evalSet(session, "form input[type=password]", "CapturePass1!");
  await evalOn(session, `(() => { const i = [...document.querySelectorAll('form input')][2]; const d = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; d.call(i, 'CapturePass1!'); i.dispatchEvent(new Event('input', { bubbles: true })); return 'set'; })()`);
  await evalOn(session, `(() => { document.querySelector('form').requestSubmit(); return 'sent'; })()`);
  await new Promise(r => setTimeout(r, 3200));
  await shot(session, session === "ref" ? "178-ref-signup-duplicate-error" : "178b-loc-signup-duplicate-error");
}

// ---------- 179: the mobile band (the reset + signup views at 390) ----------
for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  await openLogin(session, base, [390, 844]);
  await clickBtn(session, "forgot password");
  await new Promise(r => setTimeout(r, 1000));
  await shot(session, session === "ref" ? "179-ref-reset-mobile" : "179b-loc-reset-mobile");
  await clickBtn(session, "back to sign in");
  await new Promise(r => setTimeout(r, 700));
  await clickBtn(session, "sign up");
  await new Promise(r => setTimeout(r, 1000));
  await shot(session, session === "ref" ? "179-ref-signup-mobile" : "179b-loc-signup-mobile");
}

console.log("captures done — 176-179 (10 PNG)");
