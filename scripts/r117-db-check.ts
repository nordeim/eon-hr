// r117-db-check.ts — the DB-pristine verification through direct Prisma reads
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const users = await p.user.count();
const employees = await p.employee.count();
const candidates = await p.candidate.count();
const jobs = await p.jobPosting.count();
const balances = await p.leaveBalance.count();
const expenses = await p.expenseClaim.count();
console.log(JSON.stringify({ users, employees, candidates, jobs, balances, expenses }));
await p.$disconnect();
