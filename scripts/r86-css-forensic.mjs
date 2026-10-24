#!/usr/bin/env node
// r86-css-forensic.mjs — session-86 / parity round 85 opening read:
// classify the 58TH login deploy's CSS movement (login CSS
// index--4Ltml9o -> index-BD8HgQNX, the first CSS movement since the
// 43rd-line sweeps; JS index-BgH6kzLl -> index-DzlN4LV0 + a NEW named
// `frontend-config` script; app side QUIET; the census unchanged; the
// fresh login pair already BYTE-IDENTICAL to the 69aa4241... baseline
// — the deploy is NON-VISUAL at the PNG layer). This probe fetches the
// NEW served login CSS + the NEW frontend-config script, sizes them,
// and greps the CSS for the standing TW-v4 scan members (!important /
// oklch / @supports) so the delta can be classified in content terms.
// (The old CSS bytes were not snapshotted by the standing instruments —
// the r78 precedent fetched both generations live mid-round; here the
// old generation is already replaced, so this is a CONTENT CENSUS of
// the new one, anchored on the byte-identical PNG proof.)
import { execSync } from "node:child_process";

function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 200); } }

// 1. fetch the login page HTML, extract the CSS URL + the frontend-config script tag
const html = run(`curl -s https://eon.base44.app/login`);
const cssMatch = html.match(/href="([^"]*index-[A-Za-z0-9_-]+\.css)"/);
const jsMatch = [...html.matchAll(/src="([^"]*index-[A-Za-z0-9_-]+\.js)"/g)].map(m => m[1]);
const fcMatch = html.match(/<script[^>]*frontend-config[^>]*>([\s\S]*?)<\/script>/);

console.log("CSS URL:", cssMatch ? cssMatch[1] : "NOT FOUND");
console.log("JS URLs:", JSON.stringify(jsMatch));
console.log("frontend-config inline?", fcMatch ? `YES (${fcMatch[1].trim().length} chars)` : "no — checking src...");

const base = "https://eon.base44.app";
const abs = (u) => (u.startsWith("http") ? u : base + u);
// 2. fetch the CSS + census its TW-v4 scan members
if (cssMatch) {
  const css = run(`curl -s "${abs(cssMatch[1])}"`, 60000);
  console.log(`\nCSS bytes: ${Buffer.byteLength(css)}`);
  const impCount = (css.match(/!important/g) || []).length;
  const oklchActive = (css.replace(/\/\*[\s\S]*?\*\//g, "").match(/oklch\(/g) || []).length;
  const supportsCount = (css.match(/@supports/g) || []).length;
  const colorMixCount = (css.match(/color-mix\(/g) || []).length;
  const outlineColorRules = (css.match(/outline-color/g) || []).length;
  console.log(`!important: ${impCount} · oklch (non-comment): ${oklchActive} · @supports: ${supportsCount} · color-mix: ${colorMixCount} · outline-color: ${outlineColorRules}`);
  // the r85-relevant member: does the new CSS still carry the preflight's
  // outline-color color-mix escalation (the REF rides the UA default)?
  const preflight = css.match(/\*\s*\{[^}]*outline-color[^}]*\}/g) || [];
  console.log("star-outline-color rules:", JSON.stringify(preflight.map(r => r.slice(0, 120))));
}

// 3. fetch frontend-config if it is a src script
const fcSrc = html.match(/src="([^"]*frontend-config[^"]*)"/);
if (fcSrc) {
  const fc = run(`curl -s "${abs(fcSrc[1])}"`, 45000);
  console.log(`\nfrontend-config script (${fcSrc[1]}): ${Buffer.byteLength(fc)} bytes`);
  console.log("first 400 chars:", fc.slice(0, 400));
} else if (fcMatch) {
  console.log("\nfrontend-config inline content:", fcMatch[1].trim().slice(0, 400));
}
process.exit(0);
