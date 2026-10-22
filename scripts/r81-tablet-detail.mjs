#!/usr/bin/env node
// r81-tablet-detail.mjs — session 81 / parity round 80: the TABLET MATRIX
// detail read. The raw matrix flagged 10 routes; the classification needs
// the overflow AUTHOR per route on each side: the widest leaf element
// inside main (tag + class family + the computed min-width) — the
// same-author test from the r80 /careers protocol. If the REF's author is
// the table/card min-width family and the LOC's equivalent element carries
// the same class (just narrower under seed data), the delta is
// DATA-AUTHORED; if the LOC's element lacks the class the REF's carries,
// that is a CLONE-AUTHORED defect.
import { execSync } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const b64 = Buffer.from(expr, "utf8").toString("base64"); const out = run(`agent-browser --session ${session} eval -b ${b64}`); const t = out.trim(); try { return JSON.parse(t); } catch { try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } } }

const ROUTES = ["/employees", "/payroll", "/taskmanager", "/attendance", "/recruitment", "/training", "/documenttracker", "/profile", "/settings", "/careers"];
const BASES = { ref: "https://eon.base44.app", loc: "http://127.0.0.1:3200" };

// The widest-author census: walk main's descendants, find the elements
// whose bounding width is the page's max (the overflow authors), report
// tag + the FIRST 4 classes + computed min-width + a text snippet.
const AUTHORS = `(() => {
  const main = document.querySelector('main');
  if (!main) return { error: 'no main' };
  const max = document.documentElement.scrollWidth;
  const authors = [];
  const walk = (el) => {
    for (const c of el.children) {
      const r = c.getBoundingClientRect();
      if (r.width >= max - 2 || r.width >= 500) {
        authors.push({
          tag: c.tagName.toLowerCase(),
          cls: (c.className || '').toString().replace(/\\s+/g, ' ').trim().split(' ').slice(0, 5).join(' '),
          w: Math.round(r.width),
          minW: getComputedStyle(c).minWidth,
          snippet: (c.textContent || '').trim().slice(0, 30).replace(/\\s+/g, ' ')
        });
      }
      if (authors.length < 400) walk(c);
    }
  };
  walk(main);
  // keep the widest 6 leaves
  authors.sort((a, b) => b.w - a.w);
  return { scrollW: document.documentElement.scrollWidth, authors: authors.slice(0, 6) };
})()`;

for (const s of ["ref", "loc"]) {
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false')"`);
  run(`agent-browser --session ${s} set viewport 768 1024`);
}

for (const route of ROUTES) {
  for (const s of ["ref", "loc"]) {
    run(`agent-browser --session ${s} open ${BASES[s]}${route}`);
    await new Promise(r => setTimeout(r, 800));
    run(`agent-browser --session ${s} set viewport 768 1024`);
    await new Promise(r => setTimeout(r, 2600));
    const read = await evalOn(s, AUTHORS);
    console.log(`${s} ${route} (scrollW ${read.scrollW}):`);
    for (const a of (read.authors || [])) console.log(`   ${a.w}px minW=${a.minW} <${a.tag}> ${a.cls} — "${a.snippet}"`);
  }
  console.log("");
}
process.exit(0);
