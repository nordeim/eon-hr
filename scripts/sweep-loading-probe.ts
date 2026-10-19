// sweep-loading-probe.ts — the known per-window trap: verify-r45's
// signup-loading probes leave a partial user (ln@example.com) behind in
// the seeded db/custom.db. Run once at round end, before the pristine
// check. Idempotent: deletes only non-demo users (walking the non-cascade
// FKs first — session 60: the loading-probe user carried a
// NotificationPreference row; the bare delete P2003s).
import { PrismaClient } from "@prisma/client";

async function main() {
  const db = new PrismaClient();
  const demo = "sepnetflix2023@outlook.com";
  const strays = await db.user.findMany({ where: { email: { not: demo } } });
  for (const s of strays) {
    await db.notificationPreference.deleteMany({ where: { userId: s.id } });
    await db.auditLog.deleteMany({ where: { userId: s.id } });
    await db.aIChat.deleteMany({ where: { userId: s.id } });
    await db.user.delete({ where: { id: s.id } });
    console.log("swept:", s.email);
  }
  if (!strays.length) console.log("nothing to sweep");
  console.log(
    JSON.stringify({
      users: await db.user.count(),
      employees: await db.employee.count(),
      leaveBalances: await db.leaveBalance.count(),
    })
  );
  await db.$disconnect();
}

main();
