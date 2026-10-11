#!/usr/bin/env node
// probe-r22-drawer.mjs — session-23 / parity round 22: the scroll dimension.
// Drawer + overscroll + scrollbar computed styles on both apps @390×844:
// - drawer panel/overlay: position, overflow, overscroll-behavior, scrollbar-*
// - drawer nav scroll container: overflow + scrollbar styling + scroll range
// - html/body: scrollbar styling, scrollbar-gutter, overscroll
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

const READ = `(() => {
  const pick = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return { p: el.tagName + "." + (el.getAttribute("class")||"").split(" ").slice(0,3).join("."), pos: cs.position, ox: cs.overflowX, oy: cs.overflowY, osb: cs.overscrollBehaviorY, sbw: cs.scrollbarWidth, sbc: cs.scrollbarColor, sh: el.scrollHeight, ch: el.clientHeight, rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)].join(",") };
  };
  const panel = [...document.querySelectorAll("div,aside")].find(d => { const r = d.getBoundingClientRect(); return r.width >= 280 && r.width <= 296 && r.height > 700; });
  let nav = null;
  if (panel) nav = [...panel.querySelectorAll("nav,div")].find(n => { const cs = getComputedStyle(n); return cs.overflowY === "auto" || cs.overflowY === "scroll"; });
  const overlay = [...document.querySelectorAll("div")].find(d => (d.getAttribute("class")||"").includes("rgba(0,0,0"));
  const html = document.documentElement, body = document.body;
  const hcs = getComputedStyle(html), bcs = getComputedStyle(body);
  return JSON.stringify({ panel: pick(panel), nav: pick(nav), overlay: pick(overlay), html: { sbw: hcs.scrollbarWidth, sbc: hcs.scrollbarColor, osb: hcs.overscrollBehaviorY, gut: hcs.scrollbarGutter, sbe: hcs.scrollBehavior }, body: { sbw: bcs.scrollbarWidth, sbc: bcs.scrollbarColor, osb: bcs.overscrollBehaviorY, gut: bcs.scrollbarGutter }, docH: html.scrollHeight });
})()`;

for (const [tag, session, base] of [
  ["REF", "ref", "https://eon.base44.app"],
  ["LOC", "loc", "http://127.0.0.1:3200"],
]) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 3500));
  // open the drawer (LOC: aria-label toggle; REF: geometry-located burger)
  if (tag === "LOC") {
    await evalOn(session, `(() => { const b = [...document.querySelectorAll("button")].find(x => (x.getAttribute("aria-label")||"") === "Toggle Sidebar"); if (b) b.click(); return "clicked"; })()`);
  } else {
    await evalOn(session, `(() => { const b = [...document.querySelectorAll("button")].find(x => { const r = x.getBoundingClientRect(); return r.x < 60 && r.y < 70 && r.width > 20 && r.width < 50; }); if (b) b.click(); return "clicked:" + !!b; })()`);
  }
  await new Promise(r => setTimeout(r, 1600));
  const res = await evalOn(session, READ);
  console.log(`===== ${tag} drawer @390x844 =====`);
  console.log(JSON.stringify(res, null, 1));
}
