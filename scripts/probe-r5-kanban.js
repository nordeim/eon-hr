(() => {
  const m = document.querySelector('main');
  const out = [];
  // find the kanban board: the container holding the Backlog column
  const backlog = [...m.querySelectorAll('h2,h3,div,span,p')].find(el => el.textContent.trim() === 'Backlog' && el.children.length === 0);
  if (!backlog) return 'no-backlog';
  // walk up to the column container
  let col = backlog;
  for (let i = 0; i < 5; i++) { col = col.parentElement; if (!col) break; const r = col.getBoundingClientRect(); if (r.height > 80 && r.width > 100 && r.width < 400) break; }
  if (!col) return 'no-col';
  const cr = col.getBoundingClientRect();
  out.push(`COL [${Math.round(cr.width)}x${Math.round(cr.height)}] x=${Math.round(cr.x)} y=${Math.round(cr.y)} bg=${getComputedStyle(col).backgroundColor} border=${getComputedStyle(col).borderColor} radius=${getComputedStyle(col).borderRadius} cls="${(typeof col.className === 'string' ? col.className : '').slice(0, 90)}"`);
  const dump = (el, depth) => {
    if (depth > 3) return;
    for (const ch of el.children) {
      if (['svg', 'path'].includes(ch.tagName.toLowerCase())) continue;
      const r = ch.getBoundingClientRect();
      if (r.height < 1 && !/Backlog/.test(ch.textContent)) continue;
      const cs = getComputedStyle(ch);
      const txt = ch.children.length === 0 ? ch.textContent.trim().slice(0, 20) : '';
      out.push(`${'  '.repeat(depth)}${ch.tagName.toLowerCase()} [${Math.round(r.width)}x${Math.round(r.height)}] fs=${cs.fontSize} fw=${cs.fontWeight} color=${cs.color} bg=${cs.backgroundColor} "${txt}" cls="${(typeof ch.className === 'string' ? ch.className : '').slice(0, 60)}"`);
      dump(ch, depth + 1);
    }
  };
  dump(col, 1);
  // the board row containing all columns
  const board = col.parentElement;
  const br = board.getBoundingClientRect();
  out.push(`BOARD [${Math.round(br.width)}x${Math.round(br.height)}] cls="${(typeof board.className === 'string' ? board.className : '').slice(0, 90)}"`);
  return out.join('\n');
})()
