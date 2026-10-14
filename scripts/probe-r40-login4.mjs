#!/usr/bin/env node
// probe-r40-login4.mjs — the login input class tails (slice C) + the CSS
// custom tokens the login build resolves (--ring, --card-foreground) to
// settle the ring-ring vs literal question.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 500) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

const TAIL = `(() => {
  const email = document.querySelector('input[type=email]');
  return { len: email.className.length, c: email.className.slice(300, 480) };
})()`;
const TOKENS = `(() => {
  const cs = getComputedStyle(document.documentElement);
  return { ring: cs.getPropertyValue('--ring'), cardFg: cs.getPropertyValue('--card-foreground'), background: cs.getPropertyValue('--background'), primary: cs.getPropertyValue('--primary'), sidebar: cs.getPropertyValue('--sidebar') };
})()`;
const SVG_GUARDS = `(() => {
  const sign = [...document.querySelectorAll('button')].find(b => /^sign in$/i.test((b.textContent||'').trim()));
  const pwWrap = document.querySelector('input[type=password]');
  return { signLen: sign.className.length, signHasSvgGuards: sign.className.includes('[&_svg]'), signHasRingOffsetBg: sign.className.includes('ring-offset-background'), pwTail: pwWrap.className.slice(-160) };
})()`;

for (const [label, session, base] of [["REF", "ref", baseRef], ["LOC", "loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 3000));
  console.log(`\n===== ${label} =====`);
  console.log("tail  :", JSON.stringify(await evalOn(session, TAIL)));
  console.log("tokens:", JSON.stringify(await evalOn(session, TOKENS)));
  console.log("guards:", JSON.stringify(await evalOn(session, SVG_GUARDS)));
}
