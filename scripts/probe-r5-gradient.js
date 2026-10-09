(() => {
  const out = ['URL=' + location.pathname];
  const chain = [
    ['body', document.body],
    ['html', document.documentElement],
  ];
  const m = document.querySelector('main');
  if (m) {
    chain.push(['main', m]);
    let el = m;
    for (let i = 0; i < 3; i++) {
      el = el.firstElementChild;
      if (!el) break;
      chain.push(['lvl' + (i + 1), el]);
    }
  }
  for (const [label, el] of chain) {
    const cs = getComputedStyle(el);
    out.push(`${label}: bg-image=${cs.backgroundImage.slice(0, 80)} bg-color=${cs.backgroundColor} minH=${cs.minHeight} h=${cs.height}`);
  }
  return out.join('\n');
})()
