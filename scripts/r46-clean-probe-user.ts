// scripts/r46-clean-probe-user.ts — session-47 hygiene: the verify-r45
// loading probe re-created the throwaway signup user (the documented
// session-46 gotcha). Clean it, verify the pristine tenant.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // the signup superset creates the user + an Employee row (name derived
  // from the local part); the audit-logging superset may add an AuditLog —
  // sweep every dependent relation first, then remove the user.
  const email = "loading-probe@example.com";
  const sweep = [
    ["employee", () => prisma.employee.deleteMany({ where: { user: { email } } })],
    ["leaveRequests", () => prisma.leaveRequest.deleteMany({ where: { approver: { email } } })],
    ["staffRequests", () => prisma.staffRequest.deleteMany({ where: { user: { email } } })],
    ["expenseClaims", () => prisma.expenseClaim.deleteMany({ where: { user: { email } } })],
    ["posts", () => prisma.post.deleteMany({ where: { user: { email } } })],
    ["announcements", () => prisma.announcement.deleteMany({ where: { author: { email } } })],
    ["notifications", () => prisma.notification.deleteMany({ where: { user: { email } } })],
    ["sentMessages", () => prisma.message.deleteMany({ where: { sender: { email } } })],
    ["aiChats", () => prisma.aIChat.deleteMany({ where: { user: { email } } })],
    ["notificationPref", () => prisma.notificationPreference.deleteMany({ where: { user: { email } } })],
    ["auditLogs", () => prisma.auditLog.deleteMany({ where: { user: { email } } })],
    ["goalTargets", () => prisma.goal.deleteMany({ where: { createdBy: { email } } })],
  ] as const;
  const removed: Record<string, number> = {};
  for (const [k, fn] of sweep) removed[k] = (await fn()).count;
  const gone = await prisma.user.deleteMany({ where: { email } });
  console.log("sweep:", JSON.stringify(removed), "users deleted:", gone.count);
  const users = await prisma.user.count();
  const employees = await prisma.employee.count();
  const balances = await prisma.leaveBalance.count();
  console.log(JSON.stringify({ users, employees, balances }));
}
main().finally(() => prisma.$disconnect());
