# Session 219 — Session 96 / Parity Round 95: the with-applicants superset-interiors round

**Session file numbering:** this file continues the owner-facing chain (session_217.md = the session-94 transcript follow-up, session_218.md = the session-95 narrative). The remediation plan for this round lives at `docs/remediation-plan-session96.md`.

## The round in one paragraph

The r95 queue walked the with-applicants pipeline interiors the CLONE's working creation path enables (the REF's own creation paths are the documented 403-broken class — its with-applicants states are unreadable there) + the remaining mobile-overflow spot-census on the other tabbed routes + the neo-crm session-187 pattern check. The opening read classified the **65th login deploy NON-VISUAL** (the login JS moved `index-CI-M8KyE` → `index-Cb4GrjTt`, CSS unchanged, the app side quiet; the fresh login pair byte-identical to the standing `69aa4241…` baseline). **The round found ZERO clone-authored divergences — the first pure verification + classification round of the series**: every flagged candidate resolved to byte-parity, a standing classification, or a REF-broken hold.

## The findings

| # | Surface | The verdict |
|---|---|---|
| R96-A | the REF's Add Applicant creation re-test | **REF-BROKEN, DEEPENED (documented)** — the dialog opens (the 512×522 contract, the seven labels) but the Job Posting combobox opens an EMPTY `role=listbox` (the popover DOM read: `data-state=open`, zero options). The required field can never be satisfied — the creation path is uncompletable AT ITS ROOT, the same audit-log-403 family as the page-level filter comboboxes. The clone's working pipeline stays the superset. |
| R96-B | the clone's with-applicants interiors | **ALL WORKING (the round's superset verification)** — end-to-end through the clone's own paths: the dialog (512×522, the native job select with all 3 jobs + the 6-source set) → the POST + the close + the kanban card (228×111: the initials avatar, the name, the job, the stage chip) · the table row (6 cells, the avatar+email, "Not scored" + the progress bar, the 32×32 actions trigger) · the Actions dropdown (Interviewing/Offer/Hired/Rejected + Remove, the current stage excluded) · the stats row · the interviewassistant combobox WITH DATA ("Unassigned" + "name · job" — the REF's own opens empty at its 0-candidate tenant) · the PATCH move + the DELETE cleanup · the mobile 390 kanban card fully visible. Evidence: 3 PNGs. |
| R96-C | the mobile-overflow census (the other tabbed routes) | **FULL PARITY — the round's headline** — every flagged route renders the REF's own overflow BYTE-IDENTICALLY: settings 1003=1003 (tablist w971=971), attendance 943=943 (w471), profile 539=539 (w507), payrollreports 583=583 (w551), compliancedashboard 451=451, recruitment 550=550 (w439, the triggers at the same x), recruitmentkanban 1376=1376 (the 5 × w256 columns at the same x). The r96 queue's premise (the pill-wrap pattern applies wherever a tablist's min-content exceeds 390) is RETIRED — the REF itself overflows the same way; the parity contract is to overflow identically. The r95 flex-wrap stays DORMANT (the table floors both sides' page min-content at 550; verified at 390 and 360). |
| — | the r95 "/recruitment empty below ~640" claim | **RETIRED — the REF now renders /recruitment at every width** (360/390/640/700/767 all non-empty; a recent deploy fixed it). The documented REF-broken mobile set otherwise HOLDS (hrreports + interviewassistant still empty #root; employeeselfservice still the loading shell; employeedetail still the empty shell). |
| R96-D | the v4 space-y INLINE-FLOW scan (the neo-crm D-187a3 lesson) | **0 LIVE INSTANCES** — all 14 heuristic hits resolve to block-level direct children (`li`, `div.flex`, `w-full flex` buttons); the standing cures (R95's explicit mt-2 + the login family) cover the real cases. Documented as a watch, not a defect. |
| — | the standing watches | **ALL GREEN** — the 65th login deploy NON-VISUAL · standing audits 5/5 · route sweep 12/12 · verify-r45 13/13 · verify-r49 13/13 · Turnstile configured-but-0-rendered (the config now also carries `TURNSTILE_PASSWORD_RESET_ENABLED`) · the experiment system active (a fresh visitor assigned the `tagline` variant, v19) · the recharts grid class HELD (5=5 charts, 7=7 horizontals, the 16-vs-23 verticals = the classified 2.x-vs-3.x residual) · the patch watch: next 16.4.3 published, the 16.4.2 HOLD stands (the neo-crm repo holds the same) · TW-v4 oklch clean · secrets zero. |

## The verification

- **Gates: lint 0/0 · tsc ✓ · 995/995 unit · build ✓ 116/116 · E2E 546 passed + 1 resource-pressure casualty re-verified 13/13 on the idle machine** (the documented E2E-concurrency class; NO source changes this round — the opening baseline IS the closing gate).
- **DB pristine** at close (the loading-probe user — the standing audits' documented artifact — + the r96 test candidates swept; users 1, candidates 0, the seeded three-job tenant intact).
- **The evidence chain**: r96-probe-login-ref (the 65th deploy's pair) + r96-loc-kanban-card + r96-loc-actions-menu + r96-loc-kanban-mobile.

## The round's traps

**The bash double-quote `$` expansion** — the census script's password fill sent `"$Abcd1234"` through bash double quotes, silently expanding `$Abcd` to empty (the manual debug used single quotes and worked — the difference took three runs to spot). Every agent-browser fill carrying a `$` password needs single quotes on the value.

**The `//` comment inside an eval expression** — the evalOn helper one-lines multi-line expressions with a space join; a `//` comment on any line swallows every subsequent line. No comments inside eval strings.

**The agent-browser thread exhaustion** — rapid session open/close cycling (~10 sessions in minutes) exhausts the system threads (EAGAIN on the binary spawn, and the :3200 standalone can die with it). The cleanup: pkill the headless shells, restart :3200, and batch the browser work into fewer scripts.

**The :3200 auth limiter** — 10 logins/15min; every scripted session that re-auths burns one. After ~10 scripted sessions, restart the standalone (the in-memory limiter resets).

## The r97 queue

1. The REF's mobile render fix on /recruitment (this round's retirement) suggests the platform is actively fixing its mobile band — the standing watch gains a **REF-mobile-render sweep** (the broken set re-checked each round: any route that starts rendering becomes a parity target).
2. The standing watches: the 65th-or-newer login ladder (re-armed), the recharts grid class, the dark-band theming, the v4 space-y inline-flow watch.
3. The with-applicants superset interiors now verified end-to-end — the next frontier candidates: the AI CV upload's with-data flow (a real .docx/.pdf through the parse → the analysis card), and the kanban's within-column DnD ordering with multiple cards in one column (the R28-A superset, never live-exercised with data).
