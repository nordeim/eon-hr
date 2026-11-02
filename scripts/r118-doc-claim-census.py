#!/usr/bin/env python3
# r118-doc-claim-census.py — the s208 DOC-CLAIM TOTALITY CENSUS transferred
# to eon-hr (the D-208a2 method): every backticked repo path claim in the
# LIVE doc sections (README/CLAUDE whole-file; AGENTS head + Conventions/Git
# islands; PAD §1-§7 head + §7.2-§12 — the s206 scoping doctrine: embedded
# session records keep their ship-time claims) must resolve in the tree.
# Extension-less forms match .ts/.tsx/.mjs siblings. Output: the phantom
# list (paths that resolve nowhere).
import re, os

REPO = "/home/z/my-project/eon-hr"
def read(p): return open(os.path.join(REPO, p), encoding="utf8").read()

def live_sections_agents(text):
    # head (before the first "## Session-" layer) + the Conventions/Git islands
    head_end = text.find("\n## Session-")
    head = text[:head_end if head_end > 0 else 20000]
    return head

def live_sections_pad(text):
    # §1-§7 head + §7.2-§12: cut the §7.1 inventory rows (session records)
    out = []
    keep = True
    for line in text.split("\n"):
        if line.startswith("### 7.1"):
            keep = False
        elif re.match(r"^## (7\.2|8|9|10|11|12)\b", line) or line.startswith("## 8.") or line.startswith("## 7.2"):
            keep = True
        if keep:
            out.append(line)
    return "\n".join(out)

docs = {
    "README.md": read("README.md"),
    "CLAUDE.md": read("CLAUDE.md"),
    "AGENTS.md": live_sections_agents(read("AGENTS.md")),
    "Project_Architecture_Document.md": live_sections_pad(read("Project_Architecture_Document.md")),
}

EXTS = ["", ".ts", ".tsx", ".mjs", ".md", ".json", ".css", ".py", ".sh", ".prisma", ".toml", ".txt"]
SKIP_PREFIX = ("http", "postgresql://", "file:")

phantoms = []
checked = set()
for doc, text in docs.items():
    for m in re.finditer(r"`([^`\n]+)`", text):
        p = m.group(1).strip()
        if not p or p.startswith(SKIP_PREFIX): continue
        # only repo-path-shaped claims: no spaces, has a slash or a known extension
        if " " in p or "/" not in p: continue
        if not re.search(r"\.[a-z]+$|^\.?/", p): continue
        if p in checked: continue
        checked.add(p)
        resolved = False
        for ext in EXTS:
            cand = p + ext
            if os.path.exists(os.path.join(REPO, cand)):
                resolved = True; break
        if not resolved:
            phantoms.append((doc, p))

print(f"checked {len(checked)} distinct backticked path claims")
if phantoms:
    print(f"PHANTOMS ({len(phantoms)}):")
    for doc, p in phantoms:
        print(f"  {doc}: `{p}`")
else:
    print("ALL PATH CLAIMS RESOLVE — the doc family is clean on the path axis")

# also: the count-claim sweep (the structural family)
import glob, json
models = len(re.findall(r"^model ", read("prisma/schema.prisma"), re.M))
routes = len(glob.glob("src/app/(app)/*/page.tsx", root_dir=REPO))
api = len(glob.glob("src/app/api/**/route.ts", root_dir=REPO, recursive=True))
unit = len(glob.glob("tests/unit/*.test.ts", root_dir=REPO)) + len(glob.glob("tests/db-path.test.ts", root_dir=REPO))
e2e = len(glob.glob("tests/e2e/*.spec.ts", root_dir=REPO))
print(f"\nLIVE: models={models} app-routes={routes} api-files={api} unit-files={unit} e2e-files={e2e}")
for doc, text in docs.items():
    for m in re.finditer(r"\b(4[5-9]|5[0-9]|6[0-5])\s+(routes|endpoints|route handlers|Prisma models)\b", text):
        print(f"  {doc}: claim '{m.group(0)}' (line context: {text[max(0,m.start()-40):m.end()+10]!r})")
