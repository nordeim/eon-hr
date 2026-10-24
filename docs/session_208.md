# Session 208 — Session 90 / Parity Round 89: the RTL select-mirroring + mobile bottom-sheet round

**Session file numbering:** this file continues the owner-facing chain (session_206.md = the session-89 dark/RTL second execution, session_207.md = the owner's transcript archive of that round). The remediation plan for this round lives at `docs/remediation-plan-session90.md`.

## The round in one paragraph

The r89 close-out's named queue — the two RTL-specific members (the assetmanagement select-chevron position, the allleaverequests header icon spacing) — was triaged into **three clone-authored defects, all TDD-fixed** (RED 6/6 → GREEN): **R90-A** the mobile select trigger's RTL chevron (the REF's mobile trigger is a plain button whose computed direction follows the html — the clone's stock Radix trigger stayed LTR-pinned), **R90-B** the REF's responsive select (the desktop popper swaps for a **bottom-sheet dialog below 768px** — never cross-compared before this round because the bands captured at-rest pairs only), and **R90-C** the assetmanagement filter option sets (the REF's 12 emoji-labeled types + the Returned/Pending Return statuses). The allleaverequests member was **CLOSED as the AA/subpixel floor** (the pill geometry identical to 0.01px cross-side; the deltas are the REF's own 0.66px svg undersizing). The opening read ran the full standing ladder on the detected **60th login deploy** — classified NON-VISUAL (the login pair byte-identical + 5/5 + 12/12 + 13/13 + 13/13 + Turnstile 0) — and the experiment-assignment probe ran as the standing capture step (three visitors: `control`/`tagline`/`tagline`).

## The R90-A revision (the round's measurement discipline)

The initial R90-A fix stripped Radix's `dir="ltr"` stamping from the trigger at all widths. The post-fix live verification then read the REF's DESKTOP RTL trigger for the first time: **the REF's desktop trigger CARRIES the `dir="ltr"` stamp** (the stock Radix form — the chevron at the trigger's right, rightGap 13) while its MOBILE plain button carries no dir (the chevron mirrored to the start side). The REF swaps the whole trigger form at the responsive boundary. The fix was REVISED the same round: the desktop branch keeps the stock stamping; the mirrored form comes from the mobile plain-button branch. The R90-A1 pin was rewritten to the two-viewport contract (mirrored at mobile, stock at desktop) — the wrong-width measurement lesson (the r89 per-axis census class) applied to the viewport axis.

## THE R90-B RECIPE (extracted verbatim from the live REF DOM)

- the breakpoint: **768px** (`736`/`640` → the sheet, `768` → the popper — live-verified)
- the overlay `fixed inset-0 z-50 bg-black/80`
- the sheet `fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background` (bg white, radius 10px top)
- the drag handle `mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted`
- the header `grid gap-1.5 p-4 text-center sm:text-left` > `h2 text-lg font-semibold leading-none tracking-tight` — the generic **"Select an option"**
- the list `p-4 pb-8 space-y-2 max-h-[60vh] overflow-y-auto`
- the option buttons `w-full flex items-center justify-between p-4 rounded-lg border transition-colors min-h-[44px]` — selected `bg-blue-50 border-blue-200 text-blue-900` + `Check h-4 w-4 text-blue-600`; unselected `bg-white border-slate-200 hover:bg-slate-50`
- the mobile TRIGGER: a **plain button** — no role, no aria-expanded, no data-state, no dir (live-verified)

The implementation (`ui/select.tsx`): the `Select` wrapper renders NO Radix below 768 — the trigger swaps to the plain button (the same visual classes + the `data-placeholder` color contract carried), the SelectValue becomes a plain span (the bare-placeholder pattern renders the selected label; the authored-children pattern — the companywall Users glyph — keeps the page's interior), the SelectContent drops out, and the sheet portals to body with the collected option list (one source of truth: the page's own SelectItems). The desktop path is untouched (the R90-B4 guard). The three GREEN-phase traps: the hidden native `<select>` (a Root without its Trigger defaults `isFormControl=true` — caught by the R88-D legacy pin), the nested SelectValue (inside the trigger, not a direct child — the recursive replacement), and the authored-interior pattern.

## R90-C the option sets (live-read from the open selects)

- STATUS: `All Statuses, Available, Assigned, Returned, Pending Return` (the clone's `Repair, Retired` retired; the StatusBadge map gains the two new members — the schema's free-string status needs no migration, the seeds and the "In Repair" card unchanged)
- TYPE: the REF's twelve — `All Types, 💻 laptop, 🖥️ desktop, 📱 phone, 📟 tablet, 🖥️ monitor, ⌨️ keyboard, 🖱️ mouse, 🎧 headset, 🪑 furniture, 🚗 vehicle, 📦 other` (the clone's seven plain labels retired; the emoji ride the SelectItem children so the popper, the sheet and the dialog all render the same set)

## The verification

- **The cross-side sheet comparison**: identical recipes both sides (the overlay color in its two serializations — rgba vs oklab, the v4 form; the sheet y=262 h=582; the handle; the h2; the list classes; **12 options both sides**; the selected blue-50 + the Check).
- **The RTL mobile re-capture**: assetmanagement **6 hot/max245 → 2 hot/max11** (MINOR — the chevron now mirrors); allleaverequests unchanged (the pill AA class, closed).
- **The mobile-menu cycle GREEN** on the remediated build (open → Training LMS → /training → the auto-close superset).
- **Gates: lint 0/0 · tsc ✓ · 950/950 unit · build ✓ 116/116 · E2E 501/501** (the 494 standing + the 7 new, 8.8m, zero flakes) · DB pristine.
- **The evidence chain 1453-1467** (10 PNGs) → **1615 tracked PNGs**.

## The round's instruments and traps

`r90-deploy-watch.mjs` (the 60th detection + the experiment probe) · `r90-ladder.mjs` (the full standing ladder) · `r90-rtl-members-capture.mjs` / `r90-rtl-members-diff.py` / `r90-cluster-locate.py` (the focused member pass) · `r90-rtl-members-probe.mjs` / `r90-rtl-filter-rows.mjs` (the DOM probes) · `r90-boot3200.mjs` (the detached boot) · `r90-crash-probe.mjs` (the pageerror capture). The traps retired: the **empty-AUTH_SECRET boot** (the `.env` dev value cannot boot the production standalone — the fixed 32-char dev secret, the r88 empty-grep class), the **bash-reaper** (backgrounded servers die with the tool shell — the node-spawn boot), the **EAGAIN daemon** (the cleanup + retry), the **agent-browser cwd** (screenshots save relative to the daemon cwd, not the shell's), the **SVGAnimatedString** (`svg.className` is not a string — `getAttribute("class")`), and the **native-select textContent pollution** (the R88-D lesson above).

## The r91 queue

1. The responsive-swap pattern's adoption surface: the DROPDOWN-MENU family (the REF may swap its dropdowns at mobile the same way — the select was verified this round; the dropdown content family was not).
2. The other pages' option inventories cross-side (the loan types, the request categories — the same open-state read this round did for assetmanagement).
3. The dark-band data-driven residuals' re-reads (the REF tenant's state — the standing watch).
4. The recharts-version grid class (undecouplable — the standing classification).
5. The 60th-or-newer login deploy ladder (the re-armed watch — Turnstile still 0 widgets).
