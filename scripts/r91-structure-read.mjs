#!/usr/bin/env node
// r91-structure-read.mjs — read a page's structural census at a viewport.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const READ = `(() => {
  const vis = (el) => el.offsetParent !== null;
  const tables = [...document.querySelectorAll('table')].filter(vis).map(t => {
    const head = [...t.querySelectorAll('thead th')].map(th => th.textContent.trim());
    const rows = t.querySelectorAll('tbody tr').length;
    return { head, rows };
  });
  const cards = [...document.querySelectorAll('[class*=card]')].filter(vis).length;
  const closeBadge = [...document.querySelectorAll('button[aria-label="Close badge"]')].map(b => ({ parent: b.parentElement?.tagName, parentCls: (b.parentElement?.getAttribute('class')||'').slice(0,80), nextText: b.parentElement?.textContent?.trim().slice(0,60) }));
  const headings = [...document.querySelectorAll('h1,h2,h3')].filter(vis).map(h => h.textContent.trim().slice(0, 50));
  return { tables, cards, closeBadge, headings, bodyText: document.body.textContent.replace(/\\s+/g,' ').slice(0, 500) };
})()`;

const side = process.argv[2] || "ref";
const route = process.argv[3] || "/loans";
const w = process.argv[4] || "390";
const h = process.argv[5] || "844";
const base = side === "ref" ? "https://eon.base44.app" : "http://127.0.0.1:3200";
const session = side === "ref" ? "ref" : "loc";
run(`agent-browser --session ${session} set viewport ${w} ${h}`);
run(`agent-browser --session ${session} open ${base}${route}`);
await new Promise(r => setTimeout(r, 6000));
const read = await evalOn(session, READ);
console.log(JSON.stringify(read, null, 1).slice(0, 2500));
process.exit(0);
