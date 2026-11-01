// tests/unit/doc-family.test.ts — session 115: the DOC-FAMILY PIN (the
// neo-crm s206 STRICTNESS DOC-CONTRACT + s207 CHART-STACK DOC-FAMILY PIN
// doctrines transferred). The genus: code pins guard the code, but nothing
// guards the DOC CLAIMS — the stack-table rows and the test-count lockstep
// drift for sessions at a time while every gate stays green (the live
// specimen this round: the docs pinned "Playwright 1.63" while package.json
// held ^1.64.1 for the whole r114→r115 window).
//
// Arms (the D-206a1/D-207b1 forms adapted):
//   it-1 THE STACK INSTANCE — every doc face that names the @playwright/test
//       minor (the version the docs chose to pin beyond the major) carries
//       the LIVE minor from package.json.
//   it-2 THE COUNT LOCKSTEP GENUS — the CLAUDE/README/AGENTS live count
//       claims (the pyramid line, the test table, the command table) are
//       mutually consistent and arithmetically closed (total = unit + e2e).
//       Historical session records keep their ship-time counts by doctrine
//       (the s206 scoping rule) — only the LIVE sections are pinned.
//   it-3 THE REVERSE ARM — the docs never claim a dependency the codebase
//       does not carry (the phantom-version check).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import path from "node:path";

const repo = path.resolve(import.meta.dirname, "../..");
const read = (p: string) => readFileSync(path.join(repo, p), "utf8");
const pkg = JSON.parse(read("package.json")) as {
  devDependencies: Record<string, string>;
  dependencies: Record<string, string>;
};

describe("doc-family — the stack + count doc claims pin (session 115, the s206/s207 transfer)", () => {
  it("carries the live @playwright/test minor on every doc face that names it (the stack instance — D-207b1)", () => {
    const liveSpec = pkg.devDependencies["@playwright/test"];
    expect(liveSpec).toBeDefined();
    const liveMinor = liveSpec!.match(/^[\^~]?(\d+\.\d+)/)?.[1];
    expect(liveMinor).toBeDefined();

    const readme = read("README.md");
    const claude = read("CLAUDE.md");
    const skill = read("eon-hr_SKILL.md");

    // the README badge + the tooling table row
    const badge = readme.match(/badge\/Playwright-([\d.]+)/)?.[1];
    expect(badge, "the README Playwright badge must name the live minor").toBe(liveMinor);
    const tableRow = readme.match(/\|\s*E2E tests\s*\|\s*Playwright\s*\|\s*([\d.]+)\s*\|/)?.[1];
    expect(tableRow, "the README tooling table must name the live minor").toBe(liveMinor);

    // the CLAUDE stack line
    const claudeLine = claude.match(/Playwright ([\d.]+)/)?.[1];
    expect(claudeLine, "the CLAUDE tech-stack line must name the live minor").toBe(liveMinor);

    // the SKILL §2 stack row (the full-spec form — the minor must lead it)
    const skillRow = skill.match(/\|\s*E2E\s*\|\s*`?@playwright\/test`?\s*\|\s*[\^~]?([\d.]+)/)?.[1];
    expect(skillRow, "the SKILL stack table must name the live minor").toBeDefined();
    expect(skillRow!.startsWith(liveMinor!), "the SKILL stack row must carry the live minor").toBe(true);
  });

  it("keeps the CLAUDE/README/AGENTS live count claims in lockstep (the count genus — D-206a1)", () => {
    const claude = read("CLAUDE.md");
    const readme = read("README.md");
    const agents = read("AGENTS.md");

    // the CLAUDE pyramid line: "a NNNN-spec test pyramid (NNNN unit + NNN E2E)"
    const pyramid = claude.match(/a (\d+)-spec test pyramid \((\d+) unit \+ (\d+) E2E\)/);
    expect(pyramid, "the CLAUDE pyramid line must carry the unit + e2e counts").toBeDefined();
    const [, total, unit, e2e] = pyramid!.map(Number) as unknown as [number, number, number, number];
    expect(total, "the CLAUDE total must equal unit + e2e").toBe(unit + e2e);

    // the README quickstart block: "bun run test # Vitest unit layer (NNNN specs:" + the E2E line
    const readmeUnit = Number(readme.match(/Vitest unit layer \((\d+) specs/)?.[1]);
    const readmeE2E = Number(readme.match(/Playwright E2E \((\d+) specs\)/)?.[1]);
    expect(readmeUnit, "the README unit-test line must carry the CLAUDE unit count").toBe(unit);
    expect(readmeE2E, "the README E2E line must carry the CLAUDE e2e count").toBe(e2e);
    // the CLAUDE test table rows (the same doc, second site — the family arm)
    const claudeTableUnit = Number(claude.match(/\| Unit \(pure seams\) \| Vitest \| \d+ \| (\d+) \|/)?.[1]);
    const claudeTableE2E = Number(claude.match(/\| E2E \(browser\) \| Playwright \| \d+ \| (\d+) \|/)?.[1]);
    expect(claudeTableUnit, "the CLAUDE test-table unit row must carry the pyramid count").toBe(unit);
    expect(claudeTableE2E, "the CLAUDE test-table E2E row must carry the pyramid count").toBe(e2e);

    // the AGENTS command table: "bun run test` (Vitest, NNNN specs)" + "559 specs"
    const agentsUnit = Number(agents.match(/Unit tests \| `bun run test` \(Vitest, (\d+) specs\)/)?.[1]);
    const agentsE2E = Number(agents.match(/E2E tests \| `bun run test:e2e` \(Playwright, (\d+) specs/)?.[1]);
    expect(agentsUnit, "the AGENTS command table must carry the CLAUDE unit count").toBe(unit);
    expect(agentsE2E, "the AGENTS command table must carry the CLAUDE e2e count").toBe(e2e);
  });

  it("never claims a dependency the codebase does not carry (the phantom-version reverse arm)", () => {
    const claude = read("CLAUDE.md");
    // the CLAUDE stack line names: Next.js 16 · React 19 · TypeScript 5 · Tailwind 4 ·
    // Prisma 6 · Zod 4 · Recharts 3 · Vitest 5 · Playwright N — every major must
    // exist in package.json with that major
    const claims: [string, string][] = [
      ["next", claude.match(/Next\.js (\d+)/)?.[1] ?? ""],
      ["react", claude.match(/React (\d+)/)?.[1] ?? ""],
      ["typescript", claude.match(/TypeScript (\d+)/)?.[1] ?? ""],
      ["tailwindcss", claude.match(/Tailwind CSS (\d+)/)?.[1] ?? ""],
      ["prisma", claude.match(/Prisma (\d+)/)?.[1] ?? ""],
      ["zod", claude.match(/Zod (\d+)/)?.[1] ?? ""],
      ["recharts", claude.match(/Recharts (\d+)/)?.[1] ?? ""],
      ["vitest", claude.match(/Vitest (\d+)/)?.[1] ?? ""],
    ];
    const all = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const [dep, major] of claims) {
      expect(all[dep], `the CLAUDE stack line names ${dep} — it must exist in package.json`).toBeDefined();
      const liveMajor = all[dep]!.match(/^[\^~]?(\d+)/)?.[1];
      expect(major, `the CLAUDE ${dep} major must match package.json`).toBe(liveMajor);
    }
  });
});
