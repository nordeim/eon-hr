// pristine-check.mjs — count the seed baseline (users/employees/leave
// balances) in db/custom.db. Called by capture-all.sh after the capture
// pass to prove the wizard shots left no data behind (they are filled but
// never submitted). Run with DATABASE_URL pointed at the repo db.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const [users, employees, leave] = await Promise.all([
  db.user.count(),
  db.employee.count(),
  db.leaveBalance.count(),
]);
console.log(`pristine check: users=${users} employees=${employees} leaveBalances=${leave}`);
await db.$disconnect();
