# Session 83 — eon-hr parity round 40 (the careers family + the login button members)

*The fourth consecutive login-scoped redeploy proved rendering-neutral
(its CSS delta was platform font-faces, unused) — but round-39's
deferred frontier, the careers mobile pixel-diff, opened the round's
core: a 25.41% pair delta that decomposed into the content wrapper's
rhythm, a shared zero-card family, REF's first measurable with-data
job card, the apply flow, and a data model. The toaster frontier also
closed: REF's one fireable notification is the failed-login Alert —
already byte-identical on the clone.*

## The opening state

**REDEPLOY DETECTED — login JS + CSS** (the first CSS change since
round 35): `index-BIuE7r17.js` → `index-C-ulo5ek.js` and
`index-D0Q6-tUz.css` → `index-BIWjBcok.css`, both app chunks unchanged.
The CSS diff proved to be platform infrastructure — @font-faces for
Wix Madefor, Dazzed, and Azeret Mono feeding a `.font-base44` utility
used by OTHER base44 apps; a computed-font sweep over the login's leaf
elements found zero consumers, and the full recipe re-read came back
byte-identical at desktop AND mobile (card x=16 y=16 w=358, docH 862,
email h=44/16px, icons 85/85/98, links y=718/746). Theme-inert
re-verified. The standing audits 5/5 (the drawer probe updated to the
post-restructure `[data-sidebar="trigger"]` selector both sides carry);
the route sweep 12/12.

**The toaster frontier resolved**: the one fireable notification on
zero-data REF — the failed-login error — renders a shadcn Alert
(role=alert, `bg-red-50/70 border-red-200 rounded-xl`, the red-700
description) inside the form. The clone's is byte-identical: class
string, rect (x=536 y=738 w=368 h=54), parent, text.

## The census — the careers pixel-diff decomposition

The hero geometry was byte-identical (input h=50 y=337 18px, h1 y=16,
sub y=40) yet the pair diffed **25.41%**. Decomposing by row-bands
against the element map found three independent causes:

1. **The count-row rhythm** (rows 480-520) — the clone's content
   wrapper was `p-4 md:p-8` where REF's is `max-w-6xl mx-auto px-4
   py-12` (a round-39 miss; the content started 32px high at mobile).
2. **The banner gradient** (rows 80-320) — REF's canvas is 569px wide
   at a 390 viewport: a long whitespace-nowrap company chip
   (cross-tenant demo data) forces a horizontal overflow that stretches
   the gradient. Live-confirmed (REF banner w=569 vs the clone's 390,
   same sRGB endpoints); the clone with equivalent data behaves
   identically — a documented data-driven non-gap.
3. **The chips/zero region** — data states, which led to the with-data
   contracts:

- **The zero-card family** (careers + external share it): the Card
  carries `text-center py-12` itself, the DEFAULT border
  rgb(229,229,229) (no slate-200 override), the bare `p-6 pt-0`
  CardContent, the briefcase `w-16 h-16 text-slate-300 mx-auto mb-4`,
  the h3 `mb-2`, the `text-slate-600` line — with the message
  STATE-DEPENDENT: "Check back later for new opportunities!" (the
  empty board AND the org view, both measured) vs "No jobs match your
  search. Try different keywords." (the search-filtered zero).
- **The job card** — REF's first measurable with-data card: the title
  row (`flex items-start justify-between mb-3`) with the title/company
  block and the **Open badge — a DIV** hand-rolled to REF's full
  string (the taskmanager count-chip precedent); the four-row meta
  stack (`space-y-2 text-sm text-slate-600`; building2 / map-pin /
  clock — the type LOWERCASE — / dollar-sign salary); the
  `line-clamp-3 mb-4` description; the full-width "View Details &
  Apply" gradient CTA.
- **The apply flow**: the CTA routes to
  `/externaljobapplication?org=<company-slug>&job=<title-slug>`.
  REF's own target renders its zero-state for the params (a REF-side
  dead end); the clone's superset slug-filters the page's list.
- **The org view**: the `div.mb-8` wraps the back button + the org h2;
  the count row is `mb-4 flex items-center justify-between` (shared
  with the board).
- **The model**: REF's chips are COMPANIES — JobPosting gained
  nullable `company` + `salaryRange`, and the chips/org-view/card/apply
  all read `company` (the clone's department-based chips were
  semantically wrong).
- **The external page**: the bare `max-w-6xl mx-auto` wrapper + the
  `text-center mb-12` header (the h1 carries `mb-3`) + the card
  joining the zero family.
- **The login Sign in button**: REF's carries the login build's
  `ring-offset-background` + `[&_svg]` guards (inert at rest; the ring
  stays the zinc-950 literal per the two-build split) — added for DOM
  class parity.

## The delivery

TDD: 18 RED (17 new pins + the R31-C3 icon-order amendment) →
**636/636 unit GREEN** (+17). The careers page rewritten (the wrapper,
the zero-card, the count row, the job card, the org view, the
chips-from-company); the external page aligned + the params superset;
the schema/API extended; the login button members added. The E2E
amendments: the session-40 seed moved to the company field; the new
session-41 spec (6 tests: the zero-card family, the wrapper/count row,
the with-data card contract, the apply flow + the params, the
filtered-zero message, the login members).

**The verify artifact**: the first live pass found REF's badge is a
DIV where the clone's was a span — fixed and re-verified (the E2E
selector + the pin tightened to the div form).

## Gates and delivery

lint 0/0 · tsc ✓ · **636/636 unit** (+17) · build ✓ · **180/180 E2E**
(+6; the workflow Add-Level width hit its documented tolerance flake
once, stable on the full re-run). Live: verify-r40 3/6 raw MATCH with
the 3 diffs documented (the trap-3 gradient class-string, the org-view
data + cursor-pointer superset, the external superset resolving the
seeded job); the zero-card family + the board + the login members
MATCH; the standing audits 5/5 (post-change); the hero pixel-diff
closure (the count-row rows collapsed to zero; the residual attributed
to the data-driven overflow). 8 screenshots (156-159) → **220 PNG
captures**. DB pristine (users=1, employees=1, leaveBalances=2).

**Frontier after this round**: the redeploy watch stays hot (four
consecutive login-scoped deploys — the login CSS redeploys too now);
the with-data surfaces beyond careers stay blocked on REF's zero-data
app tenant; the app-side toast interior remains unfireable on REF (the
login Alert was the fireable one); the careers card's right-side
element slot (the count row's justify-between hints at one) awaits a
REF redeploy that populates it.
