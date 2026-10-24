#!/usr/bin/env python3
"""r88-merge-resolve.py — the fourth parallel-session reconciliation's
conflict resolver. Resolves the five doc unions (AGENTS/CLAUDE/README/
SKILL/worklog): both session layers kept, the counts lockstepped to the
union totals (941 unit + 488 E2E = 1429 total specs)."""
import re
import sys

def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()

def write(p, t):
    with open(p, "w", encoding="utf-8") as f:
        f.write(t)
    print(f"resolved {p}")

def split_conflicts(t):
    """Return the text with every conflict block resolved by a callback."""
    out = []
    pos = 0
    for m in re.finditer(r"<<<<<<< HEAD\n(.*?)=======\n(.*?)>>>>>>> [^\n]*\n", t, re.S):
        out.append((t[pos:m.start()], m.group(1), m.group(2)))
        pos = m.end()
    out.append((t[pos:], None, None))
    return out

# ---------- AGENTS.md ----------
t = read("AGENTS.md")
t = t.replace(
    "<<<<<<< HEAD\n| E2E tests | `bun run test:e2e` (Playwright, 472 specs — needs `bun run build` first; the runner does NOT build for you) |\n=======\n| E2E tests | `bun run test:e2e` (Playwright, 476 specs — needs `bun run build` first; the runner does NOT build for you) |\n>>>>>>> b180558d294753efb979d334671adf853a8216cf\n",
    "| E2E tests | `bun run test:e2e` (Playwright, 488 specs — needs `bun run build` first; the runner does NOT build for you) |\n",
)
# the big session-layer conflict: keep BOTH layers (theirs first — the
# published chart-suite round; then ours — the mobile-band round with a
# qualifier)
blocks = split_conflicts(t)
if blocks[0][1] is None:
    print("AGENTS.md: only the command row conflicted? verifying...")
parts = []
for before, mine, theirs in blocks:
    parts.append(before)
    if mine is None:
        continue
    if "Session 88" in mine or "Session 88" in theirs:
        # the session-layer union: theirs verbatim + ours with the
        # second-execution qualifier appended after
        parts.append(theirs)
        parts.append("\n\n" + mine.replace(
            "## Session 88 (parity round 87) — THE MOBILE-BAND CROSS-SIDE ROUND",
            "## Session 88 (parity round 87, the second execution) — THE MOBILE-BAND CROSS-SIDE ROUND",
            1,
        ))
    else:
        # unknown conflict: keep both sides concatenated with a marker
        parts.append(theirs)
        parts.append(mine)
parts.append(blocks[-1][0])
t = "".join(parts)
assert "<<<<<<<" not in t, "AGENTS.md still has conflict markers"
write("AGENTS.md", t)

# ---------- CLAUDE.md ----------
t = read("CLAUDE.md")
found = False
for m in re.finditer(r"<<<<<<< HEAD\n(.*?)=======\n(.*?)>>>>>>> [^\n]*\n", t, re.S):
    mine, theirs = m.group(1), m.group(2)
    # the count clause: the union 1429 total (941 + 488)
    if "1413" in mine and "1417" in theirs:
        t = t.replace(m.group(0), mine.replace("1413-spec", "1429-spec").replace("472 E2E", "488 E2E"), 1)
        found = True
    else:
        # generic: prefer theirs (the published layer) + append mine after
        t = t.replace(m.group(0), theirs + mine, 1)
        found = True
assert found and "<<<<<<<" not in t, "CLAUDE.md unresolved"
write("CLAUDE.md", t)

# ---------- README.md ----------
t = read("README.md")
for m in re.finditer(r"<<<<<<< HEAD\n(.*?)=======\n(.*?)>>>>>>> [^\n]*\n", t, re.S):
    mine, theirs = m.group(1), m.group(2)
    t = t.replace(m.group(0), theirs + mine, 1)
# the count lockstep to the union
t = t.replace("472 specs", "488 specs").replace("472 E2E", "488 E2E")
assert "<<<<<<<" not in t, "README.md unresolved"
write("README.md", t)

# ---------- eon-hr_SKILL.md ----------
t = read("eon-hr_SKILL.md")
for m in re.finditer(r"<<<<<<< HEAD\n(.*?)=======\n(.*?)>>>>>>> [^\n]*\n", t, re.S):
    mine, theirs = m.group(1), m.group(2)
    # version line: both bumped to 3.73.0 — keep one
    if "3.73.0" in mine and "3.73.0" in theirs:
        t = t.replace(m.group(0), theirs, 1)
    else:
        t = t.replace(m.group(0), theirs + mine, 1)
# the section 99 collision: both sessions wrote a §99 — renumber OURS to §100
if t.count("## 99.") >= 2 or ("## 99." in t and "## 100." in t):
    # find OUR section (the one with the mobile-band title) and renumber
    t = t.replace(
        "## 99. The Mobile-Band Cross-Side Round (session 88 / parity round 87)",
        "## 100. The Mobile-Band Cross-Side Round (session 88 / parity round 87, the second execution)",
        1,
    )
assert "<<<<<<<" not in t, "SKILL unresolved"
write("eon-hr_SKILL.md", t)

# ---------- worklog.md ----------
t = read("worklog.md")
for m in re.finditer(r"<<<<<<< HEAD\n(.*?)=======\n(.*?)>>>>>>> [^\n]*\n", t, re.S):
    mine, theirs = m.group(1), m.group(2)
    # both entries kept: theirs (round-87 published) + ours (second
    # execution qualifier)
    q = mine.replace(
        "Task ID: round-87\n",
        "Task ID: round-87 (the second execution — the mobile-band pass, reconciled)\n",
        1,
    )
    t = t.replace(m.group(0), theirs + "\n" + q, 1)
assert "<<<<<<<" not in t, "worklog unresolved"
write("worklog.md", t)

print("\nRESOLVER COMPLETE — all five doc unions landed")
