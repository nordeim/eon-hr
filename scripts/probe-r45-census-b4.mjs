#!/usr/bin/env node
// probe-r45-census-b4.mjs — phase B4: the structural reads that B3 left
// open — the signup form's inputs + wrapper classes, both views' wrapper
// classes, the reset wrapper/icon details (B3's parse-safe re-read).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 250) }; } }
const log = (...a) => console.log(...a);

async function openSignup() {
  run(`agent-browser --session ref set viewport 1440 900`);
  run(`agent-browser --session ref open https://eon.base44.app/login`);
  await new Promise(r => setTimeout(r, 3200));
  await evalOn("ref", `(() => { const b = [...document.querySelectorAll('button')].find(x => /sign up/i.test(x.textContent||'')); b.click(); return 'ok'; })()`);
  await new Promise(r => setTimeout(r, 900));
}
await openSignup();

// ---------- the signup form's FULL child structure ----------
const S1 = `(() => {
  const card = document.querySelector('.rounded-2xl');
  const view = card.querySelector('.w-full > div');
  const form = card.querySelector('form');
  const dump = (n, d) => { const r = n.getBoundingClientRect(); return { d, tag: n.tagName, cls: (n.getAttribute('class')||'').slice(0, 140), y: Math.round(r.y - card.getBoundingClientRect().y), h: Math.round(r.height), txt: (n.children.length === 0 ? (n.textContent||'').trim().slice(0, 40) : ''), kids: d < 4 ? [...n.children].map(c => dump(c, d + 1)) : null }; };
  return { viewCls: view.getAttribute('class'), formKids: [...form.children].map(c => dump(c, 1)) };
})()`;
log("=== SIGNUP: view wrapper + form children (recursive) ===");
log(JSON.stringify(await evalOn("ref", S1), null, 1).slice(0, 6000));

// ---------- the signup inputs directly ----------
const S2 = `(() => {
  const card = document.querySelector('.rounded-2xl');
  const ins = [...card.querySelectorAll('input')];
  return ins.map(i => { const r = i.getBoundingClientRect(); return { type: i.type, ph: i.getAttribute('placeholder'), ac: i.getAttribute('autocomplete'), cls: i.className.slice(0, 260), y: Math.round(r.y - card.getBoundingClientRect().y), h: Math.round(r.height) }; });
})()`;
log("\n=== SIGNUP: inputs ===");
log(JSON.stringify(await evalOn("ref", S2), null, 1).slice(0, 3000));
