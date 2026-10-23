#!/usr/bin/env node
// r82-toolbar-census.mjs — session 82 / parity round 81: the member-level
// census of the /attendance toolbar row (`flex gap-4 items-center` — the
// REF's overflow author at 1204px vs the LOC's 926px, a 278px divergence
// in the row's CONTENT). Reads each child's tag/text/width/height on both
// sides to pin which members differ (a missing toolbar control vs a
// wider select option vs padding).
import { execSync } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const b64 = Buffer.from(expr, "utf8").toString("base64"); const out = run(`agent-browser --session ${session} eval -b ${b64}`); const t = out.trim(); try { return JSON.parse(t); } catch { try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } } }

const BASES = { ref: "https://eon.base44.app", loc: "http://127.0.0.1:3200" };

const CENSUS = `(() => {
  // find the flex gap-4 items-center row (the toolbar)
  const rows = [...document.querySelectorAll('main [class*=flex]')].filter(el => {
    const cls = el.className || '';
    return /flex/.test(cls) && /gap-4/.test(cls) && /items-center/.test(cls) && !/flex-col/.test(cls) && el.getBoundingClientRect().width > 500;
  });
  const row = rows[0];
  if (!row) return { found: false };
  const kids = [...row.children].map(c => {
    const r = c.getBoundingClientRect();
    return {
      tag: c.tagName,
      text: (c.innerText || c.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 40),
      w: Math.round(r.width), h: Math.round(r.height),
      cls: (c.className || '').toString().replace(/\\s+/g, ' ').trim().slice(0, 55)
    };
  });
  const rr = row.getBoundingClientRect();
  return { found: true, row: { w: Math.round(rr.width), h: Math.round(rr.height), cls: (row.className || '').replace(/\\s+/g, ' ').trim().slice(0, 80) }, kids };
})()`;

for (const s of ["ref", "loc"]) {
  run(`agent-browser --session ${s} set viewport 1280 1024`);
  run(`agent-browser --session ${s} open ${BASES[s]}/attendance`);
  await new Promise(r => setTimeout(r, 800));
  run(`agent-browser --session ${s} set viewport 1280 1024`);
  await new Promise(r => setTimeout(r, 2600));
  const read = await evalOn(s, CENSUS);
  console.log(`${s.toUpperCase()} /attendance toolbar census:`, JSON.stringify(read, null, 1));
}
process.exit(0);
