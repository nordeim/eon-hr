/**
 * E2E data purge — removes spec leftovers (any employee whose email ends
 * with @eon-hr.test) from the isolated e2e database. Called by the Playwright
 * global-setup before re-seeding so CRUD round-trips never collide with
 * unique keys from previous runs.
 *
 * Run with: DATABASE_URL="file:../db/e2e.db" bun tests/e2e/purge-test-data.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main(): Promise<void> {
  const removed = await db.employee.deleteMany({
    where: { email: { endsWith: "@eon-hr.test" } },
  });
  console.log(`[purge] removed ${removed.count} test employee(s)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void db.$disconnect();
  });
