#!/usr/bin/env python3
# r121-stream-anatomy.py — properly extract resume2's page content stream
# (xref-guided: object offsets + /Length), then dump the show-op anatomy of
# the mis-tracked line (the "Owned the performance review..." line) and the
# f0 font's /W table, to compare the true advances vs the machinery's.
import re, zlib, sys

raw = open("/tmp/typst-cv/resume2.pdf", "rb").read()
latin = raw.decode("latin1")

# object offsets via the xref (startxref)
xref_at = int(re.search(r"startxref\s+(\d+)", latin).group(1))
# parse the classic xref table (Typst writes classic xref for small files)
objs = {}  # num -> (offset, body)
m = re.search(r"xref\s+(\d+) (\d+)\s*\n", latin[xref_at:])
if m:
    first, count = int(m.group(1)), int(m.group(2))
    rows = latin[xref_at + m.end():].split("\n")
    for i in range(count):
        r = rows[i] if i < len(rows) else ""
        mm = re.match(r"(\d+) (\d+) (n)", r.strip())
        if mm:
            objs[first + i] = int(mm.group(1))
else:
    # xref stream form
    print("xref stream form — using regex object scan instead")
    for mm in re.finditer(rb"(\d+) 0 obj", raw):
        objs[int(mm.group(1))] = mm.start()

def object_body(num):
    off = objs[num]
    mm = re.match(rb"(\d+) 0 obj\s*<<(.*?)>>\s*(stream|endobj)", raw[off:off+4000], re.S)
    if mm and mm.group(3) == b"stream":
        # stream object: read /Length
        hdr = mm.group(2).decode("latin1")
        lm = re.search(r"/Length\s+(\d+)", hdr)
        if lm:
            length = int(lm.group(1))
            data_start = off + mm.start(3) + len("stream\n") - 1
            # find 'stream' keyword end precisely
            s = latin.index("stream", off)
            while latin[s:s+6] == "stream" and latin[s+6:s+8] not in ("\r\n", "\n "):
                s = latin.index("stream", s+1)
            e = latin.find("endstream", s)
            data = raw[s:e]
            try:
                data = data.lstrip(b"\r\n")
                return hdr, zlib.decompress(data[:length if length else len(data)])
            except Exception:
                try:
                    return hdr, zlib.decompress(data.rstrip(b"\r\n"))
                except Exception as ex:
                    return hdr, None
    elif mm:
        return mm.group(2).decode("latin1"), None
    return None, None

# find the page object -> /Contents
page_num = None
for num in objs:
    hdr, body = object_body(num)
    if hdr and "/Page" in hdr and "/Contents" in hdr:
        page_num = num
        break
print("page object:", page_num)
hdr, content = object_body(page_num)
cm = re.search(r"/Contents\s+(\d+) 0 R", hdr)
content_obj = int(cm.group(1))
_, stream = object_body(content_obj)
print("content stream length:", len(stream) if stream else None)
text = stream.decode("latin1")

# find the ops: locate 'Owned' — Typst writes hex CIDs, so locate by the Tm/Td
# positions: the line py 525.3 -> PDF y = 842-525.3 = 316.7 (top-left flip)
# dump every op between the Tm/Td at y≈316-318 and the next BT
ops = re.split(r"(?=\b(?:BT|ET|Tm|Td|TD|TJ|Tj|Tf|T\*|Tw|Tz)\b)", text)
capture = False
shown = 0
for op in ops:
    t = " ".join(op.split())
    if not t:
        continue
    if re.search(r"316\.\d|317\.\d|318\.\d", t) and ("Td" in t or "Tm" in t):
        capture = True
    if capture:
        print("  ", t[:250])
        shown += 1
        if shown > 40 or (shown > 2 and t.startswith("ET")):
            capture = False
