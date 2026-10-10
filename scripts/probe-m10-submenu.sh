#!/bin/bash
# probe-m10-submenu.sh — drawer submenu geometry after expansion
agent-browser --session "$1" eval 'JSON.stringify((() => {
  // find group buttons in the drawer (chevron buttons)
  const btns = [...document.querySelectorAll("button")].filter(b => {
    const r = b.getBoundingClientRect();
    return r.x < 288 && r.width > 200 && /chevron|arrow/i.test(b.innerHTML + " " + (b.getAttribute("aria-expanded") !== null ? "exp" : ""));
  });
  const expanded = btns.filter(b => b.getAttribute("aria-expanded") === "true");
  // measure all leaf links inside the drawer panel
  const drawer = [...document.querySelectorAll("div")].find(d => {
    const cs = getComputedStyle(d);
    return cs.position === "fixed" && Math.round(d.getBoundingClientRect().width) === 288;
  });
  if (!drawer) return { error: "no drawer" };
  const links = [...drawer.querySelectorAll("a")].map(a => {
    const r = a.getBoundingClientRect();
    return { y: Math.round(r.y), x: Math.round(r.x), w: Math.round(r.width), label: (a.textContent || "").trim().slice(0, 18) };
  });
  return { expandedCount: expanded.length, links: links.slice(0, 22) };
})())'
