#!/usr/bin/env node
// probe-r18-sub390.mjs — FIRST sub-390 band sweep (session 19 / round 18).
// The viewport matrix covered 390..1440; the 320–389 small-phone band has
// never been audited. Key surfaces at 320/344/360/375/389: docW (overflow),
// top bar, bottom tabs, kicker geometry, page content fit. REF vs LOC.
import { execSync } from "node:child_process";

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString();
  } catch (e) {
    return "ERR:" + String(e).slice(0, 140);
  }
}

async function evalOn(session, expr, ms = 1200) {
  await new Promise(r => setTimeout(r, ms));
  const oneLine = expr.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try {
    return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " "));
  } catch {
    return { error: out.slice(0, 120) };
  }
}

// compact page probe: docW, top bar, tabs, kicker, h1, first card
const PAGE = `(() => {
  const out = { url: location.pathname };
  out.docW = document.documentElement.scrollWidth;
  out.vw = window.innerWidth;
  const bar = [...document.querySelectorAll("header,div")].find(d => {
    if (d.tagName !== "HEADER" && !(d.getBoundingClientRect().height > 55 && d.getBoundingClientRect().height < 95)) return false;
    const r = d.getBoundingClientRect(); const cs = getComputedStyle(d);
    return r.y < 10 && r.width > 250 && r.width <= out.vw && (d.tagName === "HEADER" || cs.position === "sticky" || cs.position === "fixed");
  });
  if (bar) { const r = bar.getBoundingClientRect(); out.topBar = { w: Math.round(r.width), h: Math.round(r.height) }; }
  const tabs = [...document.querySelectorAll("a")].filter(a => { const r = a.getBoundingClientRect(); return r.y > 700 && r.y < 840 && r.width > 40 && a.offsetParent !== null; });
  out.tabCount = tabs.length;
  if (tabs.length) out.tabXs = tabs.slice(0, 5).map(a => Math.round(a.getBoundingClientRect().x));
  const kick = [...document.querySelectorAll("div")].find(d => {
    const cs = getComputedStyle(d); const r = d.getBoundingClientRect();
    return cs.display !== "none" && r.y >= 80 && r.y <= 125 && r.height >= 45 && r.height <= 75 && cs.backgroundColor === "rgb(255, 255, 255)" && cs.borderBottomWidth === "1px";
  });
  if (kick) { const r = kick.getBoundingClientRect(); out.kicker = { h: Math.round(r.height), y: Math.round(r.y) };
    const h1 = kick.querySelector("h1");
    if (h1) { const hr = h1.getBoundingClientRect(); out.kickH1 = { w: Math.round(hr.width), wraps: hr.height > 30 }; } }
  const h1 = [...document.querySelectorAll("h1")].find(h => h.offsetParent !== null && h.getBoundingClientRect().y > 60);
  if (h1) { const hr = h1.getBoundingClientRect(); out.pageH1 = { w: Math.round(hr.width), h: Math.round(hr.height), wraps: hr.height > 40 }; }
  const card = document.querySelector("[class*=rounded-xl]");
  if (card) { const r = card.getBoundingClientRect(); out.card = { x: Math.round(r.x), w: Math.round(r.width) }; }
  return JSON.stringify(out);
})()`;

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

// representative route set: shell + stat rows + header clusters + pills + calendar/kanban (overflow-prone)
const ROUTES = [
  "/dashboard", "/employees", "/payroll", "/attendance", "/staffrequests",
  "/documenttracker", "/shiftcalendar", "/recruitmentkanban", "/settings", "/profile",
];

const WIDTHS = [320, 344, 360, 389];

for (const w of WIDTHS) {
  console.log(`\n════ WIDTH ${w} ════`);
  for (const route of ROUTES) {
    for (const [tag, session, base] of [["REF", "ref", baseRef], ["LOC", "loc", baseLoc]]) {
      run(`agent-browser --session ${session} set viewport ${w} 844`);
      run(`agent-browser --session ${session} open "${base}${route}"`);
    }
    // settle ≥2.2s (the 61px mid-hydration artifact lesson)
    const ref = await evalOn("ref", PAGE, 2400);
    const loc = await evalOn("loc", PAGE, 400);
    const cmp = (a, b, keys) => keys.every(k => JSON.stringify(a[k]) === JSON.stringify(b[k]));
    const keys = ["docW", "topBar", "tabCount", "tabXs", "kicker", "kickH1", "pageH1", "card"];
    const ok = cmp(ref, loc, keys);
    const flags = [];
    if (ref.docW > ref.vw) flags.push("REF-overflow");
    if (loc.docW > loc.vw) flags.push("LOC-overflow");
    console.log(`${route} | ${ok ? "MATCH" : "**DIFF**"} ${flags.join(",") || ""} | REF docW=${ref.docW} kick=${ref.kicker ? ref.kicker.h : "-"} h1w=${ref.pageH1 ? ref.pageH1.w : "-"}${ref.pageH1 && ref.pageH1.wraps ? "(WRAP)" : ""} | LOC docW=${loc.docW} kick=${loc.kicker ? loc.kicker.h : "-"} h1w=${loc.pageH1 ? loc.pageH1.w : "-"}${loc.pageH1 && loc.pageH1.wraps ? "(WRAP)" : ""}`);
    if (!ok) {
      console.log(`   REF: ${JSON.stringify(ref)}`);
      console.log(`   LOC: ${JSON.stringify(loc)}`);
    }
  }
}

run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session loc set viewport 1440 900`);
console.log("\nSUB390-SWEEP-DONE");
