#!/usr/bin/env bun
// r112-skia-cv-probe.ts — the LIVE-UI probe specimen: a genuine Chromium
// print (the 17th-writer class) whose floated date column hoists above the
// candidate name at HEAD (stream order) and reads in layout order after the
// R112-A repair. Carries the "r112 skia probe" name for the sweep.
// Usage: bun scripts/r112-skia-cv-probe.ts
import { chromium } from "playwright";

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { size: A4; margin: 18mm 16mm; }
  body { font-family: Georgia, serif; font-size: 10.5pt; line-height: 1.45; }
  h1 { font-size: 21pt; margin: 0 0 2pt 0; }
  h2 { font-size: 11.5pt; border-bottom: 1pt solid #2b2b2b; margin: 13pt 0 5pt 0; text-transform: uppercase; }
  .subtitle { font-size: 12pt; color: #444; }
  .contact { font-size: 9pt; color: #555; margin: 2pt 0 10pt 0; }
  .dates { float: right; color: #555; font-size: 9.5pt; }
  .entry { margin-bottom: 8pt; }
  .role { font-weight: bold; }
  .org { font-style: italic; }
  ul { margin: 3pt 0 0 0; padding-left: 14pt; }
</style>
</head>
<body>
  <h1>r112 skia probe</h1>
  <p class="subtitle">Senior HR Manager</p>
  <p class="contact">r112.skia@example.com &middot; +1 (555) 010-9911 &middot; San Francisco, CA</p>

  <h2>Summary</h2>
  <p>Human resources leader with twelve years of progressive experience across talent acquisition, compensation design and organizational development. Deep expertise in HRIS platforms, pay equity analysis and workforce analytics.</p>

  <h2>Experience</h2>
  <div class="entry">
    <span class="dates">Mar 2021 &ndash; Present</span>
    <span class="role">Senior HR Manager</span> &mdash; <span class="org">TechCorp Inc., San Francisco</span>
    <ul>
      <li>Owned the annual compensation cycle for a 1,400-employee organization.</li>
      <li>Rebuilt the recruiting pipeline, reducing time-to-hire from 47 to 29 days.</li>
    </ul>
  </div>
  <div class="entry">
    <span class="dates">Jun 2016 &ndash; Feb 2021</span>
    <span class="role">HR Business Partner</span> &mdash; <span class="org">Northwind Logistics, Oakland</span>
    <ul>
      <li>Partnered with operations directors on workforce planning for 600+ staff.</li>
    </ul>
  </div>
  <div class="entry">
    <span class="dates">Aug 2014 &ndash; May 2016</span>
    <span class="role">Recruitment Coordinator</span> &mdash; <span class="org">Bright Path Consulting, San Jose</span>
    <ul>
      <li>Coordinated 40+ requisitions per quarter.</li>
    </ul>
  </div>
  <div class="entry">
    <span class="dates">2010 &ndash; 2014</span>
    <span class="role">B.S. in Business Administration</span> &mdash; <span class="org">Example University</span>
  </div>

  <h2>Skills</h2>
  <ul>
    <li>Talent Acquisition, Compensation, HRIS, Workforce Analytics, Employee Relations</li>
  </ul>
</body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle" });
await page.pdf({ path: "/tmp/r112-skia-probe.pdf", format: "A4", printBackground: true });
await browser.close();

// confirm the hoist signature at the CURRENT (fixed) source + print the head
const { readFileSync } = await import("node:fs");
const mod = await import("/home/z/my-project/eon-hr/src/lib/cv-text");
const raw = readFileSync("/tmp/r112-skia-probe.pdf");
const text = await mod.extractTextFromFile(new File([new Uint8Array(raw)], "probe.pdf"));
console.log("probe written: /tmp/r112-skia-probe.pdf");
console.log("fixed-source head:", JSON.stringify(text.slice(0, 130)));
console.log("name-before-dates:", text.indexOf("r112 skia probe") < text.indexOf("Mar 2021"));
