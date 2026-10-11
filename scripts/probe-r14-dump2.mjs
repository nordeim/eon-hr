#!/usr/bin/env node
// probe-r14-dump2.mjs — deep dives: training full inventory (REF CTA?),
// profile General form field lists, recruitment trigger icon classes.
// Usage: node scripts/probe-r14-dump2.mjs
const { execSync } = await import("node:child_process");

async function nav(session, url) {
  try { execSync(`agent-browser --session ${session} open "${url}"`, { stdio: "pipe", timeout: 45000 }); } catch {}
  await new Promise(r => setTimeout(r, 1600));
}

async function evalOn(session, js) {
  const oneLine = js.split("\n").join(" ");
  try {
    const out = execSync(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`, { stdio: "pipe", timeout: 30000 });
    return out.toString().trim().replace(/^"|"$/g, "").replace(/\\"/g, '"');
  } catch (e) { return "ERR " + String(e).slice(0, 80); }
}

// ── 1. training: REF full button inventory + section structure ──
await nav("ref", "https://eon.base44.app/training");
await nav("loc", "http://127.0.0.1:3200/training");
const TRAIN2 = `(() => {
  const out = {};
  const btns = [...document.querySelectorAll("main button")].filter(b => b.offsetParent !== null);
  out.allButtons = btns.map(b => { const r = b.getBoundingClientRect(); return { t: (b.textContent || "").trim().slice(0, 18), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; });
  const h2s = [...document.querySelectorAll("main h2")].filter(h => h.offsetParent !== null);
  out.h2s = h2s.map(h => ({ t: h.textContent.trim().slice(0, 24), y: Math.round(h.getBoundingClientRect().y), rowH: Math.round(h.parentElement.getBoundingClientRect().height), rowCls: h.parentElement.className.slice(0, 80) }));
  return JSON.stringify(out);
})()`;
console.log("── /training REF all-buttons + h2s ──\n" + await evalOn("ref", TRAIN2));
console.log("── /training LOC all-buttons + h2s ──\n" + await evalOn("loc", TRAIN2));

// ── 2. profile: General form field inventory ──
await nav("ref", "https://eon.base44.app/profile");
await nav("loc", "http://127.0.0.1:3200/profile");
const PROF2 = `(() => {
  const out = {};
  const forms = [...document.querySelectorAll("main form")].filter(f => f.offsetParent !== null);
  out.nForms = forms.length;
  const fields = [...document.querySelectorAll("main label")].filter(l => l.offsetParent !== null);
  out.labels = fields.map(l => {
    const field = l.parentElement;
    const input = field.querySelector("input,select,textarea");
    const fr = field.getBoundingClientRect();
    return { t: l.textContent.trim().slice(0, 18), y: Math.round(fr.y), h: Math.round(fr.height), ctrl: input ? input.tagName.toLowerCase() : null, inline: getComputedStyle(l).display };
  });
  return JSON.stringify(out);
})()`;
console.log("\n── /profile REF General form fields ──\n" + await evalOn("ref", PROF2));
console.log("── /profile LOC General form fields ──\n" + await evalOn("loc", PROF2));

// ── 3. recruitment: trigger icon detail (which lucide icons) ──
await nav("ref", "https://eon.base44.app/recruitment");
const RECRUIT2 = `(() => {
  const out = {};
  const tl = document.querySelector("main [role=tablist]");
  out.triggers = [...tl.querySelectorAll("[role=tab]")].map(t => {
    const svg = t.querySelector("svg");
    return { t: t.textContent.trim().slice(0, 18), svgCls: svg ? svg.className.baseVal || svg.getAttribute("class") : null, svgWH: svg ? Math.round(svg.getBoundingClientRect().width) + "x" + Math.round(svg.getBoundingClientRect().height) : null, triggerCls: t.className.slice(0, 110) };
  });
  return JSON.stringify(out);
})()`;
console.log("\n── /recruitment REF trigger icon detail ──\n" + await evalOn("ref", RECRUIT2));

// ── 4. staffrequests: LOC current pill DOM (what wraps the trigger) ──
await nav("loc", "http://127.0.0.1:3200/staffrequests");
const SR2 = `(() => {
  const out = {};
  const btn = [...document.querySelectorAll("main button")].find(b => /My Requests/.test(b.textContent || ""));
  if (btn) {
    const r = btn.getBoundingClientRect();
    out.trigger = { tag: btn.tagName, w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y), cls: btn.className.slice(0, 130), role: btn.getAttribute("role") };
    const wrap = btn.parentElement;
    const wr = wrap.getBoundingClientRect();
    out.wrapper = { tag: wrap.tagName, w: Math.round(wr.width), h: Math.round(wr.height), cls: (wrap.className || "").slice(0, 130), role: wrap.getAttribute("role") };
  }
  return JSON.stringify(out);
})()`;
console.log("\n── /staffrequests LOC pill DOM ──\n" + await evalOn("loc", SR2));
console.log("\nDUMP2-DONE");
