// db-pristine-check.mjs — the round's DB pristine verification: the
// seeded tenant counts (users=1, employees=1, leaveBalances=2) read via
// the repo's own Prisma client against the repo db (the trap unset).
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const users = await db.user.count();
const employees = await db.employee.count();
const balances = await db.leaveBalance.count();
console.log(JSON.stringify({ users, employees, leaveBalances: balances }));
await db.$disconnect();
