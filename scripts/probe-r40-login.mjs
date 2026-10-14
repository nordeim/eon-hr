#!/usr/bin/env node
// probe-r40-login.mjs — session-41 / parity round 40: the login re-audit
// after the 4th consecutive login-scoped redeploy (JS BIuE7r17→C-ulo5ek AND
// CSS D0Q6-tUz→BIWjBcok — the first CSS change since round 35). Full recipe
// re-read on both apps: fonts, inputs, social buttons, sign-in, links row,
// divider, logo, title, card palette/geometry, theme-inert.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 400) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

// full desktop read
const LOGIN_DESKTOP = `(() => {
  const main = document.querySelector('main');
  const card = [...document.querySelectorAll('div')].find(d => /rounded-2xl|rounded-3xl/.test(d.className) && d.querySelector('input[type=email]'));
  const email = document.querySelector('input[type=email]');
  const pw = document.querySelector('input[type=password]');
  const sign = [...document.querySelectorAll('button')].find(b => /^sign in$/i.test((b.textContent||'').trim()));
  const socials = [...document.querySelectorAll('button')].filter(b => /google|microsoft|apple/i.test(b.textContent || ''));
  const h1 = document.querySelector('h1');
  const body = getComputedStyle(document.body);
  const emailCs = email ? getComputedStyle(email) : null;
  const cardCs = card ? getComputedStyle(card) : null;
  return {
    path: location.pathname,
    bodyFont: body.fontFamily.slice(0, 90),
    bodyBg: body.backgroundColor,
    docFont: getComputedStyle(document.documentElement).fontFamily.slice(0, 90),
    main: main ? { tag: main.tagName, cls: main.className.slice(0, 200) } : null,
    card: card ? { cls: card.className.slice(0, 220), x: Math.round(card.getBoundingClientRect().x), y: Math.round(card.getBoundingClientRect().y), w: Math.round(card.getBoundingClientRect().width), h: Math.round(card.getBoundingClientRect().height), bg: cardCs.backgroundColor, color: cardCs.color, font: cardCs.fontFamily.slice(0, 80), radius: cardCs.borderRadius, shadow: cardCs.boxShadow.slice(0, 90) } : null,
    h1: h1 ? { t: h1.textContent.slice(0, 40), cls: h1.className.slice(0, 140), font: getComputedStyle(h1).fontFamily.slice(0, 80), size: getComputedStyle(h1).fontSize, w: Math.round(h1.getBoundingClientRect().width) } : null,
    email: email ? { cls: email.className.slice(0, 260), h: Math.round(email.getBoundingClientRect().height), font: emailCs.fontFamily.slice(0, 80), size: emailCs.fontSize, bg: emailCs.backgroundColor, color: emailCs.color, phColor: emailCs.getPropertyValue('--tw-placeholder-color') || 'n/a', shadow: emailCs.boxShadow.slice(0, 80), autocomplete: email.getAttribute('autocomplete') } : null,
    pw: pw ? { cls: pw.className.slice(0, 120), h: Math.round(pw.getBoundingClientRect().height), size: getComputedStyle(pw).fontSize } : null,
    signIn: sign ? { tag: sign.tagName, type: sign.getAttribute('type'), cls: sign.className.slice(0, 260), h: Math.round(sign.getBoundingClientRect().height), font: getComputedStyle(sign).fontFamily.slice(0, 80), size: getComputedStyle(sign).fontSize, bg: getComputedStyle(sign).backgroundColor } : null,
    socials: socials.map(b => { const r = b.getBoundingClientRect(); const ic = b.querySelector('div[class*=ml-], svg'); return { type: b.getAttribute('type'), cls: b.className.slice(0, 200), t: (b.textContent||'').trim().slice(0, 24), h: Math.round(r.height), size: getComputedStyle(b).fontSize, font: getComputedStyle(b).fontFamily.slice(0, 70), iconML: ic ? getComputedStyle(ic).marginLeft : null }; }),
    socialCount: socials.length,
    docH: document.documentElement.scrollHeight
  };
})()`;

// links row + or-divider + logo + title sub + spacer (desktop too)
const LOGIN_EXTRAS = `(() => {
  const links = [...document.querySelectorAll('a, button')].filter(e => /forgot|sign up/i.test(e.textContent || '') && e.getBoundingClientRect().height > 0);
  const orChip = [...document.querySelectorAll('div, span, p')].find(e => /^(or)$/i.test((e.textContent||'').trim()) && e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().width < 80);
  const logo = document.querySelector('img[alt*="logo" i]');
  const logoWrap = logo ? logo.closest('div[class*=group], div[class*=relative]') : null;
  const sub = [...document.querySelectorAll('p')].find(p => /hr|management|platform/i.test(p.textContent||'') && p.getBoundingClientRect().width > 0);
  const spacer = [...document.querySelectorAll('div')].find(d => /sm:hidden/.test(d.className) && d.querySelector('p') && (d.querySelector('p').textContent||'').match(/^\\s*$/));
  return {
    links: links.map(e => { const r = e.getBoundingClientRect(); return { tag: e.tagName, t: (e.textContent||'').trim().slice(0, 26), cls: e.className.slice(0, 160), w: Math.round(r.width), h: Math.round(r.height) }; }),
    linksRow: links.length >= 2 ? { cls: links[0].parentElement.className.slice(0, 160), w: Math.round(links[0].parentElement.getBoundingClientRect().width) } : null,
    orChip: orChip ? { tag: orChip.tagName, cls: orChip.className.slice(0, 160), color: getComputedStyle(orChip).color } : null,
    logo: logo ? { alt: logo.getAttribute('alt'), w: Math.round(logo.getBoundingClientRect().width), h: Math.round(logo.getBoundingClientRect().height), wrapCls: logoWrap ? logoWrap.className.slice(0, 180) : null, src: (logo.getAttribute('src')||'').slice(0, 90) } : null,
    sub: sub ? { t: sub.textContent.slice(0, 60), cls: sub.className.slice(0, 140), size: getComputedStyle(sub).fontSize, color: getComputedStyle(sub).color } : null,
    spacer: spacer ? { cls: spacer.className.slice(0, 120) } : null
  };
})()`;

for (const [label, session, base] of [["REF", "ref", baseRef], ["LOC", "loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  // fresh unauthenticated state: clear storage, land on /login
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3000));
  const d = await evalOn(session, LOGIN_DESKTOP);
  const x = await evalOn(session, LOGIN_EXTRAS);
  console.log(`\n===== ${label} LOGIN DESKTOP =====`);
  console.log(JSON.stringify(d, null, 1).slice(0, 4200));
  console.log(`----- ${label} EXTRAS -----`);
  console.log(JSON.stringify(x, null, 1).slice(0, 2200));
}
