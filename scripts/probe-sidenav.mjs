// probe-sidenav.mjs — sidebar nav item geometry: top-level buttons + sub-item
// links, heights, padding, font sizes, icon sizes, spacing between items
const probe = {
  wait: 3000,
  js: `(() => { const vis=(e)=>e&&e.offsetParent!==null; const px=(el,prop)=>el?getComputedStyle(el)[prop]:null; const navBtns=[...document.querySelectorAll('button')].filter(b=>vis(b)&&['Employees','Payroll','Recruitment','Compliance'].includes(b.textContent.trim().split('\\n')[0].trim())); const b=navBtns[0]; const br=b?b.getBoundingClientRect():null; const cs=b?getComputedStyle(b):null; const subLinks=[...document.querySelectorAll('a')].filter(a=>vis(a)&&a.querySelector('svg')&&a.getBoundingClientRect().height<40&&a.getBoundingClientRect().x>30&&a.textContent.trim().length>0&&a.closest('nav')); const s=subLinks[0]; const sr=s?s.getBoundingClientRect():null; const scs=s?getComputedStyle(s):null; const icon=b?b.querySelector('svg'):null; const ir=icon?icon.getBoundingClientRect():null; return { topBtnH:Math.round(br?.height??-1), topBtnPx:cs?{py:cs.paddingTop,px:cs.paddingLeft,fs:cs.fontSize,fw:cs.fontWeight,gap:cs.gap||cs.columnGap}:null, iconW:Math.round(ir?.width??-1), subCount:subLinks.length, subH:Math.round(sr?.height??-1), subPx:scs?{py:scs.paddingTop,fs:scs.fontSize,fw:scs.fontWeight,r:scs.borderRadius}:null, subIconW:Math.round(s?.querySelector('svg')?.getBoundingClientRect().width??-1)}; })()`,
};

export default probe;
