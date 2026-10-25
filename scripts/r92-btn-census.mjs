#!/usr/bin/env node
// r92-btn-census.mjs — list the dialog-opening buttons on the given REF routes.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR"; } }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const routes = process.argv[2].split(",");
for (const r of routes) {
  run(`agent-browser --session ref open https://eon.base44.app/${r}`);
  await sleep(4500);
  const out = run(`agent-browser --session ref eval "(() => { const vis=(b)=>b.offsetParent!==null; return [...document.querySelectorAll('button')].filter(vis).map(b=>b.textContent.trim()).filter(Boolean).slice(0,30); })()"`);
  let btns;
  try { btns = JSON.parse(out.trim()); } catch { btns = ["PARSE-ERR:" + out.slice(0, 100)]; }
  console.log(`${r}: ` + JSON.stringify(btns.filter(t => t.length < 40)).slice(0, 400));
}
