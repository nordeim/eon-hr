// probe-r6-wizard-full.js — full geometry of the reference's inline Add-Employee wizard
(() => {
  const main = document.querySelector("main");
  // the wizard view: the element containing the h1 "Add New Employee"
  const h1 = [...main.querySelectorAll("h1")].find((h) => /Add New Employee/i.test(h.textContent));
  if (!h1) return "no-wizard-h1";
  const h1r = h1.getBoundingClientRect();
  // page root (p-4 md:p-8) and wrapper
  const p4 = [...main.querySelectorAll("div")].find((d) => /p-4 md:p-8/.test(d.className.toString()));
  // the wizard card: rounded-xl border bg-card max-w-4xl
  const card = [...main.querySelectorAll("div")].find(
    (d) => /max-w-4xl/.test(d.className.toString()) && d.querySelector("form, label")
  );
  const cr = card ? card.getBoundingClientRect() : null;
  // step rail: ol or the div containing the four step labels
  const steps = [...main.querySelectorAll("p, li, div")].filter((e) =>
    /^(Personal|Job|Contract|Documents)/.test(e.textContent.trim())
  );
  const stepInfo = steps.slice(0, 4).map((e) => {
    const r = e.getBoundingClientRect();
    return { t: e.textContent.trim().slice(0, 22), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), fs: getComputedStyle(e).fontSize };
  });
  // footer buttons (Next/Cancel)
  const btns = [...main.querySelectorAll("button")].filter((b) => b.offsetParent !== null && /^(Next|Cancel|Back|Create|Add|Save)/i.test(b.textContent.trim()));
  const btnInfo = btns.map((b) => {
    const r = b.getBoundingClientRect();
    const cs = getComputedStyle(b);
    return { t: b.textContent.trim().slice(0, 16), w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y), fs: cs.fontSize, bg: cs.backgroundColor };
  });
  // back button (arrow): the icon button before the h1
  const back = [...main.querySelectorAll("button")].find(
    (b) => b.offsetParent !== null && !b.textContent.trim() && b.getBoundingClientRect().y < h1r.y + 40 && b.getBoundingClientRect().y > h1r.y - 40
  );
  const br = back ? back.getBoundingClientRect() : null;
  // form grid: first two textboxes' geometry
  const inputs = [...main.querySelectorAll("input")].slice(0, 6).map((i) => {
    const r = i.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) };
  });
  return JSON.stringify({
    h1: { y: Math.round(h1r.y), fs: getComputedStyle(h1).fontSize, fw: getComputedStyle(h1).fontWeight, t: h1.textContent },
    subtitle: (() => {
      const p = h1.parentElement.querySelector("p");
      return p ? { t: p.textContent.slice(0, 30), fs: getComputedStyle(p).fontSize, color: getComputedStyle(p).color } : null;
    })(),
    backBtn: br ? { x: Math.round(br.x), y: Math.round(br.y), w: Math.round(br.width), h: Math.round(br.height) } : null,
    card: cr ? { x: Math.round(cr.x), y: Math.round(cr.y), w: Math.round(cr.width), h: Math.round(cr.height), cls: card.className.toString().slice(0, 80) } : null,
    steps: stepInfo,
    buttons: btnInfo,
    firstInputs: inputs,
  });
})()
