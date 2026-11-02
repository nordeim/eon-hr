#!/usr/bin/env python3
# r119-doc-mutations.py — the doc-pin mutation proof: the stale remote
# re-planted on each face -> exactly the matching arm RED; restored green.
import subprocess, shutil, re, os, sys

REPO = "/home/z/my-project/eon-hr"
ENV = {k: v for k, v in os.environ.items() if k != "DATABASE_URL"}

def run():
    r = subprocess.run(["bunx", "vitest", "run", "tests/unit/doc-family.test.ts", "-t", "D-119b2"],
                       cwd=REPO, capture_output=True, text=True, timeout=300, env=ENV)
    out = r.stdout + r.stderr
    return re.findall(r"× ([^\n]+?) \d+ms", out), re.findall(r"✓ ([^\n]+?) \d+ms", out)

W = f"{REPO}/docs/ssh_git_wrapper_v3.py"
R = f"{REPO}/docs/how-to-git-push-using-ssh-wrapper_SKILL.md"
shutil.copy(W, "/tmp/r119-w-backup.py")
shutil.copy(R, "/tmp/r119-r-backup.md")

# DM1: the stale DEFAULT_REMOTE re-planted
w = open(W).read()
open(W, "w").write(w.replace('DEFAULT_REMOTE = "git@github.com:nordeim/eon-hr.git"',
                             'DEFAULT_REMOTE = "git@github.com:nordeim/task-management.git"'))
failed, _ = run()
print(f"DM1 [the stale DEFAULT_REMOTE re-planted]: {len(failed)} RED")
for f in failed: print(f"    × {f[:90]}")
assert len(failed) == 1 and "wrapper arm" in failed[0], "DM1 signature"
shutil.copy("/tmp/r119-w-backup.py", W)

# DM2: the stale remote re-planted in the runbook's variant
r = open(R).read()
open(R, "w").write(r.replace("--remote git@github.com:nordeim/eon-hr.git",
                             "--remote git@github.com:nordeim/task-management.git", 1))
failed, _ = run()
print(f"DM2 [the runbook --remote re-planted stale]: {len(failed)} RED")
for f in failed: print(f"    × {f[:90]}")
assert len(failed) == 1 and "runbook arm" in failed[0], "DM2 signature"
shutil.copy("/tmp/r119-r-backup.md", R)

failed, passed = run()
print(f"restored: {'GREEN ' + str(len(passed)) if not failed else 'RED!! ' + str(failed)}")
assert not failed
print("DOC-PIN MUTATIONS EXACT: DM1 1 · DM2 1")
