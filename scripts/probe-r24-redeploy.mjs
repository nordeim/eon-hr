#!/usr/bin/env node
// probe-r24-redeploy.mjs — session-25 / parity round 24 redeploy check:
// 12 canonical routes, h1 text + font + x/y byte-comparison on both apps.
// Reuses the documented probe rules: single-quoted browser JS, settled reads.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const ROUTES = ["/dashboard", "/employees", "/payroll", "/taskmanager", "/leavemanagement", "/expenses", "/loans", "/attendance", "/settings", "/profile", "/compliancedashboard", "/reports"];

const READER = `(() => { const h = [...document.querySelectorAll('h1')].find(h => h.offsetParent !== null); if (!h) return JSON.stringify({found:false}); const cs = getComputedStyle(h); const r = h.getBoundingClientRect(); return JSON.stringify({found:true, t: h.textContent.trim().split(String.fromCharCode(10)).join(' ').replace(/ +/,' ').slice(0,30), f: cs.fontSize + '/' + cs.fontWeight, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width)}); })()`;

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
let pass = 0;
for (const route of ROUTES) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  await new Promise(r => setTimeout(r, 3000));
  const r1 = await evalOn("ref", READER);
  run(`agent-browser --session loc open "${baseLoc}${route}"`);
  await new Promise(r => setTimeout(r, 2800));
  const l1 = await evalOn("loc", READER);
  const same = r1.found && l1.found && r1.t === l1.t && r1.f === l1.f && r1.x === l1.x && r1.y === l1.y;
  if (same) pass++;
  console.log(`${route.padEnd(22)} ${same ? "MATCH" : "**DIFF**"} ref=${JSON.stringify(r1)} loc=${JSON.stringify(l1)}`);
}
console.log(`\n${pass}/${ROUTES.length} MATCH`);
