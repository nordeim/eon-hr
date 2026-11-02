// r119-db-check.ts — the DB-pristine protocol (direct Prisma reads).
// Usage: env -u DATABASE_URL bun scripts/r119-db-check.ts
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const [users, employees, candidates, jobs, balances, expenses] = await Promise.all([
  db.user.count(), db.employee.count(), db.candidate.count(),
  db.jobPosting.count(), db.leaveBalance.count(), db.expenseClaim.count(),
]);
console.log(`users ${users} | employees ${employees} | candidates ${candidates} | jobs ${jobs} | balances ${balances} | expenses ${expenses}`);
console.log((users === 1 && employees === 1 && candidates === 0 && jobs === 3 && balances === 2 && expenses === 0) ? "DB PRISTINE" : "*** DB DIRTY ***");
await db.$disconnect();
