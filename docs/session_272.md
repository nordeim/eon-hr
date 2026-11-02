# Session 117 — Round Close Summary

**Session 117 / Parity Round 116 — THE SAME-LINE X-GAP COLUMN ROUND — complete and pushed to `main` as `7d3cca6`** (remote-verified via the SSH wrapper + the paramiko shim; the operator key shredded; the working tree clean).

## The round in summary

**The hunt** (the r117-queued "unmeasured" item): the Typst entry layout's same-line column pairs — title|company, description|dates, cert|year, degree|university — read as the standing " " join where pdftotext breaks the line. Measured end-to-end before any code: 7 gap-driven splits at true device-space gaps 15.1–42.2 em (against `pdftotext -bbox` word xMax ground truth) + 1 icon-bridged split (phone|email, ~2 em, not gap-driven — deferred with the measurements).

**Four candidate designs refuted by measurement before any code**: the stamp start-delta threshold (the pdfTeX line-origin stamp duality — 49 em start-deltas on pairs pdftotext joins), the chars×0.5 em width estimate (±40 % noise, the band overlaps itself), the column-alignment signature (a 2-column paper has everything aligned), and the nearest-word real-end heuristic (wrong occurrences of repeated words — 128 fake joins).

**The cure (R117-A)**: the /W width tables (all three measured forms — the spec pairs, the spec arrays, and the Typst `c c w` triples, validated against the bbox ground truth) + the advance post-pass (each positioned block's projected end x, the full (px, py) stamp grouping) + the assembly pre-pass (a same-baseline block-boundary pair ≥ 13 em apart upgrades its " " to a CLEAN "\n" under the trail license, the stamp-mate alnum guard, and the join guard). The threshold sits in the measured separation band: joins ≤ 11.78 em, splits ≥ 15.1 em.

**The in-round catches**: the px-only block grouping (same-x different-line blocks fused the accumulator) and the rejected-upgrade fusion (text-drop marks persisting past a rejected guard — "Senior HR ManagerTechCorp").

**The discipline held**: RED 2/2 + 5 born-green guards → GREEN 1125/1125 (1118 + 7) → the mutation matrix exact (M1 2 · M2 1 · M3 2 · M4 1); the corpus ALL 7 PINS HOLD with zero drift (the standing members untouched); the Typst resumes' newlines 22→28/29 with every fired boundary TOWARD pdftotext; the residuals documented (the icon pair + the 5.1 em sub-threshold pair — pdftotext's 2D column analysis territory).

**Gates**: lint 0/0 · tsc ✓ · 1125/1125 unit · build 116/116 · E2E 559/559 (a clean 11.1m run) · DB pristine. Mobile-nav pair **PARITY** (the user's named focus), no Tailwind v4 regression; the 81st deploy non-visual (login-side-only); the neo-crm layer at s207 (no transfer); the patch watch HOLD at ^16.4.2 with the November 3 security release scheduled. The r118 queue is armed in the worklog (the icon-bridged split + the ReportLab TOC dot-order carry-over + the sub-13 em toward-splits with the vertical-alignment candidate + the security-release watch lead it).
