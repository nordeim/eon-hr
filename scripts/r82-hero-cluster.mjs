#!/usr/bin/env node
// r82-hero-cluster.mjs — session 82 / parity round 81: the page-header row
// census on /attendance. The REF's page min-content is 1238 (scrollW 1558
// constant across every band) vs the LOC's ~975 (the r81-measured 1231 at
// 768) — a ~327px delta. The toolbar children are identical (296px), the
// grids have no floor (the r81 clamp proof) — so the delta lives in the
// page-header ROW: the hero block (icon+title+subtitle) and/or the actions
// cluster. This census reads both members' min-content on both sides.
import { execSync } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const b64 = Buffer.from(expr, "utf8").toString("base64"); const out = run(`agent-browser --session ${session} eval -b ${b64}`); const t = out.trim(); try { return JSON.parse(t); } catch { try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } } }

const BASES = { ref: "https://eon.base44.app", loc: "http://127.0.0.1:3200" };

const CENSUS = `(() => {
  // the page-header row: the md:flex-row justify-between row
  const rows = [...document.querySelectorAll('main [class*=md\\\\:flex-row]')].filter(el => {
    const cls = el.className || '';
    return /justify-between/.test(cls) && /items-start/.test(cls) && el.getBoundingClientRect().width > 0;
  });
  const row = rows[0];
  if (!row) return { found: false };
  const kids = [...row.children].map(c => {
    const r = c.getBoundingClientRect();
    // the min-content: measure with a transient clamp
    const old = c.style.width; c.style.width = 'min-content';
    const mc = Math.round(c.getBoundingClientRect().width);
    c.style.width = old;
    return {
      tag: c.tagName, text: (c.innerText || '').replace(/\\s+/g, ' ').trim().slice(0, 44),
      w: Math.round(r.width), h: Math.round(r.height), minContent: mc,
      cls: (c.className || '').toString().replace(/\\s+/g, ' ').trim().slice(0, 70)
    };
  });
  // the row's own min-content
  const old = row.style.width; row.style.width = 'min-content';
  const rowMC = Math.round(row.getBoundingClientRect().width);
  row.style.width = old;
  // the actions cluster if it's a grandchild (buttons row)
  const cluster = [...row.querySelectorAll('div')].filter(el => /^flex gap-3$/.test((el.className || '').toString().trim()));
  const clusterInfo = cluster.length ? cluster.map(c => {
    const old2 = c.style.width; c.style.width = 'min-content';
    const mc = Math.round(c.getBoundingClientRect().width);
    c.style.width = old2;
    return { w: Math.round(c.getBoundingClientRect().width), minContent: mc, buttons: [...c.children].map(b => (b.innerText || '').replace(/\\s+/g, ' ').trim().slice(0, 22)) };
  }) : null;
  return { found: true, row: { w: Math.round(row.getBoundingClientRect().width), minContent: rowMC, cls: (row.className || '').replace(/\\s+/g, ' ').trim().slice(0, 90) }, kids, cluster: clusterInfo };
})()`;

for (const s of ["ref", "loc"]) {
  run(`agent-browser --session ${s} set viewport 1280 1024`);
  run(`agent-browser --session ${s} open ${BASES[s]}/attendance`);
  await new Promise(r => setTimeout(r, 800));
  run(`agent-browser --session ${s} set viewport 1280 1024`);
  await new Promise(r => setTimeout(r, 2600));
  const read = await evalOn(s, CENSUS);
  console.log(`\n${s.toUpperCase()} /attendance page-header row:`, JSON.stringify(read, null, 1));
}
process.exit(0);
