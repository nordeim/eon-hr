#!/usr/bin/env node
// r49-alwaysrow-pass.mjs — insert the `alwaysRow` prop into the target
// pages' <PageHeader> invocations (the always-start family already
// carries actionsStart; the center family gets alwaysRow alone).
import { readFileSync, writeFileSync } from "node:fs";

const repo = "/home/z/my-project/eon-hr";
const pages = process.argv.slice(2);

for (const p of pages) {
  const f = `${repo}/src/app/(app)/${p}/page.tsx`;
  let src = readFileSync(f, "utf8");
  const m = src.match(/<PageHeader\n/);
  if (!m) { console.log(`SKIP ${p}: no <PageHeader`); continue; }
  if (/(^|\n)\s*alwaysRow\n/.test(src.slice(m.index, m.index + 800))) { console.log(`SKIP ${p}: already alwaysRow`); continue; }
  const insertAt = m.index + "<PageHeader".length;
  src = src.slice(0, insertAt) + "\n" +
    `\n        /* Session 49 (R48-A3): the always-row family — REF renders the\n         *  UNPREFIXED always-row (measured @1440×900 this round). */\n        alwaysRow` +
    src.slice(insertAt);
  writeFileSync(f, src);
  console.log(`OK ${p}`);
}
