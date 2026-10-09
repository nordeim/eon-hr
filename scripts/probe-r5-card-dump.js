(() => {
  const m = document.querySelector('main');
  const card = [...m.querySelectorAll('div')].filter(d => typeof d.className === 'string' && d.className.includes('bg-card')).find(d => d.textContent.includes('My Leave Balances'));
  const cr = card.getBoundingClientRect();
  const out = [`CARD y=${Math.round(cr.y)} h=${Math.round(cr.height)} bottom=${Math.round(cr.bottom)}`];
  const dump = (el, depth, maxDepth) => {
    if (depth > maxDepth) return;
    for (const ch of el.children) {
      const r = ch.getBoundingClientRect();
      const cs = getComputedStyle(ch);
      const txt = ch.children.length === 0 ? ch.textContent.trim().slice(0, 24) : '';
      out.push(`${'  '.repeat(depth + 1)}${ch.tagName.toLowerCase()} y=${Math.round(r.y)} h=${Math.round(r.height)} mt=${cs.marginTop} mb=${cs.marginBottom} "${txt}" cls="${(typeof ch.className === 'string' ? ch.className : '').slice(0, 55)}"`);
      dump(ch, depth + 1, maxDepth);
    }
  };
  dump(card, 0, 3);
  return out.join('\n');
})()
