# Session 36 — Parity Round 21: The motion dimension (transitions/animations)

Continuing the parity cycle after round 20 (`928d4a2` + session log
`2864b51`). The owner's brief pointed at session_34/35 +
remediation-plan-session21; session_34's suggested next steps were: re-run
the redeploy check, the with-data story (still blocked on REF's zero-data
state), reduced-motion, and "a possible scroll/animation dimension —
transitions/animations were never swept systematically". All executed.

Workspace RESET (fresh clone at `2864b51`): `.env` recreated
(`DATABASE_URL="file:../db/custom.db"` + fresh AUTH_SECRET), `bun install`,
`db:push` + `db:seed` (pristine users=1, employees=1, balances=2,
payroll=0, expenses=0); the shell `DATABASE_URL` trap guarded with
`env -u DATABASE_URL` on every DB/build command.

**Baseline gates: lint 0/0 · tsc ✓ · 391/391 unit · build ✓ · 86/86 E2E**
— the `2864b51` push state exactly.

Skills consulted (repo `skills/`): tdd (red→green vertical slices),
agent-browser (dual-session probing, frame-sampling), clone-app-pat-pro
(computed styles as ground truth), tailwind-patterns (v4 CSS-first rules
and the @utility directive).

**Redeploy check PASSED** — 12 probe routes byte-identical (h1
text/font/x/y; the four h1 width deltas are the documented REF-overflow
family). REF unchanged since round 20. **Mobile navigation audit PASSED
byte-identical** (top bar 390×73, tabs 10/79/139/204/313, drawer
288×844 #FAFAFA z-50, kickers 53/69, md boundary 767/800 — no Tailwind v4
bug). **With-data re-check**: REF still renders zero data — the frontier
stays blocked (documented).

**The round's core — the FIRST transitions/animations audit** (static
CSSOM enumeration + DOM classList audit + requestAnimationFrame
frame-sampling):

- **Static map**: REF = 26 keyframes / 25 animation rules / 27 transition
  rules; LOC = 4 keyframes (v4 defaults) / **0 animation rules** / 17
  transition rules (v4 var-based, resolving to the same 150ms defaults).
- **Engine discovery (the dead plugin-utility trap)**: the clone's shadcn
  dialog/dropdown components carry the exact tailwindcss-animate classes
  REF uses (`data-[state=open]:animate-in` + `fade-in-0` + `zoom-in-95` →
  REF computed `animation: enter 0.15s ease` — measured on the user menu,
  the loans dialog, the attendance select) — but v4 generates NO CSS for
  plugin utilities. The select content and the sidebar user dropdown
  omitted the classes entirely.
- **Engine discovery (the mount-fresh Radix trap)**: the clone's mobile
  drawer popped open with NO animation — Radix Portal mounts the Content
  fresh with data-state=open already set, and a transition needs a state
  change on a live element. REF's vaul drawer slides 500ms open
  (cubic-bezier(0.32,0.72,0,1)) / ~300ms close, overlay fades ~150ms
  (frame-sampled on both apps).
- **Timing difference**: REF's group buttons carry `transition-all
  duration-200` (hover settles ~269ms); the clone's had `transition-colors`
  (150ms, settles ~229ms). REF's chevron snaps (no motion classes,
  computed `all 0s`); the clone's 200ms swing was an extra.
- **Dormant REF CSS documented**: sidebar collapse family (3 ease-linear
  divs, no trigger ≥768), accordion-down/up + data-motion rules (REF's
  group expand is INSTANT — 728→516 in one frame), base44-fade-in/
  scale-in (no navigation animations fire), badge-spin,
  prefers-reduced-motion (REF's only rule is sonner-library internal — the
  a11y item stays open on both apps).

`docs/remediation-plan-session22.md` written (5 groups + engine
discoveries + non-goals) and codebase-validated before execution.

**TDD**: 7 new pins (recipes.test.ts session-22 block — the trigger
recipe, the chevron negative pin, the globals.css @utility subset, the
select + user-dropdown recipes, the drawer slide utilities + timings, the
toast enter). Mid-flight pin corrections (the r19/r20 lesson): slice
windows 400/700→700/950 for the longer class strings, and the dropdown
pin asserted a contiguous `fade-in-0 zoom-in-95` pair while the authored
shadcn order interleaves closed/open variants — re-pinned to the
interleaved form.

**Gates: lint 0/0 · tsc ✓ · 398/398 unit (+7) · build ✓ · 86/86 E2E**
(the built CSS now carries the enter/exit keyframes + the full @utility
subset — animate-in through slide-in-from-bottom-2 — and the arbitrary
animation-duration/timing-function properties, verified by grep).

**Live dual-browser verification**: drawer open slides -283→0 over ~500ms
+ overlay fade 0→1 (~150ms) — byte-matching REF's sampled curve; drawer
close (via Escape — the overlay ignores synthetic .click()) slides
0→-288 over ~305ms + fade ~170ms, unmount at ~340ms (Radix waits for
animationend); the user dropdown animates `enter 0.15s` with opacity
0.58→1 + scale 0.979→1 mid-flight; the select content animates `enter
0.15s`; the group hover fade (polyfill v2) settles ~272ms vs REF ~269ms;
the chevron computes `all 0s` (instant). Post-fix regressions: canonical
12-route sweep 12/12 MATCH + mobile chrome byte-identical + the standing
pressed/hover verification 7/7 MATCH (group pressed zinc-100,
expanded-group hover, leaf/sub-item/active-leaf pressed, bell pressed,
active bottom tab pill). One mid-sweep LOC session death (the documented
Secure-cookie flake) — re-authed, re-ran clean.

**5 screenshots** (3 motion evidence — 71-mobile-drawer-open-slide,
72-user-dropdown-animated-open, 73-select-animated-open; 2 standards
refreshed: 02-dashboard, 11-mobile-dashboard) → **88 total**. VLM
spot-checks confirmed the open drawer over the dark overlay with the full
nav + footer and the rendered dropdown (Admin label + My Profile + red
Logout, clean border/shadow).

Documentation updated: AGENTS session-22 layer + 398 specs; SKILL v3.5.0
+ §34 + counts (recipes 261); PAD [S22] row + test table + Last Updated;
CLAUDE 484-spec pyramid + session-22 pins; README 398 specs + 88 captures
+ the motion-parity feature row; this session log; worklog;
remediation-plan completion record.

## Session complete — parity round 21 pushed to `nordeim/eon-hr@main`

**Audit**: redeploy check (REF unchanged), mobile navigation verified
byte-identical (no Tailwind v4 bug), with-data re-check (still blocked),
and the FIRST motion audit — the transitions/animations map of both apps
with empirical frame-sampling, plus two engine discoveries (the dead
plugin-utility trap; the mount-fresh Radix trap).

**Fixes**: the enter/exit animation family (globals.css @utility subset —
dropdowns/dialogs/selects now fade+zoom at 150ms like REF), the mobile
drawer slide (500ms/300ms with the vaul bezier + 150ms overlay fade — the
round's visible mobile gap), the group trigger 200ms transition, the
chevron instant snap, and the toast fade+slide enter (superset polish).

**Gates**: lint 0/0 · tsc ✓ · **398/398 unit** · build ✓ · **86/86 E2E**
· 5 screenshots · DB pristine.

**Suggested next steps**: re-run the redeploy check next round; the
interaction map now covers focus + hover + pressed + motion; remaining
frontier — the with-data story (re-check whether the reference gains
data), the checkbox focus recipe (still no measurable REF surface), a
possible scroll dimension (sticky behaviors and scroll-away kickers are
pinned, but scroll-driven effects were never swept), and the reduced-motion
a11y item (open on both apps).
