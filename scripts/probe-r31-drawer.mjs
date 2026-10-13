#!/usr/bin/env node
// probe-r31-drawer.mjs — session-31 / parity round 30 census:
// the mobile drawer's EXPANDED-state internals at 390x844. The standing
// mobile chrome audit pins the closed chrome (tabs/kicker/overlay) only —
// the drawer's group pitch, leaf x/y, and expand behavior inside the open
// drawer have never been deeply measured. Viewport 390x844 both sides.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";

// drawer-internal nav map: buttons/links inside the drawer panel
const DRAWERMAP = `(() => {
  const overlay = [...document.querySelectorAll('div')].find(d => {
    const cs = getComputedStyle(d);
    return cs.backgroundColor === 'rgba(0, 0, 0, 0.8)' && d.getBoundingClientRect().width === 390 && parseFloat(cs.zIndex) === 50;
  });
  if (!overlay) return JSON.stringify({found:false});
  const panel = overlay.firstElementChild || overlay;
  const pr = panel.getBoundingClientRect(); const pcs = getComputedStyle(panel);
  const out = [];
  for (const el of [...panel.querySelectorAll('button, a')]) {
    const r = el.getBoundingClientRect();
    if (r.width === 0) continue;
    out.push({ t: (el.textContent||'').trim().slice(0,22) || el.getAttribute('aria-label') || '[icon]', tag: el.tagName, y: Math.round(r.y), h: Math.round(r.height), x: Math.round(r.x), w: Math.round(r.width) });
  }
  return JSON.stringify({found:true, panel:{w:Math.round(pr.width),h:Math.round(pr.height),bg:pcs.backgroundColor}, items:out});
})()`;

async function openDrawer(s, base) {
  run(`agent-browser --session ${s} set viewport 390 844`);
  run(`agent-browser --session ${s} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 3500));
  // click the hamburger
  await evalOn(s, `(() => {
    const btns = [...document.querySelectorAll('button')];
    const b = btns.find(e => { const r = e.getBoundingClientRect(); return r.y < 100 && r.x < 60 && r.width > 20 && r.width < 60 && (e.querySelector('svg') || (e.textContent||'').trim() === ''); });
    if (b) b.click();
    return 'clicked';
  })()`, 1500);
}

console.log("=== CLOSED-DISABLED drawer internals (default groups collapsed) ===");
for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  await openDrawer(s, base);
  const d = await evalOn(s, DRAWERMAP);
  console.log(`${s.toUpperCase()}:`);
  console.log(JSON.stringify(d).replace(/\},\{/g, '}\n{'));
}

console.log("\n=== Drawer AFTER expanding the Analytics group inside it ===");
for (const s of ["ref", "loc"]) {
  await evalOn(s, `(() => {
    const overlay = [...document.querySelectorAll('div')].find(d => {
      const cs = getComputedStyle(d);
      return cs.backgroundColor === 'rgba(0, 0, 0, 0.8)' && d.getBoundingClientRect().width === 390 && parseFloat(cs.zIndex) === 50;
    });
    if (!overlay) return 'no-overlay';
    const btns = [...overlay.querySelectorAll('button')];
    const b = btns.find(e => (e.textContent||'').trim().startsWith('Analytics') && e.getAttribute('aria-expanded') === 'false');
    if (b) { b.click(); return 'expanded'; }
    return 'no-btn';
  })()`, 1200);
  const d = await evalOn(s, DRAWERMAP);
  console.log(`${s.toUpperCase()}:`);
  console.log(JSON.stringify(d).replace(/\},\{/g, '}\n{'));
}
