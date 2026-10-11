# Session 32 — Parity Round 19: The hover dimension (hover/active-state parity)

Continuing the parity cycle after round 18 (`d1c0d7c` + session log
`e58abcc`). The owner's brief pointed at session_30/31 +
remediation-plan-session19; session_30's suggested next steps were: re-run
the redeploy check, open a **hover/active-state parity dimension** (button
hover colors pinned for CTAs but never swept systematically), the
with-data story (still blocked on REF's zero-data state) and
reduced-motion. All executed this round.

Workspace survived at `e58abcc` (git pull added `docs/session_31.md` only);
`.env` intact (`DATABASE_URL="file:../db/custom.db"`); DB pristine
(users=1, employees=1, balances=2, payroll=0, expenses=0); the shell
`DATABASE_URL` trap guarded with `env -u DATABASE_URL` on every DB/build
command.

**Baseline gates: lint 0/0 · tsc ✓ · 373/373 unit · build ✓ · 86/86 E2E**
— the `e58abcc` push state exactly. Static audit of the R18 diff clean
(the one "any" hit was "Company" inside a comment).

Skills consulted (repo `skills/`): tdd (red→green vertical slices, seam
discipline), agent-browser (dual-session probing), clone-app-pat-pro
(computed styles as ground truth), tailwind-patterns (v4 CSS-first rules).

**Redeploy check PASSED** — 12 probe routes byte-identical (h1
text/font/x/y); REF unchanged since round 18.

**Mobile navigation audit (user priority, r18 geometry-located probe)**:
top bar 390×73 white sticky + 1px slate-200; bottom tabs x
10/79/139/204/313, 14px labels, 20px icons, active rgb(37,99,235); drawer
288×844 #FAFAFA z-50 (links 141/301/421/461/581, footer 121@723, no close
button); kickers — standard 53px h1@32 AND the profile 69px variant (back
button 36@32,105 + subtitle); md boundary 767/800 — **all byte-identical,
no Tailwind v4 bug**.

**The round's core — the FIRST hover/active-state audit** (real
agent-browser hovers = CDP mouse moves, full computed dumps at rest +
settled-under-hover, 24 surfaces on both apps):

- **Probe-tooling discovery (the round's deepest find)**: Tailwind v4
  wraps every `hover:*` utility in `@media (hover: hover)` (85 rules in
  the clone's CSS). The headless probe browser reports hover:none /
  pointer:coarse — so v4 hover styles NEVER apply in agent-browser while
  REF's v3-era unwrapped rules do. `Emulation.setEmulatedMedia` cannot
  override the `hover` feature in this Chromium build (color-scheme
  works; hover does not — CDP-tested). **Fix: a probe-side CSS polyfill**
  that extracts every rule inside `@media (hover: hover)` and re-injects
  it verbatim into a second `@layer utilities` block — layer semantics
  preserved, REF untouched (v3). Real desktops match the media query, so
  the polyfill restores probe parity only; it never ships. On touch
  devices REF keeps sticky hover and the clone does not — v4's intended
  a11y behavior, a documented engine difference we do not clone.
- **Settle lesson**: REF's `transition-all duration-200` produces
  mid-flight artifacts at ~750ms post-hover (bg alpha 0.086, opacity
  0.983) — settled reads need **>= 2s**.
- **Styled-element lesson (L2 again)**: REF's quick chips style an INNER
  `<div>` of a class-less `<a>`; measuring the anchor showed "no hover
  change" — the chips actually match byte-for-byte. DOM-verify the
  element that carries the classes before acting.
- **12 gap groups (R19-A..L)** measured with settled full-string dumps:
  the sidebar leaf/sub-item hover tokens (REF settles zinc-100 **#F4F4F5**
  + text **#18181B** + opacity 0.8 — the clone's `hover:bg-[#e4e6eb]` pin
  was STALE), the ACTIVE leaf's hover text flip to #18181B (bg stays blue
  — REF's custom-primary-bg beats its hover:bg-sidebar-accent), the footer
  ghost recipe (`hover:bg-accent hover:text-accent-foreground` — #F5F5F5 +
  #171717; the bell SVG OWNS text-slate-600 so the icon survives hover),
  the user name span's **slate-900** correction (rgb(15,23,42) — the R15
  zinc-700 reading had measured the BUTTON's inherited color, not the
  span), the blue-tinted Import CSV outline (`border-blue-300
  text-blue-700 hover:bg-blue-50`), the accent menu-item recipe on BOTH
  items including the red Logout (focus:text beats text-red-600 → the red
  text turns #171717 on hover, REF-measured), the login Sign in
  `shadow-sm`, the forgot link's missing hover:underline, the mobile
  hamburger's foreground inheritance + accent hover, the bottom tabs' NO
  hover classes, and the staffrequests placeholder's three ASCII dots
  (never U+2026).
- **Verified non-gaps**: group buttons (blue-50/blue-700), عربي,
  Customize, Edit/New Project/Generate All outlines, view-all underline,
  Add Employee CTA hover gradient (to-right vs 90deg serialization — same
  direction), the Kanban dark toggle (rgba vs lab — same color), tab
  triggers/search inputs/staffrequests trigger (no hover change on
  either app), login socials, signup link, quick chips; REF's invisible
  CTA hover bg-color under its opaque gradient; the 0px login borders;
  reduced-motion (one rule per side, no parity-relevant surface).

`docs/remediation-plan-session20.md` written (12 groups + the probe
taxonomy + non-goals) and codebase-validated before execution (every fix
site read during the audit).

**TDD**: 13 new pins (recipes.test.ts session-20 block), all RED before
implementation → GREEN; 4 stale pins updated (leaf hover, name color ×2,
bell/moon block) + the tokens comment. Mid-flight pin corrections from
the RED run: negative regexes catching my own comments and neighboring
elements (the h1's text-slate-900 inside the hamburger window; the
comment mentioning the forbidden class) — replaced with positive
full-className pins and reworded comments.

**Gates: lint 0/0 · tsc ✓ · 386/386 unit (+13) · build ✓ · 86/86 E2E.**

**Live dual-browser verification (with the polyfill on LOC)**: every
fixed surface byte-exact — inactive leaf zinc-100 + #18181B + 0.8 (full
JSON MATCH), active leaf #18181B text (sh serialization only), bell
button #F5F5F5 + #171717 with the SVG staying slate-600, moon #F5F5F5 +
SVG #171717, name span rgb(15,23,42), BOTH menu items #F5F5F5/#171717
(full JSON MATCH incl. the Logout flip), Import CSV blue-300 rest +
blue-50 hover (visual byte-exact), placeholder "Search requests...",
Sign in shadow rgba(0,0,0,0.05) 0 1px 2px, forgot hover slate-700 with
NO underline, hamburger #0A0A0A rest + slate-100/#171717 hover, bottom
tabs no-hover. Post-fix regression sweeps: canonical 12-route 12/12 MATCH
(one mid-run viewport reset re-run) + mobile chrome regression clean —
zero layout impact (color-only changes). Two probe-session flakes
documented: the Secure-cookie-over-HTTP logout family on the standalone
:3200 server (re-authenticate; E2E's storageState path unaffected) and
the login rate limiter after repeated probe logins (server restart
resets the in-memory window).

**8 screenshots** (5 new hover-state evidence —
63-sidebar-leaf-hover-zinc100, 64-bell-hover-accent,
65-import-csv-hover-blue50, 66-menu-item-hover-accent,
67-hamburger-hover-mobile, each with the state live via real hover; 3
standards refreshed: 02-dashboard, 11-mobile-dashboard, 37-reports-desktop)
→ 80 total. VLM spot-checks confirmed the leaf hover (very light gray),
the Import CSV blue tint, the menu highlight and the hamburger hover
(computed styles remain the byte-exact ground truth).

Documentation updated: AGENTS session-20 layer + 386 specs; SKILL v3.3.0
+ §32 + counts; PAD [S20] row + test table + checklist; CLAUDE 472-spec
pyramid + session-20 pins; README 386 specs + 80 captures + hover-parity
feature row; this session log; worklog; remediation-plan completion
record.

## Session complete — parity round 19 pushed to `nordeim/eon-hr@main`

**Audit**: redeploy check (REF unchanged), mobile navigation verified
byte-identical (no Tailwind v4 bug), and the FIRST hover/active-state
audit — 24 surfaces, 12 gap groups, plus the v4 `@media (hover: hover)`
probe trap defeated with a probe-side polyfill.

**Fixes**: 12 gap groups with 13 new TDD pins — the sidebar hover tokens
(zinc-100/#18181B/0.8), the active-leaf text flip, the ghost accent
recipe (bell SVG owns its color), the name slate-900 correction, the
blue-tinted Import CSV, the accent menu items, the login shadow/underline
pair, the mobile hamburger + no-hover bottom tabs, the ASCII placeholder.

**Gates**: lint 0/0 · tsc ✓ · **386/386 unit** · build ✓ · **86/86 E2E**
· 8 screenshots · DB pristine.

**Suggested next steps**: re-run the redeploy check next round; the
interaction map now covers focus + hover; remaining frontier — the
:active (pressed) states (needs mousedown-hold tooling agent-browser
doesn't expose), the with-data story (still blocked on REF's zero-data
state), the checkbox focus recipe (no measurable REF surface), and
reduced-motion (open a11y item on both apps).
