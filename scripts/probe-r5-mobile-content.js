(() => {
  const m = document.querySelector('main');
  const out = ['URL=' + location.pathname];
  // visible text snapshot
  out.push('TEXT: ' + m.innerText.replace(/\s+/g, ' ').slice(0, 200));
  // the app top bar (header element or first bar)
  const topbar = m.querySelector(':scope > header') || document.querySelector('header');
  if (topbar) {
    const cs = getComputedStyle(topbar);
    out.push(`TOPBAR pos=${cs.position} top=${cs.top} z=${cs.zIndex} h=${Math.round(topbar.getBoundingClientRect().height)}`);
  }
  // scroll container
  const sc = m.querySelector(':scope > div');
  if (sc) {
    const cs = getComputedStyle(sc);
    out.push(`SCROLLCONT overflow=${cs.overflow} disp=${cs.display}`);
    // first child content wrapper inside scroll container
    const f = sc.firstElementChild;
    if (f) {
      const r = f.getBoundingClientRect();
      const cs2 = getComputedStyle(f);
      out.push(`PAGE-ROOT ${f.tagName.toLowerCase()} x=${Math.round(r.x)} y=${Math.round(r.y)} w=${Math.round(r.width)} p=${cs2.padding} maxW=${cs2.maxWidth} cls="${(typeof f.className === 'string' ? f.className : '').slice(0, 90)}"`);
      for (const ch of [...f.children].slice(0, 5)) {
        const cr = ch.getBoundingClientRect();
        out.push(`  child ${ch.tagName.toLowerCase()} y=${Math.round(cr.y)} x=${Math.round(cr.x)} h=${Math.round(cr.height)} "${ch.textContent.trim().slice(0, 30).replace(/\s+/g, ' ')}" cls="${(typeof ch.className === 'string' ? ch.className : '').slice(0, 60)}"`);
      }
    }
  }
  // first card in the content
  const card = m.querySelector('div[class*="bg-card"]');
  if (card) { const r = card.getBoundingClientRect(); out.push(`FIRST-CARD x=${Math.round(r.x)} y=${Math.round(r.y)} w=${Math.round(r.width)}`); }
  return out.join('\n');
})()
