#!/usr/bin/env node
// probe-r25-meta-dump.mjs — dump the full details of REF's head contract:
// twitter tag names, og:image URL, jsonld contents, full descriptions,
// login og extras, root-route behavior.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

// 1. Full twitter + og dump on /employees (canonical app route)
run(`agent-browser --session ref set viewport 1280 800`);
run(`agent-browser --session ref open "https://eon.base44.app/employees"`);
await new Promise(r => setTimeout(r, 3000));
const full = await evalOn("ref", `(() => {
  const metas = [...document.querySelectorAll('meta')];
  const tw = metas.filter(m => (m.getAttribute('name')||'').startsWith('twitter:')).map(m => m.getAttribute('name') + ' => ' + (m.content||'').slice(0,120));
  const og = metas.filter(m => (m.getAttribute('property')||'').startsWith('og:')).map(m => m.getAttribute('property') + ' => ' + (m.content||'').slice(0,150));
  const desc = (document.querySelector('meta[name="description"]')||{content:''}).content;
  const icon = (document.querySelector('link[rel="icon"]')||{href:''}).href;
  return JSON.stringify({tw, og, desc, icon});
})()`);
console.log("=== /employees FULL ===");
console.log(JSON.stringify(full, null, 1));

// 2. jsonld contents on /employees
const jsonld = await evalOn("ref", `(() => {
  return JSON.stringify([...document.querySelectorAll('script[type="application/ld+json"]')].map(s => s.textContent.slice(0, 400)));
})()`);
console.log("\n=== /employees JSONLD ===");
console.log(JSON.stringify(jsonld, null, 1));

// 3. Root route check: does / serve the dashboard directly?
run(`agent-browser --session ref open "https://eon.base44.app/"`);
await new Promise(r => setTimeout(r, 3000));
const root = await evalOn("ref", `(() => {
  const h = [...document.querySelectorAll('h1')].find(x => x.offsetParent !== null);
  return JSON.stringify({path: location.pathname, title: document.title, h1: h ? h.textContent.trim().slice(0,30) : null, canonical: (document.querySelector('link[rel="canonical"]')||{href:''}).href});
})()`);
console.log("\n=== ROOT / ===");
console.log(JSON.stringify(root, null, 1));

// 4. Login page twitter + theme + og image dims
run(`agent-browser --session ref open "https://eon.base44.app/login"`);
await new Promise(r => setTimeout(r, 3000));
const login = await evalOn("ref", `(() => {
  const metas = [...document.querySelectorAll('meta')];
  const tw = metas.filter(m => (m.getAttribute('name')||'').startsWith('twitter:')).map(m => m.getAttribute('name') + ' => ' + (m.content||'').slice(0,100));
  const theme = (document.querySelector('meta[name="theme-color"]')||{content:''}).content;
  const manifest = (document.querySelector('link[rel="manifest"]')||{href:''}).href;
  return JSON.stringify({tw, theme, manifest});
})()`);
console.log("\n=== /login twitter+theme+manifest ===");
console.log(JSON.stringify(login, null, 1));
