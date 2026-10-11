#!/usr/bin/env node
// probe-r14-dump1.mjs — dump the 6 gap-candidate surfaces (tab-pill family
// + allleaverequests h1 + profile bottom). Usage: node scripts/probe-r14-dump1.mjs
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

// ── 1. recruitment: tab pill + triggers detail ──
await nav("ref", "https://eon.base44.app/recruitment");
await nav("loc", "http://127.0.0.1:3200/recruitment");
const RECRUIT = `(() => {
  const out = {};
  const tl = document.querySelector("main [role=tablist]");
  if (tl) {
    const r = tl.getBoundingClientRect(); const cs = getComputedStyle(tl);
    out.pill = { w: Math.round(r.width), h: Math.round(r.height), cls: tl.className.slice(0, 120) };
    out.triggers = [...tl.querySelectorAll("[role=tab]")].map(t => {
      const tr = t.getBoundingClientRect();
      const svg = t.querySelector("svg");
      return { t: t.textContent.trim().slice(0, 16), w: Math.round(tr.width), h: Math.round(tr.height),
        pad: getComputedStyle(t).padding, gap: getComputedStyle(t).gap, icon: svg ? Math.round(svg.getBoundingClientRect().width) : 0,
        iconMR: svg ? getComputedStyle(svg).marginRight : null };
    });
  } else out.pill = null;
  return JSON.stringify(out);
})()`;
console.log("── /recruitment REF ──\n" + await evalOn("ref", RECRUIT));
console.log("── /recruitment LOC ──\n" + await evalOn("loc", RECRUIT));

// ── 2. training: what's in the toolbar area ──
await nav("ref", "https://eon.base44.app/training");
await nav("loc", "http://127.0.0.1:3200/training");
const TRAIN = `(() => {
  const out = {};
  const main = document.querySelector("main");
  const row = main.querySelector("h2") ? main.querySelector("h2").parentElement : null;
  if (row) { const r = row.getBoundingClientRect(); out.h2row = { y: Math.round(r.y), h: Math.round(r.height), cls: row.className.slice(0, 100) }; }
  const tl = main.querySelector("[role=tablist]");
  out.tablist = tl ? { w: Math.round(tl.getBoundingClientRect().width), h: Math.round(tl.getBoundingClientRect().height), cls: tl.className.slice(0, 120), n: tl.querySelectorAll("[role=tab]").length } : null;
  const btns = [...main.querySelectorAll("button")].filter(b => b.offsetParent !== null && b.getBoundingClientRect().y < 400);
  out.buttons = btns.map(b => { const r = b.getBoundingClientRect(); return { t: b.textContent.trim().slice(0, 14), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), variant: (b.className.match(/border|bg-gradient|bg-slate-900/) || ["?"])[0].slice(0, 20) }; }).slice(0, 10);
  return JSON.stringify(out);
})()`;
console.log("\n── /training REF ──\n" + await evalOn("ref", TRAIN));
console.log("── /training LOC ──\n" + await evalOn("loc", TRAIN));

// ── 3. performancemanagement: tab pill detail ──
await nav("ref", "https://eon.base44.app/performancemanagement");
await nav("loc", "http://127.0.0.1:3200/performancemanagement");
const PERF = `(() => {
  const out = {};
  const tl = document.querySelector("main [role=tablist]");
  if (tl) {
    const r = tl.getBoundingClientRect();
    out.pill = { w: Math.round(r.width), h: Math.round(r.height), cls: tl.className.slice(0, 120) };
    out.triggers = [...tl.querySelectorAll("[role=tab]")].map(t => {
      const tr = t.getBoundingClientRect();
      const svg = t.querySelector("svg");
      return { t: t.textContent.trim().slice(0, 16), w: Math.round(tr.width), icon: svg ? Math.round(svg.getBoundingClientRect().width) : 0 };
    });
  } else out.pill = null;
  return JSON.stringify(out);
})()`;
console.log("\n── /performancemanagement REF ──\n" + await evalOn("ref", PERF));
console.log("── /performancemanagement LOC ──\n" + await evalOn("loc", PERF));

// ── 4. staffrequests: the My Requests pill structure ──
await nav("ref", "https://eon.base44.app/staffrequests");
await nav("loc", "http://127.0.0.1:3200/staffrequests");
const SR = `(() => {
  const out = {};
  const tl = document.querySelector("main [role=tablist]");
  if (tl) {
    const r = tl.getBoundingClientRect();
    out.tablist = { w: Math.round(r.width), h: Math.round(r.height), cls: tl.className.slice(0, 120) };
    out.triggers = [...tl.querySelectorAll("[role=tab]")].map(t => {
      const tr = t.getBoundingClientRect();
      return { t: t.textContent.trim().slice(0, 16), w: Math.round(tr.width), h: Math.round(tr.height), cls: t.className.slice(0, 100) };
    });
  } else out.tablist = null;
  const pill = [...document.querySelectorAll("main button, main div")].find(e => e.offsetParent !== null && /My Requests/.test(e.textContent || "") && e.children.length <= 3);
  if (pill) { const r = pill.getBoundingClientRect(); out.myRequests = { tag: pill.tagName, w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y), cls: pill.className.slice(0, 120) }; }
  return JSON.stringify(out);
})()`;
console.log("\n── /staffrequests REF ──\n" + await evalOn("ref", SR));
console.log("── /staffrequests LOC ──\n" + await evalOn("loc", SR));

// ── 5. allleaverequests: h1 x-offset ──
await nav("ref", "https://eon.base44.app/allleaverequests");
await nav("loc", "http://127.0.0.1:3200/allleaverequests");
const ALR = `(() => {
  const out = {};
  const h1 = [...document.querySelectorAll("h1")].find(h => h.offsetParent !== null);
  if (h1) {
    const r = h1.getBoundingClientRect(); const cs = getComputedStyle(h1);
    out.h1 = { x: Math.round(r.x), w: Math.round(r.width), ml: cs.marginLeft, display: cs.display, textA: cs.textAlign };
    const parent = h1.parentElement;
    out.parentCls = parent ? parent.className.slice(0, 120) : null;
    const pr = parent ? parent.getBoundingClientRect() : null;
    out.parent = pr ? { x: Math.round(pr.x), w: Math.round(pr.width) } : null;
  }
  return JSON.stringify(out);
})()`;
console.log("\n── /allleaverequests REF ──\n" + await evalOn("ref", ALR));
console.log("── /allleaverequests LOC ──\n" + await evalOn("loc", ALR));

// ── 6. profile: the extra card at y≈908 ──
await nav("ref", "https://eon.base44.app/profile");
await nav("loc", "http://127.0.0.1:3200/profile");
const PROF = `(() => {
  const out = {};
  const cards = [...document.querySelectorAll("main .grid > div, main > div > div > div")].filter(c => c.offsetParent !== null);
  out.bottom = cards.filter(c => c.getBoundingClientRect().y > 850).slice(0, 4).map(c => {
    const r = c.getBoundingClientRect();
    return { y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), text: (c.textContent || "").trim().slice(0, 60) };
  });
  return JSON.stringify(out);
})()`;
console.log("\n── /profile bottom (y>850) REF ──\n" + await evalOn("ref", PROF));
console.log("── /profile bottom (y>850) LOC ──\n" + await evalOn("loc", PROF));
console.log("\nDUMP1-DONE");
