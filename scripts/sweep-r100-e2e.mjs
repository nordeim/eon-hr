// Sweep any leaked "r100 perglyph cv" rows from the persistent e2e.db (the
// mutation-run leak the pre-clean now prevents).
import { PrismaClient } from "@prisma/client";
process.env.DATABASE_URL = "file:../db/e2e.db";
const db = new PrismaClient();
const leaked = await db.candidate.findMany({ where: { name: "r100 perglyph cv" }, select: { id: true } });
for (const c of leaked) await db.candidate.delete({ where: { id: c.id } });
const total = await db.candidate.count();
console.log(JSON.stringify({ swept: leaked.length, remaining: total }));
await db.$disconnect();
