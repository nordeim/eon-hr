#!/usr/bin/env node
// capture-r30.mjs — session-31 / parity round 30 screenshots:
// 98  = the round's evidence page (census + verdicts, rendered as HTML)
// 99/99b = the drawer border pair (REF vs LOC — the 1px #e5e5e5 right border)
// 100 = the chat page restored structure (natural card + centered MessageSquare)
// 101/101b = the legacy /assets page (desktop + mobile — the route that 404'd)
// + refresh the 02/11 standards (the regression signal).
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
function run(cmd) { try { return execSync(cmd, { stdio: "pipe", timeout: 60000 }).toString(); } catch (e) { return "ERR:" + String(e).slice(0, 200); } }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const SHOTS = "/home/z/my-project/eon-hr/docs/screenshots";

// ---------- 98: the evidence page ----------
const evidence = `<!doctype html>
<html><head><meta charset="utf-8"><title>Round 30 Evidence</title>
<style>
  body { font-family: ui-sans-serif, system-ui, sans-serif; background: #fafafa; color: #0a0a0a; margin: 0; padding: 40px; }
  .wrap { max-width: 980px; margin: 0 auto; }
  h1 { font-size: 28px; margin: 0 0 4px; }
  .sub { color: #64748b; margin: 0 0 28px; font-size: 14px; }
  h2 { font-size: 18px; margin: 28px 0 10px; }
  table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; font-size: 13px; }
  th { text-align: left; padding: 10px 14px; background: #f8fafc; color: #64748b; font-weight: 500; border-bottom: 1px solid #e2e8f0; }
  td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; }
  tr:last-child td { border-bottom: 0; }
  .pass { color: #16a34a; font-weight: 600; }
  .fix { color: #dc2626; font-weight: 600; }
  .info { color: #2563eb; font-weight: 600; }
  .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px 20px; margin: 12px 0; font-size: 13px; line-height: 1.7; }
  code { background: #f1f5f9; padding: 1px 6px; border-radius: 4px; font-size: 12px; }
</style></head><body><div class="wrap">
<h1>Parity Round 30 — the drawer border + chat structure + legacy /assets + swipe dimensions</h1>
<p class="sub">Session 31 evidence report · clone :3200 standalone vs https://eon.base44.app · computed-DOM ground truth</p>

<h2>Standing audits</h2>
<table>
<tr><th>Audit</th><th>Result</th><th>Evidence</th></tr>
<tr><td>Redeploy check (12 canonical routes, viewports pinned 1440×900)</td><td class="pass">12/12 MATCH</td><td>h1 text/font/x/y byte-identical — REF unchanged since round 29</td></tr>
<tr><td>Mobile navigation (user priority)</td><td class="pass">byte-identical</td><td>tabs x=10/79/139/204/313, kicker y=101 h=28 fs=18px fw=700, drawer overlay 390×844 rgba(0,0,0,0.8) z-50 — no Tailwind v4 bug</td></tr>
<tr><td>With-data re-check</td><td class="info">blocked</td><td>REF still renders zero data (0 rows on 4 surfaces)</td></tr>
<tr><td>Sidebar-internal census (the round-29 standing probe)</td><td class="pass">byte-identical</td><td>collapsed groups 141→621, expanded leaves 577→829, roots 865/905 — the fix holds; re-collapse leaves no residual margin</td></tr>
</table>

<h2>The round's census — four new probes</h2>
<table>
<tr><th>Surface</th><th>REF</th><th>Clone (before)</th><th>Clone (after)</th></tr>
<tr><td>drawer panel right border (mobile)</td><td>1px solid #e5e5e5 (rgb(229,229,229) — the default border color, NOT the sidebar's slate token)</td><td class="fix">no border</td><td class="pass">border-r — computed 1px rgb(229,229,229) byte-identical</td></tr>
<tr><td>/hrassistantchat left card</td><td>natural-height card: CardHeader (p-4, border-b, slate-200) + 14px/600 title + plain "No chats" line (y=302)</td><td class="fix">stretched full-column card + centered iconed EmptyState (H3 18px + extra copy)</td><td class="pass">REF's recipe — title y=257, line y=302, byte-identical</td></tr>
<tr><td>/hrassistantchat right pane (empty)</td><td>h-full card: centered 64px slate-300 MessageSquare (y=449) + single 16px slate-500 line (y=529)</td><td class="fix">EmptyState with H3 title + "Your HR assistant answers questions…" description</td><td class="pass">icon y=449 x=959, line y=529 x=863 — byte-identical, extra copy removed</td></tr>
<tr><td>/assets (the orphan route)</td><td>a full legacy page: flat36 always-row header, green→blue canvas, bg-slate-50 card band, Inbox empty state</td><td class="fix">404</td><td class="pass">full page replicated — kicker 40, h1 84, card 196, band 197/65, Inbox y=310, line y=390, all byte-identical (desktop + mobile)</td></tr>
<tr><td>bottom-tab active-state mapping (18 routes, mobile)</td><td>Home/Staff/Tasks/Attendance/Profile highlighting + kickers</td><td colspan="2" class="pass">identical on all 18 routes (verified non-gap — first full sweep)</td></tr>
</table>

<h2>The superset — the drawer swipe-to-close (R30-D)</h2>
<div class="card">
Touch handlers on the drawer panel: a horizontal-dominant leftward drag live-translates the panel; past the 96px
threshold the release closes (tailwindcss-animate's exit keyframes define only the <code>to</code> state, so the close
animation continues from the CURRENT inline transform — no snap-back); below it the panel springs back along the
drawer's own curve. Zero at-rest impact (no geometry change until a gesture starts). E2E-pinned via CDP
<code>Input.dispatchTouchEvent</code> (3 specs: the border, the threshold close, the sub-threshold spring-back with a
non-vacuous mid-gesture transform poll).
</div>

<h2>Live verification (all PASS)</h2>
<div class="card">
<b>Drawer border (R30-A)</b> — computed borderRightWidth 1px, color rgb(229,229,229), panel 288px on BOTH apps.
The desktop sidebar keeps its own slate-200 token (both apps) — REF's drawer and desktop sidebars use different
border colors, and so does the clone after the fix.
</div>
<div class="card">
<b>Chat page (R30-B)</b> — left card: title y=257 (14px/600 #0a0a0a), "No chats" y=302 x=297 (14px slate-500),
card natural height; right pane: MessageSquare 64×64 y=449 x=959, line y=529 x=863 — byte-identical; the extra
copy ("Start a new chat to ask a question." / "Your HR assistant answers questions…") removed. One 1px iteration:
the title's line box is text-sm's DEFAULT 20px (leading-[1.5]'s 21px pushed the body line to 303 vs REF's 302).
</div>
<div class="card">
<b>Legacy /assets (R30-C)</b> — desktop: kicker y=40 x=328, h1 y=84 (36px), subtitle y=136, Add Asset y=32 x=1274
w=134 (the always-row badge slot), card y=196 x=288, the bg-slate-50 band y=197 h=65, the leading-none 16px/600
title y=221 h=16, the 64px slate-300 Inbox y=310, "No assets yet" y=390 x=337 — byte-identical. Mobile (390×844):
h1 y=141, button y=89 x=240, card y=281 x=16 — byte-identical. The Add Asset dialog (Asset Name / Type incl.
Desktop + Tablet / Serial Number / Assign To Optional) round-trips through the shared /api/assets (the API enum
extended; the modern page's filter stays REF's contract).
</div>

<h2>Gates</h2>
<table>
<tr><th>Gate</th><th>Result</th></tr>
<tr><td>lint / typecheck</td><td class="pass">0 errors / clean</td></tr>
<tr><td>Unit (Vitest)</td><td class="pass">464/464 (+7 session-31 pins; the R25-A4 route count 46→47 — the legacy route joined)</td></tr>
<tr><td>Build (standalone)</td><td class="pass">passing</td></tr>
<tr><td>E2E (Playwright)</td><td class="pass">99/99 (+6: the chat empty-state contract, the legacy page contract + add-asset round-trip, the drawer border + threshold close + spring-back)</td></tr>
</table>

<h2>Probe-tooling lessons this round</h2>
<div class="card">
1. <b>Text-only DOM censuses miss icons.</b> REF's /assets empty state showed "No assets yet" with an 80px gap above
it — the gap was a 64px slate-300 Inbox icon + mb-4, invisible to a text-node census (the subtree's kids:2 was the
tell). Always read child COUNT + geometry, not just text.<br>
2. <b>CDP touch dispatches need animation settling + inter-phase frames.</b> A touch that lands during the drawer's
500ms enter animation targets the OVERLAY (the panel hasn't slid under the finger yet — the Content's sibling, so
the React handlers never see it), and back-to-back dispatches drop the touchMove (the round-26 separate-evals
lesson, touch edition). Wait out the animation + ~100ms between phases.<br>
3. <b>Radix's portal renders the overlay and the panel as SIBLINGS</b> — a "find the overlay's children" probe
returns nothing; locate the panel by its own geometry (fixed, w 200–340, h≥800, non-overlay bg).
</div>
</div></body></html>`;
writeFileSync(`${SHOTS}/r30-evidence.html`, evidence);
await run(`agent-browser --session loc open "file://${SHOTS}/r30-evidence.html"`);
await sleep(1200);
run(`agent-browser --session loc screenshot ${SHOTS}/98-drawer-chat-assets-swipe-evidence.png`);
console.log("98 captured (evidence page)");

// ---------- 99/99b: the drawer border pair (mobile) ----------
for (const [s, base, tag] of [["ref", "https://eon.base44.app", "99b"], ["loc", "http://127.0.0.1:3200", "99"]]) {
  run(`agent-browser --session ${s} set viewport 390 844`);
  run(`agent-browser --session ${s} open "${base}/dashboard"`);
  await sleep(3500);
  await run(`agent-browser --session ${s} eval "(() => { const b = [...document.querySelectorAll('button')].find(e => { const r = e.getBoundingClientRect(); return r.y < 100 && r.x < 60 && r.width > 20 && r.width < 60 && (e.querySelector('svg') || (e.textContent||'').trim() === ''); }); if (b) b.click(); return 'ok'; })()"`);
  await sleep(1400);
  run(`agent-browser --session ${s} screenshot ${SHOTS}/${tag}-drawer-border-${s}.png`);
  console.log(`${tag} captured (drawer border ${s})`);
}

// ---------- 100: the chat page restored structure ----------
run("agent-browser --session loc set viewport 1440 900");
await run(`agent-browser --session loc open "http://127.0.0.1:3200/hrassistantchat"`);
await sleep(3000);
run(`agent-browser --session loc screenshot ${SHOTS}/100-chat-empty-restored.png`);
console.log("100 captured (chat page)");

// ---------- 101/101b: the legacy /assets page ----------
await run(`agent-browser --session loc open "http://127.0.0.1:3200/assets"`);
await sleep(3000);
run(`agent-browser --session loc screenshot ${SHOTS}/101-legacy-assets.png`);
console.log("101 captured (legacy assets desktop)");
run("agent-browser --session loc set viewport 390 844");
await sleep(800);
await run(`agent-browser --session loc open "http://127.0.0.1:3200/assets"`);
await sleep(3000);
run(`agent-browser --session loc screenshot ${SHOTS}/101b-legacy-assets-mobile.png`);
console.log("101b captured (legacy assets mobile)");

// ---------- standards refresh ----------
run("agent-browser --session loc set viewport 1440 900");
await sleep(800);
await run(`agent-browser --session loc open "http://127.0.0.1:3200/dashboard"`);
await sleep(3200);
run(`agent-browser --session loc screenshot ${SHOTS}/02-dashboard-desktop.png`);
console.log("02 refreshed");
await run("agent-browser --session loc set viewport 390 844");
await sleep(800);
await run(`agent-browser --session loc open "http://127.0.0.1:3200/dashboard"`);
await sleep(3200);
run(`agent-browser --session loc screenshot ${SHOTS}/11-mobile-dashboard.png`);
console.log("11 refreshed");
