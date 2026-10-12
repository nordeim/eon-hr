#!/usr/bin/env node
// r25-codemod-layouts.mjs — generate the per-route server layout.tsx for
// every (app) route dir (client pages cannot export metadata — the tiny
// server layout is the idiomatic Next 16 pattern). Idempotent: skips dirs
// that already have a layout.tsx.
import { readdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const BASE = join(process.cwd(), "src", "app", "(app)");
const dirs = readdirSync(BASE, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

let created = 0;
for (const dir of dirs) {
  const layoutPath = join(BASE, dir, "layout.tsx");
  if (existsSync(layoutPath)) continue;
  writeFileSync(
    layoutPath,
    `import type { Metadata } from "next";
import { pageMetadata } from "@/lib/meta";

export const metadata: Metadata = pageMetadata("/${dir}");

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
`
  );
  created++;
}
console.log(`codemod: ${created} route layouts created (${dirs.length} route dirs total)`);
