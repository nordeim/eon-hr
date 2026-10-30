#!/usr/bin/env python3
"""r109-rl-probe-gen.py — a ReportLab-shaped CV-sized probe PDF: the exact
14th-writer shape (ASCII85Decode+FlateDecode armor, WinAnsi base-14 fonts,
Symbol bullets, raw cp1252 high-byte literals) at a size the CV-upload API
accepts (under the 20K-char cvText cap). Generated with the authoritative
python a85 encoder."""
import zlib, base64

def a85(b: bytes) -> bytes:
    return base64.a85encode(b) + b"~>"

# the content: the ReportLab writer form — BT/Tm/Tf blocks, per-word Tj shows,
# the em-dash 0x97 + the right-quote 0x92 as RAW bytes, the \267 bullets
lines = []
lines.append(b"BT /F1 12 Tf 14.4 TL 20 750 Td")
lines.append(b"(John A. Doe) Tj T* -20 0 Td")
lines.append(b"(payroll admin compliance training onboarding specialist platform systems technology) Tj T*")
lines.append(b"(To die\x97to sleep\x97perchance to dream) Tj T*")
lines.append(b"(It\x92s the payroll rub: attendance, deductions, overtime) Tj T*")
# the Symbol bullets (ReportLab's bullet form: /F4 Symbol, \267 octal)
for item in [b"payroll engine", b"attendance records", b"compliance monitor", b"training platform"]:
    lines.append(b"q 1 0 0 1 78 650 cm BT /F4 10 Tf 18 2 Td (\\267) Tj ET Q")
    lines.append(b"q 1 0 0 1 96 650 cm BT /F1 10 Tf (bullet " + item + b") Tj ET Q")
content = b"\n".join(lines) + b"\nET\n"
armored = a85(zlib.compress(content))

objs = []
objs.append(b"<< /Type /Catalog /Pages 5 0 R >>")                                            # 1
objs.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding /FirstChar 32 /LastChar 255 >>")  # 2
objs.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Symbol >>")                         # 3
objs.append(b"<< /Font << /F1 2 0 R /F4 3 0 R >> >>")                                       # 4
objs.append(None)  # 5: the content stream
objs.append(b"<< /Type /Pages /Kids [7 0 R] /Count 1 >>")                                   # 6
objs.append(b"<< /Type /Page /Parent 6 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources 4 0 R >>")  # 7

pdf = b"%PDF-1.4\n"
offsets = []
for i, o in enumerate(objs):
    offsets.append(len(pdf))
    num = i + 1
    if o is None:
        pdf += b"%d 0 obj\n<< /Length %d /Filter [ /ASCII85Decode /FlateDecode ] >>\nstream\n" % (num, len(armored)) + armored + b"\nendstream\nendobj\n"
    else:
        pdf += b"%d 0 obj\n" % num + o + b"\nendobj\n"
xref = len(pdf)
pdf += b"xref\n0 %d\n" % (len(objs) + 1) + b"0000000000 65535 f \n"
for off in offsets:
    pdf += b"%010d 00000 n \n" % off
pdf += b"trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF\n" % (len(objs) + 1, xref)
open("/tmp/r109-rl-probe-cv.pdf", "wb").write(pdf)
print("probe CV written:", len(pdf), "bytes; content:", len(content), "bytes")
