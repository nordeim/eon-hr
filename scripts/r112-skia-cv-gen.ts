#!/usr/bin/env bun
// r112-skia-cv-gen.ts — the 17th-writer hunt: generate a genuine
// Chromium/Skia print-to-PDF specimen (the modern "Download CV" path:
// job portals and CV builders emit Skia-written PDFs through headless
// Chromium print). Mirrors the modern-cv content shape (John Smith,
// Senior HR Manager) for probe comparability with the Typst round.
// Usage: bun scripts/r112-skia-cv-gen.ts
import { chromium } from "playwright";

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>John Smith — Senior HR Manager</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; font-size: 10.5pt; line-height: 1.45; }
  h1 { font-size: 22pt; margin: 0 0 2pt 0; letter-spacing: 0.5pt; }
  h2 { font-size: 12pt; border-bottom: 1.2pt solid #2b2b2b; padding-bottom: 2pt; margin: 14pt 0 6pt 0; text-transform: uppercase; letter-spacing: 1pt; }
  .subtitle { font-size: 12pt; color: #444; margin: 0 0 2pt 0; }
  .contact { font-size: 9pt; color: #555; margin-bottom: 10pt; }
  .entry { margin-bottom: 8pt; }
  .entry .role { font-weight: bold; }
  .entry .org { font-style: italic; color: #333; }
  .entry .dates { float: right; color: #555; font-size: 9.5pt; }
  ul { margin: 3pt 0 0 0; padding-left: 14pt; }
  li { margin-bottom: 2pt; }
  .skills { column-count: 2; column-gap: 18pt; }
  .skill { margin-bottom: 2pt; break-inside: avoid; }
</style>
</head>
<body>
  <h1>John Smith</h1>
  <p class="subtitle">Senior HR Manager</p>
  <p class="contact">john.smith@example.com &middot; +1 (555) 010-2233 &middot; San Francisco, CA</p>

  <h2>Summary</h2>
  <p>Human resources leader with twelve years of progressive experience across talent acquisition, compensation design and organizational development. Led a team of nine HR business partners through two acquisition integrations while raising retention of high performers from 78% to 91%. Deep expertise in HRIS platforms, pay equity analysis and workforce analytics.</p>

  <h2>Experience</h2>
  <div class="entry">
    <span class="dates">Mar 2021 &ndash; Present</span>
    <span class="role">Senior HR Manager</span> &mdash; <span class="org">TechCorp Inc., San Francisco</span>
    <ul>
      <li>Owned the annual compensation cycle for a 1,400-employee organization, delivering a data-driven merit matrix that closed the pay-equity gap to under 0.4%.</li>
      <li>Rebuilt the recruiting pipeline: reduced time-to-hire from 47 to 29 days by introducing structured interviews and a shared scorecard.</li>
      <li>Championed the migration from legacy spreadsheets to a unified HRIS, cutting payroll processing errors by 73%.</li>
    </ul>
  </div>
  <div class="entry">
    <span class="dates">Jun 2016 &ndash; Feb 2021</span>
    <span class="role">HR Business Partner</span> &mdash; <span class="org">Northwind Logistics, Oakland</span>
    <ul>
      <li>Partnered with operations directors on workforce planning for 600+ warehouse and driver staff across four sites.</li>
      <li>Designed the shift-swap program that reduced overtime spend by $410,000 per year.</li>
    </ul>
  </div>
  <div class="entry">
    <span class="dates">Aug 2014 &ndash; May 2016</span>
    <span class="role">Recruitment Coordinator</span> &mdash; <span class="org">Bright Path Consulting, San Jose</span>
    <ul>
      <li>Coordinated 40+ requisitions per quarter and maintained the applicant tracking system.</li>
    </ul>
  </div>

  <h2>Education</h2>
  <div class="entry">
    <span class="dates">2010 &ndash; 2014</span>
    <span class="role">B.S. in Business Administration (Human Resources)</span> &mdash; <span class="org">Example University</span>
  </div>

  <h2>Skills</h2>
  <div class="skills">
    <div class="skill">Talent Acquisition &amp; Structured Interviewing</div>
    <div class="skill">Compensation &amp; Pay Equity Analysis</div>
    <div class="skill">HRIS Administration (Workday, BambooHR)</div>
    <div class="skill">Workforce Analytics &amp; Reporting</div>
    <div class="skill">Employee Relations &amp; Investigations</div>
    <div class="skill">Organizational Design</div>
    <div class="skill">Employment Law Compliance (FMLA, ADA, Title VII)</div>
    <div class="skill">Coaching &amp; Leadership Development</div>
  </div>

  <h2>Certifications</h2>
  <ul>
    <li>SHRM-SCP, Society for Human Resource Management (2019)</li>
    <li>Compensation Analyst Certificate, WorldatWork (2020)</li>
  </ul>
</body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle" });
await page.pdf({ path: "/tmp/skia-cv/john-smith-cv.pdf", format: "A4", printBackground: true });
await browser.close();
console.log("specimen written: /tmp/skia-cv/john-smith-cv.pdf");
