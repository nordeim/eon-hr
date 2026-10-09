"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Upload, Search, LayoutGrid, List, Pencil, Trash2, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  const [dialogOpen, setDialogOpen] = React.useState(false);
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
    if (params.get("new") === "1") setDialogOpen(true);
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
      setDialogOpen(false);
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
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        size="lg"
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
                setDialogOpen(true);
              }}
            >
              <Plus className="mr-2" aria-hidden="true" />
              Add Employee
            </Button>
          </>
        }
      />

      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            aria-label="Search employees"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-40" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "all" ? "All Status" : labelize(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          <Button variant={view === "list" ? "default" : "outline"} size="iconSm" aria-label="List view" onClick={() => setView("list")}>
            <List aria-hidden="true" />
          </Button>
          <Button variant={view === "grid" ? "default" : "outline"} size="iconSm" aria-label="Grid view" onClick={() => setView("grid")}>
            <LayoutGrid aria-hidden="true" />
          </Button>
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
              <Button variant="dark" onClick={() => setDialogOpen(true)}>
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
                          setDialogOpen(true);
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

      <EmployeeWizard
        open={dialogOpen}
        employee={editing}
        excludeManagerId={editing?.id ?? null}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
        onSave={onSave}
      />
    </div>
    </div>
  );
}
