#!/usr/bin/env node
// probe-r45-redeploy.mjs — session-46 / parity round 45 redeploy watch.
// Compares the login + app asset fingerprints against the round-44 finals:
//   login JS BerEzxez (10th login deploy), login CSS NS4V-1t3,
//   app C-IrDy5f / BGNH4KkS. Quiet = the r44 contract still live.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const FP = `(() => {
  const fp = (el) => { const m = (el.getAttribute('href') || el.getAttribute('src') || '').match(/([A-Za-z0-9_-]{6,})\\.(?:css|js)/); return m ? m[1] : null; };
  const css = [...document.querySelectorAll('link[rel=stylesheet]')].map(fp).filter(Boolean);
  const js = [...document.querySelectorAll('script[src]')].map(fp).filter(Boolean);
  return { css, js };
})()`;

for (const [label, path] of [["login", "/login"], ["app", "/dashboard"]]) {
  for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
    run(`agent-browser --session ${session} open ${base}${path}`);
    await new Promise(r => setTimeout(r, 3000));
    const fp = await evalOn(session, FP);
    console.log(`${session} ${label}: ${JSON.stringify(fp)}`);
  }
}
