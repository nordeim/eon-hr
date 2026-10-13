"use client";

import * as React from "react";
import { ArrowLeft, CalendarDays, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { useToast } from "@/components/ui/toast";
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
import { cn } from "@/lib/utils";

interface SwapRow {
  id: string;
  requesterName: string;
  swapDate: string;
  notes: string | null;
  status: string;
}

interface EmployeeOption {
  id: string;
  firstName: string;
  lastName: string;
}

/**
 * The /shiftswap orphan route — parity round 31 (R31-C9).
 *
 * REF serves this page (registry: ShiftSwap — the shiftcalendar's
 * anchor target, session 13's R13-L find): the violet→blue canvas; the
 * flat36 header (h1 "Shift Swap" y=84 + the 18px sub y=136); the 4-tile
 * 82h horizontal stat row ("0 My Requests" / "0 Peer Approval Needed" /
 * "0 Manager Review" / "0 Approved"); the tab row y=315 — "My Requests"
 * violet-600 button (121px) + the "Peer Approval (0)" ghost pill
 * (154px); the 48px slate-300 ArrowLeft empty (y=437).
 * Superset: the new ShiftSwap model + /api/shiftswaps — the request
 * dialog + the status flow (pending → peer_approved → manager_review
 * → approved) with live stat counts.
 */
export default function ShiftSwapPage() {
  const toast = useToast();
  const [loading, setLoading] = React.useState(true);
  const [swaps, setSwaps] = React.useState<SwapRow[]>([]);
  const [counts, setCounts] = React.useState({ myRequests: 0, peerApproval: 0, managerReview: 0, approved: 0 });
  const [tab, setTab] = React.useState<"mine" | "peer">("mine");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [employees, setEmployees] = React.useState<EmployeeOption[]>([]);
  const [form, setForm] = React.useState({ requesterId: "", swapDate: "", notes: "" });
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [swapsRes, empRes] = await Promise.all([fetch("/api/shiftswaps"), fetch("/api/employees")]);
      const swapsJson = await swapsRes.json();
      const empJson = await empRes.json();
      if (swapsJson.ok) {
        setSwaps(swapsJson.data.swaps);
        setCounts(swapsJson.data.counts);
      } else {
        toast.toast({ title: "Failed to load swaps", description: swapsJson.error?.message, variant: "error" });
      }
      if (empJson.ok) setEmployees(empJson.data.employees);
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    if (dialogOpen && employees.length > 0 && !form.requesterId) {
      setForm((f) => ({ ...f, requesterId: employees[0].id }));
    }
  }, [dialogOpen, employees, form.requesterId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.requesterId || !form.swapDate) {
      toast.toast({ title: "Missing fields", description: "Requester and shift date are required.", variant: "error" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/shiftswaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requesterId: form.requesterId, swapDate: form.swapDate, notes: form.notes }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Could not request swap", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Swap requested", description: "Pending peer approval.", variant: "success" });
      setDialogOpen(false);
      setForm({ requesterId: employees[0]?.id ?? "", swapDate: "", notes: "" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  const visible = tab === "mine" ? swaps : swaps.filter((s) => s.status === "pending");

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right_bottom,#f5f3ff,#eff6ff)] p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHeader
          section="Shift Management"
          layout="flat36"
          iconClassName="text-violet-600"
          sectionIcon={<CalendarDays aria-hidden="true" />}
          title="Shift Swap"
          subtitle="Request, approve, and manage shift swaps"
          actions={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2" aria-hidden="true" />
              Request Swap
            </Button>
          }
        />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "My Requests", value: counts.myRequests },
            { label: "Peer Approval Needed", value: counts.peerApproval },
            { label: "Manager Review", value: counts.managerReview },
            { label: "Approved", value: counts.approved },
          ].map((s) => (
            <Card key={s.label} className="border-slate-200 shadow-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{loading ? "…" : s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* REF's tab row: the violet active pill + the ghost peer pill */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setTab("mine")}
            className={cn(
              "h-9 rounded-lg px-4 text-sm font-medium transition-colors",
              tab === "mine" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            My Requests
          </button>
          <button
            type="button"
            onClick={() => setTab("peer")}
            className={cn(
              "h-9 rounded-lg px-4 text-sm font-medium transition-colors",
              tab === "peer" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            Peer Approval ({counts.peerApproval})
          </button>
        </div>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            {loading ? (
              <div className="flex h-24 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
              </div>
            ) : visible.length === 0 ? (
              <div className="py-10 text-center">
                <div className="mb-3 flex justify-center">
                  <ArrowLeft className="h-12 w-12 text-slate-300" aria-hidden="true" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {tab === "mine" ? "No swap requests yet — request one above." : "No swaps waiting for peer approval."}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {visible.map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-1 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{s.requesterName}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(s.swapDate).toLocaleDateString()} {s.notes ? `· ${s.notes}` : ""}
                      </p>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Shift Swap</DialogTitle>
            <DialogDescription>
              Ask a teammate to cover your shift — the request starts pending peer approval.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="swap-requester">Requester</Label>
              <Select value={form.requesterId} onValueChange={(v) => setForm((f) => ({ ...f, requesterId: v }))}>
                <SelectTrigger id="swap-requester" className="w-full">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.firstName} {e.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="swap-date">Shift Date</Label>
              <Input
                id="swap-date"
                type="date"
                value={form.swapDate}
                onChange={(e) => setForm((f) => ({ ...f, swapDate: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="swap-notes">Notes (Optional)</Label>
              <Textarea
                id="swap-notes"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Anything your teammate should know"
              />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                Request Swap
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
