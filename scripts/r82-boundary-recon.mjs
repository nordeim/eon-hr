#!/usr/bin/env node
// r82-boundary-recon.mjs — session 82 / parity round 81: the fresh-eyes
// instrument RECON — THE BREAKPOINT-BOUNDARY MATRIX (the sm + xl edges).
// The program's responsive parity proof now covers 1440x900 (the standing
// byte chain, seventeen rounds), 390x844 (the r80 mobile matrix + the
// 651-663/683-695 baselines), 768x1024 + the 767 edge (the r81 tablet
// matrix + the 697-709 baselines), and the 1024-1279 lg band (the r81
// grid census). The remaining UNMEASURED breakpoint boundaries are the
// sm edge (640 + the 639 off-by-one) and the xl edge (1280 + the 1279
// off-by-one) — the last two TW-v4 breakpoint surfaces, the exact class
// where an xl:-vs-lg: member bug bites (the R81-A lesson: the attendance
// grid defect lived precisely at a breakpoint boundary invisible to the
// standing 390/1440 audits).
// This recon walks /dashboard on BOTH sides at 640x1024 + 639 (the sm
// boundary) and 1280x1024 + 1279 (the xl boundary), LIGHT, authed
// sessions, reading the shell+geometry signals.
import { execSync } from "node:child_process";
function run(cmd, t = 60000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const b64 = Buffer.from(expr, "utf8").toString("base64"); const out = run(`agent-browser --session ${session} eval -b ${b64}`); const t = out.trim(); try { return JSON.parse(t); } catch { try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } } }

const BASES = { ref: "https://eon.base44.app", loc: "http://127.0.0.1:3200" };

// The boundary signals: shell chrome (mobile header vs desktop sidebar),
// main geometry, overflow — the TW-v4 off-by-one detector.
const SIGNALS = `(() => {
  const badge = document.querySelector('#base44-edit-badge, [class*=base44-edit], [id*=base44]');
  const aside = document.querySelector('aside');
  const sidebarRect = aside ? aside.getBoundingClientRect() : null;
  const header = document.querySelector('header');
  const headerInfo = header ? { cls: (header.className || '').replace(/\\s+/g, ' ').trim(), h: Math.round(header.getBoundingClientRect().height), visible: header.getBoundingClientRect().width > 0 } : null;
  const main = document.querySelector('main');
  const mainRect = main ? { x: Math.round(main.getBoundingClientRect().x), y: Math.round(main.getBoundingClientRect().y), w: Math.round(main.getBoundingClientRect().width) } : null;
  const bottomBar = [...document.querySelectorAll('nav, div')].find(el => {
    const r = el.getBoundingClientRect();
    return r.width > 200 && r.height > 30 && r.height < 100 && Math.abs(r.y + r.height - window.innerHeight) < 4 && /fixed|sticky/.test(getComputedStyle(el).position);
  });
  const tabs = bottomBar ? { w: Math.round(bottomBar.getBoundingClientRect().width), h: Math.round(bottomBar.getBoundingClientRect().height) } : null;
  return {
    innerW: window.innerWidth, innerH: window.innerHeight,
    scrollW: document.documentElement.scrollWidth,
    hOverflow: document.documentElement.scrollWidth > window.innerWidth,
    badge: badge ? Math.round(badge.getBoundingClientRect().width) + 'x' + Math.round(badge.getBoundingClientRect().height) : null,
    sidebar: sidebarRect ? { x: Math.round(sidebarRect.x), w: Math.round(sidebarRect.width), visible: sidebarRect.width > 0 } : null,
    headerInfo, mainRect, tabs
  };
})()`;

async function readAt(side, w, h, route) {
  run(`agent-browser --session ${side} set viewport ${w} ${h}`);
  run(`agent-browser --session ${side} open ${BASES[side]}${route}`);
  await new Promise(r => setTimeout(r, 800));
  run(`agent-browser --session ${side} set viewport ${w} ${h}`);
  await new Promise(r => setTimeout(r, 2600));
  return await evalOn(side, SIGNALS);
}

for (const w of [640, 1280]) {
  for (const s of ["ref", "loc"]) {
    run(`agent-browser --session ${s} eval "localStorage.setItem('darkMode','false')"`);
    const read = await readAt(s, w, 1024, "/dashboard");
    console.log(`${s.toUpperCase()} @${w}x1024 /dashboard:`, JSON.stringify(read));
  }
}

// the off-by-one edges: 639 (mobile chrome must still be live — sm members
// only at 640+) and 1279 (lg members must still be live — xl: only at 1280+)
for (const [w, label] of [[639, "639-sm-edge"], [1279, "1279-lg-edge"]]) {
  for (const s of ["ref", "loc"]) {
    run(`agent-browser --session ${s} set viewport ${w} 1024`);
    await new Promise(r => setTimeout(r, 1200));
    const edge = await evalOn(s, `(() => ({
      innerW: window.innerWidth,
      sidebarVisible: !!(document.querySelector('aside') && document.querySelector('aside').getBoundingClientRect().width > 0),
      tabsVisible: (() => { const n = [...document.querySelectorAll('nav')].find(el => { const r = el.getBoundingClientRect(); return r.width > 200 && Math.abs(r.y + r.height - window.innerHeight) < 4; }); return !!n; })(),
      scrollW: document.documentElement.scrollWidth
    }))()`);
    console.log(`${s.toUpperCase()} @${w} ${label}:`, JSON.stringify(edge));
  }
}
process.exit(0);
