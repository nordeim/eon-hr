#!/usr/bin/env node
// probe-r14-dump4.mjs — REF training platform card content + LOC profile
// Preferences tab structure (where Language/Timezone should live).
// Usage: node scripts/probe-r14-dump4.mjs
const { execSync } = await import("node:child_process");

async function nav(session, url) {
  try { execSync(`agent-browser --session ${session} open "${url}"`, { stdio: "pipe", timeout: 45000 }); } catch {}
  await new Promise(r => setTimeout(r, 1800));
}

async function evalOn(session, js) {
  const oneLine = js.split("\n").join(" ");
  try {
    const out = execSync(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`, { stdio: "pipe", timeout: 30000 });
    return out.toString().trim().replace(/^"|"$/g, "").replace(/\\"/g, '"');
  } catch (e) { return "ERR " + String(e).slice(0, 80); }
}

// ── 1. REF training: the card under the h2 (empty state? data cards?) ──
await nav("ref", "https://eon.base44.app/training");
const T3 = `(() => {
  const out = {};
  const h2 = [...document.querySelectorAll("main h2")].find(h => h.offsetParent !== null);
  if (h2) {
    let card = h2.closest("div").nextElementSibling;
    while (card && card.getBoundingClientRect().height < 40) card = card.nextElementSibling;
    if (card) {
      const r = card.getBoundingClientRect();
      out.card = { y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), cls: card.className.slice(0, 90) };
      out.text = (card.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 160);
      out.svgs = [...card.querySelectorAll("svg")].map(s => Math.round(s.getBoundingClientRect().width)).slice(0, 4);
    }
  }
  return JSON.stringify(out);
})()`;
console.log("── /training REF platform card ──\n" + await evalOn("ref", T3));

// ── 2. LOC profile: Preferences tab content (click it) ──
await nav("loc", "http://127.0.0.1:3200/profile");
// find the Preferences tab trigger and click it
const CLICK = `(() => {
  const tabs = [...document.querySelectorAll("[role=tab]")].filter(t => t.offsetParent !== null);
  const pref = tabs.find(t => /Preferences/i.test(t.textContent || ""));
  if (pref) { pref.click(); return "clicked:" + pref.textContent.trim(); }
  return "not-found:" + tabs.map(t => t.textContent.trim()).join(",");
})()`;
console.log("\n── /profile LOC click Preferences ──\n" + await evalOn("loc", CLICK));
await new Promise(r => setTimeout(r, 1200));
const PREF = `(() => {
  const out = {};
  const labels = [...document.querySelectorAll("main label")].filter(l => l.offsetParent !== null);
  out.labels = labels.map(l => ({ t: l.textContent.trim().slice(0, 18), y: Math.round(l.getBoundingClientRect().y) }));
  const sel = [...document.querySelectorAll("main select,[role=combobox]")].filter(s => s.offsetParent !== null);
  out.selects = sel.length;
  return JSON.stringify(out);
})()`;
console.log("── /profile LOC Preferences tab content ──\n" + await evalOn("loc", PREF));
console.log("DUMP4-DONE");
