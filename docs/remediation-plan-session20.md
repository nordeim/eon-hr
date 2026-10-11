# Remediation Plan — Session 20 / Parity Round 19

Audit basis: dual-browser (clone :3200 standalone vs https://eon.base44.app)
**hover/active-state parity audit** — the third interaction dimension opened
per session_30's suggested next steps ("button hover colors are pinned for
CTAs but not swept systematically"). Real agent-browser hovers (CDP mouse
moves trigger the true `:hover` pseudo-class) with full computed
backgroundColor/backgroundImage/color/borderColor/textDecorationLine/opacity
dumps at rest AND settled-under-hover, on BOTH apps, across 24 surfaces:
dashboard sidebar chrome (active leaf, inactive leaf, group button, bell,
moon, عربي, user trigger, Customize), quick-action chips, "View all" links,
employees (Import CSV, Add Employee CTA, search input), settings (Company
tab, Edit), staffrequests (pill trigger, search placeholder), payrollmodule
(Generate All), taskmanager (New Project, Kanban toggle), the login page
(socials, Sign in, forgot, signup — fresh logged-out sessions), mobile
(hamburger, bottom tabs, drawer links) and the user dropdown menu items.

Redeploy check PASSED (12 probe routes byte-identical — REF unchanged since
round 18). Mobile navigation audited end-to-end per the standing user
priority (top bar 390×73, tabs x 10/79/139/204/313 + active
rgb(37,99,235), drawer 288×844 #FAFAFA z-50 with links 141/301/421/461/581
+ footer 121@723, kickers standard 53 + profile 69, md boundary 767/800) —
all byte-identical, **no Tailwind v4 bug**.

## Probe-tooling discoveries (pinned for future rounds)

1. **Tailwind v4 wraps every `hover:*` utility in `@media (hover: hover)`**
   (85 rules in the clone's stylesheet). The headless probe browser reports
   `hover: none` / `pointer: coarse`, so v4 hover styles NEVER apply in
   agent-browser — while REF (v3-era, unwrapped rules) hovers fine. This
   asymmetry is a PROBE artifact, not a code bug: real desktops match the
   media query. `Emulation.setEmulatedMedia` cannot override the `hover`
   feature in this Chromium build (color-scheme works; hover does not).
   **Fix: a probe-side CSS polyfill** — extract every rule inside
   `@media (hover: hover)` and re-inject verbatim into a second
   `@layer utilities` block (scripts/probe-r19-hover2.mjs). Layer semantics
   preserved; REF needs nothing (v3). On touch devices REF keeps sticky
   hover and the clone does not — v4's intended a11y behavior, an ENGINE
   difference we do not clone (documented).
2. **Quick-chip false alarm (L2 lesson re-learned)**: REF styles an inner
   `<div>` of a class-less `<a>`; measuring the anchor showed "no hover
   change". DOM-verify the styled element before acting — the chips
   actually match byte-for-byte
   (`border-slate-200 hover:border-blue-300 hover:bg-blue-50`).
3. agent-browser eval args are shell-escaped: double quotes inside browser
   JS break the JSON arg (single-quote everything); snapshot regexes must
   allow attributes between the label and `[ref=…]` and must not end with
   `\)`.

## Verified non-gaps (documented, no action)

- **Group-button hover** (blue-50 bg + blue-700 text, both sides),
  **عربي hover** (slate-100 + #171717), **Customize / Edit / New Project /
  Generate All outline hover** (accent #F5F5F5 + #171717), **view-all +
  request-leave links** (underline), **Add Employee CTA hover** (darker
  gradient #1D4ED8→#4338CA — REF serializes `to right`, the clone `90deg`;
   same direction, engine serialization), **Kanban dark toggle** (rgba vs
   lab() = same #171717@0.9), **tab triggers / search inputs / staffrequests
   trigger** (no hover change on either app), **login socials** (slate-50 +
   slate-300 border), **login signup link**, **quick-action chips**.
- REF's CTA hover also sets an invisible `rgba(23,23,23,0.9)`
  background-COLOR under its opaque gradient — not cloned (invisible).
- Login button borders compute 0px (REF's gray-200 vs clone neutral-200
  borderColor is never rendered).
- Reduced-motion: exactly one rule on each side (REF: sonner-toast library;
  clone: a `motion-reduce:` utility) — no parity-relevant surface; the PAD
  §10 open item stands on both apps.
- The clone's leading transparent 0-width shadow layers (v4 ring-var
  serialization) and the bell SVG keeping slate-600 under REF hover are
  byte-invisible.

## Gap groups (12)

- **R19-A (sidebar leaf + sub-item hover — systemic, 2 code sites)**: REF
  renders `hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
  hover:opacity-80` → settled **zinc-100 #F4F4F5 bg + #18181B text +
  opacity 0.8** (measured settled 2.5s; mid-transition reads show the
  0.2s `transition-all` in flight). The clone pins the STALE
  `hover:bg-[#e4e6eb]` (no text change). Fix both inactive branches in
  `src/components/layout/sidebar-nav.tsx` (leaf line 101, sub-item line
  172) → `hover:bg-[#f4f4f5] hover:text-[#18181b]`. The mobile drawer
  renders the same component — covered.
- **R19-B (active leaf hover text)**: REF's active leaf keeps the blue
  `custom-primary-bg` (its `hover:bg-sidebar-accent` loses the cascade) but
  the TEXT still flips to sidebar-accent-foreground — white → **#18181B**
  at opacity 0.8. The clone keeps white text. Add `hover:text-[#18181b]` to
  both active branches (lines 100 / 171).
- **R19-C (Bell button)**: REF = ghost button `hover:bg-accent
  hover:text-accent-foreground` (bg **#F5F5F5**, text #171717) with the
  SVG owning `text-slate-600` (an element's own class beats the parent's
  hover color, so the icon STAYS slate-600 under hover). The clone puts
  `text-slate-600` on the button (icon changes color on hover — visible
  diff) and hovers `bg-slate-100` + `text-foreground`. Fix
  `sidebar-nav.tsx` line 215: button → `hover:bg-accent
  hover:text-accent-foreground`; move `text-slate-600` onto the `<Bell>`
  svg.
- **R19-C2 (Moon button)**: same ghost recipe — `hover:bg-accent
  hover:text-accent-foreground` (svg inherits zinc-700 → **#171717** under
  hover). Clone: `hover:bg-slate-100 hover:text-foreground` (icon →
  #0A0A0A). Fix line 225.
- **R19-D (user name span — stale R15 pin)**: REF renders
  `font-medium text-slate-900` → rgb(15,23,42) (DOM-verified class +
  computed color). The R15-B "zinc-700" pin measured the BUTTON's inherited
  color, not the span. Fix `sidebar-nav.tsx` line 266 → `text-slate-900`;
  update the two recipe pins + token comment.
- **R19-F (Import CSV button)**: REF = outline base +
  `border-blue-300 text-blue-700 hover:bg-blue-50` (rest border
  rgb(147,197,253), hover bg blue-50 #EFF6FF, hover text #171717 via the
  variant's hover:text-accent-foreground). Clone: default outline
  (neutral border, accent hover). Fix `employees/page.tsx` — add
  `border-blue-300 hover:bg-blue-50` to the existing `text-blue-700`
  className.
- **R19-G (staffrequests search placeholder)**: REF = `"Search
  requests..."` (three ASCII dots); clone = `"Search requests…"` (U+2026).
  Fix `staffrequests/page.tsx` line 245.
- **R19-H (login Sign in shadow)**: REF carries `shadow-sm`
  (`rgba(0,0,0,0.05) 0 1px 2px`); the clone has none. Add `shadow-sm` to
  `login/page.tsx` line 213.
- **R19-I (login forgot link)**: REF hovers `text-slate-700` only — NO
  underline. Clone adds `hover:underline`. Remove it (line 223).
- **R19-J (mobile hamburger)**: REF = no base color (inherits foreground
  **#0A0A0A**) + `hover:bg-slate-100 hover:text-accent-foreground`
  (h-7 w-7 p-2 rounded-lg transition-colors duration-200 — geometry
  already pinned). Clone: `text-slate-900` (wrong rest color) + no
  hover:text. Fix `app-shell.tsx` line 78: drop `text-slate-900`, add
  `hover:text-accent-foreground`.
- **R19-K (mobile bottom tabs)**: REF's inactive tabs have NO hover
  change (no classes); the clone's flip to `hover:text-foreground`
  (#0A0A0A). Remove `hover:text-foreground` from the inactive branch
  (`app-shell.tsx` line 113).
- **R19-L (dropdown menu items — 4 code sites)**: REF renders
  `focus:bg-accent focus:text-accent-foreground` on BOTH menu items —
  My Profile AND Logout (Logout = same recipe + base `text-red-600`; the
  focus:text wins on hover → red text turns #171717, bg #F5F5F5 —
  measured). Clone: the primitive (`ui/dropdown-menu.tsx` lines 42+62)
  uses `focus:bg-secondary focus:text-secondary-foreground` (#0A0A0A
  text), and the sidebar user menu's custom items use `focus:bg-secondary`
  (My Profile) / `focus:bg-red-50` (Logout). Fix all four sites →
  `focus:bg-accent focus:text-accent-foreground`.

## Execution order (TDD)

1. RED pins (`tests/unit/recipes.test.ts` session-20 block):
   - leaf + sub-item assert `hover:bg-[#f4f4f5] hover:text-[#18181b]` and
     NOT `hover:bg-[#e4e6eb]`; active branches assert `hover:text-[#18181b]`
   - Bell: button asserts `hover:bg-accent hover:text-accent-foreground`
     without `text-slate-600` on the button; the Bell svg asserts
     `text-slate-600`
   - Moon button asserts `text-zinc-700 hover:bg-accent
     hover:text-accent-foreground`
   - user name span asserts `text-slate-900` (not zinc-700)
   - Import CSV asserts `border-blue-300 text-blue-700 hover:bg-blue-50`
   - staffrequests asserts `placeholder="Search requests..."` (ASCII dots)
   - login Sign in asserts `shadow-sm`; forgot asserts NO `hover:underline`
   - hamburger asserts `hover:bg-slate-100 hover:text-accent-foreground`
     without `text-slate-900`
   - bottom tabs assert inactive branch WITHOUT `hover:text-foreground`
   - dropdown primitive + sidebar items assert `focus:bg-accent
     focus:text-accent-foreground` (sidebar Logout keeps `text-red-600`,
     drops `focus:bg-red-50`)
   - UPDATE the stale pins: recipes 77–78 (leaf hover), 372–375 + 1327–1328
     (name color), 1322–1324 (bell/moon — moon keeps text-zinc-700);
     tokens 150–151 comment.
2. GREEN: the 12 code edits (all color-only; zero layout impact — no
   geometry pin can regress; the placeholder is content-only).
3. Gates: lint → typecheck → unit → build → E2E (86).
4. Live dual-browser re-verification (with the hover polyfill on LOC):
   re-run the hover probes — expect MATCH on every fixed surface (leaves
   zinc-100/#18181B/0.8, active leaf #18181B text, bell/moon #F5F5F5 +
   #171717 with the bell icon slate-600, name slate-900, Import CSV
   blue-300/blue-50, hamburger #0A0A0A→#171717, bottom tabs no-hover,
   menu items #F5F5F5/#171717) + canonical 12-route sweep + mobile chrome
   regression (geometry unchanged).
5. Screenshots: hover-state evidence captures (sidebar leaf hovered, bell
   hovered, Import CSV hovered, menu open with hovered item) + standards
   refresh → docs/screenshots/.
6. Docs: AGENTS session-20 layer, SKILL v3.3.0 + §32, PAD [S20], CLAUDE/
   README counts + hover-parity row, session log, worklog, this plan's
   completion record.

## Documented non-goals / supersets kept

- The `@media (hover: hover)` engine difference (touch sticky-hover) is
  NOT "fixed" — v4's behavior is intended; documented as an engine trap.
- Gradient `to right` vs `90deg` and rgba vs lab() serializations stay
  (byte-invisible).
- REF's focusable settings card (extra tab stop), the invisible CTA hover
  bg-color, and the 0px-border login color computations stay un-cloned.
- The staffrequests trigger stays a button with aria-pressed (the R15
  a11y superset); only its (non-)hover behavior was audited.

## Completion record (session 20)

All twelve gap groups executed TDD-first (13 new pins in
tests/unit/recipes.test.ts, all RED before implementation → GREEN; 4 stale
pins updated — the leaf-hover pin, both user-name pins, the bell/moon
block — plus the tokens-test comment):

- **R19-A**: both inactive branches (leaf + sub-item) now
  `hover:bg-[#f4f4f5] hover:text-[#18181b]` — settled-verified
  rgb(244,244,245) + rgb(24,24,27) + opacity 0.8 (full JSON MATCH on the
  inactive leaf).
- **R19-B**: both active branches add `hover:text-[#18181b]` — verified
  (bg stays #1877F2, text rgb(24,24,27), op 0.8; shadow-serialization-only
  diff, the documented v4 ring-var family).
- **R19-C**: the bell button is `hover:bg-accent
  hover:text-accent-foreground` with `text-slate-600` moved onto the
  `<Bell>` svg — verified #F5F5F5 + #171717 with the icon staying
  rgb(71,85,105) under hover (byte-exact vs REF's geometry-located probe).
- **R19-C2**: the moon button `text-zinc-700 hover:bg-accent
  hover:text-accent-foreground` — verified #F5F5F5 + svg #171717.
- **R19-D**: the name span `text-slate-900` — verified rgb(15,23,42) both
  sides; the R15 pins corrected (the zinc-700 reading was the button's
  inherited color).
- **R19-F**: Import CSV `border-blue-300 text-blue-700 hover:bg-blue-50`
  — verified rest border rgb(147,197,253) + hover bg rgb(239,246,255) +
  hover text rgb(23,23,23).
- **R19-G**: placeholder `"Search requests..."` (ASCII) — verified both
  sides.
- **R19-H**: the Sign in button carries `shadow-sm` — verified
  rgba(0,0,0,0.05) 0px 1px 2px (the leading transparent layers are the
  v4 serialization, invisible).
- **R19-I**: the forgot link lost `hover:underline` — verified
  text-decoration none under hover, color slate-700.
- **R19-J**: the hamburger dropped `text-slate-900` and gained
  `hover:text-accent-foreground` — verified rest rgb(10,10,10) + hover
  slate-100 + rgb(23,23,23).
- **R19-K**: the bottom tabs dropped `hover:text-foreground` — verified
  no hover change (bg transparent, c rgb(71,85,105)).
- **R19-L**: the dropdown primitive (2 sites) + both sidebar user-menu
  items render `focus:bg-accent focus:text-accent-foreground` (Logout
  keeps `text-red-600`, drops `focus:bg-red-50`) — verified BOTH items
  #F5F5F5 + #171717 under hover, including the red Logout flip
  (full JSON MATCH).

Gates: lint 0/0 · tsc · 386/386 unit (+13) · build · 86/86 E2E. Post-fix
regression sweeps: canonical 12-route 12/12 MATCH + mobile chrome clean —
zero layout impact (color-only). 8 screenshots (5 new hover evidence +
3 standards) → 80 total. DB pristine (users=1, employees=1,
leaveBalances=2, payroll=0, expenses=0).
