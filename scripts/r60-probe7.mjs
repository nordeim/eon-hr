#!/usr/bin/env node
// r60-probe7.mjs — REF's settings Company edit form, precisely: press Edit,
// read the full form recipe (fields, labels, inputs, buttons, layout), test
// the Save round-trip (does REF's save persist?).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

async function auth(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/login`);
  await new Promise(r => setTimeout(r, 2200));
  run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  await new Promise(r => setTimeout(r, 350));
  run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
  await new Promise(r => setTimeout(r, 350));
  run(`agent-browser --session ${session} click 'button[type=submit]'`);
  await new Promise(r => setTimeout(r, 5000));
}
await auth("ref", "https://eon.base44.app");
await evalOn("ref", `localStorage.setItem('darkMode','false')`);

run('agent-browser --session ref open "https://eon.base44.app/settings"');
await new Promise(r => setTimeout(r, 5000));
await evalOn("ref", `(() => { const b = [...document.querySelectorAll('main button')].find(x => (x.textContent||'').trim() === 'Edit'); if (b) { b.click(); return 'clicked'; } return 'missing'; })()`);
await new Promise(r => setTimeout(r, 2500));

const FORM = `(() => {
  const main = document.querySelector('main');
  const card = [...main.querySelectorAll('div')].find(d => (d.textContent||'').includes('Save Changes') && d.getBoundingClientRect().width > 300 && d.getBoundingClientRect().width < 1200);
  if (!card) return { found: false };
  const r = card.getBoundingClientRect();
  const labels = [...card.querySelectorAll('label')].map(l => (l.textContent||'').trim());
  const inputs = [...card.querySelectorAll('input, select, textarea')].map(i => { const ir = i.getBoundingClientRect(); return { tag: i.tagName.toLowerCase(), id: i.id, ph: i.getAttribute('placeholder'), val: (i.value||'').slice(0,20), w: Math.round(ir.width), h: Math.round(ir.height) }; });
  const btns = [...card.querySelectorAll('button')].map(b => { const cs = getComputedStyle(b); const br = b.getBoundingClientRect(); return { t: (b.textContent||'').trim().slice(0,20), bg: cs.backgroundColor, c: cs.color, w: Math.round(br.width), h: Math.round(br.height), clsTail: b.className.slice(-100) }; });
  const grid = [...card.querySelectorAll('div')].filter(d => { const cs = getComputedStyle(d); return cs.display === 'grid' && d.querySelectorAll('input').length > 2; }).map(d => { const cs = getComputedStyle(d); return { cols: cs.gridTemplateColumns.slice(0, 60), gap: cs.gap }; });
  return { found: true, w: Math.round(r.width), labels, inputs, btns, grid, text: (card.textContent||'').replace(/\\s+/g,' ').trim().slice(0, 250) };
})()`;
console.log("===== REF Company edit form (post-press) =====");
console.log(JSON.stringify(await evalOn("ref", FORM, 500), null, 1));

// the Save round-trip: change the company name, save, reload, check
await evalOn("ref", `(() => { const i = document.querySelector('main input'); if (!i) return 'no input'; const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(i, 'Demo'); i.dispatchEvent(new Event('input', { bubbles: true })); return 'set'; })()`);
await evalOn("ref", `(() => { const b = [...document.querySelectorAll('main button')].find(x => (x.textContent||'').trim() === 'Save Changes'); if (b) { b.click(); return 'saved'; } return 'missing'; })()`);
await new Promise(r => setTimeout(r, 3000));
const POST = `(() => ({ text: (document.querySelector('main').textContent||'').replace(/\\s+/g,' ').trim().slice(0, 250), toast: [...document.querySelectorAll('[data-sonner-toast], [role=status]')].map(t => (t.textContent||'').trim().slice(0,80)), editStillOpen: (document.querySelector('main').textContent||'').includes('Save Changes') }))()`;
console.log("\n===== REF post-Save state =====");
console.log(JSON.stringify(await evalOn("ref", POST)));
run('agent-browser --session ref open "https://eon.base44.app/settings"');
await new Promise(r => setTimeout(r, 5000));
const RELOAD = `(() => ({ tiles: (document.querySelector('main').textContent||'').includes('Company Information'), text: (document.querySelector('main').textContent||'').replace(/\\s+/g,' ').trim().slice(0, 250) }))()`;
console.log("REF post-reload:", JSON.stringify(await evalOn("ref", RELOAD, 2000)));
process.exit(0);
