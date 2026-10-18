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
  // Session 47 (R46): the signup-superset E2E path creates employee-less
  // USERS (e2e-zerodash-*@eon-hr.test) — sweep them too (no dependents:
  // the signup route creates the User row only).
  const goneUsers = await db.user.deleteMany({
    where: { email: { startsWith: "e2e-zerodash-", endsWith: "@eon-hr.test" } },
  });
  console.log(`[purge] removed ${goneUsers.count} signup-test user(s)`);
  // Session 49 (R48-F2): the avatar spec uploads a data-URL avatar onto
  // the demo user — reset it so every run starts from the seed's
  // avatarless state (the seed's upsert does NOT touch avatarUrl).
  const resetAvatars = await db.user.updateMany({
    where: { avatarUrl: { not: null } },
    data: { avatarUrl: null },
  });
  if (resetAvatars.count > 0) {
    console.log(`[purge] reset ${resetAvatars.count} user avatar(s)`);
  }
  // Session 57 (R57-A2): the import spec creates employees from
  // e2e-import-@eon-hr.test rows — the employee sweep above already
  // covers them (endsWith @eon-hr.test).
  // Session 57 (R57-E2): the deletion round-trip signs up
  // e2e-delete-*@eon-hr.test users — sweep any that failed mid-way (the
  // successful round-trip deletes itself).
  const goneDeleteUsers = await db.user.deleteMany({
    where: { email: { startsWith: "e2e-delete-", endsWith: "@eon-hr.test" } },
  });
  if (goneDeleteUsers.count > 0) {
    console.log(`[purge] removed ${goneDeleteUsers.count} delete-test user(s)`);
  }
  // Session 57 (R57-B): the wall media spec posts with attachments —
  // sweep the posts and orphaned db/uploads files.
  const gonePosts = await db.post.deleteMany({
    where: { OR: [{ content: { contains: "e2e-media-post" } }, { mediaUrl: { not: null } }] },
  });
  if (gonePosts.count > 0) {
    console.log(`[purge] removed ${gonePosts.count} media-test post(s)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void db.$disconnect();
  });
