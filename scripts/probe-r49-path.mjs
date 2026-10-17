#!/usr/bin/env node
// probe-r49-path.mjs — the structural path from the scroller to the H1
// (every wrapper DIV with classes), plus the kicker bar (found by class
// signature md:hidden). Usage: node scripts/probe-r49-path.mjs ref /a /b
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }
const side = process.argv[2] || "ref";
const routes = process.argv.slice(3);
const BASE = side === "ref" ? "https://eon.base44.app" : "http://127.0.0.1:3201";
const S = side === "ref" ? "ref" : "loc0";

const READER = `(() => {
  const main = document.querySelector('main');
  const sc = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!sc) return { gone: true };
  const h1 = sc.querySelector('h1');
  const path = [];
  let n = h1;
  while (n && n !== sc) { path.unshift(n.tagName + '[' + (n.className || '').toString().slice(0, 150) + ']'); n = n.parentElement; }
  const kick = sc.querySelector('[class*="md:hidden"]');
  const kickInfo = kick ? { tag: kick.tagName, cls: (kick.className || '').slice(0, 200), h1: kick.querySelector('h1') ? (kick.querySelector('h1').className + ' | ' + kick.querySelector('h1').textContent.trim().slice(0, 30)) : null, extra: kick.querySelectorAll('button, p').length } : null;
  const sibs = h1 ? [...h1.parentElement.parentElement.children].map(c => c.tagName + '[' + (c.className || '').toString().slice(0, 110) + ']') : [];
  return { path, kickInfo, rowSibs: sibs };
})()`;

for (const route of routes) {
  run(`agent-browser --session ${S} open "${BASE}${route}"`);
  await new Promise(r => setTimeout(r, side === "ref" ? 2600 : 2000));
  const r = await evalOn(S, READER);
  console.log(`\n===== ${route} =====`);
  console.log(JSON.stringify(r, null, 1));
}
