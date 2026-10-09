"use client";

import * as React from "react";
import { ListChecks, Loader2, Play, Plus, Sparkles, Trash2, Workflow as WorkflowIcon, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { useToast } from "@/components/ui/toast";

interface Workflow {
  id: string;
  name: string;
  module: string;
  trigger: string;
  conditions: string[];
  actions: string[];
  active: boolean;
  executions: number;
  createdAt: string;
}

const MODULES = [
  { value: "general", label: "General", variant: "secondary" as const },
  { value: "leave", label: "Leave", variant: "info" as const },
  { value: "expense", label: "Expense", variant: "warning" as const },
  { value: "recruitment", label: "Recruitment", variant: "purple" as const },
];

const TRIGGERS = [
  { value: "manual", label: "Manual trigger" },
  { value: "on_create", label: "When a record is created" },
  { value: "on_status_change", label: "When a status changes" },
  { value: "scheduled", label: "On a schedule" },
];

function moduleBadge(module: string) {
  const found = MODULES.find((m) => m.value === module);
  return { label: found?.label ?? module, variant: found?.variant ?? ("secondary" as const) };
}

function triggerLabel(trigger: string): string {
  return TRIGGERS.find((t) => t.value === trigger)?.label ?? trigger;
}

export default function WorkflowAutomationPage() {
  const toast = useToast();
  const [workflows, setWorkflows] = React.useState<Workflow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/workflows");
      const json = await res.json();
      if (json.ok) setWorkflows(json.data.workflows);
      else toast.toast({ title: "Failed to load workflows", description: json.error?.message, variant: "error" });
    } catch {
      toast.toast({ title: "Network error", description: "Could not load workflows.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(data: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Failed to create workflow", description: json.error?.message, variant: "error" });
        return false;
      }
      toast.toast({ title: "Workflow created", description: "Your automation is ready to run.", variant: "success" });
      await load();
      return true;
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function onToggleActive(workflow: Workflow, active: boolean) {
    setWorkflows((prev) => prev.map((w) => (w.id === workflow.id ? { ...w, active } : w)));
    setBusy(workflow.id + "toggle");
    try {
      const res = await fetch(`/api/workflows?id=${workflow.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Toggle failed", description: json.error?.message, variant: "error" });
        await load();
        return;
      }
      toast.toast({
        title: active ? "Workflow activated" : "Workflow deactivated",
        description: `${workflow.name} is now ${active ? "live" : "paused"}.`,
        variant: "success",
      });
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
      await load();
    } finally {
      setBusy(null);
    }
  }

  async function onRun(workflow: Workflow) {
    setBusy(workflow.id + "run");
    try {
      const res = await fetch(`/api/workflows/run?id=${workflow.id}`, { method: "POST" });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Run failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({
        title: "Workflow executed",
        description: `"${workflow.name}" completed — ${json.data.executions} total run(s).`,
        variant: "success",
      });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setBusy(null);
    }
  }

  async function onDelete(workflow: Workflow) {
    if (!window.confirm(`Delete workflow "${workflow.name}"? This cannot be undone.`)) return;
    setBusy(workflow.id + "delete");
    try {
      const res = await fetch(`/api/workflows?id=${workflow.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Delete failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Workflow deleted", variant: "success" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setBusy(null);
    }
  }

  const stats = React.useMemo(
    () => ({
      total: workflows.length,
      active: workflows.filter((w) => w.active).length,
      executions: workflows.reduce((n, w) => n + w.executions, 0),
    }),
    [workflows]
  );

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right_bottom,#f8fafc,#faf5ff)] p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        section="Workflow Automation"
        layout="flat36"
        iconClassName="text-purple-600"
        sectionIcon={<Sparkles aria-hidden="true" />}
        title="Automated Workflows"
        subtitle="Streamline HR processes with intelligent automation"
        actions={
          <Button variant="pink" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2" aria-hidden="true" />
            Create Workflow
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        <StatCard label="Total Workflows" value={stats.total} icon={<WorkflowIcon className="h-4 w-4" />} />
        <StatCard label="Active" value={stats.active} icon={<Zap className="h-4 w-4" />} iconClassName="bg-emerald-100 text-emerald-600" />
        <StatCard label="Total Executions" value={stats.executions} icon={<ListChecks className="h-4 w-4" />} iconClassName="bg-blue-100 text-blue-600" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      ) : workflows.length === 0 ? (
        <div className="rounded-xl border bg-card shadow-sm">
          <EmptyState
            icon={<WorkflowIcon className="h-6 w-6" />}
            title="No workflows yet"
            description="Create your first workflow to automate HR processes"
            action={
              <Button variant="dark" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2" aria-hidden="true" />
                Create Workflow
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {workflows.map((workflow) => {
            const mod = moduleBadge(workflow.module);
            return (
              <div key={workflow.id} className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{workflow.name}</p>
                    <p className="text-xs text-muted-foreground">{triggerLabel(workflow.trigger)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Switch
                      checked={workflow.active}
                      onCheckedChange={(checked: boolean) => onToggleActive(workflow, checked)}
                      aria-label={`Toggle ${workflow.name}`}
                      disabled={busy === workflow.id + "toggle"}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={mod.variant}>{mod.label}</Badge>
                  {workflow.conditions.map((c) => (
                    <Badge key={c} variant="outline">
                      {c}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Then:</span>
                  {workflow.actions.map((a) => (
                    <Badge key={a} variant="secondary">
                      {a}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-2 border-t pt-3">
                  <span className="text-xs text-muted-foreground">
                    {workflow.executions} execution{workflow.executions === 1 ? "" : "s"}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="outline" disabled={busy === workflow.id + "run"} onClick={() => onRun(workflow)}>
                      {busy === workflow.id + "run" ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Play aria-hidden="true" />}
                      Run
                    </Button>
                    <Button
                      size="iconSm"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      aria-label={`Delete ${workflow.name}`}
                      disabled={busy === workflow.id + "delete"}
                      onClick={() => onDelete(workflow)}
                    >
                      {busy === workflow.id + "delete" ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Trash2 aria-hidden="true" />}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <NewWorkflowDialog open={dialogOpen} saving={saving} onOpenChange={setDialogOpen} onSave={onCreate} />
    </div>
    </div>
  );
}

function NewWorkflowDialog({
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
    name: "",
    module: "general",
    trigger: "manual",
    conditions: "",
    actions: "",
    active: false,
  });

  React.useEffect(() => {
    if (open) {
      setForm({ name: "", module: "general", trigger: "manual", conditions: "", actions: "", active: false });
    }
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const conditions = form.conditions
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const actions = form.actions
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    const saved = await onSave({ name: form.name.trim(), module: form.module, trigger: form.trigger, conditions, actions, active: form.active });
    if (saved) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Workflow</DialogTitle>
          <DialogDescription>Define a trigger, conditions and automated actions.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wf-name">Workflow Name</Label>
            <Input id="wf-name" required maxLength={120} placeholder="e.g. Auto-approve small expenses" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wf-module">Module</Label>
              <Select value={form.module} onValueChange={(v) => setForm({ ...form, module: v })}>
                <SelectTrigger id="wf-module">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODULES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wf-trigger">Trigger</Label>
              <Select value={form.trigger} onValueChange={(v) => setForm({ ...form, trigger: v })}>
                <SelectTrigger id="wf-trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGERS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wf-conditions">Conditions (comma-separated)</Label>
            <Textarea
              id="wf-conditions"
              rows={2}
              placeholder="e.g. amount &lt; 500 SAR, department is Sales"
              value={form.conditions}
              onChange={(e) => setForm({ ...form, conditions: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wf-actions">Actions (comma-separated)</Label>
            <Textarea
              id="wf-actions"
              rows={2}
              placeholder="e.g. notify finance, flag for audit"
              value={form.actions}
              onChange={(e) => setForm({ ...form, actions: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border bg-secondary/30 p-3">
            <div>
              <Label htmlFor="wf-active">Activate immediately</Label>
              <p className="text-xs text-muted-foreground">Inactive workflows only run manually.</p>
            </div>
            <Switch id="wf-active" checked={form.active} onCheckedChange={(checked: boolean) => setForm({ ...form, active: checked })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              Create Workflow
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
