#!/usr/bin/env node
// r91-btn-census.mjs — dump the visible button census on a route at mobile.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const CENSUS = `(() => {
  const vis = (el) => el.offsetParent !== null;
  const btns = [...document.querySelectorAll('button')].filter(vis);
  return { total: btns.length, list: btns.slice(0, 40).map((b, i) => ({
    i, text: b.textContent.trim().slice(0, 24) || null,
    aria: b.getAttribute('aria-label')?.slice(0, 40) ?? null,
    svgs: b.querySelectorAll('svg').length,
    cls: (b.getAttribute('class') || '').slice(0, 90)
  })) };
})()`;

const side = process.argv[2] || "ref";
const route = process.argv[3] || "/loans";
const base = side === "ref" ? "https://eon.base44.app" : "http://127.0.0.1:3200";
const session = side === "ref" ? "ref" : "loc";
run(`agent-browser --session ${session} set viewport 390 844`);
run(`agent-browser --session ${session} open ${base}${route}`);
await new Promise(r => setTimeout(r, 6000));
const census = await evalOn(session, CENSUS);
console.log(`${side.toUpperCase()} ${route} @390: total=${census.total}`);
for (const b of census.list) console.log(` [${b.i}] text=${JSON.stringify(b.text)} aria=${JSON.stringify(b.aria)} svgs=${b.svgs} cls=${JSON.stringify(b.cls)}`);
process.exit(0);
