// r28-pristine-check.mjs — session-29: DB pristine counts after the round's
// probes (inside the repo — /tmp breaks node module resolution, the
// session-26 lesson).
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const [users, employees, leave, tasks, candidates, jobs, payroll] = await Promise.all([
  db.user.count(), db.employee.count(), db.leaveBalance.count(),
  db.task.count(), db.candidate.count(), db.jobPosting.count(), db.payrollRecord.count(),
]);
console.log(`pristine: users=${users} employees=${employees} leaveBalances=${leave} tasks=${tasks} candidates=${candidates} jobs=${jobs} payroll=${payroll}`);
await db.$disconnect();
