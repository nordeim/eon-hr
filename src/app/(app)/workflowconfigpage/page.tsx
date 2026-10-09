"use client";

import * as React from "react";
import { GitBranch, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useToast } from "@/components/ui/toast";
import { formatSar } from "@/lib/utils";

interface WorkflowRow {
  id: string;
  name: string;
  levels: number;
  appliesTo: string;
  threshold: number; // minor units
  active: boolean;
  executions: number;
  createdAt: string;
}

const APPLIES_TO = [
  { value: "leave_requests", label: "Leave Requests" },
  { value: "expenses", label: "Expenses" },
  { value: "staff_requests", label: "Staff Requests" },
];

const APPLIES_TO_LABEL: Record<string, string> = {
  leave_requests: "Leave Requests",
  expenses: "Expenses",
  staff_requests: "Staff Requests",
};

export default function WorkflowConfigPage() {
  const toast = useToast();
  const [workflows, setWorkflows] = React.useState<WorkflowRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    levels: "2",
    appliesTo: "leave_requests",
    threshold: "0",
  });

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/approval-workflows");
      const json = await res.json();
      if (json.ok) setWorkflows(json.data.workflows);
      else toast.toast({ title: "Failed to load workflows", description: json.error?.message, variant: "error" });
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function onCreate() {
    if (!form.name.trim()) {
      toast.toast({ title: "Workflow name is required", variant: "info" });
      return;
    }
    const threshold = Number(form.threshold);
    if (!Number.isFinite(threshold) || threshold < 0) {
      toast.toast({ title: "Invalid threshold", description: "Enter a non-negative SAR amount.", variant: "info" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/approval-workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          levels: Number(form.levels),
          appliesTo: form.appliesTo,
          threshold,
          active: true,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Create failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Workflow created", description: `${form.name.trim()} is now configured.`, variant: "success" });
      setDialogOpen(false);
      setForm({ name: "", levels: "2", appliesTo: "leave_requests", threshold: "0" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function patchWorkflow(id: string, patch: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/approval-workflows?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Update failed", description: json.error?.message, variant: "error" });
        await load();
        return;
      }
      setWorkflows((prev) =>
        prev.map((w) => {
          if (w.id !== id) return w;
          const { threshold, ...rest } = patch as { threshold?: number } & Record<string, unknown>;
          const next: WorkflowRow = { ...w, ...(rest as Partial<WorkflowRow>) };
          if (threshold !== undefined && Number.isFinite(threshold)) {
            // patch carries SAR; the row stores minor units
            next.threshold = Math.round(threshold * 100);
          }
          return next;
        })
      );
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  async function onDelete(w: WorkflowRow) {
    if (!window.confirm(`Delete workflow "${w.name}"?`)) return;
    try {
      const res = await fetch(`/api/approval-workflows?id=${w.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Delete failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Workflow deleted", variant: "success" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader
        title="Approval Workflow Engine"
        subtitle="Configure multi-level approval hierarchies for requests and expenses"
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus aria-hidden="true" />
            New Workflow
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      ) : workflows.length === 0 ? (
        <div className="rounded-xl border bg-card shadow-sm">
          <EmptyState
            icon={<GitBranch className="h-6 w-6" aria-hidden="true" />}
            title="No workflows configured yet."
            description="Create an approval chain for leave requests, expenses or staff requests."
            action={
              <Button onClick={() => setDialogOpen(true)}>
                <Plus aria-hidden="true" />
                Create First Workflow
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {workflows.map((w) => (
            <Card key={w.id}>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div className="min-w-0">
                  <CardTitle className="truncate">{w.name}</CardTitle>
                  <CardDescription>
                    {APPLIES_TO_LABEL[w.appliesTo] ?? w.appliesTo} · approval above {formatSar(w.threshold)}
                  </CardDescription>
                </div>
                <StatusBadge status={w.active ? "active" : "inactive"} />
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`levels-${w.id}`}>Approval Levels</Label>
                    <Select
                      value={String(w.levels)}
                      onValueChange={(v) => void patchWorkflow(w.id, { levels: Number(v) })}
                    >
                      <SelectTrigger id={`levels-${w.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 level</SelectItem>
                        <SelectItem value="2">2 levels</SelectItem>
                        <SelectItem value="3">3 levels</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`applies-${w.id}`}>Applies To</Label>
                    <Select
                      value={w.appliesTo}
                      onValueChange={(v) => void patchWorkflow(w.id, { appliesTo: v })}
                    >
                      <SelectTrigger id={`applies-${w.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {APPLIES_TO.map((a) => (
                          <SelectItem key={a.value} value={a.value}>
                            {a.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`threshold-${w.id}`}>Approver Threshold (SAR)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={`threshold-${w.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={String(w.threshold / 100)}
                      onBlur={(e) => {
                        const value = Number(e.target.value);
                        if (Number.isFinite(value) && value >= 0 && Math.round(value * 100) !== w.threshold) {
                          void patchWorkflow(w.id, { threshold: value });
                        }
                      }}
                      className="w-36"
                    />
                    <span className="text-sm text-muted-foreground">
                      Currently {formatSar(w.threshold)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 border-t pt-3">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={w.active}
                      onCheckedChange={(v) => void patchWorkflow(w.id, { active: v })}
                      aria-label={`Toggle ${w.name}`}
                    />
                    <span className="text-sm text-muted-foreground">
                      {w.active ? "Active" : "Inactive"} · {w.executions} executions
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="iconSm"
                    aria-label={`Delete ${w.name}`}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => onDelete(w)}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Workflow</DialogTitle>
            <DialogDescription>Define an approval chain and when it applies.</DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void onCreate();
            }}
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wf-name">Workflow Name</Label>
              <Input
                id="wf-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Two-step leave approval"
                maxLength={120}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="wf-levels">Approval Levels</Label>
                <Select value={form.levels} onValueChange={(v) => setForm({ ...form, levels: v })}>
                  <SelectTrigger id="wf-levels">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 level</SelectItem>
                    <SelectItem value="2">2 levels</SelectItem>
                    <SelectItem value="3">3 levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="wf-applies">Applies To</Label>
                <Select value={form.appliesTo} onValueChange={(v) => setForm({ ...form, appliesTo: v })}>
                  <SelectTrigger id="wf-applies">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPLIES_TO.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wf-threshold">Approver Threshold (SAR)</Label>
              <Input
                id="wf-threshold"
                type="number"
                min="0"
                step="0.01"
                value={form.threshold}
                onChange={(e) => setForm({ ...form, threshold: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Requests above this amount require the full approval chain.
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus aria-hidden="true" />}
                Create Workflow
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
