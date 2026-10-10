// probe-dashboard.mjs — dashboard shell geometry + tokens (session-4 re-pins)
const probe = {
  wait: 3000,
  js: `(() => { const px=(el,prop)=>el?getComputedStyle(el)[prop]:null; const aside=document.querySelector('aside'); const main=document.querySelector('main'); const h1=[...document.querySelectorAll('h1')].find(e=>e.offsetParent); const grid=main?.querySelector('.grid'); const cards=main?[...main.querySelectorAll('[class*="rounded-xl"]')].filter(e=>e.querySelector('h3')):[]; return { asideBg:px(aside,'backgroundColor'), asideW:Math.round(aside?.getBoundingClientRect().width??-1), mainBg:px(main,'backgroundColor'), h1Text:h1?.textContent?.trim(), h1Font:px(h1,'fontSize')+'/'+px(h1,'fontWeight'), h1Y:Math.round(h1?.getBoundingClientRect().y??-1), gridY:Math.round(grid?.getBoundingClientRect().y??-1), gridGap:px(grid,'gap')||px(grid,'rowGap'), cardBorder:cards.length?px(cards[0],'borderColor'):null }; })()`,
};

export default probe;
