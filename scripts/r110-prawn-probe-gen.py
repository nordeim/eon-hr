#!/usr/bin/env python3
# r110-prawn-probe-gen.py — the LIVE-UI-verify probe CV in the EXACT Prawn
# shape (the 15th-writer class the round fixed): every stream UNCOMPRESSED
# (no /Filter at all), DOTTED /F-name resources (/F1.0 /F2.0 /F3.0), an
# ARRAY-form ToUnicode CMap whose element triples would re-parse as a
# base-offset range pre-fix, a WinAnsi-declared font with no ToUnicode
# carrying the glyph-table hex atoms, the polytonic Greek sentence, the CJK
# run, an NBSP run, and 14-em-apart chart ticks. CV-sized (a book is not a
# CV — the r109 lesson).
import re

greek_cmap = (
    "/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n"
    "/CMapName /Adobe-Identity-UCS def\n1 begincodespacerange\n<00><ff>\nendcodespacerange\n"
    # the ARRAY form: 0x21->€ 0x22->ὕ 0x23->α 0x24->λ 0x25->ο 0x26->ν — the
    # element run <0020><20ac><1f55> re-matches the base-offset shape pre-fix
    "1 beginbfrange\n<20><27>[<0020><20ac><1f55><03b1><03bb><03bf><03bd><03d5>]\nendbfrange\n"
    "endcmap\nCMapName currentdict /CMap defineresource pop end end\n"
)
# the CJK cmap: base-offset bfrange (0x21.. -> 更 可 怕 的 是 、)
cjk_cmap = (
    "/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n"
    "/CMapName /Adobe-Identity-UCS def\n1 begincodespacerange\n<00><7f>\nendcodespacerange\n"
    # bfchar entries (更 可 怕 的 — the real glyphs, not a base-offset run)
    "4 beginbfchar\n<21><66f4>\n<22><53ef>\n<23><6015>\n<24><7684>\nendbfchar\n"
    "endcmap\nCMapName currentdict /CMap defineresource pop end end\n"
)
greek_hex = "222324252627"          # ὕ α λ ο ν ϕ  (0x22..0x27)
greek2_hex = "222423"               # ὕ λ α (an emphasis run)
cjk_hex = "21222324"                # 更 可 怕 的

content = (
    # the WinAnsi glyph-table row shape: slot . glyph . width . name
    "BT /F1.0 10 Tf 40 760 Td <3136312e> Tj ET\n"          # "161."
    "BT 78 760 Td /F1.0 10 Tf <a1> Tj ET\n"                 # ¡ (the WinAnsi reading — ° pre-fix)
    "BT 100 760 Td /F1.0 10 Tf <333333> Tj ET\n"            # "333"
    "BT 130 760 Td /F1.0 10 Tf <6578636c616d646f776e> Tj ET\n"  # "exclamdown"
    # the name + headline
    "BT /F1.0 16 Tf 40 700 Td (Nadia Haddad) Tj ET\n"
    "BT /F1.0 11 Tf 40 678 Td (Senior HR Specialist) Tj ET\n"
    "BT /F1.0 11 Tf 40 656 Td (payroll admin compliance training onboarding specialist platform systems technology) Tj ET\n"
    # the Greek line (the array-form cmap + dotted name)
    f"BT /F2.0 11 Tf 40 620 Td <{greek_hex}> Tj ET\n"
    # the CJK line (the base-offset cmap + dotted name)
    f"BT /F3.0 11 Tf 40 596 Td <{cjk_hex}> Tj ET\n"
    # the NBSP run + the 14-em chart ticks (the R110-D shape)
    "BT /F1.0 7 Tf 40 560 Td (\\240\\240) Tj ET\n"
    "BT 60 540 Td /F1.0 7 Tf (100.0) Tj ET\n"
    "BT 160 540 Td /F1.0 7 Tf (200.0) Tj ET\n"
    "BT 260 540 Td /F1.0 7 Tf (300.0) Tj ET\n"
    # the bullet + experience lines
    "BT /F1.0 11 Tf 40 500 Td (\\225) Tj ET\n"
    "BT 60 500 Td /F1.0 11 Tf (Managed payroll for 400 staff across three entities) Tj ET\n"
    "BT /F1.0 11 Tf 40 476 Td (\\225) Tj ET\n"
    "BT 60 476 Td /F1.0 11 Tf (Built the onboarding program and compliance training track) Tj ET\n"
    "BT /F1.0 11 Tf 40 452 Td (\\225) Tj ET\n"
    "BT 60 452 Td /F1.0 11 Tf (GOSI filings, end of service, and leave administration) Tj ET\n"
    # the skills block (alnum density for the guard)
    "BT /F1.0 11 Tf 40 416 Td (Skills: payroll, GOSI, compliance, onboarding, training, HRIS, reporting) Tj ET\n"
    "BT /F1.0 11 Tf 40 392 Td (Languages: Arabic native, English fluent, Greek reading) Tj ET\n"
    f"BT /F2.0 11 Tf 40 368 Td <{greek2_hex}> Tj ET\n"
)

objects = [
    "<< /Type /Catalog /Pages 9 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",      # obj 2: F1.0 (no ToUnicode — the named encoding)
    None,                                                                                      # obj 3: the Greek cmap stream
    "<< /Type /Font /Subtype /TrueType /BaseFont /AAAAAA+DemoGreek /ToUnicode 3 0 R >>",       # obj 4: F2.0
    None,                                                                                      # obj 5: the CJK cmap stream
    "<< /Type /Font /Subtype /TrueType /BaseFont /BBBBBB+DemoCJK /ToUnicode 5 0 R >>",        # obj 6: F3.0
    None,                                                                                      # obj 7: the content stream (RAW)
    "<< /Font << /F1.0 2 0 R /F2.0 4 0 R /F3.0 6 0 R >> >>",                                  # obj 8: resources (DOTTED names)
    "<< /Type /Pages /Kids [10 0 R] >>",                                                       # obj 9
    "<< /Type /Page /Contents 7 0 R /Resources 8 0 R >>",                                      # obj 10
]
streams = {3: greek_cmap, 5: cjk_cmap, 7: content}  # every stream RAW (no /Filter)

pdf = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"
offsets = []
parts = []
for i, obj in enumerate(objects, start=1):
    offsets.append(sum(len(p) for p in parts))
    if obj is None:
        payload = streams[i].encode("latin1")
        parts.append(f"{i} 0 obj\n<< /Length {len(payload)} >>\nstream\n".encode("latin1"))
        parts.append(payload)
        parts.append(b"\nendstream\nendobj\n")
    else:
        parts.append(f"{i} 0 obj\n{obj}\nendobj\n".encode("latin1"))
xref_pos = sum(len(p) for p in parts)
parts.append(f"xref\n0 {len(objects)+1}\n0000000000 65535 f \n".encode("latin1"))
for o in offsets:
    parts.append(f"{o:010d} 00000 n \n".encode("latin1"))
parts.append(f"trailer\n<< /Size {len(objects)+1} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n".encode("latin1"))
pdf_bytes = b"".join(parts)
open("/tmp/r110-prawn-probe-cv.pdf", "wb").write(pdf_bytes)
print(f"wrote /tmp/r110-prawn-probe-cv.pdf ({len(pdf_bytes)} bytes)")
