# Session 78 — eon-hr parity round 38 (the login redeploy re-audit)

*REF redeployed its login page (the static JS chunk changed, everything
else held). The re-audit — the login probed at mobile for the first
time in 37 rounds — found an entire responsive dimension the
desktop-only audits could never see: 44px/16px inputs, a stacked links
row, an invisible spacer that scrolls the page, a zinc-vs-neutral
palette split between REF's two CSS builds, and a logo glow.*

## The opening state

**REDEPLOY DETECTED — login-JS-only**: REF's /login static build
changed (`static/index-CneaUv24.js` → `static/index-BYE5Ojxh.js`) while
the login CSS (`index-D0Q6-tUz.css`), the app JS (`index-C-IrDy5f.js`)
and the app CSS (`index-BGNH4KkS.css`) all held → every app-level pin
stands; the login page became the round's frontier. REF remains
zero-data (the with-data frontier stays blocked). Standing audits green
(5/5): the mobile tabs, the drawer (288px @ x=0, #FAFAFA, 1px #e5e5e5 —
after the documented x=-261 toggle-race artifact), the navmap, the bell,
the Quick Actions. **Mobile navigation fully green — no Tailwind v4 bug.**

The login keyboard dimension (round 37's named remainder) audited and
GREEN: the Tab walk and the Shift+Tab walk are structurally identical
on both apps; the only T9 divergence is REF's builder badge (the
documented non-clone); no hover motion on the social buttons (REF's
transition-transform wrapper is inert — verified).

## The census — the full login surface, desktop + (first time) mobile

The desktop geometry was already byte-identical (H1 y=205 h=36, social
buttons y=309/375/441, inputs y=589/683, Sign in y=751 — every rect).
The findings were all recipe, mobile-viewport, or DOM-structure diffs —
thirteen families (R38-A through R38-M; see
docs/remediation-plan-session39.md for the measured evidence). The
headlines:

- **The responsive family**: REF's login inputs are `h-11 sm:h-12`
  (44px mobile) with `text-base md:text-sm` (16px mobile); the Sign in
  button too. The clone's flat h-12/text-sm rendered 48px/14px at
  390×844.
- **The links row**: `flex flex-col sm:flex-row` — REF STACKS the two
  links at mobile. The clone's flat row made the two buttons'
  intrinsic widths (118+176) exactly fill the 294px row → flex-shrink →
  both labels wrapped to two lines (h=40 buttons). The round's most
  visible mobile find.
- **The two-build palette**: REF's login inputs compute zinc-950
  rgb(9,9,11) — the login static build's --card-foreground is the ZINC
  palette; the app build's is neutral-950. The clone's login card now
  pins `text-[#09090b]` literally (the first attempt put it on the root
  main — the card's own text-card-foreground beat the inheritance; the
  E2E caught it).
- **The invisible members**: the sm:hidden `&nbsp;` spacer below the
  card (pins the card to y=16 + scrolls the mobile page 18px), the
  blur-xl logo glow (opacity-30→40 on hover), the placeholder
  slate-600 (vs the base's muted slate-500), the continuous-line
  or-divider with its white chip.
- **The per-button wrapper**: REF's `-ml-4` icon pull applies ONLY to
  the Google button (measured: Google div x=84.8 ml=-16;
  Microsoft/Apple x=84.6/98.2 without) — a uniform pull mis-places
  Microsoft by 8px through the negative-margin flexbox math.

## The pixel-diff forensics (the addendum)

The mobile pairs diffed 4.33% vs the ~1.1–1.6% baseline after the
probe-verified fixes — the band trace found two more families: the
Microsoft icon's viewBox (23 vs 24 — a ~4% scale drift) and a completely
different Apple glyph (the clone's alternate vs REF's classic two-path
logo). Both replaced with REF's exact paths, and the uniform -ml-4
corrected to the per-button contract. After: desktop **0.84%** (below
baseline), mobile **3.27%** — the remainder is REF's fixed "Edit with
Base 44" builder badge (the documented non-clone; the VLM crop shows it
as the only difference) plus sub-1% font-AA bands.

## The environment lessons (recorded for every future round)

1. **The stale-:3200-server trap**: after `bun run build`, a
   still-running standalone server keeps serving the OLD manifest's
   chunk hashes — the rebuilt CSS 500s ("Internal Server Error" as the
   body, 21 bytes) and the page renders FULLY UNSTYLED while the HTML
   liveness check passes. The round opened with a false "unstyled login
   page" investigation. Kill the :3200 process after every rebuild.
2. The multi-line eval trap re-confirmed (flatten + quote-strip parse);
   the comments-in-source regex inflation (reword the comment, don't
   recalibrate the count); the desktop login never scrolls (close-ups
   need a smaller viewport, not a scroll).

## Gates and delivery

TDD: 16 RED pins → GREEN (598/598 unit, +16; three earlier pins amended
for the new markup — R18-E/R19-H moved their Sign in anchor to
`disabled={loading}` since the social buttons are now type=submit, the
E2E img-role name became "Eon HR logo"). E2E +2 (the desktop recipe
spec, the mobile responsive spec — 167/167). lint 0/0 · tsc ✓ · build ✓.

Live verification: the desktop pair MATCH on every measured value (the
four documented non-gaps aside: the autocomplete superset, the lab/rgba
serialization, the 0px-border token color, the builder badge); the
mobile pair **byte-identical** — email y=516 h=44 font 16px, card y=16
h=782, scrollHeight 862, icon x 85/85/98, links y=718/746 h=20. The
standing audits 5/5. 8 screenshots (144-147) → 196 PNG captures. DB
pristine (users=1, employees=1, zero mutations). `.env.example`
re-verified.

Docs: AGENTS session-39 layer, SKILL 3.22.0 + §51, PAD [S39],
CLAUDE/README counts, this retrospective, the plan's addendum +
completion record, the worklog.

**Suggested next frontiers**: the with-data surfaces (still blocked on
REF's zero-data state); REF's next redeploy (watch the login chunk —
this round proved they do ship login-only changes); the login page's
dark-mode state (never probed); the remaining never-probed-viewport
surfaces (the tenant-setup wizard at mobile, the careers hero at
mobile); the toaster interior (unfireable on zero-data REF).
