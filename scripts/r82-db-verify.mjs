import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const [users, employees, balances, jobs] = await Promise.all([
  p.user.findMany({ select: { email: true } }),
  p.employee.count(),
  p.leaveBalance.count(),
  p.jobPosting.count(),
]);
console.log(JSON.stringify({ users: users.map(u=>u.email), employees, balances, jobs }));
await p.$disconnect();
