// DB census helper — counts the seeded rows (users/jobs/candidates) with the
// schema-anchored relative URL, immune to the sandbox's exported DATABASE_URL.
// Usage: bun scripts/db-count.mjs [file:../db/custom.db]
import { PrismaClient } from "@prisma/client";

process.env.DATABASE_URL = process.argv[2] ?? "file:../db/custom.db";
const db = new PrismaClient();
const counts = {};
for (const model of ["user", "job", "candidate", "employee", "leaveRequest"]) {
  try {
    counts[model] = await db[model].count();
  } catch {
    counts[model] = "n/a";
  }
}
console.log(JSON.stringify(counts));
await db.$disconnect();
