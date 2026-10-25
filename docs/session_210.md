# Session 210 — Session 91 / Parity Round 90: the open-state inventory round

**Session file numbering:** this file continues the owner-facing chain (session_208.md = the session-90 narrative, session_209.md = the owner's transcript archive of that round). The remediation plan for this round lives at `docs/remediation-plan-session91.md`.

## The round in one paragraph

The r90 close-out's queue opened with two questions — does the REF swap its **dropdown menus** at mobile the way r90 proved it swaps its **selects**, and what do the **other pages' option inventories** hold? The first was **answered by classification**: the user menu, probed cross-side at 390×844 through the drawer, opens the **standard Radix popper on both sides at identical geometry** (x=79 y=714 w=192 h=74, the shadcn recipe, the two-item interior) — the bottom-sheet swap is select-family-only, pinned as the R91-D1 guard. The second became **the round's frontier instrument**: the systematic sweep that opens every combobox on every filtered route cross-side and diffs the option sets — the at-rest pixel bands never see option interiors. It found **three clone-authored defects, all TDD-fixed** (RED 10/10 → GREEN 12/12): **R91-A** the staffrequests inventories, **R91-B** the hrreports four-entity report builder (the round's biggest member), **R91-C** the recruitment inventories + the Add Applicant contract. The loans dialog was **closed at parity** (the loan-type four + the 672×698 geometry identical cross-side), and the opening read classified the **61st login deploy NON-VISUAL** (the fresh login pair byte-identical at `69aa4241efa1` + the full standing ladder green).

## The three defects

**R91-A — the staffrequests option inventories.** The REF's live filter sets: CATEGORY `All Categories, Finance, HR, IT, Operations, Tools & Equipment, Other` — the clone offered `General, IT, HR, Facilities, Finance, Admin`; STATUS `All Status, Pending, L1 Approved, L2 Approved, Approved, Rejected, Completed` — the clone offered `Pending, In Progress, Resolved, Rejected`. The REF's status vocabulary implies its two-level approval workflow. The fix: the option sets + the vocabulary coherence rule — the Start button advances `pending → l1_approved → l2_approved → approved`, the Respond dialog completes/rejects, and every reachable state stays inside the filter's set (the old `in_progress`/`resolved` states were invisible to every filter except "All Status"). The API PATCH enum, the Zod category enum, and the StatusBadge's two new members follow. **The REF's own New Request dialog is REF-BROKEN** (mounts, then its open path's `Error creating audit log: 403` kills it) — the filter sets are the ground truth; the clone's working dialog stays the functional superset.

**R91-B — the hrreports four-entity report builder.** The REF's /hrreports reports over FOUR entities with entity-dependent contracts (live-read by switching each entity and opening each select):

| Entity | Group-by | Table headers |
|---|---|---|
| Employees | job title, department id, employment status, employment type, start date | full name, job title, department id, employment status, employment type, start date |
| Staff Requests | category, status, priority, amount, created date | employee name, category, status, priority, amount, created date |
| Expense Claims | expense type, amount, status, date | employee name, expense type, amount, status, date |
| Leave Requests | leave type, status, start date, end date | employee name, leave type, status, start date, end date |

Plus: the **constant status union** (`All, Pending, Approved, Rejected, Active, Completed` across all entities — per-entity matching; out-of-vocabulary values match nothing), the **Bar/Line/Pie order**, and the **carry-if-valid groupBy** (a still-valid selection survives an entity switch — "status" lived through employees → staff-requests). The clone was employees-only with its own group/status sets. The fix: the API's four-source query + grouping + per-entity stats, and the page's ENTITY_CONTRACT-driven UI (the selects, the headers, the CSV columns, the chart title). The **run-only-when-grouped contract**: the initial state renders 0/0/0 stats + the grid-only chart (the REF live-reads 0/0/0 even with a populated tenant) — the old clone achieved this by accident (its API's zod enum rejected the empty groupBy → null-data defaults); the rewrite restored it explicitly. The StaffRequest schema gained `amount Int?` (the REF's entity field, proven live by its group-by + table column).

**R91-C — the recruitment inventories + the Add Applicant contract.** The REF's table filter offers its **7 raw lowercase statuses** (`new, reviewed, shortlisted, interview scheduled, offered, hired, rejected` — a separate pipeline vocabulary from the kanban's 5-stage `stage` field); the clone offered its 5 prettified stages. The fix: the verbatim seven + the stage→status mapping predicate (applied→new, interviewing→interview scheduled, offer→offered; reviewed/shortlisted match nothing — the same effective behavior as the REF's zero-candidate data). The **sort** became the REF's three modes (AI Score, Application Date, Experience — the clone had two). The **Add Applicant dialog** rebuilt to the REF's seven fields (live-measured 512×522): Full Name*, Email*, Phone, Experience (years), Job Posting, Source (Direct, Bayt, Linkedin, Facebook, Referral, Website), Cover Letter — the clone's Stage select was an invention (the REF's dialog has no stage field; new applicants land in the first column). The Candidate schema gained `experience Int?`, `source String?`, `coverLetter String?`.

## The verification

- **The live post-fix re-read**: all three surfaces' option sets match the REF verbatim; the entity switch renders the staff-requests table headers; the new selects route through the r90-B mobile bottom-sheet (the "Select an option" sheet with the seven categories); **the mobile-menu cycle GREEN** (open → Training LMS → `/training` → the auto-close superset).
- **Gates: lint 0/0 · tsc ✓ · 963/963 unit** (950 + 13 R91 pins) · **build ✓ 116/116** · **E2E 512/512** (the 501 standing + the 11 new, 9.4m, zero flakes) · DB pristine.
- **The two GREEN-phase regressions retired**: R88-E1 (the grid-only chart — my first API returned a `""` catch-all bucket where the old flow returned the empty set) and R61-A (the 0/0/0 stats — the run-only-when-grouped contract above) — both pointed at the same root cause, fixed once at the source.
- **The evidence chain 1469-1483** (8 PNGs: the dev dashboard, the staffrequests popper open, the hrreports entities, the staff-requests entity table, the recruitment filter, the Add Applicant dialog, the mobile sheet, the mobile-menu cycle) → **1623 tracked PNGs**.

## The round's instruments and traps

`r91-deploy-watch.mjs` (the 61st detection + the experiment probe) · `r91-ladder.mjs` (the full standing ladder) · `r91-btn-census.mjs` / `r91-structure-read.mjs` (the page censuses) · `r91-dropdown-probe.mjs` / `r91-usermenu-probe*.mjs` (the family question) · `r91-inventory-probe.mjs` / `r91-inventory-sweep.mjs` (the frontier instrument — every combobox, both sides) · `r91-hrreports-deep*.mjs` (the entity contract) · `r91-newreq-dialog-probe.mjs` (the REF-broken finding) · `r91-postfix-verify.mjs` / `r91-screenshots.mjs`. The traps retired: the **pointerdown opening** (synthetic clicks open drawers but silently fail on Radix menu triggers — the native CDP click via the snapshot `@ref` refs required), the **broken XPath** (agent-browser 0.39 returns "Element not found" for valid XPaths — the snapshot refs are the working form), the **EAGAIN daemon bounce** (the cleanup + re-auth), the strict-mode heading-vs-button locator (the spec-side catch), and the accidental-contract preservation lesson (the run-only-when-grouped fix).

## The r92 queue

1. The remaining unopened surfaces — the dialogs' interior selects beyond loans (the requestsettings approver chain, the workflowautomation forms).
2. The seed-data parity question — the REF's 3-job tenant vs the clone's jobless seed (the documented data-volume class; a scoped decision with a large zero-state blast radius).
3. The dark-band data residuals (the standing watch).
4. The recharts grid class (the standing classification).
5. The 61st-or-newer login ladder (the re-armed watch — Turnstile still 0 widgets).
