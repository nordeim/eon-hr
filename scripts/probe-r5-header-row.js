(() => {
  const m = document.querySelector('main');
  const card = [...m.querySelectorAll('div')].filter(d => typeof d.className === 'string' && d.className.includes('bg-card')).find(d => d.textContent.includes('My Leave Balances'));
  // first child div = the padded interior; its first child = header row
  const interior = card.querySelector(':scope > div');
  const headerRow = interior.querySelector(':scope > div');
  const cs = getComputedStyle(headerRow);
  const r = headerRow.getBoundingClientRect();
  const out = [`HEADERROW [${Math.round(r.width)}x${Math.round(r.height)}] disp=${cs.display} items=${cs.alignItems} justify=${cs.justifyContent} mb=${cs.marginBottom} mt=${cs.marginTop}`];
  for (const child of headerRow.children) {
    const ccs = getComputedStyle(child);
    const cr = child.getBoundingClientRect();
    out.push(`  ${child.tagName.toLowerCase()} "${child.textContent.trim().slice(0, 25)}" [${Math.round(cr.width)}x${Math.round(cr.height)}] fs=${ccs.fontSize} fw=${ccs.fontWeight} color=${ccs.color} mt=${ccs.marginTop} mb=${ccs.marginBottom} p=${ccs.padding} h=${ccs.height} lh=${ccs.lineHeight} lh-norm=${ccs.lineHeight === 'normal'}`);
  }
  out.push(`INTERIOR p=${getComputedStyle(interior).padding} cls="${interior.className.slice(0, 80)}"`);
  // card root: padding?
  out.push(`CARD p=${getComputedStyle(card).padding} cls="${card.className}"`);
  return out.join('\n');
})()
