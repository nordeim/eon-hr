#!/usr/bin/env node
// probe-r25-meta.mjs — session-26 / parity round 25: the SEO/meta dimension
// census. Full <head> inventory on both apps across the canonical 12 routes
// + login: title, charset, viewport, robots, description, og:*, twitter:*,
// canonical, icons, html lang, jsonld. Reuses the documented probe rules
// (single-quoted browser JS, settled reads, JSON.stringify evals).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const ROUTES = ["/dashboard", "/employees", "/payroll", "/taskmanager", "/leavemanagement", "/expenses", "/loans", "/attendance", "/settings", "/profile", "/compliancedashboard", "/reports", "/login"];

const READER = `(() => {
  const meta = (sel) => [...document.querySelectorAll(sel)].map(m => (m.getAttribute('content') || m.getAttribute('href') || '').slice(0, 110));
  const iconLinks = [...document.querySelectorAll('link[rel]')].filter(l => /icon|apple|manifest|canonical|alternate|preconnect|stylesheet|preload/.test(l.rel)).map(l => l.rel + '=' + (l.href || '').replace(location.origin, '').slice(0, 80));
  return JSON.stringify({
    title: document.title.slice(0, 70),
    lang: document.documentElement.getAttribute('lang'),
    charset: (document.querySelector('meta[charset]') || {}).getAttribute ? document.querySelector('meta[charset]').getAttribute('charset') : null,
    viewport: (document.querySelector('meta[name="viewport"]') || {}).getAttribute ? document.querySelector('meta[name="viewport"]').getAttribute('content') : null,
    robots: meta('meta[name="robots"]'),
    desc: meta('meta[name="description"]'),
    og: meta('meta[property^="og:"]').length,
    ogKeys: meta('meta[property^="og:"]').length ? [...document.querySelectorAll('meta[property^="og:"]')].map(m => m.getAttribute('property') + '=' + (m.content || '').slice(0, 40)) : [],
    twitter: meta('meta[name^="twitter:"]').length,
    theme: meta('meta[name="theme-color"]'),
    links: iconLinks,
    jsonld: document.querySelectorAll('script[type="application/ld+json"]').length,
    metaCount: document.querySelectorAll('meta').length,
    linkCount: document.querySelectorAll('link').length
  });
})()`;

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
for (const route of ROUTES) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  await new Promise(r => setTimeout(r, 3000));
  const r1 = await evalOn("ref", READER);
  run(`agent-browser --session loc open "${baseLoc}${route}"`);
  await new Promise(r => setTimeout(r, 2800));
  const l1 = await evalOn("loc", READER);
  console.log(`\n### ${route}`);
  console.log(`REF ${JSON.stringify(r1)}`);
  console.log(`LOC ${JSON.stringify(l1)}`);
}
