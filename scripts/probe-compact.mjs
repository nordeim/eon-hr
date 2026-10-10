// probe-compact.mjs — compact page fingerprint: h1, sub, counts, key card metrics
const probe = {
  wait: 2800,
  js: `(() => { const vis=(e)=>e&&e.offsetParent!==null; const h1=[...document.querySelectorAll('h1')].find(vis); const sub=h1?[...h1.parentElement.querySelectorAll('p')].map(p=>p.textContent.trim()).filter(Boolean)[0]:null; const cards=[...document.querySelectorAll('main div, body div')].filter(d=>vis(d)&&d.querySelector('h3')&&getComputedStyle(d).border!=='').slice(0,3); const cs=cards[0]?getComputedStyle(cards[0]):null; const h3s=[...document.querySelectorAll('h3')].filter(vis).slice(0,8).map(h=>h.textContent.trim().slice(0,24)); const btns=[...document.querySelectorAll('button')].filter(vis).filter(b=>b.closest('main')||b.textContent.match(/Add|Create|New|Request|Export|Import/i)).slice(0,6).map(b=>b.textContent.trim().slice(0,18)).filter(t=>t); const empty=[...document.querySelectorAll('p,div')].filter(e=>vis(e)&&/no |not |empty|yet|found/i.test(e.textContent)&&e.textContent.length<80&&e.children.length===0).slice(0,3).map(e=>e.textContent.trim().slice(0,60)); return {h1:h1?.textContent?.trim().slice(0,28),sub:sub?.slice(0,36),h3:h3s,btns,empty:empty.slice(0,2),cardPad:cs?cs.padding:null,cardR:cs?cs.borderRadius:null}; })()`,
};

export default probe;
