#!/usr/bin/env node
// probe-r38-loginmobile.mjs — the login page at 390x844 (never probed below
// 1440 before) + the social-button icon geometry + hover motion.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); return out.trim(); }

const MOBILE = `(() => {
  const rect = (el) => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
  const cs = (el) => { const s = getComputedStyle(el); return { font: s.fontSize + "/" + s.lineHeight, h: s.height }; };
  const email = document.querySelector('input[type=email], input[name=email]');
  const pass = document.querySelector('input[type=password]');
  const btns = Array.from(document.querySelectorAll('button'));
  const signin = btns.find(b => b.textContent.trim() === 'Sign in');
  const google = btns.find(b => b.textContent.includes('Google'));
  const h1 = document.querySelector('h1');
  const card = document.querySelector('.rounded-2xl') || document.querySelector('[class*=rounded-2xl]');
  const ph = email ? getComputedStyle(email, '::placeholder').color : null;
  return JSON.stringify({
    vw: window.innerWidth + 'x' + window.innerHeight,
    h1: { rect: rect(h1), font: getComputedStyle(h1).fontSize },
    email: { rect: rect(email), font: getComputedStyle(email).fontSize, phColor: ph },
    pass: { rect: rect(pass) },
    signin: { rect: rect(signin), font: getComputedStyle(signin).fontSize },
    google: { rect: rect(google) },
    card: card ? { rect: rect(card), pad: getComputedStyle(card).padding } : null,
    bodyScrollH: document.body.scrollHeight,
  });
})()`;

const ICONS = `(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const google = btns.find(b => b.textContent.includes('Google'));
  const svg = google.querySelector('svg');
  const svgR = svg.getBoundingClientRect();
  const textNode = Array.from(google.childNodes).find(n => n.nodeType === 3 && n.textContent.trim()) || Array.from(google.querySelectorAll('span')).find(s => s.textContent.trim());
  const wrapper = svg.parentElement;
  const wr = wrapper.getBoundingClientRect();
  const range = document.createRange();
  let textRect = null;
  if (textNode && textNode.nodeType === 3) { range.selectNodeContents(textNode); textRect = range.getBoundingClientRect(); }
  else if (textNode) { textRect = textNode.getBoundingClientRect(); }
  const s = getComputedStyle(svg);
  const ws = getComputedStyle(wrapper);
  return JSON.stringify({
    svg: { x: Math.round(svgR.x), y: Math.round(svgR.y), w: Math.round(svgR.width), h: Math.round(svgR.height), transform: s.transform, transition: s.transitionProperty + ' ' + s.transitionDuration },
    wrapper: { tag: wrapper.tagName, x: Math.round(wr.x), w: Math.round(wr.width), ml: ws.marginLeft, transform: ws.transform, transition: ws.transitionProperty + ' ' + ws.transitionDuration },
    text: textRect ? { x: Math.round(textRect.x), w: Math.round(textRect.width) } : null,
    gapIconToText: textRect ? Math.round(textRect.x - (svgR.x + svgR.width)) : null,
  });
})()`;

async function probe(name, session, url) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open "${url}"`);
  await new Promise(r => setTimeout(r, 3500));
  console.log(`\n===== ${name} MOBILE 390x844 =====`);
  console.log(await evalOn(session, MOBILE));
  // icon geometry needs desktop viewport? no — measure here too (mobile)
  console.log(`${name} ICON-GEOM: ` + await evalOn(session, ICONS));
}

await probe("REF", "ref2", "https://eon.base44.app/login");
await probe("LOC", "loc2", "http://127.0.0.1:3200/login");
