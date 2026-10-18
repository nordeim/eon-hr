#!/usr/bin/env node
// r57-census.mjs — session-57 / parity round 56 census: THE AFFORDANCE-STUB
// FAMILY (the interaction dimension's next layer — the §66 lesson's follow-up:
// round 55 measured the JOURNEYS between surfaces; this round measures the
// CLICK BEHAVIOR of the affordances every census SEES but never presses).
// The clone fires info toasts where REF opens real dialogs / hidden file
// inputs, and two profile tab interiors were authored from imagination.
//
// The paired phases (both apps, 1440×900):
//   (A) the employees "Import CSV": click → REF's "Bulk Import Employees"
//       dialog recipe (title + icon class, the alert + the 4-step list, the
//       template button, the dropzone text pair, the Cancel + X close)
//   (B) the company wall "Photo": click → the hidden media-upload input
//       contract (id, accept, hidden)
//   (C) the settings Integrations "WhatsApp … Connect": click → REF's
//       "Configure WhatsApp API" dialog recipe (title, the 3 field labels +
//       placeholders + required flags, the Cancel / Save Configuration pair)
//   (D) the profile "Social Accounts" tab: the tab-panel recipe (the
//       "Connected Accounts" card: the 4 field rows with the icon-tile
//       classes + labels + placeholders, the Save Accounts button)
//   (E) the profile "Preferences" tab: the panel recipe (the Notification
//       Preferences card: the 2 bg-slate-50 toggle rows + Save Preferences;
//       the Danger Zone card: title + row + destructive button; the
//       delete-confirmation dialog contract)
//
// Self-contained per the workspace-reap pattern: boots the seeded :3200
// standalone inside THIS process tree; both browser sessions ride the
// surviving agent-browser daemon.
import { execSync, spawn } from "node:child_process";

function run(cmd, t = 45000) { try { return execSync(cmd, { stdio: "pipe", timeout: t }).toString(); } catch (e) { return "ERR:" + String(e.stderr || e.stdout || e).slice(0, 200); } }
const settle = (ms) => new Promise(r => setTimeout(r, ms));
function evalStr(expr) { return JSON.stringify(expr.split("\n").join(" ")); }
async function ev(session, expr) {
  const out = run(`agent-browser --session ${session} eval ${evalStr(expr)}`);
  try { return JSON.parse(JSON.parse(out.trim())); } catch { return "ERR:" + out.slice(0, 200); }
}

const repo = "/home/z/my-project/eon-hr";
const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
const results = [];
function rec(name, a, b, note) {
  const match = JSON.stringify(a) === JSON.stringify(b);
  results.push({ name, match, note });
  console.log(`${match ? "MATCH" : "DIFF "} ${name}${note ? "  (" + note + ")" : ""}`);
  if (!match) { console.log(`  ref: ${JSON.stringify(a)}`); console.log(`  loc: ${JSON.stringify(b)}`); }
}

// ---- boot the seeded LOC server (this call's own process tree) ----
run(`PID=$(ss -tlnp 2>/dev/null | awk '$4 ~ /:3200$/ {print $NF}' | grep -oP 'pid=\\K[0-9]+' | head -1); [ -n "$PID" ] && kill -9 $PID; true`);
const server = spawn("bash", ["-c",
  `cd ${repo} && env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\\K[^"]+' .env)" PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js > /tmp/loc3200-r57.log 2>&1`],
  { stdio: "ignore" });
let up = false;
for (let i = 0; i < 120; i++) {
  if (!run("curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3200/api/health").startsWith("ERR")) { up = true; break; }
  await settle(500);
}
if (!up) { console.log("SERVER DOWN", run("tail -3 /tmp/loc3200-r57.log")); process.exit(1); }
console.log("seeded server up on :3200");

async function uiSignIn(session, base) {
  run(`agent-browser --session ${session} open ${base}/login`);
  await settle(2800);
  run(`agent-browser --session ${session} fill 'input[type=email]' 'sepnetflix2023@outlook.com'`);
  await settle(400);
  run(`agent-browser --session ${session} fill 'input[type=password]' '$Abcd1234'`);
  await settle(400);
  const snap = run(`agent-browser --session ${session} snapshot -i -c`);
  const btn = (snap.match(/- button "Sign in" \[ref=(\w+)\]/) || [])[1];
  if (btn) run(`agent-browser --session ${session} click @${btn}`);
  await settle(4200);
}

async function ensureAuthed(session, base) {
  run(`agent-browser --session ${session} open ${base}/`);
  await settle(2600);
  const path = await ev(session, "location.pathname");
  if (path === "/login" || path === "ERR") { await uiSignIn(session, base); run(`agent-browser --session ${session} open ${base}/`); await settle(2600); }
}

// click a button by its visible text inside the document (role=button or
// plain button); returns 'ok' | 'NOTFOUND'
const clickBtn = (session, text) =>
  ev(session, `(() => { const b = [...document.querySelectorAll('button')].find(x => (x.textContent || '').trim().includes('${text}') && x.offsetParent !== null); if (b) { b.click(); return 'ok'; } return 'NOTFOUND'; })()`);

// click a Radix tab by its label — REAL CDP click via the snapshot ref (the
// r57 instrument lesson: Radix TabsTrigger activates on POINTER events; a
// synthetic eval .click() fires no pointerdown and the tab never activates —
// the (C)/(D)/(E) phases MUST use the browser's real click path), then VERIFY
// the tab's data-state flipped active
async function clickTabVerified(session, label, tries = 4) {
  for (let i = 0; i < tries; i++) {
    const snap = run(`agent-browser --session ${session} snapshot -i -c`);
    const ref = (snap.match(new RegExp(`- tab "[^"]*${label}[^"]*" \\[ref=(\\w+)\\]`)) || [])[1];
    if (ref) run(`agent-browser --session ${session} click @${ref}`);
    await settle(2200);
    // NOTE: the state read must return JSON (the two-parse ev() ERR-wraps a
    // bare string — the session-56 §instrument lesson, re-learned here)
    const state = await ev(session, `JSON.stringify({ s: (() => { const t = [...document.querySelectorAll('[role=tab]')].find(x => (x.textContent || '').trim().includes('${label}')); return t ? t.getAttribute('data-state') : 'NOTFOUND'; })() })`);
    if (state && state.s === "active") return "ok";
  }
  return "TAB-CLICK-FAILED";
}

// ---------- (A) the Import CSV dialog ----------
const IMPORT_DIALOG = `JSON.stringify((() => {
  const dlg = document.querySelector('[role=dialog]');
  if (!dlg) return { dialog: false };
  const h2 = dlg.querySelector('h2');
  const icon = h2?.querySelector('svg');
  const li = [...dlg.querySelectorAll('ol li')].map(x => x.textContent.trim());
  const templateBtn = [...dlg.querySelectorAll('button')].find(b => b.textContent.includes('Download CSV Template'));
  const drop = dlg.querySelector('.border-dashed');
  const cancels = [...dlg.querySelectorAll('button')].map(b => b.textContent.trim()).filter(t => t === 'Cancel');
  return {
    dialog: true,
    title: h2?.textContent.trim(),
    titleIconClass: icon ? icon.getAttribute('class') : null,
    alertHeading: dlg.querySelector('p.font-medium')?.textContent.trim(),
    steps: li,
    templateBtnClass: templateBtn ? templateBtn.className.split(' ').filter(c => /w-full|h-9/.test(c)).sort().join(' ') : null,
    dropzoneClass: drop ? drop.className : null,
    dropzoneP: drop ? [...drop.querySelectorAll('p')].map(p => p.textContent.trim()) : null,
    uploadIconClass: drop?.querySelector('svg')?.getAttribute('class'),
    fileInputId: dlg.querySelector('input[type=file]')?.id ?? null,
    cancelBtn: cancels.length,
    hasXClose: !!dlg.querySelector('button svg.lucide-x, button .lucide-x'),
    maxWidth: dlg.className.match(/max-w-\\S+/)?.[0] ?? null,
  };
})())`;

async function phaseImportCsv(session, base) {
  run(`agent-browser --session ${session} set viewport 1440 900`);
  run(`agent-browser --session ${session} open ${base}/employees`);
  await settle(3200);
  await clickBtn(session, "Import CSV");
  await settle(1600);
  return ev(session, IMPORT_DIALOG);
}

// ---------- (B) the wall Photo button → hidden media input ----------
const WALL_MEDIA = `JSON.stringify((() => {
  const input = document.querySelector('input[type=file]');
  const photoBtn = [...document.querySelectorAll('button')].find(x => (x.textContent || '').trim() === 'Photo' && x.offsetParent !== null);
  return {
    fileInput: input ? { id: input.id, accept: input.accept, hidden: input.className.includes('hidden') } : null,
    photoBtnExists: !!photoBtn,
  };
})())`;

async function phaseWallPhoto(session, base) {
  run(`agent-browser --session ${session} open ${base}/companywall`);
  await settle(3200);
  await clickBtn(session, "Photo");
  await settle(900);
  return ev(session, WALL_MEDIA);
}

// ---------- (C) the WhatsApp Configure dialog ----------
const WHATSAPP_DIALOG = `JSON.stringify((() => {
  const dlg = document.querySelector('[role=dialog]');
  if (!dlg) return { dialog: false };
  const labels = [...dlg.querySelectorAll('label')].map(l => l.textContent.trim());
  const inputs = [...dlg.querySelectorAll('input:not([type=button])')].map(i => ({ ph: i.placeholder, required: i.required }));
  const buttons = [...dlg.querySelectorAll('button')].map(b => b.textContent.trim()).filter(t => t && !t.includes('Close'));
  return {
    dialog: true,
    title: dlg.querySelector('h2')?.textContent.trim(),
    titleClass: dlg.querySelector('h2')?.className,
    labels, inputs, buttons,
    maxWidth: dlg.className.match(/max-w-\\S+/)?.[0] ?? null,
  };
})())`;

async function phaseWhatsApp(session, base) {
  run(`agent-browser --session ${session} open ${base}/settings`);
  await settle(3400);
  const tab = await clickTabVerified(session, "Integrations");
  if (tab !== "ok") return { tabFailed: tab };
  await settle(1200);
  // the WhatsApp tile's Connect (the FIRST Connect button — ZKT's is second)
  await ev(session, `(() => { const b = [...document.querySelectorAll('button')].filter(x => (x.textContent || '').trim() === 'Connect')[0]; if (b) { b.click(); return 'ok'; } return 'NOTFOUND'; })()`);
  await settle(2000);
  return ev(session, WHATSAPP_DIALOG);
}

// ---------- (D) the profile Social Accounts tab ----------
const SOCIAL_TAB = `JSON.stringify((() => {
  const panel = document.querySelector('[data-state=active][role=tabpanel]');
  if (!panel) return { panel: false };
  const rows = [...panel.querySelectorAll('.flex.items-center.gap-4')].map(r => ({
    tileClass: r.querySelector(':scope > div')?.className,
    icon: r.querySelector('svg')?.getAttribute('class'),
    label: r.querySelector('label')?.textContent.trim(),
    ph: r.querySelector('input')?.placeholder,
  }));
  return {
    panel: true,
    title: panel.querySelector('.font-semibold')?.textContent.trim(),
    rowGaps: panel.querySelector('form')?.className,
    rows,
    saveBtn: [...panel.querySelectorAll('button')].map(b => b.textContent.trim()).filter(t => /Save/.test(t)),
    saveIconSize: (() => { const s = [...panel.querySelectorAll('button svg')].find(x => x.getAttribute('class')?.includes('save')); return s ? getComputedStyle(s).width : null; })(),
  };
})())`;

async function phaseSocial(session, base) {
  run(`agent-browser --session ${session} open ${base}/profile`);
  await settle(3200);
  const tab = await clickTabVerified(session, "Social Accounts");
  if (tab !== "ok") return { tabFailed: tab };
  await settle(1200);
  return ev(session, SOCIAL_TAB);
}

// ---------- (E) the profile Preferences tab + the delete dialog ----------
const PREFS_TAB = `JSON.stringify((() => {
  const panel = document.querySelector('[data-state=active][role=tabpanel]');
  if (!panel) return { panel: false };
  const cards = [...panel.children].map(c => c.querySelector('.font-semibold')?.textContent.trim()).filter(Boolean);
  const notifCard = [...panel.children].find(c => c.textContent.includes('Notification Preferences'));
  const rows = notifCard ? [...notifCard.querySelectorAll('.bg-slate-50')].map(r => ({
    title: r.querySelector('h4')?.textContent.trim(),
    sub: r.querySelector('p')?.textContent.trim(),
    switchState: r.querySelector('[role=switch]')?.getAttribute('data-state'),
  })) : [];
  const danger = [...panel.children].find(c => c.textContent.includes('Danger Zone'));
  return {
    panel: true,
    cards,
    notifRows: rows,
    saveBtn: notifCard ? [...notifCard.querySelectorAll('button')].map(b => b.textContent.trim()).filter(t => /Save/.test(t)) : [],
    dangerTitle: danger?.querySelector('.font-semibold')?.className,
    dangerRow: danger ? { title: danger.querySelector('h4')?.textContent.trim(), text: danger.querySelector('p')?.textContent.trim() } : null,
    dangerBtn: danger ? [...danger.querySelectorAll('button')].map(b => b.textContent.trim()).filter(t => /Delete/.test(t)) : [],
    dangerBtnClass: danger?.querySelector('button')?.className.split(' ').filter(c => /destructive|h-9/.test(c)).join(' '),
  };
})())`;

const DELETE_DIALOG = `JSON.stringify((() => {
  const dlg = document.querySelector('[role=dialog]');
  if (!dlg) return { dialog: false };
  const alert = dlg.querySelector('[role=alert]');
  const input = dlg.querySelector('input');
  const buttons = [...dlg.querySelectorAll('button')].map(b => ({ t: b.textContent.trim(), disabled: b.disabled })).filter(x => x.t);
  return {
    dialog: true,
    title: dlg.querySelector('h2')?.textContent.trim(),
    titleClass: dlg.querySelector('h2')?.className,
    alertText: alert?.textContent.trim(),
    label: dlg.querySelector('label')?.textContent.trim(),
    ph: input?.placeholder,
    buttons,
    footerClass: dlg.querySelector('.flex.flex-col-reverse')?.className,
  };
})())`;

async function phasePrefs(session, base) {
  run(`agent-browser --session ${session} open ${base}/profile`);
  await settle(3200);
  const tab = await clickTabVerified(session, "Preferences");
  if (tab !== "ok") return { panel: { tabFailed: tab }, del: { dialog: false } };
  await settle(1200);
  const panel = await ev(session, PREFS_TAB);
  // press Delete My Account → the confirmation dialog
  await clickBtn(session, "Delete My Account");
  await settle(1500);
  const del = await ev(session, DELETE_DIALOG);
  // cancel out (leave clean state)
  await ev(session, `(() => { const b = [...document.querySelectorAll('[role=dialog] button')].find(x => x.textContent.trim() === 'Cancel'); if (b) { b.click(); return 'ok'; } return 'NOTFOUND'; })()`);
  await settle(700);
  return { panel, del };
}

// ================= the paired run =================
await ensureAuthed("ref", baseRef);
await ensureAuthed("loc", baseLoc);
console.log("\n########## (A) Import CSV dialog ##########");
const aRef = await phaseImportCsv("ref", baseRef);
const aLoc = await phaseImportCsv("loc", baseLoc);
rec("(A) import-csv dialog", aRef, aLoc, "click behavior + recipe");
await ev("ref", `(() => { const b = [...document.querySelectorAll('[role=dialog] button')].find(x => x.textContent.trim() === 'Cancel'); if (b) b.click(); return 'ok'; })()`);
await settle(700);
await ev("loc", `(() => { return 'noop'; })()`);

console.log("\n########## (B) wall Photo → hidden media input ##########");
const bRef = await phaseWallPhoto("ref", baseRef);
const bLoc = await phaseWallPhoto("loc", baseLoc);
rec("(B) wall media input", bRef, bLoc, "the #media-upload contract");

console.log("\n########## (C) WhatsApp Configure dialog ##########");
const cRef = await phaseWhatsApp("ref", baseRef);
const cLoc = await phaseWhatsApp("loc", baseLoc);
rec("(C) whatsapp dialog", cRef, cLoc, "click behavior + recipe");
await ev("ref", `(() => { const b = [...document.querySelectorAll('[role=dialog] button')].find(x => x.textContent.trim() === 'Cancel'); if (b) b.click(); return 'ok'; })()`);
await settle(700);

console.log("\n########## (D) profile Social Accounts tab ##########");
const dRef = await phaseSocial("ref", baseRef);
const dLoc = await phaseSocial("loc", baseLoc);
rec("(D) social tab", dRef, dLoc, "the tab interior");

console.log("\n########## (E) profile Preferences tab + delete dialog ##########");
const eRef = await phasePrefs("ref", baseRef);
const eLoc = await phasePrefs("loc", baseLoc);
rec("(E) preferences tab", eRef.panel, eLoc.panel, "the tab interior");
rec("(E-d) delete dialog", eRef.del, eLoc.del, "the confirmation contract");

const passed = results.filter(r => r.match).length;
console.log(`\n=== r57 census: ${passed}/${results.length} MATCH ===`);
process.exit(0);
