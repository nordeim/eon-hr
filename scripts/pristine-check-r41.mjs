// pristine-check-r41.mjs — the dev-db pristine state (the worklog
// convention). Run with DATABASE_URL unset so .env wins.
import { PrismaClient } from "../node_modules/.prisma/client/index.js";
import { config } from "../node_modules/dotenv/lib/main.js";
config();
const db = new PrismaClient();
const users = await db.user.count();
const employees = await db.employee.count();
const balances = await db.leaveBalance.count();
const payroll = await db.payrollRecord.count();
const expenses = await db.expenseClaim.count();
console.log(JSON.stringify({ users, employees, balances, payroll, expenses }));
await db.$disconnect();
