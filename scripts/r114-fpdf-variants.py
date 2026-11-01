#!/usr/bin/env python3
# r114-fpdf-variants.py — session 114 / parity round 113: the fpdf2 variant
# battery pinning the pattern's generality (the r113 discipline):
#   control       — plain left-aligned, no positioning tricks
#   absolute      — SetXY absolutely-placed date column (the hoist class)
#   twopage       — two pages (the page-boundary class)
#   letterspaced  — per-char tracking (char_spacing — the display class)
#   corefont      — base-14 core fonts (Helvetica, NO TTF embedding — the
#                   1-byte literal class)
import os
from fpdf import FPDF

OUT = "/tmp/r114-writers"
os.makedirs(OUT, exist_ok=True)

FONT = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
FONT_B = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"


def build(path, variant):
    DASH = "-" if variant == "corefont" else "—"  # the core fonts are latin-1: no U+2014
    pdf = FPDF(format="Letter")
    pdf.set_margins(18, 18, 18)
    pdf.set_auto_page_break(True, margin=18)
    if variant != "corefont":
        pdf.add_font("Liberation", "", FONT)
        pdf.add_font("Liberation", "B", FONT_B)
        fam = "Liberation"
    else:
        fam = "Helvetica"
    pdf.add_page()

    if variant == "letterspaced":
        pdf.set_font(fam, "B", 22)
        pdf.set_char_spacing(2.0)  # per-char tracking (the display class)
        pdf.cell(0, 10, "John Smith", new_x="LMARGIN", new_y="NEXT")
        pdf.set_char_spacing(0)
    else:
        pdf.set_font(fam, "B", 22)
        pdf.cell(0, 10, "John Smith", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font(fam, "", 12)
    pdf.cell(0, 7, "Senior HR Manager", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font(fam, "", 10)
    pdf.cell(0, 6, "john.smith@example.com · +1 (555) 010-2233 · San Francisco, CA",
             new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)

    def section(title):
        pdf.set_font(fam, "B", 11)
        pdf.cell(0, 7, title, new_x="LMARGIN", new_y="NEXT")
        pdf.set_draw_color(120, 120, 120)
        pdf.set_line_width(0.3)
        y = pdf.get_y()
        pdf.line(18, y, 195, y)
        pdf.ln(3)

    def body(txt, justify=True):
        pdf.set_font(fam, "", 10)
        pdf.multi_cell(0, 5.2, txt, new_x="LMARGIN", new_y="NEXT",
                       align="J" if justify else "L")

    section("SUMMARY")
    body("Human resources leader with twelve years of progressive experience "
         "across talent acquisition, compensation design and organizational "
         "development. Led a team of nine HR business partners through two acquisitions.")
    pdf.ln(2)

    section("EXPERIENCE")
    entries = [
        ("Senior HR Manager " + DASH + " Acme Corporation", "Mar 2021 " + DASH + " Present",
         ["Led a team of nine HR business partners supporting 1,200 employees.",
          "Redesigned the compensation framework, cutting pay-equity gaps by 18%.",
          " Ran the annual review cycle for three consecutive years."]),
        ("HR Business Partner " + DASH + " Globex Industries", "Jun 2017 " + DASH + " Feb 2021",
         ["Owned talent acquisition for the engineering division (40+ hires/year).",
          "Introduced structured interviews, lifting offer-acceptance to 82%."]),
    ]
    for role, dates, bullets in entries:
        if variant == "absolute":
            # the absolutely-placed right date column (the hoist class)
            y0 = pdf.get_y()
            pdf.set_font(fam, "B", 10)
            pdf.cell(0, 6, role, new_x="LMARGIN", new_y="NEXT")
            pdf.set_xy(140, y0)
            pdf.set_font(fam, "", 10)
            pdf.cell(55, 6, dates, align="R")
            pdf.set_xy(18, y0 + 6)
        else:
            pdf.set_font(fam, "B", 10)
            pdf.cell(0, 6, role, new_x="LMARGIN", new_y="NEXT")
            pdf.set_font(fam, "", 10)
            pdf.cell(0, 5.5, dates, new_x="LMARGIN", new_y="NEXT")
        for b in bullets:
            pdf.set_font(fam, "", 10)
            pdf.multi_cell(0, 5.2, (("• " if variant != "corefont" else "- ") + b.strip()), new_x="LMARGIN", new_y="NEXT")
        pdf.ln(2)

    section("SKILLS")
    pdf.set_font(fam, "", 10)
    pdf.multi_cell(0, 5.2,
                   "Talent Acquisition · Compensation Design · Organizational Development · "
                   "Employee Relations · HR Analytics · Change Management",
                   new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)

    section("CERTIFICATIONS")
    pdf.set_font(fam, "", 10)
    pdf.multi_cell(0, 5.2, "SHRM-SCP (2020) · Certified Compensation Professional (2019)",
                   new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)

    section("EDUCATION")
    pdf.set_font(fam, "B", 10)
    pdf.cell(0, 6, "MBA, Human Resources " + DASH + " Example University", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font(fam, "", 10)
    pdf.cell(0, 5.5, "Sep 2013 " + DASH + " May 2015", new_x="LMARGIN", new_y="NEXT")

    if variant == "twopage":
        pdf.add_page()
        section("REFERENCES")
        body("Available upon request. Contact details for three professional "
             "references covering the Acme Corporation and Globex Industries tenure.")
        pdf.set_font(fam, "", 10)
        pdf.multi_cell(0, 5.2, "Carol Danvers — VP People, Acme Corporation", new_x="LMARGIN", new_y="NEXT")

    pdf.output(path)
    print(f"wrote {path} ({os.path.getsize(path)} bytes)")


for v in ["control", "absolute", "twopage", "letterspaced", "corefont"]:
    build(f"{OUT}/fpdf-variant-{v}.pdf", v)
