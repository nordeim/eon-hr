// cleanup-smoke.mjs — remove any leftover Smoke Test LMS rows from the
// failed with-data runs. Usage: env -u DATABASE_URL bun scripts/cleanup-smoke.mjs
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const del = await db.trainingPlatform.deleteMany({ where: { name: "Smoke Test LMS" } });
console.log("deleted:", del.count);
console.log("remaining:", await db.trainingPlatform.count());
await db.$disconnect();
