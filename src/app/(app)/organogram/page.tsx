import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Network, Users } from "lucide-react";
import { initials } from "@/lib/utils";

interface EmployeeRow {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  managerId: string | null;
  avatarUrl: string | null;
  department: string | null;
}

interface OrgNodeData {
  id: string;
  name: string;
  jobTitle: string | null;
  department: string | null;
  avatarUrl: string | null;
  directReports: number;
  children: OrgNodeData[];
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

function OrgNode({ node }: { node: OrgNodeData }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
        <Avatar className="h-10 w-10 shrink-0">
          {node.avatarUrl ? <AvatarImage src={node.avatarUrl} alt={node.name} /> : null}
          <AvatarFallback>{initials(node.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{node.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {[node.jobTitle, node.department].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
        {node.directReports > 0 ? (
          <span className="ml-auto shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {node.directReports} {node.directReports === 1 ? "report" : "reports"}
          </span>
        ) : null}
      </div>
      {node.children.length > 0 ? (
        <div className="ml-6 flex flex-col gap-4 border-l-2 border-border pl-6">
          {node.children.map((child) => (
            <OrgNode key={child.id} node={child} />
          ))}
        </div>
      ) : null}
    </div>
  );
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
    <div className="min-h-screen bg-[linear-gradient(to_right_bottom,#f0fdfa,#f0fdf4)] p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
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
              <div className="flex flex-col gap-10 p-8">
                {trees.map((tree) => (
                  <OrgNode key={tree.id} node={tree} />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
    </div>
  );
}
