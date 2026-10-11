// Verifies the seeded pristine state (worklog convention: users=1, employees=1,
// leaveBalances=2, payroll=0, expenses=0). Run with DATABASE_URL unset in the
// shell so .env wins (the documented sandbox trap).
import { db } from '../src/lib/db'
const users = await db.user.count();
const employees = await db.employee.count();
const balances = await db.leaveBalance.count();
const payroll = await db.payrollRecord.count();
const expenses = await db.expenseClaim.count();
console.log(JSON.stringify({ users, employees, balances, payroll, expenses }));
await db.$disconnect();
