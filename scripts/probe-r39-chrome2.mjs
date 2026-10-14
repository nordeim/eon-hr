#!/usr/bin/env node
// probe-r39-chrome2.mjs — the missing chrome pieces: toggle full recipe,
// --sidebar-width computed source, bottom nav (specific), header brand.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 500) }; } }

const baseRef = "https://eon.base44.app";

// desktop: --sidebar-width computed source
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session ref open ${baseRef}/dashboard`);
await new Promise(r => setTimeout(r, 3500));
const wv = await evalOn("ref", `(() => { const w = [...document.querySelectorAll('div')].find(d => d.classList.contains('peer') && d.classList.contains('group')); const sp = w.children[0]; const gp = w.parentElement.parentElement; return { spacerComputed: getComputedStyle(sp).getPropertyValue('--sidebar-width'), wrapperComputed: getComputedStyle(w).getPropertyValue('--sidebar-width'), gpTag: gp.tagName, gpCls: gp.className.slice(0, 100), gpComputed: getComputedStyle(gp).getPropertyValue('--sidebar-width'), gpStyle: gp.getAttribute('style'), bodyComputed: getComputedStyle(document.body).getPropertyValue('--sidebar-width'), spacerW: getComputedStyle(sp).width }; })()`);
console.log("widthVar:", JSON.stringify(wv));

// mobile: toggle + bottom nav + header brand block
run(`agent-browser --session ref set viewport 390 844`);
run(`agent-browser --session ref open ${baseRef}/dashboard`);
await new Promise(r => setTimeout(r, 3500));
const toggle = await evalOn("ref", `(() => { const btn = [...document.querySelectorAll('button')].find(b => b.getAttribute('data-sidebar') === 'trigger'); if (!btn) return null; return { cls: btn.className, type: btn.getAttribute('type'), inner: btn.innerHTML.slice(0, 420) }; })()`);
console.log("toggle:", JSON.stringify(toggle));

const bnav = await evalOn("ref", `(() => { const bns = [...document.querySelectorAll('body *')].filter(e => { const cs = getComputedStyle(e); return cs.position === 'fixed' && cs.bottom === '0px' && e.getBoundingClientRect().y > 700; }); const bn = bns.find(e => e.querySelectorAll('a').length >= 3) || bns[0]; if (!bn) return { count: bns.length }; const inner = bn.firstElementChild; return { tag: bn.tagName, cls: bn.className, innerTag: inner.tagName, innerCls: inner.className, firstTab: inner.firstElementChild ? { tag: inner.firstElementChild.tagName, cls: inner.firstElementChild.className.slice(0, 200) } : null }; })()`);
console.log("bottomNav:", JSON.stringify(bnav));

const hbrand = await evalOn("ref", `(() => { const h = document.querySelector('header'); const kids = [...h.firstElementChild.children].map(c => ({ tag: c.tagName, cls: c.className.slice(0, 140), text: (c.textContent || '').slice(0, 30) })); return { rowCls: h.firstElementChild.className, kids }; })()`);
console.log("headerBrand:", JSON.stringify(hbrand));
