(() => {
  const m = document.querySelector('main');
  const qaCard = [...m.querySelectorAll('div')].filter(d => typeof d.className === 'string' && d.className.includes('bg-card')).find(d => d.textContent.includes('Quick Actions'));
  const grid = qaCard.querySelector('.grid');
  const chip = grid.querySelector('a');
  const dump = (el, depth) => {
    const lines = [];
    for (const ch of el.children) {
      const r = ch.getBoundingClientRect();
      const cs = getComputedStyle(ch);
      lines.push(`${'  '.repeat(depth)}<${ch.tagName.toLowerCase()} class="${(typeof ch.className === 'string' ? ch.className : '').slice(0, 80)}"> [${Math.round(r.width)}x${Math.round(r.height)}] fs=${cs.fontSize} lh=${cs.lineHeight} radius=${cs.borderRadius} border=${cs.borderColor} p=${cs.padding} gap=${cs.gap}`);
      lines.push(...dump(ch, depth + 1));
    }
    return lines;
  };
  return ['GRID cls="' + grid.className + '"'].concat(dump(chip, 1)).join('\n');
})()
