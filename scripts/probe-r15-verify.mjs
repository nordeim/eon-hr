#!/usr/bin/env node
// probe-r15-verify.mjs — post-fix live verification: pill colors, footer
// colors, staffrequests pill + trigger, organogram geometry, attendance fit.
// Usage: node scripts/probe-r15-verify.mjs
const { execSync } = await import("node:child_process");

async function nav(session, base, route, settle = 2200) {
  try {
    execSync(`agent-browser --session ${session} open "${base + route}"`, { stdio: "pipe", timeout: 45000 });
  } catch { /* continue */ }
  await new Promise(r => setTimeout(r, settle));
}

async function evalOn(session, probe) {
  const oneLine = probe.split("\n").join(" ");
  try {
    const out = execSync(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`, { stdio: "pipe", timeout: 30000 });
    return out.toString().trim().replace(/^"|"$/g, "").replace(/\\"/g, '"');
  } catch (e) {
    return "ERR:" + String(e).slice(0, 100);
  }
}

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

// 1. Pill inactive colors across the 9 surfaces
const PILL_PROBE = `(() => {
  const pills = [...document.querySelectorAll("[role=tablist]")].slice(0, 4);
  const local = [...document.querySelectorAll("div")].find(d => String(d.className).includes("bg-secondary p-1") && d.querySelector("button"));
  const out = pills.map(p => {
    const triggers = [...p.querySelectorAll("[role=tab]")];
    const inactive = triggers.find(t => t.getAttribute("data-state") !== "active") || triggers[1] || triggers[0];
    return { w: Math.round(p.getBoundingClientRect().width), inactive: inactive ? getComputedStyle(inactive).color : null };
  });
  if (local) {
    const r = local.getBoundingClientRect();
    const trig = local.querySelector("button");
    out.push({ localPill: true, w: Math.round(r.width), bg: getComputedStyle(local).backgroundColor, inactive: getComputedStyle(local).color, triggerBg: trig ? getComputedStyle(trig).backgroundColor : null, triggerColor: trig ? getComputedStyle(trig).color : null });
  }
  return JSON.stringify(out);
})()`;

console.log("── 1. TAB-PILL INACTIVE COLORS (expect rgb(115, 115, 115) everywhere) ──");
for (const route of ["/settings", "/profile", "/attendance", "/compliancedashboard", "/recruitment", "/performancemanagement", "/evaluations", "/reports", "/staffrequests"]) {
  await nav("ref", baseRef, route);
  await nav("loc", baseLoc, route);
  const ref = await evalOn("ref", PILL_PROBE);
  const loc = await evalOn("loc", PILL_PROBE);
  console.log(`${route}\n  REF ${ref}\n  LOC ${loc}`);
}

// 2. Sidebar footer colors
const FOOTER_PROBE = `(() => {
  const btns = [...document.querySelectorAll("button")].filter(b => { const r = b.getBoundingClientRect(); return r.y > 650 && r.y < 830 && Math.round(r.width) === 36; }).slice(0, 2);
  const nameEl = [...document.querySelectorAll("button p, button div p")].find(p => /sepnetflix/i.test(p.textContent || "") && getComputedStyle(p).fontSize === "14px");
  return JSON.stringify({ bell: btns[0] ? getComputedStyle(btns[0].querySelector("svg")).color : null, moon: btns[1] ? getComputedStyle(btns[1].querySelector("svg")).color : null, name: nameEl ? getComputedStyle(nameEl).color : null });
})()`;
console.log("\n── 2. SIDEBAR FOOTER (expect Bell rgb(71,85,105), Moon rgb(63,63,70), name rgb(63,63,70)) ──");
await nav("loc", baseLoc, "/dashboard");
console.log(`LOC ${await evalOn("loc", FOOTER_PROBE)}`);

// 3. Organogram geometry
const ORG_PROBE = `(() => {
  const p = [...document.querySelectorAll("main p")].find(x => /No reporting structure/.test(x.textContent || ""));
  if (!p) return JSON.stringify({ err: "no empty" });
  const card = p.closest("[class*=rounded-xl]");
  const icon = p.parentElement.querySelector("svg");
  const cr = card.getBoundingClientRect();
  return JSON.stringify({ card: { w: Math.round(cr.width), h: Math.round(cr.height), y: Math.round(cr.y), x: Math.round(cr.x) }, icon: icon ? { w: Math.round(icon.getBoundingClientRect().width), y: Math.round(icon.getBoundingClientRect().y) } : null, pY: Math.round(p.getBoundingClientRect().y), pText: (p.textContent || "").slice(0, 40), h3: card.querySelector("h3") ? "PRESENT" : "none" });
})()`;
console.log("\n── 3. ORGANOGRAM (expect bare ~783x202 card, icon 64, one line, h3 none) ──");
await nav("ref", baseRef, "/organogram");
await nav("loc", baseLoc, "/organogram");
console.log(`REF ${await evalOn("ref", ORG_PROBE)}`);
console.log(`LOC ${await evalOn("loc", ORG_PROBE)}`);
