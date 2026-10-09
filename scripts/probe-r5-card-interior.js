(() => {
  // Probe dashboard card interiors: header rows, leave balance rows,
  // expense total typography — measured on both sides.
  const m = document.querySelector('main');
  const cards = [...m.querySelectorAll('div')].filter(d => typeof d.className === 'string' && d.className.includes('bg-card')).slice(0, 6);
  const out = [];
  for (const c of cards) {
    const title = c.querySelector('h2, h3');
    if (title) {
      const cs = getComputedStyle(title);
      out.push(`TITLE "${title.textContent.trim().slice(0,30)}" fs=${cs.fontSize} fw=${cs.fontWeight} color=${cs.color} mt=${cs.marginTop} mb=${cs.marginBottom}`);
    }
    // leave balance rows: strong/div pairs
    const rows = [...c.querySelectorAll(':scope > div > div')].filter(r => r.textContent.trim() && r.getBoundingClientRect().height > 10 && r.getBoundingClientRect().height < 60).slice(0, 4);
    for (const r of rows) {
      const rr = r.getBoundingClientRect();
      const strong = r.querySelector('strong, span.font-bold, [class*=font-bold]');
      const label = (r.querySelector('p, span')?.textContent || r.textContent).trim().slice(0, 22);
      out.push(`  row[${Math.round(rr.width)}x${Math.round(rr.height)}] "${label}"${strong ? ` val="${strong.textContent.trim()}" fs=${getComputedStyle(strong).fontSize}` : ''}`);
    }
    // expense big number
    const big = [...c.querySelectorAll('p, span, div')].find(el => /^\d/.test(el.textContent.trim()) && getComputedStyle(el).fontSize.replace('px','') >= 24);
    if (big) out.push(`  BIG "${big.textContent.trim()}" fs=${getComputedStyle(big).fontSize} fw=${getComputedStyle(big).fontWeight}`);
  }
  return out.join('\n');
})()
