(() => {
  // Generic module content probe: page root wrapper + first-level blocks with
  // geometry/styles — for side-by-side diffing across routes.
  const m = document.querySelector('main');
  const out = ['URL=' + location.pathname];
  // page root: ref = main>div>div>div.page-wrap / loc = main>div
  let page = m;
  for (let i = 0; i < 4; i++) {
    const next = page.children ? [...page.children].find(c => c.tagName.toLowerCase() === 'div') : null;
    if (!next) break;
    page = next;
    if (typeof page.className === 'string' && /p-4|p-8|space-y|gap-/.test(page.className)) break;
  }
  const pr = page.getBoundingClientRect();
  const pcs = getComputedStyle(page);
  out.push(`PAGE-ROOT x=${Math.round(pr.x)} w=${Math.round(pr.width)} p=${pcs.padding} maxW=${pcs.maxWidth} cls="${(typeof page.className === 'string' ? page.className : '').slice(0, 70)}"`);
  let idx = 0;
  for (const ch of page.children) {
    if (idx++ > 7) break;
    const r = ch.getBoundingClientRect();
    if (r.height < 1) { out.push(`  [hidden] ${ch.tagName.toLowerCase()} "${ch.textContent.trim().slice(0, 25)}"`); continue; }
    const cs = getComputedStyle(ch);
    out.push(`  ${ch.tagName.toLowerCase()} y=${Math.round(r.y)} h=${Math.round(r.height)} w=${Math.round(r.width)} disp=${cs.display} "${ch.textContent.trim().slice(0, 40).replace(/\s+/g, ' ')}" cls="${(typeof ch.className === 'string' ? ch.className : '').slice(0, 70)}"`);
  }
  // toolbar-ish rows: buttons + inputs in the top 400px
  const btns = [...m.querySelectorAll('button, a[class*=rounded]')].filter(b => {
    const r = b.getBoundingClientRect();
    return r.y < 400 && r.height >= 30 && r.height <= 42 && r.width > 60 && b.textContent.trim().length > 0 && b.textContent.trim().length < 24;
  }).slice(0, 6);
  for (const b of btns) {
    const r = b.getBoundingClientRect();
    const cs = getComputedStyle(b);
    out.push(`BTN "${b.textContent.trim().slice(0, 18)}" [${Math.round(r.width)}x${Math.round(r.height)}] fs=${cs.fontSize} bg=${cs.backgroundColor} color=${cs.color} radius=${cs.borderRadius} border=${cs.borderColor} grad=${cs.backgroundImage.slice(0, 30)}`);
  }
  const inputs = [...m.querySelectorAll('input')].filter(i => i.getBoundingClientRect().y < 500).slice(0, 3);
  for (const i2 of inputs) {
    const r = i2.getBoundingClientRect();
    const cs = getComputedStyle(i2);
    out.push(`INPUT [${Math.round(r.width)}x${Math.round(r.height)}] fs=${cs.fontSize} ph="${i2.placeholder?.slice(0, 20)}" border=${cs.borderColor} radius=${cs.borderRadius}`);
  }
  return out.join('\n');
})()
