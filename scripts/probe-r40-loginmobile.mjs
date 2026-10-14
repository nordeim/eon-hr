#!/usr/bin/env node
// probe-r40-loginmobile.mjs — the login at 390x844 after the redeploy:
// the responsive recipes (input h=44, links stacked, spacer scroll, card
// y=16, icon x positions, 16px fonts).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 500) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

const MOBILE = `(() => {
  const email = document.querySelector('input[type=email]');
  const pw = document.querySelector('input[type=password]');
  const sign = [...document.querySelectorAll('button')].find(b => /^sign in$/i.test((b.textContent||'').trim()));
  const card = email.closest('div[class*=rounded-2xl]');
  const links = [...document.querySelectorAll('button')].filter(e => /forgot|sign up/i.test(e.textContent || ''));
  const socials = [...document.querySelectorAll('button')].filter(b => /google|microsoft|apple/i.test(b.textContent || ''));
  const spacer = [...document.querySelectorAll('div')].find(d => /sm:hidden/.test(d.className) && d.querySelector('p'));
  const icons = socials.map(b => { const ic = b.querySelector('div'); const r = ic ? ic.getBoundingClientRect() : null; return r ? Math.round(r.x) : null; });
  return {
    vw: document.documentElement.clientWidth,
    emailH: Math.round(email.getBoundingClientRect().height),
    emailFont: getComputedStyle(email).fontSize,
    pwH: Math.round(pw.getBoundingClientRect().height),
    signH: Math.round(sign.getBoundingClientRect().height),
    signFont: getComputedStyle(sign).fontSize,
    socialH: Math.round(socials[0].getBoundingClientRect().height),
    socialFont: getComputedStyle(socials[0]).fontSize,
    card: { x: Math.round(card.getBoundingClientRect().x), y: Math.round(card.getBoundingClientRect().y), w: Math.round(card.getBoundingClientRect().width) },
    links: links.map(e => { const r = e.getBoundingClientRect(); return { y: Math.round(r.y), h: Math.round(r.height), w: Math.round(r.width), wrapped: r.height > 24 }; }),
    icons,
    spacerH: spacer ? Math.round(spacer.getBoundingClientRect().height) : null,
    docH: document.documentElement.scrollHeight,
    bodyBg: getComputedStyle(document.body).backgroundColor
  };
})()`;

for (const [label, session, base] of [["REF", "ref", baseRef], ["LOC", "loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3000));
  console.log(`\n===== ${label} LOGIN MOBILE =====`);
  console.log(JSON.stringify(await evalOn(session, MOBILE), null, 1));
}
