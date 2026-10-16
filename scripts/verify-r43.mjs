#!/usr/bin/env node
// verify-r43.mjs — session-44 / parity round 43 live verification: the
// sidebar shadcn architecture + the desktop collapse, REF vs the
// remediated clone — the authored DOM family (content/group/label/menu
// + the shared menu-button base), the active custom-primary-bg recipe,
// the toggle interior + glyph swap, the rail geometry (both apps
// collapsed live), the hover renders (the v2 hover polyfill on the v4
// LOC build — recursive through @layer — + real mouse moves; REF is a
// v3 build, its hovers apply directly), the tokens (both themes), the
// label weights + icon sizes, and the short-viewport scroll contract.
//
// Set normalization: the clone's cn() (tailwind-merge) dedupes repeated
// utilities and resolves same-axis conflicts that REF's raw authored
// concatenation keeps (flex/items-center twice, gap-2 alongside gap-3)
// — the RENDERED result is identical (the stylesheet's numeric order
// makes gap-3 win on REF too), so both sides go through the same
// dedupe + gap-resolution filter before comparing.
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const results = [];
function rec(name, a, b) { results.push({ name, ref: a, loc: b, match: JSON.stringify(a) === JSON.stringify(b) }); }
const normToken = (s) => {
  // Both sides resolve to an "r,g,b" triple — Chrome's computed style
  // returns REF's raw hsl triples as-is but RESOLVES the clone's hsl()
  // token form to hex (the newer-engine computed-value behavior). The
  // rendered values are identical; the forms differ. This resolver
  // normalizes hex, hsl(...) and raw "h s% l%" to the same triple.
  const t = (s || "").trim();
  if (t.startsWith("#")) {
    const h = t.slice(1);
    const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16)).join(",");
  }
  const m = t.match(/(?:hsl\()?([\d.]+)[\s,]+([\d.]+)%?[\s,]+([\d.]+)%/);
  if (!m) return t;
  const [h, sa, l] = m.slice(1).map(Number);
  const a = sa / 100, lum = l / 100;
  const c = (1 - Math.abs(2 * lum - 1)) * a;
  const hp = (h % 360) / 60, x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hp < 1) { r = c; g = x; } else if (hp < 2) { r = x; g = c; }
  else if (hp < 3) { g = c; b = x; } else if (hp < 4) { g = x; b = c; }
  else if (hp < 5) { r = x; b = c; } else { r = c; b = x; }
  const m2 = lum - c / 2;
  return [r + m2, g + m2, b + m2].map((v) => Math.round(v * 255)).join(",");
};
// in-eval class-set normalization (dedupe + the gap-2/gap-3 resolution)
const NORM = `const norm = (s) => { const p = (s || '').split(' ').filter(Boolean); const g3 = p.includes('gap-3'); return [...new Set(p)].filter(c => !(g3 && c === 'gap-2')).sort().join(' '); };`;

// ---- setup: both sessions to /training (a standalone-active page), 1440x900
for (const [session, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/training`);
  await new Promise(r => setTimeout(r, 3200));
}

// 1. the peer's expanded attrs
const peerAttrs = `(() => { const p = document.querySelector('.group.peer'); if (!p) return {found:false}; return { found:true, state:p.getAttribute('data-state'), col:p.getAttribute('data-collapsible'), variant:p.getAttribute('data-variant'), side:p.getAttribute('data-side') }; })()`;
rec("peer expanded attrs", await evalOn("ref", peerAttrs), await evalOn("loc", peerAttrs));

// 2. the sidebar family class strings (verbatim — the authored contract)
const family = `(() => { const g = (n) => { const el = document.querySelector('[data-sidebar="' + n + '"]'); return el ? { tag: el.tagName.toLowerCase(), cls: el.getAttribute('class') } : null; }; return { content:g('content'), group:g('group'), label:g('group-label'), gc:g('group-content'), menu:g('menu') }; })()`;
rec("sidebar family strings", await evalOn("ref", family), await evalOn("loc", family));

// 3. the leaf + active leaf + toggle + interior (normalized content sets)
const leafSet = `(() => {
  ${NORM}
  const leaf = document.querySelector('[data-sidebar="menu"] > li > a[data-sidebar="menu-button"]');
  const active = document.querySelector('[data-sidebar="content"] a[style]');
  const toggle = document.querySelector('button[data-sidebar="menu-button"]');
  const interior = toggle ? toggle.children[0] : null;
  const row = interior ? interior.children[0] : null;
  const chev = interior ? interior.children[1] : null;
  return {
    leaf: leaf ? norm(leaf.getAttribute('class')) : null,
    leafAttrs: leaf ? (leaf.getAttribute('data-size') + '/' + leaf.getAttribute('data-active')) : null,
    active: active ? { cls: norm(active.getAttribute('class')), style: (active.getAttribute('style') || '').toLowerCase().replace(/[\\s;]/g, '') } : null,
    activeBg: active ? getComputedStyle(active).backgroundColor : null,
    activeWeight: active ? getComputedStyle(active.querySelector('span')).fontWeight : null,
    toggle: toggle ? norm(toggle.getAttribute('class')) : null,
    interior: interior ? interior.getAttribute('class') : null,
    row: row ? row.getAttribute('class') : null,
    chev: chev ? (chev.getAttribute('class') || '') : null,
    leafIcon: leaf ? getComputedStyle(leaf.querySelector('svg')).width : null,
    toggleIcon: toggle ? getComputedStyle(toggle.querySelector('svg')).width : null,
    leafSpanW: leaf ? getComputedStyle(leaf.querySelector('span')).fontWeight : null,
    toggleSpanW: toggle ? getComputedStyle(toggle.querySelector('span')).fontWeight : null,
  };
})()`;
rec("leaf/active/toggle authored sets", await evalOn("ref", leafSet), await evalOn("loc", leafSet));

// 4. the submenu (open the Employees group) + the counts
const openGroup = `(() => { const t = [...document.querySelectorAll('button[data-sidebar="menu-button"]')].find(b => (b.textContent||'').trim() === 'Employees'); if (t) t.click(); return 'clicked'; })()`;
await evalOn("ref", openGroup); await evalOn("loc", openGroup);
await new Promise(r => setTimeout(r, 700));
const submenu = `(() => {
  ${NORM}
  const scope = document.querySelector('[data-sidebar="sidebar"]');
  const cont = scope.querySelector('div.pl-4.space-y-1');
  const sub = cont ? cont.querySelector('a[data-sidebar="menu-button"]') : null;
  return {
    container: cont ? cont.getAttribute('class') : null,
    liCls: cont && cont.children[0] ? cont.children[0].getAttribute('class') : null,
    firstSub: sub ? norm(sub.getAttribute('class')) : null,
    firstSubSpan: sub ? sub.querySelector('span').getAttribute('class') : null,
    buttons: scope.querySelectorAll('[data-sidebar="menu-button"]').length,
    items: scope.querySelectorAll('[data-sidebar="menu-item"]').length,
  };
})()`;
rec("submenu structure + counts", await evalOn("ref", submenu), await evalOn("loc", submenu));

// 5. the rail collapse (programmatic trigger click, both apps)
const clickTrigger = `(() => { const b = document.querySelector('[data-sidebar="trigger"]'); if (!b) return 'no-trigger'; b.click(); return 'clicked'; })()`;
await evalOn("ref", clickTrigger); await evalOn("loc", clickTrigger);
await new Promise(r => setTimeout(r, 600));
const rail = `(() => {
  const peer = document.querySelector('.group.peer');
  const wrap = peer.children[1];
  const inner = peer.querySelector('[data-sidebar="sidebar"]');
  const leaf = peer.querySelector('a[data-sidebar="menu-button"]');
  const label = peer.querySelector('[data-sidebar="group-label"]');
  const h2 = peer.querySelector('h2');
  const content = peer.querySelector('[data-sidebar="content"]');
  const cs = (el) => getComputedStyle(el);
  return {
    state: peer.getAttribute('data-state'), col: peer.getAttribute('data-collapsible'),
    wrapW: Math.round(wrap.getBoundingClientRect().width),
    innerW: Math.round(inner.getBoundingClientRect().width),
    leafW: Math.round(leaf.getBoundingClientRect().width),
    leafH: Math.round(leaf.getBoundingClientRect().height),
    leafPad: cs(leaf).padding,
    labelOpacity: cs(label).opacity, labelMT: cs(label).marginTop,
    h2W: Math.round(h2.getBoundingClientRect().width),
    contentOverflow: cs(content).overflow,
  };
})()`;
rec("rail collapse geometry", await evalOn("ref", rail), await evalOn("loc", rail));

// expand back for the hover section
await evalOn("ref", clickTrigger); await evalOn("loc", clickTrigger);
await new Promise(r => setTimeout(r, 600));

// 6. the tokens (light + dark), normalized (the hsl()/triple form split)
const tokens = `(() => {
  const de = document.documentElement;
  const read = () => {
    const cs = getComputedStyle(de);
    return { accent: cs.getPropertyValue('--sidebar-accent'), accentFg: cs.getPropertyValue('--sidebar-accent-foreground') };
  };
  const light = read();
  de.classList.add('dark');
  const dark = read();
  de.classList.remove('dark');
  return { light, dark };
})()`;
const normTokens = (t) => t && !t.error ? { la: normToken(t.light.accent), lf: normToken(t.light.accentFg), da: normToken(t.dark.accent), df: normToken(t.dark.accentFg) } : t;
rec("sidebar tokens (normalized)", normTokens(await evalOn("ref", tokens)), normTokens(await evalOn("loc", tokens)));

// 7. the hover renders — polyfill the LOC v4 build (recursive unwrap
//    through @layer), then real mouse moves. REF (v3) applies directly.
const polyfill = `(() => {
  const unwrap = (group) => {
    const rules = group.cssRules;
    let n = 0;
    for (let i = rules.length - 1; i >= 0; i--) {
      const r = rules[i];
      if (r.media && /hover:\\s*hover/.test(r.media.mediaText)) {
        const inner = [];
        for (const c of r.cssRules) inner.push(c.cssText);
        group.deleteRule(i);
        for (let j = 0; j < inner.length; j++) group.insertRule(inner[j], i + j);
        n++;
      } else if (r.cssRules && r.cssRules.length && r.selectorText === undefined && r.style === undefined) {
        n += unwrap(r);
      }
    }
    return n;
  };
  let total = 0;
  for (const s of document.styleSheets) { try { total += unwrap(s); } catch (e) {} }
  return { replaced: total };
})()`;
console.log("(loc hover polyfill: " + JSON.stringify(await evalOn("loc", polyfill)) + " media blocks unwrapped)");

const hoverProbe = async (session, x, y) => {
  run(`agent-browser --session ${session} mouse move ${x} ${y}`);
  await new Promise(r => setTimeout(r, 400));
  return evalOn(session, `(() => { const el = document.elementFromPoint(${x}, ${y}); if (!el) return { over: 'none' }; const t = el.closest('a,button'); if (!t) return { over: el.tagName }; return { over: t.tagName + ':' + (t.textContent || '').trim().slice(0, 12), bg: getComputedStyle(t).backgroundColor }; })()`);
};
const centerOf = async (session, expr) => evalOn(session, expr);
const SEL = {
  leaf: `(() => { const el = document.querySelector('a[data-sidebar="menu-button"][href="/dashboard"]'); const r = el.getBoundingClientRect(); return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }; })()`,
  payroll: `(() => { const el = [...document.querySelectorAll('button[data-sidebar="menu-button"]')].find(b => (b.textContent||'').trim() === 'Payroll'); if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }; })()`,
};
for (const [label, selExpr] of [["hover inactive leaf (Dashboard — zinc-100)", SEL.leaf], ["hover closed toggle (Payroll — blue-50)", SEL.payroll]]) {
  const cr = await centerOf("ref", selExpr), cl = await centerOf("loc", selExpr);
  if (cr && cl && cr.x && cl.x && !cr.error && !cl.error) {
    rec(label, await hoverProbe("ref", cr.x, cr.y), await hoverProbe("loc", cl.x, cl.y));
  } else {
    rec(label, { center: cr }, { center: cl });
  }
}

// 8. the short-viewport scroll contract (1440x500: footer pinned, content scrolls)
for (const session of ["ref", "loc"]) run(`agent-browser --session ${session} set viewport 1440 500`);
await new Promise(r => setTimeout(r, 900));
const shortVp = `(() => {
  const peer = document.querySelector('.group.peer');
  const footer = peer.querySelector('[data-sidebar="footer"]');
  const content = peer.querySelector('[data-sidebar="content"]');
  return { footerBottom: Math.round(footer.getBoundingClientRect().bottom), vh: window.innerHeight, contentScrolls: content.scrollHeight > content.clientHeight };
})()`;
rec("short viewport scroll", await evalOn("ref", shortVp), await evalOn("loc", shortVp));

// report
let m = 0;
for (const r of results) {
  console.log(`${r.match ? "MATCH" : "DIFF "} ${r.name}`);
  if (!r.match) console.log(`  ref: ${JSON.stringify(r.ref).slice(0, 600)}\n  loc: ${JSON.stringify(r.loc).slice(0, 600)}`);
  if (r.match) m++;
}
console.log(`\n${m}/${results.length} verify-r43 MATCH`);
