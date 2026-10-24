#!/usr/bin/env python3
"""r86-docs-patch.py — session-86 docs layer: the count-lockstep fixes
(941+433=1374) + the session-86 clauses (CLAUDE L7 intro + the ledger
table) + the SKILL version bump 3.68.0→3.69.0 + §96 + the AGENTS
session-86 layer + the worklog round-85 entry."""
import re

S86_CLAUSE = (
    " | + the session-86 cross-side at-rest pixel-diff evidence (9 new specs — the session86-crossdiff spec: "
    "the round's fresh-eyes instrument — THE CROSS-SIDE AT-REST PIXEL-DIFF PROTOCOL (the r85 close-out's named "
    "frontier, the program's FIRST REF<->LOC pixel comparison at scale: ten at-rest pairs @1440x900, the r85 "
    "focus-png-diff pattern extended to the standing route set, every finding per-side BYTE-STABLE against the "
    "r85 baselines — long-standing deltas invisible to the per-side chains by design) — found SEVEN clone-authored "
    "defects, ALL TDD-FIXED: R86-A the payrollreports FIVE-member structural divergence (the thead-level header "
    "typography REF bg-slate-50 text-slate-600 text-xs uppercase vs the LOC's inherited text-sm 14px Title-case; "
    "the +24px container offset — a NEW TW-v4 trap class: the REF's v3-style space-y margin-TOP on the second "
    "child collapses out of the padding-less container past the display:none md:hidden mobile header, while v4's "
    "margin-block-end-on-:not(:last-child) never collapses — fixed with mt-6 on the PageHeader's desktop row; the "
    "CardHeader's invented border-b; the stats section's whole structure — p-0 body + the grid's own p-4 "
    "border-b border-slate-100 + the bg-slate-50 rounded-lg p-3 boxed cells with DIV children; the title block's "
    "<p>+inline-svg line-box expansion +16px vs the REF's flex items-center gap-2 DIV h20); R86-B the payroll "
    "month filter's empty default vs the REF's pre-filled current period; R86-C/D/F/G FOUR icon-identity defects "
    "path-data-verified (settings Company Building2->Settings + Approval Workflows Workflow->CircleCheckBig; "
    "training's empty state GraduationCap->Video; payroll's Reports & Export FileDown->ChartColumn; the settings "
    "Edit button Pencil->SquarePen); R86-E the assetmanagement Actions th text-right->left; + the post-fix pixel "
    "re-verify: payrollreports 296->0 structural cells, the four data-driven clusters classified (the REF tenant's "
    "emptied employees/jobs + the role-scoped attendance state); the 58TH login deploy fully laddered NON-VISUAL "
    "at the opening (JS+CSS+the NEW frontend-config script carrying a TURNSTILE_SITE_KEY — the rollout "
    "configured-but-not-rendered, the standing watch escalated); the patch watch MOVEMENT (16.4.3 stable, "
    "bug-fix backports only, no security content — the codebase HOLDS at 16.4.2 per the standing precedent); "
    "the NEW standing finding — NON-DETERMINISTIC REF-SIDE THEME VARIANCE (the REF's dark sidebar flips between "
    "two palettes across sessions with no deploy; 10 band/theme REF drifts classified by the recheck pass); "
    "E2E 433/433 (the 424 standing + the 9 new, 7.2m, zero flakes); 1406 tracked screenshots (+112)"
)

def patch(path, edits, desc):
    s = open(path, encoding="utf-8").read()
    for old, new, count in edits:
        if old not in s:
            print(f"  MISS in {path}: {desc} — {old[:70]!r}")
            continue
        s = s.replace(old, new, count)
    open(path, "w", encoding="utf-8").write(s)
    print(f"patched {path} ({desc})")

# ---- CLAUDE.md: the count lockstep + the L7 session-86 clause + the ledger ----
patch("CLAUDE.md", [
    ("1337-spec test pyramid (941 unit + 396 E2E", "1374-spec test pyramid (941 unit + 433 E2E", 1),
], "L7 count lockstep")

# the L7 intro's session-85 clause tail — append the session-86 clause after the r85 E2E sentence
s = open("CLAUDE.md", encoding="utf-8").read()
m = re.search(r"the 56TH \+ the 57TH each step-1-proven non-visual at the round-ends[^(]*", s)
anchor = None
for cand in ["the 56th + 57th deploys each step-1-proven non-visual", "TWO round-end deploys (the 56th + the 57th) each step-1-proven non-visual"]:
    i = s.find(cand)
    if i > 0:
        anchor = cand
        break
if anchor:
    # append after the sentence ending near that anchor (find the next ' · ' or ')' boundary)
    i = s.find(anchor)
    # find end of that sentence: the next ' |' or ' ·' after the anchor
    j = min([x for x in [s.find(" |", i), s.find(" · the", i)] if x > 0] or [len(s)])
    s = s[:j] + S86_CLAUSE + s[j:]
    open("CLAUDE.md", "w", encoding="utf-8").write(s)
    print("CLAUDE.md L7 session-86 clause appended at", anchor[:50])
else:
    # fallback: append to the ledger table row (line 64 family) — find the session-85 clause end
    i = s.find("the session-85 keyboard-navigation cycle evidence")
    if i > 0:
        j = s.find("\n", i)
        s = s[:j] + S86_CLAUSE + s[j:]
        open("CLAUDE.md", "w", encoding="utf-8").write(s)
        print("CLAUDE.md ledger session-86 clause appended")

# ---- README.md: the count lockstep ----
patch("README.md", [
    ("396 specs across auth, nav (61 routes", "433 specs across auth, nav (61 routes", 1),
    ("Playwright E2E (396 specs)", "Playwright E2E (433 specs)", 1),
], "count lockstep")

# ---- eon-hr_SKILL.md: version bump + §96 ----
s = open("eon-hr_SKILL.md", encoding="utf-8").read()
old_ver = "**Version:** 3.68.0 (session-85 audit complete"
i = s.find(old_ver)
if i > 0:
    j = s.find("\n", i)
    new_ver = (
        "**Version:** 3.69.0 (session-86 audit complete — the cross-side at-rest pixel-diff round: the program's "
        "FIRST REF<->LOC pixel comparison at scale (the r85 focused-pair instrument class extended to the standing "
        "route set — ten at-rest pairs, every finding per-side byte-stable, i.e. long-standing deltas invisible to "
        "the per-side chains) found SEVEN clone-authored defects, ALL TDD-FIXED: the payrollreports five-member "
        "structural divergence (thead typography + the +24px space-y MARGIN-COLLAPSE trap — a NEW TW-v4 class: "
        "v3-style margin-top on the sibling past a display:none first child collapses out of the padding-less "
        "container; v4's margin-block-end-on-:not(:last-child) never does — fixed with mt-6 on the desktop header "
        "row + the borderless CardHeader + the stats section's boxed-cell structure + the title DIV flex form), "
        "the payroll month filter's empty default, four path-data-verified icon identities (Settings/CircleCheckBig/"
        "Video/ChartColumn/SquarePen), and the assetmanagement Actions th alignment; pinned by the session86-crossdiff "
        "spec (9 tests) + three amended unit recipe pins; the post-fix pixel re-verify: payrollreports 296->0 "
        "structural cells; the 58th login deploy fully laddered NON-VISUAL (the NEW frontend-config script ships a "
        "TURNSTILE_SITE_KEY — configured-but-not-rendered, the watch escalated); the patch watch moved (16.4.3 "
        "stable, no security content — HOLD at 16.4.2); the NEW standing finding: NON-DETERMINISTIC REF-SIDE THEME "
        "VARIANCE (the REF's dark sidebar flips palettes across sessions, no deploy — 10 band/theme drifts "
        "classified); the ninth-sandbox DB trap variant documented (no exported DATABASE_URL — the CLI/seed resolves "
        "the relative URL CWD-anchored OUTSIDE the repo; the fix: the per-invocation absolute pin). Gates: lint 0/0 · "
        "tsc · 941/941 unit · build · E2E 433/433 (the 424 standing + the 9 new, zero flakes) · 1406 tracked "
        "screenshots (+112). SEVEN DEFECTS FIXED + THE CROSS-SIDE PIXEL PROTOCOL MADE STANDING · **Last updated:** 2026-10-24)"
    )
    s = s[:i] + new_ver + s[j:]
    open("eon-hr_SKILL.md", "w", encoding="utf-8").write(s)
    print("SKILL version bumped to 3.69.0")
else:
    print("MISS: SKILL version line")

S96 = """
## §96 Session 86 (parity round 85) — the cross-side at-rest pixel-diff round: the program's FIRST REF↔LOC pixel comparison at scale finding SEVEN clone-authored defects, ALL TDD-FIXED (the payrollreports five-member structural divergence incl. the NEW TW-v4 space-y margin-collapse trap + the payroll month default + four path-data-verified icon identities + the Actions th alignment) + the 58th deploy laddered non-visual + the non-deterministic REF theme variance documented

**THE INSTRUMENT — THE CROSS-SIDE AT-REST PIXEL-DIFF PROTOCOL** (`scripts/r86-crossdiff-capture.mjs` + `r86-crossdiff-diff.py` + `r86-crossdiff-triage.mjs` + the `r86-crossdiff-verify.mjs` post-fix pass): ten at-rest pairs @1440×900 LIGHT LTR (login fresh-sessions + the seven standing routes + the two r85 fix-evidence routes), the PIL grid diff (48px cells, channel thresholds, cluster bounding boxes), and the DOM triage (elementFromPoint chains + targeted recipe probes). **THE DRIFT CHECK FIRST: every pair per-side BYTE-STABLE against the r85 baselines** — the whole finding set long-standing, invisible to the per-side byte chains BY DESIGN (each side compares against ITSELF across rounds; the r85 badge lesson generalized: the cross-side pixel protocol is now STANDING, re-runnable any round).

**THE SEVEN DEFECTS (all RED-pinned by `tests/e2e/session86-crossdiff.spec.ts`, 9 tests, GREEN 9/9):** R86-A the payrollreports five-member structural divergence (296 differing cells): A1 the thead-level header typography (REF `bg-slate-50 text-slate-600 text-xs uppercase` on the THEAD with bare px-4 py-3 alignment th's → 12px/700/UPPERCASE, the header row h40; the LOC rode the table's text-sm → 14px Title-case, h44); **A2 the +24px container offset — the NEW TW-v4 trap class (the space-y margin-collapse family): the REF's v3-style space-y puts margin-TOP on `sibling ~ sibling` children, and with the container's FIRST DOM child the `md:hidden` mobile sticky header (display:none at desktop), the SECOND child's mt24 COLLAPSES out of the padding-less container → the whole page sits 24px lower (y56 vs y32); TW v4's space-y compiles to `margin-block-end` on `:not(:last-child)` (read from the built CSS) — no first-child margin-top, no collapse — fixed with `className="mt-6"` on the PageHeader usage (inert at mobile where the REF has no offset either)**; A3 the CardHeader's invented `border-b` (REF: `flex flex-col space-y-1.5 p-6 pb-3` borderless) + the title block (the REF's FLEX DIV `font-semibold leading-none tracking-tight flex items-center gap-2` h20 vs the LOC's `<p>`+inline-svg whose line box expanded to 36px, +16px on everything below); A4 the stats section (REF: CardContent `p-0` + the grid's own `p-4 border-b border-slate-100` + `bg-slate-50 rounded-lg p-3` boxed cells with DIV children, the grid h105 vs the LOC's h48). R86-B the payroll month filter's empty default (the REF pre-fills the current period — "October 2026"). R86-C/D/F/G four icon-identity defects, path-data-verified against the REF's rendered svgs (settings Company `Building2`→`Settings`; Approval Workflows `Workflow`→`CircleCheckBig`; training's empty state `GraduationCap`→`Video`; payroll's Reports & Export `FileDown`→`ChartColumn`; the settings Edit button `Pencil`→`SquarePen`). R86-E the assetmanagement Actions th (`text-right` override dropped — the component default text-left matches the REF verbatim). **THE POST-FIX PIXEL RE-VERIFY: payrollreports 296 → 0 structural cells** (the AA-noise floor); training 0; the residuals = subpixel border-AA noise (below the parity bar). The DATA-DRIVEN clusters classified: employees (the REF's emptied tenant vs the seeded LOC), recruitment (the REF's 1 job vs the documented 0-job seed), attendance (the REF's role-restricted view — the r81 role-scoped class).

**THE 58TH LOGIN DEPLOY — FULLY LADDERED NON-VISUAL at the opening** (JS `BgH6kzLl→DzlN4LV0` + the NEW `frontend-config` script + the CSS `--4Ltml9o→BD8HgQNX`, the first CSS movement since the 43rd-line sweeps): the fresh login pair BYTE-IDENTICAL to `69aa4241…` + standing 5/5 + sweep 12/12 + verify-r49 13/13 + verify-r45 13/13. The new `/api/frontend-config.js?v=3` bootstrap ships a TURNSTILE_SITE_KEY with ZERO widgets rendered — the standing Turnstile watch escalated to key-shipped/rollout-pending.

**THE NEW STANDING FINDING — NON-DETERMINISTIC REF-SIDE THEME VARIANCE:** 10 REF captures drifted at the secondary bands (sm/xl/dark/rtl) with NO deploy (the fingerprints unchanged, the login byte-stable); the recheck pass (`scripts/r86-ref-drift-recheck.mjs`) classified 6 as transient capture flakes and the decisive live re-read proved the cause — **the REF's dark sidebar flips between two palettes ((24,24,27) zinc / (15,23,42) navy) across sessions/boots**. The affected band/theme baselines re-anchored at the r86 captures; the r87 chain re-compares.

**THE ROUND'S TRAPS (all retired):** the ninth-sandbox DB variant (no exported `DATABASE_URL` for the first time — the Prisma CLI/seed resolves the relative `file:../db/custom.db` CWD-anchored OUTSIDE the repo while the standalone's db-path seam reads inside it → P2021 no-table; the standing fix: `DATABASE_URL="file:$(pwd)/db/custom.db"` per CLI invocation) · the standalone port default (PORT=3200 explicit — the bare boot listens on 3000) · the eval `//` comment trap (newlines joined to spaces → the comment swallows the expression) · the mid-round chromium cache wipe (reinstall foreground) · **THE SANDBOX READ-LAYER CACHE CORRUPTION (the payroll page read as `const onthFilter` — a missing `[m` — through bash/python readers while the Read/Edit tools and every compiler saw the valid bytes; the AST parse proof settled it: trust the Read tool + the compilers over bash reads when content looks impossible)** · the VLM's crop-level misreads (settled by computed-style reads).

Gates: lint 0/0 · tsc ✓ · **941/941 unit** (three R13 recipe pins amended to the corrected icons — the count-lockstep rule) · build ✓ · **E2E 433/433 (the 424 standing + the 9 new — 7.2m, zero flakes)** · byte-stability: the primary surfaces every-REF-STABLE + the five remediated routes DRIFT-BY-DESIGN + the band/theme REF variance classified · **1406 tracked screenshots (+112, the 1113-1223 set)** · DB pristine. The plan: `docs/remediation-plan-session86.md`; the narrative: `docs/session_195.md`.
"""
s = open("eon-hr_SKILL.md", encoding="utf-8").read()
s = s.rstrip("\n") + "\n" + S96
open("eon-hr_SKILL.md", "w", encoding="utf-8").write(s)
print("SKILL §96 appended")

# ---- AGENTS.md: the session-86 layer ----
AG = """
## Session 86 (parity round 85) — the cross-side at-rest pixel-diff round: the 58th login deploy fully laddered NON-VISUAL at the opening (JS + the NEW frontend-config script + the first CSS movement since the 43rd line) + THE CROSS-SIDE AT-REST PIXEL-DIFF PROTOCOL (the r85 close-out's named frontier — the program's FIRST REF↔LOC pixel comparison at scale, every finding per-side byte-stable) finding SEVEN clone-authored defects, ALL TDD-FIXED (R86-A the payrollreports five-member structural divergence incl. the NEW TW-v4 space-y margin-collapse trap + R86-B the payroll month default + R86-C/D/F/G four path-data-verified icon identities + R86-E the Actions th alignment) + the NEW standing finding: NON-DETERMINISTIC REF-SIDE THEME VARIANCE

**THE OPENING READ: THE 58TH LOGIN DEPLOY — FULLY LADDERED NON-VISUAL.** Login JS `index-BgH6kzLl → index-DzlN4LV0` + a NEW NAMED `frontend-config` script (`/api/frontend-config.js?v=3` — a 1,529-byte `window.__APP_CONFIG__` bootstrap carrying backend URLs AND A TURNSTILE_SITE_KEY, with the login census still reading ZERO widgets — the rollout CONFIGURED-BUT-NOT-RENDERED, the standing Turnstile watch ESCALATED to key-shipped/rollout-pending) + the login CSS `index--4Ltml9o → index-BD8HgQNX` (the first login-CSS movement since the 43rd-line sweeps); the app side QUIET `C-IrDy5f`/`BGNH4KkS`. The full ladder: the fresh login pair **BYTE-IDENTICAL** to the standing `69aa4241…` baseline + standing **5/5** + sweep **12/12** + verify-r49 **13/13** (the first run 10/13 — three REF-side timing flakes, clean on the careful re-run) + verify-r45 **13/13** → **NON-VISUAL.** The CSS forensic: the new 904,220-byte login CSS structurally unchanged. Close-out traps retired (the ref re-auth BEFORE the standing run; the loc careful re-auth; the r45 probe user swept; DB pristine).

**THE CODE AUDIT (the repo skills' lens — `skills/web-application` §12/§18): the r85 diff CLEAN.** The patch watch MOVED: `16.4.3` stable (bug-fix backports, NO security content — the 14 Oct 2026 security update shipped in 16.4.1, already covered by the pinned 16.4.2) → **HOLD at 16.4.2** per the standing precedent (lockfile-verified; canary `16.5.0-canary.25`). The TW-v4 scan: **16 `!important`** (r85's badge print rule added the 16th; the docs' count-lockstep fixed this round). Secrets zero; oklch comments-only.

**THE FRESH-EYES INSTRUMENT — THE CROSS-SIDE AT-REST PIXEL-DIFF PROTOCOL** (`scripts/r86-crossdiff-capture.mjs` + `-diff.py` + `-triage.mjs` + the `-verify.mjs` post-fix pass): ten at-rest pairs @1440×900 LIGHT LTR; **every pair per-side BYTE-STABLE against the r85 baselines** — the findings are long-standing deltas invisible to the per-side chains by design. The pass found EIGHT structural clusters → triaged into THREE data-driven classes (the REF's emptied tenant: employees/recruitment; the role-scoped attendance state) and **SEVEN clone-authored defects.**

**R86-A — THE PAYROLLREPORTS FIVE-MEMBER STRUCTURAL DIVERGENCE** (296 differing cells): **A1** the thead-level header typography (REF `<thead className="bg-slate-50 text-slate-600 text-xs uppercase">` with bare alignment th's → 12px/700/UPPERCASE, the row h40; the LOC rode the table's text-sm → 14px Title-case, h44); **A2 the +24px container offset — A NEW TW-v4 TRAP CLASS (the space-y margin-collapse family): the REF's v3-style space-y puts margin-TOP on `sibling ~ sibling` children; the container's first DOM child is the `md:hidden` mobile sticky header (display:none at desktop), so the second child's (the desktop header row's) mt24 COLLAPSES out of the padding-less max-w-7xl container → the whole page sits 24px lower (y56 vs y32); TW v4's space-y compiles to `margin-block-end` on `:not(:last-child)` — no first-child margin-top, no collapse. FIXED with `className="mt-6"` on the PageHeader usage (the existing extension point; inert at mobile where the REF has no offset either)**; **A3** the CardHeader's invented `border-b` (REF borderless `flex flex-col space-y-1.5 p-6 pb-3`) + the title block (the REF's FLEX DIV `…flex items-center gap-2` h20 vs the LOC's `<p>`+inline-svg line-box 36px, +16px below); **A4** the stats section (REF: CardContent `p-0` + the grid's own `p-4 border-b border-slate-100` + `bg-slate-50 rounded-lg p-3` boxed cells with DIV children, h105 vs the LOC's h48). **R86-B** the payroll month filter's empty default (the REF pre-fills "October 2026"). **R86-C/D/F/G** four icon-identity defects, path-data-verified (Company `Building2`→`Settings`; Approval Workflows `Workflow`→`CircleCheckBig`; training's empty `GraduationCap`→`Video`; payroll's Reports & Export `FileDown`→`ChartColumn`; the settings Edit `Pencil`→`SquarePen`). **R86-E** the assetmanagement Actions th (the `text-right` override dropped — the component default text-left matches the REF verbatim).

**THE CONTRACT PINS — `tests/e2e/session86-crossdiff.spec.ts` (9 tests):** A1/A2/A3+A4/B/C/D/E RED pre-fix as designed (+F/G added after their verify-pass discovery), **GREEN 9/9, the full suite 433/433** (the 424 standing + the 9 new — 7.2m, zero flakes after the selector-timing fix). Three unit-side R13 recipe pins amended to the corrected icons (the count-lockstep rule; 941/941 unchanged). **THE POST-FIX PIXEL RE-VERIFY: payrollreports 296 → 0 structural cells** (the AA-noise floor); training 0; the residuals subpixel border-AA (below the bar, computed styles verified IDENTICAL).

**THE BYTE CHAINS (`scripts/r86-screenshots.mjs` + `-complete.mjs`, numbers 1113-1223, 112 PNGs → 1406 tracked):** the login + focused pairs both STABLE; the routes @1440 exactly the five remediated routes DRIFT-BY-DESIGN (LOC), the untouched four STABLE, **every REF STABLE at the primary surfaces**; the drawer pairs both STABLE; the mobile-menu cycle GREEN. **THE BAND/THEME REF VARIANCE (a NEW standing finding):** 10 REF captures drifted at the secondary bands — the recheck pass (`scripts/r86-ref-drift-recheck.mjs`) classified 6 TRANSIENT and proved the cause by the decisive live re-read: **NON-DETERMINISTIC REF-SIDE THEME VARIANCE — the REF's dark sidebar flips between two palettes ((24,24,27) zinc / (15,23,42) navy) across sessions with NO deploy.** The affected baselines re-anchored at the r86 captures; the r87 chain re-compares.

**THE ROUND'S TRAPS (all retired):** THE NINTH-SANDBOX DB VARIANT (no exported `DATABASE_URL` for the first time — the CLI/seed resolve the relative URL CWD-anchored OUTSIDE the repo → P2021; the fix: the per-invocation absolute pin) · the standalone port default (PORT=3200 explicit) · the eval `//` comment trap · the mid-round chromium cache wipe · **THE SANDBOX READ-LAYER CACHE CORRUPTION (bash/python read `const onthFilter` — a missing `[m` — while the Read/Edit tools and the compilers saw the valid bytes; the AST parse proof settled it)** · the VLM's crop-level misreads (settled by computed styles).

Gates: lint 0/0 · tsc ✓ · **941/941 unit** · build ✓ · **E2E 433/433 (zero flakes)** · byte-stability: the primary surfaces REF-STABLE + the five remediated routes DRIFT-BY-DESIGN + the band/theme variance classified · **1406 tracked screenshots (+112)** · DB pristine (users = [sepnetflix2023@outlook.com], employees 1, balances 2, jobPostings 0). The plan: `docs/remediation-plan-session86.md`; the narrative: `docs/session_195.md`; the SKILL §96 (v3.69.0).
"""
s = open("AGENTS.md", encoding="utf-8").read()
s = s.rstrip("\n") + "\n" + AG
open("AGENTS.md", "w", encoding="utf-8").write(s)
print("AGENTS session-86 layer appended")

# ---- worklog.md: the round-85 entry ----
WL = """
---
Task ID: round-85
Agent: main (Super Z)
Task: Session 86 / Parity Round 85 — the cross-side at-rest pixel-diff round (the r85 close-out's named frontier)

Work Log:
- Workspace RESET before the round (the eighth of the record): fresh clone @ 6a190c0 · the environment rebuilt (.env + bun install 525 + db:generate/push/seed) · the round mapped as Session 86 / Parity Round 85 (plan session86, narrative session_195) · THE NINTH-SANDBOX DB TRAP VARIANT: no exported DATABASE_URL (a first) — the CLI/seed resolved the relative URL CWD-anchored OUTSIDE the repo (P2021 no-table); fixed with the per-invocation absolute pin; PORT=3200 explicit
- Baseline gates: lint 0/0 · tsc clean · 941/941 unit · build OK · standalone healthy
- THE OPENING READ: the 58TH login deploy detected (JS BgH6kzLl→DzlN4LV0 + the NEW frontend-config script + the CSS --4Ltml9o→BD8HgQNX, the first CSS movement since the 43rd line; app QUIET; census unchanged) → FULLY LADDERED NON-VISUAL (the fresh login pair BYTE-IDENTICAL to 69aa4241 + standing 5/5 + sweep 12/12 + verify-r49 13/13 after the careful re-run + verify-r45 13/13) · the CSS forensic (904,220 B, structurally unchanged) · the frontend-config ships a TURNSTILE_SITE_KEY with ZERO widgets rendered — the Turnstile watch ESCALATED · close-out traps retired (ref re-auth first, loc careful re-auth, the r45 probe user swept, DB pristine)
- THE CODE AUDIT (skills/web-application §12/§18): the r85 diff CLEAN · the patch watch MOVED (16.4.3 stable, bug-fix backports only, no security content — HOLD at 16.4.2 per the precedent) · the TW-v4 scan count-lockstep drift found (16 !important, not the documented 15 — r85's own badge print rule; fixed in the docs)
- THE FRESH-EYES INSTRUMENT: the CROSS-SIDE AT-REST PIXEL-DIFF PROTOCOL (r86-crossdiff-capture/diff/triage) — ten at-rest pairs @1440×900; EVERY pair per-side BYTE-STABLE vs the r85 baselines (the findings long-standing, invisible to the per-side chains); EIGHT structural clusters → triaged (3 data-driven classes + SEVEN clone-authored defects)
- R86-A payrollreports five-member divergence FIXED (thead typography; the +24px space-y MARGIN-COLLAPSE trap — a NEW TW-v4 class, fixed with mt-6 on the PageHeader desktop row; the borderless CardHeader; the stats section's boxed-cell structure; the title DIV flex form) · R86-B the payroll month default · R86-C/D/F/G four icon identities path-data-verified (Settings/CircleCheckBig/Video/ChartColumn/SquarePen) · R86-E the assetmanagement Actions th
- TDD: the session86-crossdiff spec (9 tests) RED as designed → GREEN 9/9 · three unit R13 recipe pins amended (the count-lockstep rule) · the full suite 433/433 (7.2m, zero flakes after the selector-timing fix)
- THE POST-FIX PIXEL RE-VERIFY: payrollreports 296 → 0 structural cells · training 0 · the residuals subpixel border-AA (below the bar)
- THE BYTE CHAIN (1113-1223, 112 PNGs → 1406 tracked): the primary surfaces every-REF-STABLE + the five remediated routes DRIFT-BY-DESIGN + the mobile-menu cycle GREEN · THE NEW STANDING FINDING: NON-DETERMINISTIC REF-SIDE THEME VARIANCE (the REF's dark sidebar flips palettes across sessions, no deploy; 10 band/theme drifts classified by the recheck pass)
- Docs: the remediation plan + the session_195 narrative + the AGENTS session-86 layer + the SKILL 3.69.0/§96 + the CLAUDE/README count lockstep (941+433=1374) + this worklog entry

Stage Summary:
- Round 85 delivered: THE CROSS-SIDE AT-REST PIXEL-DIFF ROUND — the program's FIRST REF↔LOC pixel comparison at scale (the r85 close-out's named frontier) found SEVEN long-standing clone-authored visual defects (invisible to 20+ rounds of per-side byte chains), ALL TDD-FIXED and pixel-proven closed (payrollreports 296→0 cells); the cross-side pixel protocol is now STANDING; the 58th deploy laddered non-visual; the patch watch moved (hold at 16.4.2); the non-deterministic REF theme variance documented; the ninth-sandbox DB trap variant + the read-layer cache corruption trap retired
"""
s = open("worklog.md", encoding="utf-8").read()
s = s.rstrip("\n") + "\n" + WL
open("worklog.md", "w", encoding="utf-8").write(s)
print("worklog round-85 entry appended")
print("DOCS LAYER COMPLETE")
