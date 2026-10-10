// probe-r6-drawer.js — measure the mobile drawer on the CURRENT page (run on both sessions)
// Usage: agent-browser eval "$(cat scripts/probe-r6-drawer.js)"  (or paste)
(() => {
  const c = document.querySelector('[role="dialog"][data-state="open"], div.fixed.inset-y-0.left-0');
  if (!c) return "no-open-dialog";
  const r = c.getBoundingClientRect();
  // overlay: the fixed inset-0 element just before the dialog in the portal
  let overlay = null;
  document.querySelectorAll("div, body > *").forEach((el) => {
    const cs = getComputedStyle(el);
    if (cs.position === "fixed" && el !== c && !c.contains(el)) {
      const er = el.getBoundingClientRect();
      if (er.width >= innerWidth * 0.9 && er.height >= innerHeight * 0.9 && !el.contains(c) && !overlay) {
        overlay = el;
      }
    }
  });
  const og = overlay ? getComputedStyle(overlay) : null;
  // find nav items inside
  const links = [...c.querySelectorAll("a")].slice(0, 4).map((a) => {
    const ar = a.getBoundingClientRect();
    return { t: a.textContent.slice(0, 20), w: Math.round(ar.width), h: Math.round(ar.height) };
  });
  const anyCloseBtn = [...c.querySelectorAll("button")].some(
    (b) => /close|dismiss|×|✕/i.test((b.getAttribute("aria-label") || "") + (b.textContent || ""))
  );
  return JSON.stringify({
    drawerW: Math.round(r.width),
    drawerX: Math.round(r.x),
    drawerY: Math.round(r.y),
    drawerH: Math.round(r.height),
    drawerBg: getComputedStyle(c).backgroundColor,
    overlayBg: og ? og.backgroundColor : "n/a",
    overlayOpacity: og ? og.opacity : "n/a",
    hasCloseButton: anyCloseBtn,
    firstLinks: links,
  });
})()
