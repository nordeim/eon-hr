// probe-r6-stepicons.js — extract step-rail icon shapes + footer recipe from the ref wizard
(() => {
  const card = [...document.querySelectorAll("div")].find(
    (d) => /max-w-4xl/.test(d.className.toString()) && d.querySelector("form, label")
  );
  if (!card) return "no-wizard-card";
  const segs = [...card.querySelectorAll("div.flex.flex-col.items-center")];
  const icons = segs.map((s) => {
    const svg = s.querySelector("svg");
    return {
      label: s.querySelector("p").textContent.slice(0, 22),
      iconChildren: svg
        ? [...svg.children].map((c) => c.tagName + (c.getAttribute("d") ? ":" + c.getAttribute("d").slice(0, 36) : ""))
        : null,
    };
  });
  const btns = [...card.querySelectorAll("button")].filter((b) => b.textContent.trim());
  const footerBtns = btns
    .filter((b) => /^(Cancel|Next|Back|Create|Save)/i.test(b.textContent.trim()))
    .map((b) => {
      const cs = getComputedStyle(b);
      return {
        t: b.textContent.trim().slice(0, 14),
        cls: b.className.toString().slice(0, 80),
        bg: cs.backgroundColor,
        bgImage: cs.backgroundImage.slice(0, 60),
        color: cs.color,
        h: Math.round(b.getBoundingClientRect().height),
      };
    });
  return JSON.stringify({ icons, footerBtns });
})()
