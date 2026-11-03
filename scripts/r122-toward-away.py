#!/usr/bin/env python3
# r122-toward-away.py — the R122-B cure's toward/away classification on the
# ReportLab member (the r116 difflib discipline): sequence-align the HEAD
# and CURED word streams against pdftotext's; count the boundary hunks each
# version moves toward or away from the ground truth.
import subprocess, re
from difflib import SequenceMatcher

def extract_head(path):
    # HEAD = git's committed src/lib/cv-text.ts (pre-cure)
    src = subprocess.run(["git", "-C", "/home/z/my-project/eon-hr", "show", "HEAD:src/lib/cv-text.ts"], capture_output=True, text=True).stdout
    import tempfile, os, sys
    with tempfile.NamedTemporaryFile("w", suffix=".ts", delete=False) as f:
        f.write(src); tmp = f.name
    code = f'''
const mod = await import("{tmp}");
const raw = require("node:fs").readFileSync("{path}");
process.stdout.write(await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf")));
'''
    out = subprocess.run(["bun", "-e", code], capture_output=True, text=True).stdout
    os.unlink(tmp)
    return out

def extract_cured(path):
    code = f'''
const mod = await import("/home/z/my-project/eon-hr/src/lib/cv-text");
const raw = require("node:fs").readFileSync("{path}");
process.stdout.write(await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf")));
'''
    return subprocess.run(["bun", "-e", code], capture_output=True, text=True).stdout

def words(text):
    return re.findall(r"\S+", text)

def ratio(a, b):
    return SequenceMatcher(None, a, b).ratio()

path = "/tmp/r109-corpus/rl-userguide.pdf"
ref = subprocess.run(["pdftotext", path, "-"], capture_output=True, text=True).stdout
head = extract_head(path)
cured = extract_cured(path)

rw, hw, cw = words(ref), words(head), words(cured)
print(f"words: ref={len(rw)} head={len(hw)} cured={len(cw)}")
print(f"head   vs pdftotext similarity: {ratio(hw, rw):.4f}")
print(f"cured  vs pdftotext similarity: {ratio(cw, rw):.4f}")

# the TOC region check: count the phase-shifted rows in each
def toc_rows(t):
    return len(re.findall(r"^\s*[\. ]{6,}\d*\s+\S", t, re.M)), len(re.findall(r"^\S[^\n]*[\. ]{6,}\d+\s*$", t, re.M))

h_bad, h_good = toc_rows(head)
c_bad, c_good = toc_rows(cured)
print(f"HEAD:  dots-first rows {h_bad}, entry-first rows {h_good}")
print(f"CURED: dots-first rows {c_bad}, entry-first rows {c_good}")

# alnum preservation
na = lambda s: re.sub(r"[^A-Za-z0-9]", "", s)
print(f"alnums: head={len(na(head))} cured={len(na(cured))} ref={len(na(ref))}")
