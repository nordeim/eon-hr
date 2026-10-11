#!/usr/bin/env node
// probe-r14-data.mjs — data-bearing state audit: REF compliance counters,
// reports tile click behavior, profile save behavior. Usage: node scripts/probe-r14-data.mjs
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

// ── 1. compliance: REF data state (counters, table rows?) ──
await nav("ref", "https://eon.base44.app/compliancedashboard");
await nav("loc", "http://127.0.0.1:3200/compliancedashboard");
const COMP = `(() => {
  const out = {};
  const main = document.querySelector("main");
  const stats = [...main.querySelectorAll("h3, [class*=text-3xl], [class*=text-2xl]")].filter(e => e.offsetParent !== null).slice(0, 8).map(e => ({ t: (e.textContent || "").trim().slice(0, 20), y: Math.round(e.getBoundingClientRect().y) }));
  out.stats = stats;
  const rows = [...main.querySelectorAll("table tbody tr")].filter(r => r.offsetParent !== null);
  out.tableRows = rows.length;
  const counter = [...main.querySelectorAll("span,div,p")].find(e => e.offsetParent !== null && /at-risk documents/i.test(e.textContent || "") && e.children.length === 0);
  out.atRisk = counter ? counter.textContent.trim() : null;
  const notify = [...main.querySelectorAll("button")].filter(b => b.offsetParent !== null && /notify/i.test(b.textContent || "")).map(b => Math.round(b.getBoundingClientRect().width));
  out.notifyWidths = notify;
  return JSON.stringify(out);
})()`;
console.log("── /compliancedashboard REF ──\n" + await evalOn("ref", COMP));
console.log("── /compliancedashboard LOC ──\n" + await evalOn("loc", COMP));

// ── 2. reports: click a CSV tile button on REF — what happens? ──
await nav("ref", "https://eon.base44.app/reports");
const CLICKCSV = `(() => {
  const btn = [...document.querySelectorAll("main button")].find(b => b.offsetParent !== null && /^CSV$/i.test((b.textContent || "").trim()));
  if (!btn) return "no-csv-button";
  btn.click();
  return "clicked";
})()`;
console.log("\n── /reports REF click CSV ──\n" + await evalOn("ref", CLICKCSV));
await new Promise(r => setTimeout(r, 1500));
const TOAST = `(() => {
  const out = {};
  const toasts = [...document.querySelectorAll("[data-sonner-toast], [role=status], .toast, [data-radix-popper-content-wrapper]")].filter(t => t.offsetParent !== null);
  out.toasts = toasts.map(t => (t.textContent || "").trim().slice(0, 80));
  const viewport = document.querySelector("[data-sonner-toaster], .Toaster");
  out.toasterPresent = !!viewport;
  return JSON.stringify(out);
})()`;
console.log("── /reports REF post-click toasts ──\n" + await evalOn("ref", TOAST));
console.log("── /reports LOC post-click toasts (same flow not run — structural) ──\n" + await evalOn("loc", TOAST));

// ── 3. profile: REF save flow — type + click Save Changes ──
await nav("ref", "https://eon.base44.app/profile");
const SAVE = `(() => {
  const btn = [...document.querySelectorAll("main button")].find(b => b.offsetParent !== null && /save changes/i.test(b.textContent || ""));
  return btn ? JSON.stringify({ w: Math.round(btn.getBoundingClientRect().width), h: Math.round(btn.getBoundingClientRect().height), y: Math.round(btn.getBoundingClientRect().y), type: btn.type, disabled: btn.disabled }) : "no-save-button";
})()`;
console.log("\n── /profile REF Save Changes button ──\n" + await evalOn("ref", SAVE));
console.log("── /profile LOC Save Changes button ──\n" + await evalOn("loc", SAVE));
console.log("DATA-AUDIT-DONE");
