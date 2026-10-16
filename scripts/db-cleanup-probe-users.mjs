// db-cleanup-probe-users.mjs — removes the round's live-probe artifacts
// from the repo db (the loading-state probes fired real signups with
// throwaway addresses). Restores the pristine seeded tenant: users=1.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const probeDomains = ["example.com"];
const seeded = new Set(["sepnetflix2023@outlook.com"]);
const all = await db.user.findMany({ select: { id: true, email: true } });
let removed = 0;
for (const u of all) {
  const domain = (u.email || "").split("@")[1] || "";
  if (!seeded.has(u.email) && probeDomains.includes(domain)) {
    await db.user.delete({ where: { id: u.id } });
    removed++;
    console.log(`removed probe user: ${u.email}`);
  }
}
const users = await db.user.count();
const employees = await db.employee.count();
const balances = await db.leaveBalance.count();
console.log(JSON.stringify({ removed, users, employees, leaveBalances: balances }));
await db.$disconnect();
