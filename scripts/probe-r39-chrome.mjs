#!/usr/bin/env node
// probe-r39-chrome.mjs — REF's chrome recipes for the restructure:
// sidebar wrapper/spacer/panel full classes + data attrs + inner structure,
// brand container children, header interior, toggle, bottom nav (mobile).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 400) }; } }

const baseRef = "https://eon.base44.app";

// --- DESKTOP: sidebar architecture ---
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session ref open ${baseRef}/dashboard`);
await new Promise(r => setTimeout(r, 3500));

const wrapper = await evalOn("ref", `(() => { const w = [...document.querySelectorAll('div')].find(d => d.classList.contains('peer') && d.classList.contains('group')); if (!w) return null; const spacer = w.children[0]; const panel = w.children[1]; return { wrapperCls: w.className, wrapperStyle: w.getAttribute('style'), spacerCls: spacer.className, panelCls: panel.className, panelAttrs: Object.fromEntries([...panel.attributes].map(a => [a.name, a.value.slice(0, 60)])), panelKids: [...panel.children].map(c => ({ tag: c.tagName, cls: c.className.slice(0, 120), dataAttrs: Object.fromEntries([...c.attributes].filter(a => a.name.startsWith('data-')).map(a => [a.name, a.value.slice(0, 40)])) })) }; })()`);
console.log("=== SIDEBAR ARCH ===");
console.log(JSON.stringify(wrapper, null, 1));

// where is --sidebar-width defined?
const widthVar = await evalOn("ref", `(() => { const w = [...document.querySelectorAll('div')].find(d => d.classList.contains('peer') && d.classList.contains('group')); return { inlineOnWrapper: w.style.getPropertyValue('--sidebar-width'), inlineOnParent: w.parentElement.style.getPropertyValue('--sidebar-width'), inlineOnPanel: w.children[1].style.getPropertyValue('--sidebar-width'), rootComputed: getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width') }; })()`);
console.log("widthVar:", JSON.stringify(widthVar));

// brand container children
const brand = await evalOn("ref", `(() => { const h2 = document.querySelector('h2'); if (!h2) return null; const c = h2.parentElement; return { containerCls: c.className, containerDisplay: getComputedStyle(c).display, h2Cls: h2.className, h2Rect: { w: Math.round(h2.getBoundingClientRect().width), h: Math.round(h2.getBoundingClientRect().height) }, p: c.querySelector('p') ? { cls: c.querySelector('p').className, text: c.querySelector('p').textContent } : null, rowCls: c.parentElement.className.slice(0, 160) }; })()`);
console.log("brand:", JSON.stringify(brand));

// --- MOBILE: header + toggle + bottom nav ---
run(`agent-browser --session ref set viewport 390 844`);
run(`agent-browser --session ref open ${baseRef}/dashboard`);
await new Promise(r => setTimeout(r, 3500));

const header = await evalOn("ref", `(() => { const h = document.querySelector('header'); if (!h) return null; const btn = h.querySelector('button'); const brand = h.querySelector('div:not(:first-of-type)'); return { headerCls: h.className, headerRect: { h: Math.round(h.getBoundingClientRect().height), y: Math.round(h.getBoundingClientRect().y) }, toggleCls: btn ? btn.className : null, toggleAttrs: btn ? { type: btn.getAttribute('type'), dataSidebar: btn.getAttribute('data-sidebar'), ariaLabel: btn.getAttribute('aria-label'), ariaExpanded: btn.getAttribute('aria-expanded'), inner: btn.innerHTML.slice(0, 260) } : null }; })()`);
console.log("=== MOBILE HEADER ===");
console.log(JSON.stringify(header, null, 1));

const bottomNav = await evalOn("ref", `(() => { const bn = [...document.querySelectorAll('div')].find(d => d.className.includes('fixed bottom-0')); if (!bn) return null; const inner = bn.firstElementChild; const tabs = inner ? [...inner.children].slice(0, 3).map(a => ({ tag: a.tagName, cls: a.className.slice(0, 160) })) : []; return { navCls: bn.className, innerCls: inner ? inner.className : null, tabs, tabCount: inner ? inner.children.length : 0 }; })()`);
console.log("=== BOTTOM NAV ===");
console.log(JSON.stringify(bottomNav, null, 1));

// main + scroll container at mobile
const scroller = await evalOn("ref", `(() => { const m = document.querySelector('main'); const sc = [...m.children].find(c => c.className.includes('overflow-auto')); const cs = sc ? getComputedStyle(sc) : null; return { mainCls: m.className, scrollerCls: sc ? sc.className : null, scrollerRect: sc ? { y: Math.round(sc.getBoundingClientRect().y), h: Math.round(sc.getBoundingClientRect().height), sh: sc.scrollHeight } : null, docScrollH: document.documentElement.scrollHeight, bodyOverflow: getComputedStyle(document.body).overflow }; })()`);
console.log("scroller@mobile:", JSON.stringify(scroller));
