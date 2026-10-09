(() => {
  // Dump the content column structure — find the largest content container
  // below the header, then list its direct card-ish descendants by geometry.
  const m = document.querySelector('main');
  const root = m || document.body;
  const walk = (el, depth) => {
    const r = el.getBoundingClientRect();
    if (r.height < 40 || r.width < 100 || depth > 6) return [];
    let acc = [];
    const tag = el.tagName.toLowerCase();
    const cls = (typeof el.className === 'string' ? el.className : '').slice(0, 70);
    const txt = (el.textContent || '').trim().slice(0, 25).replace(/\s+/g, ' ');
    if (/card|border|shadow|rounded/i.test(cls) && r.height > 80) {
      acc.push(`d${depth} ${tag}[${Math.round(r.width)}x${Math.round(r.height)}] "${txt}" cls="${cls}"`);
    }
    for (const c of el.children) acc = acc.concat(walk(c, depth + 1));
    return acc;
  };
  const lines = walk(root, 0).slice(0, 30);
  return lines.join('\n');
})()
