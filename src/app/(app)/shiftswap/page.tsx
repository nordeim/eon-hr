"use client";

import * as React from "react";
import { ArrowLeftRight, CircleCheckBig, Clock, Loader2, Plus, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
 * The /shiftswap page — parity rounds 31 + 33.
 *
 * Round 31 delivered the structure (registry: ShiftSwap — the
 * shiftcalendar's anchor target): the violet→blue canvas; the flat36
 * header (h1 "Shift Swap" y=84 + the 18px sub y=136); the 4-tile 82h
 * stat row; the tab row y=315 — "My Requests" violet-600 + the "Peer
 * Approval (N)" ghost; the 48px slate-300 ArrowLeft empty.
 *
 * Round 33 (R33-D): the at-rest census found round-31's wiring had
 * added a "Request Swap" header button REF does not render (REF's
 * at-rest carries exactly two buttons — the tab pills) and a
 * tab-dependent empty line; REF ships "No swap requests in this
 * category" (text-slate-500) on BOTH tabs. The button is gone; the
 * superset's entry is now the invisible-at-rest "n" keyboard shortcut
 * (the Gmail/Linear pattern — no at-rest chrome; the round-32
 * interaction-state doctrine), and the /api/shiftswaps CRUD + status
 * flow are unchanged.
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

  /* The superset's invisible entry: "n" opens the request dialog (the
     at-rest DOM stays REF-identical — no button, no extra chrome). */
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "n" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      setDialogOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader
        rowBreakpoint="md"
          section="Shift Management"
          layout="flat36"
          iconClassName="text-violet-600"
          sectionIcon={<ArrowLeftRight aria-hidden="true" />}
          title="Shift Swap"
          subtitle="Request, approve, and manage shift swaps"
        />

        {/* Session 50 (R49-B1): REF's stat cards — the PLAIN Card (no
            border-slate-200/shadow-sm) with the INLINE icon family
            before each P/P pair (users blue-600, clock yellow-600,
            calendar orange-600, circle-check-big green-600, all
            w-5 h-5 — live-measured this round). */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "My Requests", value: counts.myRequests, icon: <Users className="w-5 h-5 text-blue-600" aria-hidden="true" /> },
            { label: "Peer Approval Needed", value: counts.peerApproval, icon: <Clock className="w-5 h-5 text-yellow-600" aria-hidden="true" /> },
            { label: "Manager Review", value: counts.managerReview, icon: <Calendar className="w-5 h-5 text-orange-600" aria-hidden="true" /> },
            { label: "Approved", value: counts.approved, icon: <CircleCheckBig className="w-5 h-5 text-green-600" aria-hidden="true" /> },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                {s.icon}
                <div>
                  <p className="text-2xl font-bold text-slate-900">{loading ? "…" : s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* REF's tab row (round 33 re-measure): the pills sit in a
            `flex gap-1 bg-white border border-slate-200 p-1 rounded-xl`
            container (the pill lands x=293 y=315). */}
        <div className="flex gap-1 bg-white border border-slate-200 p-1 rounded-xl w-fit">
          {/* Session 50 (R49-B2): REF's pill form — py-2 (not h-9) +
              hover:bg-slate-50 (live-measured). */}
          <button
            type="button"
            onClick={() => setTab("mine")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              tab === "mine" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            My Requests
          </button>
          <button
            type="button"
            onClick={() => setTab("peer")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              tab === "peer" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            Peer Approval ({counts.peerApproval})
          </button>
        </div>

        {/* Session 50 (R49-B3): REF's empty card — the PLAIN Card, the
            p-12 text-center interior, the arrow-left-right glyph DIRECT
            (w-12 h-12 mx-auto mb-3 text-slate-300), and the mt-less
            slate-500 line (live-measured). */}
        <Card>
          <CardContent className="p-12 text-center">
            {loading ? (
              <div className="flex h-24 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
              </div>
            ) : visible.length === 0 ? (
              <>
                <ArrowLeftRight className="w-12 h-12 mx-auto mb-3 text-slate-300" aria-hidden="true" />
                <p className="text-slate-500">No swap requests in this category</p>
              </>
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
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
