#!/usr/bin/env python3
# r113-weasy-probe.py — the LIVE UI-verify probe: a genuine WeasyPrint CV
# carrying the probe name + the zero-kern per-glyph form + floated dates
# (reads LETTER SOUP at HEAD: "r 1 1 3   w e a s y   p r o b e").
from weasyprint import HTML
html = """<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@page { size: A4; margin: 18mm 16mm; }
body { font-family: 'DejaVu Serif', serif; font-size: 10.5pt; line-height: 1.45; }
h1 { font-size: 22pt; margin: 0 0 2pt 0; }
h2 { font-size: 12pt; border-bottom: 1.2pt solid #2b2b2b; padding-bottom: 2pt; margin: 14pt 0 6pt 0; text-transform: uppercase; }
.subtitle { font-size: 12pt; color: #444; }
.contact { font-size: 9pt; color: #555; margin-bottom: 10pt; }
.entry { margin-bottom: 8pt; }
.entry .role { font-weight: bold; }
.entry .dates { float: right; color: #555; font-size: 9.5pt; }
</style></head><body>
<h1>r113 weasy probe</h1>
<div class="subtitle">Senior HR Manager</div>
<div class="contact">r113.weasy@example.com · +1 (555) 010-9911 · San Francisco, CA</div>
<h2>Summary</h2>
<p>Human resources leader with twelve years of progressive experience across talent acquisition, compensation design and organizational development. Led a team of nine HR business partners through two acquisitions with payroll and GOSI compliance ownership.</p>
<h2>Experience</h2>
<div class="entry"><span class="dates">Mar 2021 - Present</span><span class="role">Senior HR Manager</span> — TechCorp
<ul><li>Led a team of nine HR business partners through two acquisitions.</li><li>Redesigned the compensation framework for 400 employees with onboarding compliance training.</li></ul></div>
<div class="entry"><span class="dates">Jun 2018 - Feb 2021</span><span class="role">HR Business Partner</span> — InnovateLLC
<ul><li>Owned the performance review cycle and the onboarding program for 200 new hires.</li></ul></div>
<h2>Skills</h2>
<p>Employee Relations, Compensation Design, Talent Acquisition, HRIS, Workday, SAP SuccessFactors, payroll administration</p>
<h2>Certifications</h2>
<p>SHRM-SCP (2020), PHR (2017)</p>
<h2>Education</h2>
<p>B.A. Psychology, University of California, Berkeley, 2010 - 2014</p>
</body></html>"""
HTML(string=html).write_pdf("/tmp/r113-weasy-probe.pdf")
print("probe written: /tmp/r113-weasy-probe.pdf")
