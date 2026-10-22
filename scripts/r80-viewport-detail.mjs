#!/usr/bin/env node
// r80-viewport-detail.mjs — session 80 / parity round 79: the DETAIL READ
// for the mobile viewport matrix's six FINDs. Five routes overflow on BOTH
// sides (attendance 943/503, recruitment 550/550, training 600/600,
// profile 539/549, settings 1003/1003 — candidate REF-authored parity);
// /careers DIVERGES (ref main 602 > 390, loc main 390 = fits). This read
// walks each flagged route on each side at 390x844 and lists the elements
// whose right edge exceeds the viewport (the overflow authors), with tag +
// class + geometry, so each FIND classifies as REF-authored (the platform
// overflows the same way — or more) vs clone-authored (the LOC renders a
// DIFFERENT responsive behavior than the REF).
import { execSync } from "node:child_process";

function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const b64 = Buffer.from(expr, "utf8").toString("base64"); const out = run(`agent-browser --session ${session} eval -b ${b64}`); const t = out.trim(); try { return JSON.parse(t); } catch { try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } } }

const ROUTES = ["/attendance", "/recruitment", "/training", "/profile", "/settings", "/careers"];
const BASES = { ref: "https://eon.base44.app", loc: "http://127.0.0.1:3200" };

const OVERFLOW_AUTHORS = `(() => {
  const vw = window.innerWidth;
  const out = [];
  const all = document.querySelectorAll('main *');
  for (const el of all) {
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1 && r.width > 20) {
      // only the OUTERMOST authors: skip elements whose parent is also an author
    }
  }
  // simpler + more robust: walk main's subtree, collect authors, then filter
  const authors = [];
  for (const el of all) {
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1 && r.width > 20) authors.push(el);
  }
  const outermost = authors.filter(el => {
    let p = el.parentElement;
    while (p) { if (authors.includes(p)) return false; p = p.parentElement; }
    return true;
  });
  return outermost.slice(0, 6).map(el => {
    const r = el.getBoundingClientRect();
    return { tag: el.tagName, cls: (el.className || '').toString().replace(/\\s+/g, ' ').trim().slice(0, 120), w: Math.round(r.width), right: Math.round(r.right) };
  });
})()`;

for (const s of ["ref", "loc"]) {
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false')"`);
  run(`agent-browser --session ${s} set viewport 390 844`);
}

for (const route of ROUTES) {
  const reads = {};
  for (const s of ["ref", "loc"]) {
    run(`agent-browser --session ${s} open ${BASES[s]}${route}`);
    await new Promise(r => setTimeout(r, 800));
    run(`agent-browser --session ${s} set viewport 390 844`);
    await new Promise(r => setTimeout(r, 2800));
    reads[s] = await evalOn(s, OVERFLOW_AUTHORS);
  }
  console.log(`\n==== ${route} @390x844 — overflow authors ====`);
  for (const s of ["ref", "loc"]) console.log(`${s}: ${JSON.stringify(reads[s])}`);
}
