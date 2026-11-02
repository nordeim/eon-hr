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
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";
import path from "node:path";

const repo = path.resolve(import.meta.dirname, "../..");
const read = (p: string) => readFileSync(path.join(repo, p), "utf8");
const join = (...p: string[]) => path.join(...p);
const walk = (dir: string): string[] => {
  const out: string[] = [];
  for (const e of readdirSync(dir)) {
    const p = path.join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
};
const pkg = JSON.parse(read("package.json")) as {
  devDependencies: Record<string, string>;
  dependencies: Record<string, string>;
  scripts: Record<string, string>;
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

  // Session 118 (D-118b — the neo-crm s208 DOC-CLAIM TOTALITY CENSUS
  // transferred): the STRUCTURAL LIVE-CENSUS. The genus: the stack and
  // count pins above guard the version/test axes, but NOTHING guarded the
  // structural counts — the route/handler/model claims rode 85+ sessions
  // stale (the initial commit's "46 routes, 49 API handlers, 45 models"
  // fossils: the live docs claimed 54 route handlers / 47 Prisma models /
  // 49 endpoints against a tree carrying 57 / 48 / 57 at this round's
  // census). The pin reads the counts LIVE from the tree (the app-route
  // walk, the API route-file walk, the schema model walk) and asserts the
  // LIVE doc faces carry exactly them — either face drifting goes RED (a
  // route added without the doc flip, or a doc flipped without the code).
  it("keeps the structural count claims live against the tree (the route/handler/model census — D-118b, the s208 transfer)", () => {
    const appRoutes = readdirSync(join(repo, "src/app/(app)"))
      .filter((d) => statSync(join(repo, "src/app/(app)", d)).isDirectory())
      .filter((d) => existsSync(join(repo, "src/app/(app)", d, "page.tsx"))).length;
    const apiFiles = walk(join(repo, "src/app/api")).filter((p) => p.endsWith("/route.ts")).length;
    const models = (read("prisma/schema.prisma").match(/^model /gm) ?? []).length;

    // the census sanity: the walks must see the real tree (never a vacuous
    // pass — a broken walker reading 0 would "match" a zeroed doc claim)
    expect(appRoutes).toBeGreaterThanOrEqual(60);
    expect(apiFiles).toBeGreaterThanOrEqual(50);
    expect(models).toBeGreaterThanOrEqual(45);

    const claude = read("CLAUDE.md");
    const readme = read("README.md");
    const pad = read("Project_Architecture_Document.md");

    // CLAUDE: the identity line ("all N endpoints"), the architecture line
    // ("N route handlers"), the database line ("N Prisma models")
    expect(claude, `CLAUDE must claim all ${apiFiles} endpoints (live: ${apiFiles})`)
      .toContain(`all ${apiFiles} endpoints`);
    expect(claude, `CLAUDE must claim ${apiFiles} route handlers (live: ${apiFiles})`)
      .toContain(`${apiFiles} route handlers`);
    expect(claude, `CLAUDE must claim ${models} Prisma models (live: ${models})`)
      .toContain(`${models} Prisma models`);

    // README: the structure tree's api comment ("# N route handlers")
    expect(readme, `README's structure tree must carry ${apiFiles} route handlers`)
      .toContain(`# ${apiFiles} route handlers`);

    // PAD §3 (the live stack table): "N routes and N endpoints"
    expect(pad, `PAD's stack table must carry ${appRoutes} routes and ${apiFiles} endpoints`)
      .toContain(`${appRoutes} routes and ${apiFiles} endpoints`);

    // the stale-form bans: the fossil claims stay dead on every live face
    expect(claude).not.toContain("54 route handlers");
    expect(claude).not.toContain("47 Prisma models");
    expect(claude).not.toContain("49 endpoints");
    expect(readme).not.toContain("54 route handlers");
    expect(pad).not.toContain("One envelope for 49 endpoints");
  });

  // Session 119 (D-119b2 — the neo-crm s209 PUSH-RITUAL REMOTE CONTRACT
  // transferred): the operational push pair (the SSH wrapper + its runbook)
  // rode the SIBLING REPO's remote (task-management) from the initial
  // scaffold — every round pushed safely only because the operator's briefs
  // carry the explicit --remote (the AGENTS session-50 lesson documents the
  // trap; the stale default was never cured — the correct-and-lucky genus).
  // The pin reads the remote LIVE from both faces and asserts the canonical
  // eon-hr contract; either face drifting goes RED.
  it("carries the canonical eon-hr remote on the wrapper's live faces (the wrapper arm — D-119b2, the s209 transfer)", () => {
    const wrapper = read("docs/ssh_git_wrapper_v3.py");
    const canonical = "git@github.com:nordeim/eon-hr.git";

    // DEFAULT_REMOTE read LIVE from the code (a stale default is the genus)
    const dr = wrapper.match(/DEFAULT_REMOTE\s*=\s*"([^"]+)"/)?.[1];
    expect(dr, "the wrapper must declare DEFAULT_REMOTE").toBeDefined();
    expect(dr, `the wrapper's DEFAULT_REMOTE must be the canonical eon-hr remote (live: ${dr})`).toBe(canonical);

    // the docstring's canonical-remote claim + the Options default
    expect(wrapper, "the docstring must name the canonical remote").toContain(canonical);
    expect(wrapper, "the Options default must name the canonical remote").toContain(`(default ${canonical})`);

    // the stale-form ban: the sibling repo's remote never rides the wrapper
    expect(wrapper).not.toContain("nordeim/task-management.git");
  });

  it("carries the canonical eon-hr remote on the runbook's claim sites (the runbook arm — D-119b2)", () => {
    const runbook = read("docs/how-to-git-push-using-ssh-wrapper_SKILL.md");
    const canonical = "git@github.com:nordeim/eon-hr.git";

    // the purpose line, the expected-output block, the variants, the
    // troubleshooting push-rights + ls-remote lines — every remote claim
    const claims = runbook.match(/git\@github\.com:nordeim\/[a-z-]+\.git/g) ?? [];
    expect(claims.length, "the runbook must carry SSH remote claims").toBeGreaterThanOrEqual(4);
    for (const c of claims) {
      expect(c, `every runbook remote claim must be the canonical eon-hr remote (live: ${c})`).toBe(canonical);
    }

    // the cd line checks out THIS repo
    expect(runbook).toContain("cd eon-hr");

    // the stale-form bans: the sibling repo's remote and folder never ride the runbook
    expect(runbook).not.toContain("nordeim/task-management.git");
    expect(runbook).not.toContain("cd task-management");
  });

  it("resolves every bun-run command claim in the live docs (the command arm — D-118b)", () => {
    const scripts = pkg.scripts as Record<string, string>;
    const claimed = new Set<string>();
    for (const doc of [read("README.md"), read("CLAUDE.md")]) {
      for (const m of doc.matchAll(/bun run ([a-z0-9:]+)/g)) claimed.add(m[1]);
    }
    expect(claimed.size).toBeGreaterThanOrEqual(8); // the walk must see the real claims
    for (const cmd of claimed) {
      expect(scripts[cmd], `the docs' bun run ${cmd} must resolve in package.json scripts`).toBeDefined();
    }
  });
});

