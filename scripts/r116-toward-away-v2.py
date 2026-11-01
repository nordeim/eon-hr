#!/usr/bin/env python3
# r116-toward-away-v2.py — the DEFINITIVE toward/away classifier: proper
# sequence alignment (difflib.SequenceMatcher) over the word streams, then
# separator comparison at every aligned boundary that R116-A changed.
# Classifies: toward (proto's separator class matches pdftotext better than
# head's), away (worse), neutral (pdftotext has no aligned boundary).
import subprocess, sys
from difflib import SequenceMatcher

def extract(modpath, path):
    code = f'''
const mod = await import("{modpath}");
const raw = require("node:fs").readFileSync("{path}");
process.stdout.write(await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf")));
'''
    return subprocess.run(["bun", "-e", code], capture_output=True, text=True).stdout

def words_and_seps(text):
    out = []
    i, n = 0, len(text)
    while i < n:
        j = i
        while j < n and text[j].isspace(): j += 1
        sep = text[i:j] if j > i else ""
        k = j
        while k < n and not text[k].isspace(): k += 1
        if k > j: out.append((text[j:k], sep))
        i = k if k > i else i + 1
    return out

members = [
    ("/tmp/r106-corpus/arxiv-2404.16710.pdf", "arXiv"),
    ("/tmp/r106-corpus/dvipdfmx.pdf", "dvipdfmx"),
    ("/tmp/r106-corpus/fontspec.pdf", "fontspec"),
    ("/tmp/r106-corpus/irs-f1040.pdf", "IRS"),
    ("/tmp/r109-corpus/rl-userguide.pdf", "ReportLab"),
    ("/tmp/typst-cv/resume.pdf", "Typst resume"),
    ("/tmp/typst-cv/resume2.pdf", "Typst resume2"),
    ("/tmp/typst-cv/coverletter.pdf", "Typst coverletter"),
    ("/tmp/typst-cv/coverletter2.pdf", "Typst coverletter2"),
]

T = A = N = 0
for path, name in members:
    head = extract("/home/z/my-project/eon-hr/src/lib/cv-text", path)
    proto = extract("/tmp/r116-proto/cv-text", path)
    ref = subprocess.run(["pdftotext", path, "-"], capture_output=True, text=True).stdout
    hw, pw, rw = words_and_seps(head), words_and_seps(proto), words_and_seps(ref)
    # align proto's word stream against pdftotext's
    sm = SequenceMatcher(None, [w for w, _ in pw], [w for w, _ in rw], autojunk=False)
    # map proto index -> ref index through matching blocks
    p2r = {}
    for b in sm.get_matching_blocks():
        for d in range(b.size):
            p2r[b.a + d] = b.b + d
    toward = away = neutral = 0
    away_samples = []
    for i in range(1, len(pw)):
        # boundary changed between head and proto? (word streams identical — lockstep)
        if not (i < len(hw) and hw[i][0] == pw[i][0] and hw[i-1][0] == pw[i-1][0]):
            continue
        if hw[i][1] == pw[i][1]:
            continue  # unchanged
        ri = p2r.get(i)
        if ri is None or ri == 0:
            neutral += 1
            continue
        rs = rw[ri][1]
        proto_nl = "\n" in pw[i][1]
        head_nl = "\n" in hw[i][1]
        ref_nl = "\n" in rs
        if proto_nl == ref_nl:
            toward += 1
        else:
            away += 1
            if len(away_samples) < 5:
                away_samples.append(f"{pw[i-1][0][:28]!r} [{pw[i][1]!r} want {rs!r}] {pw[i][0][:28]!r}")
    T += toward; A += away; N += neutral
    print(f"{name}: toward={toward} away={away} neutral={neutral} (aligned {len(p2r)}/{len(pw)} words)")
    for s in away_samples: print("   AWAY: " + s)
print(f"\nTOTAL: toward={T} away={A} neutral={N}")
