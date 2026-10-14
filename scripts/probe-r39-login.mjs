#!/usr/bin/env node
// probe-r39-login.mjs — session-40 / parity round 39 login re-audit:
// REF's login JS chunk redeployed twice since round 38 (BYE5Ojxh → Cqb_n9sO
// → BIuE7r17). Re-measure the social-button contract (type=submit drop),
// the theme-inert behavior, and the input recipes at desktop + mobile.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

// 1. social buttons: type attr + recipes
const SOCIAL = `(() => {
  const btns = [...document.querySelectorAll('button')].filter(b => /google|microsoft|apple/i.test(b.textContent || ''));
  return btns.map(b => {
    const r = b.getBoundingClientRect();
    return { type: b.getAttribute('type'), x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height), cls: (b.className || '').slice(0, 180) };
  });
})()`;

// 2. form: does the form still exist / what are its submit members?
const FORM = `(() => {
  const f = document.querySelector('form');
  if (!f) return { found: false };
  const members = [...f.querySelectorAll('button')].map(b => ({ type: b.getAttribute('type'), t: (b.textContent || '').trim().slice(0, 24) }));
  return { found: true, cls: f.className, members };
})()`;

// 3. inputs: full class strings
const INPUTS = `(() => {
  return [...document.querySelectorAll('input')].map(i => {
    const r = i.getBoundingClientRect();
    return { type: i.type, h: Math.round(r.height), cls: (i.className || '').slice(0, 220) };
  });
})()`;

// 4. links row + divider quick geometry
const LINKS = `(() => {
  const links = [...document.querySelectorAll('a')].map(a => { const r = a.getBoundingClientRect(); return { t: (a.textContent || '').trim().slice(0, 20), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; });
  return links;
})()`;

for (const [label, session, base] of [["REF", "ref", baseRef], ["LOC", "loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3000));
  const social = await evalOn(session, SOCIAL);
  const form = await evalOn(session, FORM);
  const inputs = await evalOn(session, INPUTS);
  const links = await evalOn(session, LINKS);
  console.log(`=== ${label} DESKTOP ===`);
  console.log(`social: ${JSON.stringify(social)}`);
  console.log(`form:   ${JSON.stringify(form)}`);
  console.log(`inputs: ${JSON.stringify(inputs)}`);
  console.log(`links:  ${JSON.stringify(links)}`);
}
