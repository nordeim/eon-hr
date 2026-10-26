# Remediation Plan — Session 97 / Parity Round 96: the real-file CV-flow round

**The frontier.** The r96 close-out's queue: (1) the AI CV upload's
with-data flow — a real `.docx`/`.pdf` through the parse → the analysis
card (never exercised with real files; the E2E A4 spec uploads a `.txt`
only), (2) the kanban within-column DnD ordering with multiple cards
(resolved COVERED on inspection — `tests/e2e/recruitment-dnd.spec.ts:119`
drives the real drag events with two seeded cards and the reload
persistence), (3) the REF-mobile-render sweep (the standing broken-set
re-check), (4) the standing watches (the re-armed login ladder, the
recharts grid class, the dark-band theming, the v4 space-y inline-flow
watch).

**The opening read — the REF QUIET at the 65th deploy state.** The login
asset fingerprints UNCHANGED (login JS `index-Cb4GrjTt.js`, CSS
`index-ByKl99Mk.css` — byte-equal to the recorded 65th-deploy names; no
66th deploy detected). The fresh login pair **BYTE-IDENTICAL** to the
standing `69aa4241…` baseline (the census intact: the 6 buttons, the 2
inputs, "Welcome to Eon HR", no Turnstile).

**THE STANDING LADDER — ALL GREEN (this round's verification pass):**

| Ladder step | Result |
|---|---|
| the fresh login pair (r97-login-pair) | **BYTE-IDENTICAL** (`69aa4241…`) |
| standing audits (probe-r37-standing) | **5/5** (the first run's drawer miss = the documented first-click absorption transient; the re-run clean) |
| route sweep (probe-r41-routesweep) | **12/12** |
| verify-r45 | **13/13** |
| verify-r49 | **13/13** |
| the REF-mobile-render sweep | **the broken set HOLDS** — hrreports + interviewassistant still the empty `#root`; employeeselfservice still "Loading your profile…"; employeedetail still the empty shell (the chrome renders, the main is empty); /recruitment RENDERS at 390 (scrollW 550 — the r96 retirement holds; parity territory) |
| the mobile-nav cross-side pair | **PARITY** — the REF's hamburger (28px, `lucide-panel-left`, accessible name "Toggle Sidebar") + its drawer (the fixed z-50 panel, w=288 h=844) byte-match the clone's documented contract; the clone's `aria-label` trigger + `role=dialog` drawer are the standing a11y supersets |
| the REF's Add Applicant creation re-test | **STILL BROKEN — the r96 classification holds** — the dialog opens (512×522, the seven labels verbatim) but the Job Posting combobox opens an EMPTY listbox (`data-state=open`, count 0); the creation path remains uncompletable at its root (the audit-log-403 family); the clone's working pipeline stays the superset |
| the standing scans | oklch clean (doc comments only) · `md:flex-wrap` zero · secrets zero · the patch watch: next 16.4.3 published, the HOLD at ^16.4.2 stands (the neo-crm repo holds the same) |

**THE ROUND'S FINDING — R97-A: the `.pdf` extraction misses the TJ array
form (VERIFIED).** `src/lib/cv-text.ts`'s `pdfTextOperators` matches only
strings DIRECTLY followed by a text-showing operator (`(…) Tj|TJ|'|"`).
Real-world PDF writers (Word's Save-as-PDF, Acrobat, LaTeX with kerning)
emit the ARRAY form — `[(Senior HR) -120 (Manager)] TJ` — where the
strings are followed by positioning numbers and `]`, not by the operator.
Empirically verified: the current regex yields ZERO strings on a
TJ-array content stream. Impact: a real .pdf CV extracts `""` → the UI
surfaces "Couldn't read the CV text" — the AI CV Upload tab's core
promise ("PDF, DOC, DOCX — AI will parse & score automatically") fails on
the most common PDF text form. Severity HIGH within the superset flow
(the REF's own Upload CV button is the documented INERT class — the
clone's flow is the only working one on either side).

**R97-B: the E2E real-file gap.** The A4 spec's superset flow uploads a
`.txt` file only. The `.docx` zip-walk and the `.pdf` stream-scan paths
are E2E-never-exercised (the unit layer covers them with crafted fixtures
— but the PDF fixture uses the `Tj` form only, which is exactly why the
TJ gap survived). The plan: extend the spec with a real crafted `.docx`
(the `makeZip` helper) and a real TJ-carrying `.pdf` through the actual
UI upload → the analysis card.

## The test plan (TDD)

1. **RED** — `tests/unit/cv-text.test.ts` gains three specs: (a) a
   TJ-array PDF fixture (the deflated content stream carrying
   `[(Senior HR Manager) -120 (with payroll, GOSI, and compliance skills)] TJ`)
   → `extractTextFromFile` must yield both fragments (currently "");
   (b) a mixed Tj+TJ stream → both operators' strings; (c) the escaped
   parens inside a TJ array.
2. **GREEN** — the `pdfTextOperators` fix: a two-alternative scan that
   keeps reading order — the existing direct-operator form PLUS the full
   array form `\[…\]\s*TJ` whose paren-groups are extracted and unescaped
   with the same rules.
3. **RED→GREEN (E2E)** — `tests/e2e/session95-recruitment-family.spec.ts`
   A4 gains the two real-file uploads (a `.docx` built in-spec via the
   zip helper; a TJ-carrying `.pdf` built via CompressionStream) → the
   analysis card + the candidate row both render, the cleanup holds.
4. **Gates** — lint 0/0 · tsc ✓ · unit 995+3 · build 116/116 · E2E 547+
   (the ALONE protocol) · DB pristine at close (the r97 probe candidates
   swept).

## The round's traps (for the SKILL)

- **The `offsetParent` visibility fallacy on `position:fixed` portals** —
  Chrome reports `offsetParent === null` for fixed-position elements, so
  every "is it visible" check built on it silently reports Radix dialogs
  and drawer panels as ABSENT (the REF's Add Applicant dialog and its
  drawer both tripped it this round). The fixed-aware visibility check:
  `getBoundingClientRect().width > 0` + `getComputedStyle().position`.
- **The `$`-password double-quote trap re-fired** (the first auth attempt
  sent an empty password through a double-quoted eval) — the cure stands:
  the `fill` command with single-quoted shell words (the auth-r22
  pattern), never eval'd value sets (React controlled inputs ignore them
  anyway).
- **The first-click absorption transient** — the standing audit's first
  run missed the REF drawer (4/5), the re-run read it clean (5/5); a
  single re-run before diagnosing saves an hour.

## Execution appendix (filled at close)

- **R97-A — the TJ-array fix: RED 3/3 → GREEN 9/9, mutation-proofed.**
  The three new unit specs (the TJ array, the mixed Tj+TJ stream, the
  escaped parens) failed exactly as designed against the unfixed tree
  (3 failed | 6 passed); the fix (the two-alternative scan in
  `pdfTextOperators` — the direct-operator form PLUS the full
  `[ … ] TJ` array form whose paren-groups are extracted and unescaped
  with the same rules, reading order preserved) took the file to 9/9.
  The GREEN-phase catch: the escaped-parens spec's first content ran
  UNDER the 40-alphanumeric meaningfulness guard (26 alnum) — the fixture,
  not the regex, was short; the content lengthened past the guard.
- **R97-B — the real-file E2E: born-green 2/2, MUTATION-PROOFED.** The
  new `tests/e2e/session97-realfile-cvflow.spec.ts` drives a real-shaped
  `.docx` (the deflate-method-8 zip from the shared fixture builder) and
  a TJ-carrying `.pdf` through the actual UI upload → the analysis card
  → the persisted API row (nonzero aiScore asserted) → the cleanup. The
  mutation proof (the pre-R97 single-regex form restored): **exactly 1
  RED** (the TJ spec) while the docx spec stayed green — the pin has
  unique teeth. Fix restored → 3/3.
- **The live post-fix verify**: the real TJ-pdf through the :3200 UI
  (tab → job select → upload) → the analysis card rendered (VLM-verified:
  the "r97 real cv" name + AI score 5 + the Skills match section; the
  evidence PNG r97-loc-cv-analysis.png) → the candidate swept (DB pristine:
  candidates 0).
- **The mobile-menu cycle on the remediated build**: open → Training LMS
  → `/training` + the drawer auto-closed (the standing superset, live).
- **The mobile-nav cross-side pair**: the REF's hamburger (28px,
  `lucide-panel-left`, the accessible name "Toggle Sidebar") + its drawer
  (the fixed z-50 panel, w=288 h=844) byte-match the clone's documented
  contract; the E2E mobile-navigation family green in the baseline.
- **The probe-tooling traps (documented above) all hit and retired this
  round**: the `offsetParent` fallacy (the fixed-position portals), the
  `$`-password double-quote trap (the first auth attempt), the
  first-click absorption (the tab clicks), the :3200 auth limiter (the
  restart), the EADDRINUSE boot race (the pkill settle), and the
  agent-browser text-selector syntax (the `>>` chaining is NOT
  agent-browser syntax — the snapshot-ref click is the reliable path).
