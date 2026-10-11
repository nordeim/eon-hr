// DB state check — verifies the pristine seed state (users=1, employees=1, leaveBalances=2).
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const [users, employees, balances, payroll, expenses] = await Promise.all([
  db.user.count(),
  db.employee.count(),
  db.leaveBalance.count(),
  db.payrollRecord.count(),
  db.expenseClaim.count(),
]);
console.log(
  JSON.stringify({ users, employees, balances, payroll, expenses })
);
await db.$disconnect();
