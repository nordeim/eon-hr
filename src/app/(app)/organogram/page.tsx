import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        section="Organization Structure"
        sectionIcon={<Users aria-hidden="true" />}
        title="Organogram"
        subtitle="Visual representation of your organization structure"
      />

      <Card>
        <CardHeader>
          <CardTitle>Reporting Structure</CardTitle>
          <CardDescription>Managers and their direct reports</CardDescription>
        </CardHeader>
        <CardContent>
          {!hasStructure || trees.length === 0 ? (
            <EmptyState
              icon={<Network className="h-6 w-6" aria-hidden="true" />}
              title="No reporting structure defined."
              description="Assign managers to employees to build the org chart."
            />
          ) : (
            <div className="flex flex-col gap-10">
              {trees.map((tree) => (
                <OrgNode key={tree.id} node={tree} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
