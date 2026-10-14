#!/usr/bin/env node
// capture-r40.mjs — session-41 / parity round 40 screenshots (156-159):
// the careers board pair (with-data via an API-seeded job), the mobile
// hero pair (the round's pixel-diff frontier closure), the org view pair,
// and the external application pair. The seeded job is deleted after.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const OUT = "/home/z/my-project/eon-hr/docs/screenshots";

// seed the with-data job on LOC
run(`agent-browser --session loc set viewport 1440 900`);
run(`agent-browser --session loc open ${baseLoc}/careers`);
await new Promise(r => setTimeout(r, 3000));
const seeded = await evalOn("loc", `(() => fetch('/api/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'System Admin', company: 'Company', department: 'IT', location: 'Jeddah', type: 'full_time', status: 'open', salaryRange: '12000-15000', description: 'We are looking for a detail-oriented and technology-forward administrator to join our growing platform team. You will own critical infrastructure, mentor peers, and shape the engineering culture across the organization.' }) }).then(r => r.json()).then(j => JSON.stringify(j)))()`);
let jobId = null;
try { jobId = JSON.parse(typeof seeded === "string" ? seeded : JSON.stringify(seeded)).data?.job?.id ?? null; } catch {}
console.log(`seeded: ${jobId}`);

// 156: the careers board pair (desktop, with-data on both)
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session ref open ${baseRef}/careers`);
await new Promise(r => setTimeout(r, 4000));
run(`agent-browser --session loc reload`);
await new Promise(r => setTimeout(r, 3000));
run(`agent-browser --session ref screenshot ${OUT}/156-ref-careers-board.png`);
run(`agent-browser --session loc screenshot ${OUT}/156b-loc-careers-board.png`);
console.log("156 captured");

// 157: the mobile hero pair (390x844 — the pixel-diff closure)
run(`agent-browser --session ref set viewport 390 844`);
run(`agent-browser --session ref open ${baseRef}/careers`);
await new Promise(r => setTimeout(r, 4000));
run(`agent-browser --session loc set viewport 390 844`);
run(`agent-browser --session loc open ${baseLoc}/careers`);
await new Promise(r => setTimeout(r, 3000));
run(`agent-browser --session ref screenshot ${OUT}/157-ref-careers-hero-mobile.png`);
run(`agent-browser --session loc screenshot ${OUT}/157b-loc-careers-hero-mobile.png`);
console.log("157 captured");

// 158: the org view pair (mobile — the wrapper rhythm + the seeded org view)
await evalOn("ref", `(() => { const chips = [...document.querySelectorAll('button')].filter(b => { const p = b.parentElement; return p && /flex-wrap/.test((p.className||'')); }); const t = chips.find(c => c.textContent.trim() === 'Company') || chips[0]; t.click(); return 'ok'; })()`);
await evalOn("loc", `(() => { const chips = [...document.querySelectorAll('button')].filter(b => { const p = b.parentElement; return p && /flex-wrap/.test((p.className||'')); }); const t = chips.find(c => c.textContent.trim() === 'Company') || chips[0]; t.click(); return 'ok'; })()`);
await new Promise(r => setTimeout(r, 2500));
run(`agent-browser --session ref screenshot ${OUT}/158-ref-careers-orgview-mobile.png`);
run(`agent-browser --session loc screenshot ${OUT}/158b-loc-careers-orgview-mobile.png`);
console.log("158 captured");

// 159: the external application pair (desktop)
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session ref open ${baseRef}/externaljobapplication`);
await new Promise(r => setTimeout(r, 4000));
run(`agent-browser --session loc set viewport 1440 900`);
run(`agent-browser --session loc open ${baseLoc}/externaljobapplication`);
await new Promise(r => setTimeout(r, 3000));
run(`agent-browser --session ref screenshot ${OUT}/159-ref-externaljob.png`);
run(`agent-browser --session loc screenshot ${OUT}/159b-loc-externaljob.png`);
console.log("159 captured");

// cleanup
if (jobId) {
  await evalOn("loc", `(() => fetch('/api/jobs?id=${jobId}', { method: 'DELETE' }).then(r => r.json()).then(j => JSON.stringify(j)))()`);
  console.log("seeded job deleted");
}
