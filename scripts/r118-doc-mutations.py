#!/usr/bin/env python3
# r118-doc-mutations.py — the D-118b mutation proof: each leg plants ONE
# drift face in isolation; the pin must go exactly-1 RED; restored green.
#   DM1 [the stale handler count re-planted]  -> the structural census RED
#   DM2 [a phantom bun-run command planted]    -> the command arm RED
import subprocess, shutil, sys, re, os

REPO = "/home/z/my-project/eon-hr"
SPEC = "tests/unit/doc-family.test.ts"
ENV = {k: v for k, v in os.environ.items() if k != "DATABASE_URL"}

def run_suite():
    r = subprocess.run(["bunx", "vitest", "run", SPEC], cwd=REPO, capture_output=True, text=True, timeout=300, env=ENV)
    out = r.stdout + r.stderr
    failed = re.findall(r"× ([^\n]+?) \d+ms", out)
    return failed

def with_file(path, fn):
    bak = path + ".r118bak"
    shutil.copy(path, bak)
    src = open(path).read()
    open(path, "w").write(fn(src))
    return (bak, path)

def restore(bak, path):
    shutil.copy(bak, path)
    os.remove(bak)

ok = True

# DM1: re-plant the stale handler count in CLAUDE (a 58th route added without the doc flip — the same face)
bak, path = with_file(f"{REPO}/CLAUDE.md", lambda s: s.replace("57 route handlers", "54 route handlers"))
failed = run_suite()
print(f"DM1 [the stale count re-planted]: {len(failed)} RED — {[f.split(' (')[0] for f in failed]}")
if len(failed) != 1 or "structural count claims" not in failed[0]:
    ok = False; print("   MATRIX MISMATCH")
restore(bak, path)

# DM2: plant a phantom command claim in README
bak, path = with_file(f"{REPO}/README.md", lambda s: s.replace("bun run lint", "bun run phantom:r118", 1))
failed = run_suite()
print(f"DM2 [the phantom command planted]: {len(failed)} RED — {[f.split(' (')[0] for f in failed]}")
if len(failed) != 1 or "command arm" not in failed[0]:
    ok = False; print("   MATRIX MISMATCH")
restore(bak, path)

# restored green
failed = run_suite()
print(f"restored: {len(failed)} failed")
if failed:
    ok = False
sys.exit(0 if ok else 1)
