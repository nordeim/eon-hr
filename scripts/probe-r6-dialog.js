// probe-r6-dialog.js — dump the open dialog's interior geometry
(() => {
  const d = document.querySelector('[role="dialog"]');
  if (!d) return "no-dialog";
  const r = d.getBoundingClientRect();
  const title = d.querySelector("h2, [data-radix-dialog-title]");
  const labels = [...d.querySelectorAll("label")].map((l) => l.textContent.trim().slice(0, 25));
  const controls = [...d.querySelectorAll("input, select, textarea, button")].map((i) => {
    const ir = i.getBoundingClientRect();
    const cs = getComputedStyle(i);
    return {
      tag: i.tagName.toLowerCase(),
      t: (i.textContent || i.placeholder || i.getAttribute("aria-label") || i.type || "").slice(0, 20),
      w: Math.round(ir.width),
      h: Math.round(ir.height),
      fs: i.tagName === "BUTTON" ? cs.fontSize : null,
      fw: i.tagName === "BUTTON" ? cs.fontWeight : null,
    };
  });
  const footer = d.querySelector("footer, [class*=footer]");
  return JSON.stringify({
    dlgW: Math.round(r.width),
    dlgH: Math.round(r.height),
    maxW: getComputedStyle(d).maxWidth,
    radius: getComputedStyle(d).borderRadius,
    shadow: getComputedStyle(d).boxShadow.slice(0, 40),
    title: title ? title.textContent.trim().slice(0, 30) : null,
    titleFS: title ? getComputedStyle(title).fontSize : null,
    titleFW: title ? getComputedStyle(title).fontWeight : null,
    labels,
    controls: controls.slice(0, 16),
    footerH: footer ? Math.round(footer.getBoundingClientRect().height) : null,
  });
})()
