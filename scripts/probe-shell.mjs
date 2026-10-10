// probe-shell.mjs — app shell: sidebar surface, logo tile, nav structure
const probe = {
  wait: 3000,
  js: `(() => { const px=(el,prop)=>el?getComputedStyle(el)[prop]:null; const r=(el)=>el?JSON.parse(JSON.stringify(el.getBoundingClientRect())):null; const candidates=[...document.querySelectorAll('body *')].filter(e=>{const b=e.getBoundingClientRect(); return b.width>230&&b.width<300&&b.height>600&&b.x<10;}); const sb=candidates[0]; const logoLike=sb?[...sb.querySelectorAll('*')].filter(e=>{const b=e.getBoundingClientRect(); return b.width>=38&&b.width<=44&&b.height>=38&&b.height<=44&&getComputedStyle(e).backgroundImage!=='none';})[0]:null; const nav=sb?sb.querySelector('nav'):null; const navItems=nav?[...nav.querySelectorAll('a')].map(a=>a.textContent.trim()).filter(t=>t):[]; const bg=sb?px(sb,'backgroundColor'):null; const lg=logoLike?{box:r(logoLike),radius:px(logoLike,'borderRadius'),grad:getComputedStyle(logoLike).backgroundImage,shadow:px(logoLike,'boxShadow')}:null; return {sbFound:!!sb, sbW:sb?Math.round(sb.getBoundingClientRect().width):-1, sbBg:bg, logo:lg, navCount:navItems.length, navFirst:navItems.slice(0,5)}; })()`,
};

export default probe;
