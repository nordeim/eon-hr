(() => {
  const m = document.querySelector('main');
  const out = ['URL=' + location.pathname];
  const header = m.querySelector(':scope > header, :scope > div > header');
  if (header) {
    const r = header.getBoundingClientRect();
    const cs = getComputedStyle(header);
    out.push(`HEADER el=${header.tagName.toLowerCase()} [${Math.round(r.width)}x${Math.round(r.height)}] y=${Math.round(r.y)} bg=${cs.backgroundColor} border-b=${cs.borderBottomColor}/${cs.borderBottomWidth} p=${cs.padding} inner=<div>${header.firstElementChild ? header.firstElementChild.tagName.toLowerCase() : ''} cls="${(typeof header.firstElementChild?.className === 'string' ? header.firstElementChild.className : '').slice(0, 70)}"`);
  } else {
    out.push('HEADER: none');
  }
  // content wrapper: the sibling after the header
  const content = m.querySelector(':scope > div:not(:has(header)), :scope > div');
  const firstDiv = [...m.children].find(ch => ch.tagName.toLowerCase() === 'div');
  if (firstDiv) {
    const r = firstDiv.getBoundingClientRect();
    const cs = getComputedStyle(firstDiv);
    out.push(`CONTENT-WRAP [${Math.round(r.width)}x${Math.round(r.height)}] y=${Math.round(r.y)} maxW=${cs.maxWidth} p=${cs.padding} cls="${(typeof firstDiv.className === 'string' ? firstDiv.className : '').slice(0, 70)}"`);
    for (const ch of [...firstDiv.children].slice(0, 8)) {
      const cr = ch.getBoundingClientRect();
      out.push(`  child ${ch.tagName.toLowerCase()} y=${Math.round(cr.y)} h=${Math.round(cr.height)} "${ch.textContent.trim().slice(0, 35).replace(/\s+/g, ' ')}" cls="${(typeof ch.className === 'string' ? ch.className : '').slice(0, 70)}"`);
    }
  }
  return out.join('\n');
})()
