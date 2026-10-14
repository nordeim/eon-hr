# Session 75 — eon-hr parity round 37 (the keyboard/focus dimension)

*The Tab-order probe: walk the dialogs with the keyboard on both apps,
then press Escape and read where focus lands. The walk was identical
everywhere — the find was the close. REF's triggers are real Radix
DialogTriggers; the clone's plain onClick buttons dropped focus to
BODY on every dialog close.*

## The opening state

No redeploy (the login static build + the app chunks all unchanged —
every app-level pin holds; every diff clone-side). REF still zero-data
(the with-data frontier stays blocked). Standing audits green (5/5):
the mobile bottom nav byte-identical (nav y=766 h=78 w=390, tabs
x=10/79/139/204/313 all 775y+61h), the mobile drawer byte-identical
(288px @ x=0, h=844, #FAFAFA, 1px #e5e5e5 — the Escape-reset + settle
pattern, after a toggle-state race produced a false first read), the
desktop navmap byte-identical (13 items at 141…621, matched by tag via
the div.min-h-screen recipe — REF renders no nav/aside), the bell
popover identical, the Quick Actions geometry-identical. **Mobile
navigation fully green — no Tailwind v4 bug.**

## The census — the keyboard/focus dimension

Round 36 named the frontier. The probe: open each dialog on both apps,
record activeElement after open, press Tab ×10 reading the focused
element each time, then Escape and read the restore target.

### The green half

The Tab orders are structurally identical on all five parity dialogs
(Add Department, Create Approval Workflow, Add Shift, Add Asset, New
Loan Request): initial focus lands on the first tabbable on both; the
sequence follows the DOM (fields → footer Cancel → submit → the Close
X → wrap); the time inputs cycle their internal segments identically
(native browser behavior). The staffrequests "New Request" trigger on
REF is a plain type=submit with NO dialog semantics — the clone's
plain trigger there is correct parity, deliberately outside the
conversion scope.

### R37-A — the DialogTrigger conversion (the round's core)

REF's triggers on /assets, /loans and the three /settings tabs are
Radix DialogTriggers: live-measured `aria-expanded="false"` +
`aria-haspopup="dialog"` + `aria-controls="radix-:…:"` + type=button —
and on close focus RETURNS TO THE TRIGGER. The clone's five plain
`<Button onClick={setOpen}>` triggers carried no aria contract and
dropped focus to BODY on close. The root cause was read straight from
the installed @radix-ui/react-dialog 1.2.0: `DialogContentModal`'s
`onCloseAutoFocus` focuses `context.triggerRef.current` — null without
a DialogTrigger — and its `event.preventDefault()` ALSO suppresses the
FocusScope's fallback (`focus(previouslyFocusedElement)`). So focus
dies on BODY, on every close, on every dialog.

The fix is the Radix-native `<DialogTrigger asChild>` at all five
sites — which REQUIRES the mechanical root-lift: DialogTrigger only
works inside its Dialog root's context, and all five roots wrapped
only the Content. Each `<Dialog open onOpenChange>` wrapper moved up
to enclose BOTH the trigger region and the dialog component (the root
renders no DOM — layout untouched); the dialog components dropped
their own roots and render bare `<DialogContent>`. The Button sets no
`type`, so the trigger's `type="button"` survives the Slot merge
(REF's measured type). Live-verified: **5/5 restore pairs MATCH**.

### R37-B/C — the two one-liners

The asset dialog's submit was `disabled={saving ||
!form.name.trim()}` — a disabled button leaves the Tab order (the
census's first "skip" artifact, disproved by manual trace: only the
DISABLED submit was skipped) and deadens the empty-submit; REF keeps
it enabled so the native validation tooltip fires. Now saving-only.
And REF's interior Add Level = 113×32 (`w-4 h-4 mr-1` — the
session-35 census documented 113 but never pinned it); the clone's
mr-2 measured 117 and shifted the dialog's right-edge stack (Cancel
x=911 vs 907). One class.

### R37-D — the loans text/contract layer

The round-36 lesson repeated: geometry audits miss text. The loans
interior was form-verified in round 36 but never placeholder/value-
compared. The full sweep: the Reason textarea is `required` on REF
with the placeholder **"Hi, I'm buying an apartment and I need a loan
for the down payment."** (the clone's "e.g. Family relocation…" was
invented); the Amount input DEFAULTS to "0"; the Paid From input
PREFILLS **"New Era LLC"** (stable across re-opens — a hardcoded form
default in REF's code; REF's own company is "Demo", so the literal is
not company-driven); REF's number inputs carry NO min/max/step
(required only — the clone's invented constraints changed the native
validation surface; the API's Zod + toast is the enforced superset);
and the silent-return client guard (`amount <= 0 → return`) is the
round-36 anti-pattern — with the "0" prefill an immediate submit now
flows to the API and surfaces the Zod error as a toast.

## The addendum — the pixel-diff forensics (R37-E / R37-F)

The round's screenshot pairs pixel-diffed at 3.73% (loans) vs the
~1.1% baseline — a forensic trace through the diff bands found two
live gaps the probes had missed. **R37-E**: REF renders a Select
trigger in its PLACEHOLDER state (Radix's `data-placeholder`
attribute, already set on every trigger) in **neutral-500
rgb(115,115,115)** — live-measured on the loans "Select employee" and
the assets "Not assigned"; valued triggers stay dark; dark mode flips
the placeholder to #a3a3a3 (neutral-400). NOT the muted-foreground
token (slate-500 #64748b — a different REF gray). The systemic fix
rides the trigger recipe in ui/select.tsx. **R37-F**: REF's
Requesting-for card is `p-4 bg-blue-50 rounded-lg border
border-blue-200` (1px rgb(191,219,254), unchanged in dark) — the
clone's borderless card was 2px short, the 698-vs-696 dialog-height
drift that shifted the whole interior 1px (dlgY 102 vs 101). After
both fixes the loans pair measured byte-identical (trigger color,
card border, 698×672 @ y=101) and the pixel-diff dropped to **1.41%**
(the baseline band).

## The E2E races + the probe traps

Two E2E races fixed en route: the legacy-assets toast-name strict-mode
violation (getByText matched the row AND the toast description — the
round-36 class re-fired under the longer suite; `exact:true`, with the
serial left non-exact since it rides inside "Desktop · R30-SN-001")
and the loans initial-focus assertion (assert focus-inside-dialog via
poll, not the first input — the loans dialog's first tabbable is the
Employee combobox). Three probe traps recorded: (1) a 220ms
inter-press settle is too fast for Tab-sequence reads — 300ms+ is the
floor; (2) the drawer probe needs an explicit closed-state reset
before opening — a second run through an already-open drawer CLOSES it
and reads the mid-exit frame; (3) NO `//` comments inside flattened
evals (a flattened `//` swallows the closing `})()` — the round-36
newline lesson's inverse), and property-based reads (`i.type`) over
CSS attribute selectors (`[type=text]` misses REF's attribute-less
input).

## Gates + delivery

**lint 0/0 · tsc ✓ · 582/582 unit (+13) · build ✓ · 165/165 E2E
(+7)** — the five focus-restore pairs, the trigger aria contract, the
asset at-rest enabled submit, the loans text layer, the Add Level
113px window (a 110–115 tolerance: headless Chromium rasterizes the
text ~2px narrower than the paired browser). Live: **13/13 pair
MATCH** (verify-r37.mjs) + the standing audits. Three earlier pins
amended (R35-F10, R22-C3 for the new markup; the D-block recalibrated
for comments-in-source).

8 screenshots (140-143, ref+loc pairs: the loans text layer, the
Add Level mr-1, the focus-restore rings, the asset enabled submit) →
**188 PNG captures**. DB pristine. `.env.example` re-verified against
the codebase (the two documented variables).

Docs: AGENTS session-38 layer, SKILL 3.21.0 + §50, PAD [S38],
CLAUDE/README counts (582 unit · 165 E2E · 188 captures), this session
log, the plan's completion record, the worklog.
