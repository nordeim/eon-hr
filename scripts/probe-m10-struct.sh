#!/usr/bin/env bash
# probe-m10-struct.sh — dump a page's wrapper structure (3 levels) with button counts
# Usage: ./probe-m10-struct.sh <session> — dumps current page
agent-browser --session "$1" eval 'JSON.stringify((() => {
  const main = document.querySelector("main");
  if (!main) return [{ error: "no main" }];
  const wrap = main.querySelector(".max-w-7xl") || main;
  const out = [];
  const walk = (el, depth) => {
    if (depth > 3) return;
    for (const c of el.children) {
      const r = c.getBoundingClientRect();
      const cs = getComputedStyle(c);
      if (cs.display === "none" || (r.height === 0 && r.width === 0)) continue;
      out.push({ d: depth, tag: c.tagName, cls: (c.getAttribute("class") || "").replace(/\s+/g, ".").slice(0, 52), y: Math.round(r.y), x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height),
        t: c.children.length === 0 ? (c.textContent || "").trim().slice(0, 28) : "", nbtn: [...c.querySelectorAll("button")].length });
      walk(c, depth + 1);
    }
  };
  walk(wrap, 0);
  return out.slice(0, 26);
})())'
