#!/usr/bin/env node
// r83-theme-recon.mjs — session-83 / parity round 82: the theme-direction
// recon. The round's fresh-eyes angle: the DARK-MODE + RTL (Arabic) toggle
// states — the two states NEVER measured by the parity program (all 966
// standing PNGs are LIGHT + LTR). Both apps carry both toggles (the REF:
// localStorage darkMode/app_lang, html.dark + dir=rtl; the clone: the
// session-33 R32-B عربي button + the session-40 THEME_BOOT contract).
// This recon censuses the TOGGLE UI on both sides (LIGHT+LTR state): the
// Moon + عربي buttons' recipes (text/aria/geometry) in the header/sidebar.
import { execSync } from "node:child_process";
function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
// The toggle census: walk every button in the persistent chrome (header +
// sidebar), find the Moon/dark + عربي/lang toggles, read their recipes.
const TOGGLES = `(() => {
  const out = [];
  for (const b of document.querySelectorAll('button')) {
    const t = (b.textContent || '').trim();
    const aria = b.getAttribute('aria-label') || '';
    if (/عربي|^EN$|Moon|Sun|dark|theme|theme/i.test(t) || /moon|sun|theme|dark|language|arabic/i.test(aria)) {
      const r = b.getBoundingClientRect();
      out.push({ t: t.slice(0, 24), aria: aria.slice(0, 40), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), cls: (b.className || '').replace(/\\s+/g, ' ').slice(0, 140) });
    }
  }
  return out;
})()`;

for (const [name, session, base] of [["REF", "ref", baseRef], ["LOC", "loc", baseLoc]]) {
  run(`agent-browser --session ${session} open ${base}/dashboard`);
  await new Promise(r => setTimeout(r, 3000));
  const toggles = await evalOn(session, TOGGLES);
  console.log(`${name} toggle census:`, JSON.stringify(toggles, null, 1));
}
process.exit(0);
