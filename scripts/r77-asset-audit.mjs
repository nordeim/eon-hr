#!/usr/bin/env node
// r77-asset-audit.mjs — session 77 / parity round 76 fresh-eyes candidate:
// THE TRANSFER-WEIGHT AUDIT — the first page-weight measurement in the
// parity program (76 rounds of PNG-byte parity, never transfer bytes).
// For each standing surface (login + the 7 standing routes) on BOTH apps,
// load the page in a warm authed browser and read PerformanceResourceTiming
// (performance.getEntriesByType('resource')) — the browser's OWN accounting
// of what it downloaded: request count, transferSize total (network bytes),
// decodedBodySize total (on-wire → in-memory), and the biggest 3 assets.
// Purpose: (a) record REF's weight per route (the reference economy);
// (b) confirm LOC's production page-weight is healthy (production-ready
// superset — no bloated route, no accidental mega-chunk); (c) any anomaly
// becomes a finding; parity is NOT the goal here (different bundlers ship
// different graphs — Vite/base44 vs Next standalone) — the goal is
// production-readiness evidence on the LOC side + the REF record.
// Usage: node scripts/r77-asset-audit.mjs   (needs :3200 up + both sessions authed)
import { execSync } from "node:child_process";
function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim()); } catch { try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const ROUTES = ["/login", "/dashboard", "/payroll", "/employees", "/attendance", "/training", "/recruitment", "/settings"];

const READ = `(() => {
  const nav = performance.getEntriesByType('navigation')[0] || {};
  const rs = performance.getEntriesByType('resource');
  const sameOrigin = rs.filter(e => new URL(e.name, location.origin).origin === location.origin);
  const xfer = sameOrigin.reduce((a, e) => a + (e.transferSize || 0), 0);
  const dec = sameOrigin.reduce((a, e) => a + (e.decodedBodySize || 0), 0);
  const top = sameOrigin.slice().sort((a, b) => (b.transferSize||0) - (a.transferSize||0)).slice(0, 3)
    .map(e => ({ n: new URL(e.name).pathname.split('/').pop().slice(0, 42), t: e.transferSize || 0 }));
  return { htmlXfer: nav.transferSize || 0, reqs: sameOrigin.length, xfer, dec, top };
})()`;

async function measure(label, session, base, route) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}${route}`);
  await new Promise(r => setTimeout(r, 4200));
  // a second read after network settles (lazy chunks arrive post-hydration)
  const first = await evalOn(session, READ);
  await new Promise(r => setTimeout(r, 1800));
  const second = await evalOn(session, READ);
  const m = second.reqs >= first.reqs ? second : first;
  const kb = (b) => (b / 1024).toFixed(1) + " KiB";
  console.log(`${label.padEnd(4)} ${route.padEnd(13)} html=${kb(m.htmlXfer).padStart(9)} reqs=${String(m.reqs).padStart(3)} transfer=${kb(m.xfer).padStart(9)} decoded=${kb(m.dec).padStart(10)} | top: ${m.top.map(t => t.n + "(" + kb(t.t) + ")").join(", ")}`);
  return m;
}

console.log("=== REF (eon.base44.app — the reference economy) ===");
const ref = {};
for (const r of ROUTES) ref[r] = await measure("REF", "ref", baseRef, r);
console.log("\n=== LOC (:3200 standalone — the production-ready superset) ===");
const loc = {};
for (const r of ROUTES) loc[r] = await measure("LOC", "loc", baseLoc, r);

console.log("\n=== VERDICT (LOC production-readiness screen) ===");
const findings = [];
for (const r of ROUTES) {
  const l = loc[r];
  if (l && !l.error) {
    const totalKiB = (l.htmlXfer + l.xfer) / 1024;
    if (totalKiB > 2048) findings.push(`${r}: total ${totalKiB.toFixed(0)} KiB > 2 MiB — bloat suspicion`);
    const mega = (l.top || []).find(t => t.t > 1500 * 1024);
    if (mega) findings.push(`${r}: single asset > 1.5 MiB — ${mega.n}`);
  } else findings.push(`${r}: read error`);
}
console.log(findings.length ? findings.join("\n") : "ALL ROUTES HEALTHY — no route over 2 MiB total transfer, no single asset over 1.5 MiB (the fresh-eyes screen)");
console.log("\n(ref totals for the record: " + ROUTES.map(r => r + "=" + ((ref[r].htmlXfer + ref[r].xfer) / 1024).toFixed(0) + "KiB").join(" · ") + ")");
process.exit(0);
