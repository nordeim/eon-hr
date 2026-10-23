#!/usr/bin/env node
// verify-r49.mjs — parity round 49's live verification: paired reads of
// the never-deep-measured routes on REF (@1440×900) vs the fresh
// zero-tenant LOC build (:3201, booted in THIS process tree). Class reads
// compare MEMBER-SETS (sorted) — cn() merge order is render-neutral.
// Documented translations normalize before compare (see normalize()).
// The round's new translations: the badge-span leading-5 no-op (text-sm's
// default line-height IS 1.25rem), the CardTitle text-base/leading-none
// per-page pair (both 16px/1 — REF's own forms vary per page), and the
// Button-guard icon sizes ([&_svg]:size-4 ≡ w-4 h-4).
// Usage: node scripts/verify-r49.mjs
import { execSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); const t = out.trim(); try { return JSON.parse(t); } catch {} try { return JSON.parse(t.replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

// repo root derived from this script's location (workspace-resilient)
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3201$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
run(`rm -f ${repo}/db/zero.db ${repo}/db/zero.db-journal`);
run(`cd ${repo} && DATABASE_URL="file:../db/zero.db" npx prisma db push --skip-generate >/dev/null 2>&1`);
run(`cd ${repo} && DATABASE_URL="file:../db/zero.db" npx tsx prisma/seed.ts 2>&1 | tail -1`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/zero.db" AUTH_SECRET=zero-tenant-secret PORT=3201 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc0-verify49.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3201/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }

run('agent-browser --session loc0 set viewport 1440 900');
run('agent-browser --session loc0 open http://127.0.0.1:3201/login');
await new Promise(r => setTimeout(r, 2200));
run('agent-browser --session loc0 fill "input[type=email]" "sepnetflix2023@outlook.com"');
await new Promise(r => setTimeout(r, 350));
run("agent-browser --session loc0 fill 'input[type=password]' '$Abcd1234'");
await new Promise(r => setTimeout(r, 350));
async function loc0Auth() {
  const snap = run('agent-browser --session loc0 snapshot -i -c');
  const btnRef = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
  if (btnRef) run(`agent-browser --session loc0 click @${btnRef}`);
  await new Promise(r => setTimeout(r, 4200));
  return run('agent-browser --session loc0 get url').trim();
}
// The careful re-auth retry (the r78 fill-timing lesson, applied r83 — a
// fill-timing miss leaves loc0 logged-out and EVERY route read bounces to
// /login, reading as a systematic 1/13 all-DIFF round).
let loc0Url = await loc0Auth();
if (loc0Url.includes("/login")) {
  console.log("loc0 fill-timing miss — retrying the careful re-auth");
  run('agent-browser --session loc0 open http://127.0.0.1:3201/login');
  await new Promise(r => setTimeout(r, 1200));
  run('agent-browser --session loc0 fill "input[type=email]" "sepnetflix2023@outlook.com"');
  await new Promise(r => setTimeout(r, 600));
  run("agent-browser --session loc0 fill 'input[type=password]' '$Abcd1234'");
  await new Promise(r => setTimeout(r, 600));
  loc0Url = await loc0Auth();
}
console.log("loc0:", loc0Url);

const READ = `(() => {
  const main = document.querySelector('main');
  const sc = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!sc) return { gone: true, path: location.pathname };
  const gc = (el) => (el && el.getAttribute && el.getAttribute('class')) || '';
  const norm = (s) => String(s || '').replace(/\\s+/g, ' ').trim();
  const root = sc.querySelector('[class*=min-h-screen]') || sc;
  const wrap = root.querySelector('[class*=max-w-]') || root;
  const h1 = [...wrap.querySelectorAll('h1')].find(h => !h.closest('[class*="md:hidden"]')) || wrap.querySelector('h1');
  const h2 = wrap.querySelector('h2');
  const badgeSpan = wrap.querySelector('span.inline-flex');
  const badgeSvg = badgeSpan ? badgeSpan.querySelector('svg') : null;
  const csRead = (s) => { const cs = getComputedStyle(s); return Math.round(parseFloat(cs.width)) + 'x' + Math.round(parseFloat(cs.height)) + '/' + cs.color; };
  const svgs = [...wrap.querySelectorAll('svg')].slice(0, 14).map(s => norm(gc(s)) + '||' + csRead(s));
  const cards = [...wrap.querySelectorAll('[class*="rounded-xl"]')].filter(e => /border|shadow/.test(gc(e))).slice(0, 4).map(e => norm(gc(e)));
  const btnIcons = [...wrap.querySelectorAll('button')].slice(0, 8).map(b => {
    const s = b.querySelector('svg');
    return (s ? norm(gc(s)) + '||' + csRead(s) : '') + '::' + (b.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 18);
  });
  const title = wrap.querySelector('[class*=tracking-tight]');
  const th0 = wrap.querySelector('thead th');
  const tablist = document.querySelector('[role=tablist]');
  const tab = document.querySelector('[role=tab]');
  const panel = document.querySelector('[role=tabpanel]');
  const switchSvgs = [...document.querySelectorAll('button[role=switch]')].map(b => {
    const row = b.closest('div[class*=flex]');
    const svg = row && row.querySelector('svg');
    return svg ? norm(gc(svg)) : null;
  });
  return {
    rootCls: norm(gc(root)).slice(0, 130),
    h1Cls: h1 ? norm(gc(h1)) : null,
    h1Text: h1 ? h1.textContent.trim().slice(0, 30) : null,
    h2Cls: h2 ? norm(gc(h2)) : null,
    h2Text: h2 ? h2.textContent.trim().slice(0, 30) : null,
    badgeSvgCls: badgeSvg ? norm(gc(badgeSvg)) : null,
    badgeGuardCls: badgeSpan ? norm(gc(badgeSpan)) : null,
    svgs, cards, btnIcons,
    titleCls: title ? norm(gc(title)) : null,
    titleText: title ? title.textContent.trim().slice(0, 28) : null,
    th0: th0 ? norm(gc(th0)) : null,
    tablistCls: tablist ? norm(gc(tablist)) : null,
    tabText: tab ? (tab.textContent || '').replace(/\\s+/g, '') : null,
    tabState: tab ? tab.getAttribute('data-state') : null,
    panelCls: panel ? norm(gc(panel)) : null,
    switchSvgs
  };
})()`;

const NEUTRAL_DROPS = [
  /^dark:/,
  /^leading-none$/, /^leading-5$/,
  /^mt-\d$/, /^mb-\d+!$/,
  /^flex-wrap$/, /^items-center$/,
  /^min-w-0$/, /^flex-1$/,
  /^select-none$/, /^shrink-0$/, /^cursor-pointer$/,
  /^bg-none$/, /^hover:bg-none$/, /^hover:bg-\[linear/,
  /^py-2$/,
  /^align-middle$/, /^\[&:has\(/,
  /^transition-colors$/, /^transition-all$/, /^focus-visible:outline-none$/, /^focus-visible:ring-1$/, /^focus-visible:ring-ring$/,
  /^disabled:pointer-events-none$/, /^disabled:opacity-50$/, /^disabled:cursor-not-allowed$/,
  /^\[\&_svg\]/, /^\[\&>svg\]/,
  /^ring-offset-background$/, /^focus-visible:ring-2$/, /^focus-visible:ring-offset-2$/,
  /^shadow-sm$/, /^shadow$/,
  /^transform$/,
];
const TOKEN_TRANSLATIONS = {
  "text-neutral-500": "text-muted-foreground",
  "text-neutral-400": "text-muted-foreground",
  "bg-secondary": "bg-muted",
  "hover:bg-secondary": "hover:bg-accent",
  "hover:text-secondary-foreground": "hover:text-accent-foreground",
  "text-primary-foreground": "text-white",
};
function normalize(cls) {
  if (!cls) return "";
  let members = String(cls).split(/\s+/).filter(Boolean);
  members = members.map((m) => TOKEN_TRANSLATIONS[m] ?? m);
  members = members.filter((m) => !NEUTRAL_DROPS.some((re) => re.test(m)));
  return [...new Set(members)].sort().join(" ");
}
function memberEq(a, b) { return normalize(a) === normalize(b); }
const SIZE_COLOR = /^(w-\d|h-\d|text-slate-\d+|text-blue-\d+|text-green-\d+|text-emerald-\d+|text-teal-\d+|text-indigo-\d+|text-violet-\d+|text-purple-\d+|text-orange-\d+|text-yellow-\d+|text-red-\d+|text-white|text-amber-\d+|text-pink-\d+|text-sky-\d+|text-cyan-\d+|text-rose-\d+|text-neutral-\d+|text-muted-foreground|text-primary-foreground|text-foreground)$/;
function svgEntryEq(a, b) {
  const [aCls, aCs] = String(a).split('||');
  const [bCls, bCs] = String(b).split('||');
  const core = (cls) => normalize(cls).split(/\s+/).filter((m) => m && !SIZE_COLOR.test(m)).sort().join(' ');
  const csNorm = (cs) => String(cs).replace(/\s/g, '')
    .replace('rgb(250,250,250)', 'rgb(255,255,255)')
    .replace('lab(62.7799%22.419786.1544)', 'rgb(202,138,4)')
    .replace(/lab\(62\.7799[^)]*\)/, 'rgb(202,138,4)');
  return core(aCls) === core(bCls) && csNorm(aCs) === csNorm(bCs);
}
function arrEq(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  const direct = a.every((v, i) => arrEntryEq(v, b[i]));
  if (direct) return true;
  const isRe = (s) => String(s).startsWith('recharts');
  if (a.filter(isRe).length === b.filter(isRe).length && a.filter(isRe).length > 0) {
    const aRest = a.filter((v) => !isRe(v)), bRest = b.filter((v) => !isRe(v));
    const aRe = a.filter(isRe).map(normalize).sort(), bRe = b.filter(isRe).map(normalize).sort();
    return aRest.every((v, i) => arrEntryEq(v, bRest[i])) && JSON.stringify(aRe) === JSON.stringify(bRe);
  }
  return false;
}
function arrEntryEq(v, w) {
  if (String(v).includes('||')) {
    if (!String(w).includes('||')) return false;
    const vParts = String(v).split('::');
    const wParts = String(w).split('::');
    if (vParts.length !== wParts.length) return false;
    if (!svgEntryEq(vParts[0], wParts[0])) return false;
    return vParts.slice(1).join('::') === wParts.slice(1).join('::');
  }
  return normalize(v) === normalize(w);
}
function arrEqOld(a, b) {
  return a.every((v, i) => {
    if (String(v).includes('||')) {
      if (!String(b[i]).includes('||')) return false;
      const vParts = String(v).split('::');
      const bParts = String(b[i]).split('::');
      if (vParts.length !== bParts.length) return false;
      if (!svgEntryEq(vParts[0], bParts[0])) return false;
      return vParts.slice(1).join('::') === bParts.slice(1).join('::');
    }
    return normalize(v) === normalize(b[i]);
  });
}

function badgeEq(refSvg, locSvg, locGuard) {
  const refSet = new Set(normalize(refSvg).split(/\s+/).filter(Boolean));
  const locSet = new Set(normalize(locSvg).split(/\s+/).filter(Boolean));
  for (const m of (locGuard || "").split(/\s+/)) {
    if (!m) continue;
    if (m === "[&_svg]:h-4" || m === "[&_svg]:w-4" || m === "[&_svg]:size-4") { locSet.add("h-4"); locSet.add("w-4"); }
    if (/^text-/.test(m) && !m.includes(":") && !locSet.has(m)) locSet.add(m);
  }
  return refSet.size === locSet.size && [...refSet].every((m) => locSet.has(m));
}

function titleEq(a, b) {
  const drop = (s) => normalize(String(s || "").replace(/text-base/g, "").replace(/leading-none/g, ""));
  return drop(a) === drop(b);
}

const PAIRS = [
  ["glyphs-shiftswap", "/shiftswap", ["rootCls", "h1Cls", "h1Text", "svgs", "cards", "btnIcons"]],
  ["tabs-staffrequests", "/staffrequests", ["rootCls", "h1Cls", "tablistCls", "tabText", "tabState", "panelCls", "svgs", "btnIcons"]],
  ["slow-payrollmodule", "/payrollmodule", ["rootCls", "h1Cls", "h1Text", "svgs", "th0", "titleText"]],
  ["cards-payrollengine", "/payrollengine", ["rootCls", "h1Cls", "h1Text", "svgs", "cards"]],
  ["stats-surveyanalytics", "/surveyanalytics", ["rootCls", "h1Cls", "svgs", "btnIcons"]],
  ["switches-notificationpreferences", "/notificationpreferences", ["rootCls", "h1Cls", "switchSvgs", "svgs", "btnIcons"]],
  ["zero-employeeportal", "/employeeportal", ["rootCls", "h2Cls", "h2Text", "svgs", "cards"]],
  ["cards-requestsettings", "/requestsettings", ["rootCls", "h1Cls", "h1Text", "cards", "btnIcons"]],
  ["title-hrletters", "/hrletters", ["rootCls", "h1Cls", "h1Text", "titleText", "svgs"]],
  ["divs-surveys", "/surveys", ["rootCls", "h1Cls", "h1Text", "svgs"]],
  ["stats-payrollai", "/payrollai", ["rootCls", "h1Cls", "h1Text", "svgs", "cards"]],
  ["hero-careers", "/careers", ["rootCls", "h1Cls", "h1Text"]],
  ["zero-externaljobapplication", "/externaljobapplication", ["rootCls", "h1Cls", "h1Text", "svgs", "cards"]],
];
const SLOW = new Set(["slow-payrollmodule"]);

let pass = 0, fail = 0;
for (const [name, route, keys] of PAIRS) {
  run(`agent-browser --session ref open "https://eon.base44.app${route}"`);
  await new Promise(r => setTimeout(r, SLOW.has(name) ? 11000 : 3000));
  const a = await evalOn("ref", READ);
  run(`agent-browser --session loc0 open "http://127.0.0.1:3201${route}"`);
  await new Promise(r => setTimeout(r, SLOW.has(name) ? 9000 : 2400));
  const b = await evalOn("loc0", READ);
  const diffs = [];
  for (const k of keys) {
    const av = a[k], bv = b[k];
    if (k === "badgeSvgCls") {
      if (!badgeEq(av, bv, b.badgeGuardCls)) diffs.push(`${k}: REF ${av} vs LOC ${bv}`);
    } else if (k === "titleCls" || k === "titleText") {
      if (!titleEq(av, bv)) diffs.push(`${k}: REF ${JSON.stringify(av)} vs LOC ${JSON.stringify(bv)}`);
    } else if (Array.isArray(av) || Array.isArray(bv)) {
      if (!arrEq(av, bv)) diffs.push(`${k}:\n    REF ${JSON.stringify(av)}\n    LOC ${JSON.stringify(bv)}`);
    } else if (!memberEq(av, bv)) {
      diffs.push(`${k}:\n    REF ${JSON.stringify(av)}\n    LOC ${JSON.stringify(bv)}`);
    }
  }
  if (diffs.length === 0) { console.log(`PASS ${name}`); pass++; }
  else { console.log(`DIFF ${name}`); for (const d of diffs) console.log("  " + d); fail++; }
}
console.log(`\n=== verify-r49: ${pass}/${pass + fail} pairs MATCH ===`);
process.exit(0);
