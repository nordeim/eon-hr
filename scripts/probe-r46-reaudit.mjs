#!/usr/bin/env node
// probe-r46-reaudit.mjs — session-47 / parity round 46: the 12th-deploy
// login re-audit (the deeper set the r45 verify doesn't cover).
// (1) the runtime-injected style block census (count/bytes/rules + the
//     ring-slate-400 pair still present), (2) the failed-login Alert
//     re-fire, (3) theme-inert, (4) the login's full script/link census
//     (the new frontend-config.js?v=3), (5) doc+root + html class/dir.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

async function freshLogin(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3200));
}

// ---------- (1) the runtime style block census ----------
await freshLogin("ref", baseRef);
const BLOCK = `(() => {
  const blocks = [...document.querySelectorAll('style')].map(s => ({ id: s.id || null, bytes: (s.textContent||'').length, rules: (s.textContent||'').split('}').length - 1, ringPair: /ring-slate-400/.test(s.textContent||'') }));
  return { total: blocks.length, blocks };
})()`;
const refBlock = await evalOn("ref", BLOCK);
await freshLogin("loc", baseLoc);
const locBlock = await evalOn("loc", BLOCK);
console.log("REF style blocks:", JSON.stringify(refBlock));
console.log("LOC style blocks:", JSON.stringify(locBlock));

// ---------- (2) the failed-login Alert ----------
const BADLOGIN = `(() => {
  const email = document.querySelector('input[type=email]');
  const pass = document.querySelector('input[type=password]');
  const d = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  d.call(email, 'probe@x.invalid'); email.dispatchEvent(new Event('input', { bubbles: true }));
  d.call(pass, 'wrongpass'); pass.dispatchEvent(new Event('input', { bubbles: true }));
  const btn = [...document.querySelectorAll('button')].find(b => /sign in/i.test(b.textContent||'') && b.type === 'submit');
  btn.click(); return 'submitted';
})()`;
const ALERT = `(() => {
  const alert = document.querySelector('[data-slot=alert], [role=alert]');
  if (!alert) return { found: false };
  const r = alert.getBoundingClientRect(); const cs = getComputedStyle(alert);
  return { found: true, t: (alert.textContent||'').trim(), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), bg: cs.backgroundColor, bd: cs.borderColor, col: cs.color, cls: (alert.getAttribute('class')||'') };
})()`;
await evalOn("ref", BADLOGIN);
await new Promise(r => setTimeout(r, 1200));
const refAlert = await evalOn("ref", ALERT);
await evalOn("loc", BADLOGIN);
await new Promise(r => setTimeout(r, 800));
const locAlert = await evalOn("loc", ALERT);
console.log("\nfailed-login Alert REF:", JSON.stringify(refAlert));
console.log("failed-login Alert LOC:", JSON.stringify(locAlert));

// ---------- (3) theme-inert + (5) doc state ----------
const DOC = `(() => ({ htmlCls: document.documentElement.className, dir: document.documentElement.dir, dark: document.documentElement.classList.contains('dark'), bodyChildren: [...document.body.children].map(c => c.tagName + (c.id ? '#'+c.id : '')) }))()`;
const refDoc = await evalOn("ref", DOC);
const locDoc = await evalOn("loc", DOC);
console.log("\ndoc REF:", JSON.stringify(refDoc));
console.log("doc LOC:", JSON.stringify(locDoc));

// ---------- (4) the login's full script census ----------
const ASSETS = `(() => ({ s: [...document.querySelectorAll('script[src]')].map(x => x.src.split('/').pop()), l: [...document.querySelectorAll('link[rel=stylesheet]')].map(x => (x.href||'').split('/').pop()) }))()`;
const refAssets = await evalOn("ref", ASSETS);
const locAssets = await evalOn("loc", ASSETS);
console.log("\nassets REF:", JSON.stringify(refAssets));
console.log("assets LOC:", JSON.stringify(locAssets));
