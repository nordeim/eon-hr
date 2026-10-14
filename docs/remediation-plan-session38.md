# Remediation Plan — Session 38 / Parity Round 37

Audit basis: dual-browser (clone :3200 standalone vs https://eon.base44.app),
viewports pinned (1440×900 desktop, 390×844 mobile). Baseline at HEAD
`0182f0d` ALL GREEN: lint 0/0 · tsc ✓ · 569/569 unit · build ✓ · 158/158
E2E.

## The opening state (the redeploy watch + the standing audits)

- **No redeploy**: REF's /login static build is unchanged
  (`static/index-CneaUv24.js` + `static/index-D0Q6-tUz.css` — the round-35
  fingerprints) and the app chunks are unchanged post-login
  (`/assets/index-C-IrDy5f.js` + `/assets/index-BGNH4KkS.css`) → every
  app-level pin holds; every diff below is clone-side.
- **REF remains zero-data** ("No requests yet" / "0 SAR total") → the
  with-data frontier stays blocked.
- **Standing audits green (5/5)**: the mobile bottom nav byte-identical
  (nav y=766 h=78 w=390, tabs x=10/79/139/204/313 all 775y+61h), the
  mobile drawer byte-identical (288px @ x=0, h=844, #FAFAFA, 1px #e5e5e5
  border-right — probed with the Escape-reset + settle pattern after a
  toggle-state race produced a false first read), the desktop navmap
  byte-identical (13 items at 141…621, links vs group buttons matched by
  tag — REF renders no nav/aside, so the probe reads
  `div.min-h-screen` roots with the x<260 filter, the round-30 recipe),
  the bell popover identical (the unnamed-button snapshot recipe), and
  the dashboard Quick Actions geometry-identical (four 150×66 tiles).
- **Mobile navigation is fully green** — no Tailwind v4 bug.

## The census — the keyboard/focus dimension (the round's frontier)

Round 36 named it: "audit keyboard/focus flows (Tab order in dialogs) as
the next never-probed dimension". The probe: open each dialog on both
apps, record `document.activeElement` after open, press Tab ×10 reading
the focused element each time, then Escape and read the restore target.

### Verified non-gaps (the dimension's green half)

- **Tab orders are structurally identical on all five probed dialogs**
  (Add Department, Create Approval Workflow, Add Shift, Add Asset, New
  Loan Request): initial focus lands on the first input on both; the
  sequence follows the DOM (fields → footer Cancel → submit → the Close
  X → wrap); the time inputs cycle their internal segments (hour →
  minute) identically on both (native browser behavior).
- The clone's `id` attributes on dialog inputs are the documented
  superset (REF renders none; invisible).
- The staffrequests "New Request" trigger: REF ships a plain
  `type="submit"` button with NO dialog semantics (no aria-expanded, no
  aria-haspopup) — the clone's plain trigger is correct parity there;
  it is deliberately OUT of the conversion scope below.

### The probe lessons (recorded for the next round)

- A 220ms inter-press settle is too fast for the Tab sequence read: the
  focus log showed a "skipped Cancel" artifact that a 300ms manual trace
  disproved (ground truth: Cancel IS tabbable; only the DISABLED submit
  is skipped). 300ms+ is the floor for focus reads.
- The drawer probe needs an explicit closed-state reset (Escape + wait)
  before opening — a second run through an already-open drawer CLOSES it
  and reads the mid-exit frame (the x=-244 artifact).

### Findings

1. **R37-A — the DialogTrigger conversion (the focus-restore + aria
   contract family)**. REF's dialog triggers on /assets, /loans and the
   three /settings tabs are Radix `<DialogTrigger>`s: live-measured
   `aria-expanded="false"`, `aria-haspopup="dialog"`,
   `aria-controls="radix-:…:"`, `type="button"` — and on close (Escape
   or outside click) focus RETURNS TO THE TRIGGER. The clone's five
   triggers are plain `<Button onClick={() => setOpen(true)}>` buttons:
   no aria contract, and on close focus falls to `document.body`.
   Root cause (read from the installed @radix-ui/react-dialog 1.2.0):
   `DialogContentModal` wires `onCloseAutoFocus` to
   `context.triggerRef.current?.focus()` — with no DialogTrigger the
   ref is null, the handler still calls `event.preventDefault()`, which
   ALSO suppresses the FocusScope's fallback
   (`focus(previouslyFocusedElement)`), so focus dies on BODY. The
   fix is the Radix-native pattern at all five sites:
   `<DialogTrigger asChild><Button …>…</Button></DialogTrigger>` with
   the manual `onClick` removed (the trigger drives the controlled
   `onOpenChange(true)`). Visual footprint: zero (asChild merges props
   onto the same Button; the Button sets no `type`, so the trigger's
   `type="button"` survives the Slot merge — REF's measured type).
   Architectural note (validated against the code): DialogTrigger only
   works INSIDE its Dialog root (context), and all five dialog roots
   currently wrap only the Content — the triggers sit in page/tab JSX
   outside them. Each site needs the mechanical root-lift: the `<Dialog
   open onOpenChange>` wrapper moves up to enclose BOTH the trigger
   region and the dialog component (the root renders no DOM — layout
   untouched), and the dialog components drop their own roots and
   render `<DialogContent>` directly. The settings' CreateWorkflow /
   AddShift components lose their now-unused `open` prop (AssetDialog
   keeps it — its reset-on-open effect reads it); the loans dialog is
   inline in the page; the Add Department dialog is inline in the tab.
   The five sites: assets Add Asset, loans New Loan Request (page
   header), settings Add Workflow / Add Shift / Add Department (the tab
   card headers).
2. **R37-B — the asset dialog's disabled submit**
   (`disabled={saving || !form.name.trim()}`): REF keeps the footer
   submit ENABLED at rest — its Tab order includes it and the
   empty-submit fires the native validation tooltip (the round-36 form
   contract). The clone's `!form.name.trim()` clause disables the button
   at rest, removing it from the Tab order and deadening the empty
   submit. Drop the clause; `disabled={saving}` stays (the other
   dialogs' pattern).
3. **R37-C — the Add Level button's icon margin**: REF's interior Add
   Level = 113×32 with `w-4 h-4 mr-1` on the Plus icon (16px icon + 4px
   margin — the session-35 census documented 113×32 but never
   unit-pinned it); the clone ships `mr-2` → 117×32, shifting the
   dialog's right-edge stack (Cancel x=911 vs REF 907). One-class fix.
4. **R37-D — the loans dialog's text/contract layer** (the round-36
   lesson repeated: geometry audits miss text — the loans interior was
   form-verified but never placeholder/value-compared):
   - the Reason textarea is `required` on REF (clone: not required) and
     carries the placeholder **"Hi, I'm buying an apartment and I need a
     loan for the down payment."** (clone: "e.g. Family relocation,
     education, medical…");
   - the Amount input DEFAULTS to **"0"** (clone: empty string);
   - the Paid From input PREFILLS **"New Era LLC"** (clone: empty —
     stable across re-opens on REF; REF's own company is "Demo", so the
     literal is a hardcoded form default in REF's code, not
     company-driven);
   - REF's number inputs carry NO min/max/step — only `required` (the
     clone ships invented `min="0.01" step="0.01"` on amount and
     `min="1" max="60" step="1"` on months, which change the native
     validation surface; the API's Zod already enforces positive amounts
     and 1–60 months with toasts — the superset);
   - the client-side silent-return guard
     (`if (… amount <= 0) return;`) is the round-36 anti-pattern: with
     the "0" prefill an immediate submit now flows to the API and
     surfaces the Zod error as a toast. The guard dies.

## The plan (TDD)

1. **RED**: the session-38 pin block in `tests/unit/recipes.test.ts` —
   A1–A6 (the five DialogTrigger wrappings + the removed manual
   onClicks), B1 (the asset submit `disabled={saving}` only),
   C1 (the Add Level `mr-1`), D1–D4 (the loans reason required +
   placeholder, the "0"/"New Era LLC" defaults, the bare number
   inputs — no min/max/step, the dead silent-return guard).
2. **GREEN**: the five DialogTrigger conversions (imports + wraps +
   onClick removals), the asset disabled clause, the mr-1, the loans
   text layer + defaults + guard removal.
3. **E2E**: extend `dialog-interiors.spec.ts` with a session-38 block —
   the focus-restore contract on all five dialogs (Escape → the trigger
   regains focus), the trigger aria contract
   (`aria-haspopup="dialog"` + `aria-expanded`), the loans defaults
   (amount "0", paid-from "New Era LLC", the reason placeholder +
   required), and the asset submit's at-rest enabled state (the native
   validation empty-submit already covered by settings-tabs patterns).
4. Gates: lint → typecheck → unit → build → E2E.
5. Live dual-browser verification: re-run the Tab-order probe (five
   dialogs — sequences + restore targets), the standing audits, and
   the loans text layer pair.
6. Screenshots: the five dialogs' trigger pairs showing
   `aria-expanded` in the accessibility snapshot + the focused-trigger
   after Escape → continue the numbering at 140.
7. Docs: AGENTS session-38 layer + counts, SKILL version + §50, PAD
   [S38], CLAUDE/README counts, `docs/session_75.md`, worklog, this
   plan's completion record.

## The addendum — the pixel-diff forensics (R37-E / R37-F)

The round's screenshot pairs pixel-diffed at 3.73% (loans) vs the ~1.1%
baseline — the forensic trace found two live gaps the probes had missed:

5. **R37-E — the SelectTrigger placeholder-state color**: REF renders a
   trigger in its PLACEHOLDER state (Radix's `data-placeholder`
   attribute, already set on every trigger) in **neutral-500
   rgb(115,115,115)** — live-measured on the loans "Select employee"
   and the assets "Not assigned"; valued triggers stay dark ("Standard
   Loan" = rgb(10,10,10)). Dark mode flips the placeholder to
   **#a3a3a3** (neutral-400, live-measured). NOT the muted-foreground
   token (slate-500 #64748b — a different REF gray). The clone's bare
   `SelectPrimitive.Value` left placeholder triggers in the dark
   foreground. Fix: the systemic trigger-recipe classes
   `data-[placeholder]:text-neutral-500
   dark:data-[placeholder]:text-neutral-400` in ui/select.tsx.
6. **R37-F — the loans Requesting-for card's border**: REF's card is
   `p-4 bg-blue-50 rounded-lg border border-blue-200` (1px
   rgb(191,219,254), unchanged in dark mode) — the clone's borderless
   card was 2px short (the 698-vs-696 dialog-height drift that shifted
   the whole interior stack 1px down: dlgY 102 vs 101, Paid From
   685 vs 686).

After the fixes: the loans dialog pair measured byte-identical
(trigger color, card border, 698×672 @ y=101) and the pair's
pixel-diff dropped to **1.41%** (the baseline band).

## Completion record (session 38)

Delivered in one window (session 75; see docs/session_75.md):

- **R37-A** (the DialogTrigger conversion): DONE — all five parity
  triggers (assets, loans, settings×3) wrapped `asChild`, the manual
  onClicks removed, the dialog roots LIFTED (the context requirement);
  focus restores to the trigger on close (live-verified 5/5 pairs) and
  the aria contract matches REF (haspopup/expanded, E2E-pinned).
  The loans empty-state CTA stays a plain button (REF's own carries no
  dialog semantics).
- **R37-B** (the asset at-rest enabled submit): DONE —
  `disabled={saving}` only.
- **R37-C** (the Add Level mr-1): DONE — 113×32 live pair.
- **R37-D** (the loans text/contract layer): DONE — reason required +
  the apartment placeholder, amount "0", paid-from "New Era LLC", the
  invented min/max/step dropped, the silent-return guard replaced by
  the API + toast superset.
- **R37-E / R37-F** (the addendum): DONE — the placeholder-state
  neutral-500/400 recipe + the card's border-blue-200; the loans pair
  byte-identical, pixel-diff at baseline.
- Gates at delivery: lint 0/0 · tsc ✓ · 582/582 unit (+13) · build ✓ ·
  165/165 E2E (+7). Live: **13/13 pair MATCH** (verify-r37.mjs) + the
  standing audits (mobile tabs byte-identical; the drawer pair
  re-verified manually after a transient click — 288px @ x=0, #FAFAFA,
  1px #e5e5e5; navmap, bell, quick actions). Two E2E races fixed
  en route: the legacy-assets toast-name strict-mode violation
  (exact:true — the round-36 class re-fired under the longer suite)
  and the loans initial-focus assertion (focus-inside-dialog poll).
  Two probe traps recorded: the flattened `//` comment swallowing the
  closing `})()` (the round-36 newline lesson's inverse) and the
  `[type=text]` CSS selector missing REF's attribute-less input (the
  property-based read is the reliable form).
- 8 screenshots (140-143, ref+loc pairs: the loans text layer, the
  Add Level mr-1, the focus-restore rings, the asset enabled submit) →
  **188 PNG captures**. DB pristine. `.env.example` re-verified.
