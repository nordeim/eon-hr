(() => {
  // Probe the dashboard CONTENT area: quick-action chips, leave-balance cards,
  // expense card interior — everything below the h1 block.
  const main = document.querySelector('main') || document.body;
  const cards = [...main.querySelectorAll('div')].filter(d => d.className && typeof d.className === 'string' && /rounded/.test(d.className) && d.getBoundingClientRect().height > 60 && d.getBoundingClientRect().height < 400).slice(0, 12);
  const out = cards.map(c => {
    const r = c.getBoundingClientRect();
    const label = (c.querySelector('h2,h3,p,span')?.textContent || '').trim().slice(0, 40);
    return `[${Math.round(r.width)}x${Math.round(r.height)}] "${label}" cls="${c.className.slice(0, 90)}"`;
  });
  const chips = [...main.querySelectorAll('button, a')].filter(el => {
    const r = el.getBoundingClientRect();
    const t = (el.textContent || '').trim();
    return r.height > 0 && r.height < 50 && t && t.length < 30 && !/^(Home|Staff|Tasks|Attendance|Profile|عربي|EN)$/.test(t);
  }).slice(0, 20).map(el => {
    const r = el.getBoundingClientRect();
    return `chip[${Math.round(r.width)}x${Math.round(r.height)}] "${(el.textContent || '').trim().slice(0, 25)}"`;
  });
  return JSON.stringify({ cards: out, chips }, null, 1);
})()
