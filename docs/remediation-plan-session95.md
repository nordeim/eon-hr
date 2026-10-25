# Remediation Plan — Session 95 / Parity Round 94: the with-data recruitment-family round

**The frontier.** The r94 close-out's queue: the with-data DIALOG interiors the
seeded tenant enables (the recruitmentkanban pipeline, the job detail
surfaces) + the standing watches (the re-armed login ladder, the recharts grid
class, the dark-band theming).

**The opening read — the 64th login deploy, NON-VISUAL.** The login JS moved
again (`index-BBWvc7Mt` → `index-CI-M8KyE`; CSS UNCHANGED at
`index-ByKl99Mk`; the app side QUIET at the recorded `C-IrDy5f` /
`BGNH4KkS`). The full standing ladder GREEN: the fresh login pair
**BYTE-IDENTICAL** to the standing `69aa4241…` baseline · standing audits 5/5
· route sweep 12/12 · verify-r45 13/13 · verify-r49 13/13 · Turnstile 0
widgets · the experiment probe: the system active, a fresh visitor assigned
the `control` variant (auth-signup-free-tagline v19 — the per-visitor
PRE_AUTH_EXPERIMENTS system, the standing watch's mechanism confirmed).

**The with-data findings.**

| # | Surface | The REF's live contract | The clone's state | Action |
|---|---|---|---|---|
| R95-A | the AI CV Upload tab | A single STACKED column: (1) `space-y-2` — the "Select Job Position" label + the `w-96` combobox (placeholder **"Choose a job posting..."**, options formatted **"{title} — {dept}"** for ALL jobs incl. drafts); (2) `space-y-4` — the CONDITIONAL dropzone: with NO job selected the DISABLED form (`text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300` + the slate-300 upload icon + "Select a job position above to start uploading CVs"), with a job selected the ACTIVE form (`border-2 border-dashed border-indigo-200 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer` + the INDIGO-400 icon + "Upload Candidate CV" (`font-semibold text-slate-700 mb-1`) + "PDF, DOC, DOCX — AI will parse & score automatically" (`text-sm text-slate-500`) + the hidden `<input type="file" accept=".pdf,.doc,.docx" class="hidden">`; h168 at rest) | An invented 2-col grid: a paste-text form (Candidate Name / Email / Job / CV Text textarea / Analyze CV) + an "Analysis Result" card — never cross-side verified until this round | **TDD FIX** (the at-rest contract rebuilt verbatim; the file-parse superset preserved) |
| — | the kanban job combobox | Renders ONLY "All Jobs" with its own 3-job tenant (clean-session verified: the popover opens `state:open` with the single option, quiet console) | Lists all 4 options (All Jobs + the 3 jobs) | **DOCUMENT** (the REF-broken class — the same audit-log 403 family as the r94 Add Applicant finding; the clone's working select stays the superset) |
| — | the REF's Add Applicant CREATION path | The dialog's submit FAILS: the form stays open, no candidate created, the console's `App state check failed: 403` (live-tested this round with a full form fill — nothing created, no tenant pollution) | The working creation pipeline (the kanban + the table) | **DOCUMENT** (the with-applicants kanban interiors are UNREADABLE on the REF — the creation path is broken there; the clone's working pipeline stays the superset) |
| — | the Upload CV button (job cards) | INERT on click: zero DOM mutations (a live MutationObserver read 0), no dialog, no tab switch, no file input | The CV-tab deep-link with the job preselected (R93-H) | **DOCUMENT** (the REF-inert class; the superset stays) |
| — | interviewassistant | AT PARITY — h1 "Interview Assistant" (text-4xl font-bold text-slate-900 mb-3, x288 y84), the labels Candidate/Notes, the combobox placeholder "Select candidate", the textarea placeholder, the Analyze Interview button — identical both sides; the REF's candidate select opens EMPTY at its 0-candidate tenant (the clone's "Unassigned" option renders as the superset) | Matches | **NONE** |
| — | the kanban surface + the Add Applicant dialog | AT PARITY — the column set (Applied/Interviewing/Offer/Hired/Rejected + the count badges), the header classes, the Add Applicant button recipe, the 512×522 dialog with the seven fields, the Source set (Direct/Bayt/Linkedin/Facebook/Referral/Website) | Matches (the Job Posting select = the standing REF-broken member; the clone lists the 3 jobs) | **NONE** |
| — | the Job Postings cards | AT PARITY (the R93-H contract live re-verified: 3 cards, `rounded-xl border bg-card … border-slate-200 hover:shadow-lg`, the verbatim text, not clickable) | Matches | **NONE** |
| — | the kanban search/combobox a11y labels | The REF's inputs carry NO aria-labels | The clone adds `aria-label="Search applicants"` + `aria-label="Filter by job"` | **DOCUMENT** (invisible a11y supersets — the computed renders are identical) |
| — | the standing watches | HELD — the recharts grid class (REF 16 verticals + 7 horizontals vs the clone's 23 + 7 — the classified 2.x-vs-3.x residual; the absolute counts drift with the live data width, the class holds) · the dark-band theming (the experiment system active) | Matches | **NONE** |

## The fix

### R95-A — the AI CV Upload tab rebuilt to the REF's contract

`src/app/(app)/recruitment/page.tsx` (the cvupload TabsContent):

1. **The layout**: the 2-col grid retires; the tab becomes the stacked column
   (the TabsContent keeps `mt-6 space-y-4`; the two REF blocks inside).
2. **Block 1** (`div.space-y-2`): the "Select Job Position" label + the
   `w-96` Select — `SelectValue placeholder="Choose a job posting..."`, the
   options `{job.title} — {job.department}` for ALL jobs (draft + active, the
   REF lists its drafts), NO default selection (the REF's controlled at-rest
   state — verified 3× on fresh loads).
3. **Block 2** (`div.space-y-4`): the conditional dropzone —
   - no `cvJobId`: the DISABLED div
     `text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300`
     with the Upload icon (`w-10 h-10 mx-auto mb-3 text-slate-300`) + the
     plain `<p>` "Select a job position above to start uploading CVs";
   - `cvJobId` set: the ACTIVE div
     `border-2 border-dashed border-indigo-200 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer`
     with the Upload icon (`w-10 h-10 text-indigo-400 mx-auto mb-3`) +
     `p.font-semibold.text-slate-700.mb-1` "Upload Candidate CV" +
     `p.text-sm.text-slate-500` "PDF, DOC, DOCX — AI will parse & score
     automatically" + the hidden
     `<input type="file" accept=".pdf,.doc,.docx" className="hidden">`
     (the onClick opens the picker; the dropzone is not a label — the REF's
     input is a sibling).
4. **The superset flow preserved**: the file's onChange derives the candidate
   name (the filename minus extension), extracts the text (the new
   `src/lib/cv-text.ts`), POSTs `/api/candidates {jobPostingId, name, email:
   "", cvText}` (the unchanged deterministic scoring API), and renders the
   analysis result card BELOW the dropzone — only after an upload (the
   REF's post-upload surface is unreadable: uploading would mutate the REF's
   tenant, and its creation paths are the documented 403-broken class; the
   clone's result card is the standing superset pattern — the
   interviewassistant's AI Analysis card renders only after analysis).
5. **The R93-H deep-link preserved**: the job card's Upload CV keeps
   `setCvJobId(job.id) + setTab("cvupload")` (now landing on the REF-shaped
   tab with the job preselected → the active dropzone).
6. **The paste-form states retire**: `cvName`/`cvEmail`/`cvText` and the
   `onAnalyzeCv` form handler are replaced by the file-driven flow
   (`analyzing` + `analysis` stay).

### `src/lib/cv-text.ts` — the client-side CV text extraction (new util)

Zero new dependencies; the browser-native `DecompressionStream`:

1. Text-like files: `file.text()` directly.
2. `.docx`: a minimal ZIP central-directory walk (the End-of-Central-Record
   scan → the entries → `word/document.xml`) + the `'deflate-raw'`
   decompression → the `<w:t>` text extraction.
3. `.pdf`: the `stream…endstream` pair scan + the inflate attempt per pair +
   the text-operator (`(…) Tj` / TJ arrays) extraction.
4. Fallback: the raw byte scrub (printable runs ≥ 3 chars).
5. If the yield is < 40 alphanumeric chars, the flow surfaces the error
   toast ("Couldn't read the CV text…") — degrade, never fail.

## The test plan (TDD)

**RED first** — `tests/e2e/session95-recruitment-family.spec.ts`:
- A1 (the at-rest contract): the CV tab renders the "Select Job Position"
  label + the w-96 combobox at the placeholder "Choose a job posting..." +
  the DISABLED dropzone ("Select a job position above to start uploading
  CVs") + NO file input.
- A2 (the option contract): the combobox lists the three jobs in the
  "{title} — {dept}" format.
- A3 (the state transition): selecting a job swaps the dropzone to the
  ACTIVE form ("Upload Candidate CV" + "PDF, DOC, DOCX — AI will parse &
  score automatically") + the hidden `accept=".pdf,.doc,.docx"` input mounts.
- A4 (the superset flow): uploading a text fixture via
  `setInputFiles`-equivalent (the Playwright `setInputFiles`) creates the
  candidate and renders the analysis result card.
- A5 (the deep-link): the job card's Upload CV jumps to the tab with the job
  preselected (the active dropzone).

**Unit pins** — the session95 additions to the recipe-pins spec
(`tests/unit/recipes.test.ts`): the recruitment source pins the label text,
the placeholder, the option format, both dropzone class strings, the accept
attribute, and the two message strings. Plus `tests/unit/cv-text.test.ts` for
the extraction util (a crafted .txt fixture, a crafted minimal .docx-like
ZIP fixture, the fallback path, the too-short guard).

## Gates

lint 0/0 · tsc ✓ · unit 984+pins ✓ · build 116/116 · E2E 542 + the new
members · DB pristine at close · the evidence chain (screenshots) · the
mobile-menu cycle + the R90-B sheet re-verified on the remediated build · the
E2E runs ALONE (the r95 lesson: the baseline's 11 SIGABRT failures were the
agent-browser-concurrency resource-pressure class — 21/21 GREEN on the idle
re-run).

## Execution appendix (filled at close)

- **RED**: the session95 E2E spec 5/5 failed as designed against the unmodified
  build (A1 the at-rest contract, A2 the option format, A3 the state
  transition, A4 the superset flow, A5 the deep-link); the unit pins 5/5
  failed as designed + the cv-text spec failed on the missing module (984
  passing alongside).
- **GREEN**: R95-A the tab REBUILT — the stacked column (the `text-base
  leading-6` block carrying the label + the `w-full max-w-96 mt-2` trigger;
  the CONDITIONAL dropzone in both REF states verbatim) · the new
  `src/lib/cv-text.ts` (the zero-dependency extraction: the .docx zip walk +
  the .pdf FlateDecode scan, both via the browser-native
  DecompressionStream; the printable scrub fallback; the <40-alphanumeric
  guard; the filename-stem name derivation) · the result card renders below
  only after an upload (the interviewassistant AI-Analysis pattern).
- **The GREEN-phase geometry catches (all live-measured against the REF)**:
  1. **The v4 space-y trap re-fired on the INLINE label** — the REF's v3
     `space-y-2` puts margin-top on the BLOCK button; v4's margin-block-end
     on the INLINE label is layout-inert (inline vertical margins don't
     affect flow), so the trigger sat at the line box end with NO gap. The
     trap-#6 remedy (the explicit second-child mt-2) + `text-base leading-6`
     (the REF's 24px strut — its body inherits 16px/24px; the clone's
     context is 14px/20px) landed the block at the REF's byte-identical
     geometry: panel y426 h258, block y426 h68, label y430 h16, combo y458
     w384 h36.
  2. **The `&amp;` verbatim-source trap** (the standing lesson): the unit pin
     must assert the JSX-escaped source string.
  3. **The Radix portal scope**: the E2E option assertions must query at the
     PAGE level (the listbox portals to the body, outside the tabpanel).
  4. **The mobile w-96 leak**: the `w-96` trigger rendered 384px at the 390
     viewport (10px off-canvas) — fixed as `w-full max-w-96` (the full
     container at mobile, the REF's 384 at desktop).
  5. **The pre-existing mobile min-content overflow**: the tablist's three
     labels force a 471px page min-content at 390 (bisected: tablist 471 →
     trigger 416 → clean 390). Fixed with `flex-wrap` on the pill (dormant
     at desktop — the pill re-verified byte-identical y366 w439 h36
     cross-side; the REF renders an EMPTY #root below ~640 on this route,
     the documented REF-broken mobile set, so the wrap is the clean
     superset). Two legacy pins amended (the R14-A pill + the R66-E rhythm —
     the verbatim-source lesson re-applied).
- **The post-fix live verification**: the at-rest + the active dropzone
  byte-identical cross-side (every class, position, and text — the dz
  y510 w960 h168/h174 per state, the svg/ps/input contracts exact) · the
  mobile-menu cycle GREEN (open → Training LMS → /training → the auto-close)
  · the R90-B bottom sheet GREEN on the new job select (the 3 jobs in the
  "{title} — {dept}" format) · the mobile page scrollWidth 390 (clean).
- **Gates**: lint 0/0 · tsc ✓ · **995/995 unit** (984 + 6 cv-text + 5 R95
  pins; the two legacy pins amended in place) · build ✓ 116/116 · **E2E
  547/547** (the 542 standing + the 5 new session95 members).
- **The evidence chain**: 8 r95 PNGs (the tab pairs both states, the mobile
  sheet) — see docs/screenshots/.
- **DB pristine** at close (the A4 candidate self-cleaning; no probe
  artifacts).
