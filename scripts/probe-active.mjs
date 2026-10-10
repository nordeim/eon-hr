// probe-active.mjs — active nav item styling: top-level Dashboard on /dashboard
const probe = {
  wait: 3000,
  js: `(() => { const vis=(e)=>e&&e.offsetParent!==null; const dash=[...document.querySelectorAll('a,button')].find(e=>vis(e)&&e.textContent.trim().startsWith('Dashboard')); const cs=dash?getComputedStyle(dash):null; const r=dash?dash.getBoundingClientRect():null; const sp=dash?dash.querySelector('span'):null; const spcs=sp?getComputedStyle(sp):null; const ic=dash?dash.querySelector('svg'):null; return {h:r?Math.round(r.height):-1, bg:cs?cs.backgroundColor:null, col:cs?cs.color:null, fw:spcs?spcs.fontWeight:null, fs:cs?cs.fontSize:null, r:cs?cs.borderRadius:null, iconCol:ic?getComputedStyle(ic).color:null, shadow:cs?cs.boxShadow.slice(0,40):null}; })()`,
};

export default probe;
