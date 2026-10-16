#!/usr/bin/env node
// probe-r45-census-b.mjs — session-46 / parity round 45, phase B: THE
// HIDDEN VIEW-SWAPPED FLOWS behind the login's action buttons — the
// password-reset view + the sign-up view — full trees, exact strings,
// classes, geometry, rhythm. REF only (the clone doesn't have them yet).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }
const log = (...a) => console.log(...a);

run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session ref open https://eon.base44.app/login`);
await new Promise(r => setTimeout(r, 3200));

// ---------- the reset view: click "Forgot password?" ----------
await evalOn("ref", `(() => { const b = [...document.querySelectorAll('button')].find(x => /forgot password/i.test(x.textContent||'')); b.click(); return 'clicked'; })()`);
await new Promise(r => setTimeout(r, 900));

const RESET_TREE = `(() => {
  const card = document.querySelector('.rounded-2xl');
  const walk = (n, d) => { if (d > 4 || !(n.children.length)) return null; return [...n.children].map(c => { const r = c.getBoundingClientRect(); const cs = getComputedStyle(c); return { tag: c.tagName, cls: (c.getAttribute('class')||'').slice(0, 220), txt: (c.childNodes.length && c.children.length === 0) ? (c.textContent||'').trim().slice(0, 80) : undefined, x: Math.round(r.x - card.getBoundingClientRect().x), y: Math.round(r.y - card.getBoundingClientRect().y), w: Math.round(r.width), h: Math.round(r.height), mt: cs.marginTop, mb: cs.marginBottom, kids: walk(c, d + 1) }; }); };
  return walk(card, 0);
})()`;
log("=== RESET VIEW TREE (desktop 1440) ===");
log(JSON.stringify(await evalOn("ref", RESET_TREE), null, 1).slice(0, 9000));
