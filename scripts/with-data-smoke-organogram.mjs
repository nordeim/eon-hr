// with-data-smoke-organogram.mjs — inject a manager + 2 reports, verify the
// organogram with-data tree renders inside the new bare-card wrapper via the
// authenticated agent-browser session, then remove them (DB restored).
// Usage: node scripts/with-data-smoke-organogram.mjs
import { PrismaClient } from "@prisma/client";
import { execSync } from "node:child_process";

const db = new PrismaClient();

const manager = await db.employee.findFirst({ orderBy: { createdAt: "asc" } });
const a = await db.employee.create({
  data: { firstName: "Smoke", lastName: "Report A", email: "smoke-a@eon-hr.test", employeeId: "EMP-9001", managerId: manager.id },
});
const b = await db.employee.create({
  data: { firstName: "Smoke", lastName: "Report B", email: "smoke-b@eon-hr.test", employeeId: "EMP-9002", managerId: manager.id },
});
console.log("injected:", a.employeeId, b.employeeId, "under", manager.employeeId);

try {
  execSync(`agent-browser --session loc set viewport 1440 900`, { stdio: "pipe", timeout: 30000 });
  execSync(`agent-browser --session loc open "http://127.0.0.1:3200/organogram"`, { stdio: "pipe", timeout: 45000 });
  await new Promise(r => setTimeout(r, 2500));
  const out = execSync(
    `agent-browser --session loc eval ${JSON.stringify(
      "JSON.stringify((() => { const card = document.querySelector('main [class*=rounded-xl]'); const cr = card ? card.getBoundingClientRect() : null; const nodes = [...document.querySelectorAll('main p')].filter(p => /Smoke Report/.test(p.textContent || '')); return { treeRendered: nodes.length, nodeNames: nodes.map(n => n.textContent.trim()), card: cr ? { w: Math.round(cr.width), h: Math.round(cr.height) } : null, emptyLine: [...document.querySelectorAll('main p')].some(p => /No reporting structure/.test(p.textContent || '')) }; })())"
    )}`,
    { stdio: "pipe", timeout: 30000 }
  );
  console.log("browser:", out.toString().trim().replace(/^"|"$/g, "").replace(/\\"/g, '"'));
} catch (e) {
  console.log("browser ERR:", String(e).slice(0, 120));
}

await db.employee.deleteMany({ where: { email: { in: ["smoke-a@eon-hr.test", "smoke-b@eon-hr.test"] } } });
console.log("cleanup done, employees:", await db.employee.count());
await db.$disconnect();
