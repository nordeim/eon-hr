#!/usr/bin/env python3
# update-pad.py — append the [S24] row + bump Last Updated in the PAD.
p = 'Project_Architecture_Document.md'
s = open(p).read()
s = s.replace(
    '**Last Updated:** 2026-10-12 (session 23 / parity round 22 — the scroll dimension + the dialog surface)',
    '**Last Updated:** 2026-10-12 (session 24 / parity round 23 — the cursor + selection dimension)')
row = ("| `[S24]` | session 24 | Parity round 23 — the CURSOR + SELECTION dimension: the first "
       "cursor/user-select audit (computed census + element-level parent-chain walks + a 46-route "
       "user-select classification; REF's stylesheet is CSSOM-unreadable so computed DOM is the "
       "ground truth). 2 gap groups fixed: the v4 button-cursor restoration "
       "(`@layer base { button { cursor: pointer } }` — v4 removed the v3 preflight rule; REF "
       "computes pointer on 100% of measured buttons incl. login + dialogs) and the touch-pan-y "
       "select-none contract (`select-none` on exactly the 8 REF-wrapped page roots — dashboard, "
       "employees, payroll, attendance, leavemanagement, expenses, loans, taskmanager; page content "
       "incl. inputs inherits none like REF while Radix portals escape to auto; the 38 auto routes "
       "pinned negatively via /settings). caret-color + ::selection verified matching (no action). "
       "Mobile nav byte-identical; with-data frontier stays blocked. 502-spec pyramid "
       "(416 unit + 86 E2E). |")
lines = s.split('\n')
out = []
for line in lines:
    out.append(line)
    if line.startswith('| `[S23]`'):
        out.append(row)
open(p, 'w').write('\n'.join(out))
print('PAD updated')
