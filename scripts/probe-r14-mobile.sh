#!/bin/bash
# probe-r14-mobile.sh — mobile navigation audit (user priority) at 390×844:
# top bar, bottom tabs, drawer (hamburger), overlay, drawer footer, submenu
# expansion, kicker + scroll-away, md boundary. REF vs LOC.
# Usage: bash scripts/probe-r14-mobile.sh
set -u
PX=390; PY=844

set_vp() {
  agent-browser --session "$1" set viewport $PX $PY >/dev/null 2>&1
  sleep 1
}

nav() {
  agent-browser --session "$1" open "$2" >/dev/null 2>&1
  sleep 2
}

# ── 1. Top bar + bottom tabs on /dashboard ──
set_vp ref; set_vp loc
nav ref "https://eon.base44.app/dashboard"; nav loc "http://127.0.0.1:3200/dashboard"

probe_chrome() {
  agent-browser --session "$1" eval 'JSON.stringify((() => {
    const out = {};
    const header = document.querySelector("header");
    if (header) {
      const r = header.getBoundingClientRect(); const cs = getComputedStyle(header);
      out.top = { w: Math.round(r.width), h: Math.round(r.height), bg: cs.backgroundColor, pos: cs.position, z: cs.zIndex, borderB: cs.borderBottomWidth + " " + cs.borderBottomColor };
    }
    const bottom = [...document.querySelectorAll("nav")].find(n => getComputedStyle(n).position === "fixed" && parseFloat(getComputedStyle(n).bottom) === 0);
    if (bottom) {
      const r = bottom.getBoundingClientRect();
      out.tabs = { y: Math.round(r.y), h: Math.round(r.height), bg: getComputedStyle(bottom).backgroundColor, borderTop: getComputedStyle(bottom).borderTopWidth };
      out.tabList = [...bottom.querySelectorAll("a,button")].map(t => {
        const tr = t.getBoundingClientRect();
        const label = t.querySelector("span:last-child") || t;
        const svg = t.querySelector("svg");
        return { x: Math.round(tr.x), w: Math.round(tr.width), label: (label.textContent || "").trim().slice(0, 12), color: getComputedStyle(label).color, fs: getComputedStyle(label).fontSize, icon: svg ? Math.round(svg.getBoundingClientRect().width) : 0 };
      });
    }
    out.docW = document.documentElement.scrollWidth;
    return out;
  })())'
}

echo "── TOP BAR + BOTTOM TABS (390×844 /dashboard) ──"
echo "REF: $(probe_chrome ref)"
echo "LOC: $(probe_chrome loc)"

# ── 2. Drawer: open hamburger, measure sheet + overlay + footer ──
open_drawer() {
  agent-browser --session "$1" click "button[aria-label='Toggle Sidebar']" >/dev/null 2>&1
  sleep 1.5
}
open_drawer ref; open_drawer loc

probe_drawer() {
  agent-browser --session "$1" eval 'JSON.stringify((() => {
    const out = {};
    const ov = [...document.querySelectorAll("div")].find(d => { const cs = getComputedStyle(d); return cs.position === "fixed" && cs.backgroundColor === "rgba(0, 0, 0, 0.8)" && d.getBoundingClientRect().width > 300; });
    if (ov) { const r = ov.getBoundingClientRect(); out.overlay = { w: Math.round(r.width), h: Math.round(r.height), z: getComputedStyle(ov).zIndex }; }
    const sheets = [...document.querySelectorAll("div,aside,section")].filter(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 200 && r.width < 320 && r.height > 600 && cs.position === "fixed" && cs.backgroundColor !== "rgba(0, 0, 0, 0.8)"; });
    const sheet = sheets.sort((a, b) => a.getBoundingClientRect().x - b.getBoundingClientRect().x)[0];
    if (sheet) {
      const r = sheet.getBoundingClientRect(); const cs = getComputedStyle(sheet);
      out.sheet = { x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height), bg: cs.backgroundColor, z: cs.zIndex };
      const links = [...sheet.querySelectorAll("a")].slice(0, 6).map(a => { const ar = a.getBoundingClientRect(); return { t: (a.textContent || "").trim().slice(0, 18), y: Math.round(ar.y), h: Math.round(ar.height) }; });
      out.links = links;
      const foot = [...sheet.querySelectorAll("div")].filter(d => d.getBoundingClientRect().height > 60 && d.getBoundingClientRect().height < 200 && getComputedStyle(d).borderTopWidth !== "0px").pop();
      if (foot) { const fr = foot.getBoundingClientRect(); out.footer = { y: Math.round(fr.y), h: Math.round(fr.height) }; }
    }
    return out;
  })())'
}

echo ""
echo "── DRAWER (opened via hamburger) ──"
echo "REF: $(probe_drawer ref)"
echo "LOC: $(probe_drawer loc)"

# close drawer (Escape)
agent-browser --session ref press Escape >/dev/null 2>&1
agent-browser --session loc press Escape >/dev/null 2>&1
sleep 1

# ── 3. Submenu expansion inside drawer (workforce group) ──
open_drawer ref; open_drawer loc
expand() {
  # click a group button (chevron container) — the WORKFORCE group
  agent-browser --session "$1" click "button:has-text('Workforce')" >/dev/null 2>&1
  sleep 1.2
}
expand ref; expand loc
probe_submenu() {
  agent-browser --session "$1" eval 'JSON.stringify([...document.querySelectorAll("a")].filter(a => a.offsetParent !== null && a.getBoundingClientRect().x < 300 && a.getBoundingClientRect().y > 150 && a.getBoundingClientRect().y < 500).map(a => ({ t: (a.textContent || "").trim().slice(0, 20), y: Math.round(a.getBoundingClientRect().y) })))'
}
echo ""
echo "── SUBMENU EXPANSION (drawer Workforce group) ──"
echo "REF: $(probe_submenu ref)"
echo "LOC: $(probe_submenu loc)"

agent-browser --session ref press Escape >/dev/null 2>&1
agent-browser --session loc press Escape >/dev/null 2>&1
sleep 1

# ── 4. Kicker + scroll-away on a category-A page (employees) ──
nav ref "https://eon.base44.app/employees"; nav loc "http://127.0.0.1:3200/employees"
probe_kicker() {
  agent-browser --session "$1" eval 'JSON.stringify((() => {
    const out = {};
    const kicker = [...document.querySelectorAll("div")].find(d => d.offsetParent !== null && d.querySelector("h1") && d.getBoundingClientRect().height > 40 && d.getBoundingClientRect().height < 80 && d.getBoundingClientRect().y < 120 && getComputedStyle(d).borderBottomWidth !== "0px");
    if (kicker) { const r = kicker.getBoundingClientRect(); out.kicker = { y: Math.round(r.y), h: Math.round(r.height), bg: getComputedStyle(kicker).backgroundColor }; const h1 = kicker.querySelector("h1"); out.h1fs = getComputedStyle(h1).fontSize + "/" + getComputedStyle(h1).fontWeight; }
    const scroller = [...document.querySelectorAll("div")].find(d => d.scrollHeight > d.clientHeight + 100 && d.clientHeight > 400) || document.scrollingElement;
    if (scroller) scroller.scrollTop = 200;
    out.headerAfterScroll = (() => { const h = document.querySelector("header"); return h ? Math.round(h.getBoundingClientRect().y) : null; })();
    const kicker2 = [...document.querySelectorAll("div")].find(d => d.querySelector("h1") && d.getBoundingClientRect().height > 40 && d.getBoundingClientRect().height < 80 && getComputedStyle(d).borderBottomWidth !== "0px");
    out.kickerYAfterScroll = kicker2 ? Math.round(kicker2.getBoundingClientRect().y) : null;
    return out;
  })())'
}
echo ""
echo "── KICKER + SCROLL-AWAY (/employees, scrollTop 200) ──"
echo "REF: $(probe_kicker ref)"
echo "LOC: $(probe_kicker loc)"

# ── 5. md boundary: 767 (mobile) vs 800 (desktop) ──
for VP in 767 800; do
  agent-browser --session ref set viewport $VP $PY >/dev/null 2>&1
  agent-browser --session loc set viewport $VP $PY >/dev/null 2>&1
  sleep 1.2
  echo ""
  echo "── md BOUNDARY @${VP}×844 ──"
  probe_md() {
    agent-browser --session "$1" eval 'JSON.stringify((() => {
      const header = document.querySelector("header");
      const drawerBtn = document.querySelector("button[aria-label='Toggle Sidebar']");
      const groupLabels = [...document.querySelectorAll("div,span")].filter(e => e.offsetParent !== null && /^([A-Z][a-z]+(\s[A-Za-z]+)*)$/.test((e.textContent || "").trim()) && e.children.length === 0 && e.getBoundingClientRect().y > 100).map(e => (e.textContent || "").trim()).slice(0, 6);
      return { headerVisible: header ? header.offsetParent !== null : false, hamburgerVisible: drawerBtn ? drawerBtn.offsetParent !== null : false, groupLabels };
    })())'
  }
  echo "REF: $(probe_md ref)"
  echo "LOC: $(probe_md loc)"
done

# restore desktop viewport
agent-browser --session ref set viewport 1440 900 >/dev/null 2>&1
agent-browser --session loc set viewport 1440 900 >/dev/null 2>&1
echo ""
echo "MOBILE-AUDIT-DONE"
