#!/usr/bin/env python3
# r116-toward-away.py — classify every R116-A separator change toward/away
# from pdftotext (the r115 discipline: whitespace-aligned word diff). For
# every word-pair boundary whose separator changed between HEAD and PROTO,
# read pdftotext's separator at the aligned boundary and classify:
#   toward  — pdftotext reads a line break there too (\n in its sep)
#   away    — pdftotext reads a same-line space
#   neutral — pdftotext reads nothing comparable (alignment ambiguity)
import subprocess, sys, json

def words_and_seps(text):
    # walk the text; produce the word list and the separator before each word i>0
    out = []  # (word, sep_before)
    i = 0
    n = len(text)
    while i < n:
        # skip whitespace, capturing it
        j = i
        while j < n and text[j].isspace(): j += 1
        sep = text[i:j] if j > i else ""
        # read the word
        k = j
        while k < n and not text[k].isspace(): k += 1
        if k > j:
            out.append((text[j:k], sep))
        i = k if k > i else i + 1
    return out

def extract_head(path):
    code = f'''
const mod = await import("/home/z/my-project/eon-hr/src/lib/cv-text");
const raw = require("node:fs").readFileSync("{path}");
const t = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
process.stdout.write(t);
'''
    return subprocess.run(["bun", "-e", code], capture_output=True, text=True).stdout

def pdftotext(path):
    return subprocess.run(["pdftotext", path, "-"], capture_output=True, text=True).stdout

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

total = {"toward": 0, "away": 0, "neutral": 0}
for path, name in members:
    head = extract_head(path)
    proto = subprocess.run(["bun", "-e", f'''
const mod = await import("/tmp/r116-proto/cv-text");
const raw = require("node:fs").readFileSync("{path}");
const t = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "m.pdf"));
process.stdout.write(t);
'''], capture_output=True, text=True).stdout
    ref = pdftotext(path)
    hw = words_and_seps(head)
    pw = words_and_seps(proto)
    rw = words_and_seps(ref)
    # index the ref boundaries by word-pair key (word[i], word[i+1]) — first occurrence
    ref_sep = {}
    for i in range(1, len(rw)):
        k = (rw[i-1][0], rw[i][0])
        if k not in ref_sep: ref_sep[k] = rw[i][1]
    toward = away = neutral = 0
    away_samples = []
    for i in range(1, len(pw)):
        hs = pw[i][1]  # proto's separator before word i
        # find the same boundary in head (word stream is stable — walk in lockstep)
        if i < len(hw) and hw[i][0] == pw[i][0] and hw[i-1][0] == pw[i-1][0]:
            if hw[i][1] == hs: continue  # unchanged boundary
        else:
            neutral += 1
            continue
        rs = ref_sep.get((pw[i-1][0], pw[i][0]))
        if rs is None:
            neutral += 1
            continue
        proto_nl = "\n" in hs
        ref_nl = "\n" in rs
        if proto_nl == ref_nl: toward += 1
        else:
            away += 1
            if len(away_samples) < 6: away_samples.append(f"{pw[i-1][0]} [{hs!r}→ want {rs!r}] {pw[i][0]}")
    total["toward"] += toward; total["away"] += away; total["neutral"] += neutral
    print(f"{name}: changed boundaries toward={toward} away={away} neutral={neutral}")
    for s in away_samples: print("   AWAY: " + s)
print(f"\nTOTAL: toward={total['toward']} away={total['away']} neutral={total['neutral']}")
