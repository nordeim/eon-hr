#!/usr/bin/env python3
# r121-stream-anatomy2.py — extract resume2's content stream by direct
# object-number-keyed regex scan, then dump the mis-tracked line's ops.
import re, zlib

raw = open("/tmp/typst-cv/resume2.pdf", "rb").read()

# every object: "N 0 obj" ... "endobj"; streams: "N 0 obj <<.. /Length L ..>> stream\n<data>endstream"
streams = {}
for mm in re.finditer(rb"(\d+) 0 obj\s*<<(.*?)>>\s*stream\r?\n", raw, re.S):
    num = int(mm.group(1))
    hdr = mm.group(2).decode("latin1")
    start = mm.end()
    lm = re.search(r"/Length\s+(\d+)", hdr)
    length = int(lm.group(1)) if lm else raw.find(b"endstream", start) - start
    data = raw[start:start+length]
    try:
        streams[num] = (hdr, zlib.decompress(data))
    except Exception:
        pass

print("decodable streams:", sorted(streams.keys()))
# the page tree: find /Type /Page objects and their /Contents
for num, (hdr, data) in sorted(streams.items()):
    pass
# non-stream objects: scan bodies
bodies = {}
for mm in re.finditer(rb"(\d+) 0 obj\s*(<<.*?>>)\s*endobj", raw, re.S):
    bodies[int(mm.group(1))] = mm.group(2).decode("latin1")

page_contents = None
for num, hdr in bodies.items():
    if "/Type /Page" in hdr or ("/Page" in hdr and "/Contents" in hdr):
        cm = re.search(r"/Contents\s+(\d+) 0 R", hdr)
        if cm:
            page_contents = int(cm.group(1))
            print(f"page obj {num} -> contents {page_contents}")
            break

hdr, content = streams[page_contents]
text = content.decode("latin1")
print("content stream:", len(text), "chars")

# dump the ops around y 316-318 (the py 525.3 line, flip-y 842-525.3=316.7)
ops = re.split(r"(?=\b(?:BT|ET|Tm|Td|TD|TJ|Tj|Tf|T\*|Tw|Tz)\b)", text)
capture = False
shown = 0
out = []
for op in ops:
    t = " ".join(op.split())
    if not t:
        continue
    if re.search(r"31[5-8]\.\d+", t) and ("Td" in t or "Tm" in t):
        capture = True
    if capture:
        out.append(t[:260])
        shown += 1
        if shown > 45:
            break
print("\n".join(out) if out else "line not found — dumping first 40 text ops instead")
if not out:
    n = 0
    for op in ops:
        t = " ".join(op.split())
        if re.match(r"^(BT|ET|/f\d|\d|Tf$|Tm|Td)", t) or "TJ" in t or "Tj" in t:
            print("  ", t[:200])
            n += 1
            if n > 40:
                break
