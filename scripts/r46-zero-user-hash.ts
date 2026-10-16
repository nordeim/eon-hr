// scripts/r46-zero-user-hash.ts — fix the zero-tenant demo user's password
// hash (the bun -e argv form didn't pass the hash; this is the robust form).
// Run with DATABASE_URL="file:../db/zero.db" (the env-var route the
// r46-zero-tenant check already proved resolves to <repo>/db/zero.db).
import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString("hex")}`;
}

async function main() {
  const u = await prisma.user.update({
    where: { email: "sepnetflix2023@outlook.com" },
    data: { passwordHash: hashPassword("$Abcd1234") },
  });
  console.log("fixed:", u.email, "hash head:", u.passwordHash.slice(0, 14));
}
main().finally(() => prisma.$disconnect());
