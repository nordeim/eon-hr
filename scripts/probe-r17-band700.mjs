#!/usr/bin/env node
// probe-r17-band700.mjs — the never-swept 640–767 band. REF's header rows
// switch flex-col → flex-row at md (768); the clone's PageHeader row switches
// at sm (640). If confirmed, every non-kicker page with actions renders
// COLUMN on REF and ROW on LOC between 640 and 767.
import { execSync } from "node:child_process";

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString();
  } catch (e) {
    return "ERR:" + String(e).slice(0, 100);
  }
}

const PROBE = `(() => {
  const h1 = [...document.querySelectorAll("h1")].find(h => h.offsetParent !== null);
  if (!h1) return JSON.stringify({ noH1: true });
  const row = h1.closest(".flex, [class*=flex]");
  const out = { h1: { t: h1.textContent.trim().slice(0, 20) } };
  if (row) { const r = row.getBoundingClientRect(); const cs = getComputedStyle(row);
    out.row = { cls: String(row.className).slice(0, 60), dir: cs.flexDirection, w: Math.round(r.width), h: Math.round(r.height) }; }
  const hdr = h1.parentElement?.parentElement;
  if (hdr) { const hr = hdr.getBoundingClientRect(); const hcs = getComputedStyle(hdr);
    out.header = { dir: hcs.flexDirection, w: Math.round(hr.width), h: Math.round(hr.height), x: Math.round(hr.x), y: Math.round(hr.y) };
    const kids = [...hdr.children].map(c => { const cr = c.getBoundingClientRect(); return { x: Math.round(cr.x), y: Math.round(cr.y), w: Math.round(cr.width) }; });
    out.kids = kids; }
  const btn = [...document.querySelectorAll("main button")].find(b => b.getBoundingClientRect().y < 300 && b.getBoundingClientRect().width > 80);
  if (btn) { const br = btn.getBoundingClientRect(); out.firstBtn = { t: (btn.textContent || "").trim().slice(0, 12), x: Math.round(br.x), y: Math.round(br.y) }; }
  return JSON.stringify(out);
})()`;

async function measure(session, base, route, vp) {
  run(`agent-browser --session ${session} set viewport ${vp} 844`);
  run(`agent-browser --session ${session} open "${base}${route}"`);
  await new Promise(r => setTimeout(r, 1500));
  const oneLine = PROBE.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try {
    return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " "));
  } catch {
    return { error: out.slice(0, 100) };
  }
}

const ROUTES = ["/payrollmodule", "/documenttracker", "/recruitmentkanban", "/employees", "/attendance", "/expenses", "/surveys", "/assetmanagement", "/attendancedashboard", "/templates", "/loans", "/hrletters"];
const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const VP = 700;
console.log(`═══ 640–767 band probe @${VP} (mobile chrome active, full headers) ═══`);
let diffs = 0;
for (const route of ROUTES) {
  const ref = await measure("ref", baseRef, route, VP);
  const loc = await measure("loc", baseLoc, route, VP);
  if (ref.error || loc.error || ref.noH1 || loc.noH1) { console.log(`SKIP  ${route} (${ref.noH1 || loc.noH1 ? "no h1" : "err"})`); continue; }
  const rDir = ref.header?.dir, lDir = loc.header?.dir;
  const match = rDir === lDir;
  if (!match) diffs++;
  console.log(`${match ? "OK   " : "DIFF "} ${route} | REF ${rDir} w${ref.header?.w} kids@y${ref.kids?.map(k => k.y).join("/")} btn@${ref.firstBtn?.x},${ref.firstBtn?.y} | LOC ${lDir} w${loc.header?.w} kids@y${loc.kids?.map(k => k.y).join("/")} btn@${loc.firstBtn?.x},${loc.firstBtn?.y}`);
}
console.log(`\nBAND700: ${diffs} header-direction diffs of ${ROUTES.length} probed`);
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session loc set viewport 1440 900`);
