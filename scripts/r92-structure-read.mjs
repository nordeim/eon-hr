#!/usr/bin/env node
// r92-structure-read.mjs — read the REF's /requestsettings and /workflowautomation
// page structure: headings, buttons, inputs, selects (any form), to see what
// these pages actually hold before comparing inventories.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 300); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const routes = process.argv[2] ? process.argv[2].split(",") : ["/requestsettings", "/workflowautomation"];
const base = "https://eon.base44.app";
run(`agent-browser --session ref set viewport 1440 900`);
for (const route of routes) {
  run(`agent-browser --session ref open ${base}${route}`);
  await sleep(6000);
  const read = await evalOn("ref", `(() => {
    const vis = (el) => el.offsetParent !== null;
    const r = (el) => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
    return {
      url: location.href,
      h1: [...document.querySelectorAll('h1')].filter(vis).map(h => h.textContent.trim().slice(0, 70)),
      h2: [...document.querySelectorAll('h2')].filter(vis).map(h => h.textContent.trim().slice(0, 70)),
      h3: [...document.querySelectorAll('h3')].filter(vis).map(h => h.textContent.trim().slice(0, 60)),
      buttons: [...document.querySelectorAll('button')].filter(vis).map(b => ({ t: b.textContent.trim().slice(0, 44), rect: r(b) })),
      inputs: [...document.querySelectorAll('input')].filter(vis).map(i => ({ ph: (i.placeholder || '').slice(0, 44), type: i.type, label: (i.labels && i.labels[0] ? i.labels[0].textContent.trim().slice(0, 40) : null) })),
      selects: [...document.querySelectorAll('button[role=combobox], button[aria-haspopup=listbox], select')].filter(vis).map(s => ({ t: s.textContent.trim().slice(0, 44), tag: s.tagName, rect: r(s) })),
      textareas: [...document.querySelectorAll('textarea')].filter(vis).map(t => (t.placeholder || '').slice(0, 44)),
      labels: [...document.querySelectorAll('label')].filter(vis).map(l => l.textContent.trim().slice(0, 44)),
      bodyLen: document.body.innerText.length
    };
  })()`);
  console.log(`\n=== ${route} ===`);
  console.log(JSON.stringify(read, null, 1));
}
process.exit(0);
