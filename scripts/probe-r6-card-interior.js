// probe-r6-card-interior.js — map the reference wizard card's full interior
// (the extra blocks above the step rail and around the form)
(() => {
  const card = [...document.querySelectorAll("div")].find(
    (d) => /max-w-4xl/.test(d.className.toString()) && d.querySelector("form, label")
  );
  if (!card) return "no-card";
  const p8 = card.querySelector("div.p-8") || card.firstElementChild;
  const walk = (el, depth, out) => {
    for (const c of el.children) {
      const r = c.getBoundingClientRect();
      const cs = getComputedStyle(c);
      if (r.height < 1 && cs.display === "none") continue;
      out.push({
        d: depth,
        tag: c.tagName,
        cls: (c.className || "").toString().slice(0, 55),
        y: Math.round(r.y),
        h: Math.round(r.height),
        text: (c.textContent || "").trim().slice(0, 30),
      });
      if (depth < 2 && c.children.length && c.children.length < 12) walk(c, depth + 1, out);
    }
    return out;
  };
  const tree = walk(p8, 0, []);
  return JSON.stringify(tree.slice(0, 24));
})()
