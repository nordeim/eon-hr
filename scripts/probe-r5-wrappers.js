(() => {
  const m = document.querySelector('main');
  // find the deepest "page wrapper": look for max-w-* or p-4/p-8 classes near the top
  const out = ['URL=' + location.pathname];
  const candidates = [...m.querySelectorAll('div')].filter(d => {
    if (typeof d.className !== 'string') return false;
    const r = d.getBoundingClientRect();
    return r.width > 500 && /max-w-|mx-auto/.test(d.className) && d.className.length < 120;
  });
  const seen = new Set();
  for (const c of candidates.slice(0, 3)) {
    const r = c.getBoundingClientRect();
    const cs = getComputedStyle(c);
    const key = c.className;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(`MAXW-WRAP [${Math.round(r.width)}x${Math.round(r.height)}] x=${Math.round(r.x)} p=${cs.padding} cls="${c.className.slice(0, 110)}"`);
  }
  // also the first padded wrapper (p-4/p-8)
  const padded = [...m.querySelectorAll('div')].filter(d => {
    if (typeof d.className !== 'string') return false;
    const r = d.getBoundingClientRect();
    return r.width > 500 && /(^|\s)(p-4|p-6|p-8|px-4|px-6|px-8)/.test(d.className) && r.height > 200;
  });
  const seenP = new Set();
  for (const p of padded.slice(0, 2)) {
    const r = p.getBoundingClientRect();
    const cs = getComputedStyle(p);
    if (seenP.has(p.className)) continue;
    seenP.add(p.className);
    out.push(`PADDED-WRAP [${Math.round(r.width)}x${Math.round(r.height)}] x=${Math.round(r.x)} p=${cs.padding} maxW=${cs.maxWidth} bg=${cs.backgroundColor} cls="${p.className.slice(0, 110)}"`);
  }
  return out.join('\n');
})()
