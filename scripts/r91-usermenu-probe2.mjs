#!/usr/bin/env node
// r91-usermenu-probe2.mjs — deeper: click the user trigger in the open drawer,
// wait, dump every [data-state=open] element + portals.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const side = process.argv[2] || "ref";
const base = side === "ref" ? "https://eon.base44.app" : "http://127.0.0.1:3200";
const session = side === "ref" ? "ref" : "loc";
run(`agent-browser --session ${session} set viewport 390 844`);
run(`agent-browser --session ${session} open ${base}/dashboard`);
await new Promise(r => setTimeout(r, 6000));
await evalOn(session, `(() => {
  const toggle = [...document.querySelectorAll('button')].find(b => /toggle sidebar/i.test(b.textContent));
  if (toggle) toggle.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  return true;
})()`);
await new Promise(r => setTimeout(r, 1800));
const clicked = await evalOn(session, `(() => {
  const btns = [...document.querySelectorAll('button')];
  const t = btns.find(b => /sepnetflix2023/i.test(b.textContent));
  if (!t) return { found: false };
  const r = t.getBoundingClientRect();
  t.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: r.x + 10, clientY: r.y + 10 }));
  return { found: true, rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, cls: (t.getAttribute('class')||'').slice(0,150) };
})()`);
console.log("user trigger click:", JSON.stringify(clicked));
await new Promise(r => setTimeout(r, 2500));
const dump = await evalOn(session, `(() => {
  const r = (el) => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
  const open = [...document.querySelectorAll('[data-state=open]')].map(e => ({ tag: e.tagName, role: e.getAttribute('role'), cls: (e.getAttribute('class')||'').slice(0,160), rect: r(e), text: e.textContent.trim().slice(0,80) }));
  const bodyLast = [...document.body.children].slice(-6).map(e => ({ tag: e.tagName, id: e.id, cls: (e.getAttribute('class')||'').slice(0,100), textLen: e.textContent.length, rect: r(e) }));
  return { open, bodyLast };
})()`);
console.log("OPEN ELEMENTS:", JSON.stringify(dump, null, 1).slice(0, 2200));
process.exit(0);
