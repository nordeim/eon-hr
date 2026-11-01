#!/usr/bin/env python3
# r114-fpdf-probe.py — session 114 / parity round 113: the 19th-writer HUNT
# probe. fpdf2 2.8.5 (the modern PyFPDF lineage — a distinct writer family
# from ReportLab: its own TTF subsetter, its own ToUnicode/CID layout).
# A modern-cv-shaped resume matching the corpus specimen shape (the same
# John Smith Senior HR Manager content every hunt probe uses).
import os
from fpdf import FPDF

OUT = "/tmp/r114-writers"
os.makedirs(OUT, exist_ok=True)

FONT = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
FONT_B = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"


class Resume(FPDF):
    def header(self):
        pass

    def footer(self):
        pass


def build(path):
    pdf = Resume(format="Letter")
    pdf.set_margins(18, 18, 18)
    pdf.set_auto_page_break(True, margin=18)
    pdf.add_font("Liberation", "", FONT)
    pdf.add_font("Liberation", "B", FONT_B)
    pdf.add_page()

    # Name (display size, letter-spaced like the corpus specimen)
    pdf.set_font("Liberation", "B", 22)
    pdf.cell(0, 10, "John Smith", new_x="LMARGIN", new_y="NEXT", align="L")
    # Role
    pdf.set_font("Liberation", "", 12)
    pdf.cell(0, 7, "Senior HR Manager", new_x="LMARGIN", new_y="NEXT", align="L")
    # Contact line (the · separator + unicode-safe text)
    pdf.set_font("Liberation", "", 10)
    pdf.cell(
        0,
        6,
        "john.smith@example.com · +1 (555) 010-2233 · San Francisco, CA",
        new_x="LMARGIN",
        new_y="NEXT",
        align="L",
    )
    pdf.ln(4)

    def section(title):
        pdf.set_font("Liberation", "B", 11)
        pdf.cell(0, 7, title, new_x="LMARGIN", new_y="NEXT", align="L")
        pdf.set_draw_color(120, 120, 120)
        pdf.set_line_width(0.3)
        y = pdf.get_y()
        pdf.line(18, y, 195, y)
        pdf.ln(3)

    def body(txt):
        pdf.set_font("Liberation", "", 10)
        pdf.multi_cell(0, 5.2, txt, new_x="LMARGIN", new_y="NEXT")

    section("SUMMARY")
    body(
        "Human resources leader with twelve years of progressive experience "
        "across talent acquisition, compensation design and organizational "
        "development. Led a team of nine HR business partners through two "
        "acquisitions."
    )
    pdf.ln(2)

    section("EXPERIENCE")
    entries = [
        (
            "Senior HR Manager — Acme Corporation",
            "Mar 2021 — Present",
            [
                "Led a team of nine HR business partners supporting 1,200 employees.",
                "Redesigned the compensation framework, cutting pay-equity gaps by 18%.",
                " Ran the annual review cycle for three consecutive years.",
            ],
        ),
        (
            "HR Business Partner — Globex Industries",
            "Jun 2017 — Feb 2021",
            [
                "Owned talent acquisition for the engineering division (40+ hires/year).",
                "Introduced structured interviews, lifting offer-acceptance to 82%.",
            ],
        ),
    ]
    for role, dates, bullets in entries:
        pdf.set_font("Liberation", "B", 10)
        pdf.cell(0, 6, role, new_x="LMARGIN", new_y="NEXT", align="L")
        pdf.set_font("Liberation", "", 10)
        pdf.cell(0, 5.5, dates, new_x="LMARGIN", new_y="NEXT", align="L")
        for b in bullets:
            pdf.multi_cell(0, 5.2, "• " + b.strip(), new_x="LMARGIN", new_y="NEXT")
        pdf.ln(2)

    section("SKILLS")
    pdf.set_font("Liberation", "", 10)
    pdf.multi_cell(
        0,
        5.2,
        "Talent Acquisition · Compensation Design · Organizational Development · "
        "Employee Relations · HR Analytics · Change Management",
        new_x="LMARGIN",
        new_y="NEXT",
    )
    pdf.ln(2)

    section("CERTIFICATIONS")
    pdf.set_font("Liberation", "", 10)
    pdf.multi_cell(
        0,
        5.2,
        "SHRM-SCP (2020) · Certified Compensation Professional (2019)",
        new_x="LMARGIN",
        new_y="NEXT",
    )
    pdf.ln(2)

    section("EDUCATION")
    pdf.set_font("Liberation", "B", 10)
    pdf.cell(0, 6, "MBA, Human Resources — Example University", new_x="LMARGIN", new_y="NEXT", align="L")
    pdf.set_font("Liberation", "", 10)
    pdf.cell(0, 5.5, "Sep 2013 — May 2015", new_x="LMARGIN", new_y="NEXT", align="L")

    pdf.output(path)
    print(f"wrote {path} ({os.path.getsize(path)} bytes)")


build(f"{OUT}/fpdf-cv.pdf")
