#!/usr/bin/env node
// probe-r39-careers2.mjs — REF's full careers recipes (compact evals).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 600) }; } }

const baseRef = "https://eon.base44.app";
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session ref open ${baseRef}/careers`);
await new Promise(r => setTimeout(r, 4000));

const chip = await evalOn("ref", `(() => { const c = [...document.querySelectorAll('button')].filter(e => { const p = e.parentElement; return p && /flex-wrap/.test((p.className || '')); }); return c.length ? { full: c[0].className, h: Math.round(c[0].getBoundingClientRect().height), parentCls: c[0].parentElement.className.slice(0, 160) } : null; })()`);
console.log("chip:", JSON.stringify(chip));

const headings = await evalOn("ref", `(() => { return [...document.querySelectorAll('h1,h2,h3,p')].filter(h => /open position|browse by|open role/i.test(h.textContent || '')).slice(0, 4).map(h => ({ tag: h.tagName, t: h.textContent.trim().slice(0, 40), cls: h.className.slice(0, 160) })); })()`);
console.log("headings:", JSON.stringify(headings));

const card = await evalOn("ref", `(() => { const c = [...document.querySelectorAll('div')].filter(d => d.className.includes('rounded-xl') && d.querySelector('h3') && d.getBoundingClientRect().height > 80 && d.getBoundingClientRect().height < 400); return c.length ? { cls: c[0].className.slice(0, 300), h: Math.round(c[0].getBoundingClientRect().height), h3: c[0].querySelector('h3').textContent.slice(0, 40), h3cls: c[0].querySelector('h3').className.slice(0, 140) } : { count: c.length }; })()`);
console.log("card:", JSON.stringify(card));

// the hero input's parent + icon
const hero = await evalOn("ref", `(() => { const i = document.querySelector('input'); const wrap = i.parentElement; const gp = wrap ? wrap.parentElement : null; return { wrapCls: wrap ? wrap.className.slice(0, 140) : null, wrapPos: wrap ? getComputedStyle(wrap).position : null, gpCls: gp ? gp.className.slice(0, 140) : null, inputFull: i.className }; })()`);
console.log("hero:", JSON.stringify(hero));
