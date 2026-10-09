"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Upload, Search, LayoutGrid, List, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/input";
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
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useToast } from "@/components/ui/toast";
import { cn, formatDate, formatSar, initials } from "@/lib/utils";

interface EmployeeRow {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  jobTitle: string | null;
  employmentStatus: string;
  employmentType: string;
  startDate: string | null;
  baseSalary: number;
}

const STATUS_OPTIONS = ["all", "active", "on_leave", "suspended", "terminated"];
const TYPE_OPTIONS = ["all", "full_time", "part_time", "contract", "intern"];

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
  const [saving, setSaving] = React.useState(false);

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
      active: employees.filter((e) => e.employmentStatus === "active").length,
    };
  }, [employees]);

  async function onSave(data: Record<string, unknown>) {
    setSaving(true);
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
        title: editing ? "Employee updated" : "Employee added",
        description: editing ? "Changes saved." : `${data.firstName} was added to the directory.`,
        variant: "success",
      });
      setDialogOpen(false);
      setEditing(null);
      await load();
      return true;
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
      return false;
    } finally {
      setSaving(false);
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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader
        section="Employees"
        title="Employees"
        subtitle={`Manage your ${counts.total} employees`}
        actions={
          <>
            <Button variant="outline" onClick={() => toast.toast({ title: "CSV import", description: "Drop a CSV with columns: firstName, lastName, email, jobTitle, employmentStatus", variant: "info" })}>
              <Upload aria-hidden="true" />
              Import CSV
            </Button>
            <Button
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Plus aria-hidden="true" />
              Add Employee
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total" value={counts.total} />
        <StatCard label="Active" value={counts.active} />
        <StatCard label="On Leave" value={employees.filter((e) => e.employmentStatus === "on_leave").length} />
        <StatCard label="Suspended" value={employees.filter((e) => e.employmentStatus === "suspended").length} />
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
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
        <div className="flex items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      ) : employees.length === 0 ? (
        <div className="rounded-xl border bg-card shadow-sm">
          <EmptyState
            title={search || status !== "all" ? "No employees match your filters" : "No employees yet"}
            description={
              search || status !== "all"
                ? "Try adjusting the search or status filter."
                : "Add your first employee to get started."
            }
            action={
              <Button onClick={() => setDialogOpen(true)}>
                <Plus aria-hidden="true" />
                Add Employee
              </Button>
            }
          />
        </div>
      ) : view === "list" ? (
        <div className="rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Employment</TableHead>
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
                    <StatusBadge status={emp.employmentType} />
                  </TableCell>
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
            <div key={emp.id} className="rounded-xl border bg-card p-4 shadow-sm">
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
                    <StatusBadge status={emp.employmentType} />
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Salary</dt>
                  <dd className="pl-2 text-foreground">{formatSar(emp.baseSalary)}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      )}

      <EmployeeDialog
        open={dialogOpen}
        employee={editing}
        saving={saving}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
        onSave={onSave}
      />
    </div>
  );
}

function EmployeeDialog({
  open,
  employee,
  saving,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  employee: EmployeeRow | null;
  saving: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (data: Record<string, unknown>) => Promise<boolean>;
}) {
  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    jobTitle: "",
    employmentStatus: "active",
    employmentType: "full_time",
    startDate: "",
    salary: "0",
  });

  React.useEffect(() => {
    if (open) {
      setForm({
        firstName: employee?.firstName ?? "",
        lastName: employee?.lastName ?? "",
        email: employee?.email ?? "",
        phone: employee?.phone ?? "",
        jobTitle: employee?.jobTitle ?? "",
        employmentStatus: employee?.employmentStatus ?? "active",
        employmentType: employee?.employmentType ?? "full_time",
        startDate: employee?.startDate ? employee.startDate.slice(0, 10) : "",
        salary: employee ? String(employee.baseSalary / 100) : "0",
      });
    }
  }, [open, employee]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const salaryNum = Number(form.salary);
    if (!Number.isFinite(salaryNum) || salaryNum < 0) return;
    const okSave = await onSave({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      jobTitle: form.jobTitle,
      employmentStatus: form.employmentStatus,
      employmentType: form.employmentType,
      startDate: form.startDate,
      baseSalary: Math.round(salaryNum * 100),
    });
    if (okSave) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{employee ? "Edit Employee" : "Add Employee"}</DialogTitle>
          <DialogDescription>
            {employee ? "Update the employee's details." : "Create a new employee record."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="emp-first">First Name</Label>
              <Input id="emp-first" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="emp-last">Last Name</Label>
              <Input id="emp-last" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="emp-email">Email</Label>
            <Input id="emp-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="emp-phone">Phone</Label>
              <Input id="emp-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="emp-title">Job Title</Label>
              <Input id="emp-title" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="emp-status">Employment Status</Label>
              <Select value={form.employmentStatus} onValueChange={(v) => setForm({ ...form, employmentStatus: v })}>
                <SelectTrigger id="emp-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.filter((s) => s !== "all").map((s) => (
                    <SelectItem key={s} value={s}>
                      {labelize(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="emp-type">Employment Type</Label>
              <Select value={form.employmentType} onValueChange={(v) => setForm({ ...form, employmentType: v })}>
                <SelectTrigger id="emp-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.filter((t) => t !== "all").map((t) => (
                    <SelectItem key={t} value={t}>
                      {labelize(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="emp-start">Start Date</Label>
              <Input id="emp-start" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="emp-salary">Base Salary (SAR)</Label>
              <Input id="emp-salary" type="number" min="0" step="0.01" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {employee ? "Save Changes" : "Add Employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
