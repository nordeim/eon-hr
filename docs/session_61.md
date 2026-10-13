# Session 33 — Parity Round 32: The Dark Theme + RTL + Swipe-to-Open

**Status: COMPLETE — all 15 steps executed.**

**Scope**: the footer-controls census (Moon / عربي) — a dimension no
prior round had audited — plus the round-30 frontier's swipe-to-open.

## What the census found

1. **REF's Moon is a real theme controller.** `html.dark` +
   `localStorage darkMode="true"`, persisted across reloads; body flips
   to rgb(10,10,10), cards to #0a0a0a + #262626 borders. The
   authoritative `.dark` block was extracted verbatim from REF's live
   stylesheet: the stock shadcn **neutral** palette. The clone's Moon
   toggled `.dark` with zero dark styles authored — a display-only stub.
2. **REF's عربي is a real RTL toggle.** `dir=rtl` +
   `localStorage app_lang="ar"`; the whole layout mirrors (desktop
   sidebar x=1184, mobile hamburger x=338, bottom tabs mirrored), the
   strings stay English (i18n not wired), the drawer stays
   left-anchored, and the button flips to "EN" with an Arabic title.
   The clone's عربي flipped its label only.
3. **A 31-round-invisible light find.** REF's desktop aside is authored
   `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800`
   — it renders rgb(255,255,255) in light while the clone's `bg-sidebar`
   rendered #fafafa. Every prior audit compared sidebar geometry
   (navmap) or the mobile drawer (the `--sidebar` token = #fafafa on
   both apps) — never the desktop aside's computed background.

## The delivery

- **R32-A the dark theme**: globals.css restructured to the shadcn
  runtime-var pattern (`:root` light pins verbatim + `.dark` REF's
  extracted palette + `@theme inline` var() indirection); the body
  follows `var(--background)`; the canvas/aside/mobile-chrome/tabs/
  brand/moon/button-dark-variant dark classes per the live
  measurements; the pre-paint THEME_BOOT script in layout.tsx (no
  FOUC, reload-persistent); Moon persistence via localStorage; the
  class-driven Moon↔Sun swap; `--color-primary` deliberately NOT
  flipped (REF's active-nav blue survives dark — measured #1877F2);
  checkbox/avatar/chat dark readability supersets (light untouched).
- **R32-B the RTL superset**: the عربي dir flip + app_lang persistence
  + the Arabic title string; the layout mirrors via dir=rtl for free.
- **R32-C the swipe-to-open superset**: a rightward horizontal-dominant
  edge touch (32px window, ≥24px travel) opens the drawer — the R30-D
  interaction-state pattern.
- **R32-D the stale baseline pin**: R31-C6 pinned to the raw `<h1>`
  round-31 actually shipped (the pushed HEAD carried 479/480 — the
  final unit re-run had been skipped).

**The new v4 trap**: `dark:` defaults to the prefers-color-scheme
media query in v4 — the class strategy must be declared
(`@custom-variant dark (&:where(.dark, .dark *))`), or every dark:
utility compiles to a media query that never fires under html.dark.

## Verification

- Gates: lint 0/0 · tsc ✓ · **493/493 unit (+13)** · build ✓ ·
  **133/133 E2E (+12** — the dark-mode spec's 8 + the swipe-to-open
  quartet**)**.
- Live dual-browser: the dark sweep byte-identical (body/canvas/card/
  sidebar/tabs on /dashboard + /employees + /settings; the dark drawer
  rgb(24,24,27) + #262626 on both apps); the RTL mirror (sidebar
  x=1184, h1 x=623); the light regressions 12/12 redeploy MATCH +
  mobile chrome + sidebar navmap byte-identical. Five probe DIFFs all
  resolved as documented artifacts (gradient serialization, lab()
  notation, the zero-rect decoy button, the aside-fallback, the
  un-settled kicker transient).
- 6 new screenshots (109/109b the dark pair, 110 dark settings tabs,
  111 dark mobile drawer, 112 RTL, 113 light restored) → 133 PNG
  captures. DB pristine.

## Frontier after this round

With-data surfaces (blocked on REF), form-error surfaces (zero-data
hidden), the deferred print-button decision (report-bearing pages),
the /settings card border-slate-200 micro-diff (3 units, one page —
noted in the plan), deep RTL polish (scrollbar mirroring, focus-ring
origin), and the dark-mode with-data surfaces (equally blocked).
