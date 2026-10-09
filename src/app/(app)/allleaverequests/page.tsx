"use client";

import * as React from "react";
import { CalendarDays, Check, Clock3, ListChecks, Loader2, Plane, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
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
import { formatDate, initials } from "@/lib/utils";

interface LeaveRequestRow {
  id: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string | null;
  status: string;
  createdAt: string;
  employeeId: string;
  employee: { firstName: string; lastName: string; email: string; employeeId: string };
  leaveType: { id: string; name: string };
}

interface LeaveTypeOption {
  id: string;
  name: string;
  quotaDays: number;
  color: string;
}

export default function AllLeaveRequestsPage() {
  const toast = useToast();
  const [requests, setRequests] = React.useState<LeaveRequestRow[]>([]);
  const [stats, setStats] = React.useState({ pending: 0, approved: 0, total: 0 });
  const [leaveTypes, setLeaveTypes] = React.useState<LeaveTypeOption[]>([]);
  const [canApprove, setCanApprove] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [deciding, setDeciding] = React.useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogSeq, setDialogSeq] = React.useState(0);
  const [saving, setSaving] = React.useState(false);

  function openNewRequest() {
    setDialogSeq((s) => s + 1);
    setDialogOpen(true);
  }

  const load = React.useCallback(() => {
    fetch("/api/leave-requests")
      .then((res) => res.json())
      .then((json) => {
        if (json.ok) {
          setRequests(json.data.requests);
          setStats(json.data.stats ?? { pending: 0, approved: 0, total: 0 });
          setLeaveTypes(json.data.leaveTypes);
          setCanApprove(json.data.canApprove);
        } else {
          toast.toast({ title: "Failed to load", description: json.error?.message, variant: "error" });
        }
      })
      .catch(() => toast.toast({ title: "Failed to load", description: "Network error", variant: "error" }))
      .finally(() => setLoading(false));
  }, [toast]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function decide(id: string, action: "approve" | "reject") {
    setDeciding(id + action);
    try {
      const res = await fetch(`/api/leave-requests?id=${id}&action=${action}`, { method: "PATCH" });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Action failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({
        title: action === "approve" ? "Leave request approved" : "Leave request rejected",
        description:
          action === "approve"
            ? "The employee's leave balance has been updated."
            : "The request was marked as rejected.",
        variant: action === "approve" ? "success" : "info",
      });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setDeciding(null);
    }
  }

  async function createRequest(data: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch("/api/leave-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Save failed", description: json.error?.message, variant: "error" });
        return false;
      }
      toast.toast({ title: "Leave request submitted", description: "It is now pending approval.", variant: "success" });
      await load();
      return true;
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
      return false;
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        section="Leave Management"
        layout="flat36"
        iconClassName="text-blue-600"
        sectionIcon={<Plane aria-hidden="true" />}
        title="Leave Requests"
        subtitle="Manage and approve employee leave requests"
        actions={
          <Button onClick={openNewRequest}>
            <Plus className="mr-2" aria-hidden="true" />
            New Leave Request
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        <StatCard
          label="Pending Approvals"
          value={stats.pending}
          icon={<Clock3 className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label="Approved"
          value={stats.approved}
          icon={<Check className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label="Total Requests"
          value={stats.total}
          icon={<ListChecks className="h-4 w-4" aria-hidden="true" />}
        />
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-2 border-b px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">All Leave Requests</h2>
          <span className="text-xs text-muted-foreground">{stats.total} total</span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : requests.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="h-6 w-6" aria-hidden="true" />}
            title="No leave requests"
            description="New requests will appear here for approval."
            action={
              <Button onClick={openNewRequest}>
                <Plus className="mr-2" aria-hidden="true" />
                New Leave Request
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => {
                const name = `${r.employee.firstName} ${r.employee.lastName}`.trim();
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{initials(name || r.employee.email)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{name || r.employee.email}</p>
                          <p className="truncate text-xs text-muted-foreground">{r.employee.employeeId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{r.leaveType.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(r.startDate)} — {formatDate(r.endDate)}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{r.days}</TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {r.status === "pending" && canApprove ? (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            disabled={deciding !== null}
                            onClick={() => decide(r.id, "approve")}
                          >
                            <Check aria-hidden="true" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            disabled={deciding !== null}
                            onClick={() => decide(r.id, "reject")}
                          >
                            <X aria-hidden="true" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <LeaveRequestDialog
        key={`leave-${dialogSeq}`}
        open={dialogOpen}
        leaveTypes={leaveTypes}
        saving={saving}
        onOpenChange={setDialogOpen}
        onSave={createRequest}
      />
    </div>
  );
}

function LeaveRequestDialog({
  open,
  leaveTypes,
  saving,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  leaveTypes: LeaveTypeOption[];
  saving: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (data: Record<string, unknown>) => Promise<boolean>;
}) {
  const [form, setForm] = React.useState({
    leaveTypeName: leaveTypes[0]?.name ?? "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const saved = await onSave({
      leaveTypeName: form.leaveTypeName || leaveTypes[0]?.name || "",
      startDate: form.startDate,
      endDate: form.endDate,
      reason: form.reason,
    });
    if (saved) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Leave Request</DialogTitle>
          <DialogDescription>Submit a leave request for approval.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="leave-type">Leave Type</Label>
            <Select value={form.leaveTypeName} onValueChange={(v) => setForm({ ...form, leaveTypeName: v })}>
              <SelectTrigger id="leave-type">
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((t) => (
                  <SelectItem key={t.id} value={t.name}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="leave-start">Start Date</Label>
              <Input
                id="leave-start"
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="leave-end">End Date</Label>
              <Input
                id="leave-end"
                type="date"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="leave-reason">Reason</Label>
            <Textarea
              id="leave-reason"
              rows={3}
              placeholder="Optional reason for the request"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
