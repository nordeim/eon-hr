#!/usr/bin/env node
// r90-rtl-members-probe.mjs — the DOM-probe triage of the two r89-flagged
// RTL-specific members, cross-side at 390x844 RTL:
//   assetmanagement  — cluster (168,600)-(390,696): the select chevron family
//   allleaverequests — cluster (216,72)-(390,168): the header icon spacing
// Probes: (1) the page's select/button inventory with geometry, (2) the
// header actions row children with computed margins/gaps, (3) the svg census.
import { execSync } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const t = out.trim(); try { return JSON.parse(t); } catch {} try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const PREP = "localStorage.setItem('app_lang','ar'); localStorage.setItem('darkMode','false');";
const pairs = [["ref90rtl", "https://eon.base44.app", "REF"], ["loc90rtl", "http://127.0.0.1:3200", "LOC"]];

const SELECT_PROBE = `(() => {
  const r = (el) => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
  const out = { selects: [], buttons: [], chevrons: [] };
  document.querySelectorAll('button[role=combobox], [data-slot=select-trigger], [data-slot=trigger]').forEach(el => {
    const svg = el.querySelector('svg');
    out.selects.push({ text: (el.textContent || '').trim().slice(0, 30), geo: r(el), svgGeo: svg ? r(svg) : null,
      classes: (el.getAttribute('class') || '').split(' ').slice(0, 8).join(' ') });
  });
  document.querySelectorAll('svg.lucide, svg[class*=chevron], svg[class*=ChevronDown]').forEach(el => {
    const b = el.getBoundingClientRect();
    if (b.width > 0) out.chevrons.push({ geo: { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) },
      cls: (el.getAttribute('class') || '').slice(0, 60) });
  });
  return out;
})()`;

const HEADER_PROBE = `(() => {
  const r = (el) => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
  // the page header: the topmost h1's ancestors' row + its svg children
  const h1 = document.querySelector('h1, [data-slot=card-title], .text-2xl, .text-3xl');
  const out = { h1: null, headerRow: [], svgCensus: [] };
  if (h1) {
    out.h1 = { text: (h1.textContent || '').trim().slice(0, 40), geo: r(h1) };
    // walk up to the flex row containing the title
    let row = h1.closest('div.flex, header div');
    if (row) {
      [...row.children].forEach(ch => {
        const b = ch.getBoundingClientRect();
        out.headerRow.push({ tag: ch.tagName, text: (ch.textContent || '').trim().slice(0, 24), geo: { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) },
          cls: (ch.getAttribute('class') || '').split(' ').slice(0, 6).join(' ') });
      });
    }
  }
  document.querySelectorAll('svg').forEach(el => {
    const b = el.getBoundingClientRect();
    if (b.width > 0 && b.y < 320) out.svgCensus.push({ geo: { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) },
      cls: (el.getAttribute('class') || '').slice(0, 50) });
  });
  return out;
})()`;

for (const [session, base, label] of pairs) {
  console.log(`\n########## ${label} — assetmanagement ##########`);
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/assetmanagement`);
  await new Promise(r => setTimeout(r, 3500));
  run(`agent-browser --session ${session} eval "${PREP}"`);
  await new Promise(r => setTimeout(r, 1200));
  console.log("dir|lang:", await evalOn(session, "document.documentElement.dir + '|' + document.documentElement.lang"));
  console.log("SELECT PROBE:", JSON.stringify(await evalOn(session, SELECT_PROBE), null, 1).slice(0, 2600));
}
for (const [session, base, label] of pairs) {
  console.log(`\n########## ${label} — allleaverequests ##########`);
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/allleaverequests`);
  await new Promise(r => setTimeout(r, 3500));
  run(`agent-browser --session ${session} eval "${PREP}"`);
  await new Promise(r => setTimeout(r, 1200));
  console.log("dir|lang:", await evalOn(session, "document.documentElement.dir + '|' + document.documentElement.lang"));
  console.log("HEADER PROBE:", JSON.stringify(await evalOn(session, HEADER_PROBE), null, 1).slice(0, 2600));
}
process.exit(0);
