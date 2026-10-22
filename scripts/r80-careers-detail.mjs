#!/usr/bin/env node
// r80-careers-detail.mjs — session 80 / parity round 79: the /careers
// divergence deep-read. The matrix + first detail read established: at
// 390x844 the REF's /careers overflows (602px author inside the shell's
// div.flex-1.overflow-auto) while the LOC's /careers fits (390px, zero
// overflow authors). The outermost-author filter hid the actual content
// author — this read lists ALL elements wider than the viewport (both
// sides) with tag + class + width, plus the flex-1 div's direct children,
// to classify the divergence: same-element-different-width (content- or
// class-authored) vs different-structure (a clone-authored deviation).
import { execSync } from "node:child_process";

function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const b64 = Buffer.from(expr, "utf8").toString("base64"); const out = run(`agent-browser --session ${session} eval -b ${b64}`); const t = out.trim(); try { return JSON.parse(t); } catch { try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } } }

const READ = `(() => {
  const vw = window.innerWidth;
  const wide = [];
  for (const el of document.querySelectorAll('main *, header *')) {
    const r = el.getBoundingClientRect();
    if (r.width > vw + 1) wide.push({ tag: el.tagName, cls: (el.className || '').toString().replace(/\\s+/g, ' ').trim().slice(0, 140), w: Math.round(r.width) });
  }
  const flexDiv = document.querySelector('div.flex-1.overflow-auto');
  const children = flexDiv ? [...flexDiv.querySelectorAll(':scope > *')].slice(0, 8).map(el => { const r = el.getBoundingClientRect(); return { tag: el.tagName, cls: (el.className || '').toString().replace(/\\s+/g, ' ').trim().slice(0, 140), w: Math.round(r.width), h: Math.round(r.height) }; }) : null;
  const grid = document.querySelector('.grid, [class*=grid-cols]');
  return { vw, wide: wide.slice(0, 10), flexChildren: children, gridCls: grid ? (grid.className || '').toString().slice(0, 140) : null };
})()`;

for (const s of ["ref", "loc"]) {
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false')"`);
  run(`agent-browser --session ${s} set viewport 390 844`);
  run(`agent-browser --session ${s} open ${s === "ref" ? "https://eon.base44.app" : "http://127.0.0.1:3200"}/careers`);
  await new Promise(r => setTimeout(r, 800));
  run(`agent-browser --session ${s} set viewport 390 844`);
  await new Promise(r => setTimeout(r, 2800));
  console.log(`\n==== ${s} /careers @390x844 ====`);
  console.log(JSON.stringify(await evalOn(s, READ), null, 1));
}
