#!/bin/bash
# probe-m10-sidebar.sh — sidebar detection via structural walk (works for both apps)
# Arg 1: session name
agent-browser --session "$1" eval 'JSON.stringify((() => {
  // The sidebar: a tall left column containing the nav links. Walk from "Dashboard" link up.
  const links = [...document.querySelectorAll("a")].filter(a => /^dashboard$/i.test((a.textContent || "").trim()));
  for (const a of links) {
    let node = a;
    for (let i = 0; i < 10 && node.parentElement; i++) {
      node = node.parentElement;
      const r = node.getBoundingClientRect();
      const cs = getComputedStyle(node);
      if (r.height > 600 && r.width >= 200 && r.width <= 340 && cs.display !== "none" && (r.x === 0 || cs.position === "fixed" || cs.position === "sticky")) {
        return { tag: node.tagName, cls: (node.className || "").toString().slice(0, 70), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), bg: cs.backgroundColor, display: cs.display };
      }
    }
  }
  return { sidebar: null };
})())'
