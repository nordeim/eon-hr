#!/usr/bin/env python3
# r113-weasy-variants.py — pin the WeasyPrint zero-kern pattern's generality:
# (a) control — no floats;
# (b) floats LAST in DOM;
# (c) absolutely-positioned box;
# (d) two pages (per-page paint order);
# (e) letter-spacing-heavy display text (the display-tracked interaction).
import zlib, re
from weasyprint import HTML

css = """
  @page { size: A4; margin: 18mm 16mm; }
  body { font-family: 'DejaVu Serif', serif; font-size: 10.5pt; line-height: 1.45; }
  h1 { font-size: 20pt; margin: 0 0 6pt 0; }
  h2 { font-size: 11pt; border-bottom: 1pt solid #333; margin: 12pt 0 5pt 0; }
  .dates { float: right; color: #555; }
  .abs { position: absolute; top: 40mm; right: 16mm; color: #777; }
  p { margin: 0 0 6pt 0; }
"""

def para(n):
    return f"<p>Paragraph {n}: the quick brown fox jumps over the lazy dog while the recruiter reads the resume text extraction pipeline.</p>"

variants = {
    "control": f"""<!DOCTYPE html><html><head><meta charset="utf-8"><style>{css}</style></head><body>
    <h1>Anna Control</h1><h2>Section One</h2>{para(1)}{para(2)}<h2>Section Two</h2>{para(3)}{para(4)}
  </body></html>""",
    "floatlast": f"""<!DOCTYPE html><html><head><meta charset="utf-8"><style>{css}</style></head><body>
    <h1>Bob Floatlast</h1><h2>Section One</h2>{para(1)}<span class="dates">Jan 2020 - Dec 2024</span>{para(2)}<h2>Section Two</h2>{para(3)}{para(4)}
  </body></html>""",
    "absolute": f"""<!DOCTYPE html><html><head><meta charset="utf-8"><style>{css}</style></head><body>
    <div class="abs">ABS-TAG-99</div>
    <h1>Clara Absolute</h1><h2>Section One</h2>{para(1)}{para(2)}<h2>Section Two</h2>{para(3)}{para(4)}
  </body></html>""",
    "twopage": f"""<!DOCTYPE html><html><head><meta charset="utf-8"><style>{css}</style></head><body>
    <h1>Dora Twopage</h1><span class="dates">PG1-FLOAT</span><h2>Page One</h2>{para(1)}{para(2)}{para(3)}{para(4)}{para(5)}{para(6)}{para(7)}{para(8)}{para(9)}{para(10)}{para(11)}{para(12)}
    <div style="page-break-before: always"></div>
    <h2>Page Two</h2><span class="dates">PG2-FLOAT</span>{para(13)}{para(14)}{para(15)}{para(16)}
  </body></html>""",
    "display": f"""<!DOCTYPE html><html><head><meta charset="utf-8"><style>{css}
    .tracked {{ letter-spacing: 2.5pt; font-size: 13pt; font-weight: bold; }}
  </style></head><body>
    <h1>Erik Display</h1><div class="tracked">DISPLAY TRACKED HEADLINE TEXT</div><h2>Section One</h2>{para(1)}{para(2)}
  </body></html>""",
}

for name, html in variants.items():
    out = f"/tmp/r113-writers/weasy-variant-{name}.pdf"
    HTML(string=html).write_pdf(out)
    raw = open(out, "rb").read()
    # count the zero-kern atoms for the pattern census
    zero_kerns = 0
    for sm in re.findall(rb"stream\r?\n(.*?)endstream", raw, re.DOTALL):
        try:
            d = zlib.decompress(sm)
        except Exception:
            continue
        for tj in re.findall(rb"\[(.*?)\] TJ", d, re.DOTALL):
            zero_kerns += len(re.findall(rb"<[0-9A-Fa-f]+>0<(?=[0-9A-Fa-f])", tj))
    print(f"weasy-variant-{name}.pdf written ({len(raw)} bytes, {zero_kerns} zero-kern atom pairs)")
