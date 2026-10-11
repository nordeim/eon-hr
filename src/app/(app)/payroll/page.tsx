"use client";

import * as React from "react";
import { Banknote, CalendarRange, Check, CheckCircle2, DollarSign, FileDown, Loader2, Pencil, Plus, Search, Trash2, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { formatSar, initials, currentPeriod } from "@/lib/utils";

interface PayrollRow {
  id: string;
  employeeId: string;
  period: string;
  basicSalary: number;
  allowances: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  status: string;
  employee: { id: string; employeeId: string; firstName: string; lastName: string; email: string } | null;
}

interface EmployeeOption {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
}

const STATUS_OPTIONS = ["draft", "approved", "paid"];

function toMinor(value: string): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export default function PayrollPage() {
  const toast = useToast();
  const [records, setRecords] = React.useState<PayrollRow[]>([]);
  const [employees, setEmployees] = React.useState<EmployeeOption[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PayrollRow | null>(null);
  const [saving, setSaving] = React.useState(false);

  // Session 12 (R11-H): toolbar-card filters — employee text search + month.
  const [search, setSearch] = React.useState("");
  const [monthFilter, setMonthFilter] = React.useState("");

  const period = currentPeriod();

  const load = React.useCallback(async () => {
    try {
      const [payrollRes, empRes] = await Promise.all([fetch("/api/payroll"), fetch("/api/employees")]);
      const payrollJson = await payrollRes.json();
      const empJson = await empRes.json();
      if (payrollJson.ok) setRecords(payrollJson.data.records);
      else toast.toast({ title: "Failed to load payroll", description: payrollJson.error?.message, variant: "error" });
      if (empJson.ok) setEmployees(empJson.data.employees);
    } catch {
      toast.toast({ title: "Failed to load payroll", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const stats = React.useMemo(() => {
    const monthRecords = records.filter((r) => r.period === period);
    const total = monthRecords.reduce((s, r) => s + r.netSalary, 0);
    const people = new Set(monthRecords.map((r) => r.employeeId)).size;
    const approved = monthRecords.filter((r) => r.status === "approved").length;
    return { total, people, approved };
  }, [records, period]);

  // Session 12 (R11-H): the toolbar card's search + month drive the table.
  const visibleRecords = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      const name = `${r.employee?.firstName ?? ""} ${r.employee?.lastName ?? ""}`.trim().toLowerCase();
      const matchesQ = q === "" || name.includes(q) || r.employeeId.toLowerCase().includes(q);
      const matchesMonth = monthFilter === "" || r.period.startsWith(monthFilter);
      return matchesQ && matchesMonth;
    });
  }, [records, search, monthFilter]);

  async function onSave(data: {
    employeeId: string;
    period: string;
    basicSalary: number;
    allowances: number;
    bonus: number;
    deductions: number;
    status: string;
  }) {
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/payroll?id=${editing.id}` : "/api/payroll", {
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
        title: editing ? "Payroll record updated" : "Payroll record added",
        description: `Net salary ${formatSar(
          data.basicSalary + data.allowances + data.bonus - data.deductions
        )} for ${data.period}.`,
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

  async function onStatusChange(record: PayrollRow, status: string) {
    try {
      const res = await fetch(`/api/payroll?id=${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Update failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: status === "paid" ? "Marked as paid" : "Payroll approved", variant: "success" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  async function onDelete(record: PayrollRow) {
    if (!window.confirm(`Delete the payroll record for ${record.period}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/payroll?id=${record.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Delete failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Payroll record deleted", variant: "success" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right_bottom,#f0fdf4,#eff6ff)] p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        section="Payroll Management"
        mobileKicker
        mobileHeader="hidden"
        layout="raised-48"
        iconClassName="text-green-600"
        sectionIcon={<DollarSign aria-hidden="true" />}
        title="Payroll"
        subtitle="Automated salary processing and management"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() =>
                toast.toast({
                  title: "Reports & export",
                  description: "Payroll reports (CSV / PDF export) will be generated from this screen.",
                  variant: "info",
                })
              }
            >
              <FileDown className="mr-2" aria-hidden="true" />
              Reports & Export
            </Button>
            <Button variant="green"
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="mr-2" aria-hidden="true" />
              Add Payroll
            </Button>
          </>
        }
      />

      <div className="grid gap-6 md:grid-cols-4">
        <StatCard label="Total This Month" value={formatSar(stats.total)} icon={<Wallet aria-hidden="true" />} tileClassName="bg-green-100 text-green-600" />
        <StatCard label="Employees" value={stats.people} icon={<Users aria-hidden="true" />} tileClassName="bg-blue-100 text-blue-600" />
        <StatCard label="Approved" value={stats.approved} icon={<CheckCircle2 aria-hidden="true" />} tileClassName="bg-purple-100 text-purple-600" />
        <StatCard label="Current Period" value={period} icon={<CalendarRange aria-hidden="true" />} tileClassName="bg-orange-100 text-orange-600" />
      </div>

      {/* Session 12 (R11-H): the reference renders a standalone p-6 toolbar
          card between the stats and the records card — flex gap-4 with a
          relative flex-1 employee search (862px) and a w-48 month input
          (192px) — then the records card with the border-b DIV-title header
          ("Payroll Records") and the p-12 empty state WITHOUT an action. */}
      <Card className="border-slate-200">
        <div className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                type="text"
                placeholder="Search employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search employee"
              />
            </div>
            <Input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-48"
              aria-label="Filter by month"
            />
          </div>
        </div>
      </Card>

      <Card className="border-slate-200">
        <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-200">
          <div className="font-semibold leading-none tracking-tight">Payroll Records</div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : visibleRecords.length === 0 ? (
          <div className="p-0">
            {records.length === 0 ? (
              <EmptyState
                title="No payroll records"
                description="Add payroll for this month to get started"
                action={
                  <Button variant="dark"
                    onClick={() => {
                      setEditing(null);
                      setDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2" aria-hidden="true" />
                    Add Payroll
                  </Button>
                }
              />
            ) : (
              /* Filtered-to-zero: the systemic empty row (R11-V). */
              <div className="py-12 text-center text-slate-400">No payroll records match the current filters.</div>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Basic</TableHead>
                <TableHead>Allowances</TableHead>
                <TableHead>Net</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRecords.map((record) => {
                const name = `${record.employee?.firstName ?? ""} ${record.employee?.lastName ?? ""}`.trim() || "—";
                return (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{initials(name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {record.employee?.employeeId ?? record.employeeId}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{record.period}</TableCell>
                    <TableCell className="text-muted-foreground">{formatSar(record.basicSalary)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatSar(record.allowances)}</TableCell>
                    <TableCell className="font-medium text-foreground">{formatSar(record.netSalary)}</TableCell>
                    <TableCell>
                      <StatusBadge status={record.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {record.status === "draft" ? (
                          <Button
                            variant="ghost"
                            size="iconSm"
                            aria-label={`Approve payroll for ${name}`}
                            title="Approve"
                            onClick={() => onStatusChange(record, "approved")}
                          >
                            <Check aria-hidden="true" />
                          </Button>
                        ) : null}
                        {record.status !== "paid" ? (
                          <Button
                            variant="ghost"
                            size="iconSm"
                            aria-label={`Mark payroll as paid for ${name}`}
                            title="Mark as paid"
                            onClick={() => onStatusChange(record, "paid")}
                          >
                            <Banknote aria-hidden="true" />
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="iconSm"
                          aria-label={`Edit payroll for ${name}`}
                          title="Edit"
                          onClick={() => {
                            setEditing(record);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="iconSm"
                          aria-label={`Delete payroll for ${name}`}
                          title="Delete"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => onDelete(record)}
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <PayrollDialog
        key={editing ? editing.id : "new"}
        open={dialogOpen}
        record={editing}
        employees={employees}
        defaultPeriod={period}
        saving={saving}
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

function PayrollDialog({
  open,
  record,
  employees,
  defaultPeriod,
  saving,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  record: PayrollRow | null;
  employees: EmployeeOption[];
  defaultPeriod: string;
  saving: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (data: {
    employeeId: string;
    period: string;
    basicSalary: number;
    allowances: number;
    bonus: number;
    deductions: number;
    status: string;
  }) => Promise<boolean>;
}) {
  // Initial form state is derived from `record` at mount; the parent remounts
  // this dialog via key={editing ? editing.id : "new"} so re-opening with a
  // different record resets the form without a prefill effect.
  const [form, setForm] = React.useState(() => ({
    employeeId: record?.employeeId ?? "",
    period: record?.period ?? defaultPeriod,
    basic: record ? String(record.basicSalary / 100) : "0",
    allowances: record ? String(record.allowances / 100) : "0",
    bonus: record ? String(record.bonus / 100) : "0",
    deductions: record ? String(record.deductions / 100) : "0",
    status: record?.status ?? "draft",
  }));

  const preview =
    (Number(form.basic) || 0) + (Number(form.allowances) || 0) + (Number(form.bonus) || 0) -
    (Number(form.deductions) || 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const basic = toMinor(form.basic);
    const allowances = toMinor(form.allowances);
    const bonus = toMinor(form.bonus);
    const deductions = toMinor(form.deductions);
    if (basic === null || allowances === null || bonus === null || deductions === null) {
      return;
    }
    if (basic + allowances + bonus - deductions < 0) return;
    const saved = await onSave({
      employeeId: form.employeeId,
      period: form.period,
      basicSalary: basic,
      allowances,
      bonus,
      deductions,
      status: form.status,
    });
    if (saved) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{record ? "Edit Payroll Record" : "Add Payroll"}</DialogTitle>
          <DialogDescription>
            {record ? "Update the salary components for this period." : "Create a payroll record for an employee."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pay-employee">Employee</Label>
              <Select
                value={form.employeeId}
                onValueChange={(v) => setForm({ ...form, employeeId: v })}
                required
              >
                <SelectTrigger id="pay-employee">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pay-period">Period</Label>
              <Input
                id="pay-period"
                type="month"
                required
                value={form.period}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pay-basic">Basic Salary (SAR)</Label>
              <Input
                id="pay-basic"
                type="number"
                min="0"
                step="0.01"
                required
                value={form.basic}
                onChange={(e) => setForm({ ...form, basic: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pay-allowances">Allowances (SAR)</Label>
              <Input
                id="pay-allowances"
                type="number"
                min="0"
                step="0.01"
                value={form.allowances}
                onChange={(e) => setForm({ ...form, allowances: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pay-bonus">Bonus (SAR)</Label>
              <Input
                id="pay-bonus"
                type="number"
                min="0"
                step="0.01"
                value={form.bonus}
                onChange={(e) => setForm({ ...form, bonus: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pay-deductions">Deductions (SAR)</Label>
              <Input
                id="pay-deductions"
                type="number"
                min="0"
                step="0.01"
                value={form.deductions}
                onChange={(e) => setForm({ ...form, deductions: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border bg-secondary/40 px-3 py-2">
            <span className="text-sm text-muted-foreground">Net salary</span>
            <span className="text-sm font-semibold text-foreground">
              {formatSar(Math.round(preview * 100))}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pay-status">Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger id="pay-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="green" type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {record ? "Save Changes" : "Add Payroll"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
