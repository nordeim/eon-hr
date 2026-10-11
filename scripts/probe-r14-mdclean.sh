#!/bin/bash
# probe-r14-mdclean.sh — clean-state md boundary check: navigate BOTH sessions
# to /dashboard first, then probe at 767 (expect mobile chrome on both) and
# 800 (expect desktop sidebar on both).
# Usage: bash scripts/probe-r14-mdclean.sh

agent-browser --session ref set viewport 767 844 >/dev/null 2>&1
agent-browser --session loc set viewport 767 844 >/dev/null 2>&1
agent-browser --session ref open "https://eon.base44.app/dashboard" >/dev/null 2>&1
agent-browser --session loc open "http://127.0.0.1:3200/dashboard" >/dev/null 2>&1
sleep 2.5

probe() {
  agent-browser --session "$1" eval 'JSON.stringify((() => {
    const out = {};
    const header = document.querySelector("header");
    out.header = header ? { visible: header.offsetParent !== null, h: Math.round(header.getBoundingClientRect().height) } : null;
    // hamburger: ANY visible button in the top strip (y < 100)
    const topBtns = [...document.querySelectorAll("button")].filter(b => b.offsetParent !== null && b.getBoundingClientRect().y < 100 && b.getBoundingClientRect().y >= 0);
    out.topButtons = topBtns.map(b => ({ label: (b.getAttribute("aria-label") || b.textContent || "svg").trim().slice(0, 16), x: Math.round(b.getBoundingClientRect().x), w: Math.round(b.getBoundingClientRect().width) }));
    // bottom tabs present?
    const bottom = [...document.querySelectorAll("nav")].find(n => getComputedStyle(n).position === "fixed" && parseFloat(getComputedStyle(n).bottom) === 0 && n.offsetParent !== null);
    out.bottomTabs = bottom ? Math.round(bottom.getBoundingClientRect().y) : null;
    // desktop sidebar: "Main Menu" label visible?
    const mainMenu = [...document.querySelectorAll("div,span,h2")].find(e => e.offsetParent !== null && (e.textContent || "").trim() === "Main Menu" && e.children.length === 0);
    out.mainMenu = !!mainMenu;
    return out;
  })())'
}

echo "── @767 (expect: header + hamburger + bottom tabs, NO Main Menu) ──"
echo "REF: $(probe ref)"
echo "LOC: $(probe loc)"

agent-browser --session ref set viewport 800 844 >/dev/null 2>&1
agent-browser --session loc set viewport 800 844 >/dev/null 2>&1
sleep 2

echo ""
echo "── @800 (expect: NO header, NO tabs, Main Menu present) ──"
echo "REF: $(probe ref)"
echo "LOC: $(probe loc)"

agent-browser --session ref set viewport 1440 900 >/dev/null 2>&1
agent-browser --session loc set viewport 1440 900 >/dev/null 2>&1
echo ""
echo "MD-CLEAN-DONE"
