#!/usr/bin/env node
// r89-tickfont-probe.mjs — session-89: the CHART TICK-FONT FAMILY probe.
// The dark mobile-band triage surfaced the attendancedashboard chart's tick
// labels rendering at the LOC's INHERITED 16px page font vs the REF's 11px
// (live-verified both modes) — and the 31px chart-min-width delta it drives
// (the Export button off-canvas at mobile). This probe walks every
// chart-bearing route on both sides and reads the first chart's tick
// computed font + the page scrollWidth, to size the family.
import { execSync } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 120); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const ROUTES = ["attendancedashboard", "surveyanalytics", "hrreports", "analyticsdashboard", "dynamicdashboard", "analytics"];
const pairs = [["ref89tf", "https://eon.base44.app"], ["loc89tf", "http://127.0.0.1:3200"]];

for (const [session, base] of pairs) {
  console.log(`\n===== ${session} (${base}) =====`);
  for (const route of ROUTES) {
    run(`agent-browser --session ${session} set viewport 390 844`);
    run(`agent-browser --session ${session} open ${base}/${route}`);
    await new Promise(r => setTimeout(r, 3500));
    const read = await evalOn(session, `(() => {
      const svgs = [...document.querySelectorAll('.recharts-responsive-container svg')].filter(s => s.getAttribute('viewBox') && !s.getAttribute('viewBox').includes(' 32 '));
      const withText = svgs.find(s => s.querySelectorAll('text').length > 0);
      if (!withText) return { route: "${route}", charts: svgs.length, ticks: 0 };
      const t = withText.querySelector('text');
      const r = t.getBoundingClientRect();
      return { route: "${route}", ticks: withText.querySelectorAll('text').length,
        font: getComputedStyle(t).fontSize, family: getComputedStyle(t).fontFamily.slice(0, 24),
        w: Math.round(r.width), h: Math.round(r.height),
        pageSW: document.documentElement.scrollWidth };
    })()`);
    console.log(JSON.stringify(read));
  }
}
process.exit(0);
