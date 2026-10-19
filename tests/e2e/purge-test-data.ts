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
  /* Session 61: the purge used to delete the @eon-hr.test employees
     FIRST — but the R58-22 fixture rows (assigned assets, reviewer
     duties, survey responses) reference them, so a mid-run failure
     that leaked fixtures made EVERY subsequent purge P2003 at this
     line and die silently (global-setup swallows the error), leaving
     the stale rows to poison findFirst-based assertions. The fixture
     sweeps now run BEFORE the employee sweep (the same FK-walk
     discipline the r60 sweep-loading-probe gained). */
  await db.asset.deleteMany({ where: { name: "E2E Fill Laptop" } });
  await db.review.deleteMany({ where: { reviewer: { email: { endsWith: "@eon-hr.test" } } } });
  await db.surveyResponse.deleteMany({ where: { employee: { email: { endsWith: "@eon-hr.test" } } } });
  await db.reviewCycle.deleteMany({ where: { name: "E2E Fill Cycle" } });
  await db.survey.deleteMany({ where: { title: "E2E Fill Survey" } });
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
  // Session 61: walk the non-cascade USER dependents before the user
  // sweeps (the r60 lesson: a signup-created NotificationPreference row
  // P2003s the bare deleteMany and kills the rest of the purge).
  const testUsers = { email: { endsWith: "@eon-hr.test" } };
  await db.notificationPreference.deleteMany({ where: { user: testUsers } });
  await db.message.deleteMany({ where: { sender: testUsers } });
  await db.aIChat.deleteMany({ where: { user: testUsers } });
  await db.post.deleteMany({ where: { user: testUsers } });
  await db.announcement.deleteMany({ where: { author: testUsers } });
  await db.notification.deleteMany({ where: { user: testUsers } });
  await db.auditLog.deleteMany({ where: { user: testUsers } });
  await db.goal.deleteMany({ where: { createdBy: testUsers } });
  await db.leaveRequest.deleteMany({ where: { approver: testUsers } });
  await db.staffRequest.deleteMany({ where: { user: testUsers } });
  await db.expenseClaim.deleteMany({ where: { user: testUsers } });
  // Session 57 (R57-E2): the deletion round-trip signs up
  // e2e-delete-*@eon-hr.test users — sweep any that failed mid-way (the
  // successful round-trip deletes itself).
  const goneDeleteUsers = await db.user.deleteMany({
    where: { email: { startsWith: "e2e-delete-", endsWith: "@eon-hr.test" } },
  });
  if (goneDeleteUsers.count > 0) {
    console.log(`[purge] removed ${goneDeleteUsers.count} delete-test user(s)`);
  }
  // Session 58 (R58-22): the with-data deletion round-trip signs up
  // e2e-fill-delete-* users and plants the E2E Fill Laptop / Cycle /
  // Survey rows — sweep the users and the orphaned fixture rows.
  const goneFillDeleteUsers = await db.user.deleteMany({
    where: { email: { startsWith: "e2e-fill-delete-", endsWith: "@eon-hr.test" } },
  });
  if (goneFillDeleteUsers.count > 0) {
    console.log(`[purge] removed ${goneFillDeleteUsers.count} fill-delete-test user(s)`);
  }
  // (the E2E Fill fixture sweeps moved to the TOP of main — see the
  // session-61 note; they must precede the employee sweep)
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
