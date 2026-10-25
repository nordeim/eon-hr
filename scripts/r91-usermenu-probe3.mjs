#!/usr/bin/env node
// r91-usermenu-probe3.mjs — native CDP click on the user trigger (Radix opens
// on pointerdown — the synthetic dispatchEvent trap), then read the menu.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 300); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const side = process.argv[2] || "ref";
const base = side === "ref" ? "https://eon.base44.app" : "http://127.0.0.1:3200";
const session = side === "ref" ? "ref" : "loc";
run(`agent-browser --session ${session} set viewport 390 844`);
run(`agent-browser --session ${session} open ${base}/dashboard`);
await new Promise(r => setTimeout(r, 6000));
// open the drawer with the native click (hamburger)
const t1 = run(`agent-browser --session ${session} click "//button[contains(., 'Toggle Sidebar')]"`);
console.log("drawer toggle click:", t1.trim().slice(0, 120));
await new Promise(r => setTimeout(r, 1800));
// native click on the user trigger in the drawer footer
const t2 = run(`agent-browser --session ${session} click "//button[contains(., 'sepnetflix2023')]"`);
console.log("user trigger click:", t2.trim().slice(0, 200));
await new Promise(r => setTimeout(r, 2000));
const dump = await evalOn(session, `(() => {
  const r = (el) => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
  const menus = [...document.querySelectorAll('[role=menu]')].map(m => ({ rect: r(m), dir: m.getAttribute('dir'), classes: (m.getAttribute('class')||'').slice(0,220), items: [...m.querySelectorAll('[role=menuitem]')].map(i => i.textContent.trim()) }));
  const open = [...document.querySelectorAll('[data-state=open]')].map(e => ({ tag: e.tagName, role: e.getAttribute('role'), cls: (e.getAttribute('class')||'').slice(0,120), rect: r(e), text: e.textContent.trim().slice(0,60) }));
  return { menus, open };
})()`);
console.log("RESULT:", JSON.stringify(dump, null, 1).slice(0, 2600));
process.exit(0);
