import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Network, Users } from "lucide-react";
import { OrganogramTree, type OrgNodeData } from "./organogram-tree";

interface EmployeeRow {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  managerId: string | null;
  avatarUrl: string | null;
  department: string | null;
}

function buildNode(
  employee: EmployeeRow,
  childrenOf: Map<string, EmployeeRow[]>,
  visited: Set<string>
): OrgNodeData {
  visited.add(employee.id);
  const childRows = childrenOf.get(employee.id) ?? [];
  const children: OrgNodeData[] = [];
  for (const child of childRows) {
    if (visited.has(child.id)) continue; // cycle guard
    children.push(buildNode(child, childrenOf, visited));
  }
  return {
    id: employee.id,
    name: `${employee.firstName} ${employee.lastName}`.trim(),
    jobTitle: employee.jobTitle,
    department: employee.department,
    avatarUrl: employee.avatarUrl,
    directReports: children.length,
    children,
  };
}

export default async function OrganogramPage() {
  const employees = await db.employee.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      jobTitle: true,
      managerId: true,
      avatarUrl: true,
      department: { select: { name: true } },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  const rows: EmployeeRow[] = employees.map((e) => ({
    id: e.id,
    firstName: e.firstName,
    lastName: e.lastName,
    jobTitle: e.jobTitle,
    managerId: e.managerId,
    avatarUrl: e.avatarUrl,
    department: e.department?.name ?? null,
  }));

  const byId = new Map(rows.map((r) => [r.id, r]));
  const hasStructure = rows.some((r) => r.managerId && byId.has(r.managerId));

  // Direct reports per manager; employees with missing/absent managers are roots.
  const childrenOf = new Map<string, EmployeeRow[]>();
  const rootRows: EmployeeRow[] = [];
  for (const row of rows) {
    if (row.managerId && byId.has(row.managerId)) {
      const list = childrenOf.get(row.managerId) ?? [];
      list.push(row);
      childrenOf.set(row.managerId, list);
    } else {
      rootRows.push(row);
    }
  }

  const visited = new Set<string>();
  const trees: OrgNodeData[] = rootRows.map((root) => buildNode(root, childrenOf, visited));
  // Nodes unreachable from roots (manager cycles) are surfaced as extra roots.
  for (const row of rows) {
    if (!visited.has(row.id)) trees.push(buildNode(row, childrenOf, visited));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-green-50 p-4 md:p-8">
      <div className="max-w-full mx-auto space-y-8">
      <PageHeader
        section="Organization Structure"
        layout="flat36"
        centered
        iconClassName="text-teal-600"
        sectionIcon={<Users aria-hidden="true" />}
        title="Organogram"
        subtitle="Visual representation of your organization structure"
      />

      {/* Session 16 (R15-D): the reference renders a BARE centered card
          (no CardHeader — no "Reporting Structure" title or description)
          inside `overflow-x-auto pb-8` > `min-w-max flex justify-center
          p-8`; wide org trees scroll horizontally while the empty card
          centers. The empty state is the SIMPLE recipe: a 64px slate-300
          icon + ONE 16px slate-500 line (measured 783x202@228, icon
          y=277, line y=357) — not the full EmptyState component. */}
      <div className="overflow-x-auto pb-8">
        <div className="min-w-max flex justify-center p-8">
          <Card className="border-slate-200">
            {!hasStructure || trees.length === 0 ? (
              <div className="p-12 text-center">
                <Network className="mx-auto mb-4 h-16 w-16 text-slate-300" aria-hidden="true" />
                <p className="text-base text-slate-500">
                  No reporting structure defined. Assign managers to employees to build the org chart.
                </p>
              </div>
            ) : (
              <OrganogramTree trees={trees} />
            )}
          </Card>
        </div>
      </div>
    </div>
    </div>
  );
}
