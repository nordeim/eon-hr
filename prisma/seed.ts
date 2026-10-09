/* Eon HR — idempotent seed.
 *
 * Replicates the reference deployment's data for the demo account:
 * company "Demo" (retail, Singapore), the demo user with Annual 21/21 and
 * Sick 30/30 leave balances, and empty collections elsewhere. Natural-key
 * upserts keep it safe to re-run.
 *
 * Run: bun run db:seed  (after bun run db:push)
 */
import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

const prisma = new PrismaClient();

function scryptHash(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

const DEMO_EMAIL = "sepnetflix2023@outlook.com";
const DEMO_PASSWORD = "$Abcd1234";
const YEAR = new Date().getFullYear();

async function main() {
  const company = await prisma.company.upsert({
    where: { id: "company" },
    update: {
      name: "Demo",
      industry: "retail",
      phone: "+65 87651230",
      email: DEMO_EMAIL,
      address: "Singapore, Singapore",
    },
    create: {
      id: "company",
      name: "Demo",
      industry: "retail",
      phone: "+65 87651230",
      email: DEMO_EMAIL,
      address: "Singapore, Singapore",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      email: DEMO_EMAIL,
      passwordHash: scryptHash(DEMO_PASSWORD),
      name: "sepnetflix2023",
      role: "admin",
    },
  });

  const employee = await prisma.employee.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      employeeId: "EMP-0001",
      userId: user.id,
      firstName: "sepnetflix2023",
      lastName: "",
      email: DEMO_EMAIL,
      employmentStatus: "active",
      employmentType: "full_time",
      startDate: new Date("2024-01-15"),
    },
  });

  const annual = await prisma.leaveType.upsert({
    where: { name: "Annual Leave" },
    update: { quotaDays: 21, color: "#2563eb" },
    create: { name: "Annual Leave", quotaDays: 21, color: "#2563eb" },
  });
  const sick = await prisma.leaveType.upsert({
    where: { name: "Sick Leave" },
    update: { quotaDays: 30, color: "#10b981" },
    create: { name: "Sick Leave", quotaDays: 30, color: "#10b981" },
  });
  const unpaid = await prisma.leaveType.upsert({
    where: { name: "Unpaid Leave" },
    update: { quotaDays: 0, color: "#6b7280" },
    create: { name: "Unpaid Leave", quotaDays: 0, color: "#6b7280" },
  });
  const maternity = await prisma.leaveType.upsert({
    where: { name: "Maternity Leave" },
    update: { quotaDays: 70, color: "#8b5cf6" },
    create: { name: "Maternity Leave", quotaDays: 70, color: "#8b5cf6" },
  });

  // Leave balances for the demo employee — matches the dashboard cards.
  await prisma.leaveBalance.upsert({
    where: { employeeId_leaveTypeId_year: { employeeId: employee.id, leaveTypeId: annual.id, year: YEAR } },
    update: { entitled: 21, used: 0 },
    create: { employeeId: employee.id, leaveTypeId: annual.id, year: YEAR, entitled: 21, used: 0 },
  });
  await prisma.leaveBalance.upsert({
    where: { employeeId_leaveTypeId_year: { employeeId: employee.id, leaveTypeId: sick.id, year: YEAR } },
    update: { entitled: 30, used: 0 },
    create: { employeeId: employee.id, leaveTypeId: sick.id, year: YEAR, entitled: 30, used: 0 },
  });

  await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  await prisma.securitySettings.upsert({
    where: { id: "security" },
    update: { twoFactorAuth: false, auditLogging: true, dataEncryption: true, automatedBackups: true, gdprCompliance: true },
    create: { id: "security", twoFactorAuth: false, auditLogging: true, dataEncryption: true, automatedBackups: true, gdprCompliance: true },
  });

  console.log(`Seed complete for ${user.email} (company: ${company.name}).`);
  console.log(`Leave balances: Annual 21/21, Sick 30/30 (${YEAR}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
