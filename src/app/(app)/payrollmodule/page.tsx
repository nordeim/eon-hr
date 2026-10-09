"use client";

import * as React from "react";
import { Plus, Wand2, Pencil, Trash2, Banknote, Loader2, Wallet, Coins, CheckCircle2, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface PayslipRow {
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
}

function monthLabel(period: string): string {
  const [y, m] = period.split("-").map(Number);
  if (!y || !m) return period;
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function toMinor(value: string): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export default function PayrollModulePage() {
  const toast = useToast();
  const period = currentPeriod();
  const [records, setRecords] = React.useState<PayslipRow[]>([]);
  const [employees, setEmployees] = React.useState<EmployeeOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [generating, setGenerating] = React.useState(false);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PayslipRow | null>(null);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const [payrollRes, empRes] = await Promise.all([
        fetch(`/api/payroll?period=${period}`),
        fetch("/api/employees"),
      ]);
      const payrollJson = await payrollRes.json();
      const empJson = await empRes.json();
      if (payrollJson.ok) setRecords(payrollJson.data.records);
      else toast.toast({ title: "Failed to load payslips", description: payrollJson.error?.message, variant: "error" });
      if (empJson.ok) setEmployees(empJson.data.employees);
    } catch {
      toast.toast({ title: "Failed to load payslips", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [period, toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const stats = React.useMemo(() => {
    const total = records.reduce((s, r) => s + r.netSalary, 0);
    const basic = records.reduce((s, r) => s + r.basicSalary, 0);
    const paid = records.filter((r) => r.status === "paid").length;
    const draft = records.filter((r) => r.status === "draft").length;
    return { total, basic, paid, draft };
  }, [records]);

  async function onGenerateAll() {
    setGenerating(true);
    try {
      const res = await fetch("/api/payroll/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Generation failed", description: json.error?.message, variant: "error" });
        return;
      }
      const { created, skipped } = json.data as { created: number; skipped: number };
      toast.toast({
        title: created > 0 ? `Generated ${created} payslip${created === 1 ? "" : "s"}` : "All payslips already exist",
        description:
          created > 0
            ? `Draft payslips for ${monthLabel(period)} created from base salaries.`
            : `${skipped} employee record${skipped === 1 ? "" : "s"} already exist for ${monthLabel(period)}.`,
        variant: created > 0 ? "success" : "info",
      });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setGenerating(false);
    }
  }

  async function onSave(data: {
    employeeId: string;
    period: string;
    basicSalary: number;
    allowances: number;
    bonus: number;
    deductions: number;
  }) {
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/payroll?id=${editing.id}` : "/api/payroll", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, status: editing?.status ?? "draft" }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Save failed", description: json.error?.message, variant: "error" });
        return false;
      }
      toast.toast({
        title: editing ? "Payslip updated" : "Payslip added",
        description: `${monthLabel(data.period)} · Net ${formatSar(
          data.basicSalary + data.allowances + data.bonus - data.deductions
        )}.`,
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

  async function onMarkPaid(record: PayslipRow) {
    try {
      const res = await fetch(`/api/payroll?id=${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Update failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Payslip marked as paid", variant: "success" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  async function onDelete(record: PayslipRow) {
    if (!window.confirm(`Delete the payslip for ${record.period}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/payroll?id=${record.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Delete failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Payslip deleted", variant: "success" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        title="Payroll Module"
        subtitle="Generate & manage monthly payslips"
        actions={
          <>
            <Button variant="outline" onClick={onGenerateAll} disabled={generating || loading}>
              {generating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Wand2 aria-hidden="true" />}
              Generate All
            </Button>
            <Button
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="mr-2" aria-hidden="true" />
              Add Payslip
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Payroll" value={formatSar(stats.total)} icon={<Wallet aria-hidden="true" />} />
        <StatCard label="Basic Salaries" value={formatSar(stats.basic)} icon={<Coins aria-hidden="true" />} />
        <StatCard label="Paid" value={stats.paid} icon={<CheckCircle2 aria-hidden="true" />} />
        <StatCard label="Draft" value={stats.draft} icon={<FileEdit aria-hidden="true" />} />
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col gap-1 p-5 pb-0">
          <h2 className="text-base font-semibold text-foreground">Payslips — {monthLabel(period)}</h2>
          <p className="text-sm text-muted-foreground">
            Salary slips for the current period. Generate All creates a draft payslip from each employee&apos;s base
            salary.
          </p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : records.length === 0 ? (
          <EmptyState
            title={`No payslips for ${monthLabel(period)}`}
            description={`Click "Generate All" to create them.`}
            action={
              <Button onClick={onGenerateAll} disabled={generating}>
                {generating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Wand2 aria-hidden="true" />}
                Generate All
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Basic Salary</TableHead>
                <TableHead>Allowances</TableHead>
                <TableHead>Bonus</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => {
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
                    <TableCell className="text-muted-foreground">{formatSar(record.basicSalary)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatSar(record.allowances)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatSar(record.bonus)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatSar(record.deductions)}</TableCell>
                    <TableCell className="font-medium text-foreground">{formatSar(record.netSalary)}</TableCell>
                    <TableCell>
                      <StatusBadge status={record.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {record.status !== "paid" ? (
                          <Button
                            variant="ghost"
                            size="iconSm"
                            aria-label={`Mark payslip as paid for ${name}`}
                            title="Mark as paid"
                            onClick={() => onMarkPaid(record)}
                          >
                            <Banknote aria-hidden="true" />
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="iconSm"
                          aria-label={`Edit payslip for ${name}`}
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
                          aria-label={`Delete payslip for ${name}`}
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
      </div>

      <PayslipDialog
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
  );
}

function PayslipDialog({
  open,
  record,
  employees,
  defaultPeriod,
  saving,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  record: PayslipRow | null;
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
    if (basic === null || allowances === null || bonus === null || deductions === null) return;
    if (basic + allowances + bonus - deductions < 0) return;
    const saved = await onSave({
      employeeId: form.employeeId,
      period: form.period,
      basicSalary: basic,
      allowances,
      bonus,
      deductions,
    });
    if (saved) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{record ? "Edit Payslip" : "Add Payslip"}</DialogTitle>
          <DialogDescription>
            {record ? "Update the salary components for this payslip." : "Create a payslip for an employee."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ps-employee">Employee</Label>
              <Select value={form.employeeId} onValueChange={(v) => setForm({ ...form, employeeId: v })}>
                <SelectTrigger id="ps-employee">
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
              <Label htmlFor="ps-period">Period</Label>
              <Input
                id="ps-period"
                type="month"
                required
                value={form.period}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ps-basic">Basic Salary (SAR)</Label>
              <Input
                id="ps-basic"
                type="number"
                min="0"
                step="0.01"
                required
                value={form.basic}
                onChange={(e) => setForm({ ...form, basic: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ps-allowances">Allowances (SAR)</Label>
              <Input
                id="ps-allowances"
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
              <Label htmlFor="ps-bonus">Bonus (SAR)</Label>
              <Input
                id="ps-bonus"
                type="number"
                min="0"
                step="0.01"
                value={form.bonus}
                onChange={(e) => setForm({ ...form, bonus: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ps-deductions">Deductions (SAR)</Label>
              <Input
                id="ps-deductions"
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
            <span className="text-sm font-semibold text-foreground">{formatSar(Math.round(preview * 100))}</span>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {record ? "Save Changes" : "Add Payslip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
