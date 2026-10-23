#!/usr/bin/env node
// r82-attendance-deep.mjs — session 82 / parity round 81: the deep read on
// the /attendance FIND. The boundary-matrix + detail reads surfaced that the
// REF's /attendance renders an ACCESS RESTRICTED state for the seeded user
// (the stats grid + an "Access Restricted" heading — NO records section),
// while the LOC renders the full management UI (Today's Overview + Recent
// Records). The REF's main reads w=1302 (scrollW 1558 constant across
// 1024/1280/1440) — an element in the restricted state authors a 1302px
// min-content. This deep read: (1) the REF's access-restricted DOM (the
// notice structure + the overflow author), (2) the REF user's role evidence
// (/profile), (3) the widest-element census on both sides.
import { execSync } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const b64 = Buffer.from(expr, "utf8").toString("base64"); const out = run(`agent-browser --session ${session} eval -b ${b64}`); const t = out.trim(); try { return JSON.parse(t); } catch { try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } } }

const BASES = { ref: "https://eon.base44.app", loc: "http://127.0.0.1:3200" };

async function openAt(side, route, w) {
  run(`agent-browser --session ${side} set viewport ${w} 1024`);
  run(`agent-browser --session ${side} open ${BASES[side]}${route}`);
  await new Promise(r => setTimeout(r, 800));
  run(`agent-browser --session ${side} set viewport ${w} 1024`);
  await new Promise(r => setTimeout(r, 2600));
}

// 1) The REF's attendance access-restricted state — full structure + the
//    overflow author (the widest leaf/chain element).
await openAt("ref", "/attendance", 1280);
const refRestricted = await evalOn("ref", `(() => {
  const main = document.querySelector('main');
  const h = [...main.querySelectorAll('h1,h2,h3')].map(x => (x.textContent||'').trim()).filter(Boolean);
  const bodyText = (main.innerText || '').replace(/\\s+/g, ' ').slice(0, 400);
  // the widest element census: elements whose scrollWidth exceeds their
  // parent's content width or that approach the page min-content
  const wide = [];
  main.querySelectorAll('*').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width > 1000) {
      wide.push({ tag: el.tagName, w: Math.round(r.width), sw: el.scrollWidth, cls: (el.className||'').toString().replace(/\\s+/g,' ').trim().slice(0,70) });
    }
  });
  return { headings: h, bodyText, wide: wide.slice(0, 14) };
})()`);
console.log("REF /attendance restricted-state:", JSON.stringify(refRestricted, null, 1));

// 2) The REF user's role evidence — /profile text
await openAt("ref", "/profile", 1280);
const refProfile = await evalOn("ref", `(() => {
  const t = (document.querySelector('main') || document.body).innerText || '';
  const lines = t.split('\\n').map(s => s.trim()).filter(Boolean).slice(0, 18);
  const roleish = lines.filter(l => /role|admin|manager|employee|portal|access/i.test(l));
  return { roleish, lines: lines.slice(0, 10) };
})()`);
console.log("\nREF /profile role evidence:", JSON.stringify(refProfile, null, 1));

// 3) The LOC's /attendance — same wide census for the overflow comparison
await openAt("loc", "/attendance", 1280);
const locAttendance = await evalOn("loc", `(() => {
  const main = document.querySelector('main');
  const wide = [];
  main.querySelectorAll('*').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width > 900) {
      wide.push({ tag: el.tagName, w: Math.round(r.width), sw: el.scrollWidth, cls: (el.className||'').toString().replace(/\\s+/g,' ').trim().slice(0,70) });
    }
  });
  const h = [...main.querySelectorAll('h1,h2,h3')].map(x => (x.textContent||'').trim()).filter(Boolean);
  return { headings: h, wide: wide.slice(0, 14) };
})()`);
console.log("\nLOC /attendance wide census:", JSON.stringify(locAttendance, null, 1));

// 4) The REF's /employees content (the matrix read ref grids [] — is the
//    main content empty at rest? read the innerText)
await openAt("ref", "/employees", 1280);
const refEmployees = await evalOn("ref", `(() => {
  const main = document.querySelector('main');
  return { text: (main.innerText || '').replace(/\\s+/g, ' ').slice(0, 300), children: main.children.length, childTags: [...main.children].map(c => c.tagName + '.' + (c.className||'').toString().replace(/\\s+/g,' ').trim().slice(0,40)) };
})()`);
console.log("\nREF /employees main content:", JSON.stringify(refEmployees, null, 1));
process.exit(0);
