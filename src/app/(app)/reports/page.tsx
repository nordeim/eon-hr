import { db } from "@/lib/db";
import { ReportsBrowser, type DepartmentOption } from "./reports-browser";

export default async function ReportsPage() {
  const departments = await db.department.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const options: DepartmentOption[] = departments.map((d) => ({ id: d.id, name: d.name }));

  return <ReportsBrowser departments={options} />;
}
