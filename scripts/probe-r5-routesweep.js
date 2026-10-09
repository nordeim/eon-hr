(() => {
  const m = document.querySelector('main');
  if (!m) return 'NO-MAIN';
  const out = ['URL=' + location.pathname];
  // page root: the div inside the scroll container with min-h-screen or p-4/p-8
  let root = null;
  for (const d of m.querySelectorAll('div')) {
    if (typeof d.className !== 'string') continue;
    const r = d.getBoundingClientRect();
    if (r.width > 800 && /min-h-screen/.test(d.className) && /bg-gradient|p-4/.test(d.className)) { root = d; break; }
    if (!root && r.width > 800 && /(^|\s)(p-4|p-8)/.test(d.className) && /md:p-8/.test(d.className)) { root = d; }
  }
  if (root) out.push('ROOT: ' + root.className.slice(0, 130));
  else out.push('ROOT: none-found');
  // content wrapper (max-w)
  const wrap = [...m.querySelectorAll('div')].filter(d => typeof d.className === 'string' && /max-w-(4xl|5xl|6xl|7xl)/.test(d.className) && d.getBoundingClientRect().width > 400)[0];
  if (wrap) out.push('WRAP: ' + wrap.className.slice(0, 90));
  // gradient buttons
  for (const b of document.querySelectorAll('button')) {
    const img = getComputedStyle(b).backgroundImage;
    if (img !== 'none' && !/linear-gradient\(to right bottom/.test(img)) {
      out.push('GRADBTN "' + b.textContent.trim().slice(0, 22) + '" ' + img.slice(0, 95));
    }
  }
  // header h1
  const h1 = m.querySelector('h1');
  if (h1) {
    const r = h1.getBoundingClientRect();
    const cs = getComputedStyle(h1);
    out.push('H1: y=' + Math.round(r.y) + ' fs=' + cs.fontSize + ' color=' + cs.color + ' "' + h1.textContent.trim().slice(0, 25) + '"');
  }
  return out.join('\n');
})()
