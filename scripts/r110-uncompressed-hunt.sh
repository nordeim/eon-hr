#!/usr/bin/env bash
# r110-uncompressed-hunt.sh — census the pdf.js test corpus for content
# streams that declare NO /Filter at all (the uncompressed-content-stream
# watch). A qualifying specimen: a PDF with >= 1 raw content stream
# (uncompressed page content) — the writer class the extractor reads ZERO
# characters from today.
cd /tmp/pdfjs-corpus/test/pdfs || exit 1
for f in *.pdf; do
  # a raw content stream: a stream whose dict region between "obj" and
  # "stream" has NO /Filter. Look for the page-content shape: "BT" text
  # operators readable as plain bytes near a stream with no Filter.
  # cheap filter: file contains "stream" and at least one "BT"
  if ! rg -q "BT" "$f" 2>/dev/null; then continue; fi
  # count streams with no /Filter in their dict region (python inline)
  python3 - "$f" <<'EOF'
import re, sys
path = sys.argv[1]
try:
    data = open(path, "rb").read()
except Exception:
    sys.exit(0)
if len(data) > 3_000_000:
    sys.exit(0)
# find every stream; check the dict region (from the preceding "obj" or "<<")
total = 0
raw = 0
for m in re.finditer(rb"stream\r?\n", data):
    total += 1
    start_of_dict = max(data.rfind(b"obj", 0, m.start()), data.rfind(b"<<", 0, m.start()))
    region = data[start_of_dict:m.start()]
    if b"/Filter" not in region and b"/Length" in region:
        # the content after this stream marker is the raw candidate —
        # check it carries text operators within the first 400 bytes
        head = data[m.end():m.end()+400]
        if b"BT" in head and (b"Tj" in head or b"TJ" in head or b"Tf" in head):
            raw += 1
if raw >= 1:
    print(f"{path}\traw_text_streams={raw}\ttotal_streams={total}\tsize={len(data)}")
EOF
done | head -40
