#!/usr/bin/env node
// probe-r40-extjob.mjs — REF's /ExternalJobApplication with the
// org+job params (the View Details & Apply target): full interior.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 500) }; } }

const baseRef = "https://eon.base44.app";
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session ref open "${baseRef}/ExternalJobApplication?org=company&job=system-admin"`);
await new Promise(r => setTimeout(r, 4500));

const page = await evalOn("ref", `(() => {
  const main = document.querySelector('main');
  const sc = main ? [...main.children].find(c => (c.className||'').includes('overflow-auto')) : null;
  const root = sc || main || document.body;
  const h1 = document.querySelector('h1');
  const dump = (el, depth) => { const out = []; for (const c of el.children) { const r = c.getBoundingClientRect(); if (r.height === 0 && r.width === 0) continue; out.push({ d: depth, tag: c.tagName, y: Math.round(r.y), h: Math.round(r.height), w: Math.round(r.width), cls: (c.className && c.className.toString ? c.className.toString() : '').slice(0, 120), t: (c.children.length === 0 ? (c.textContent||'').trim().slice(0, 44) : '') }); if (depth < 3) out.push(...dump(c, depth + 1)); } return out; };
  return { path: location.pathname, search: location.search, h1: h1 ? { t: h1.textContent.slice(0, 50), cls: h1.className, y: Math.round(h1.getBoundingClientRect().y) } : null, tree: dump(root, 0).slice(0, 44) };
})()`);
console.log(`PATH: ${page.path}${page.search}`);
console.log(`H1: ${JSON.stringify(page.h1)}`);
for (const n of page.tree) console.log(`${' '.repeat(n.d * 2)}${n.tag} y=${n.y} h=${n.h} w=${n.w} ${n.t ? '"' + n.t + '" ' : ''}${n.cls}`);
