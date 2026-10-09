(() => {
  const m = document.querySelector('main');
  const out = [];
  // stat cards: small cards at the top (h 60-120)
  const cards = [...m.querySelectorAll('div')].filter(d => {
    if (typeof d.className !== 'string' || !/bg-card/.test(d.className)) return false;
    const r = d.getBoundingClientRect();
    return r.height > 50 && r.height < 140 && r.y < 500;
  }).slice(0, 5);
  for (const c of cards) {
    const r = c.getBoundingClientRect();
    out.push(`STATCARD [${Math.round(r.width)}x${Math.round(r.height)}] y=${Math.round(r.y)} "${c.textContent.trim().slice(0, 40).replace(/\s+/g, ' ')}"`);
    const val = [...c.querySelectorAll('div,p,span')].filter(el => el.children.length === 0 && /\d/.test(el.textContent)).slice(0, 2);
    for (const v of val) {
      const cs = getComputedStyle(v);
      const vr = v.getBoundingClientRect();
      out.push(`  val "${v.textContent.trim().slice(0, 20)}" fs=${cs.fontSize} fw=${cs.fontWeight} color=${cs.color}`);
    }
    const label = [...c.querySelectorAll('div,p,span')].filter(el => el.children.length === 0 && /[A-Z][a-z]/.test(el.textContent) && !/\d/.test(el.textContent)).slice(0, 1);
    for (const l of label) {
      const cs = getComputedStyle(l);
      out.push(`  label "${l.textContent.trim().slice(0, 22)}" fs=${cs.fontSize} fw=${cs.fontWeight} color=${cs.color}`);
    }
    const icon = c.querySelector('svg');
    if (icon) {
      const ir = icon.getBoundingClientRect();
      const ics = getComputedStyle(icon);
      const ip = icon.parentElement;
      out.push(`  icon [${Math.round(ir.width)}x${Math.round(ir.height)}] color=${ics.color} wrapCls="${(typeof ip.className === 'string' ? ip.className : '').slice(0, 60)}" wrapW=${Math.round(ip.getBoundingClientRect().width)}`);
    }
  }
  // empty state in the records card
  const empty = [...m.querySelectorAll('p,div')].filter(el => el.children.length === 0 && /No payroll records/.test(el.textContent))[0];
  if (empty) {
    const cs = getComputedStyle(empty);
    out.push(`EMPTY-HEAD fs=${cs.fontSize} fw=${cs.fontWeight} color=${cs.color}`);
    let box = empty;
    for (let i = 0; i < 4; i++) { if (box.parentElement && box.parentElement.getBoundingClientRect().height < 400 && /flex|grid|p-/.test(typeof box.parentElement.className === 'string' ? box.parentElement.className : '')) { box = box.parentElement; } else break; }
    const br = box.getBoundingClientRect();
    out.push(`EMPTY-BOX [${Math.round(br.width)}x${Math.round(br.height)}] cls="${(typeof box.className === 'string' ? box.className : '').slice(0, 90)}"`);
    const es = box.querySelectorAll('p, span');
    for (const p of [...es].slice(0, 3)) {
      const pcs = getComputedStyle(p);
      out.push(`  es-p "${p.textContent.trim().slice(0, 30)}" fs=${pcs.fontSize} fw=${pcs.fontWeight} color=${pcs.color}`);
    }
    const eb = [...box.querySelectorAll('button')][0];
    if (eb) {
      const er = eb.getBoundingClientRect();
      const ecs = getComputedStyle(eb);
      out.push(`  es-btn "${eb.textContent.trim().slice(0, 18)}" [${Math.round(er.width)}x${Math.round(er.height)}] fs=${ecs.fontSize} bg=${ecs.backgroundColor} color=${ecs.color}`);
    }
  }
  return out.join('\n');
})()
