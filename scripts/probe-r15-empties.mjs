#!/usr/bin/env node
// probe-r15-empties.mjs — zero-data empty-state recipe audit across pages:
// card geometry, header presence, icon size, text lines. REF vs LOC.
// Usage: node scripts/probe-r15-empties.mjs
const { execSync } = await import("node:child_process");

const PROBE = `(() => {
  const out = { path: location.pathname };
  const emptyP = [...document.querySelectorAll("main p")].find(x => /no |nothing|yet|0 |empty|assign|add |create|start/i.test(x.textContent || "") && x.getBoundingClientRect().y > 150 && (x.textContent || "").trim().length > 8);
  if (!emptyP) { out.empty = null; return JSON.stringify(out); }
  const container = emptyP.closest("div[class*=p-], div[class*=text-center]") || emptyP.parentElement;
  const card = emptyP.closest("[class*=rounded-xl], [class*=border]");
  const cr = card ? card.getBoundingClientRect() : null;
  const icon = container ? container.querySelector("svg") : null;
  const h3 = card ? card.querySelector("h3") : null;
  out.empty = {
    text: (emptyP.textContent || "").trim().slice(0, 34),
    pY: Math.round(emptyP.getBoundingClientRect().y),
    pFs: getComputedStyle(emptyP).fontSize,
    pColor: getComputedStyle(emptyP).color,
    containerCls: container ? String(container.className).slice(0, 40) : null,
    card: cr ? { w: Math.round(cr.width), h: Math.round(cr.height), y: Math.round(cr.y), x: Math.round(cr.x) } : null,
    icon: icon ? { w: Math.round(icon.getBoundingClientRect().width), color: getComputedStyle(icon).color } : null,
    h3: h3 ? { t: h3.textContent.trim().slice(0, 24), y: Math.round(h3.getBoundingClientRect().y) } : null,
    buttons: card ? [...card.querySelectorAll("button")].map(b => ({ t: (b.textContent || "").trim().slice(0, 14), w: Math.round(b.getBoundingClientRect().width), h: Math.round(b.getBoundingClientRect().height) })).slice(0, 3) : [],
  };
  return JSON.stringify(out);
})()`;

const ROUTES = [
  "/expenses", "/loans", "/allleaverequests", "/templates", "/announcements",
  "/payrollmodule", "/hrletters", "/documenttracker", "/offboarding",
  "/evaluations", "/companywall", "/surveys", "/employees",
];

async function measure(session, base, route) {
  try {
    execSync(`agent-browser --session ${session} open "${base + route}"`, { stdio: "pipe", timeout: 45000 });
  } catch { /* continue */ }
  await new Promise(r => setTimeout(r, 2000));
  const oneLine = PROBE.split("\n").join(" ");
  try {
    const out = execSync(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`, { stdio: "pipe", timeout: 30000 });
    return JSON.parse(out.toString().trim().replace(/^"|"$/g, "").replace(/\\"/g, '"'));
  } catch (e) {
    return { error: String(e).slice(0, 60) };
  }
}

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
for (const route of ROUTES) {
  const ref = await measure("ref", baseRef, route);
  const loc = await measure("loc", baseLoc, route);
  const r = ref.empty, l = loc.empty;
  const fmt = (e) => !e ? "none" : `"${e.text}" card ${e.card ? e.card.w + "x" + e.card.h + "@" + e.card.y : "-"} icon ${e.icon ? e.icon.w : "-"} h3 ${e.h3 ? "Y" : "N"} btns ${e.buttons.length}`;
  const match = JSON.stringify(r) === JSON.stringify(l);
  console.log(`${route}\n  REF: ${fmt(r)}\n  LOC: ${fmt(l)} ${match ? "" : "  <-- compare"}`);
}
