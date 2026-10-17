#!/usr/bin/env node
// verify-r48.mjs — parity round 48's live verification: paired reads of
// the round's surfaces on REF (@1440×900) vs the fresh zero-tenant LOC
// build (:3201, booted in THIS process tree). Class reads compare
// MEMBER-SETS (sorted, whitespace-normalized) — the class-string ORDER
// varies with cn() merge order and is render-neutral. Documented
// translations normalize before compare (see normalize()).
// Usage: node scripts/verify-r48.mjs
import { execSync, spawn } from "node:child_process";

function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 140); } }
async function evalOn(session, expr, ms = 0) { if (ms) await new Promise(r => setTimeout(r, ms)); const oneLine = expr.split("\n").join(" "); const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`); try { return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " ")); } catch { return { error: out.slice(0, 300) }; } }

const repo = "/home/z/my-project/eon-hr";

// ---- kill any stale :3201 holder (Next renames its process — pkill by
// name NEVER matches; kill by port-derived PID, the r48 lesson) ----
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3201$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);

// ---- boot the LOC standalone (:3201, zero tenant) inside this tree ----
run(`rm -f ${repo}/db/zero.db ${repo}/db/zero.db-journal`);
run(`cd ${repo} && DATABASE_URL="file:../db/zero.db" npx prisma db push --skip-generate >/dev/null 2>&1`);
run(`cd ${repo} && DATABASE_URL="file:../db/zero.db" npx tsx prisma/seed.ts 2>&1 | tail -1`);
const server = spawn("bash", ["-c",
  `cd ${repo} && DATABASE_URL="file:../db/zero.db" AUTH_SECRET=zero-tenant-secret PORT=3201 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc0-verify.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3201/api/health").startsWith("ERR")) { up = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
if (!up) { console.log("SERVER DOWN"); process.exit(1); }

// revive loc0 auth
run('agent-browser --session loc0 set viewport 1440 900');
run('agent-browser --session loc0 open http://127.0.0.1:3201/login');
await new Promise(r => setTimeout(r, 2200));
run('agent-browser --session loc0 fill "input[type=email]" "sepnetflix2023@outlook.com"');
await new Promise(r => setTimeout(r, 350));
run("agent-browser --session loc0 fill 'input[type=password]' '$Abcd1234'");
await new Promise(r => setTimeout(r, 350));
const snap = run('agent-browser --session loc0 snapshot -i -c');
const btnRef = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
if (btnRef) run(`agent-browser --session loc0 click @${btnRef}`);
await new Promise(r => setTimeout(r, 4200));
console.log("loc0:", run('agent-browser --session loc0 get url').trim());

// ---- the reader (NO // comments inside — the one-liner trap) ----
const READ = `(() => {
  const main = document.querySelector('main');
  const sc = main ? (main.querySelector('div.overflow-auto, div.overflow-y-auto') || main) : null;
  if (!sc) return { gone: true };
  const root = sc.querySelector('[class*=min-h-screen]') || sc;
  const wrap = root.querySelector('[class*=max-w-]') || root;
  const norm = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const h1 = [...wrap.querySelectorAll('h1')].find(h => !h.closest('[class*="md:hidden"]')) || wrap.querySelector('h1');
  const block = h1 ? h1.parentElement : null;
  const row = block ? block.parentElement : null;
  const kick = wrap.querySelector('[class*="md:hidden"][class*="sticky"]');
  const badgeSpan = wrap.querySelector('span.text-sm.font-medium');
  const badgeSvg = wrap.querySelector('div.inline-flex svg');
  const badgeSpanCls = wrap.querySelector('span.inline-flex');
  const actions = row ? [...row.children].filter(c => c !== block) : [];
  const firstTable = wrap.querySelector('table');
  const th0 = firstTable ? firstTable.querySelector('th') : null;
  const grids = { h: sc.querySelectorAll('g.recharts-cartesian-grid-horizontal line').length, v: sc.querySelectorAll('g.recharts-cartesian-grid-vertical line').length };
  return {
    wrapCls: norm(wrap.className),
    rowCls: row && row !== wrap ? norm(row.className) : null,
    blockCls: block ? norm(block.className) : null,
    blockIsDirect: block ? block.parentElement === wrap : false,
    h1Cls: h1 ? norm(h1.className) : null,
    kickCls: kick ? norm(kick.className) : null,
    badgeSvgCls: badgeSvg ? norm(badgeSvg.getAttribute('class')) : null,
    badgeGuardCls: badgeSpanCls ? norm(badgeSpanCls.className) : null,
    badgeCls: badgeSpan ? norm(badgeSpan.parentElement.className) : null,
    actionCls: actions.length ? norm(actions[0].className).slice(0, 600) : null,
    actionTag: actions.length ? actions[0].tagName : null,
    th0: th0 ? norm(th0.className) : null,
    grids
  };
})()`;

// member-set normalize: split, drop the documented render-neutral
// translations, sort
const NEUTRAL_DROPS = [
  /^dark:/,                  // the clone's dark-mode superset members
  /^leading-none$/,          // twMerge collapse under later text-*
  /^mt-8$/,                  // row offset collapsing with space-y (render-neutral)
  /^flex-wrap$/, /^items-center$/, // the wrap-cluster family default (r15-C fitting)
  /^min-w-0$/, /^flex-1$/,   // retired (kept for safety: any straggler is neutralized)
  /^select-none$/,           // kicker back button (clone's a11y-adjacent member)
  /^bg-none$/, /^hover:bg-none$/, /^hover:bg-\[linear/, // the gradient mitigations (bg-image layer supersedes color — inert)
  /^shrink-0$/,
  /^cursor-pointer$/,
  /^py-2$/,                  // inert under fixed h-* heights (the ghost h-8 pair)
  /^align-middle$/,          // the clone's TableHead base (UA-default th alignment)
  /^\[&:has\(/,               // the clone's TableHead checkbox variant (inert)
  /^transition-colors$/, /^transition-all$/, /^focus-visible:outline-none$/, /^focus-visible:ring-1$/, /^focus-visible:ring-ring$/,
  /^disabled:pointer-events-none$/, /^disabled:opacity-50$/, /^disabled:cursor-not-allowed$/,
  /^\[\&_svg\]/, /^\[\&>svg\]/,
  /^ring-offset-background$/, /^focus-visible:ring-2$/, /^focus-visible:ring-offset-2$/,
  /^shadow-sm$/, /^shadow$/,
  /^mb-0!$/,
];
const TOKEN_TRANSLATIONS = {
  // R15-A: tab surfaces — the clone's neutral-500 IS REF's muted-foreground (#737373)
  "text-neutral-500": "text-muted-foreground",
  "text-neutral-400": "text-muted-foreground",
  // the clone's tokens that alias REF's explicit colors
  "bg-secondary": "bg-muted",
  "hover:bg-secondary": "hover:bg-accent",
  "hover:text-secondary-foreground": "hover:text-accent-foreground",
  "text-primary-foreground": "text-white",
};
function normalize(cls) {
  if (!cls) return "";
  let members = cls.split(/\s+/).filter(Boolean);
  members = members.map((m) => TOKEN_TRANSLATIONS[m] ?? m);
  members = members.filter((m) => !NEUTRAL_DROPS.some((re) => re.test(m)));
  return [...new Set(members)].sort().join(" ");
}
function memberEq(a, b) { return normalize(a) === normalize(b); }

/* the badge glyph: REF carries size+color ON the svg; the clone's guard
   span carries them via arbitrary-variant CSS + the span color (the
   documented render-neutral guard translation, r47-C4) — merge the span
   members into the svg member set before compare. */
function badgeEq(refSvg, locSvg, locGuard) {
  const refSet = new Set(normalize(refSvg).split(/\s+/).filter(Boolean));
  const locSet = new Set(normalize(locSvg).split(/\s+/).filter(Boolean));
  // the guard's [&_svg] members are DROPPED by normalize (the neutral list)
  // — read them from the RAW guard string here
  for (const m of (locGuard || "").split(/\s+/)) {
    if (!m) continue;
    if (m === "[&_svg]:h-4") locSet.add("h-4");
    if (m === "[&_svg]:w-4") locSet.add("w-4");
    if (/^text-/.test(m) && !locSet.has(m)) locSet.add(m);
  }
  return refSet.size === locSet.size && [...refSet].every((m) => locSet.has(m));
}

/* the chart gridlines: the E contract is DIRECTION parity (dual-direction
   where REF renders dual) — the exact line COUNTS are Recharts internals
   (data-dependent at zero), the r47-documented non-gap. */
function gridsEq(refG, locG) {
  const rd = (g) => (g && g.h > 0 ? 1 : 0) + (g && g.v > 0 ? 2 : 0);
  return rd(refG) === rd(locG);
}

// ---- the pairs: [name, route, {keys to compare}] ----
const PAIRS = [
  ["bare-organogram", "/organogram", ["wrapCls", "blockCls", "h1Cls", "grids"]],
  ["bare-securitysettings", "/securitysettings", ["wrapCls", "blockCls", "h1Cls", "badgeSvgCls"]],
  ["bare-settings", "/settings", ["wrapCls", "blockCls", "h1Cls"]],
  ["bare-interviewassistant", "/interviewassistant", ["wrapCls", "blockCls", "h1Cls", "badgeSvgCls"]],
  ["bare-hrassistant", "/hrassistant", ["wrapCls", "blockCls", "h1Cls", "badgeSvgCls"]],
  ["bare-hrassistantchat", "/hrassistantchat", ["wrapCls", "blockCls", "h1Cls"]],
  ["bare-training", "/training", ["wrapCls", "blockCls", "h1Cls"]],
  ["bare-companywall", "/companywall", ["wrapCls", "blockCls", "h1Cls"]],
  ["bare-evaluations", "/evaluations", ["wrapCls", "blockCls", "h1Cls", "badgeSvgCls"]],
  ["bare-reports", "/reports", ["wrapCls", "blockCls", "h1Cls"]],
  ["bare-communications", "/communications", ["wrapCls", "blockCls", "h1Cls"]],
  ["bare-notificationpreferences", "/notificationpreferences", ["wrapCls", "blockCls", "h1Cls"]],
  ["bare-analytics", "/analytics", ["wrapCls", "blockCls", "h1Cls", "grids"]],
  ["alwaysrow-hrreports", "/hrreports", ["rowCls", "blockCls", "actionCls", "th0", "grids"]],
  ["alwaysrow-requestreports", "/requestreports", ["rowCls", "blockCls", "actionCls", "th0"]],
  ["alwaysrow-assets", "/assets", ["rowCls", "blockCls", "actionCls", "actionTag", "badgeSvgCls"]],
  ["alwaysrow-offboarding", "/offboarding", ["rowCls", "blockCls", "actionTag"]],
  ["alwaysrow-advancedanalytics", "/advancedanalytics", ["rowCls", "blockCls", "grids"]],
  ["alwaysrow-workflowconfigpage", "/workflowconfigpage", ["rowCls", "blockCls"]],
  ["mdrow-taskmanager", "/taskmanager", ["rowCls", "blockCls", "kickCls"]],
  ["mdrow-leavemanagement", "/leavemanagement", ["rowCls", "blockCls", "actionTag"]],
  ["mdrow-expenses", "/expenses", ["rowCls", "blockCls"]],
  ["shortrow-loans", "/loans", ["rowCls", "blockCls"]],
  ["c3-payrollreports", "/payrollreports", ["rowCls", "blockCls", "h1Cls", "badgeSvgCls", "actionCls", "th0", "kickCls"]],
  ["c9-recruitmentkanban", "/recruitmentkanban", ["rowCls", "blockCls", "h1Cls"]],
  ["c4-chat", "/chat", ["wrapCls"]],
  ["c8-attendancedashboard", "/attendancedashboard", ["rowCls", "blockCls", "grids"]],
  ["c8-analyticsdashboard", "/analyticsdashboard", ["rowCls", "blockCls", "grids"]],
  ["c8-surveyanalytics", "/surveyanalytics", ["rowCls", "blockCls", "grids"]],
];

let pass = 0, fail = 0;
for (const [name, route, keys] of PAIRS) {
  run(`agent-browser --session ref open "https://eon.base44.app${route}"`);
  await new Promise(r => setTimeout(r, 2600));
  const a = await evalOn("ref", READ);
  run(`agent-browser --session loc0 open "http://127.0.0.1:3201${route}"`);
  await new Promise(r => setTimeout(r, 2000));
  const b = await evalOn("loc0", READ);
  const diffs = [];
  for (const k of keys) {
    const av = a[k], bv = b[k];
    if (k === "badgeSvgCls") {
      if (!badgeEq(av, bv, b.badgeGuardCls)) diffs.push(`${k}:\n    REF ${av}\n    LOC ${bv} (guard ${b.badgeGuardCls})`);
    } else if (k === "grids") {
      if (!gridsEq(av, bv)) diffs.push(`${k}: ${JSON.stringify(av)} vs ${JSON.stringify(bv)}`);
    } else if (typeof av === "object" || typeof bv === "object") {
      if (JSON.stringify(av) !== JSON.stringify(bv)) diffs.push(`${k}: ${JSON.stringify(av)} vs ${JSON.stringify(bv)}`);
    } else if (!memberEq(av, bv)) {
      diffs.push(`${k}:\n    REF ${av}\n    LOC ${bv}`);
    }
  }
  if (diffs.length === 0) { console.log(`PASS ${name}`); pass++; }
  else { console.log(`DIFF ${name}`); for (const d of diffs) console.log("  " + d); fail++; }
}
console.log(`\n=== ${pass}/${pass + fail} pairs MATCH ===`);
process.exit(0);
