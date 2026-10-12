import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const u = await p.user.count(), e = await p.employee.count(), lb = await p.leaveBalance.count(),
  pr = await p.payrollRecord.count(), ec = await p.expenseClaim.count(), t = await p.task.count(),
  c = await p.candidate.count(), j = await p.jobPosting.count();
console.log(JSON.stringify({users:u, employees:e, leaveBalances:lb, payroll:pr, expenseClaims:ec, tasks:t, candidates:c, jobs:j}));
await p.$disconnect();
