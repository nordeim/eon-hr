#!/usr/bin/env node
// probe-m10-btny.mjs — survey header-button y vs badge/h1 y on all routes
// Usage: node scripts/probe-m10-btny.mjs <base_ref> <base_loc> [route...]
import { execSync } from "node:child_process";

const [, , baseRef, baseLoc, ...routes] = process.argv;

const PROBE = `(() => {
  const main = document.querySelector("main");
  if (!main) return JSON.stringify({ error: "no main" });
  const vis = el => { const cs = getComputedStyle(el); return cs.display !== "none" && cs.visibility !== "hidden"; };
  const h1 = [...main.querySelectorAll("h1")].find(vis);
  const badge = [...main.querySelectorAll("span,div")].find(el => vis(el) && el.children.length === 0 && /^Offboarding|^Attendance|^Payroll|^Leave|^Expense|^Compliance|^Recruitment|^Training|^Performance|^Communications|^Analytics|^Settings|^Employees|^Tasks|^Asset|^Survey|^Workflow|^HR |^Document|^Shift|^Announcement|^Company|^Interview|^Evaluations|^Organogram|^Reports|^Loans|^Staff|^Profile|^Dashboard|^Home|^Chat|^Templates|^Notifications?/i.test((el.textContent || "").trim()) && el.getBoundingClientRect().y < 60);
  const btns = [...main.querySelectorAll("button")].filter(b => vis(b) && b.getBoundingClientRect().y < 280 && b.getBoundingClientRect().y > 10 && b.getBoundingClientRect().width > 30 && (b.textContent || "").trim().length > 1 && !/^(photo|video|post)$/i.test((b.textContent || "").trim()));
  return JSON.stringify({
    h1y: h1 ? Math.round(h1.getBoundingClientRect().y) : null,
    badgeY: badge ? Math.round(badge.getBoundingClientRect().y) : null,
    btns: btns.map(b => { const r = b.getBoundingClientRect(); return { t: (b.textContent || "").trim().slice(0, 16), y: Math.round(r.y), x: Math.round(r.x), w: Math.round(r.width) }; }).slice(0, 8)
  });
})()`;

const B64 = Buffer.from(PROBE).toString("base64");

async function run(session, base, route) {
  try { execSync(`agent-browser --session ${session} open "${base}${route}"`, { stdio: "pipe", timeout: 30000 }); } catch { }
  await new Promise(r => setTimeout(r, 1300));
  try {
    const out = execSync(`agent-browser --session ${session} eval "eval(atob('${B64}'))"`, { stdio: "pipe", timeout: 30000, maxBuffer: 20e6 });
    return JSON.parse(JSON.parse(out.toString().trim()));
  } catch { return { error: "probe failed" }; }
}

for (const route of routes) {
  const ref = await run("ref", baseRef, route);
  const loc = await run("loc", baseLoc, route);
  const fmt = d => d && !d.error ? `h1=${d.h1y} badge=${d.badgeY} btns=[${(d.btns || []).map(b => `${b.t}:${b.y}`).join(", ")}]` : "ERR";
  const mismatch = [];
  if (!ref.error && !loc.error) {
    const rb = (ref.btns || []).map(b => b.t), lb = (loc.btns || []).map(b => b.t);
    if (JSON.stringify(rb) !== JSON.stringify(lb)) mismatch.push(`btn-set: ref=[${rb}] loc=[${lb}]`);
    for (let i = 0; i < Math.min((ref.btns || []).length, (loc.btns || []).length); i++) {
      if (ref.btns[i].t === loc.btns[i].t && Math.abs(ref.btns[i].y - loc.btns[i].y) > 6) mismatch.push(`${ref.btns[i].t}: refY=${ref.btns[i].y} locY=${loc.btns[i].y}`);
    }
  }
  console.log(`${mismatch.length ? "DIFF " : "ok   "} ${route} ${mismatch.length ? "— " + mismatch.join(" | ") : ""}`);
  if (mismatch.length) { console.log(`      ref: ${fmt(ref)}`); console.log(`      loc: ${fmt(loc)}`); }
}
