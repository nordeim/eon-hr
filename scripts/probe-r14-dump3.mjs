#!/usr/bin/env node
// probe-r14-dump3.mjs — staffrequests trigger x-position (REF vs LOC) +
// training chip-row container geometry on REF.
// Usage: node scripts/probe-r14-dump3.mjs
const { execSync } = await import("node:child_process");

async function nav(session, url) {
  try { execSync(`agent-browser --session ${session} open "${url}"`, { stdio: "pipe", timeout: 45000 }); } catch {}
  await new Promise(r => setTimeout(r, 1600));
}

async function evalOn(session, js) {
  const oneLine = js.split("\n").join(" ");
  try {
    const out = execSync(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`, { stdio: "pipe", timeout: 30000 });
    return out.toString().trim().replace(/^"|"$/g, "").replace(/\\"/g, '"');
  } catch (e) { return "ERR " + String(e).slice(0, 80); }
}

await nav("ref", "https://eon.base44.app/staffrequests");
await nav("loc", "http://127.0.0.1:3200/staffrequests");
const SRX = `(() => {
  const out = {};
  const btn = [...document.querySelectorAll("main button")].find(b => /My Requests/.test(b.textContent || ""));
  if (btn) { const r = btn.getBoundingClientRect(); out.trigger = { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; }
  const tl = document.querySelector("main [role=tablist]");
  if (tl) { const r = tl.getBoundingClientRect(); out.pill = { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) }; }
  const parent = (tl || btn).parentElement;
  if (parent) { const r = parent.getBoundingClientRect(); out.parent = { x: Math.round(r.x), w: Math.round(r.width), cls: (parent.className || "").slice(0, 90) }; }
  return JSON.stringify(out);
})()`;
console.log("── /staffrequests REF ──\n" + await evalOn("ref", SRX));
console.log("── /staffrequests LOC ──\n" + await evalOn("loc", SRX));

await nav("ref", "https://eon.base44.app/training");
const TC = `(() => {
  const out = {};
  const chips = [...document.querySelectorAll("main button")].filter(b => b.offsetParent !== null && b.getBoundingClientRect().y < 240);
  if (chips.length) {
    const container = chips[0].parentElement;
    const r = container.getBoundingClientRect();
    out.container = { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), cls: (container.className || "").slice(0, 100), role: container.getAttribute("role") };
  }
  return JSON.stringify(out);
})()`;
console.log("\n── /training REF chip container ──\n" + await evalOn("ref", TC));
console.log("DUMP3-DONE");
