(() => {
  const m = document.querySelector('main');
  const out = ['URL=' + location.pathname + ' vw=' + window.innerWidth];
  // the mobile kicker: main > header (ref) or any md:hidden top bar
  const kicker = m.querySelector(':scope > header') || [...m.querySelectorAll('div')].find(d => {
    if (typeof d.className !== 'string') return false;
    const r = d.getBoundingClientRect();
    return /md:hidden/.test(d.className) && r.height > 30 && r.width > 300;
  });
  if (kicker) {
    const r = kicker.getBoundingClientRect();
    const cs = getComputedStyle(kicker);
    out.push(`KICKER ${kicker.tagName.toLowerCase()} [${Math.round(r.width)}x${Math.round(r.height)}] x=${Math.round(r.x)} y=${Math.round(r.y)} bg=${cs.backgroundColor} border-b=${cs.borderBottomWidth}/${cs.borderBottomColor} p=${cs.padding} pos=${cs.position} top=${cs.top} z=${cs.zIndex} sticky=?${cs.position === 'sticky'} cls="${(typeof kicker.className === 'string' ? kicker.className : '').slice(0, 100)}"`);
    const h1 = kicker.querySelector('h1, h2, span, div');
    if (h1) { const hcs = getComputedStyle(h1); out.push(`  KICKER-TITLE "${h1.textContent.trim().slice(0, 25)}" fs=${hcs.fontSize} fw=${hcs.fontWeight} color=${hcs.color}`); }
  } else out.push('KICKER: none');
  // main itself
  const mcs = getComputedStyle(m);
  const mr = m.getBoundingClientRect();
  out.push(`MAIN [${Math.round(mr.width)}x${Math.round(mr.height)}] x=${Math.round(mr.x)} y=${Math.round(mr.y)} p=${mcs.padding} cls="${(typeof m.className === 'string' ? m.className : '').slice(0, 80)}"`);
  // first content element below the kicker
  const firstContent = kicker && kicker.nextElementSibling ? kicker.nextElementSibling : m.firstElementChild;
  if (firstContent) {
    const r = firstContent.getBoundingClientRect();
    const cs = getComputedStyle(firstContent);
    out.push(`FIRST-CONTENT ${firstContent.tagName.toLowerCase()} x=${Math.round(r.x)} y=${Math.round(r.y)} w=${Math.round(r.width)} p=${cs.padding} maxW=${cs.maxWidth} cls="${(typeof firstContent.className === 'string' ? firstContent.className : '').slice(0, 80)}"`);
  }
  // the first h1 on the page (page title at mobile)
  const h1 = m.querySelector('h1');
  if (h1) { const r = h1.getBoundingClientRect(); const cs = getComputedStyle(h1); out.push(`PAGE-H1 "${h1.textContent.trim().slice(0, 25)}" x=${Math.round(r.x)} y=${Math.round(r.y)} fs=${cs.fontSize} fw=${cs.fontWeight}`); }
  return out.join('\n');
})()
