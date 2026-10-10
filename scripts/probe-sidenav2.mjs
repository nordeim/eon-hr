// probe-sidenav2.mjs — precise top-level nav button box model + sub items
const probe = {
  wait: 3000,
  js: `(() => { const vis=(e)=>e&&e.offsetParent!==null; const btns=[...document.querySelectorAll('button')].filter(b=>vis(b)&&b.textContent.trim().startsWith('Employees')); const b=btns[0]; if(!b) return {err:'no btn'}; const cs=getComputedStyle(b); const icon=b.querySelector('svg'); const ic=icon?getComputedStyle(icon):null; const ir=icon?icon.getBoundingClientRect():null; const txt=[...b.querySelectorAll('span')].map(s=>s.textContent.trim()).filter(Boolean); const sp=b.querySelector('span'); const lh=sp?getComputedStyle(sp).lineHeight:null; const chev=b.querySelectorAll('svg')[1]; const cr=chev?chev.getBoundingClientRect():null; return {h:Math.round(b.getBoundingClientRect().height), w:Math.round(b.getBoundingClientRect().width), py:cs.paddingTop, px:cs.paddingLeft, gap:cs.columnGap, fs:cs.fontSize, fw:cs.fontWeight, lh:cs.lineHeight, iconRect:ir?{w:Math.round(ir.width),h:Math.round(ir.height)}:null, iconSize:ic?{w:ic.width,h:ic.height}:null, chevRect:cr?{w:Math.round(cr.width),h:Math.round(cr.height)}:null, label:txt[0]}; })()`,
};

export default probe;
