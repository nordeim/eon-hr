# Session 66 — Parity Round 65: The Margin/Gap Census (session journal)

**Landing state**: fresh clone at `0a31b7c` (the round-64 landing),
environment rebuilt per protocol, all five core docs re-read, the
r64 completion record verified in source (all 13 R65 fix sites).

**Baseline**: lint 0/0 · tsc ✓ · 892/892 unit · build ✓ · E2E 345/346 —
the one failure was the "session-58 switch/checkbox transient" firing
3× CONSECUTIVELY in isolation. Root-caused and RETIRED: the spec
counted `[aria-checked=true]` immediately after goto with no wait,
racing the async security-settings fetch. The wait (mirroring the
switches block in the same test) fixed it; 3× green. The
"documented transient" was a count-without-wait race all along.

**Deploy watch (the 29th)**: login JS `DcjXLM5U`→`q8Uif46n` + CSS
`D_pxMX7I`→`CiCfCTzx`, app side quiet. Full ladder after fresh
re-auth: standing 5/5 + sweep 12/12 + verify-r49 13/13 + verify-r45
13/13 — NON-VISUAL. Watch finals updated.

**The round**: the computed-style matrix covered color (r57–63 ×
light/dark) and padding+radius (r65, light) — but NO census had ever
read MARGINS or GAPS. The r66 census (margin 4 sides + rowGap +
columnGap, 49 routes, paired live, light, three batches): **pre-fix
19/49**.

**The instrument work**: mark I (one-sided space-y pairs → `v:N`)
still left positional noise — v3 zeroes the FIRST child, v4 the
LAST, and the tuple bundles each element's own gap, so position-equal
sets diverged anyway (batch 1 read 1/17). Mark II parses the parent's
authored `space-y-N` value from its class (rem scale → px, the last
token wins) and emits position-independent `v:N` for every
boundary-shaped pair. Batch 1 rose to 4/17 on the same code.

**The decomposition**: 30 DIFFs → 18 fix families + 4 documented
allowances (employees seeded, attendance admin superset, careers live
data, interviewassistant r48-C1). The finds:
- REF's page-scroll band (`absolute … h-20 -mt-20` + refresh-cw) —
  the r47 "documented non-clone", promoted to clone by its `-80px`
  census family (×8 routes).
- REF's empty-state icons are SVG-authored (`w-16 h-16 mx-auto mb-4
  text-slate-300` ON the svg; the clone's wrapper + `[&_svg]` divs
  retired; three icon names fixed).
- The StatCard tileFixed pages render the UNSPACED row (allleaverequests
  censused MATCH via set-absorption — set blindness's third face).
- The employees row/grid recipes (alwaysRow + `md:grid-cols-2
  lg:grid-cols-3 gap-6`).
- The Radix tabs rhythm — and the round's engine find: **the v4
  space-y margin on an INLINE-FLEX TabsList never collapses with the
  next sibling's margin-top** (48px vs REF's 24). The fix: the R22-B
  `mb-0!` kill + the content's own mt-6.
- The actions-cluster three-form truth (the session-5 "gap-3" was a
  frozen generalization: `flex gap-3` clusters, `flex gap-2`
  staffrequests, and the RAW BUTTON five).
- The companywall group's REF-side drift (R10-C's `space-y-3 +
  block leading-5` pin recorded a REF that no longer exists — now
  `space-y-2` + leading-none).
- Twelve smaller recipe fixes (payrollengine 4px groups,
  requestsettings' space-y-2 line, tenantsetup's ml-auto footer, the
  surveyanalytics single-grid + col-span-2, the shiftswap card-only
  wrapper, the offboarding gap-6 + the workflowautomation grid gate,
  the EMPTY hrassistant pane, the chat gap-2, the kanban flat root +
  bare drop zone, the mt-4 CTA, the PM bare `grid gap-6`, the
  evaluations space-y-3 line).

**TDD**: 18 unit pins (RED-first) → 910/910 green after the fixes +
7 legacy-pin amendments. 14 E2E computed-truth pins
(`tests/e2e/session66-margin-gap.spec.ts`) + 1 legacy E2E amendment →
**360/360**.

**Post-fix census: 45/49** — better than the plan's 43 projection;
every remaining DIFF is a documented allowance. Four execution-time
corrections were caught by the round's own verification loop (the
48px tabs trap, the shiftswap pills arrangement, the hrassistantchat
second empty state, the workflowautomation grid gate) — all recorded
in the plan's completion record.

**Gates**: lint 0/0 · tsc ✓ · 910/910 unit · build ✓ · 360/360 E2E ·
census 45/49 · 36 screenshots (368–403 → 580 files, no collisions,
the mobile pair byte-stable across rounds) · DB pristine.

**Frontier**: the computed-style matrix is complete across every
defined axis — color × theme, padding + radius, margin + gap. The
remaining cells: the DARK-mode re-census of the geometry/spacing
axes (theme-invariant by authoring, never computed-verified); the
muted-foreground/--primary token re-map stays optional; the deploy
watch stays armed at the post-29th finals.
