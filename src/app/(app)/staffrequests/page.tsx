"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, FileText, Loader2, Play, Plus, Reply, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { cn, timeAgo } from "@/lib/utils";

interface StaffRequest {
  id: string;
  category: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  response: string | null;
  createdAt: string;
  updatedAt: string;
  requesterName: string;
  mine: boolean;
}

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "general", label: "General" },
  { value: "it", label: "IT" },
  { value: "hr", label: "HR" },
  { value: "facilities", label: "Facilities" },
  { value: "finance", label: "Finance" },
  { value: "admin", label: "Admin" },
];

const STATUSES = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

const PRIORITIES = ["low", "medium", "high", "urgent"];

function categoryLabel(v: string): string {
  return CATEGORIES.find((c) => c.value === v)?.label ?? v.replace(/_/g, " ").toUpperCase();
}

export default function StaffRequestsPage() {
  const toast = useToast();
  const params = useSearchParams();
  const [requests, setRequests] = React.useState<StaffRequest[]>([]);
  const [mineCount, setMineCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [scope, setScope] = React.useState<"all" | "mine">("all");
  const [category, setCategory] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [busy, setBusy] = React.useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  /** Session 11 (R10-P): the reference's search input (flex-1, 16px icon
   *  at left-3 top-2.5) — ours filters the loaded list client-side. */
  const [query, setQuery] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [responding, setResponding] = React.useState<StaffRequest | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (scope === "mine") qs.set("scope", "mine");
      if (category !== "all") qs.set("category", category);
      if (status !== "all") qs.set("status", status);
      const res = await fetch(`/api/staff-requests?${qs}`);
      const json = await res.json();
      if (json.ok) {
        setRequests(json.data.requests);
        setMineCount(json.data.mineCount);
      } else {
        toast.toast({ title: "Failed to load requests", description: json.error?.message, variant: "error" });
      }
    } catch {
      toast.toast({ title: "Network error", description: "Could not load staff requests.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [scope, category, status, toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    if (params.get("new") === "1") setDialogOpen(true);
  }, [params]);

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q) ||
        r.requesterName.toLowerCase().includes(q)
    );
  }, [requests, query]);

  async function onSubmitRequest(data: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch("/api/staff-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Submit failed", description: json.error?.message, variant: "error" });
        return false;
      }
      toast.toast({
        title: "Request submitted",
        description: `${String(data.title)} was sent to the ${String(data.category).toUpperCase()} team.`,
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

  async function onStart(request: StaffRequest) {
    setBusy(request.id + "in_progress");
    try {
      const res = await fetch(`/api/staff-requests?id=${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in_progress", response: `Started working on "${request.title}".` }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Update failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Request in progress", variant: "success" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setBusy(null);
    }
  }

  async function onRespond(request: StaffRequest, respondStatus: "resolved" | "rejected", response: string) {
    setBusy(request.id + respondStatus);
    try {
      const res = await fetch(`/api/staff-requests?id=${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: respondStatus, response }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Update failed", description: json.error?.message, variant: "error" });
        return false;
      }
      toast.toast({
        title: respondStatus === "resolved" ? "Request resolved" : "Request rejected",
        description: `${request.requesterName} will see your response.`,
        variant: respondStatus === "resolved" ? "success" : "info",
      });
      setResponding(null);
      await load();
      return true;
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
      return false;
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
      <PageHeader
        size="md"
        title="Staff Requests"
        subtitle="Submit and manage requests across departments"
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2" aria-hidden="true" />
            New Request
          </Button>
        }
      />

      {/* Session 11 (R10-P): the reference's filter furniture — a BARE
          `flex flex-wrap gap-3` row (search input flex-1 min-w-[200px]
          with the 16px icon at left-3 top-2.5 + All Categories 160px +
          All Status 144px at y=112), then the segmented `My Requests (N)`
          toggle (`inline-flex h-9 items-center justify-center rounded-lg
          bg-muted p-1`, trigger h-7 137px), then the card (mt-2) with the
          py-16 empty state (48px FileText icon + one slate-500 line + the
          207x36 CTA — measured y=280/340/380). */}
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            aria-label="Search requests"
            placeholder="Search requests…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-40" aria-label="Filter by category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-36" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col">
      <div className="inline-flex h-9 self-start items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
        <button
          type="button"
          aria-pressed={scope === "mine"}
          onClick={() => setScope(scope === "mine" ? "all" : "mine")}
          className={cn(
            "inline-flex h-7 items-center justify-center whitespace-nowrap rounded-md px-4 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            scope === "mine" ? "bg-background text-foreground shadow" : "hover:text-foreground"
          )}
        >
          My Requests ({mineCount})
        </button>
      </div>

      <Card className="mt-2">
        <CardContent className="p-0">
          {/* the card rides mt-2 under the toggle (8px, measured 208→216) */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          ) : visible.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="mx-auto mb-3 h-12 w-12 text-slate-400" aria-hidden="true" />
              <p className="text-slate-500">No requests found</p>
              <div className="mt-4">
                <Button variant="dark" onClick={() => setDialogOpen(true)}>
                  Submit your first request
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="max-w-[320px]">
                      <div className="flex flex-col gap-1">
                        <p className="font-medium text-foreground">
                          {request.title}
                          {!request.mine ? (
                            <span className="ml-2 text-xs font-normal text-muted-foreground">by {request.requesterName}</span>
                          ) : null}
                        </p>
                        {request.description ? (
                          <p className="truncate text-xs text-muted-foreground">{request.description}</p>
                        ) : null}
                        {request.response ? (
                          <p className="flex items-start gap-1.5 rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground">
                            <Reply className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            {request.response}
                          </p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{categoryLabel(request.category)}</Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={request.priority} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{timeAgo(request.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {request.status === "pending" ? (
                          <Button
                            size="iconSm"
                            variant="ghost"
                            aria-label={`Start ${request.title}`}
                            disabled={busy === request.id + "in_progress"}
                            onClick={() => onStart(request)}
                          >
                            {busy === request.id + "in_progress" ? (
                              <Loader2 className="animate-spin" aria-hidden="true" />
                            ) : (
                              <Play aria-hidden="true" />
                            )}
                          </Button>
                        ) : null}
                        {request.status === "pending" || request.status === "in_progress" ? (
                          <>
                            <Button
                              size="iconSm"
                              variant="ghost"
                              className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                              aria-label={`Resolve ${request.title}`}
                              disabled={busy === request.id + "resolved"}
                              onClick={() => setResponding(request)}
                            >
                              {busy === request.id + "resolved" ? (
                                <Loader2 className="animate-spin" aria-hidden="true" />
                              ) : (
                                <CheckCircle2 aria-hidden="true" />
                              )}
                            </Button>
                            <Button
                              size="iconSm"
                              variant="ghost"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              aria-label={`Reject ${request.title}`}
                              disabled={busy === request.id + "rejected"}
                              onClick={() => setResponding(request)}
                            >
                              {busy === request.id + "rejected" ? (
                                <Loader2 className="animate-spin" aria-hidden="true" />
                              ) : (
                                <X aria-hidden="true" />
                              )}
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      </div>

      <NewRequestDialog open={dialogOpen} saving={saving} onOpenChange={setDialogOpen} onSave={onSubmitRequest} />

      <RespondDialog
        request={responding}
        busy={busy}
        onClose={() => setResponding(null)}
        onRespond={onRespond}
      />
    </div>
  );
}

function NewRequestDialog({
  open,
  saving,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  saving: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (data: Record<string, unknown>) => Promise<boolean>;
}) {
  const [form, setForm] = React.useState({
    title: "",
    category: "general",
    priority: "medium",
    description: "",
  });

  React.useEffect(() => {
    if (open) setForm({ title: "", category: "general", priority: "medium", description: "" });
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const saved = await onSave({
      title: form.title.trim(),
      category: form.category,
      priority: form.priority,
      description: form.description.trim(),
    });
    if (saved) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Request</DialogTitle>
          <DialogDescription>Submit a request to the relevant department.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="req-title">Title</Label>
            <Input id="req-title" required maxLength={140} placeholder="e.g. Laptop upgrade for design work" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="req-category">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger id="req-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter((c) => c.value !== "all").map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="req-priority">Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger id="req-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="req-desc">Description</Label>
            <Textarea id="req-desc" maxLength={2000} rows={4} placeholder="Add any details that help us act on this request" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RespondDialog({
  request,
  busy,
  onClose,
  onRespond,
}: {
  request: StaffRequest | null;
  busy: string | null;
  onClose: () => void;
  onRespond: (request: StaffRequest, status: "resolved" | "rejected", response: string) => Promise<boolean>;
}) {
  const [response, setResponse] = React.useState("");
  const [mode, setMode] = React.useState<"resolved" | "rejected">("resolved");

  React.useEffect(() => {
    if (request) {
      setResponse("");
      setMode("resolved");
    }
  }, [request]);

  return (
    <Dialog open={request !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Respond to Request</DialogTitle>
          <DialogDescription>{request ? `Responding to "${request.title}" by ${request.requesterName}.` : ""}</DialogDescription>
        </DialogHeader>
        {request ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void onRespond(request, mode, response.trim());
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label>Decision</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={mode === "resolved" ? "default" : "outline"}
                  onClick={() => setMode("resolved")}
                  aria-pressed={mode === "resolved"}
                >
                  <CheckCircle2 aria-hidden="true" />
                  Resolve
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={mode === "rejected" ? "destructive" : "outline"}
                  onClick={() => setMode("rejected")}
                  aria-pressed={mode === "rejected"}
                >
                  <X aria-hidden="true" />
                  Reject
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="req-response">Response message</Label>
              <Textarea
                id="req-response"
                required
                maxLength={2000}
                rows={3}
                placeholder={
                  mode === "resolved"
                    ? "e.g. Approved — new hardware arrives Monday"
                    : "e.g. Outside the budget for this quarter"
                }
                value={response}
                onChange={(e) => setResponse(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant={mode === "rejected" ? "destructive" : "default"} disabled={busy === request.id + mode || response.trim().length === 0}>
                {busy === request.id + mode ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
                {mode === "resolved" ? "Resolve Request" : "Reject Request"}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
