// cleanup-r93.ts — post-round sweep: the E2E probe chat (the ai-chat API has
// no DELETE route; the global purge owns it at the next run's start too).
import { PrismaClient } from "@prisma/client";
process.env.DATABASE_URL = "file:../db/e2e.db";
const db = new PrismaClient();
await db.aIMessage.deleteMany({});
const gone = await db.aIChat.deleteMany({});
console.log(`swept ${gone.count} leftover chat(s)`);
await db.$disconnect();
