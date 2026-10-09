(() => {
  const m = document.querySelector('main');
  const card = [...m.querySelectorAll('div')].filter(d => typeof d.className === 'string' && d.className.includes('bg-card')).find(d => d.textContent.includes('My Leave Balances'));
  const interior = card.querySelector(':scope > div');
  const cr = card.getBoundingClientRect();
  const out = [`CARD y=${Math.round(cr.y)} h=${Math.round(cr.height)} w=${Math.round(cr.width)} border-color=${getComputedStyle(card).borderColor} border-radius=${getComputedStyle(card).borderRadius}`];
  const out2 = [`INTERIOR cls="${interior.className}"`];
  for (const ch of interior.children) {
    const r = ch.getBoundingClientRect();
    const cs = getComputedStyle(ch);
    out2.push(`  ${ch.tagName.toLowerCase()} y=${Math.round(r.y)} h=${Math.round(r.height)} mb=${cs.marginBottom} "${ch.textContent.trim().slice(0, 30).replace(/\s+/g, ' ')}"`);
    if (ch.children.length && ch.children.length < 6) {
      for (const g of ch.children) {
        const gr = g.getBoundingClientRect();
        out2.push(`    sub ${g.tagName.toLowerCase()} y=${Math.round(gr.y)} h=${Math.round(gr.height)} "${g.textContent.trim().slice(0, 22).replace(/\s+/g, ' ')}"`);
      }
    }
  }
  return out.concat(out2).join('\n');
})()
