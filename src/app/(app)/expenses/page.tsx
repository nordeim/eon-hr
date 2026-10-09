"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Check, X, Trash2, Banknote, Loader2, Clock, CheckCircle2, Receipt, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/input";
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
import { formatSar, formatDate } from "@/lib/utils";

interface ClaimRow {
  id: string;
  employeeId: string;
  title: string;
  category: string;
  amount: number;
  description: string | null;
  date: string;
  status: string;
  createdAt: string;
  employee: { id: string; employeeId: string; firstName: string; lastName: string; email: string } | null;
}

interface EmployeeOption {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
}

const CATEGORIES = ["travel", "meals", "equipment", "training", "medical", "other"] as const;

function categoryLabel(c: string): string {
  return c.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export default function ExpensesPage() {
  const toast = useToast();
  const params = useSearchParams();
  const [claims, setClaims] = React.useState<ClaimRow[]>([]);
  const [employees, setEmployees] = React.useState<EmployeeOption[]>([]);
  const [loading, setLoading] = React.useState(true);

  // ?new=1 (dashboard quick action) opens the create dialog on first render —
  // derived as lazy initial state instead of a setState-in-effect.
  const [dialogOpen, setDialogOpen] = React.useState(params.get("new") === "1");
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    employeeId: "me",
    title: "",
    category: "travel",
    amount: "",
    date: "",
    description: "",
  });

  const load = React.useCallback(async () => {
    try {
      const [claimsRes, empRes] = await Promise.all([fetch("/api/expenses"), fetch("/api/employees")]);
      const claimsJson = await claimsRes.json();
      const empJson = await empRes.json();
      if (claimsJson.ok) setClaims(claimsJson.data.claims);
      else toast.toast({ title: "Failed to load claims", description: claimsJson.error?.message, variant: "error" });
      if (empJson.ok) setEmployees(empJson.data.employees);
    } catch {
      toast.toast({ title: "Failed to load claims", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const stats = React.useMemo(() => {
    const sum = (status: string) => claims.filter((c) => c.status === status).reduce((s, c) => s + c.amount, 0);
    return { pending: sum("pending"), approved: sum("approved"), reimbursed: sum("reimbursed"), total: claims.length };
  }, [claims]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(form.employeeId !== "me" ? { employeeId: form.employeeId } : {}),
          title: form.title,
          category: form.category,
          amount: Math.round(amount * 100),
          description: form.description,
          date: form.date,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Failed to submit claim", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({
        title: "Expense claim submitted",
        description: `${form.title} · ${formatSar(Math.round(amount * 100))} pending approval.`,
        variant: "success",
      });
      setDialogOpen(false);
      setForm({ employeeId: "me", title: "", category: "travel", amount: "", date: "", description: "" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function onStatusChange(claim: ClaimRow, status: string) {
    try {
      const res = await fetch(`/api/expenses?id=${claim.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Update failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: `Claim ${status}`, variant: "success" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  async function onDelete(claim: ClaimRow) {
    if (!window.confirm(`Delete the claim "${claim.title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/expenses?id=${claim.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Delete failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Claim deleted", variant: "success" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right_bottom,#faf5ff,#fdf2f8)] p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        section="Expense Management"
        layout="raised-48"
        iconClassName="text-purple-600"
        sectionIcon={<Receipt aria-hidden="true" />}
        title="Expense Claims"
        subtitle="Submit and manage expense reimbursements"
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2" aria-hidden="true" />
            New Expense
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Pending" value={formatSar(stats.pending)} icon={<Clock aria-hidden="true" />} />
        <StatCard label="Approved" value={formatSar(stats.approved)} icon={<CheckCircle2 aria-hidden="true" />} />
        <StatCard label="Reimbursed" value={formatSar(stats.reimbursed)} icon={<Banknote aria-hidden="true" />} />
        <StatCard label="Total Claims" value={stats.total} icon={<Receipt aria-hidden="true" />} />
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col gap-1 p-5 pb-0">
          <h2 className="text-base font-semibold text-foreground">Claims</h2>
          <p className="text-sm text-muted-foreground">Submitted reimbursements and their approval status.</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : claims.length === 0 ? (
          <EmptyState
            icon={<Receipt className="h-6 w-6" aria-hidden="true" />}
            title="No expense claims yet"
            description="Submit your first claim to get started"
            action={
              <Button variant="dark" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2" aria-hidden="true" />
                New Expense
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{claim.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {claim.employee
                            ? `${claim.employee.firstName} ${claim.employee.lastName}`.trim()
                            : "—"}
                          {claim.description ? ` · ${claim.description}` : ""}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={claim.category} className="capitalize" />
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{formatSar(claim.amount)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(claim.date)}</TableCell>
                  <TableCell>
                    <StatusBadge status={claim.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {claim.status === "pending" ? (
                        <>
                          <Button
                            variant="ghost"
                            size="iconSm"
                            aria-label={`Approve claim ${claim.title}`}
                            title="Approve"
                            onClick={() => onStatusChange(claim, "approved")}
                          >
                            <Check aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="iconSm"
                            aria-label={`Reject claim ${claim.title}`}
                            title="Reject"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => onStatusChange(claim, "rejected")}
                          >
                            <X aria-hidden="true" />
                          </Button>
                        </>
                      ) : null}
                      {claim.status === "approved" ? (
                        <Button
                          variant="ghost"
                          size="iconSm"
                          aria-label={`Mark claim ${claim.title} as reimbursed`}
                          title="Mark reimbursed"
                          onClick={() => onStatusChange(claim, "reimbursed")}
                        >
                          <Banknote aria-hidden="true" />
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="iconSm"
                        aria-label={`Delete claim ${claim.title}`}
                        title="Delete"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => onDelete(claim)}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Expense</DialogTitle>
            <DialogDescription>Submit an expense claim for reimbursement.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ex-title">Title</Label>
              <Input
                id="ex-title"
                required
                placeholder="e.g. Client dinner, flight to Riyadh…"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ex-category">Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger id="ex-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {categoryLabel(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ex-amount">Amount (SAR)</Label>
                <Input
                  id="ex-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ex-date">Date</Label>
                <Input
                  id="ex-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ex-employee">Employee</Label>
                <Select value={form.employeeId} onValueChange={(v) => setForm({ ...form, employeeId: v })}>
                  <SelectTrigger id="ex-employee">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="me">My profile</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ex-description">Description</Label>
              <Textarea
                id="ex-description"
                rows={3}
                placeholder="Optional details or business justification…"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                Submit Claim
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
}
