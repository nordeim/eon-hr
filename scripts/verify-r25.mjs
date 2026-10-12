#!/usr/bin/env node
// verify-r25.mjs — session-26 / parity round 25 live verification: the head
// contract re-run on the canonical 13 routes. Titles must MATCH REF
// byte-for-byte; og/twitter/canonical/icons/jsonld must be present and
// resolve against the serving origin.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const ROUTES = ["/dashboard", "/employees", "/payroll", "/taskmanager", "/leavemanagement", "/expenses", "/loans", "/attendance", "/settings", "/profile", "/compliancedashboard", "/reports", "/login"];
const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

const READER = `(() => {
  const meta = (sel) => [...document.querySelectorAll(sel)];
  const txt = (m) => (m && m.content) || '';
  const icon = document.querySelector('link[rel="icon"]');
  const apple = document.querySelector('link[rel="apple-touch-icon"]');
  const manifest = document.querySelector('link[rel="manifest"]');
  const canonical = document.querySelector('link[rel="canonical"]');
  return JSON.stringify({
    title: document.title,
    desc: txt(document.querySelector('meta[name="description"]')).slice(0, 60),
    canonical: canonical ? canonical.getAttribute('href') : null,
    ogTitle: txt(meta('meta[property="og:title"]')[0]),
    ogUrl: txt(meta('meta[property="og:url"]')[0]),
    ogType: txt(meta('meta[property="og:type"]')[0]),
    ogSite: txt(meta('meta[property="og:site_name"]')[0]),
    ogImg: txt(meta('meta[property="og:image"]')[0]),
    ogImgW: txt(meta('meta[property="og:image:width"]')[0]),
    ogImgH: txt(meta('meta[property="og:image:height"]')[0]),
    ogImgAlt: txt(meta('meta[property="og:image:alt"]')[0]),
    twCard: txt(meta('meta[name="twitter:card"]')[0]),
    twTitle: txt(meta('meta[name="twitter:title"]')[0]),
    twImg: txt(meta('meta[name="twitter:image"]')[0]),
    twImgAlt: txt(meta('meta[name="twitter:image:alt"]')[0]),
    theme: txt(document.querySelector('meta[name="theme-color"]')),
    icon: icon ? icon.getAttribute('href') : null,
    apple: apple ? apple.getAttribute('href') : null,
    manifest: manifest ? manifest.getAttribute('href') : null,
    jsonld: document.querySelectorAll('script[type="application/ld+json"]').length,
    jsonldTypes: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => { try { return JSON.parse(s.textContent)['@type']; } catch { return 'parse-err'; } })
  });
})()`;

let titleMatch = 0, structuralPass = 0;
for (const route of ROUTES) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  await new Promise(r => setTimeout(r, 3000));
  const r1 = await evalOn("ref", READER);
  run(`agent-browser --session loc open "${baseLoc}${route}"`);
  await new Promise(r => setTimeout(r, 2800));
  const l1 = await evalOn("loc", READER);

  const titleOK = r1.title === l1.title;
  if (titleOK) titleMatch++;
  // structural checks (origin-agnostic)
  const locOrigin = "http://127.0.0.1:3200";
  const checks = {
    // Next resolves alternates.canonical against metadataBase — absolute
    // per-origin, byte-structural parity with REF's absolute form
    canonical: l1.canonical === locOrigin + route,
    ogTitle: l1.ogTitle === r1.ogTitle,
    ogUrl: l1.ogUrl === locOrigin + (route === "/dashboard" ? "/dashboard" : route),
    ogType: l1.ogType === "website",
    ogSite: l1.ogSite === "Eon HR",
    ogImg: l1.ogImg === locOrigin + "/og-image.png",
    twCard: l1.twCard === "summary_large_image",
    twTitle: l1.twTitle === r1.twTitle,
    twImg: l1.twImg === locOrigin + "/og-image.png",
    icon: (l1.icon || "").includes("icon-192.png"),
    jsonld: l1.jsonld >= 2 && l1.jsonldTypes.includes("WebSite") && l1.jsonldTypes.includes("Organization"),
  };
  const routeSpecial = route === "/login" ? {
    theme: l1.theme === "#000000",
    manifest: l1.manifest === "/manifest.json",
    apple: (l1.apple || "").includes("apple-touch-icon"),
    ogImgW: l1.ogImgW === "1200", ogImgH: l1.ogImgH === "630", ogImgAlt: l1.ogImgAlt === "Eon HR",
    twImgAlt: l1.twImgAlt === "Eon HR",
    breadcrumb: l1.jsonldTypes.includes("BreadcrumbList"),
  } : { loginNADash: route === "/dashboard" ? l1.title === "Eon HR" : true };
  const all = Object.values(checks).every(Boolean) && Object.values(routeSpecial).every(Boolean);
  if (all) structuralPass++;
  const failed = [...Object.entries({ ...checks, ...routeSpecial })].filter(([, v]) => !v).map(([k]) => k);
  console.log(`${route.padEnd(22)} title=${titleOK ? "MATCH" : "**DIFF**"} ref="${r1.title}" loc="${l1.title}" ${all ? "structure-OK" : "FAILED:" + failed.join(",")}`);
}
console.log(`\ntitles: ${titleMatch}/${ROUTES.length} MATCH | structure: ${structuralPass}/${ROUTES.length} OK`);
