#!/bin/bash
# r115-corpus-source.sh — session 115 / parity round 114: re-source the
# corpus (the fresh-sandbox intake — /tmp lost the standing members). The
# eight downloaded members from their canonical sources; the generated
# families (Typst/Skia/WeasyPrint/fpdf2) regenerate through their committed
# generator scripts separately. Every member verified against the pinned
# FILE md5s before use.
set -u
mkdir -p /tmp/r106-corpus /tmp/r107-corpus /tmp/r108-quartz /tmp/r109-corpus
DL() { # url out
  curl -sL --max-time 120 -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36" -o "$2" "$1" && echo "OK  $2 $(stat -c%s "$2" 2>/dev/null) bytes" || echo "FAIL $1"
}
DL "https://arxiv.org/pdf/2404.16710" /tmp/r106-corpus/arxiv-2404.16710.pdf
DL "https://www.irs.gov/pub/irs-pdf/f1040.pdf" /tmp/r106-corpus/irs-f1040.pdf
DL "https://texdoc.org/serve/fontspec/0" /tmp/r106-corpus/fontspec.pdf
DL "https://mirrors.ctan.org/dvipdfmx/doc/dvipdfmx.pdf" /tmp/r106-corpus/dvipdfmx.pdf
DL "https://documentation.libreoffice.org/assets/Uploads/Documentation/DIGuides/IGLO-CalcGuide.pdf" /tmp/r107-corpus/lo-calc.pdf
DL "https://www.reportlab.com/docs/reportlab-userguide.pdf" /tmp/r109-corpus/rl-userguide.pdf
DL "https://prawnpdf.org/manual.pdf" /tmp/r110-prawn-manual.pdf
# QUARTZ — the xmlcalabash test-suite trail (codeberg raw)
DL "https://codeberg.org/xmlcalabash/xmlcalabash3/raw/branch/main/tests/extra-suite/test-suite/documents/longer.pdf" /tmp/r108-quartz/quartz-longer.pdf
echo "=== FILE MD5S ==="
md5sum /tmp/r106-corpus/*.pdf /tmp/r107-corpus/*.pdf /tmp/r108-quartz/*.pdf /tmp/r109-corpus/*.pdf /tmp/r110-prawn-manual.pdf 2>/dev/null
