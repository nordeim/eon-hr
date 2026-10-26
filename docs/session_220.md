# Session 220 — Session 97 / Parity Round 96: the real-file CV-flow round

**Session file numbering:** this file continues the owner-facing chain (session_218.md = the session-95 narrative, session_219.md = the session-96 narrative; the remote's mid-round `fc34f59` carried a raw working-log draft of session_219 that the rebase reconciled in favor of the polished local version). The remediation plan for this round lives at `docs/remediation-plan-session97.md`.

## The round in one paragraph

The r96 close-out's queue: the AI CV Upload tab's with-data flow with a **real** `.docx`/`.pdf` (until now E2E-exercised with a `.txt` only), the kanban within-column DnD (resolved COVERED on inspection — the existing spec drives real drags with persistence), the REF-mobile-render sweep, and the standing watches. The opening read found the **REF QUIET at the 65th deploy state** (the login asset fingerprints unchanged — no 66th deploy) and the **full standing ladder GREEN** (the fresh login pair BYTE-IDENTICAL to the standing `69aa4241…` baseline + standing 5/5 + sweep 12/12 + verify-r45 13/13 + verify-r49 13/13). The round found **ONE clone-authored defect — the `.pdf` extraction misses the TJ array form** — TDD-fixed (RED 3/3 → GREEN 9/9, mutation-proofed at both layers), plus the standing classifications re-verified (the REF-broken mobile set, the REF's Add Applicant empty-listbox creation path).

## The findings

| # | Surface | The verdict |
|---|---|---|
| R97-A | the `.pdf` TJ-array extraction | **TDD-FIXED (the round's primary member)** — `pdfTextOperators` matched only strings directly followed by a text operator (`(…) Tj\|TJ\|'\|"`); real-world PDF writers (Word's Save-as-PDF, Acrobat, kerned LaTeX) emit the ARRAY form `[(…) -120 (…)] TJ` where the strings ride inside the brackets. Empirically verified: the old regex yielded ZERO strings on a TJ-array stream → a real .pdf CV surfaced "Couldn't read the CV text". The fix: a two-alternative scan (the direct form + the full array form, reading order preserved). RED 3/3 as designed → GREEN 9/9. |
| R97-B | the real-file E2E flow | **BORN-GREEN 2/2, MUTATION-PROOFED** — the new `session97-realfile-cvflow` spec drives a real-shaped `.docx` (the shared zip-fixture builder) and a TJ-carrying `.pdf` through the actual UI → the analysis card → the persisted API row (nonzero aiScore) → the cleanup. The mutation proof (the pre-fix regex restored): exactly 1 RED (the TJ spec) while the docx spec stayed green — unique teeth. |
| — | the kanban within-column DnD | **COVERED (the queue item resolved by inspection)** — `tests/e2e/recruitment-dnd.spec.ts:119` already drives the real drag events with two seeded cards, the insertion reorder, and the reload persistence. |
| — | the REF-mobile-render sweep | **the broken set HOLDS** — hrreports + interviewassistant still the empty `#root`; employeeselfservice still "Loading your profile…"; employeedetail still the empty shell (chrome renders, main empty); /recruitment renders at 390 (scrollW 550, the r96 retirement holds — parity territory). |
| — | the mobile-nav cross-side pair | **PARITY** — the REF's hamburger (28px, `lucide-panel-left`, accessible name "Toggle Sidebar") + its drawer (fixed z-50, w=288 h=844) match the clone's documented contract; the clone's `aria-label` trigger + `role=dialog` drawer remain the standing a11y supersets. The mobile-menu cycle on the remediated build: open → Training LMS → `/training` + the auto-close. |
| — | the REF's Add Applicant creation re-test | **STILL BROKEN — the r96 classification holds** — the dialog opens (512×522, the seven labels verbatim) but the Job Posting combobox opens an EMPTY listbox (`data-state=open`, count 0). The clone's working pipeline stays the superset. |
| — | the standing watches | **ALL GREEN** — the login ladder (re-armed at the 65th state) · the recharts grid class (standing) · the patch watch: next 16.4.3 published, the HOLD at ^16.4.2 stands · TW-v4 oklch scan clean · secrets zero. |

## The verification

- **Gates: lint 0/0 · tsc ✓ · 998/998 unit** (995 + 3 R97 pins) · **build ✓ 116/116 · E2E 549/549** (the 547 standing + the 2 new; the final gate ran ALONE).
- **DB pristine** at close (the r97 live-probe candidate swept; users 1, jobs 3, candidates 0).
- **The evidence chain**: 11 r97 PNGs — the login pair probe, the REF mobile-nav open (×3 attempts, the third the good one), the clone dashboard / CV tab rest / CV tab active / analysis card (VLM-verified: the "r97 real cv" name + AI score 5 + the Skills match section) / mobile nav / training-mobile.

## The round's traps

**The `offsetParent` visibility fallacy on `position:fixed` portals** — Chrome reports `offsetParent === null` for fixed-position elements, so visibility checks built on it report Radix dialogs and drawer panels as ABSENT (the REF's Add Applicant dialog and its mobile drawer both tripped it). The fixed-aware check: `getBoundingClientRect().width > 0` + the computed position.

**The agent-browser text-selector syntax** — the Playwright-style `'[role=tab] >> text=AI CV Upload'` chaining is NOT agent-browser syntax; those clicks fail silently. The reliable path: the snapshot-ref click (`snapshot -i -c` → `- tab "AI CV Upload" [ref=eNN]` → `click @eNN`).

**The `$`-password double-quote trap re-fired** (the first auth attempt sent an empty password through a double-quoted eval) — the standing cure: the `fill` command with single-quoted shell words, never eval'd value sets (React controlled inputs ignore direct value sets anyway).

**The first-click absorption** — the standing audit's first run missed the REF drawer (4/5), the re-run read it clean (5/5); the tab clicks needed a selected-state verify + re-click. A single re-run before diagnosing saves an hour.

**The :3200 lifecycle pair** — the auth limiter (10 logins/15min) forces a standalone restart after a probe-heavy stretch, and the restart needs a pkill settle (≥2-3s) or the new spawn dies with EADDRINUSE while the old server still holds the port.

## The r98 queue

1. The REF-broken mobile set stays on watch (any route that starts rendering becomes a parity target — the platform is actively fixing its mobile band).
2. The standing watches: the 65th-or-newer login ladder (re-armed), the recharts grid class, the dark-band theming, the v4 space-y inline-flow watch, the patch watch (16.4.3 held).
3. The CV-flow frontier's next candidates: the octal-escape unescaping in PDF strings (the `\053` class — currently inert garbage in extracted text, a watch not a defect), and a multi-stream real PDF (the fixture is single-stream; real PDFs interleave text + graphics streams — the scanner handles it but it's never been pinned).
