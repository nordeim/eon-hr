// scripts/r46-zero-tenant.ts — session-47: build the zero-tenant scratch
// db (db/zero.db): the schema + ONLY the demo user (no employee, no leave
// balances) — mirroring REF's actual tenant state (0 employees) so the
// zero-state page interiors compare like-for-like. The :3201 server runs
// against this file; the repo db (custom.db) stays pristine.
import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

const prisma = new PrismaClient();

function scryptHash(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

async function main() {
  const users = await prisma.user.count();
  const employees = await prisma.employee.count();
  if (users !== 1 || employees !== 0) {
    throw new Error(`expected the fresh zero db to hold 1 user + 0 employees, found users=${users} employees=${employees}`);
  }
  console.log(JSON.stringify({ users, employees, balances: await prisma.leaveBalance.count() }));
}
main().finally(() => prisma.$disconnect());
