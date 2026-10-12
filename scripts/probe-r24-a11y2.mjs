#!/usr/bin/env node
// probe-r24-a11y2.mjs — element-level dumps of the divergent a11y families:
// aria-controls / aria-expanded / aria-haspopup on REF; the img+alt census;
// unnamed buttons on REF; LOC's progressbar + aria-current carriers.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const DUMP = `(() => {
  const out = { controls: [], expanded: [], haspopup: [], imgs: [], noNameBtns: [], progress: [], current: [], hiddenSample: [] };
  for (const el of document.querySelectorAll('body *')) {
    if (el.offsetParent === null && !el.closest('[role=dialog]')) continue;
    const tag = el.tagName.toLowerCase();
    const txt = (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 22);
    const id = el.id ? '#' + el.id.slice(0, 20) : '';
    const ctrl = el.getAttribute('aria-controls');
    if (ctrl) out.controls.push({ tag, txt, ctrl: ctrl.slice(0, 24), exp: el.getAttribute('aria-expanded') });
    else if (el.getAttribute('aria-expanded') !== null) out.expanded.push({ tag, txt, exp: el.getAttribute('aria-expanded') });
    if (el.getAttribute('aria-haspopup')) out.haspopup.push({ tag, txt, hp: el.getAttribute('aria-haspopup') });
    if (tag === 'img') out.imgs.push({ alt: (el.getAttribute('alt') || '').slice(0, 30), src: (el.getAttribute('src') || '').slice(0, 50) });
    if (tag === 'button' && !(el.getAttribute('aria-label') || el.textContent.trim() || el.getAttribute('title'))) out.noNameBtns.push({ txt: el.innerHTML.slice(0, 40).replace(/\\s+/g, ' ') });
    if (el.getAttribute('role') === 'progressbar') out.progress.push({ txt, now: el.getAttribute('aria-valuenow') });
    if (el.getAttribute('aria-current')) out.current.push({ tag, txt, cur: el.getAttribute('aria-current') });
  }
  out.hiddenSample = [...document.querySelectorAll('[aria-hidden=true]')].slice(0, 6).map(e => e.tagName.toLowerCase() + '.' + (e.getAttribute('class') || '').split(' ').slice(0, 2).join('.'));
  return JSON.stringify(out);
})()`;

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
for (const route of ["/dashboard", "/employees"]) {
  for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
    run(`agent-browser --session ${s} open "${base}${route}"`);
    await new Promise(r => setTimeout(r, 3000));
    const d = await evalOn(s, DUMP);
    if (d.error) { console.log(`${s} ${route} ERR`); continue; }
    console.log(`\n########## ${s.toUpperCase()} ${route} ##########`);
    console.log("CONTROLS+EXP:", JSON.stringify((d.controls || []).slice(0, 14)));
    console.log("EXP-only:", JSON.stringify((d.expanded || []).slice(0, 8)));
    console.log("HASPOPUP:", JSON.stringify((d.haspopup || []).slice(0, 8)));
    console.log("IMGS:", JSON.stringify((d.imgs || []).slice(0, 6)));
    console.log("NO-NAME BTNS:", JSON.stringify((d.noNameBtns || []).slice(0, 6)));
    console.log("PROGRESS:", JSON.stringify(d.progress || []));
    console.log("CURRENT:", JSON.stringify((d.current || []).slice(0, 6)));
    console.log("HIDDEN sample:", JSON.stringify(d.hiddenSample || []));
  }
}
