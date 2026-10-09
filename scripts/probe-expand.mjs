// probe-subnav.mjs — after expanding the Employees group: sub-link box model
export default {
  wait: 2500,
  js: `(() => { const vis=(e)=>e&&e.offsetParent!==null; const trig=[...document.querySelectorAll('button')].find(b=>vis(b)&&b.textContent.trim().startsWith('Employees')); if(trig&&trig.getAttribute('aria-expanded')!=='true'){trig.click();} return 'clicked'; })()`,
};
