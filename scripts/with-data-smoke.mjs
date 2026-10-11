// with-data-smoke.mjs — inject one TrainingPlatform, verify the API list
// surface, then remove it (DB restored). Mirrors pristine-check.mjs.
// Usage: env -u DATABASE_URL bun scripts/with-data-smoke.mjs
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const platform = await db.trainingPlatform.create({
  data: { name: "Smoke Test LMS", category: "technical", description: "temporary smoke row", url: "https://example.com", coursesCount: 5, logoColor: "#3b82f6", active: true },
});
console.log("injected:", platform.id);

const res = await fetch("http://127.0.0.1:3200/api/training");
const json = await res.json();
const mine = (json.data ?? []).find((p) => p.name === "Smoke Test LMS");
console.log("api list ok:", json.ok === true, "| row visible:", !!mine);

await db.trainingPlatform.delete({ where: { id: platform.id } });
const after = await db.trainingPlatform.count();
console.log("cleanup done, remaining platforms:", after);
await db.$disconnect();
