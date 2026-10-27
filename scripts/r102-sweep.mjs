// sweep the live-verify candidate (DB pristine at close)
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const cands = await p.candidate.findMany({ where: { name: { contains: "r102" } } });
console.log("r102 candidates:", cands.map(c => ({ id: c.id, name: c.name, score: c.aiScore, skills: c.skillsMatch })));
for (const c of cands) await p.candidate.delete({ where: { id: c.id } });
console.log("after sweep:", await p.candidate.count(), "candidates |", await p.user.count(), "users");
await p.$disconnect();
