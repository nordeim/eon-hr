// probe-r6-wizard-mobile.js — the reference wizard at 390px
(() => {
  const main = document.querySelector("main");
  const h1 = [...main.querySelectorAll("h1")].find((h) => /Add New Employee/i.test(h.textContent));
  if (!h1) return "no-wizard";
  const h1r = h1.getBoundingClientRect();
  const card = [...main.querySelectorAll("div")].find(
    (d) => /max-w-4xl/.test(d.className.toString()) && d.querySelector("form, label")
  );
  const cr = card ? card.getBoundingClientRect() : null;
  const segs = card
    ? [...card.querySelectorAll("div.flex.flex-col.items-center")].map((e) => {
        const r = e.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
      })
    : [];
  const inputs = card
    ? [...card.querySelectorAll("input")]
        .filter((i) => i.getBoundingClientRect().height > 0)
        .slice(0, 4)
        .map((i) => {
          const r = i.getBoundingClientRect();
          return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x) };
        })
    : [];
  const btns = card
    ? [...card.querySelectorAll("button")]
        .filter(
          (b) =>
            b.textContent.trim() &&
            b.offsetParent !== null &&
            cr &&
            b.getBoundingClientRect().y > cr.y + cr.height - 130
        )
        .map((b) => {
          const r = b.getBoundingClientRect();
          return { t: b.textContent.trim().slice(0, 12), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) };
        })
    : [];
  return JSON.stringify({
    h1Y: Math.round(h1r.y),
    h1FS: getComputedStyle(h1).fontSize,
    card: cr ? { x: Math.round(cr.x), y: Math.round(cr.y), w: Math.round(cr.width), h: Math.round(cr.height) } : null,
    cardCls: card ? card.className.toString().slice(0, 70) : null,
    segments: segs,
    inputs,
    footerBtns: btns,
  });
})()
