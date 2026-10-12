#!/usr/bin/env node
// probe-r24-a11y.mjs — session-25 / parity round 24: the FIRST a11y-attribute
// dimension audit (session_40's suggested next: "the aria-*/a11y attribute
// dimension (labels, describedby, roles were never swept as a family)").
// Stage 1: role attribute census (which implicit roles are EXPLICIT on each side)
// Stage 2: aria-* attribute census (label, expanded, controls, current, hidden,
//          describedby, labelledby, modal, selected, orientation, live)
// Stage 3: label/alt wiring (htmlFor/id pairs, img alt, button accessible names)
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const CENSUS = `(() => {
  const roles = {}; const arias = {}; const labels = { htmlFor: 0, imgAlt: 0, imgNoAlt: 0, btnNoName: 0, btnNamed: 0 };
  for (const el of document.querySelectorAll('body *')) {
    if (el.offsetParent === null && el.tagName !== 'BODY' && !el.closest('[role=dialog]')) continue;
    const role = el.getAttribute('role');
    if (role) roles[role] = (roles[role] || 0) + 1;
    for (const a of el.attributes) {
      if (a.name.startsWith('aria-')) arias[a.name] = (arias[a.name] || 0) + 1;
    }
    if (el.tagName === 'LABEL' && el.getAttribute('for')) labels.htmlFor++;
    if (el.tagName === 'IMG') { if (el.getAttribute('alt') !== null) labels.imgAlt++; else labels.imgNoAlt++; }
    if (el.tagName === 'BUTTON') {
      const name = el.getAttribute('aria-label') || el.textContent.trim() || el.getAttribute('title');
      if (name) labels.btnNamed++; else labels.btnNoName++;
    }
  }
  return JSON.stringify({ roles, arias, labels });
})()`;

const ROUTES = ["/dashboard", "/employees", "/settings", "/payroll"];
const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

const acc = { ref: { roles: {}, arias: {}, labels: {} }, loc: { roles: {}, arias: {}, labels: {} } };
for (const route of ROUTES) {
  for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
    run(`agent-browser --session ${s} set viewport 1280 900`);
    run(`agent-browser --session ${s} open "${base}${route}"`);
    await new Promise(r => setTimeout(r, 3000));
    const c = await evalOn(s, CENSUS);
    if (c.error) { console.log(`${s} ${route} ERROR ${c.error}`); continue; }
    for (const [k, v] of Object.entries(c.roles || {})) acc[s].roles[k] = (acc[s].roles[k] || 0) + v;
    for (const [k, v] of Object.entries(c.arias || {})) acc[s].arias[k] = (acc[s].arias[k] || 0) + v;
    for (const [k, v] of Object.entries(c.labels || {})) acc[s].labels[k] = (acc[s].labels[k] || 0) + v;
  }
  console.log(`census ${route} done`);
}
console.log("\n===== ROLE CENSUS (4 routes summed) =====");
const allRoles = new Set([...Object.keys(acc.ref.roles), ...Object.keys(acc.loc.roles)]);
for (const r of [...allRoles].sort()) console.log(`${r.padEnd(16)} ref=${acc.ref.roles[r] || 0}  loc=${acc.loc.roles[r] || 0}  ${acc.ref.roles[r] === acc.loc.roles[r] ? "" : "  <-- DIFF"}`);
console.log("\n===== ARIA CENSUS (4 routes summed) =====");
const allArias = new Set([...Object.keys(acc.ref.arias), ...Object.keys(acc.loc.arias)]);
for (const a of [...allArias].sort()) console.log(`${a.padEnd(22)} ref=${acc.ref.arias[a] || 0}  loc=${acc.loc.arias[a] || 0}  ${acc.ref.arias[a] === acc.loc.arias[a] ? "" : "  <-- DIFF"}`);
console.log("\n===== LABEL WIRING =====");
console.log("ref", JSON.stringify(acc.ref.labels), " loc", JSON.stringify(acc.loc.labels));
