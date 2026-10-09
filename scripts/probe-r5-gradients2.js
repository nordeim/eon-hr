(() => {
  const out = ['URL=' + location.pathname];
  const all = document.querySelectorAll('*');
  const found = [];
  for (const el of all) {
    const cs = getComputedStyle(el);
    if (cs.backgroundImage !== 'none') {
      const r = el.getBoundingClientRect();
      found.push({ tag: el.tagName.toLowerCase(), cls: (typeof el.className === 'string' ? el.className : '').slice(0, 70), w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y), img: cs.backgroundImage.slice(0, 110) });
    }
  }
  for (const f of found.slice(0, 8)) {
    out.push(`${f.tag} [${f.w}x${f.h}] y=${f.y} cls="${f.cls}" img=${f.img}`);
  }
  if (!found.length) out.push('NO-GRADIENTS');
  return out.join('\n');
})()
