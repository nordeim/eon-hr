(() => {
  const m = document.querySelector('main');
  const card = [...m.querySelectorAll('div')].filter(d => typeof d.className === 'string' && d.className.includes('bg-card')).find(d => d.textContent.includes('My Leave Balances'));
  const title = [...card.querySelectorAll('h3,div,p')].find(el => el.textContent.trim() === 'My Leave Balances' && el.children.length === 0);
  const tcs = getComputedStyle(title);
  const out = [`TITLE fs=${tcs.fontSize} fw=${tcs.fontWeight} color=${tcs.color} ls=${tcs.letterSpacing} lh=${tcs.lineHeight} ff=${tcs.fontFamily.slice(0, 60)}`];
  // body text color
  out.push(`BODY color=${getComputedStyle(document.body).color}`);
  // the balance label + value colors
  const label = [...card.querySelectorAll('span,div,p')].find(el => el.textContent.trim() === 'Annual Leave' && el.children.length === 0);
  if (label) { const cs = getComputedStyle(label); out.push(`ANNUAL-LABEL fs=${cs.fontSize} color=${cs.color} fw=${cs.fontWeight}`); }
  const val = [...card.querySelectorAll('span')].find(el => /21 \/ 21 days/.test(el.textContent));
  if (val) { const cs = getComputedStyle(val); out.push(`BAL-VAL fs=${cs.fontSize} color=${cs.color} fw=${cs.fontWeight}`); }
  // progress track + fill
  const track = card.querySelector('[class*="bg-slate-200"], [role="progressbar"]')?.parentElement;
  const bar = card.querySelector('[role="progressbar"]');
  if (bar) {
    const bcs = getComputedStyle(bar);
    const br = bar.getBoundingClientRect();
    out.push(`BAR-FILL [${Math.round(br.width)}x${Math.round(br.height)}] bg=${bcs.backgroundColor} radius=${bcs.borderRadius}`);
    if (track) { const tcs2 = getComputedStyle(track); const tr = track.getBoundingClientRect(); out.push(`BAR-TRACK [${Math.round(tr.width)}x${Math.round(tr.height)}] bg=${tcs2.backgroundColor} radius=${tcs2.borderRadius}`); }
  }
  // content wrapper (second direct child of card)
  const kids = [...card.children];
  out.push(`CARD-CHILDREN=${kids.length}`);
  kids.forEach((k, i) => {
    const kr = k.getBoundingClientRect();
    out.push(`  child${i} ${k.tagName.toLowerCase()} y=${Math.round(kr.y)} h=${Math.round(kr.height)} cls="${k.className.slice(0, 60)}"`);
  });
  return out.join('\n');
})()
