#!/usr/bin/env bun
// r112-skia-variants.ts — pin the Skia float-hoist pattern's generality:
// (a) control — no floats (must extract in order, unchanged);
// (b) floats LAST in DOM (does Chromium still hoist them first?);
// (c) absolutely-positioned boxes;
// (d) two pages (per-page hoist?).
// Usage: bun scripts/r112-skia-variants.ts
import { chromium } from "playwright";

const css = `
  @page { size: A4; margin: 18mm 16mm; }
  body { font-family: Georgia, serif; font-size: 10.5pt; line-height: 1.45; }
  h1 { font-size: 20pt; margin: 0 0 6pt 0; }
  h2 { font-size: 11pt; border-bottom: 1pt solid #333; margin: 12pt 0 5pt 0; }
  .dates { float: right; color: #555; }
  .abs { position: absolute; top: 40mm; right: 16mm; color: #777; }
  p { margin: 0 0 6pt 0; }
`;

const para = (n: number) => `<p>Paragraph ${n}: the quick brown fox jumps over the lazy dog while the recruiter reads the resume text extraction pipeline.</p>`;

const variants: [string, string][] = [
  ["control", `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
    <h1>Anna Control</h1><h2>Section One</h2>${para(1)}${para(2)}<h2>Section Two</h2>${para(3)}${para(4)}
  </body></html>`],
  ["floatlast", `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
    <h1>Bob Floatlast</h1><h2>Section One</h2>${para(1)}<span class="dates">Jan 2020 - Dec 2024</span>${para(2)}<h2>Section Two</h2>${para(3)}${para(4)}
  </body></html>`],
  ["absolute", `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
    <div class="abs">ABS-TAG-99</div>
    <h1>Clara Absolute</h1><h2>Section One</h2>${para(1)}${para(2)}<h2>Section Two</h2>${para(3)}${para(4)}
  </body></html>`],
  ["twopage", `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
    <h1>Dora Twopage</h1><span class="dates">PG1-FLOAT</span><h2>Page One</h2>${para(1)}${para(2)}${para(3)}${para(4)}${para(5)}${para(6)}${para(7)}${para(8)}${para(9)}${para(10)}${para(11)}${para(12)}
    <div style="page-break-before: always"></div>
    <h2>Page Two</h2><span class="dates">PG2-FLOAT</span>${para(13)}${para(14)}${para(15)}${para(16)}
  </body></html>`],
];

const browser = await chromium.launch();
for (const [name, html] of variants) {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.pdf({ path: `/tmp/skia-cv/variant-${name}.pdf`, format: "A4" });
  await page.close();
  console.log(`variant-${name}.pdf written`);
}
await browser.close();
