#!/usr/bin/env node
// probe-r16-focus3.mjs — uncapped-depth structural probe for /surveys and
// /chat: every visible element (h>20) in the content area with geometry +
// text, REF vs LOC. No depth cap (REF nests one wrapper deeper than LOC).
import { execSync } from "node:child_process";

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString();
  } catch (e) {
    return "ERR:" + String(e).slice(0, 100);
  }
}

const PROBE = `(() => {
  const out = {};
  const main = document.querySelector("main");
  const lines = [];
  const walk = (el, depth) => {
    if (!el || depth > 12) return;
    if (["SCRIPT", "STYLE", "SVG"].includes(el.tagName)) return;
    const r = el.getBoundingClientRect();
    if (r.height > 20 && r.width > 40 && el.childElementCount < 12) {
      const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).filter(Boolean).join(" ").slice(0, 36);
      if (own || ["H1","H2","H3","P","BUTTON","INPUT","TEXTAREA"].includes(el.tagName)) {
        lines.push({ d: depth, tag: el.tagName.toLowerCase(), w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y), t: own || (el.textContent || "").trim().slice(0, 28) });
      }
    }
    [...el.children].forEach(c => walk(c, depth + 1));
  };
  if (main) walk(main, 0);
  out.lines = lines.slice(0, 60);
  return JSON.stringify(out);
})()`;

const ROUTES = ["/surveys", "/chat"];

async function dump(session, base, route) {
  run(`agent-browser --session ${session} open "${base}${route}"`);
  await new Promise(r => setTimeout(r, 2500));
  const oneLine = PROBE.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try {
    return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"'));
  } catch {
    return { lines: [], parseErr: out.slice(0, 100) };
  }
}

for (const route of ROUTES) {
  const ref = await dump("ref", "https://eon.base44.app", route);
  const loc = await dump("loc", "http://127.0.0.1:3200", route);
  console.log(`\n===== ${route} =====`);
  console.log("--- REF ---");
  (ref.lines || []).forEach(l => console.log(`${"  ".repeat(l.d)}${l.tag} ${l.w}x${l.h}@${l.y} "${l.t}"`));
  console.log("--- LOC ---");
  (loc.lines || []).forEach(l => console.log(`${"  ".repeat(l.d)}${l.tag} ${l.w}x${l.h}@${l.y} "${l.t}"`));
}
