// r124-sweep-probe.ts — the UI-verify probe sweep (the DB-pristine
// protocol's cleanup arm: the resume2 candidate created by the live
// upload verify is removed by its REAL id).
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const cands = await db.candidate.findMany({ select: { id: true, name: true } });
for (const c of cands) {
  await db.candidate.delete({ where: { id: c.id } });
  console.log("swept", c.id, c.name);
}
if (!cands.length) console.log("already pristine");
await db.$disconnect();
