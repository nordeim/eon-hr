#!/bin/bash
# probe-m10-topbar.sh — mobile top bar + bottom tabs comparison (ref vs loc)
# Usage: ./probe-m10-topbar.sh
measure() {
  local sess="$1"
  agent-browser --session "$sess" eval 'JSON.stringify((() => {
    const out = {};
    // top bar: the sticky mobile header
    const header = document.querySelector("header");
    if (header) {
      const r = header.getBoundingClientRect();
      const cs = getComputedStyle(header);
      out.header = { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
        pos: cs.position, top: cs.top, bg: cs.backgroundColor, z: cs.zIndex, borderB: cs.borderBottomWidth + " " + cs.borderBottomColor };
    }
    // bottom tab bar
    const navs = [...document.querySelectorAll("nav")];
    const bottom = navs.find(n => { const cs = getComputedStyle(n); return cs.position === "fixed" && parseFloat(cs.bottom) === 0; });
    if (bottom) {
      const r = bottom.getBoundingClientRect();
      out.bottomNav = { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
        pos: getComputedStyle(bottom).position, bg: getComputedStyle(bottom).backgroundColor,
        borderTop: getComputedStyle(bottom).borderTopWidth + " " + getComputedStyle(bottom).borderTopColor };
      out.tabs = [...bottom.querySelectorAll("a,button,[role=link]")].slice(0, 8).map(t => {
        const tr = t.getBoundingClientRect();
        const inner = t.querySelector("span:last-child") || t;
        const ics = getComputedStyle(inner);
        return { w: Math.round(tr.width), h: Math.round(tr.height), label: (t.textContent || "").trim().slice(0, 12),
          color: ics.color, fs: ics.fontSize };
      });
    }
    out.docW = document.documentElement.scrollWidth;
    return out;
  })())'
}
echo "=== REF ==="; measure ref
echo "=== LOC ==="; measure loc
