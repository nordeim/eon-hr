#!/usr/bin/env node
// verify-r10.mjs — live dual-browser verification of every R10 fixed surface
// Usage: node scripts/verify-r10.mjs
import { execSync } from "node:child_process";

const B = { ref: "https://eon.base44.app", loc: "http://localhost:3200" };

const probes = {
  // R10-E: items-start pages — the button must ride the badge row
  actionsStart: `(function(){ const wrap = document.querySelector("main").querySelector(".max-w-7xl, .max-w-5xl") || document.querySelector("main > div > div"); const kids = [...wrap.children].filter(c => !/md:hidden/.test(c.getAttribute("class") || "")); const row = kids[0]; const btn = row.querySelector("button"); return btn ? Math.round(btn.getBoundingClientRect().y) : null; })()`,
  // R10-A/B: attendance Devices color + select width
  attendance: `(function(){ const dev = [...document.querySelectorAll("main button")].find(b => /Devices/.test(b.textContent || "")); const sel = document.getElementById("attendance-report-type"); return JSON.stringify({ devColor: dev ? getComputedStyle(dev).color : null, selW: sel ? Math.round(sel.getBoundingClientRect().width) : null }); })()`,
  // R10-C: composer geometry
  composer: `(function(){ const ta = document.querySelector("textarea"); if (!ta) return "none"; let card = ta; while (card.parentElement && getComputedStyle(card).borderRadius !== "12px") card = card.parentElement; const avatar = card.querySelector(".rounded-full"); const photo = [...card.querySelectorAll("button")].find(b => /Photo/.test(b.textContent || "")); const post = [...card.querySelectorAll("button")].find(b => /^Post$/.test(b.textContent || "")); const cs = card.getBoundingClientRect(); return JSON.stringify({ cardH: Math.round(cs.height), avatarBg: getComputedStyle(avatar).backgroundImage.slice(0, 46), avatarFs: getComputedStyle(avatar).fontSize, photoW: photo ? Math.round(photo.getBoundingClientRect().width) : null, postW: post ? Math.round(post.getBoundingClientRect().width) : null }); })()`,
  // R10-J: shiftcalendar toolbar + stats
  shiftcalendar: `(function(){ const tb = [...document.querySelectorAll("main div")].find(d => /flex-wrap items-center gap-4/.test(d.getAttribute("class") || "")); const stats = [...document.querySelectorAll("main .grid > div")].filter(d => d.getBoundingClientRect().height > 60 && d.getBoundingClientRect().height < 100); const cal = document.querySelector("main table"); const summary = [...document.querySelectorAll("main div")].filter(d => /Employee Schedule Summary/.test(d.textContent || "") && d.getBoundingClientRect().height > 0); return JSON.stringify({ tbY: tb ? Math.round(tb.getBoundingClientRect().y) : null, statHs: stats.map(s => Math.round(s.getBoundingClientRect().height)), statBorders: stats.map(s => getComputedStyle(s).borderTopWidth), usesTable: !!cal, summaryY: summary.length ? Math.round(summary[0].getBoundingClientRect().y) : null }); })()`,
  // R10-K: kanban board
  kanban: `(function(){ const board = [...document.querySelectorAll("main div")].find(d => /overflow-x-auto pb-4/.test(d.getAttribute("class") || "")); const root = document.querySelector("main > div"); return JSON.stringify({ boardFound: !!board, cols: board ? board.children.length : 0, colW: board && board.children[0] ? Math.round(board.children[0].getBoundingClientRect().width) : null, contentW: Math.round(root.getBoundingClientRect().width) }); })()`,
  // R10-L: reports selector
  reports: `(function(){ const list = document.querySelector("main [role=tablist]"); const first = list ? list.querySelector("[role=tab]") : null; return JSON.stringify({ listBg: list ? getComputedStyle(list).backgroundColor : null, listH: list ? Math.round(list.getBoundingClientRect().height) : null, firstChipW: first ? Math.round(first.getBoundingClientRect().width) : null, chipHasIcon: first ? !!first.querySelector("svg") : null }); })()`,
  // R10-M: profile card
  profile: `(function(){ const cards = [...document.querySelectorAll("main div")].filter(d => getComputedStyle(d).borderRadius === "12px" && d.getBoundingClientRect().height > 100 && d.getBoundingClientRect().height < 200); const card = cards[0]; if (!card) return "none"; const avatar = card.querySelector(".rounded-full"); const btn = [...card.querySelectorAll("button")].find(b => /Change Photo/.test(b.textContent || "")); const badge = [...card.querySelectorAll("span")].find(s => /^(User|Admin)$/.test(s.textContent.trim())); return JSON.stringify({ cardH: Math.round(card.getBoundingClientRect().height), avatarW: avatar ? Math.round(avatar.getBoundingClientRect().width) : null, avatarBg: avatar ? getComputedStyle(avatar).backgroundImage.slice(0, 46) : null, btnY: btn ? Math.round(btn.getBoundingClientRect().y) : null, btnW: btn ? Math.round(btn.getBoundingClientRect().width) : null, badgeText: badge ? badge.textContent.trim() : null, badgeY: badge ? Math.round(badge.getBoundingClientRect().y) : null }); })()`,
  // R10-N: hrassistantchat
  chat: `(function(){ const btn = [...document.querySelectorAll("main button")].find(b => /New Chat/.test(b.textContent || "")); const grid = btn ? btn.closest("div[class*=grid], .grid") || btn.parentElement.closest(".grid") : null; return JSON.stringify({ btnY: btn ? Math.round(btn.getBoundingClientRect().y) : null, btnH: btn ? Math.round(btn.getBoundingClientRect().height) : null, btnW: btn ? Math.round(btn.getBoundingClientRect().width) : null, inCard: btn ? !!btn.closest("[class*=rounded-xl]") && btn.closest("[class*=rounded-xl]").getBoundingClientRect().y < btn.getBoundingClientRect().y : null }); })()`,
  // R10-O/R10-Q/R10-F/R10-H/R10-P: empty states
  emptyState: `(function(){ const main = document.querySelector("main"); const btns = [...main.querySelectorAll("button")]; const h3 = [...main.querySelectorAll("h3")]; const p16 = [...main.querySelectorAll("div")].find(d => /py-16/.test(d.getAttribute("class") || "") && d.getBoundingClientRect().height > 50); const icons = [...main.querySelectorAll("svg")].filter(s => { const r = s.getBoundingClientRect(); return r.width >= 48 && r.width <= 64; }); return JSON.stringify({ h3Texts: h3.map(h => (h.textContent || "").trim().slice(0, 24)), ctaYs: btns.filter(b => b.getBoundingClientRect().y > 300 && b.getBoundingClientRect().y < 500).map(b => ({ t: (b.textContent || "").trim().slice(0, 18), y: Math.round(b.getBoundingClientRect().y), w: Math.round(b.getBoundingClientRect().width) })), hasPy16: !!p16, bigIconH: icons.length ? Math.round(icons[0].getBoundingClientRect().height) : null }); })()`,
};

const pages = {
  offboarding: { probe: "actionsStart", want: 32 },
  compliancedashboard: { probe: "actionsStart", want: 32 },
  allleaverequests: { probe: "actionsStart", want: 32 },
  workflowautomation: { probe: "actionsStart", want: 32 },
  loans: { probe: "actionsStart", want: 64 },
  advancedanalytics: { probe: "actionsStart", want: 32 },
  attendance: { probe: "attendance" },
  companywall: { probe: "composer" },
  shiftcalendar: { probe: "shiftcalendar" },
  recruitmentkanban: { probe: "kanban" },
  reports: { probe: "reports" },
  profile: { probe: "profile" },
  hrassistantchat: { probe: "chat" },
  loansEmpty: { route: "loans", probe: "emptyState" },
  workflowconfigpage: { probe: "emptyState" },
  hrletters: { probe: "emptyState" },
  announcements: { probe: "emptyState" },
  staffrequests: { probe: "emptyState" },
};

function run(session, cmd) {
  try {
    return execSync(`agent-browser --session ${session} ${cmd}`, { stdio: "pipe", timeout: 30000 }).toString().trim();
  } catch (e) { return "ERR:" + String(e).slice(0, 60); }
}

for (const [name, cfg] of Object.entries(pages)) {
  const route = cfg.route ?? name;
  for (const s of ["ref", "loc"]) {
    run(s, `open "${B[s]}/${route}"`);
  }
  await new Promise(r => setTimeout(r, 1600));
  const results = {};
  for (const s of ["ref", "loc"]) {
    results[s] = run(s, `eval ${JSON.stringify(probes[cfg.probe])}`);
  }
  const ref = results.ref.replace(/^"|"$/g, "");
  const loc = results.loc.replace(/^"|"$/g, "");
  let verdict = ref === loc ? "MATCH " : "DIFF  ";
  if (cfg.want != null) {
    verdict = parseInt(loc, 10) === cfg.want ? "MATCH " : `DIFF(want ${cfg.want}) `;
  }
  console.log(`${verdict} ${name}`);
  console.log(`   ref: ${ref.slice(0, 220)}`);
  console.log(`   loc: ${loc.slice(0, 220)}`);
}
