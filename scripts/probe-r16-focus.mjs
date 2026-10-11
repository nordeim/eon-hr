#!/usr/bin/env node
// probe-r16-focus.mjs — direct DOM dumps of the 4 suspect zero-data deltas:
// /surveys (card count), /documenttracker (empty text), /workflowautomation
// (h3), /chat (h3 structure). REF vs LOC at 1440×900.
import { execSync } from "node:child_process";

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString();
  } catch (e) {
    return "ERR:" + String(e).slice(0, 100);
  }
}

const PROBE = `(() => {
  const out = { path: location.pathname };
  const main = document.querySelector("main");
  const walk = (el, depth) => {
    if (!el || depth > 3) return [];
    const cs = getComputedStyle(el);
    if (["SCRIPT", "STYLE", "SVG"].includes(el.tagName)) return [];
    const r = el.getBoundingClientRect();
    const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).filter(Boolean).join(" ").slice(0, 40);
    const line = { tag: el.tagName.toLowerCase(), cls: String(el.className).slice(0, 44), w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y), fs: cs.fontSize, fw: cs.fontWeight, color: cs.color, text: own };
    return [line, ...[...el.children].flatMap(c => walk(c, depth + 1))];
  };
  out.tree = main ? walk(main, 0).filter(l => l.text || (l.h > 30 && l.w > 100)).slice(0, 42) : [];
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
    return { tree: [], parseErr: out.slice(0, 100) };
  }
}

for (const route of ROUTES) {
  const ref = await dump("ref", "https://eon.base44.app", route);
  const loc = await dump("loc", "http://127.0.0.1:3200", route);
  console.log(`\n===== ${route} =====`);
  const fmt = (l) => `${l.tag}.${String(l.cls).slice(0, 30)} ${l.w}x${l.h}@${l.y} ${l.fs}/${l.fw} "${l.text}"`;
  console.log("--- REF ---");
  (ref.tree || []).forEach(l => console.log(fmt(l)));
  console.log("--- LOC ---");
  (loc.tree || []).forEach(l => console.log(fmt(l)));
}
