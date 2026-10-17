#!/usr/bin/env node
// r52-debug.mjs — capture the FULL agent-browser error for the GROUP_READ eval
import { execSync } from "node:child_process";
const evalStr = `(() => { const panels = [...document.querySelectorAll('[data-state=open]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 200 && r.width < 350; }); if (!panels.length) return { gone: 'panel' }; const p = panels[0]; const g = [...p.querySelectorAll('button')].find(b => (b.textContent || '').trim().startsWith('Employees')); if (!g) return { gone: 'group' }; const gr = g.getBoundingClientRect(); const gcs = getComputedStyle(g); const wrap = g.parentElement; const subs = [...(wrap ? wrap.querySelectorAll('a[href]') : [])].map(a => { const r = a.getBoundingClientRect(); const cs = getComputedStyle(a); const svg = a.querySelector('svg'); return { h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y), fs: cs.fontSize, fw: cs.fontWeight, col: cs.color, cls: a.getAttribute('class'), icon: svg ? Math.round(svg.getBoundingClientRect().width) : 0 }; }); return { g: { h: Math.round(gr.height), x: Math.round(gr.x), y: Math.round(gr.y), fs: gcs.fontSize, fw: gcs.fontWeight, cls: g.getAttribute('class') }, subs }; })()`;
try {
  const out = execSync(`agent-browser --session ref eval ${JSON.stringify(evalStr)}`, { stdio: "pipe", timeout: 45000 }).toString();
  console.log("OK:", out.slice(0, 400));
} catch (e) {
  console.log("EXIT CODE:", e.status);
  console.log("STDOUT:", String(e.stdout || "").slice(0, 600));
  console.log("STDERR:", String(e.stderr || "").slice(0, 600));
}
