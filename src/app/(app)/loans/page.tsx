"use client";

import * as React from "react";
import { Banknote, Check, CircleDollarSign, DollarSign, Loader2, MoreHorizontal, Plus, Trash2, User, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { PageCanvas } from "@/components/shared/page-canvas";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useToast } from "@/components/ui/toast";
import { formatSar, formatDate, initials } from "@/lib/utils";

interface LoanRow {
  id: string;
  employeeId: string;
  loanType: string;
  amount: number;
  paidFrom: string | null;
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
  email: string;
}

export default function LoansPage() {
  const toast = useToast();
  const [loans, setLoans] = React.useState<LoanRow[]>([]);
  const [employees, setEmployees] = React.useState<EmployeeOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  /* Session 38 (R37-D2): REF's form defaults — amount "0", paidFrom
     "New Era LLC" (live-measured, stable across re-opens; hardcoded in
     REF's form code — its own company is "Demo", so the literal is not
     company-driven). */
  const [form, setForm] = React.useState({ employeeId: "", loanType: "standard", amount: "0", months: "12", paidFrom: "New Era LLC", reason: "" });

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
    /* Session 38 (R37-D4): the silent-return guards are gone (the
       round-36 anti-pattern) — with the "0" amount prefill an immediate
       submit now flows to the API, whose Zod rejects non-positive
       amounts / bad months and surfaces the error as a toast (the
       documented superset). */
    const amount = Number(form.amount);
    const months = Number(form.months);
    setSaving(true);
    try {
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: form.employeeId,
          loanType: form.loanType,
          amount: Math.round(amount * 100),
          installmentMonths: months,
          paidFrom: form.paidFrom,
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
      setForm({ employeeId: "", loanType: "standard", amount: "0", months: "12", paidFrom: "New Era LLC", reason: "" });
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

  // Session 23 (R22-C): the selected employee drives the Requesting-for
  // preview card (name + email, REF-measured).
  const selectedEmployee = employees.find((e) => e.id === form.employeeId) ?? null;

  const loanTypeLabel = (t: string) =>
    ({ standard: "Standard Loan", emergency: "Emergency Loan", "salary-advance": "Salary Advance", personal: "Personal Loan" })[t] ?? t;

  return (
    /* Session 38 (R37-A): the Dialog root LIFTED to wrap the page —
       the trigger (PageHeader actions) must sit inside the root's
       context for the Radix trigger contract (aria-haspopup="dialog",
       focus-restore-on-close). Renders no DOM — layout untouched. */
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
    <PageCanvas>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        actionsUnwrapped

        /* Session 49 (R48-A3): the always-row family — REF renders the
         *  UNPREFIXED always-row (measured @1440×900 this round). */
        alwaysRow
        section="Loan Management"
        mobileKicker
        mobileHeader="hidden"
        layout="raised-36"
        actionsStart
        iconClassName="text-blue-600"
        sectionIcon={<DollarSign aria-hidden="true" />}
        title="Employee Loans"
        subtitle="Manage and track loan requests"
        actions={
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2" aria-hidden="true" />
              New Loan Request
            </Button>
          </DialogTrigger>
        }
      />

      {/* Session 11 (R10-O): the reference's empty state — a
          `md:grid-cols-1 lg:grid-cols-2 gap-6` wrapper carrying ONE bare
          card (p-12 text-center): the 64px DollarSign icon, "No loans yet"
          h3, the slate-500 line (mb-4) and the flat-primary CTA 194x36
          (icon mr-2). The with-data table stays the clone's superset (the
          reference's populated layout is unmeasurable — it renders no
          loans).
          Session 62 (R62-D1): the card rewrite to REF's live recipe —
          `text-card-foreground shadow col-span-full border-slate-200`
          (the unflipping border pair: REF's card stays LIGHT-bordered
          in dark, live-measured by the r62 border census). */}
      {loading ? (
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        </div>
      ) : loans.length === 0 ? (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <div className="rounded-xl border bg-card text-card-foreground shadow col-span-full border-slate-200">
            <EmptyState
              icon={<DollarSign aria-hidden="true" />}
              title="No loans yet"
              description="Create your first loan request"
              action={
                /* Session 58 (R58-3): REF's empty-state CTA is the DARK
                   solid — joining the other four dark empty-state CTAs
                   (the documented session-6 recipe, re-measured). */
                <Button variant="dark" onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2" aria-hidden="true" />
                  New Loan Request
                </Button>
              }
            />
          </div>
        </div>
      ) : (
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col gap-1 p-5 pb-0">
          <h2 className="text-base font-semibold text-foreground">Loan Requests</h2>
          <p className="text-sm text-muted-foreground">Requests, approvals and repayment progress.</p>
        </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Amount</TableHead>
                {/* Session 23 (R22-C6): the Type column surfaces the stored
                    loanType (REF's table is unmeasurable at zero data — the
                    superset display). */}
                <TableHead>Type</TableHead>
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
                    <TableCell className="text-muted-foreground">{loanTypeLabel(loan.loanType)}</TableCell>
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
      </div>
      )}

      {/* Session 23 (R22-C): the REF recipe — 672px (max-w-2xl), H2-only
          header (REF renders no description), space-y-2 field rows, the
          Requesting-for preview card, the 4-cell grid with the computed
          Monthly Installment display, min-h-[60px] Reason, Paid From, and
          the right-aligned justify-end gap-3 actions with Submit Request.
          Session 38 (R37-A): the root is lifted — this renders the Content
          directly under the page-level root. */}
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Loan Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            {/* No space-y-2 — Radix's native select is the last child;
                v4 would margin the TRIGGER (the phantom-8px cell bug).
                The mt-2 carries the 12px gap alone (R34-B). */}
            <div>
              <Label htmlFor="loan-employee">Employee</Label>
              <Select value={form.employeeId} onValueChange={(v) => setForm({ ...form, employeeId: v })}>
                <SelectTrigger id="loan-employee" className="mt-2">
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
            {/* Session 23 (R22-C3): the Requesting-for card — REF renders it
                ALWAYS (the name line shows the "Select employee" placeholder
                until one is picked): p-4 bg-blue-50 rounded-lg > flex
                items-center gap-3 mb-3 > 20px user icon + the 2-line stack
                (text-sm slate-600 label + font-semibold slate-900 name). */}
            {/* Session 38 (R37-F): REF's card carries border border-blue-200 (1px
                rgb(191,219,254) — live-measured; the borderless clone was
                2px short, the 698-vs-696 dialog-height drift). */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <User className="w-5 h-5" aria-hidden="true" />
                <div>
                  <p className="text-sm text-slate-600">Requesting for</p>
                  <p className="font-semibold text-slate-900">
                    {selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : "Select employee"}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* No space-y-2 — the Radix native-select last-child trap
                  (the trigger would carry the mb). mt-2 alone (R34-B). */}
              <div>
                <Label htmlFor="loan-type">Loan Type</Label>
                <Select value={form.loanType} onValueChange={(v) => setForm({ ...form, loanType: v })}>
                  <SelectTrigger id="loan-type" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Loan</SelectItem>
                    <SelectItem value="emergency">Emergency Loan</SelectItem>
                    <SelectItem value="salary-advance">Salary Advance</SelectItem>
                    <SelectItem value="personal">Personal Loan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="loan-amount">Amount (SAR)</Label>
                {/* Session 35 (R34-B): mt-2 on every control — REF's v3
                    space-y-2 lands as margin-top on the FOLLOWING block
                    (12px measured on both dialogs); v4's
                    :not(:last-child) mb on the INLINE label is ignored —
                    the session-34 inline-label trap, compensated.
                    Session 38 (R37-D3): NO min/max/step — REF's number
                    inputs carry required only; the invented constraints
                    changed the native validation surface (the API's Zod +
                    toast is the enforced superset). */}
                <Input
                  id="loan-amount"
                  type="number"
                  className="mt-2"
                  required
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loan-months">Duration (Months)</Label>
                <Input
                  id="loan-months"
                  type="number"
                  className="mt-2"
                  required
                  value={form.months}
                  onChange={(e) => setForm({ ...form, months: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Monthly Installment</Label>
                {/* Session 23 (R22-C2): REF's read-only display — "SAR 0.00"
                    (prefix + 2 decimals, text-center, border-slate-200).
                    Session 35 (R34-B): the VALUE is REF's P recipe — 16px /
                    weight 600 / blue-700 (live-measured rgb(29,78,216)). */}
                <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-md text-center mt-2">
                  <p className="text-base font-semibold text-blue-700">
                    SAR {monthlyPreview !== null ? (monthlyPreview / 100).toFixed(2) : "0.00"}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="loan-reason">Reason</Label>
              <Textarea
                id="loan-reason"
                rows={3}
                className="min-h-[60px] mt-2"
                required
                placeholder="Hi, I'm buying an apartment and I need a loan for the down payment."
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loan-paid-from">Paid From</Label>
              <Input
                id="loan-paid-from"
                type="text"
                className="mt-2"
                /* Session 35 (R34-B): no placeholder — REF's input is bare. */
                value={form.paidFrom}
                onChange={(e) => setForm({ ...form, paidFrom: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                Submit Request
              </Button>
            </div>
          </form>
        </DialogContent>
    </div>
    </div>
    </PageCanvas>
    </Dialog>
  );
}
