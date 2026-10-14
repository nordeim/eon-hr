#!/usr/bin/env node
// probe-r39-tenant.mjs — tenantsetup at mobile (390x844): the canvas p-4,
// the input h-9 base, the 16px card margin; + externaljobapplication interior.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 500) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

// tenantsetup is behind auth on the clone; REF too. Both sessions are authed.
for (const [label, session, base] of [["REF", "ref", baseRef], ["LOC", "loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 390 844`);
  run(`agent-browser --session ${session} open ${base}/tenantsetup`);
  await new Promise(r => setTimeout(r, 4000));
  const ts = await evalOn(session, `(() => {
    const main = document.querySelector('main');
    const sc = main ? [...main.children].find(c => (c.className || '').includes('overflow-auto')) : null;
    const canvas = sc ? sc.firstElementChild : (main ? main.firstElementChild : null);
    const card = document.querySelector('[class*=rounded-xl], [class*=rounded-2xl]');
    const input = document.querySelector('input:not([type=hidden])');
    return { path: location.pathname, scrollerCls: sc ? sc.className : null, canvasCls: canvas ? canvas.className.slice(0, 180) : null, cardCls: card ? card.className.slice(0, 200) : null, cardRect: card ? { x: Math.round(card.getBoundingClientRect().x), y: Math.round(card.getBoundingClientRect().y), w: Math.round(card.getBoundingClientRect().width) } : null, inputCls: input ? input.className.slice(0, 240) : null, inputH: input ? Math.round(input.getBoundingClientRect().height) : null };
  })()`);
  console.log(`=== ${label} TENANTSETUP@390 ===`);
  console.log(JSON.stringify(ts, null, 1).slice(0, 1400));
}
