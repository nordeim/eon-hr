// db-check.mjs — quick e2e/custom DB inspector (no sqlite3 CLI in the sandbox).
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";

const url = process.argv[2] === "e2e" ? "file:../db/e2e.db" : "file:../db/custom.db";
process.env.DATABASE_URL = url;
const { PrismaClient: P } = await import("@prisma/client").then((m) => ({ PrismaClient: m.PrismaClient }));
const prisma = new P();
const jobs = await prisma.jobPosting.findMany({ select: { id: true, title: true, status: true, postedAt: true } });
console.log(url, "->", jobs.length, "jobs");
for (const j of jobs) console.log(" ", j.id, "|", j.title, "|", j.status, "|", j.postedAt.toISOString().slice(0, 10));
const wf = await prisma.workflow.findMany({ select: { name: true } });
console.log("workflows:", wf.map((w) => w.name).join(", ") || "(none)");
const chats = await prisma.aIChat.findMany({ select: { title: true } });
console.log("chats:", chats.length);
await prisma.$disconnect();
