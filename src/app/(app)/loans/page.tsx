"use client";

import * as React from "react";
import { Banknote, Check, CircleDollarSign, DollarSign, HandCoins, Loader2, MoreHorizontal, Plus, Trash2, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { formatSar, formatDate, initials } from "@/lib/utils";

interface LoanRow {
  id: string;
  employeeId: string;
  amount: number;
  reason: string | null;
  installmentMonths: number;
  monthlyDeduction: number;
  remaining: number;
  status: string;
  requestedAt: string;
  employee: { id: string; employeeId: string; firstName: string; lastName: string; email: string } | null;
}

interface EmployeeOption {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
}

export default function LoansPage() {
  const toast = useToast();
  const [loans, setLoans] = React.useState<LoanRow[]>([]);
  const [employees, setEmployees] = React.useState<EmployeeOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({ employeeId: "", amount: "", months: "12", reason: "" });

  const load = React.useCallback(async () => {
    try {
      const [loansRes, empRes] = await Promise.all([fetch("/api/loans"), fetch("/api/employees")]);
      const loansJson = await loansRes.json();
      const empJson = await empRes.json();
      if (loansJson.ok) setLoans(loansJson.data.loans);
      else toast.toast({ title: "Failed to load loans", description: loansJson.error?.message, variant: "error" });
      if (empJson.ok) setEmployees(empJson.data.employees);
    } catch {
      toast.toast({ title: "Failed to load loans", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(form.amount);
    const months = Number(form.months);
    if (!Number.isFinite(amount) || amount <= 0) return;
    if (!Number.isInteger(months) || months < 1 || months > 60) return;
    setSaving(true);
    try {
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: form.employeeId,
          amount: Math.round(amount * 100),
          installmentMonths: months,
          reason: form.reason,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Failed to create loan", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({
        title: "Loan request created",
        description: `Monthly installment ${formatSar(json.data.loan.monthlyDeduction)} over ${months} months.`,
        variant: "success",
      });
      setDialogOpen(false);
      setForm({ employeeId: "", amount: "", months: "12", reason: "" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function patchLoan(loan: LoanRow, body: Record<string, unknown>, title: string) {
    try {
      const res = await fetch(`/api/loans?id=${loan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Update failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title, variant: "success" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  async function onDelete(loan: LoanRow) {
    if (!window.confirm("Delete this loan record? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/loans?id=${loan.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Delete failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Loan deleted", variant: "success" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  const monthlyPreview = (() => {
    const amount = Number(form.amount);
    const months = Number(form.months);
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(months) || months < 1) return null;
    return Math.round((amount * 100) / months);
  })();

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right_bottom,#f8fafc,#eff6ff)] p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        section="Loan Management"
        mobileKicker
        mobileHeader="hidden"
        layout="raised-36"
        iconClassName="text-blue-600"
        sectionIcon={<DollarSign aria-hidden="true" />}
        title="Employee Loans"
        subtitle="Manage and track loan requests"
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2" aria-hidden="true" />
            New Loan Request
          </Button>
        }
      />

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col gap-1 p-5 pb-0">
          <h2 className="text-base font-semibold text-foreground">Loan Requests</h2>
          <p className="text-sm text-muted-foreground">Requests, approvals and repayment progress.</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : loans.length === 0 ? (
          <EmptyState
            icon={<HandCoins className="h-6 w-6" aria-hidden="true" />}
            title="No loans yet"
            description="Create your first loan request"
            action={
              <Button variant="dark" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2" aria-hidden="true" />
                New Loan Request
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Monthly</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.map((loan) => {
                const name = `${loan.employee?.firstName ?? ""} ${loan.employee?.lastName ?? ""}`.trim() || "—";
                const paidRatio =
                  loan.amount > 0 ? Math.min(100, Math.round(((loan.amount - loan.remaining) / loan.amount) * 100)) : 0;
                return (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{initials(name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {loan.installmentMonths} months · requested {formatDate(loan.requestedAt)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Wallet className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        {formatSar(loan.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <CircleDollarSign className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        {formatSar(loan.monthlyDeduction)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex w-36 flex-col gap-1.5">
                        <span className="text-sm text-foreground">{formatSar(loan.remaining)}</span>
                        <Progress value={paidRatio} aria-label={`Repaid ${paidRatio}%`} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={loan.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="iconSm" aria-label={`Actions for loan of ${name}`}>
                            <MoreHorizontal aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {loan.status === "pending" ? (
                            <>
                              <DropdownMenuItem onClick={() => patchLoan(loan, { status: "approved" }, "Loan approved")}>
                                <Check aria-hidden="true" /> Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => patchLoan(loan, { status: "rejected" }, "Loan rejected")}>
                                <X aria-hidden="true" /> Reject
                              </DropdownMenuItem>
                            </>
                          ) : null}
                          {loan.status === "approved" ? (
                            <DropdownMenuItem onClick={() => patchLoan(loan, { status: "active" }, "Loan activated — deductions started")}>
                              <Banknote aria-hidden="true" /> Activate
                            </DropdownMenuItem>
                          ) : null}
                          {loan.status === "active" ? (
                            <DropdownMenuItem
                              onClick={() =>
                                patchLoan(loan, { action: "payment" }, "Installment recorded")
                              }
                            >
                              <CircleDollarSign aria-hidden="true" /> Record installment
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => onDelete(loan)}
                          >
                            <Trash2 aria-hidden="true" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Loan Request</DialogTitle>
            <DialogDescription>Create an employee loan request with a monthly installment plan.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="loan-employee">Employee</Label>
              <Select value={form.employeeId} onValueChange={(v) => setForm({ ...form, employeeId: v })}>
                <SelectTrigger id="loan-employee">
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
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="loan-amount">Loan Amount (SAR)</Label>
                <Input
                  id="loan-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="loan-months">Installment Months</Label>
                <Input
                  id="loan-months"
                  type="number"
                  min="1"
                  max="60"
                  step="1"
                  required
                  value={form.months}
                  onChange={(e) => setForm({ ...form, months: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="loan-reason">Reason</Label>
              <Textarea
                id="loan-reason"
                rows={3}
                placeholder="e.g. Family relocation, education, medical…"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </div>
            {monthlyPreview !== null ? (
              <div className="flex items-center justify-between rounded-lg border bg-secondary/40 px-3 py-2">
                <span className="text-sm text-muted-foreground">Monthly deduction</span>
                <span className="text-sm font-semibold text-foreground">{formatSar(monthlyPreview)}</span>
              </div>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                Create Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
}
