#!/usr/bin/env node
// probe-r18-keyboard.mjs — FIRST interaction-parity audit (session 19 /
// round 18): keyboard traversal order + focus-visible ring styles. For each
// surface: Tab through the first N focus stops, record tag/text/classes +
// computed outline & box-shadow of the focused element. REF vs LOC.
import { execSync } from "node:child_process";

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", timeout: 30000 }).toString();
  } catch (e) {
    return "ERR:" + String(e).slice(0, 120);
  }
}

async function evalOn(session, expr, ms = 300) {
  await new Promise(r => setTimeout(r, ms));
  const oneLine = expr.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try {
    return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " "));
  } catch {
    return { error: out.slice(0, 120) };
  }
}

const ACTIVE = `(() => {
  const el = document.activeElement;
  if (!el || el === document.body) return JSON.stringify({ stop: "body" });
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return JSON.stringify({
    tag: el.tagName.toLowerCase(),
    t: (el.textContent || el.getAttribute("aria-label") || "").trim().replace(/\\s+/g, " ").slice(0, 26),
    x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
    outline: cs.outlineStyle === "none" ? "none" : cs.outlineStyle + " " + cs.outlineWidth + " " + cs.outlineColor,
    ring: cs.boxShadow === "none" ? "none" : cs.boxShadow.slice(0, 90),
  });
})()`;

async function tabSequence(session, base, route, vp, stops) {
  run(`agent-browser --session ${session} set viewport ${vp[0]} ${vp[1]}`);
  run(`agent-browser --session ${session} open "${base}${route}"`);
  await new Promise(r => setTimeout(r, 2600));
  run(`agent-browser --session ${session} eval "document.body.focus(); 'x'"`);
  const seq = [];
  for (let i = 0; i < stops; i++) {
    run(`agent-browser --session ${session} press Tab`);
    const st = await evalOn(session, ACTIVE, 150);
    seq.push(st);
  }
  return seq;
}

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

// Surface 1: desktop dashboard — first 12 stops (sidebar → header → content)
console.log("── KEYBOARD: /dashboard @1440×900, 12 stops ──");
const refD = await tabSequence("ref", baseRef, "/dashboard", [1440, 900], 12);
const locD = await tabSequence("loc", baseLoc, "/dashboard", [1440, 900], 12);
for (let i = 0; i < Math.max(refD.length, locD.length); i++) {
  const r = refD[i] || {}, l = locD[i] || {};
  const match = r.tag === l.tag && r.t === l.t && r.outline === l.outline && (r.ring || "none") === (l.ring || "none");
  console.log(`#${i + 1} ${match ? "MATCH" : "**DIFF**"} | REF ${r.tag || "-"} "${r.t || "-"}" @${r.x || "?"},${r.y || "?"} out=[${r.outline}] ring=[${(r.ring || "").slice(0, 40)}] | LOC ${l.tag || "-"} "${l.t || "-"}" @${l.x || "?"},${l.y || "?"} out=[${l.outline}] ring=[${(l.ring || "").slice(0, 40)}]`);
}

// Surface 2: mobile dashboard — first 10 stops (top bar → content → tabs)
console.log("\n── KEYBOARD: /dashboard @390×844, 10 stops ──");
const refM = await tabSequence("ref", baseRef, "/dashboard", [390, 844], 10);
const locM = await tabSequence("loc", baseLoc, "/dashboard", [390, 844], 10);
for (let i = 0; i < Math.max(refM.length, locM.length); i++) {
  const r = refM[i] || {}, l = locM[i] || {};
  const match = r.tag === l.tag && r.t === l.t && r.outline === l.outline && (r.ring || "none") === (l.ring || "none");
  console.log(`#${i + 1} ${match ? "MATCH" : "**DIFF**"} | REF ${r.tag || "-"} "${r.t || "-"}" @${r.x || "?"},${r.y || "?"} out=[${r.outline}] ring=[${(r.ring || "").slice(0, 40)}] | LOC ${l.tag || "-"} "${l.t || "-"}" @${l.x || "?"},${l.y || "?"} out=[${l.outline}] ring=[${(l.ring || "").slice(0, 40)}]`);
}

// Surface 3: login page (logged-out) — email → password → social → sign-in
console.log("\n── KEYBOARD: /login @1440×900, 8 stops ──");
const refL = await tabSequence("ref", baseRef, "/logout", [1440, 900], 0).catch(() => []);
run(`agent-browser --session ref open "${baseRef}/login"`);
await new Promise(r => setTimeout(r, 2600));
const refLg = await (async () => {
  run(`agent-browser --session ref eval "document.body.focus(); 'x'"`);
  const seq = [];
  for (let i = 0; i < 8; i++) {
    run(`agent-browser --session ref press Tab`);
    seq.push(await evalOn("ref", ACTIVE, 150));
  }
  return seq;
})();
const locLg = await (async () => {
  run(`agent-browser --session loc set viewport 1440 900`);
  run(`agent-browser --session loc open "${baseLoc}/login"`);
  await new Promise(r => setTimeout(r, 2600));
  run(`agent-browser --session loc eval "document.body.focus(); 'x'"`);
  const seq = [];
  for (let i = 0; i < 8; i++) {
    run(`agent-browser --session loc press Tab`);
    seq.push(await evalOn("loc", ACTIVE, 150));
  }
  return seq;
})();
for (let i = 0; i < Math.max(refLg.length, locLg.length); i++) {
  const r = refLg[i] || {}, l = locLg[i] || {};
  const match = r.tag === l.tag && r.t === l.t && r.outline === l.outline && (r.ring || "none") === (l.ring || "none");
  console.log(`#${i + 1} ${match ? "MATCH" : "**DIFF**"} | REF ${r.tag || "-"} "${r.t || "-"}" out=[${r.outline}] ring=[${(r.ring || "").slice(0, 40)}] | LOC ${l.tag || "-"} "${l.t || "-"}" out=[${l.outline}] ring=[${(l.ring || "").slice(0, 40)}]`);
}

// Surface 4: employees page — input + primary CTA ring styles (focus-visible via Tab)
console.log("\n── KEYBOARD: /employees @1440×900, 10 stops ──");
const refE = await tabSequence("ref", baseRef, "/employees", [1440, 900], 10);
const locE = await tabSequence("loc", baseLoc, "/employees", [1440, 900], 10);
for (let i = 0; i < Math.max(refE.length, locE.length); i++) {
  const r = refE[i] || {}, l = locE[i] || {};
  const match = r.tag === l.tag && r.t === l.t && r.outline === l.outline && (r.ring || "none") === (l.ring || "none");
  console.log(`#${i + 1} ${match ? "MATCH" : "**DIFF**"} | REF ${r.tag || "-"} "${r.t || "-"}" @${r.x || "?"},${r.y || "?"} out=[${r.outline}] ring=[${(r.ring || "").slice(0, 40)}] | LOC ${l.tag || "-"} "${l.t || "-"}" @${l.x || "?"},${l.y || "?"} out=[${l.outline}] ring=[${(l.ring || "").slice(0, 40)}]`);
}

console.log("\nKEYBOARD-AUDIT-DONE");
