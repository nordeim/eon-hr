// probe-r6-mobile.js — mobile chrome comparison: top bar, bottom tabs, kicker
(() => {
  const header = document.querySelector("header");
  const hr = header ? header.getBoundingClientRect() : null;
  const nav = document.querySelector('nav[aria-label="Bottom navigation"], nav.fixed.inset-x-0.bottom-0');
  const nr = nav ? nav.getBoundingClientRect() : null;
  // kicker: the md:hidden sticky title bar on dashboard
  const kicker = [...document.querySelectorAll("div")].find(
    (d) => d.className && /sticky/.test(d.className) && /top-\[?73|top-0/.test(d.className) && d.querySelector("h1")
  );
  const kr = kicker ? kicker.getBoundingClientRect() : null;
  const kt = kicker?.querySelector("h1");
  const tabs = nav
    ? [...nav.querySelectorAll("a")].map((a) => {
        const cs = getComputedStyle(a);
        return {
          t: (a.textContent || "").slice(0, 10),
          color: cs.color,
          fs: getComputedStyle(a.querySelector("span") || a).fontSize,
          fw: getComputedStyle(a.querySelector("span") || a).fontWeight,
        };
      })
    : null;
  return JSON.stringify({
    headerH: hr ? Math.round(hr.height) : null,
    headerY: hr ? Math.round(hr.y) : null,
    navH: nr ? Math.round(nr.height) : null,
    navY: nr ? Math.round(nr.y) : null,
    kicker: kr
      ? {
          x: Math.round(kr.x),
          y: Math.round(kr.y),
          w: Math.round(kr.width),
          h: Math.round(kr.height),
          title: kt?.textContent,
          titleFS: kt ? getComputedStyle(kt).fontSize : null,
          titleFW: kt ? getComputedStyle(kt).fontWeight : null,
          sticky: getComputedStyle(kicker).position,
          bg: getComputedStyle(kicker).backgroundColor,
          borderB: getComputedStyle(kicker).borderBottomWidth,
        }
      : null,
    tabs,
  });
})()
