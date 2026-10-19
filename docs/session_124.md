# Session 124 (2026-10-19) — parity round 60: the dark-mode text-color census

> The r59 census closed the badge/chip fills (light), the r60 the union
> fill read (dark). This round's census extended past fills entirely:
> **the computed `color` of every text-bearing NON-button element**
> (h1–h6, text leaves, non-button svg icons) + input/textarea
> `::placeholder` colors, all 49 routes, paired live in **dark mode**
> (the shared `localStorage darkMode="true"` contract), the recorded
> r59/r60 blind spot ("the prior censuses never read button TEXT
> colors") finally closed. Pre-fix: **23/49 MATCH**. Post-fix:
> **40/49** — the nine remaining DIFFs all documented (the profile
> role badge + a hidden-kicker-icon census artifact, the
> interviewassistant r48-C1 superset card, four data-driven leaves, the
> onboardingtemplates 404 icon, the attendance admin superset).
> Comparison: the deduped **(tag|color) set** — text-agnostic so the
> seeded-LOC vs zero-data-REF populations don't generate noise; every
> DIFF then decomposed element-level with classes + both-theme
> verification (seven probe scripts).

## What the round delivered

- **The census instrument**: `scripts/r61-textcolor-census.mjs` (+ the
  recon + 7 probe scripts) — the text-color read with the r60 lessons
  applied (single-quoted password fills, mid-run re-auths, login-page
  detection, content waits).
- **R61-A — the four unpinned shades**: the census's `lab()`
  serializations exposed orange-500/700/900 + purple-500 drifting
  oklch (r59 pinned sixteen, r60 four more — these four remained).
  Pinned to the REF-measured v3 sRGB values; **green-400** joined when
  R61-D's fix made it active on the clone (its own drift exposed).
- **R61-B/V — the authored-slate-400 search icons**: REF authors
  `text-slate-400` (unflipping, rgb(148,163,184) both themes) on its
  search/filter icons; the clone rode the flipping muted-foreground
  token (light slate-500, dark neutral-400). Seven call sites
  converted (payroll, chat ×2, documenttracker, assetmanagement,
  recruitmentkanban, recruitment — the last also Users→Filter;
  lucide-react's Filter renders class `lucide-funnel`, the r58
  library-version family).
- **R61-C — the compliance severity chips are NOT the mini-centered
  recipe**: REF (live-measured BOTH themes) renders per-severity card
  borders (`border-{red,orange,yellow,blue}-200`) + **DIV** values
  (`text-3xl font-bold mb-1 text-*-700`, unflipping) + **DIV** labels
  (`text-xs text-slate-500`) — the clone's shared StatCard rendered P
  values in slate-900 with slate-600 labels. Hand-rolled; the
  mini-centered StatCard stays for hrreports/npref (REF renders P
  there — a different recipe, verified).
- **R61-D — the compliance at-risk icons**: the row icon
  FileWarning→TriangleAlert; the empty state FileWarning-64px→the
  **48px green-400 CircleCheckBig** (`w-12 h-12 mx-auto mb-3`).
- **R61-E/F — the evaluations tiles + the lost mt-6**: the four
  value-in-tile spans carry per-tile colors (slate-700 / green-700 /
  orange-700 / slate-500 — the r11 pin generalized the single-tile
  slate-700; the StatCard span now honors `valueClassName`), and the
  r11 `mt-6` on the TabsContent — present in the recipe comment, gone
  from the code — restored (the tab→stats gap re-measured REF 24px vs
  clone 8px; everything below the strip sat 16px high).
- **R61-G — the securitysettings recommendations**: REF renders five
  **blue Shield** glyphs (`w-5 h-5 text-blue-600 flex-shrink-0`); the
  clone reused the r48-C2 check glyph (a feature-row generalization,
  re-measured and corrected).
- **R61-H/I — the chat header family**: the "Messages" h2 authors
  slate-900 (unflipping — the clone's `text-foreground` flipped to
  #fafafa in dark) + the search wrapper is BARE `relative` (the
  `px-4 pb-4` inflated it to 52px, centering the icon 8px below the
  input; the padding moved to the row container, `left-7`→`left-3`).
- **R61-J/K — the payroll + payrollai cards**: the payroll empty-state
  icon is the DollarSign (the EmptyState default Inbox replaced — the
  loans page already did this via the icon prop); the payrollai
  suggestions card gains its CardHeader (CardTitle "AI Suggestions") +
  `p-6` content + the `text-center py-12` inner wrapper — all
  REF-measured class strings.
- **R61-L/M/N — the invented-copy retirements**: the interviewassistant
  standard "Select candidate" placeholder + the "Add candidates in
  Recruitment first" hint retired (the AI Analysis card stays — the
  r48-C1 documented superset); the hrassistant zero-message pane
  renders NOTHING (the r47-E5 sparkles superseded by the re-measure);
  the hrassistantchat "No chats" line carries REF's exact
  `text-sm text-slate-500 p-4 text-center`.
- **R61-O — the profile kicker subtitle**: REF renders slate-400
  (rgb(148,163,184) — live-measured via the hidden-kicker read; the
  other kickers stay slate-500 — a per-page REF variance). The
  PageHeader gained the `mobileKickerSubtitleClassName` escape hatch.
- **R61-P/Q/R — the chart legends**: the surveyanalytics legend
  (Responses **blue-500** #3b82f6 + the "Avg Sentiment %" name + the
  DOM order [Responses, Avg Sentiment %] via the DefaultLegendContent
  reorder — **recharts 3's auto order ignores BOTH the Bar mount
  order and the YAxis declaration order**, measured both); the
  analytics + advancedanalytics Legends removed (REF ships none).
- **R61-S/T/U/W — the icon shapes + the red**: workflowautomation
  Sparkles→Zap, compliance ShieldCheck→Shield, performancemanagement
  Target×3+Star→Target+CircleCheckBig+CircleAlert+Award, the
  attendance restricted-card ShieldAlert red-600→red-500.
- **R61-X (the post-fix census catch)** — the requestreports header
  row: REF's `<tr>` carries `border-b text-left text-slate-500` (the
  ths inherit the unflipping slate-500); the clone's bare tr left them
  on the flipping foreground token. Found by the post-fix census
  re-run (decomposed in probe2 but dropped from the first plan draft —
  the re-run caught it).
- **The purge FK-walk fix**: a leaked R58-22 fixture row made every
  subsequent global-setup purge **die silently at the employee sweep**
  (P2003 — global-setup swallows purge errors as non-fatal), leaving
  stale rows to poison `findFirst`-based assertions. The purge now
  walks the FKs first (fixture rows, then the employee sweep, then the
  non-cascade user dependents — the r60 lesson applied).

## The round's instrument lessons

1. **The manual-:3100-server trap**: an in-memory login rate limiter
   (LIMIT 10/15min, per-IP "local" for every test) accumulated across
   my debug logins + reused-port playwright runs → mid-suite 403
   lockouts. Always kill manual servers before `test:e2e` (playwright
   reuses an occupied port).
2. **The purge P2003 chain**: a silently-failing purge is worse than
   no purge — the leftovers compound and poison later assertions.
3. **The census's missing w:0 filter**: hidden kicker/sr-only svgs
   pollute the tag|color sets (the profile's back-icon rendered via
   `asChild` is an `<a>`, not a button — `closest('button')` didn't
   exclude it). The r60 width lesson applies to the text-color read.
4. **REF's transient refresh-cw**: a blue-600 loading icon appears
   only mid-fetch (y:-52) — settled re-reads don't show it.
5. **The recharts-3 legend order**: neither the Bar mount order nor
   the YAxis declaration order drives it — the explicit
   DefaultLegendContent reorder is the deterministic path (the
   `payload` prop is omitted from the recharts-3 public types).

## Gates

lint 0/0 · tsc ✓ · **858/858 unit** (+24: 23 RED-first R61 pins + the
R61-X addendum; the R22-D/R30-B1/R35-C2/R48-C2/R48-C6/R17-B legacy
pins amended to the re-measured truths) · build ✓ · **314/314 E2E**
(+18, `tests/e2e/session61-textcolor.spec.ts` — no flakes in the final
run; the session-58 switch/checkbox documented flake fired once
mid-verification, 11/11 green in isolation per the flake-check) ·
post-fix census **40/49** · DB pristine 1/1/2 · 18 hash-verified
screenshots → 476 files.

Pushed at `ea60643` (the code batch, verified on remote main) + the
docs layer.
