import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const users = await prisma.user.findMany({ select: { email: true, name: true } });
console.log(JSON.stringify(users));
await prisma.$disconnect();
