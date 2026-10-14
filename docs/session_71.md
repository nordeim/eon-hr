# Session 71 — eon-hr parity round 35, part 2 (the re-measure + the delivery)

*The completion window: resumed at the user-menu width driver, found
the census's blind spots, fixed a self-logout bug the whole test
pyramid had sailed over, and delivered the round.*

## The w-48 amendment (the resumed thread)

The browser sessions survived the window break — REF's user menu was
still open. The width driver: REF's menu carries a FIXED `w-48`
(192px), not content-sized — and the items are `CircleUser` (not
`User`) + `LogOut`, both with `mr-2` riding ON TOP of the item's
`gap-2` → 16px icon-to-text (measured 60→92 on both). Amended the
menu, the pins (A3 re-pinned + new A5), and the E2E (poll to settle —
the zoom-in-95 enter animation had returned 191/190 mid-transform; the
±2 tolerance + the ≥190 poll fixed the flake).

## THE PREFETCH-LOGOUT BUG (the round's critical find)

During live verification the LOC browser session kept dying — after
every user-menu measurement, the next navigation landed on /login.
Root cause: the Logout item had been built as `<Link href="/logout">`.
Next PREFETCHES Link targets when they mount; the prefetch GETs the
/logout ROUTE HANDLER; its GET clears the session cookie. **The menu
logged the user out the moment it opened.** The full 151-spec E2E
pyramid never caught it because no spec navigated after opening the
menu. Fix: a real `<button>` + `window.location.href` (pin A6 + a
navigate-after-open regression spec). This is the round's headline
engine lesson (SKILL §48).

## The census's blind spots (the R35-F family)

The live pairs — not the census — found six more gap groups, every
one re-measured on REF before touching code:

- **F1/F4/F10** — the four settings header actions (Add Workflow
  160×36, Add Shift 127×36, Add Department 180×36, Save Theme 151×36)
  are the DARK SOLID (bg rgb(23,23,23) + white + icon mr-2). The clone
  had the blue gradient CTA on all four (the census recorded the
  geometry but missed the recipe family).
- **F2/F3** — the Create Approval Workflow dialog (max-w-3xl; Workflow
  Name | Type select with Leave/Expense/Loan/Payroll/Recruitment — the
  API's APPLIES_TO extended; Approval Levels + the outline size-sm Add
  Level; level cards: H4 + the 40×32 Trash2 red-600 remove + the three
  measured placeholders + the Mandatory checkbox; Cancel/Create). The
  census missed the button AND the dialog entirely. Wired to the
  existing /api/approval-workflows (the superset).
- **F5/F6** — the Add Shift dialog (max-w-lg; the seven fields with
  REF's "e.g., M, E, N" and "0" placeholders; Status Active/Inactive).
  The Shift model gained code/breakMinutes/toleranceMinutes; POST
  /api/shifts is now shape-discriminated (employeeId → assignment, else
  definition — with the body read ONCE: a fetch Request's stream is
  single-use, so parseBody can't follow a raw read). DELETE ?shiftId=
  removes definitions (the E2E cleanup path).
- **F7** — Save Theme carries the lucide-save mr-2 icon (151 wide; the
  gradient was 119).
- **F8** — the Quick Presets: three outline cards (h-auto p-4
  flex-col items-start gap-2, 346×86, three w-6 h-6 rounded swatches —
  Facebook #1877f2/#42b72a/#e4e6eb, Professional Blue
  #3b82f6/#6366f1/#e0e7ff, Fresh Green #10b981/#059669/#d1fae5). Click
  populates the three color fields (REF behavior — no active state on
  the card).
- **F9** — the Logs filter island: `mb-6 p-4 bg-slate-50 rounded-lg
  space-y-4` wraps the grid + Clear Filters (the wrapper's p-4 is what
  gives REF's 195px columns — the clone's bare grid rendered 201; the
  census had the grid recipe but missed the wrapper).
- **F11/F12** — the 404 wrapper: `min-h-screen flex items-center
  justify-center p-6 bg-slate-50` (content centers at y=306 of 900;
  the clone's 70vh-min + 160px bottom padding had centered at 226 — an
  80px offset), and Go Home carries the 16px Home icon (123×38 with
  it; the clone's icon-less link was 99).
- **F13** — the Logs empty carries the 48px FileText slate-300 icon
  (the census had recorded "no icon").

Also fixed along the way: the stale R35-D4 pin (the final
title-implementation had evolved past it), the auth-sessions.mjs
password quoting (the `$` in the demo password expanded to "" under
double quotes — both boxes filled empty), and the verify-r35 probe
family (line-based ref finding — `[selected, ref=e12]` attribute lines
break naive `\[ref=` regexes; encodeURIComponent evals — quotes in the
404 sentence broke the JSON unescape; the icon-class order
h-4/w-4 vs w-4/h-4 normalization).

## Gates + live verification

**lint 0/0 · tsc ✓ · 556/556 unit · build ✓ · 157/157 E2E** (the
R35-F specs: the dark-solid header actions, both dialog round-trips
with API cleanup, the Quick Presets click-populate, the Logs island
viewport-relative columns, the 404 re-centering + icon, the
prefetch-logout regression guard).

The final dual-browser pass (verify-r35.mjs): **11/12 pair MATCH** —
the user menu (192×74, both items, 16px icon-to-text), the compliance
select (the Saudi taxonomy, 6px radius, cursor-default), all six
settings tabs (title/buttons/icon/paras equal, maxSvg equal), the
mobile chrome (766y+78h, tabs byte-identical), the bell popover
(384×175), the login stack. The 404 pair: title, h1 (y=306 — the
re-centering verified), h2, sentence, divider all equal; Go Home is
the clone's real `<a href="/">` where REF renders a JS button — the
navigation superset at identical geometry (123×38, 8px radius).

16 screenshots (128-135, ref+loc pairs: the user menu, the 404, the
workflows tab + dialog, the theme presets, the logs island, the
add-shift dialog, the compliance select) → **172 PNG captures**. DB
pristine (the E2E probes delete their rows).

Docs: AGENTS session-36 layer, SKILL 3.19.0 + §48, PAD [S36],
CLAUDE/README counts (556 unit · 157 E2E · 172 captures),
session_70/71, the plan's completion record, the worklog. Committed to
main and pushed via the SSH wrapper.
