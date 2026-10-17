# Session 101 (2026-10-17) — parity round 49: the never-deep-measured interiors

> The round-48 frontier's remaining vein: the ~15 routes whose INTERIORS
> never got a deep read — including payrollmodule, the page whose evals
> timed out in every prior census (solved this round with an 11s settle).
> Every contract below is live-measured this window (REF @1440×900 vs
> zero-tenant LOC :3201, `scripts/r50-eval.txt`).

## What the round delivered

- **The glyph family** (the census's core finding — the never-measured
  interiors hid wrong lucide glyphs on seven pages):
  - payrollmodule's Generate All: Wand2 → REF's `calculator w-4 h-4 mr-2`
  - payrollengine's Generate Payroll: Cog → `calculator`
  - surveyanalytics' Run AI Analysis: Sparkles → `brain`
  - notificationpreferences: Mark All Read CheckCheck → `check mr-1`;
    the switch rows' whole set corrected to REF's mail / bell / check /
    bell / smartphone / bell (all `w-4 h-4 text-slate-600` — the clone
    had CheckCircle2/UserPlus/XCircle/Megaphone/Info); the Recent
    zero state FileText → `bell w-8 h-8 mx-auto mb-2 opacity-30`
  - employeeportal's zero card: the 64px rounded-full chip +
    ClipboardList → REF's `briefcase w-8 h-8 text-blue-600` DIRECT
    (inline, centered by the p-8 text-center) + H2 mb-2 + the mt-less P
  - shiftswap: the badge CalendarDays → `arrow-left-right`
    (text-violet-600); the zero-state ArrowLeft → `arrow-left-right
    w-12 h-12 mx-auto mb-3 text-slate-300`
- **shiftswap's structures**: the stat cards gained REF's INLINE icon
  family (users blue-600 / clock yellow-600 / calendar orange-600 /
  circle-check-big green-600, `w-5 h-5`) on the PLAIN Card (the
  border-slate-200 shadow-sm pass retired); the pills h-9 → py-2 +
  hover:bg-slate-100 → slate-50; the empty card → p-12 text-center with
  the glyph direct + the mt-less slate-500 line.
- **staffrequests' RADIX TABS form**: the hand-rolled aria-pressed chip
  + mt-2 Card wrapper → TabsList + a single TabsTrigger (the Radix
  data-[state=active] variants) + TabsContent mt-2 carrying the zero
  state DIRECT (no Card; the CTA's mt-4 rides the button itself). The
  scope toggle (the mine/all superset filter) rides the trigger's
  onClick; the with-data Table stays the clone's superset in its own
  Card. The search icon's muted token + the file-text's slate-400 →
  REF's slate-400/slate-300 literals.
- **The table/search forms**: payrollmodule's search icon dropped
  pointer-events-none for REF's slate-400 literal; the SHARED Table
  wrapper's inert `w-full` retired (REF: bare `overflow-x-auto` — the
  r11 contract finally literal). payrollengine's two flat cards gained
  REF's `shadow-sm`. requestsettings: plain cards + `p-6 space-y-4`
  interiors + slate-500 subtitles + mr-1 Plus glyphs. hrletters'
  CardTitle keeps the leading-none pass (the base's text-base is the
  documented inert member — both 16px — the byte-parity backlog pair,
  now live-measured).
- **The verified-matching routes** (spec-pinned): payrollmodule's
  dollar-sign stat family + bare th + `Payslips — October 2026`
  CardTitle; surveyanalytics' icon-stat family; surveys' DIV/DIV stats +
  "0%" tight text (the outline's "0 %" was the reader's text-node-join
  artifact); payrollai end-to-end; the careers/externaljobapplication
  heroes; the R31-B1 alias pins + the ess superset hold.

## Gates

lint 0/0 · tsc ✓ · **789/789 unit** (+18: A1-A8, B1-B8 + B4b/B4c; 5
amended predecessors — the R12-F trigger, the R13-A icon pins, the
R14-D pill wrapper, the R15-E pill surface) · build ✓ · **252/252 E2E**
(+10 — the session-50 deep-interiors spec) · **verify-r49 13/13 pairs
MATCH** (member-set + COMPUTED-STYLE normalized — see below) · standing
audits 5/5 · route sweep 12/12 · **verify-r45 13/13 ×2** (the 16TH
login deploy `DCDf2KCA`→`BBQoN-vG` mid-round + a 17TH
`BBQoN-vG`→`DJGK9Qoy` at round end — the login surface visually quiet
through both) · DB pristine (the verify-r45 loading-probe user swept
AGAIN — the known per-window trap) · `.env.example` verified.

## The round's instrument upgrade — computed-style ground truth

verify-r49's svg reads now carry **computed geometry** (`16x16/rgb(...)`
via getComputedStyle) alongside the class members: the class-core
compares member-sets (sizes/colors stripped) and the computed pair
verifies the ACTUAL rendering. This subsumes the guard-size translation
family wholesale (a guard-sized `[&_svg]:size-4` icon and REF's explicit
`w-4 h-4` both read `16x16`) and catches REAL color drift that class
compares miss. The round's documented computed pairs: `#fafafa ≡ #fff`
on the CTA text (REF's per-button inconsistency — the session-4
measurement had #FAFAFA on the taskmanager CTA; surveyanalytics/npref
render #fff), the lab() serialization on yellow-600
(`lab(62.7799 22.4197 86.1544)` IS `rgb(202,138,4)` — the same color
through the oklch path), and the recharts mount order (the surfaces'
DOM order varies with chart mount — layout-fixed, render-neutral).

## The round's tooling lessons

- **The SVG className trap**: `el.className` on SVG elements is an
  SVGAnimatedString (`.replace` throws) — every reader must go through
  `getAttribute('class')`. The r47 lesson re-learned the hard way
  (seven census routes errored before the fix).
- **The childNodes phantom-space artifact**: React SSR inserts
  `<!-- -->` separators between adjacent text children; a childNodes
  walk shows them as `" "` entries, so "My Requests ( 0 )" is what the
  WALK sees while textContent is tight "My Requests (0)". Verified with
  a raw playwright probe before dismissing the "text diff" — the r47
  phantom-space lesson, now with the mechanism identified.
- **The wrapper's default remote**: `ssh_git_wrapper_v3.py`'s
  DEFAULT_REMOTE is the task-management repo — the eon-hr push needs
  the explicit `--remote git@github.com:nordeim/eon-hr.git` (a dry-run
  against the default fails non-fast-forward against an unrelated
  history — not a real divergence).
- **The orchestrator cap**: the outer run() must exceed verify-r45's
  FULL runtime (a 120s cap ETIMEDOUT the whole audit and lost the
  buffered output; 600s is comfortable).
- The push protocol held: code committed + pushed at the FIRST green
  stack (`7c363b5`), the verify/screenshots/docs after — no repeat of
  the round-48 loss.

## Frontier after this round

Every app route now has a deep-measured interior (the r45-r49 arc:
zero-states → rootmaps → heroes → C-pages → this round's census). The
login build stays under ACTIVE development (17 deploys — the watch
stays armed); the remaining byte-parity backlog (the CardTitle
text-base/leading-none per-page forms, the badge-span leading-5 no-op,
REF's #fafafa/#fff CTA-text inconsistency, the chart line-count
parity); the with-data superset surfaces (payrollmodule's existing
records, staffrequests' table, the payrollreports tax/history/custom
panels) stay REF-unmeasurable at the shared demo's zero state.
