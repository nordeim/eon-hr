(() => {
  const m = document.querySelector('main');
  const out = [];
  const backlog = [...m.querySelectorAll('h2,h3,div,span,p')].find(el => el.textContent.trim() === 'Backlog' && el.children.length === 0);
  if (!backlog) return 'no-backlog';
  // walk up to the direct column (small box, has the text inside)
  let col = backlog.parentElement;
  while (col && col.getBoundingClientRect().width > 400) col = col.parentElement;
  if (!col) return 'no-col';
  const cr = col.getBoundingClientRect();
  const ccs = getComputedStyle(col);
  out.push(`COL [${Math.round(cr.width)}x${Math.round(cr.height)}] bg=${ccs.backgroundColor} bw=${ccs.borderBottomWidth} bc=${ccs.borderColor} radius=${ccs.borderRadius} p=${ccs.padding} cls="${(typeof col.className === 'string' ? col.className : '')}"`);
  const dump = (el, depth) => {
    if (depth > 4) return;
    for (const ch of el.children) {
      if (['svg', 'path', 'rect', 'circle'].includes(ch.tagName.toLowerCase())) continue;
      const r = ch.getBoundingClientRect();
      if (r.height < 1) continue;
      const cs = getComputedStyle(ch);
      const txt = ch.children.length === 0 ? ch.textContent.trim().slice(0, 20) : '';
      out.push(`${'  '.repeat(depth)}${ch.tagName.toLowerCase()} [${Math.round(r.width)}x${Math.round(r.height)}] fs=${cs.fontSize} fw=${cs.fontWeight} color=${cs.color} bg=${cs.backgroundColor} radius=${cs.borderRadius} p=${cs.padding} "${txt}" cls="${(typeof ch.className === 'string' ? ch.className : '').slice(0, 70)}"`);
      dump(ch, depth + 1);
    }
  };
  dump(col, 1);
  const board = col.parentElement;
  out.push(`BOARD cls="${(typeof board.className === 'string' ? board.className : '')}"`);
  return out.join('\n');
})()
