#!/usr/bin/env node
// r81-tablet-recon.mjs — session 81 / parity round 80: the fresh-eyes
// instrument RECON — THE TABLET (md-BOUNDARY) VIEWPORT MATRIX. The program's
// responsive parity proof covers 1440x900 (the standing byte chain, sixteen
// rounds) and 390x844 (the r80 mobile viewport matrix + the 651-663 mobile
// baselines); the session-7 R6-A sweep verified the NAV SHELL boundary at
// 700/767/768/800/900/1024 — but the CONTENT ROUTES' rendering at the md
// boundary (768x1024 — the exact width where the desktop shell mounts, the
// bottom tabs unmount, and the page-header's hidden md:flex members appear)
// was NEVER audited member-wise. The tablet middle is the last unmeasured
// responsive band, and the md: boundary is a classic TW-v4 off-by-one bug
// surface. This recon walks /dashboard on BOTH sides at 768x1024 (LIGHT,
// authed sessions) reading the shell+geometry signals to establish what
// the tablet surface looks like before the full 12-route matrix.
import { execSync } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const b64 = Buffer.from(expr, "utf8").toString("base64"); const out = run(`agent-browser --session ${session} eval -b ${b64}`); const t = out.trim(); try { return JSON.parse(t); } catch { try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } } }

const BASES = { ref: "https://eon.base44.app", loc: "http://127.0.0.1:3200" };

// The tablet signals: shell + the md-boundary mounts (bottom tabs gone,
// sidebar up, the page-header's desktop members mounted) + overflow.
const SIGNALS = `(() => {
  const badge = document.querySelector('#base44-edit-badge, [class*=base44-edit], [id*=base44]');
  const aside = document.querySelector('aside');
  const sidebarRect = aside ? aside.getBoundingClientRect() : null;
  const header = document.querySelector('header');
  const headerInfo = header ? { cls: (header.className || '').replace(/\\s+/g, ' ').trim(), h: Math.round(header.getBoundingClientRect().height), visible: header.getBoundingClientRect().width > 0 } : null;
  const main = document.querySelector('main');
  const mainRect = main ? { x: Math.round(main.getBoundingClientRect().x), y: Math.round(main.getBoundingClientRect().y), w: Math.round(main.getBoundingClientRect().width) } : null;
  // the bottom tab bar (mobile chrome — must be GONE at md+)
  const bottomBar = [...document.querySelectorAll('nav, div')].find(el => {
    const r = el.getBoundingClientRect();
    return r.width > 200 && r.height > 30 && r.height < 100 && Math.abs(r.y + r.height - window.innerHeight) < 4 && /fixed|sticky/.test(getComputedStyle(el).position);
  });
  const tabs = bottomBar ? { cls: (bottomBar.className || '').replace(/\\s+/g, ' ').trim().slice(0, 80), w: Math.round(bottomBar.getBoundingClientRect().width), h: Math.round(bottomBar.getBoundingClientRect().height) } : null;
  // the page-header's desktop-only members (hidden md:flex — mounted at 768)
  const h1 = document.querySelector('h1');
  const quickActions = [...document.querySelectorAll('button, a')].filter(el => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && /quick|action/i.test(el.textContent || '');
  }).length;
  return {
    innerW: window.innerWidth, innerH: window.innerHeight,
    scrollW: document.documentElement.scrollWidth,
    hOverflow: document.documentElement.scrollWidth > window.innerWidth,
    badge: badge ? Math.round(badge.getBoundingClientRect().width) + 'x' + Math.round(badge.getBoundingClientRect().height) : null,
    sidebar: sidebarRect ? { x: Math.round(sidebarRect.x), w: Math.round(sidebarRect.width), visible: sidebarRect.width > 0 } : null,
    headerInfo, mainRect, tabs,
    h1: h1 ? { t: (h1.textContent || '').trim().slice(0, 40), fs: getComputedStyle(h1).fontSize } : null,
    quickActions
  };
})()`;

for (const s of ["ref", "loc"]) {
  run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false')"`);
  run(`agent-browser --session ${s} set viewport 768 1024`);
  run(`agent-browser --session ${s} open ${BASES[s]}/dashboard`);
  await new Promise(r => setTimeout(r, 800));
  run(`agent-browser --session ${s} set viewport 768 1024`);
  await new Promise(r => setTimeout(r, 2800));
  const read = await evalOn(s, SIGNALS);
  console.log(`${s.toUpperCase()} @768x1024 /dashboard:`, JSON.stringify(read, null, 1));
}

// the 767 off-by-one edge — the mobile chrome must still be live one px below md
for (const s of ["ref", "loc"]) {
  run(`agent-browser --session ${s} set viewport 767 1024`);
  await new Promise(r => setTimeout(r, 1200));
  const edge = await evalOn(s, `(() => ({
    innerW: window.innerWidth,
    sidebarVisible: !!(document.querySelector('aside') && document.querySelector('aside').getBoundingClientRect().width > 0),
    tabsVisible: (() => { const n = [...document.querySelectorAll('nav')].find(el => { const r = el.getBoundingClientRect(); return r.width > 200 && Math.abs(r.y + r.height - window.innerHeight) < 4; }); return !!n; })()
  }))()`);
  console.log(`${s.toUpperCase()} @767 EDGE:`, JSON.stringify(edge));
}
process.exit(0);
