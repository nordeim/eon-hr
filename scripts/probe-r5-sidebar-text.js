(() => {
  // Measure the REF sidebar footer: Demo sub, user name/email, Main Menu label,
  // nav inactive label colors — which come from shadcn tokens vs explicit slate classes.
  const out = [];
  const grab = (sel, label) => {
    const el = document.querySelector(sel);
    if (el) { const cs = getComputedStyle(el); out.push(`${label}: fs=${cs.fontSize} fw=${cs.fontWeight} color=${cs.color}`); }
  };
  // find "Demo" text in the sidebar header
  const demo = [...document.querySelectorAll('span, p, div')].find(el => el.textContent.trim() === 'Demo' && el.children.length === 0);
  if (demo) { const cs = getComputedStyle(demo); out.push(`DEMO: fs=${cs.fontSize} color=${cs.color}`); }
  const mainMenu = [...document.querySelectorAll('div,span,p')].find(el => el.textContent.trim() === 'MAIN MENU' && el.children.length === 0);
  if (mainMenu) { const cs = getComputedStyle(mainMenu); out.push(`MAIN-MENU: fs=${cs.fontSize} fw=${cs.fontWeight} color=${cs.color} ls=${cs.letterSpacing}`); }
  const email = [...document.querySelectorAll('p,span')].find(el => el.textContent.trim() === 'sepnetflix2023@outlook.com' && el.children.length === 0);
  if (email) { const cs = getComputedStyle(email); out.push(`USER-EMAIL: fs=${cs.fontSize} color=${cs.color}`); }
  const name = [...document.querySelectorAll('p,span')].find(el => el.textContent.trim() === 'sepnetflix2023' && el.children.length === 0);
  if (name) { const cs = getComputedStyle(name); out.push(`USER-NAME: fs=${cs.fontSize} fw=${cs.fontWeight} color=${cs.color}`); }
  // dashboard subtitle (explicit slate?)
  const sub = [...document.querySelectorAll('main p')].find(el => el.textContent.trim() === 'Your personal employee portal.');
  if (sub) { const cs = getComputedStyle(sub); out.push(`DASH-SUBTITLE: fs=${cs.fontSize} color=${cs.color}`); }
  // welcome h1
  const h1 = [...document.querySelectorAll('main h1')].find(el => el.textContent.includes('Welcome back'));
  if (h1) { const cs = getComputedStyle(h1); out.push(`WELCOME-H1: fs=${cs.fontSize} fw=${cs.fontWeight} color=${cs.color}`); }
  // no-claims / empty text
  const empty = [...document.querySelectorAll('main p')].find(el => /No claims yet|No requests yet/.test(el.textContent));
  if (empty) { const cs = getComputedStyle(empty); out.push(`EMPTY-TEXT: fs=${cs.fontSize} color=${cs.color}`); }
  // Quick action chip label + chip geometry
  const chip = [...document.querySelectorAll('main a')].find(el => el.textContent.trim() === 'My Portal');
  if (chip) {
    const cs = getComputedStyle(chip);
    const r = chip.getBoundingClientRect();
    out.push(`CHIP: [${Math.round(r.width)}x${Math.round(r.height)}] fs=${cs.fontSize} color=${cs.color} border=${cs.borderColor} radius=${cs.borderRadius} p=${cs.padding} bg=${cs.backgroundColor}`);
    const span = chip.querySelector('span');
    if (span) out.push(`CHIP-SPAN: color=${getComputedStyle(span).color}`);
    const ic = chip.querySelector('svg');
    if (ic) { const ir = ic.getBoundingClientRect(); out.push(`CHIP-ICON: [${Math.round(ir.width)}x${Math.round(ir.height)}] color=${getComputedStyle(ic).color}`); }
  }
  // quick actions card: title + interior geometry
  const qaCard = [...document.querySelectorAll('main div')].filter(d => typeof d.className === 'string' && d.className.includes('bg-card')).find(d => d.textContent.includes('Quick Actions'));
  if (qaCard) {
    const r = qaCard.getBoundingClientRect();
    out.push(`QA-CARD: h=${Math.round(r.height)}`);
    const hdr = qaCard.querySelector(':scope > div');
    const hr = hdr.getBoundingClientRect();
    out.push(`QA-HDR: y=${Math.round(hr.y)} h=${Math.round(hr.height)} cls="${hdr.className.slice(0, 60)}"`);
    const content = qaCard.querySelectorAll(':scope > div')[1];
    const ctr = content.getBoundingClientRect();
    out.push(`QA-CONTENT: y=${Math.round(ctr.y)} h=${Math.round(ctr.height)} cls="${content.className.slice(0, 60)}"`);
    const grid = content.querySelector(':scope > div');
    if (grid) { const gr = grid.getBoundingClientRect(); out.push(`QA-GRID: y=${Math.round(gr.y)} h=${Math.round(gr.height)} cls="${grid.className.slice(0, 60)}"`); }
  }
  return out.join('\n');
})()
