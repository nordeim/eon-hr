#!/bin/bash
# probe-r14-mobile2.sh — fix-up probes: REF drawer geometry (re-try with the
# m10 filter) + md boundary (escaped-attribute quoting).
# Usage: bash scripts/probe-r14-mobile2.sh

# ── 1. Drawer re-probe with the m10 filter ──
agent-browser --session ref set viewport 390 844 >/dev/null 2>&1
agent-browser --session ref open "https://eon.base44.app/dashboard" >/dev/null 2>&1
sleep 2
agent-browser --session ref click "button[aria-label='Toggle Sidebar']" >/dev/null 2>&1
sleep 1.5

echo "── REF DRAWER (m10 filter) ──"
agent-browser --session ref eval 'JSON.stringify((() => {
  const out = {};
  const ov = document.querySelector("[data-state=open] ~ div, .fixed.inset-0.bg-black");
  const sheet = document.querySelector("[data-state=open]");
  if (sheet) {
    const r = sheet.getBoundingClientRect(); const cs = getComputedStyle(sheet);
    out.sheet = { x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height), bg: cs.backgroundColor, z: cs.zIndex, pos: cs.position };
    const links = [...sheet.querySelectorAll("a")].filter(a => a.offsetParent !== null).slice(0, 8).map(a => ({ t: (a.textContent || "").trim().slice(0, 18), y: Math.round(a.getBoundingClientRect().y), h: Math.round(a.getBoundingClientRect().height) }));
    out.links = links;
    const foot = [...sheet.querySelectorAll("div")].filter(d => d.getBoundingClientRect().height > 100 && d.getBoundingClientRect().height < 140).pop();
    if (foot) out.footer = { y: Math.round(foot.getBoundingClientRect().y), h: Math.round(foot.getBoundingClientRect().height) };
  }
  if (ov) out.ov = getComputedStyle(ov).backgroundColor;
  const anyOv = [...document.querySelectorAll("div")].find(d => { const cs = getComputedStyle(d); return cs.position === "fixed" && (cs.backgroundColor === "rgba(0, 0, 0, 0.8)" || cs.backgroundColor === "rgba(0,0,0,0.8)") && d.getBoundingClientRect().width > 300; });
  if (anyOv) { const r = anyOv.getBoundingClientRect(); out.overlay = { w: Math.round(r.width), h: Math.round(r.height), z: getComputedStyle(anyOv).zIndex }; }
  return out;
})())'

agent-browser --session ref press Escape >/dev/null 2>&1
sleep 1

# ── 2. md boundary with fixed quoting ──
probe_md() {
  agent-browser --session "$1" eval 'JSON.stringify((() => {
    const out = {};
    const header = document.querySelector("header");
    const btns = [...document.querySelectorAll("button")].filter(b => b.offsetParent !== null && b.getBoundingClientRect().y < 100);
    out.headerVisible = header ? header.offsetParent !== null : false;
    out.hamburger = btns.some(b => (b.getAttribute("aria-label") || "").includes("Sidebar"));
    out.groupLabels = [...document.querySelectorAll("div,span")].filter(e => e.offsetParent !== null && /^([A-Z][a-z]+(\s[A-Za-z]+)*)$/.test((e.textContent || "").trim()) && e.children.length === 0 && e.getBoundingClientRect().y > 100 && e.getBoundingClientRect().y < 700).map(e => (e.textContent || "").trim()).slice(0, 8);
    out.docW = document.documentElement.scrollWidth;
    return out;
  })())'
}

for VP in 767 800; do
  agent-browser --session ref set viewport $VP 844 >/dev/null 2>&1
  agent-browser --session loc set viewport $VP 844 >/dev/null 2>&1
  sleep 1.5
  echo ""
  echo "── md BOUNDARY @${VP}×844 (sidebar-ish page /dashboard) ──"
  echo "REF: $(probe_md ref)"
  echo "LOC: $(probe_md loc)"
done

agent-browser --session ref set viewport 1440 900 >/dev/null 2>&1
agent-browser --session loc set viewport 1440 900 >/dev/null 2>&1
echo ""
echo "FIXUP-DONE"
