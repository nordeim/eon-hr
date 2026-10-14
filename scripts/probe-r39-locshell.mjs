#!/usr/bin/env node
// probe-r39-locshell.mjs — map the clone's shell with compact evals.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

run(`agent-browser --session loc set viewport 1440 900`);
run(`agent-browser --session loc open http://127.0.0.1:3200/dashboard`);
await new Promise(r => setTimeout(r, 3500));

// compact: sidebar container + its tag/classes
const sb = await evalOn("loc", `(() => { const sb = [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return r.width >= 240 && r.width <= 270 && r.height > 600 && r.x < 30; })[0]; if (!sb) return null; const par = sb.parentElement; return { tag: sb.tagName, cls: sb.className.slice(0, 200), parentTag: par.tagName, parentCls: par.className.slice(0, 200), grandparentTag: par.parentElement.tagName, grandparentCls: par.parentElement.className.slice(0, 200) }; })()`);
console.log("sidebar chain:", JSON.stringify(sb));

// main chain
const main = await evalOn("loc", `(() => { const m = document.querySelector('main'); const par = m.parentElement; return { mainCls: m.className.slice(0, 200), parentTag: par.tagName, parentCls: par.className.slice(0, 200), kids: [...m.children].map(c => ({ tag: c.tagName, cls: c.className.slice(0, 160) })) }; })()`);
console.log("main chain:", JSON.stringify(main));

// header + bottom nav position
const chrome = await evalOn("loc", `(() => { const h = document.querySelector('header'); const bn = [...document.querySelectorAll('nav')].find(n => { const r = n.getBoundingClientRect(); return r.y > 700; }); const hp = h ? h.parentElement : null; const bp = bn ? bn.parentElement : null; return { header: h ? { cls: h.className.slice(0, 160), parentTag: hp.tagName, parentCls: hp.className.slice(0, 120) } : null, bottomNav: bn ? { cls: bn.className.slice(0, 120), parentTag: bp.tagName, parentCls: bp.className.slice(0, 160) } : null }; })()`);
console.log("chrome:", JSON.stringify(chrome));
