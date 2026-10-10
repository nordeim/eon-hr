"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Loader2, CalendarDays, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

interface LeaveRequestRow {
  id: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string | null;
  status: string;
  createdAt: string;
  leaveType: { id: string; name: string };
}

interface LeaveTypeOption {
  id: string;
  name: string;
  quotaDays: number;
  color: string;
}

interface LeaveBalanceRow {
  leaveTypeId: string;
  name: string;
  color: string;
  entitled: number;
  used: number;
}

export default function LeaveManagementPage() {
  const toast = useToast();
  const params = useSearchParams();
  const [requests, setRequests] = React.useState<LeaveRequestRow[]>([]);
  const [balances, setBalances] = React.useState<LeaveBalanceRow[]>([]);
  const [leaveTypes, setLeaveTypes] = React.useState<LeaveTypeOption[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [dialogOpen, setDialogOpen] = React.useState(() => params.get("new") === "1");
  const [dialogSeq, setDialogSeq] = React.useState(0);
  const [saving, setSaving] = React.useState(false);

  function openNewRequest() {
    setDialogSeq((s) => s + 1);
    setDialogOpen(true);
  }

  const load = React.useCallback(() => {
    fetch("/api/leave-requests?scope=mine")
      .then((res) => res.json())
      .then((json) => {
        if (json.ok) {
          setRequests(json.data.requests);
          setBalances(json.data.balances);
          setLeaveTypes(json.data.leaveTypes);
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
    <div className="min-h-screen bg-[linear-gradient(to_right_bottom,#f8fafc,#eff6ff)] p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      {/* Reference header: "Leave Management" kicker + "Leave Requests"
          title + "Request time off and manage approvals" subtitle. */}
      <PageHeader
        section="Leave Management"
        mobileKicker
        mobileHeader="hidden"
        layout="raised-48"
        iconClassName="text-blue-600"
        sectionIcon={<Plane aria-hidden="true" />}
        title="Leave Requests"
        subtitle="Request time off and manage approvals"
        actions={
          <Button onClick={openNewRequest}>
            <Plus className="mr-2" aria-hidden="true" />
            New Leave Request
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      ) : (
        <Card className="border-slate-200">
          {/* Session 12 (R11-F): border-b DIV-title CardHeader ("My Leave
              Requests", 65px) + CardContent p-6 wrapping the reference's
              text-center py-12 single-P empty (64px Plane icon + one line,
              no h3, no action, no count badge). */}
          <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-200">
            <div className="font-semibold leading-none tracking-tight">My Leave Requests</div>
          </div>
          <CardContent className="p-6">
            {requests.length === 0 ? (
              <div className="text-center py-12">
                {/* Reference empty state: Plane icon (w-16 h-16 mx-auto
                    mb-4 text-slate-300 as a DIRECT child) + one line, no
                    CTA button inside the card. */}
                <Plane className="mx-auto mb-4 h-16 w-16 text-slate-300" aria-hidden="true" />
                <p className="text-slate-500">No leave requests yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium text-foreground">{r.leaveType.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(r.startDate)} — {formatDate(r.endDate)}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{r.days}</TableCell>
                      <TableCell className="max-w-56 truncate text-muted-foreground">
                        {r.reason ?? "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      <NewLeaveRequestDialog
        key={`new-leave-${dialogSeq}`}
        open={dialogOpen}
        leaveTypes={leaveTypes}
        saving={saving}
        onOpenChange={setDialogOpen}
        onSave={createRequest}
      />
    </div>
    </div>
  );
}

function NewLeaveRequestDialog({
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
  const [form, setForm] = React.useState(() => ({
    leaveTypeName: leaveTypes[0]?.name ?? "",
    startDate: "",
    endDate: "",
    reason: "",
  }));

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
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
            New Leave Request
          </DialogTitle>
          <DialogDescription>Submit a leave request for approval.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="my-leave-type">Leave Type</Label>
            <Select value={form.leaveTypeName} onValueChange={(v) => setForm({ ...form, leaveTypeName: v })}>
              <SelectTrigger id="my-leave-type">
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
              <Label htmlFor="my-leave-start">Start Date</Label>
              <Input
                id="my-leave-start"
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="my-leave-end">End Date</Label>
              <Input
                id="my-leave-end"
                type="date"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="my-leave-reason">Reason</Label>
            <Textarea
              id="my-leave-reason"
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
