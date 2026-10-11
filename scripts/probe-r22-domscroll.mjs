#!/usr/bin/env node
// probe-r22-domscroll.mjs — session-23 / parity round 22: the scroll dimension.
// Stage 2: live DOM census — every element whose computed scroll-relevant
// styles differ from defaults (sticky / overflow != visible / scrollbar-* /
// overscroll / scroll-behavior / scroll-snap). Reports selector-path + geometry
// + whether the element actually has scrollable content.
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

// Census part A: sticky + overflow + scrollbar + overscroll + scroll-behavior
const CENSUS = `(() => {
  const out = [];
  const path = (el) => {
    const parts = [];
    let n = el;
    for (let i = 0; i < 4 && n && n.nodeType === 1; i++) {
      let p = n.tagName.toLowerCase();
      if (n.id) p += "#" + n.id;
      const cls = (n.getAttribute && n.getAttribute("class")) || "";
      const first = cls.split(" ").filter(Boolean).slice(0, 2).join(".");
      if (first) p += "." + first;
      parts.unshift(p);
      n = n.parentElement;
    }
    return parts.join(">");
  };
  for (const el of document.querySelectorAll("*")) {
    const cs = getComputedStyle(el);
    const stick = cs.position === "sticky" || cs.position === "fixed";
    const ox = cs.overflowX, oy = cs.overflowY;
    const oflow = (ox !== "visible" && ox !== "clip") || (oy !== "visible" && oy !== "clip");
    const sbw = cs.scrollbarWidth, sbc = cs.scrollbarColor, sbg = cs.scrollbarGutter;
    const osb = cs.overscrollBehavior, sbe = cs.scrollBehavior;
    const interesting = stick || oflow || (sbw && sbw !== "auto") || (sbc && sbc !== "auto") || (sbg && sbg !== "auto") || (osb && osb !== "auto") || (sbe && sbe !== "auto");
    if (!interesting) continue;
    const r = el.getBoundingClientRect();
    const scrollable = el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2;
    out.push({
      p: path(el).slice(0, 95),
      pos: cs.position, ox: ox, oy: oy,
      sb: (sbw !== "auto" ? "w:" + sbw : "") + (sbc !== "auto" ? " c:" + sbc.slice(0, 30) : "") + (sbg !== "auto" ? " g:" + sbg : ""),
      osb: osb !== "auto" ? osb : "", sbe: sbe !== "auto" ? sbe : "",
      r: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)].join(","),
      sh: el.scrollHeight, ch: el.clientHeight, scr: scrollable ? "YES" : ""
    });
    if (out.length >= 30) break;
  }
  return JSON.stringify({ n: out.length, rows: out, docS: document.scrollingElement ? document.scrollingElement.tagName : "?", docH: document.documentElement.scrollHeight, bodyH: document.body.scrollHeight, vw: innerWidth, vh: innerHeight });
})()`;

for (const [tag, session, base, route] of [
  ["REF", "ref", "https://eon.base44.app", "/settings"],
  ["LOC", "loc", "http://127.0.0.1:3200", "/settings"],
]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}${route}`);
  await new Promise(r => setTimeout(r, 4000));
  const res = await evalOn(session, CENSUS);
  console.log(`===== ${tag} ${route} =====`);
  if (res.error) { console.log("ERR", res.error); continue; }
  console.log(`scrollingElement=${res.docS} docH=${res.docH} bodyH=${res.bodyH} vw=${res.vw} vh=${res.vh}`);
  for (const r of res.rows) {
    console.log(`  ${r.p.padEnd(96)} pos=${r.pos} ox=${r.ox} oy=${r.oy} ${r.sb} ${r.osb} ${r.sbe} rect=[${r.r}] sh=${r.sh}/${r.ch} ${r.scr}`);
  }
}
