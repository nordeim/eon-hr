"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Upload, Search, Grid3x3, List, Pencil, Trash2, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useToast } from "@/components/ui/toast";
import { formatDate, initials } from "@/lib/utils";
import { EmployeeWizard, type WizardEmployee } from "./employee-wizard";

interface EmployeeRow extends WizardEmployee {
  id: string;
  employeeId: string;
  employmentStatus: string;
}

const STATUS_OPTIONS = ["all", "active", "on_leave", "suspended", "terminated"];

function labelize(v: string): string {
  return v === "all" ? "All" : v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function EmployeesPage() {
  const toast = useToast();
  const params = useSearchParams();
  const [employees, setEmployees] = React.useState<EmployeeRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [view, setView] = React.useState<"list" | "grid">("list");

  const [mode, setMode] = React.useState<"list" | "wizard">("list");
  const [editing, setEditing] = React.useState<EmployeeRow | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (search) qs.set("search", search);
      if (status !== "all") qs.set("status", status);
      const res = await fetch(`/api/employees?${qs}`);
      const json = await res.json();
      if (json.ok) setEmployees(json.data.employees);
    } catch {
      toast.toast({ title: "Failed to load employees", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [search, status, toast]);

  React.useEffect(() => {
    const t = window.setTimeout(load, search ? 300 : 0);
    return () => window.clearTimeout(t);
  }, [load, search]);

  React.useEffect(() => {
    if (params.get("new") === "1") setMode("wizard");
  }, [params]);

  const counts = React.useMemo(() => {
    return {
      total: employees.length,
    };
  }, [employees]);

  async function onSave(data: Record<string, unknown>): Promise<boolean> {
    try {
      const res = await fetch(editing ? `/api/employees?id=${editing.id}` : "/api/employees", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Save failed", description: json.error?.message, variant: "error" });
        return false;
      }
      toast.toast({
        title: editing ? "Employee updated" : "Employee created",
        description: editing
          ? "Changes saved."
          : `${data.firstName} ${data.lastName} was added to the directory.`,
        variant: "success",
      });
      setMode("list");
      setEditing(null);
      await load();
      return true;
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
      return false;
    }
  }

  async function onDelete(emp: EmployeeRow) {
    if (!window.confirm(`Delete ${emp.firstName} ${emp.lastName}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/employees?id=${emp.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Delete failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Employee deleted", variant: "success" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col">
      {mode === "wizard" ? (
        /* Session 7 (R6-C): the reference renders the Add/Edit wizard as a
           page-replacing INLINE view — back button + h1 + max-w-4xl card —
           not a modal. The list (header + filters + table) unmounts. */
        <EmployeeWizard
          key={editing?.id ?? "new"}
          employee={editing}
          excludeManagerId={editing?.id ?? null}
          onClose={() => {
            setMode("list");
            setEditing(null);
          }}
          onSave={onSave}
        />
      ) : (
        <>
          <PageHeader
        size="lg"
        mobileKicker
        mobileHeader="hidden"
        className="mb-8"
        title="Employees"
        subtitle={`Manage your ${counts.total} employees`}
        actions={
          <>
            <Button
              variant="outline"
              className="text-blue-700"
              onClick={() =>
                toast.toast({
                  title: "CSV import",
                  description: "Drop a CSV with columns: firstName, lastName, email, jobTitle, employmentStatus",
                  variant: "info",
                })
              }
            >
              <Upload aria-hidden="true" />
              Import CSV
            </Button>
            <Button
              className="shadow-lg"
              onClick={() => {
                setEditing(null);
                setMode("wizard");
              }}
            >
              <Plus className="mr-2" aria-hidden="true" />
              Add Employee
            </Button>
          </>
        }
      />

      {/* Filter bar — session 9 (R8-E): reference structure. The card is
          bg-white with border-slate-200 + mb-6 (24px gap to content, the
          header keeps 32 via mb-8); the interior stacks [search + native
          status select] over the centered toggles below md and lays them
          out in one justify-between row from md. The status filter is a
          NATIVE <select> on the reference (125×36, OS-gray bg, rounded-lg
          slate-300 border) — a Radix trigger cannot reproduce that
          geometry. Toggles are h-8 px-3 with List/Grid3x3 (42/40×32). */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm mb-6">
        <div className="flex flex-col gap-4 items-center justify-between md:flex-row">
          <div className="flex w-full gap-2 md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent pl-10 md:w-64"
                aria-label="Search employees"
              />
            </div>
            <select
              className="h-9 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Filter by status"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All Status" : labelize(s)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <Button variant={view === "list" ? "default" : "outline"} className="h-8 px-3" aria-label="List view" onClick={() => setView("list")}>
              <List aria-hidden="true" />
            </Button>
            <Button variant={view === "grid" ? "default" : "outline"} className="h-8 px-3" aria-label="Grid view" onClick={() => setView("grid")}>
              <Grid3x3 aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-16 shadow">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      ) : employees.length === 0 ? (
        <div className="rounded-xl border bg-card shadow">
          <EmptyState
            title={search || status !== "all" ? "No employees match your filters" : "No employees yet"}
            description={
              search || status !== "all"
                ? "Try adjusting the search or status filter."
                : "Add your first employee to get started."
            }
            action={
              <Button variant="dark" onClick={() => setMode("wizard")}>
                <Plus className="mr-2" aria-hidden="true" />
                Add Employee
              </Button>
            }
          />
        </div>
      ) : view === "list" ? (
        /* Reference columns: Employee, Job Title, Status, Start Date, Actions */
        <div className="rounded-xl border bg-card shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{initials(`${emp.firstName} ${emp.lastName}`)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {emp.firstName} {emp.lastName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{emp.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{emp.jobTitle ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={emp.employmentStatus} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(emp.startDate)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="iconSm"
                        aria-label={`Edit ${emp.firstName}`}
                        onClick={() => {
                          setEditing(emp);
                          setMode("wizard");
                        }}
                      >
                        <Pencil aria-hidden="true" />
                      </Button>
                      <Button variant="ghost" size="iconSm" aria-label={`Delete ${emp.firstName}`} className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => onDelete(emp)}>
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {employees.map((emp) => (
            <div key={emp.id} className="rounded-xl border bg-card p-4 shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{initials(`${emp.firstName} ${emp.lastName}`)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {emp.firstName} {emp.lastName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{emp.jobTitle ?? emp.employeeId}</p>
                  </div>
                </div>
                <StatusBadge status={emp.employmentStatus} />
              </div>
              <dl className="mt-3 flex flex-col gap-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="truncate pl-2 text-foreground">{emp.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Type</dt>
                  <dd className="pl-2">
                    <Badge variant="outline">{labelize(emp.employmentType)}</Badge>
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      )}
        </>
      )}
    </div>
    </div>
  );
}
