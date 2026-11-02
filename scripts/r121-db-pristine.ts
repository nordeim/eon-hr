// r121-db-pristine.ts — the DB pristine check (the standing census form)
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const [users, employees, candidates, jobs, balances, expenses] = await Promise.all([
  db.user.count(), db.employee.count(), db.candidate.count(), db.jobPosting.count(), db.leaveBalance.count(), db.expenseClaim.count(),
]);
console.log(`DB: users ${users} / employees ${employees} / candidates ${candidates} / jobs ${jobs} / balances ${balances} / expenses ${expenses}`);
console.log(users === 1 && employees === 1 && candidates === 0 && jobs === 3 && balances === 2 && expenses === 0 ? "DB PRISTINE" : "*** NOT PRISTINE ***");
await db.$disconnect();
