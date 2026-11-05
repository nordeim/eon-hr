#!/usr/bin/env node
// r126-parent-hygiene.mjs — the pre-gate parent-hygiene probe (D-126a, the
// neo-crm s214 genus transfer): a sandbox reset can resurrect a stale
// db/custom.db or prisma/schema.prisma ABOVE the repo root, and eon-hr's
// db-path anchor search (standalone root → module root → CWD) is
// unconditional — a stray schema-bearing parent could silently capture the
// resolution and drift every DB-touching gate onto a phantom file.
// The probe walks the repo's ancestor chain and exits non-zero with the
// offending path if any db/custom.db or prisma/schema.prisma exists ABOVE
// the repo root. Run before db:push / db:seed / the E2E boot / the
// launch-verify legs.
// Usage: node scripts/r126-parent-hygiene.mjs
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = dirname(dirname(fileURLToPath(import.meta.url)));
const offenders = [];
let dir = dirname(repo); // start ABOVE the repo root
for (let i = 0; i < 8 && dir !== dirname(dir); i++) {
  for (const probe of ["db/custom.db", "prisma/schema.prisma"]) {
    const p = join(dir, probe);
    if (existsSync(p)) offenders.push(p);
  }
  dir = dirname(dir);
}
if (offenders.length) {
  console.error("PARENT-HYGIENE FAIL — stray anchor files above the repo root (the neo-crm s214 phantom-DB class):");
  for (const p of offenders) console.error("  " + p);
  console.error("Remove them (or move the real DB into <repo>/db/) before any DB-touching gate.");
  process.exit(1);
}
console.log("parent-hygiene OK — no stray db/custom.db or prisma/schema.prisma above " + repo);
