"use client";

import * as React from "react";
import { Loader2, Play, Plus, SquareCheckBig, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/components/ui/toast";

interface WorkflowActionItem {
  type: string;
  delayDays: number;
  message?: string;
}

interface Workflow {
  id: string;
  name: string;
  triggerType: string;
  targetDepartment: string;
  actions: WorkflowActionItem[];
  active: boolean;
  executions: number;
  createdAt: string;
}

// Session92 (R92-D): the REF's live dialog vocabulary — the six lifecycle
// events + the four action types, live-read from the Create Automated
// Workflow dialog (768×617).
const TRIGGER_TYPES = [
  { value: "new_employee_onboarding", label: "New Employee Onboarding" },
  { value: "employee_offboarding", label: "Employee Offboarding" },
  { value: "work_anniversary", label: "Work Anniversary" },
  { value: "birthday", label: "Birthday" },
  { value: "probation_end", label: "Probation End" },
  { value: "contract_renewal", label: "Contract Renewal" },
];

const ACTION_TYPES = [
  { value: "send_email", label: "Send Email" },
  { value: "create_task", label: "Create Task" },
  { value: "send_notification", label: "Send Notification" },
  { value: "assign_template", label: "Assign Template" },
];

function triggerTypeLabel(triggerType: string) {
  return TRIGGER_TYPES.find((t) => t.value === triggerType)?.label ?? triggerType;
}

function actionTypeLabel(type: string) {
  return ACTION_TYPES.find((a) => a.value === type)?.label ?? type;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader

        /* Session 49 (R48-A3): the always-row family — REF renders the
         *  UNPREFIXED always-row (measured @1440×900 this round). */
        alwaysRow
        actionsUnwrapped
        section="Workflow Automation"
        layout="flat36"
        actionsStart
        iconClassName="text-purple-600"
        /* Session 61 (R61-S): REF's section icon is Zap (live-measured
           lucide-zap w-4 h-4 text-purple-600); the Sparkles replaced. */
        sectionIcon={<Zap aria-hidden="true" />}
        title="Automated Workflows"
        subtitle="Streamline HR processes with intelligent automation"
        actions={
          <Button variant="pink" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2" aria-hidden="true" />
            Create Workflow
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard variant="no-tile" label="Total Workflows" value={stats.total} icon={<Zap className="w-10 h-10 text-purple-500" aria-hidden="true" />} />
        <StatCard variant="no-tile" label="Active" value={stats.active} valueClassName="text-green-600" icon={<Play className="w-10 h-10 text-green-500" aria-hidden="true" />} />
        <StatCard variant="no-tile" label="Total Executions" value={stats.executions} valueClassName="text-blue-600" icon={<SquareCheckBig className="w-10 h-10 text-blue-500" aria-hidden="true" />} />
      </div>

      {/* Session 17 (R16-B): the reference renders NOTHING below the stat
         * row at 0 workflows (the employees/surveys zero-render pattern) —
         * the create affordance is the header CTA (offboarding R13-G). The
         * loading spinner stays (transient, functional). */}
      {loading ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      ) : workflows.length > 0 ? (
        /* Session 66 (R66-O): the grid renders ONLY with data — REF
           renders NOTHING below the stat row at 0 workflows (the R16-B
           zero-render pattern; the census read the empty grid's gap
           tuple REF never emits). */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {workflows.map((workflow) => {
            return (
              <div key={workflow.id} className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{workflow.name}</p>
                    <p className="text-xs text-muted-foreground">{triggerTypeLabel(workflow.triggerType)}</p>
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
                  <Badge variant="secondary">{triggerTypeLabel(workflow.triggerType)}</Badge>
                  {workflow.targetDepartment ? (
                    <Badge variant="outline">{workflow.targetDepartment}</Badge>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Then:</span>
                  {workflow.actions.map((a, i) => (
                    <Badge key={i} variant="secondary">
                      {actionTypeLabel(a.type)}
                      {a.delayDays > 0 ? ` (+${a.delayDays}d)` : ""}
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
      ) : null}

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
  // Session92 (R92-D): the REF's live dialog contract (768x617,
  // "Create Automated Workflow") — Workflow Name, Trigger Type (the six
  // lifecycle events), Target Department (Optional), and the Actions
  // builder (Action Type + Delay (days) + Email Message + Add Action).
  const [form, setForm] = React.useState({
    name: "",
    triggerType: "new_employee_onboarding",
    targetDepartment: "",
  });
  const [actions, setActions] = React.useState<WorkflowActionItem[]>([
    { type: "send_email", delayDays: 0, message: "" },
  ]);

  React.useEffect(() => {
    if (open) {
      setForm({ name: "", triggerType: "new_employee_onboarding", targetDepartment: "" });
      setActions([{ type: "send_email", delayDays: 0, message: "" }]);
    }
  }, [open]);

  function setAction(i: number, patch: Partial<WorkflowActionItem>) {
    setActions((as) => as.map((a, j) => (j === i ? { ...a, ...patch } : a)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const saved = await onSave({
      name: form.name.trim(),
      triggerType: form.triggerType,
      targetDepartment: form.targetDepartment.trim(),
      actions: actions.map((a) => ({
        type: a.type,
        delayDays: Number(a.delayDays) || 0,
        ...(a.message && a.message.trim() ? { message: a.message.trim() } : {}),
      })),
      active: true,
    });
    if (saved) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create Automated Workflow</DialogTitle>
          <DialogDescription>Automate HR processes on lifecycle events.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wf-name">Workflow Name</Label>
            <Input id="wf-name" required maxLength={120} placeholder="e.g., Welcome New Hires" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wf-trigger-type">Trigger Type</Label>
            <Select value={form.triggerType} onValueChange={(v) => setForm({ ...form, triggerType: v })}>
              <SelectTrigger id="wf-trigger-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wf-department">Target Department (Optional)</Label>
            <Input id="wf-department" maxLength={120} placeholder="Leave empty for all" value={form.targetDepartment} onChange={(e) => setForm({ ...form, targetDepartment: e.target.value })} />
          </div>

          <div className="flex flex-col gap-3">
            <Label>Actions</Label>
            {actions.map((a, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-lg border bg-secondary/30 p-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`wf-action-type-${i}`}>Action Type</Label>
                  <Select value={a.type} onValueChange={(v) => setAction(i, { type: v })}>
                    <SelectTrigger id={`wf-action-type-${i}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`wf-delay-${i}`}>Delay (days)</Label>
                  <Input
                    id={`wf-delay-${i}`}
                    type="number"
                    min={0}
                    max={365}
                    value={a.delayDays === 0 ? "" : a.delayDays}
                    onChange={(e) => setAction(i, { delayDays: Number(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`wf-message-${i}`}>Email Message</Label>
                  <Input
                    id={`wf-message-${i}`}
                    maxLength={500}
                    placeholder="Welcome to the team!"
                    value={a.message ?? ""}
                    onChange={(e) => setAction(i, { message: e.target.value })}
                  />
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" className="w-fit" onClick={() => setActions((as) => [...as, { type: "send_email", delayDays: 0, message: "" }])}>
              <Plus className="mr-2" aria-hidden="true" />
              Add Action
            </Button>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Create Workflow
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
