/** Remove @eon-hr.test employees from the dev database (screenshot walkthrough cleanup). */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main(): Promise<void> {
  const removed = await db.employee.deleteMany({
    where: { email: { endsWith: "@eon-hr.test" } },
  });
  console.log(`[cleanup] removed ${removed.count} test employee(s)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void db.$disconnect();
  });
