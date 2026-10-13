#!/usr/bin/env node
// verify-r32.mjs — session-33 / parity round 32 LIVE VERIFICATION:
// (1) the DARK sweep — localStorage-driven on BOTH apps (the moon-click
//     race desyncs sessions; set darkMode directly + reload),
// (2) the RTL spot-check,
// (3) the LIGHT regression sweeps (redeploy 12 + mobile chrome + navmap).
import { execSync } from "node:child_process";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 200) }; } }

const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
let fails = 0;
const check = (label, ref, loc) => {
  const same = JSON.stringify(ref) === JSON.stringify(loc);
  if (!same) fails++;
  console.log(`${same ? "MATCH" : "**DIFF**"} ${label}: ref=${JSON.stringify(ref)} loc=${JSON.stringify(loc)}`);
};

// deterministic state switch: localStorage + reload (NEVER moon-clicks)
async function setMode(session, base, { dark = false, rtl = false } = {}) {
  const script = `(() => { ${dark ? 'localStorage.setItem("darkMode","true");' : 'localStorage.removeItem("darkMode");'} ${rtl ? 'localStorage.setItem("app_lang","ar");' : 'localStorage.removeItem("app_lang");'} location.reload(); return "ok"; })()`;
  run(`agent-browser --session ${session} eval ${JSON.stringify(script)}`);
  await new Promise(r => setTimeout(r, 2800));
}

// ---- 1) the DARK sweep (desktop 1440x900) ----
const DARK_DESKTOP = `(() => {
  const out = { htmlClass: document.documentElement.className };
  const body = getComputedStyle(document.body);
  out.body = [body.backgroundColor, body.color];
  const card = [...document.querySelectorAll('main div')].find(d => { const cs = getComputedStyle(d); return cs.borderRadius === '12px' && cs.borderWidth === '1px' && d.getBoundingClientRect().width > 300; });
  if (card) { const cs = getComputedStyle(card); out.card = [cs.backgroundColor, cs.borderColor]; }
  const aside = document.querySelector('aside') || [...document.querySelectorAll('div')].find(d => { const cs = getComputedStyle(d); return (cs.position === 'fixed' || cs.position === 'sticky') && Math.round(d.getBoundingClientRect().width) === 256 && d.getBoundingClientRect().height > 700; });
  if (aside) { const cs = getComputedStyle(aside); out.sidebar = [cs.backgroundColor, cs.borderRightColor]; }
  const root = document.querySelector('div.min-h-screen') || document.body.parentElement;
  out.canvas = root ? getComputedStyle(root).backgroundImage.slice(0, 80) : null;
  const cta = [...document.querySelectorAll('main button, main a')].find(b => { const bi = getComputedStyle(b).backgroundImage; return bi && bi !== 'none' && bi.includes('gradient') && b.getBoundingClientRect().width > 60; });
  if (cta) { const cs = getComputedStyle(cta); out.cta = [cs.backgroundImage.slice(0, 70), cs.color]; }
  return out;
})()`;
const DARK_SETTINGS = `(() => {
  const out = {};
  const list = document.querySelector('[role=tablist]');
  if (list) { const cs = getComputedStyle(list); out.tabList = [cs.backgroundColor, cs.borderColor];
    const trig = [...list.querySelectorAll('[role=tab]')];
    out.inactive = trig.length > 1 ? getComputedStyle(trig[1]).color : null;
    out.active = trig.length ? [getComputedStyle(trig[0]).backgroundColor, getComputedStyle(trig[0]).color] : null;
  }
  const inp = document.querySelector('main input');
  if (inp) { const cs = getComputedStyle(inp); out.input = [cs.backgroundColor, cs.borderColor]; }
  return out;
})()`;
const DARK_MOBILE = `(() => {
  const out = {};
  const header = document.querySelector('header');
  if (header) { const cs = getComputedStyle(header); out.header = [cs.backgroundColor, cs.borderBottomColor]; }
  const nav = [...document.querySelectorAll('nav')].find(n => n.getBoundingClientRect().y > 700);
  if (nav) { const cs = getComputedStyle(nav); out.bottomNav = [cs.backgroundColor, cs.borderTopColor];
    const a = nav.querySelector('a');
    out.activeTab = a ? [getComputedStyle(a).color, getComputedStyle(a).backgroundColor] : null;
    const i = [...nav.querySelectorAll('a')][1];
    out.inactiveTab = i ? getComputedStyle(i).color : null;
  }
  return out;
})()`;
const DRAWER_DARK = `(() => {
  const cands = [...document.querySelectorAll('div')].filter(d => { const cs = getComputedStyle(d); const r = d.getBoundingClientRect(); return cs.position === 'fixed' && r.width >= 200 && r.width <= 340 && Math.round(r.height) >= 700 && cs.backgroundColor !== 'rgba(0, 0, 0, 0.8)' && d.querySelectorAll('button, a').length > 3; });
  if (!cands.length) return { found: false };
  const cs = getComputedStyle(cands[0]);
  return { drawer: [cs.backgroundColor, cs.borderRightColor], w: Math.round(cands[0].getBoundingClientRect().width) };
})()`;

console.log("=== 1) DARK sweep (1440x900, localStorage-driven) ===");
for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  await setMode(s, base, { dark: true });
}
for (const [route, probe] of [["/dashboard", DARK_DESKTOP], ["/employees", DARK_DESKTOP], ["/settings", DARK_SETTINGS]]) {
  for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
    run(`agent-browser --session ${s} open "${base}${route}"`);
    await new Promise(r => setTimeout(r, 2600));
  }
  check(`dark ${route}`, await evalOn("ref", probe), await evalOn("loc", probe));
}

console.log("\n=== 1b) DARK mobile chrome (390x844) ===");
for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${s} set viewport 390 844`);
  run(`agent-browser --session ${s} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 2800));
}
check("dark mobile chrome", await evalOn("ref", DARK_MOBILE), await evalOn("loc", DARK_MOBILE));
for (const s of ["ref", "loc"]) {
  await evalOn(s, `(() => { const b = [...document.querySelectorAll('button')].find(b => b.getBoundingClientRect().y < 100 && b.getBoundingClientRect().x < 60 && b.querySelector('svg')); if (b) b.click(); return 'ok'; })()`, 900);
}
check("dark drawer", await evalOn("ref", DRAWER_DARK), await evalOn("loc", DRAWER_DARK));
for (const s of ["ref", "loc"]) { run(`agent-browser --session ${s} press Escape`); }

// ---- 2) the RTL spot-check (desktop, dark OFF) ----
console.log("\n=== 2) RTL spot-check (1440x900, app_lang=ar) ===");
for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  await setMode(s, base, { rtl: true });
  run(`agent-browser --session ${s} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 2600));
}
const RTL = `(() => {
  const aside = document.querySelector('aside') || [...document.querySelectorAll('div')].filter(d => { const r = d.getBoundingClientRect(); return Math.round(r.width) === 256 && r.height > 700; }).pop();
  const h1 = [...document.querySelectorAll('main h1')].find(h => h.getBoundingClientRect().width > 0);
  return { dir: document.documentElement.getAttribute('dir'), sidebarX: aside ? Math.round(aside.getBoundingClientRect().x) : null, h1x: h1 ? Math.round(h1.getBoundingClientRect().x) : null, h1t: h1 ? h1.textContent.trim().slice(0, 16) : null };
})()`;
check("rtl layout", await evalOn("ref", RTL), await evalOn("loc", RTL));

// ---- 3) LIGHT regressions ----
console.log("\n=== 3) LIGHT regressions (reset both apps) ===");
for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  await setMode(s, base, {});
}
const ROUTES = ["/dashboard","/employees","/payroll","/taskmanager","/settings","/hrreports","/analytics","/notificationpreferences","/staffrequests","/leavemanagement","/expenses","/profile"];
const H1 = `(() => {
  const h1 = [...document.querySelectorAll('h1')].find(e => e.getBoundingClientRect().width > 0);
  if (!h1) return null;
  const r = h1.getBoundingClientRect(); const cs = getComputedStyle(h1);
  return { t: h1.textContent.trim().slice(0, 26), fs: cs.fontSize, x: Math.round(r.x), y: Math.round(r.y) };
})()`;
for (const route of ROUTES) {
  run(`agent-browser --session ref open "${baseRef}${route}"`);
  run(`agent-browser --session loc open "${baseLoc}${route}"`);
  await new Promise(r => setTimeout(r, 2600));
  check(route, await evalOn("ref", H1), await evalOn("loc", H1));
}

// mobile chrome (light)
const TABS = `(() => {
  const nav = [...document.querySelectorAll('nav')].find(n => n.getBoundingClientRect().y > 700);
  if (!nav) return { found: false };
  const r = nav.getBoundingClientRect(); const cs = getComputedStyle(nav);
  const tabs = [...nav.querySelectorAll('a')].map(a => { const ar = a.getBoundingClientRect(); return { x: Math.round(ar.x), t: (a.textContent || '').trim().slice(0, 10), color: getComputedStyle(a).color }; });
  return { bg: cs.backgroundColor, tabs };
})()`;
const KICKER = `(() => {
  const k = [...document.querySelectorAll('h1')].find(h => h.getBoundingClientRect().y > 60 && h.getBoundingClientRect().y < 200);
  if (!k) return { found: false };
  const r = k.getBoundingClientRect(); const cs = getComputedStyle(k);
  return { t: k.textContent.trim().slice(0, 20), y: Math.round(r.y), fs: cs.fontSize };
})()`;
console.log("\n--- mobile chrome (light, 390x844) ---");
for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${s} set viewport 390 844`);
  run(`agent-browser --session ${s} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 3000));
}
check("bottom tabs (light)", await evalOn("ref", TABS), await evalOn("loc", TABS));
check("kicker (light)", await evalOn("ref", KICKER), await evalOn("loc", KICKER));

// sidebar navmap (light, desktop — div-based REF: use the w-256 column)
console.log("\n--- sidebar navmap (light, 1440x900) ---");
for (const [s, base] of [["ref", baseRef], ["loc", baseLoc]]) {
  run(`agent-browser --session ${s} set viewport 1440 900`);
  run(`agent-browser --session ${s} open "${base}/dashboard"`);
  await new Promise(r => setTimeout(r, 3000));
}
const NAVMAP = `(() => {
  const col = document.querySelector('aside') || [...document.querySelectorAll('div')].filter(d => { const r = d.getBoundingClientRect(); return Math.round(r.width) === 256 && r.height > 700; }).pop();
  if (!col) return null;
  const as = [...col.querySelectorAll('a, button')].filter(e => e.getBoundingClientRect().width > 0);
  return as.map(e => { const r = e.getBoundingClientRect(); return { t: (e.textContent || '').trim().slice(0, 18), y: Math.round(r.y) }; }).filter(e => e.t);
})()`;
check("sidebar navmap (light)", await evalOn("ref", NAVMAP), await evalOn("loc", NAVMAP));

console.log(`\n${fails === 0 ? "ALL LIVE VERIFICATIONS GREEN" : fails + " DIFF(S) FOUND"}`);
