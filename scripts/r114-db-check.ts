import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const users = await db.user.count();
const cands = await db.candidate.count();
const jobs = await db.jobPosting.count();
console.log(`users=${users} candidates=${cands} jobPostings=${jobs}`);
await db.$disconnect();
