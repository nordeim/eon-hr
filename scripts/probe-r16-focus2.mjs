#!/usr/bin/env node
// probe-r16-focus2.mjs — deep walk (depth 6) of the 4 suspect pages with
// text content, to see stat rows / empty cards / h3s on both sides.
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
    if (!el || depth > 6) return;
    if (["SCRIPT", "STYLE", "SVG"].includes(el.tagName)) return;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).filter(Boolean).join(" ").slice(0, 44);
    if (own || ["H1","H2","H3","P","BUTTON"].includes(el.tagName)) {
      lines.push({ d: depth, tag: el.tagName.toLowerCase(), w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y), fs: cs.fontSize, fw: cs.fontWeight, c: cs.color, t: own || (el.textContent || "").trim().slice(0, 30) });
    }
    [...el.children].forEach(c => walk(c, depth + 1));
  };
  if (main) walk(main, 0);
  out.lines = lines.slice(0, 50);
  out.docH = Math.round(document.documentElement.scrollHeight);
  return JSON.stringify(out);
})()`;

const ROUTES = ["/surveys", "/documenttracker", "/workflowautomation", "/chat"];

async function dump(session, base, route) {
  run(`agent-browser --session ${session} open "${base}${route}"`);
  await new Promise(r => setTimeout(r, 2200));
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
  console.log(`\n===== ${route} =====   REF docH=${ref.docH}  LOC docH=${loc.docH}`);
  console.log("--- REF ---");
  (ref.lines || []).forEach(l => console.log(`${" ".repeat(l.d)}${l.tag} ${l.w}x${l.h}@${l.y} ${l.fs}/${l.fw} "${l.t}"`));
  console.log("--- LOC ---");
  (loc.lines || []).forEach(l => console.log(`${" ".repeat(l.d)}${l.tag} ${l.w}x${l.h}@${l.y} ${l.fs}/${l.fw} "${l.t}"`));
}
