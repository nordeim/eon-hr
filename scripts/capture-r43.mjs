#!/usr/bin/env node
// capture-r43.mjs — session-44 / parity round 43 screenshots (168-171):
// the sidebar shadcn architecture evidence — the expanded sidebar with
// the active custom-primary-bg tile + the open group (the glyph-swapped
// chevron + the no-ul submenu), the collapsed 47px icon rail (the
// round's core — both apps live), the restructured drawer on the mobile
// band, and the rail's group-label/brand collapse detail. REF + LOC
// pairs.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const raw = out.trim(); try { return JSON.parse(raw); } catch { return raw; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const OUT = "/home/z/my-project/eon-hr/docs/screenshots";

async function openBoth(path, vp = [1440, 900]) {
  run(`agent-browser --session ref set viewport ${vp[0]} ${vp[1]}`);
  run(`agent-browser --session ref open ${baseRef}${path}`);
  await new Promise(r => setTimeout(r, 3200));
  run(`agent-browser --session loc set viewport ${vp[0]} ${vp[1]}`);
  run(`agent-browser --session loc open ${baseLoc}${path}`);
  await new Promise(r => setTimeout(r, 2600));
}
const shot = (session, name) => run(`agent-browser --session ${session} screenshot "${OUT}/${name}.png"`);

// ---------- 168: the expanded sidebar — active tile + open group ----------
// /employees: the auto-opened Employees group (chevron-down + the
// no-ul submenu) + the active All Employees custom-primary-bg tile.
await openBoth("/employees");
await shot("ref", "168-ref-sidebar-expanded-active");
await shot("loc", "168b-loc-sidebar-expanded-active");

// ---------- 169: the collapsed 47px icon rail (the round's core) ----------
await evalOn("ref", `(() => { const b = document.querySelector('[data-sidebar="trigger"]'); if (b) b.click(); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 700));
await shot("ref", "169-ref-sidebar-rail-collapsed");
await evalOn("loc", `(() => { const b = document.querySelector('[data-sidebar="trigger"]'); if (b) b.click(); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 700));
await shot("loc", "169b-loc-sidebar-rail-collapsed");

// ---------- 170: the restructured drawer on the mobile band ----------
await openBoth("/employees", [390, 844]);
await evalOn("ref", `(() => { const b = document.querySelector('[data-sidebar="trigger"]'); if (b) b.click(); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 900));
await shot("ref", "170-ref-drawer-mobile-restructure");
await evalOn("loc", `(() => { const b = document.querySelector('[data-sidebar="trigger"]'); if (b) b.click(); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 900));
await shot("loc", "170b-loc-drawer-mobile-restructure");

// ---------- 171: the short-viewport scroll contract (footer pinned) ----------
await openBoth("/employees", [1440, 500]);
await shot("ref", "171-ref-short-viewport-scroll");
await shot("loc", "171b-loc-short-viewport-scroll");

console.log("captures done: 168-171 (8 PNGs)");
