// probe-r6-wizard.js — dump the open wizard dialog (reference uses plain divs, not role=dialog)
(() => {
  const open = [...document.querySelectorAll('[data-state="open"]')].filter(
    (e) => getComputedStyle(e).display !== "none" && e.getBoundingClientRect().height > 100
  );
  const d = open.sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0];
  if (!d) return "no-open-panel";
  const r = d.getBoundingClientRect();
  const h2 = d.querySelector("h2, [class*=text-lg]");
  const steps = [...d.querySelectorAll("ol li, [class*=step] li")].map((li) => ({
    t: li.textContent.trim().slice(0, 22),
    cls: (li.className || "").toString().slice(0, 40),
  }));
  const labels = [...d.querySelectorAll("label")].map((l) => l.textContent.trim().slice(0, 20)).slice(0, 10);
  const inputs = [...d.querySelectorAll("input, select, textarea")].map((i) => {
    const ir = i.getBoundingClientRect();
    return { tag: i.tagName.toLowerCase(), w: Math.round(ir.width), h: Math.round(ir.height) };
  });
  const buttons = [...d.querySelectorAll("button")].filter((b) => b.textContent.trim()).map((b) => {
    const br = b.getBoundingClientRect();
    const cs = getComputedStyle(b);
    return {
      t: b.textContent.trim().slice(0, 18),
      w: Math.round(br.width),
      h: Math.round(br.height),
      fs: cs.fontSize,
      bg: cs.backgroundColor.slice(0, 20),
    };
  });
  return JSON.stringify({
    panelW: Math.round(r.width),
    panelH: Math.round(r.height),
    panelX: Math.round(r.x),
    radius: getComputedStyle(d).borderRadius,
    title: h2 ? h2.textContent.trim().slice(0, 30) : null,
    steps,
    labels,
    inputs: inputs.slice(0, 12),
    buttons: buttons.slice(0, 8),
  });
})()
