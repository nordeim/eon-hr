#!/usr/bin/env node
// probe-r14-dump6.mjs — attendance header buttons full list (confirm the
// documented 2-line-header y-offset is the only diff) + loan empty-state
// spot check. Usage: node scripts/probe-r14-dump6.mjs
const { execSync } = await import("node:child_process");

async function nav(session, url) {
  try { execSync(`agent-browser --session ${session} open "${url}"`, { stdio: "pipe", timeout: 45000 }); } catch {}
  await new Promise(r => setTimeout(r, 2000));
}

async function evalOn(session, js) {
  const oneLine = js.split("\n").join(" ");
  try {
    const out = execSync(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`, { stdio: "pipe", timeout: 30000 });
    return out.toString().trim().replace(/^"|"$/g, "").replace(/\\"/g, '"');
  } catch (e) { return "ERR " + String(e).slice(0, 80); }
}

await nav("ref", "https://eon.base44.app/attendance");
await nav("loc", "http://127.0.0.1:3200/attendance");
const ATT = `(() => {
  const out = {};
  out.btns = [...document.querySelectorAll("main button")].filter(b => b.offsetParent !== null && b.getBoundingClientRect().y < 300).map(b => {
    const r = b.getBoundingClientRect();
    return { t: (b.textContent || "").trim().slice(0, 16), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  });
  const tl = document.querySelector("main [role=tablist]");
  if (tl) { const r = tl.getBoundingClientRect(); out.pill = { w: Math.round(r.width), y: Math.round(r.y), bg: getComputedStyle(tl).backgroundColor }; out.triggers = [...tl.querySelectorAll("[role=tab]")].map(t => ({ t: t.textContent.trim().slice(0, 16), w: Math.round(t.getBoundingClientRect().width), icon: t.querySelector("svg") ? Math.round(t.querySelector("svg").getBoundingClientRect().width) : 0 })); }
  return JSON.stringify(out);
})()`;
console.log("── /attendance REF ──\n" + await evalOn("ref", ATT));
console.log("── /attendance LOC ──\n" + await evalOn("loc", ATT));
console.log("DUMP6-DONE");
