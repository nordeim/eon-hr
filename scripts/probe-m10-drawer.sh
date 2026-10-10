#!/bin/bash
# probe-m10-drawer.sh — mobile drawer geometry comparison
agent-browser --session "$1" eval 'JSON.stringify((() => {
  // find the drawer: a fixed element with bg #FAFAFA or a wide fixed panel
  const fixed = [...document.querySelectorAll("body *")].filter(el => {
    const cs = getComputedStyle(el);
    return cs.position === "fixed" && el.getBoundingClientRect().width > 200 && el.getBoundingClientRect().height > 500;
  });
  return fixed.map(el => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return { tag: el.tagName, cls: (el.className || "").toString().slice(0, 60), x: Math.round(r.x), y: Math.round(r.y),
      w: Math.round(r.width), h: Math.round(r.height), bg: cs.backgroundColor, z: cs.zIndex,
      transform: cs.transform !== "none" ? cs.transform.slice(0, 40) : "none" };
  });
})())'
