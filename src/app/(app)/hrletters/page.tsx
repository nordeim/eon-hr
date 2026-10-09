"use client";

import * as React from "react";
import { Plus, FileText, Check, X, Loader2, Pencil } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useToast } from "@/components/ui/toast";
import { formatDate, initials } from "@/lib/utils";

interface LetterRow {
  id: string;
  type: string;
  status: string;
  reason: string | null;
  issuedAt: string | null;
  createdAt: string;
  employeeId: string;
  employeeName: string;
  jobTitle: string | null;
}

interface EmployeeOption {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
}

const LETTER_TYPES: { value: string; label: string }[] = [
  { value: "employment", label: "Employment Letter" },
  { value: "salary", label: "Salary Certificate" },
  { value: "bank", label: "Bank Letter" },
  { value: "noc", label: "NOC" },
  { value: "experience", label: "Experience Letter" },
];

function typeLabel(v: string): string {
  return LETTER_TYPES.find((t) => t.value === v)?.label ?? v;
}

export default function HRLettersPage() {
  const toast = useToast();
  const [letters, setLetters] = React.useState<LetterRow[]>([]);
  const [employees, setEmployees] = React.useState<EmployeeOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [lettersRes, employeesRes] = await Promise.all([fetch("/api/hr-letters"), fetch("/api/employees")]);
      const lettersJson = await lettersRes.json();
      const employeesJson = await employeesRes.json();
      if (lettersJson.ok) setLetters(lettersJson.data.letters);
      else toast.toast({ title: "Failed to load letter requests", description: lettersJson.error?.message, variant: "error" });
      if (employeesJson.ok) {
        setEmployees(
          employeesJson.data.employees.map((e: EmployeeOption) => ({ id: e.id, firstName: e.firstName, lastName: e.lastName, jobTitle: e.jobTitle }))
        );
      }
    } catch {
      toast.toast({ title: "Network error", description: "Could not load letter requests.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function onSave(data: { employeeId: string; type: string; reason: string }) {
    setSaving(true);
    try {
      const res = await fetch("/api/hr-letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Request failed", description: json.error?.message, variant: "error" });
        return false;
      }
      toast.toast({
        title: "Letter request submitted",
        description: `${typeLabel(data.type)} request is now pending review.`,
        variant: "success",
      });
      await load();
      return true;
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function onDecide(letter: LetterRow, status: "issued" | "rejected") {
    setBusy(letter.id + status);
    try {
      const res = await fetch(`/api/hr-letters?id=${letter.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Action failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({
        title: status === "issued" ? "Letter issued" : "Request rejected",
        description: `${letter.employeeName} — ${typeLabel(letter.type)}.`,
        variant: status === "issued" ? "success" : "info",
      });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setBusy(null);
    }
  }

  const pending = letters.filter((l) => l.status === "pending").length;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        section="HR Letters & Documents"
        title="HR Letters"
        subtitle="Request and manage official HR documents"
        actions={
          <Button
            onClick={() => {
              setDialogOpen(true);
            }}
          >
            <Plus aria-hidden="true" />
            New Request
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Letter Requests</CardTitle>
          <CardDescription>
            {letters.length} request{letters.length === 1 ? "" : "s"} · {pending} pending review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          ) : letters.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-6 w-6" />}
              title="No letter requests yet"
              description="Request your first HR letter to get started"
              action={
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus aria-hidden="true" />
                  New Request
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {letters.map((letter) => (
                  <TableRow key={letter.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{initials(letter.employeeName)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{letter.employeeName}</p>
                          <p className="truncate text-xs text-muted-foreground">{letter.employeeId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="info">{typeLabel(letter.type)}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[280px]">
                      <p className="truncate text-muted-foreground">{letter.reason ?? "—"}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-start gap-1">
                        <StatusBadge status={letter.status} />
                        {letter.issuedAt ? (
                          <span className="text-xs text-muted-foreground">{formatDate(letter.issuedAt)}</span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(letter.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {letter.status === "pending" ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busy === letter.id + "issued"}
                              onClick={() => onDecide(letter, "issued")}
                            >
                              {busy === letter.id + "issued" ? (
                                <Loader2 className="animate-spin" aria-hidden="true" />
                              ) : (
                                <Check aria-hidden="true" />
                              )}
                              Issue
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              disabled={busy === letter.id + "rejected"}
                              onClick={() => onDecide(letter, "rejected")}
                            >
                              {busy === letter.id + "rejected" ? (
                                <Loader2 className="animate-spin" aria-hidden="true" />
                              ) : (
                                <X aria-hidden="true" />
                              )}
                              Reject
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">No actions</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <LetterRequestDialog
        open={dialogOpen}
        employees={employees}
        saving={saving}
        onOpenChange={setDialogOpen}
        onSave={onSave}
      />
    </div>
  );
}

function LetterRequestDialog({
  open,
  employees,
  saving,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  employees: EmployeeOption[];
  saving: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (data: { employeeId: string; type: string; reason: string }) => Promise<boolean>;
}) {
  const [form, setForm] = React.useState({ employeeId: "", type: "employment", reason: "" });

  React.useEffect(() => {
    if (open) {
      setForm({
        employeeId: employees[0]?.id ?? "",
        type: "employment",
        reason: "",
      });
    }
  }, [open, employees]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.employeeId) return;
    const saved = await onSave({ employeeId: form.employeeId, type: form.type, reason: form.reason });
    if (saved) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Letter Request</DialogTitle>
          <DialogDescription>Request an official HR document for an employee.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="letter-employee">Employee</Label>
            <Select value={form.employeeId} onValueChange={(v) => setForm({ ...form, employeeId: v })}>
              <SelectTrigger id="letter-employee">
                <SelectValue placeholder={employees.length === 0 ? "No employees found" : "Select employee"} />
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
            <Label htmlFor="letter-type">Letter Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger id="letter-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LETTER_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="letter-reason">Reason (optional)</Label>
            <Textarea
              id="letter-reason"
              placeholder="e.g. Required for a bank loan application"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !form.employeeId}>
              {saving ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Pencil aria-hidden="true" />}
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
