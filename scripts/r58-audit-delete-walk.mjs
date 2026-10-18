// r58-audit-delete-walk.mjs — verifies the profile DELETE relation-walk
// gaps found in the session-57 delta audit:
//   (1) Asset.assignedToId -> Employee (no cascade) blocks db.employee.delete
//   (2) Review.reviewerId  -> Employee (no cascade) blocks db.employee.delete
// Runs against a THROWAWAY copy of the seeded db (never the dev db).
import { PrismaClient } from "@prisma/client";
import { cp, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const tmp = await mkdtemp(path.join(tmpdir(), "r58-walk-"));
const dbFile = path.join(tmp, "walk.db");
await cp("db/custom.db", dbFile);

const db = new PrismaClient({
  datasources: { db: { url: `file:${dbFile}` } },
});

// a sacrificial user + employee mirroring the seeded admin's shape
const user = await db.user.create({
  data: {
    email: `walk-${Date.now()}@example.com`,
    passwordHash: "x",
    name: "Walk Probe",
    role: "employee",
    employee: {
      create: {
        employeeId: "EMP-9999",
        firstName: "Walk",
        lastName: "Probe",
        email: `walk-emp-${Date.now()}@example.com`,
        employmentStatus: "active",
        employmentType: "full_time",
        startDate: new Date(),
        baseSalary: 0,
      },
    },
  },
  include: { employee: true },
});
const empId = user.employee.id;

// (1) an asset assigned to the employee
await db.asset.create({
  data: { name: "Probe Laptop", assignedToId: empId, status: "assigned" },
});

// (2) a review cycle + review where OUR employee is the REVIEWER of someone else
const other = await db.employee.create({
  data: {
    employeeId: "EMP-9998",
    firstName: "Other",
    lastName: "Employee",
    email: `walk-other-${Date.now()}@example.com`,
    employmentStatus: "active",
    employmentType: "full_time",
    startDate: new Date(),
    baseSalary: 0,
  },
});
const cycle = await db.reviewCycle.create({
  data: { name: "Probe Cycle", status: "active" },
});
await db.review.create({
  data: { cycleId: cycle.id, employeeId: other.id, reviewerId: empId, status: "not_started" },
});

// run the walk EXACTLY as src/app/api/profile/route.ts DELETE does
const steps = [];
try {
  await db.shiftSwap.deleteMany({ where: { requesterId: empId } });
  await db.approvalConfig.deleteMany({ where: { approverId: empId } });
  await db.leaveBalance.deleteMany({ where: { employeeId: empId } });
  await db.attendanceRecord.deleteMany({ where: { employeeId: empId } });
  await db.shiftAssignment.deleteMany({ where: { employeeId: empId } });
  await db.document.deleteMany({ where: { employeeId: empId } });
  await db.payrollRecord.deleteMany({ where: { employeeId: empId } });
  await db.loan.deleteMany({ where: { employeeId: empId } });
  await db.onboardingProcess.deleteMany({ where: { employeeId: empId } });
  await db.offboardingProcess.deleteMany({ where: { employeeId: empId } });
  await db.complianceAlert.deleteMany({ where: { employeeId: empId } });
  await db.hRLetter.deleteMany({ where: { employeeId: empId } });
  await db.leaveRequest.deleteMany({ where: { employeeId: empId } });
  await db.expenseClaim.deleteMany({ where: { employeeId: empId } });
  await db.goal.deleteMany({ where: { employeeId: empId } });
  await db.employee.updateMany({ where: { managerId: empId }, data: { managerId: null } });
  steps.push("pre-employee deletes ok");
  await db.employee.delete({ where: { id: empId } });
  steps.push("EMPLOYEE DELETE ok (no FK blocker hit)");
} catch (e) {
  steps.push(`EMPLOYEE DELETE FAILED: ${e.code ?? ""} ${String(e.message).split("\n")[0]}`);
}

console.log(steps.join("\n"));
await db.$disconnect();
process.exit(0);
