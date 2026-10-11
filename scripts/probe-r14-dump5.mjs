#!/usr/bin/env node
// probe-r14-dump5.mjs — compliance notify button interiors (REF vs LOC) +
// LOC profile button inventory. Usage: node scripts/probe-r14-dump5.mjs
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

// ── compliance notify buttons ──
await nav("ref", "https://eon.base44.app/compliancedashboard");
await nav("loc", "http://127.0.0.1:3200/compliancedashboard");
const NOTIFY = `(() => {
  const out = {};
  out.btns = [...document.querySelectorAll("main button")].filter(b => b.offsetParent !== null && /notify/i.test(b.textContent || "")).map(b => {
    const r = b.getBoundingClientRect();
    const svg = b.querySelector("svg");
    return { t: (b.textContent || "").trim(), w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y),
      cls: b.className.replace(/\\s+/g, " ").slice(0, 110),
      iconW: svg ? Math.round(svg.getBoundingClientRect().width) : 0, iconMR: svg ? getComputedStyle(svg).marginRight : null,
      pad: getComputedStyle(b).padding, fs: getComputedStyle(b).fontSize };
  });
  return JSON.stringify(out);
})()`;
console.log("── /compliancedashboard REF notify ──\n" + await evalOn("ref", NOTIFY));
console.log("── /compliancedashboard LOC notify ──\n" + await evalOn("loc", NOTIFY));

// ── LOC profile full button inventory ──
await nav("loc", "http://127.0.0.1:3200/profile");
const PB = `(() => {
  const out = {};
  out.btns = [...document.querySelectorAll("main button")].filter(b => b.offsetParent !== null).map(b => {
    const r = b.getBoundingClientRect();
    return { t: (b.textContent || "").trim().slice(0, 20), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), type: b.type };
  });
  return JSON.stringify(out);
})()`;
console.log("\n── /profile LOC all buttons ──\n" + await evalOn("loc", PB));

// REF profile form structure (the save row)
await nav("ref", "https://eon.base44.app/profile");
const PF = `(() => {
  const out = {};
  const form = document.querySelector("main form");
  if (form) {
    const r = form.getBoundingClientRect();
    out.form = { y: Math.round(r.y), h: Math.round(r.height) };
    const btn = form.querySelector("button[type=submit], button:last-of-type");
    if (btn) { const br = btn.getBoundingClientRect(); out.submit = { y: Math.round(br.y), w: Math.round(br.width), h: Math.round(br.height), text: btn.textContent.trim().slice(0, 20) }; }
    const svgs = [...form.querySelectorAll("button svg")].map(s => Math.round(s.getBoundingClientRect().width));
    out.svgInButtons = svgs;
  }
  return JSON.stringify(out);
})()`;
console.log("\n── /profile REF form + submit ──\n" + await evalOn("ref", PF));
console.log("DUMP5-DONE");
