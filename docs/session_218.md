# Session 218 — Session 95 / Parity Round 94: the with-data recruitment-family round

**Session file numbering:** this file continues the owner-facing chain (session_216.md = the session-94 narrative, session_217.md = that round's transcript follow-up). The remediation plan for this round lives at `docs/remediation-plan-session95.md`.

## The round in one paragraph

The r95 queue walked the recruitment family's with-data surfaces — the kanban pipeline, the job detail surfaces, and the AI CV Upload tab — with the seeded three-job tenant live on both sides. The opening read classified the **64th login deploy NON-VISUAL** (the login JS moved `index-BBWvc7Mt` → `index-CI-M8KyE`, CSS unchanged, the app side quiet at `C-IrDy5f`/`BGNH4KkS`, the fresh login pair byte-identical to the standing `69aa4241…` baseline; the full ladder green). The sweep found **one whole-surface clone-authored divergence — the AI CV Upload tab was an invented paste-text analyzer; the REF renders a file-upload surface** — TDD-rebuilt to the REF's verbatim contract (RED 5/5 unit + 5/5 E2E as designed → GREEN), plus **three REF-broken/inert classifications** (the kanban job combobox, the Add Applicant creation path, the Upload CV card button) and the interviewassistant + kanban + job-card surfaces confirmed at parity.

## The findings

| # | Surface | The verdict |
|---|---|---|
| R95-A | the AI CV Upload tab | **TDD-FIXED (the round's primary member)** — the REF's tab is a single STACKED column: the "Select Job Position" label + the w-96 combobox (placeholder "Choose a job posting...", options "{title} — {dept}" for ALL jobs, no default) + the CONDITIONAL dropzone — the DISABLED slate form at rest ("Select a job position above to start uploading CVs"), the ACTIVE indigo form with a job selected ("Upload Candidate CV" + "PDF, DOC, DOCX — AI will parse & score automatically" + the hidden `.pdf,.doc,.docx` input). The clone had invented a 2-col paste-text form (Candidate Name / Email / CV Text / Analyze CV) never cross-side verified. Rebuilt verbatim + the zero-dependency file-parse superset (`src/lib/cv-text.ts` — the DecompressionStream .docx zip-walk + .pdf stream-scan + the scrub fallback). |
| — | the kanban job combobox | **REF-BROKEN (documented)** — the REF's combobox opens with ONLY "All Jobs" despite its 3-job tenant (clean-session verified: `state:open`, one option, quiet console) — the same audit-log-403 family as the r94 Add Applicant select. The clone's 4-option select stays the superset. |
| — | the REF's Add Applicant CREATION | **REF-BROKEN (documented)** — a full form fill + submit leaves the dialog open and creates nothing (the console's `App state check failed: 403`). The with-applicants kanban interiors are UNREADABLE on the REF; the clone's working pipeline stays the superset. No REF tenant pollution occurred. |
| — | the Upload CV button (job cards) | **REF-INERT (documented)** — a live MutationObserver read ZERO DOM changes on click (no dialog, no tab switch, no file input). The clone's CV-tab deep-link superset stays (R93-H, re-verified: it lands on the rebuilt tab with the job preselected → the active dropzone). |
| — | interviewassistant | **AT PARITY** — the h1/classes/labels/combos/placeholder/button identical cross-side; the REF's candidate select opens EMPTY at its 0-candidate tenant (the clone's "Unassigned" option is the documented superset). |
| — | the kanban + the Add Applicant dialog | **AT PARITY** — the column set + count badges + header classes, the 512×522 dialog with the seven fields and the Source set (Direct/Bayt/Linkedin/Facebook/Referral/Website) identical; the Job Posting select = the standing REF-broken member. The kanban search/combobox `aria-label`s are invisible a11y supersets (computed renders identical). |
| — | the standing watches | **HELD** — the recharts grid class (REF 16+7 vs the clone's 23+7 at the current data width — the classified 2.x-vs-3.x residual; the absolute counts drift with the live data, the class holds) · the dark-band theming (the experiment system active, a fresh visitor assigned `control`) · the patch watch HOLD at next 16.4.2 · TW-v4 scan clean · secrets zero. |

## The verification

- **Gates: lint 0/0 · tsc ✓ · 995/995 unit** (984 + 6 cv-text + 5 R95 pins; the R14-A + R66-E legacy pins amended to the flex-wrap contract) · **build ✓ 116/116** · **E2E 547/547** (the 542 standing + the 5 new session95 members).
- **The live post-fix re-read**: the at-rest + active dropzone **byte-identical cross-side** (the dz y510 w960, h174 disabled / h168 active; every class, icon, text, and the hidden input's accept set exact) · the block geometry byte-identical (panel y426 h258, block y426 h68, label y430 h16, combo y458 w384 h36) · the mobile-menu cycle GREEN · the R90-B bottom sheet GREEN on the new job select (the 3 jobs in the em-dash format) · the mobile page scrollWidth 390 (clean).
- **The baseline E2E lesson re-fired**: the round's first full E2E run (concurrent with the agent-browser frontier session) suffered 11 SIGABRT worker crashes — all resource-pressure casualties (21/21 GREEN on the idle re-run). The final gate ran ALONE: 547/547.

## The round's traps

**The v4 space-y trap re-fired on an INLINE label** — the REF's v3 `space-y-2` puts margin-top on the BLOCK combobox; v4's margin-block-end on the INLINE label is layout-inert (inline vertical margins don't affect flow), so the trigger rendered at the line box end with NO gap. The remedy (the documented trap-#6 pattern): the explicit second-child `mt-2` + `text-base leading-6` for the REF's 24px strut (the REF's body inherits 16px/24px; the clone's app context is 14px/20px — the strut difference moved the combo 8px).

**The E2E-concurrency resource class** — running the full Playwright gate while the agent-browser daemon holds browser sessions SIGABRTs the workers (11 failures at 0-3ms). The protocol: close every browser session before the gate; re-run any casualty spec on the idle machine before diagnosing.

**The Radix portal scope** — the E2E option assertions must query at the PAGE level (the Select listbox portals to the body, outside the tabpanel's DOM).

**The mobile min-content chain** — the w-96 trigger (384 + 32 padding = 416) and the tablist's three labels (471) both overflowed the 390 viewport; bisected by progressive hiding. The fixes: `w-full max-w-96` (viewport-safe) + `flex-wrap` on the pill (dormant at desktop — the pill re-verified byte-identical cross-side).

## The r96 queue

1. The REF-broken classification list grew by three this round (the kanban combobox, the Add Applicant creation, the Upload CV inert) — the next frontier candidates: the with-applicants pipeline interiors exercised through the CLONE's working superset (the kanban card + the applicant detail surfaces), cross-checked against any future REF fix.
2. The standing watches: the 64th-or-newer login ladder (re-armed), the recharts grid class, the dark-band theming.
3. The remaining mobile-overflow spot-census on the other tabbed routes (the pill-wrap pattern applies wherever a tablist's min-content exceeds 390 — the REF renders empty below ~640 on several, so the superset clean-wrap is the standing pattern).
