// probe-r6-wizard-header.js — exact header-row geometry of the reference wizard
(() => {
  const main = document.querySelector("main");
  const h1 = [...main.querySelectorAll("h1")].find((h) => /Add New Employee/i.test(h.textContent));
  if (!h1) return "no-wizard";
  const row = h1.parentElement;
  const rr = row.getBoundingClientRect();
  const card = [...main.querySelectorAll("div")].find(
    (d) => /max-w-4xl/.test(d.className.toString()) && d.querySelector("form, label")
  );
  const cr = card.getBoundingClientRect();
  const sub = row.querySelector("p");
  const back = row.querySelector("button");
  const br = back ? back.getBoundingClientRect() : null;
  return JSON.stringify({
    rowCls: row.className.toString().slice(0, 60),
    rowY: Math.round(rr.y),
    rowH: Math.round(rr.height),
    rowW: Math.round(rr.width),
    h1FS: getComputedStyle(h1).fontSize,
    h1FW: getComputedStyle(h1).fontWeight,
    subY: sub ? Math.round(sub.getBoundingClientRect().y) : null,
    subFS: sub ? getComputedStyle(sub).fontSize : null,
    subColor: sub ? getComputedStyle(sub).color : null,
    cardY: Math.round(cr.y),
    gap: Math.round(cr.y - (rr.y + rr.height)),
    backX: br ? Math.round(br.x) : null,
    backY: br ? Math.round(br.y) : null,
    backW: br ? Math.round(br.width) : null,
  });
})()
