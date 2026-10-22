#!/usr/bin/env node
// r80-viewport-classify.mjs — session 80 / parity round 79: classify the
// 390x844 /dashboard recon diff BEFORE any remediation decision. The
// standing byte chain proves PER-SIDE stability (loc≡loc, ref≡ref across
// rounds/deploy generations) — never raw loc≡ref equality (the REF carries
// the documented session-2 builder-badge deviation). This classifier reads
// the DOM-geometry + census signals on BOTH sides at 390x844 so the diff
// can be attributed: documented platform chrome vs a REAL responsive
// layout divergence.
import { execSync } from "node:child_process";

function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
// The r79 lesson: long payloads with embedded quotes go through the -b
// BASE64 eval mode (the /bin/sh quoting trap otherwise truncates them).
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const b64 = Buffer.from(expr, "utf8").toString("base64"); const out = run(`agent-browser --session ${session} eval -b ${b64}`); const t = out.trim(); try { return JSON.parse(t); } catch { try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } } }

const SIGNALS = `(() => {
  const badge = document.querySelector('#base44-edit-badge, [class*=base44-edit], [id*=base44]');
  const sidebar = [...document.querySelectorAll('aside')].map(a => { const r = a.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), visible: r.width > 0 }; });
  const headers = [...document.querySelectorAll('header')].map(h => { const r = h.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), cls: (h.className || '').slice(0, 80) }; });
  const main = document.querySelector('main');
  const mainRect = main ? (() => { const r = main.getBoundingClientRect(); return { x: Math.round(r.x), w: Math.round(r.width) }; })() : null;
  const toggleBtn = [...document.querySelectorAll('button')].find(b => /toggle sidebar/i.test(b.getAttribute('aria-label') || ''));
  return {
    innerW: window.innerWidth, innerH: window.innerHeight,
    scrollW: document.documentElement.scrollWidth,
    hOverflow: document.documentElement.scrollWidth > window.innerWidth,
    badge: badge ? { tag: badge.tagName, w: badge.getBoundingClientRect().width, h: badge.getBoundingClientRect().height } : null,
    sidebar, headers, mainRect,
    hasToggle: !!toggleBtn,
    bodyCls: (document.body.className || '').slice(0, 60)
  };
})()`;

for (const s of ["ref", "loc"]) {
  const r = await evalOn(s, SIGNALS);
  console.log(`${s} @390x844 /dashboard:`, JSON.stringify(r, null, 1));
}
