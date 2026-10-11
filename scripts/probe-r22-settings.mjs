#!/usr/bin/env node
// probe-r22-settings.mjs — /settings docH delta investigation (REF 919 vs LOC 943).
// Diffs the main content area block-by-block on both apps.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) {
  if (ms) await new Promise(r => setTimeout(r, ms));
  const oneLine = expr.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try {
    let raw = out.trim();
    try { const once = JSON.parse(raw); if (typeof once === "string") raw = once; } catch {}
    return JSON.parse(raw);
  } catch { return { error: out.slice(0, 300) }; }
}

// walk the page root's visible block children with y + height
const BLOCKS = `(() => {
  const root = document.querySelector('main') ? document.querySelector('main').firstElementChild : document.body.firstElementChild;
  const out = [];
  const walk = (el, depth) => {
    for (const c of el.children) {
      const r = c.getBoundingClientRect();
      if (r.height < 1) continue;
      out.push('  '.repeat(depth) + c.tagName + '.' + (c.getAttribute('class')||'').split(' ').slice(0,2).join('.').slice(0,42) + ' y=' + Math.round(r.y + scrollY) + ' h=' + Math.round(r.height) + ' ' + (c.textContent||'').trim().slice(0,22).replace(/\s+/g,' '));
      if (depth < 2) walk(c, depth + 1);
    }
  };
  if (root) walk(root, 0);
  return JSON.stringify(out.slice(0, 40));
})()`;

for (const [tag, session, base] of [
  ["REF", "ref", "https://eon.base44.app"],
  ["LOC", "loc", "http://127.0.0.1:3200"],
]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/settings`);
  await new Promise(r => setTimeout(r, 4000));
  const blocks = await evalOn(session, BLOCKS);
  console.log(`===== ${tag} /settings blocks =====`);
  if (Array.isArray(blocks)) for (const b of blocks) console.log(b);
  else console.log(JSON.stringify(blocks));
}
