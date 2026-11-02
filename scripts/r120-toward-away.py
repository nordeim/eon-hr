#!/usr/bin/env python3
# r120-toward-away.py — the r120 candidate's drift classifier (the r116-v2
# discipline): difflib sequence alignment of the candidate's word stream
# against pdftotext's, separator comparison at every boundary the candidate
# changed vs HEAD. Word-stream changes (not just separators) are reported
# SEPARATELY — the R120-B binding additions touch the decode candidate
# chains, so alnum-level changes must be counted and classified too
# (toward = pdftotext's alnum count matched better).
import subprocess, sys, re
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
    ("/tmp/r108-quartz/quartz-longer.pdf", "QUARTZ"),
    ("/tmp/r109-corpus/rl-userguide.pdf", "ReportLab"),
    ("/tmp/r110-prawn-manual.pdf", "Prawn"),
    ("/tmp/r113-writers/weasy-cv.pdf", "WeasyPrint CV"),
    ("/tmp/r113-writers/weasy-variant-control.pdf", "WeasyPrint control"),
    ("/tmp/r113-writers/weasy-variant-twopage.pdf", "WeasyPrint twopage"),
    ("/tmp/typst-cv/resume.pdf", "Typst resume"),
    ("/tmp/typst-cv/resume2.pdf", "Typst resume2"),
    ("/tmp/typst-cv/coverletter.pdf", "Typst coverletter"),
    ("/tmp/typst-cv/coverletter2.pdf", "Typst coverletter2"),
]

for path, name in members:
    head = extract("/home/z/my-project/eon-hr/src/lib/cv-text", path)
    proto = extract("/tmp/r120-proto/cv-text", path)
    ref = subprocess.run(["pdftotext", path, "-"], capture_output=True, text=True).stdout
    if head == proto:
        na = len(re.sub(r"[^A-Za-z0-9]", "", proto))
        nr = len(re.sub(r"[^A-Za-z0-9]", "", ref))
        print(f"{name}: IDENTICAL (alnums {na}/{nr})")
        continue
    hw, pw, rw = words_and_seps(head), words_and_seps(proto), words_and_seps(ref)
    ws_changed = [w for w, _ in hw] != [w for w, _ in pw]
    sm = SequenceMatcher(None, [w for w, _ in pw], [w for w, _ in rw], autojunk=False)
    p2r = {}
    for b in sm.get_matching_blocks():
        for d in range(b.size):
            p2r[b.a + d] = b.b + d
    toward = away = neutral = 0
    away_samples = []
    if not ws_changed:
        for i in range(1, len(pw)):
            if not (i < len(hw) and hw[i][0] == pw[i][0] and hw[i-1][0] == pw[i-1][0]):
                continue
            if hw[i][1] == pw[i][1]:
                continue
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
    na_h = len(re.sub(r"[^A-Za-z0-9]", "", head))
    na_p = len(re.sub(r"[^A-Za-z0-9]", "", proto))
    na_r = len(re.sub(r"[^A-Za-z0-9]", "", ref))
    ratio_p = SequenceMatcher(None, proto, ref).ratio()
    ratio_h = SequenceMatcher(None, head, ref).ratio()
    tag = "WORD-STREAM CHANGED" if ws_changed else "separator-only"
    print(f"{name}: DRIFT ({tag}) | alnums {na_h}->{na_p} (ref {na_r}) | difflib {ratio_h:.4f}->{ratio_p:.4f} ({(ratio_p-ratio_h)*10000:+.1f} bp) | sep toward={toward} away={away} neutral={neutral} (aligned {len(p2r)}/{len(pw)})")
    for s in away_samples: print("   AWAY: " + s)
