#!/usr/bin/env node
// probe-r16-refdata.mjs — what data does REF actually carry? Probes the
// surfaces that could hold data (tables, cards, chat, wall, announcements,
// tasks) on both REF and LOC to scope the with-data frontier.
import { execSync } from "node:child_process";

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString();
  } catch (e) {
    return "ERR:" + String(e).slice(0, 100);
  }
}

const PROBE = `(() => {
  const out = { path: location.pathname };
  const rows = [...document.querySelectorAll("main table tbody tr")].filter(tr => tr.offsetParent !== null);
  out.tableRows = rows.length;
  const cards = [...document.querySelectorAll("main .grid > div, main [class*=grid] > div")].filter(c => c.offsetParent !== null && c.getBoundingClientRect().height > 60);
  out.cards = cards.length;
  const h3s = [...document.querySelectorAll("main h3")].filter(h => h.offsetParent !== null).map(h => (h.textContent || "").trim().slice(0, 26)).slice(0, 6);
  out.h3 = h3s;
  const emptyish = (document.body.textContent || "").includes("No ") ? (document.body.textContent.match(/No [a-z ]{3,30}/g) || []).slice(0, 4) : [];
  out.emptyText = emptyish;
  const chatMsgs = [...document.querySelectorAll("[class*=message], [class*=bubble], [class*=chat] li, [class*=post]")].filter(e => e.offsetParent !== null && (e.textContent || "").trim().length > 5).length;
  out.chatish = chatMsgs;
  return JSON.stringify(out);
})()`;

const ROUTES = ["/dashboard", "/employees", "/taskmanager", "/announcements", "/companywall", "/chat", "/surveys", "/loans", "/expenses", "/leavemanagement", "/payroll", "/training", "/recruitment", "/assetmanagement", "/documenttracker", "/workflowautomation", "/communications", "/templates"];

async function measure(session, base, route) {
  run(`agent-browser --session ${session} open "${base}${route}"`);
  await new Promise(r => setTimeout(r, 1800));
  const oneLine = PROBE.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try {
    const j = JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"'));
    return `${j.tableRows}r/${j.cards}c chat=${j.chatish} h3=[${(j.h3 || []).slice(0, 3).join("|")}] empty=[${(j.emptyText || []).slice(0, 2).join("|")}]`;
  } catch {
    return out.slice(0, 80);
  }
}

for (const route of ROUTES) {
  const ref = await measure("ref", "https://eon.base44.app", route);
  const loc = await measure("loc", "http://127.0.0.1:3200", route);
  console.log(`${route.padEnd(22)} REF: ${ref}`);
  console.log(`${"".padEnd(22)} LOC: ${loc}`);
}
