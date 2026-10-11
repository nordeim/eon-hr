#!/usr/bin/env node
// probe-r22-scroll2.mjs — session-23 / parity round 22, part 2:
// - mobile /dashboard real scroll (1022 > 844): top bar pin + kicker scroll-away
// - REF dialog content scrollbar computed styles (loans dialog)
// - /settings docH delta investigation (REF 919 vs LOC 943)
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

// ---- 1. mobile dashboard scroll ----
const READSTICKY = `(() => {
  const bar = [...document.querySelectorAll("header,div")].find(e => { const r = e.getBoundingClientRect(); return r.y >= -1 && r.y <= 2 && r.height >= 70 && r.height <= 76 && r.width > 300; });
  const kick = [...document.querySelectorAll("div")].find(d => (d.getAttribute("class")||"").includes("border-b") && d.getBoundingClientRect().y > 60 && d.getBoundingClientRect().y < 140 && d.getBoundingClientRect().width > 300);
  return JSON.stringify({ scrollY: Math.round(scrollY), bar: bar ? { y: Math.round(bar.getBoundingClientRect().y), h: Math.round(bar.getBoundingClientRect().height) } : null, kicker: kick ? { y: Math.round(kick.getBoundingClientRect().y) } : null });
})()`;

for (const [tag, session, base] of [
  ["REF", "ref", "https://eon.base44.app"],
  ["LOC", "loc", "http://127.0.0.1:3200"],
]) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 4000));
  const at0 = await evalOn(session, READSTICKY);
  await evalOn(session, `window.scrollTo(0, 400)`);
  await new Promise(r => setTimeout(r, 800));
  const at400 = await evalOn(session, READSTICKY);
  console.log(`===== ${tag} /dashboard @390x844 =====`);
  console.log(`  at scrollY=0:   ${JSON.stringify(at0)}`);
  console.log(`  at scrollY=400: ${JSON.stringify(at400)}`);
}

// ---- 2. REF loans dialog content scrollbar ----
console.log("\n===== REF /loans dialog =====");
run("agent-browser --session ref set viewport 1440 900");
run("agent-browser --session ref open https://eon.base44.app/loans");
await new Promise(r => setTimeout(r, 4000));
const clicked = await evalOn("ref", `(() => { const b = [...document.querySelectorAll("button")].find(x => /add/i.test(x.textContent) || /loan/i.test(x.textContent)); if (b) { b.click(); return "clicked:" + b.textContent.trim().slice(0, 24); } return "no-button"; })()`);
console.log("  trigger: " + JSON.stringify(clicked));
await new Promise(r => setTimeout(r, 1200));
const dlg = await evalOn("ref", `(() => { const d = document.querySelector("[role=dialog]"); if (!d) return "no-dialog"; const cs = getComputedStyle(d); const r = d.getBoundingClientRect(); return JSON.stringify({ sbw: cs.scrollbarWidth, sbc: cs.scrollbarColor, oy: cs.overflowY, maxH: cs.maxHeight, rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)].join(",") }); })()`);
console.log("  REF dialog: " + JSON.stringify(dlg));
// close via Escape
await evalOn("ref", `document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); "esc"`);

console.log("\n===== LOC /loans dialog =====");
run("agent-browser --session loc set viewport 1440 900");
run("agent-browser --session loc open http://127.0.0.1:3200/loans");
await new Promise(r => setTimeout(r, 4000));
const clickedL = await evalOn("loc", `(() => { const b = [...document.querySelectorAll("button")].find(x => /add/i.test(x.textContent) || /loan/i.test(x.textContent)); if (b) { b.click(); return "clicked:" + b.textContent.trim().slice(0, 24); } return "no-button"; })()`);
console.log("  trigger: " + JSON.stringify(clickedL));
await new Promise(r => setTimeout(r, 1200));
const dlgL = await evalOn("loc", `(() => { const d = document.querySelector("[role=dialog]"); if (!d) return "no-dialog"; const cs = getComputedStyle(d); const r = d.getBoundingClientRect(); return JSON.stringify({ sbw: cs.scrollbarWidth, sbc: cs.scrollbarColor, oy: cs.overflowY, maxH: cs.maxHeight, rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)].join(",") }); })()`);
console.log("  LOC dialog: " + JSON.stringify(dlgL));
await evalOn("loc", `document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); "esc"`);

// ---- 3. /settings docH delta: block-by-block ----
console.log("\n===== /settings docH delta (1440x900) =====");
for (const [tag, session, base] of [
  ["REF", "ref", "https://eon.base44.app"],
  ["LOC", "loc", "http://127.0.0.1:3200"],
]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/settings`);
  await new Promise(r => setTimeout(r, 4000));
  const blocks = await evalOn(session, `(() => {
    const main = document.querySelector("main") || document.querySelector("div.flex-1");
    const kids = [];
    if (main) {
      let el = main.firstElementChild;
      while (el && kids.length < 6) {
        const r = el.getBoundingClientRect();
        kids.push({ tag: el.tagName + "." + (el.getAttribute("class")||"").split(" ").slice(0,2).join(".").slice(0,36), y: Math.round(r.y), h: Math.round(r.height) });
        el = el.nextElementSibling;
      }
    }
    return JSON.stringify({ docH: document.documentElement.scrollHeight, mainH: main ? Math.round(main.getBoundingClientRect().height) : 0, kids });
  })()`);
  console.log(`${tag}: ${JSON.stringify(blocks)}`);
}
