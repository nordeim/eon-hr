# Session 67 — the narrative journal (parity round 66: the dark-mode geometry/spacing re-census)

The matrix-completion round. Every prior census added an axis or a
theme; this one closed the last two open cells — and came back clean.
The first verification-only round in the project's history: zero fix
families, zero source changes, one real spec race retired.

## The arc

The round opened with the standing rebuild: fresh clone at `07fcfbf`
(the round-65 landing — R65's margin/gap census + its 36-screenshot
verification layer), the five core docs re-read, the session_136/137
journals + the remediation-plan-session66 completion record + the
worklog tail internalized. The frontier was explicit: the round-65
completion record's next cell — the DARK-mode re-census of the two
geometry axes (padding + radius, light-censused at r65; margin +
gap, light-censused at r66; theme-invariant by authoring, never
computed-verified in the dark cascade).

Two environment traps fired during the rebuild, both documented and
both resolved per protocol: the sandbox re-exports
`DATABASE_URL=file:/home/z/my-project/db/custom.db` on EVERY
invocation (the seed landed outside the repo until the in-invocation
unset went in), and the ladder's `AUTH_SECRET` grep expects the
QUOTED form (an unquoted secret greps empty; the instrumentation
gate refuses the boot — `.env` now follows the `.env.example` form).

The baseline gates ran green through the build; the E2E suite came
back 359/360 — the R37-C Add-Level width pin at 109.06 vs the
110–115 range. The flake-check (3× isolated) PASSED all three —
not the documented transient behavior. Root cause: the workflow
dialog's `zoom-in-95` open animation. `toBeVisible()` passes at
mount while the scale transition is in flight; the width read
measured the ANIMATION at 96.5% scale (113 × 0.965 = 109.05 — the
observed value to two decimals). The r66 lesson-5 family — a
count-without-wait race at r66, a MEASURE-without-settle race here.
The poll-until-stable read (two consecutive equal widths = settled)
retired it; green twice isolated, and the spec's comment now
documents the mechanism.

## The 30th login deploy

The round's deploy watch (armed at the post-29th finals
`q8Uif46n`/`CiCfCTzx`) detected THE 30TH LOGIN DEPLOY: login JS
`q8Uif46n`→`DwY57mhH` + CSS `CiCfCTzx`→`BpSyi-cD`, the app side
quiet. Per the standing protocol: fresh re-auth of the shared REF
session (the stale-session lesson), then the full confirmation
ladder — standing 5/5, sweep 12/12, verify-r49 13/13, verify-r45
13/13. NON-VISUAL. The watch finals are the post-30th hashes.

## The censuses

The instruments (`r67-dark-geometry-census.mjs` +
`r67-dark-margin-census.mjs`) re-read the r65/r66 populations in the
DARK cascade — the same READs, the same normalizations (the radius
'full' >=9999 collapse; the space-y mark-II parent-parse), armed via
`localStorage darkMode="true"` + the boot script's pre-paint class.
One instrument subtlety surfaced in the sanity prints: setting the
key does not toggle the CURRENT page (the boot script applies the
class on LOAD; only the Moon handler toggles live) — the census's
route-opens all navigate, so every read is correctly dark, and the
post-navigation body background (`rgb(10,10,10)`) is the honest
dark-verification read.

The results: dark geometry **44/49**, dark margin/gap **45/49** —
every DIFF one of the standing documented allowances, and the
onboardingtemplates geometry DIFF is the r36 `<a>` superset in its
purest form (identical `8,16,8,16|r:8` tuple, only the tag differs).

The strong evidence is the byte-proof: the DIFF routes re-read in
LIGHT vs DARK produce **byte-identical census tuples on both axes**
(the 5-route geometry re-read + the 4-route margin re-read, diffed
file-vs-file — zero differences). The theme-invariance is proven
PER ROUTE, not just per axis. The r64 zero-fix lesson demanded this:
an all-allowance census alone is weak evidence; the byte-diff is the
strong form.

The one process defect the byte-proof exposed: the per-batch DIFF
dump OVERWRITES by default (the r62 mid-batch protocol saves each
batch's DIFFs; a later batch re-run clobbers the file) — re-run the
DIFF routes as their own batch before diffing across reads.

## The contract locked

`tests/e2e/session67-dark-geometry.spec.ts` — 6 computed-truth pins,
green on the first run: the boot-script dark contract (including the
/login theme-inert R39-B split), the dark StatCard padded/tileFixed
twins, the dark scroll band, the dark svg-authored empty-state
margins, the dark employees grid + alwaysRow, the dark tenantsetup
circle + ml-auto. A future `dark:` geometry/spacing member (or any
cascade change that moves a value under html.dark) trips this gate.
Zero unit pins — zero source changes; a verification round's
regression protection is the E2E block.

## The standing checks

The mobile-menu functional cycle (the standing user emphasis):
toggle → the drawer opens with the nav links; the Training LMS link
navigates to /training; Escape closes the re-opened drawer. The
byte-stability pair: the 418 LIGHT mobile drawer pair @390×844
BYTE-MATCHES the r66 402 pair on both sides — three-round
byte-stability of the standing mobile surface. The DARK mobile
drawer pair (420/421) joins the evidence set as the dark-surface
twin.

## The state of the matrix

THE COMPUTED-STYLE MATRIX IS COMPLETE: color (fill/text/border) ×
light/dark, geometry (padding + radius) × light/dark, spacing
(margin + gap) × light/dark. Sixty-six rounds of census work, ten
census families, every axis of the clone's computed rendering
verified against the live reference in both themes — every standing
DIFF a documented allowance with byte-stable evidence. The frontier
now: the optional muted-foreground/--primary token re-map; the
deploy watch armed at the post-30th finals; the Next.js 16.4.0
history bug (the one recorded functional divergence) whose fix
lives upstream.
