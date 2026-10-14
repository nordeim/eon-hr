# Session 76 (raw journal) — the window that delivered parity round 37

*The unedited narrative of session 75 / parity round 37. The polished
retrospective is docs/session_75.md; the plan with the completion
record is docs/remediation-plan-session38.md.*

The workspace had been reset — no local eon-hr. Fresh clone at
`0182f0d` (round 36 + the session-74 journal commit). Read the doc
chain: README, CLAUDE, AGENTS (the session-37 layer), the SKILL, PAD,
session_73/74, remediation-plan-session37, the worklog tail. This
window = session 38 / parity round 37. The frontier per round 36's
closing note: the keyboard/focus dimension ("Tab order in dialogs").

Environment rebuild: bun install; `.env` from `.env.example` with a
generated AUTH_SECRET (the production boot guard refuses the empty
dev fallback — ensure-server.sh failed first with exactly that). A
shell-level `DATABASE_URL=file:/home/z/my-project/db/custom.db` env
override was pointing the DB OUTSIDE the repo — unset it, removed the
stray DB, re-pushed + re-seeded to `<repo>/db/custom.db` (the
documented contract). Playwright chromium had to be reinstalled after
the reset (the browser binaries live outside the repo).

Baseline gates: lint 0/0 · tsc ✓ · 569/569 unit · build ✓ · 158/158
E2E — aligned with the documented round-36 state. Skills audit:
agent-browser (0.39.0) + tdd + tailwind-patterns, the established
toolset.

Census: no redeploy (login static + app chunks unchanged); REF still
zero-data. Standing audits — wrote probe-r37-standing.mjs; first run
2/5 with three probe artifacts (the documented lessons re-learned:
REF renders no nav/aside → the div.min-h-screen recipe for the
navmap; REF's bell is unnamed → the عربي-proximity snapshot recipe;
the drawer needs the width+bg filter to skip the 390px overlay).
After the fixes 4/5; the drawer's REF-side click was the documented
transient — the dedicated probe-r37-drawer.mjs (Escape-reset +
settle) read the pair byte-identical manually: 288px @ x=0, h=844,
#FAFAFA, 1px #e5e5e5.

The frontier probe — probe-r37-taborder.mjs: open each dialog, read
activeElement after open, Tab ×10, Escape, read the restore. The Tab
orders: structurally identical everywhere (including the wrap and the
time-input segment cycling; the shift "code" field exists on REF too
— first-read misparse). The find: REF restores focus to the TRIGGER on
close; the clone drops to BODY on every dialog. Root-caused by
reading the installed @radix-ui/react-dialog 1.2.0:
DialogContentModal's onCloseAutoFocus focuses
context.triggerRef.current — null without a DialogTrigger — and its
preventDefault kills the FocusScope's fallback. REF's triggers ARE
DialogTriggers (aria-haspopup=dialog + aria-expanded live-measured —
the round-36 regex lesson finally explained). The staffrequests
trigger on REF is a plain type=submit — deliberately out of scope.

More census along the way: the asset submit is disabled at rest on
the clone (`!form.name.trim()`) — a disabled button leaves the Tab
order (the probe's "skipped Cancel" artifact was a 220ms-settle
false read; manual 300ms trace: Cancel IS tabbable, only the disabled
submit skipped — REF keeps it enabled). The Add Level button: REF
113×32 (mr-1), clone 117×32 (mr-2) — same computed styles, the margin
is the whole diff. The loans text layer (the taborder2 probe on
/loans — the first attempt probed /staffrequests and found nothing):
the Reason placeholder differs (REF: "Hi, I'm buying an apartment and
I need a loan for the down payment."), Reason is required on REF, the
Amount defaults "0", the Paid From prefills "New Era LLC" (stable
across re-opens; REF's company is "Demo" — a hardcoded literal in
REF's form code), and REF's number inputs carry no min/max/step.

Plan written (docs/remediation-plan-session38.md) and validated
against the code — the critical wiring detail: DialogTrigger must sit
INSIDE its Dialog root's context, and all five roots wrapped only the
Content → the mechanical root-lift (roots move up; the dialog
components render bare DialogContent).

TDD: 13 RED pins → GREEN. The MultiEdit partial-application trap hit
three times (the tool applies the sequence and reports failure on the
non-matching edit — verify state after every failure); the
months-input indentation mismatch and the Shifts-anchored closing
tags were the specific catches. tsc clean after each file. The
R35-F10 and R22-C3 pins amended for the new markup. Unit 582/582.

E2E: 7 new specs in dialog-interiors.spec.ts. First full run: the
loans focus test failed on the INITIAL assertion (the first tabbable
is the Employee combobox, not an input — the focus-inside-dialog
poll). Then the legacy-assets round-trip failed in-suite but passed
solo — the round-36 toast-name strict-mode class re-fired under the
longer suite (exact:true; the serial stays non-exact — it rides
inside "Desktop · R30-SN-001" and the toast never contains it). The
Add Level 113 pin failed at 111 — headless Chromium rasterizes the
text ~2px narrower than the paired browser; the 110–115 window (the
tolerance precedent). Full suite: 165/165.

Live verification — verify-r37.mjs: 13/13 MATCH, but the loans text
layer took two probe fixes to read honestly: the CSS `[type=text]`
selector misses REF's attribute-less input (property-based reads),
and a `//` comment inside the flattened eval swallowed the closing
`})()` (the round-36 newline lesson's inverse — no comments in
flattened evals).

The screenshots pixel-diff caught what every probe had missed: the
loans pair diffed 3.73% vs the ~1.1% baseline. The forensic trace
through the diff bands: the Employee-row text pixels → REF's
placeholder-state Select triggers render rgb(115,115,115)
(neutral-500; valued triggers stay dark; dark flips to #a3a3a3) —
the clone's bare SelectPrimitive.Value left them in the foreground;
and the y=720 band → REF's Requesting-for card carries border
border-blue-200 (the 2px 698-vs-696 dialog height that shifted the
interior 1px). R37-E/F pinned and fixed; the pair then measured
byte-identical (trigger color, card border, 698×672 @ y=101) and the
pixel-diff dropped to 1.41% (baseline band). REF toggled to dark for
the dark-mode placeholder measurement and back to light (the
persisted-dark lesson).

Docs: AGENTS session-38 layer, SKILL 3.21.0 + §50, PAD [S38],
CLAUDE/README counts (582 unit · 165 E2E · 188 captures),
docs/session_75.md, the plan's addendum + completion record, the
worklog. DB pristine (users=1, employees=1, zero mutations).
`.env.example` re-verified.

Delivery: committed c924dd9 (29 files, +1518/−77), pushed via the SSH
wrapper (paramiko shim re-deployed to the workspace bin/ — paramiko
5.0.0 with --break-system-packages; the wrapper's --remote override
to nordeim/eon-hr per the round-36 lesson), remote verified, tree
clean, operator key shredded. This journal is the post-push commit.
