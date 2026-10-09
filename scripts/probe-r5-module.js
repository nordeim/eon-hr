(() => {
  // Module page CONTENT probe: the card(s) below the page header —
  // card header row, toolbar (search/buttons), empty-state icon/text,
  // table headers if present.
  const main = document.querySelector('main');
  const out = ['URL=' + location.pathname];
  // all direct card-ish children of the content area
  const cards = [...main.querySelectorAll(':scope div > div')].filter(d => {
    if (typeof d.className !== 'string') return false;
    const r = d.getBoundingClientRect();
    return r.height > 60 && r.width > 400 && /rounded|border|bg-card/.test(d.className);
  }).slice(0, 3);
  for (const c of cards) {
    const r = c.getBoundingClientRect();
    const cs = getComputedStyle(c);
    out.push(`CARD [${Math.round(r.width)}x${Math.round(r.height)}] y=${Math.round(r.y)} radius=${cs.borderRadius} border=${cs.borderColor} shadow=${cs.boxShadow.slice(0, 40)} cls="${c.className.slice(0, 70)}"`);
    // walk 2 levels
    const walk = (el, depth, maxDepth) => {
      if (depth > maxDepth) return;
      for (const ch of el.children) {
        if (ch.tagName.toLowerCase() === 'svg' || ch.tagName.toLowerCase() === 'path') continue;
        const cr = ch.getBoundingClientRect();
        if (cr.height < 2) continue;
        const ccs = getComputedStyle(ch);
        const txt = ch.children.length === 0 ? ch.textContent.trim().slice(0, 28).replace(/\s+/g, ' ') : '';
        const icon = ch.querySelector('svg');
        const ir = icon ? icon.getBoundingClientRect() : null;
        out.push(`${'  '.repeat(depth)}${ch.tagName.toLowerCase()} [${Math.round(cr.width)}x${Math.round(cr.height)}] fs=${ccs.fontSize} fw=${ccs.fontWeight} color=${ccs.color}${ir ? ` icon[${Math.round(ir.width)}x${Math.round(ir.height)}]` : ''} "${txt}" cls="${(typeof ch.className === 'string' ? ch.className : '').slice(0, 60)}"`);
        walk(ch, depth + 1, maxDepth);
      }
    };
    walk(c, 1, 3);
  }
  return out.join('\n');
})()
