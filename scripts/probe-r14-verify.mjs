#!/usr/bin/env node
// probe-r14-verify.mjs — live verification of every R14-fixed surface:
// recruitment pill+triggers, training row/CTA, performancemanagement pill,
// staffrequests pill x-position, profile general fields + preferences tab,
// compliance notify sizes. Usage: node scripts/probe-r14-verify.mjs
const { execSync } = await import("node:child_process");

async function nav(session, url) {
  try { execSync(`agent-browser --session ${session} open "${url}"`, { stdio: "pipe", timeout: 45000 }); } catch {}
  await new Promise(r => setTimeout(r, 2000));
}

async function evalOn(session, js) {
  const oneLine = js.split("\n").join(" ");
  try {
    const out = execSync(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`, { stdio: "pipe", timeout: 30000 });
    return JSON.parse(out.toString().trim().replace(/^"|"$/g, "").replace(/\\"/g, '"'));
  } catch (e) { return { error: String(e).slice(0, 80) }; }
}

let pass = 0, fail = 0;
function check(name, ref, loc, cmp) {
  const ok = cmp(ref, loc);
  if (ok) pass++; else fail++;
  console.log(`${ok ? "PASS" : "**FAIL**"} ${name} | REF ${JSON.stringify(ref)} | LOC ${JSON.stringify(loc)}`);
}

// ── R14-A recruitment ──
await nav("ref", "https://eon.base44.app/recruitment");
await nav("loc", "http://127.0.0.1:3200/recruitment");
const RECR = `(() => {
  const tl = document.querySelector("main [role=tablist]");
  if (!tl) return null;
  const r = tl.getBoundingClientRect();
  return { pillW: Math.round(r.width), pillBg: getComputedStyle(tl).backgroundColor, border: getComputedStyle(tl).borderTopWidth + " " + getComputedStyle(tl).borderTopColor,
    triggers: [...tl.querySelectorAll("[role=tab]")].map(t => ({ w: Math.round(t.getBoundingClientRect().width), icon: t.querySelector("svg") ? Math.round(t.querySelector("svg").getBoundingClientRect().width) : 0 })) };
})()`;
check("R14-A recruitment pill+triggers", await evalOn("ref", RECR), await evalOn("loc", RECR),
  (a, b) => a && b && a.pillW === b.pillW && a.triggers.every((t, i) => JSON.stringify(t) === JSON.stringify(b.triggers[i])));

// ── R14-B training ──
await nav("ref", "https://eon.base44.app/training");
await nav("loc", "http://127.0.0.1:3200/training");
const TRAIN = `(() => {
  const out = {};
  const h2 = [...document.querySelectorAll("main h2")].find(h => h.offsetParent !== null);
  if (h2) { out.h2rowH = Math.round(h2.parentElement.getBoundingClientRect().height); out.h2y = Math.round(h2.getBoundingClientRect().y); }
  const chipRow = [...document.querySelectorAll("main div")].find(d => d.className && String(d.className).includes("overflow-x-auto"));
  out.chipRowRole = chipRow ? chipRow.getAttribute("role") : null;
  const cta = [...document.querySelectorAll("main button")].find(b => /New Platform/.test(b.textContent || ""));
  out.cta = cta ? { y: Math.round(cta.getBoundingClientRect().y), w: Math.round(cta.getBoundingClientRect().width) } : null;
  const card = h2 ? h2.closest("div").querySelector("div.rounded-xl") || h2.closest("div").parentElement.querySelector("div.rounded-xl") : null;
  if (card) out.cardH = Math.round(card.getBoundingClientRect().height);
  return out;
})()`;
const tr = await evalOn("ref", TRAIN), tl2 = await evalOn("loc", TRAIN);
check("R14-B training h2 row (32px)", tr, tl2, (a, b) => a && b && a.h2rowH === b.h2rowH && a.h2y === b.h2y);
console.log(`       training chip role: REF=${tr.chipRowRole} LOC=${tl2.chipRowRole} | LOC CTA (superset): ${JSON.stringify(tl2.cta)} | REF card ${tr.cardH}px vs LOC ${tl2.cardH}px (CTA superset +~52px documented)`);

// ── R14-C performancemanagement ──
await nav("ref", "https://eon.base44.app/performancemanagement");
await nav("loc", "http://127.0.0.1:3200/performancemanagement");
const PERF = `(() => {
  const tl = document.querySelector("main [role=tablist]");
  if (!tl) return null;
  const r = tl.getBoundingClientRect();
  return { pillW: Math.round(r.width), bg: getComputedStyle(tl).backgroundColor, border: getComputedStyle(tl).borderTopWidth };
})()`;
check("R14-C performancemanagement pill", await evalOn("ref", PERF), await evalOn("loc", PERF),
  (a, b) => a && b && a.pillW === b.pillW && a.bg === b.bg && a.border === b.border);

// ── R14-D staffrequests ──
await nav("ref", "https://eon.base44.app/staffrequests");
await nav("loc", "http://127.0.0.1:3200/staffrequests");
const SR = `(() => {
  const btn = [...document.querySelectorAll("main button")].find(b => /My Requests/.test(b.textContent || ""));
  if (!btn) return null;
  const r = btn.getBoundingClientRect();
  const wrap = btn.parentElement.getBoundingClientRect();
  return { triggerX: Math.round(r.x), triggerW: Math.round(r.width), pillX: Math.round(wrap.x), pillW: Math.round(wrap.width) };
})()`;
check("R14-D staffrequests pill x-position", await evalOn("ref", SR), await evalOn("loc", SR),
  (a, b) => a && b && a.triggerX === b.triggerX && a.pillW === b.pillW);

// ── R14-E profile ──
await nav("ref", "https://eon.base44.app/profile");
await nav("loc", "http://127.0.0.1:3200/profile");
const PROF = `(() => {
  const out = {};
  out.labels = [...document.querySelectorAll("main label")].filter(l => l.offsetParent !== null).map(l => {
    const f = l.parentElement.getBoundingClientRect();
    return { t: l.textContent.trim().slice(0, 12), y: Math.round(f.y), h: Math.round(f.height) };
  });
  const save = [...document.querySelectorAll("main button")].find(b => /save changes/i.test(b.textContent || ""));
  out.save = save ? { y: Math.round(save.getBoundingClientRect().y), w: Math.round(save.getBoundingClientRect().width) } : null;
  return out;
})()`;
check("R14-E profile General fields (4 @540/632 + save 164@724)", await evalOn("ref", PROF), await evalOn("loc", PROF),
  (a, b) => a && b && JSON.stringify(a.labels) === JSON.stringify(b.labels) && JSON.stringify(a.save) === JSON.stringify(b.save));
// also verify the preferences tab renders the lang/tz card on LOC
const PREFCLICK = `(() => {
  const tab = [...document.querySelectorAll("[role=tab]")].find(t => /Preferences/.test(t.textContent || ""));
  if (tab) tab.click();
  return tab ? "clicked" : "no-tab";
})()`;
await evalOn("loc", PREFCLICK);
await new Promise(r => setTimeout(r, 1200));
const PREFCHECK = `(() => {
  const labels = [...document.querySelectorAll("main label")].filter(l => l.offsetParent !== null).map(l => l.textContent.trim());
  return { hasLang: labels.includes("Language"), hasTz: labels.includes("Timezone"), hasNotifCard: [...document.querySelectorAll("main h3, main [class*=font-semibold]")].some(e => /Notification Preferences/i.test(e.textContent || "")) };
})()`;
console.log(`       LOC Preferences tab: ${JSON.stringify(await evalOn("loc", PREFCHECK))}`);

// ── R14-F compliance ──
await nav("ref", "https://eon.base44.app/compliancedashboard");
await nav("loc", "http://127.0.0.1:3200/compliancedashboard");
const COMP = `(() => {
  const btns = [...document.querySelectorAll("main button")].filter(b => b.offsetParent !== null && /notify all/i.test(b.textContent || ""));
  return btns.map(b => { const r = b.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), fs: getComputedStyle(b).fontSize }; });
})()`;
check("R14-F compliance notify buttons (sm, 166/173/173)", await evalOn("ref", COMP), await evalOn("loc", COMP),
  (a, b) => JSON.stringify(a) === JSON.stringify(b));

console.log(`\nVERIFY: ${pass} PASS, ${fail} FAIL`);
