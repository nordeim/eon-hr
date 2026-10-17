#!/usr/bin/env node
// r49-bare-pass.mjs — insert the `bare` prop (standalone prop line, the
// pin-friendly form) into the target pages' <PageHeader> invocations.
// Special forms (centered/heroClassName) are handled per-page below.
import { readFileSync, writeFileSync } from "node:fs";

const repo = "/home/z/my-project/eon-hr";
const pages = process.argv.slice(2);

for (const p of pages) {
  const f = `${repo}/src/app/(app)/${p}/page.tsx`;
  let src = readFileSync(f, "utf8");
  const m = src.match(/<PageHeader\n(?:[^<]*\n)*?\s*section=/) || src.match(/<PageHeader\n/);
  if (!m) { console.log(`SKIP ${p}: no <PageHeader`); continue; }
  if (/(^|\n)\s*bare\n/.test(src.slice(m.index, m.index + 600))) { console.log(`SKIP ${p}: already bare`); continue; }
  const insertAt = m.index + "<PageHeader".length;
  const nl = src[insertAt] === "\n" ? "" : "\n";
  src = src.slice(0, insertAt) + nl +
    `\n        /* Session 49 (R48-A2): the bare family — REF renders the hero\n         *  block as a DIRECT child of the content wrapper (no hero row).\n         *  Live-measured @1440×900 this round. */\n        bare` +
    src.slice(insertAt);
  writeFileSync(f, src);
  console.log(`OK ${p}`);
}
