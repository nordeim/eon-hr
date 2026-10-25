"use client";

import * as React from "react";
import { ArrowLeft, Loader2, Plus, Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
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

/* Session 93 (R93-C): the REF's workflowconfigpage editor — live-read
 * 2026-10-25. Applies To offers exactly TWO (Staff Requests / Expense
 * Claims); the Approver Type combobox offers the REF's SIX (its own
 * entity list + the four approver kinds). */
const EDITOR_APPLIES_TO = [
  { value: "staff_requests", label: "Staff Requests" },
  { value: "expense_claims", label: "Expense Claims" },
];

const APPROVER_TYPES = [
  "Staff Requests",
  "Expense Claims",
  "Specific User(s)",
  "Department Head",
  "Direct Manager",
  "Any Admin",
] as const;

interface EditorLevel {
  name: string;
  approverType: string;
  approverEmails: string;
  autoApproveHours: string;
}

const BLANK_LEVEL: EditorLevel = { name: "", approverType: "Specific User(s)", approverEmails: "", autoApproveHours: "0" };

export default function WorkflowConfigPage() {
  const toast = useToast();
  const [workflows, setWorkflows] = React.useState<WorkflowRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  /* Session 93 (R93-C): the REF's New Workflow opens a FULL-PAGE EDITOR
   * (the list swaps away — the employees wizard pattern), not a dialog. */
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    appliesTo: "staff_requests",
    active: true,
    minAmount: "",
    maxAmount: "",
    categories: "",
  });
  const [levels, setLevels] = React.useState<EditorLevel[]>([
    { name: "Line Manager", approverType: "Direct Manager", approverEmails: "", autoApproveHours: "0" },
  ]);

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

  function setLevel(i: number, patch: Partial<EditorLevel>) {
    setLevels((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  async function onSaveWorkflow() {
    if (!form.name.trim()) {
      toast.toast({ title: "Workflow name is required", variant: "info" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/approval-workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          appliesTo: form.appliesTo,
          active: form.active,
          ...(form.minAmount.trim() !== "" ? { minAmount: Number(form.minAmount) } : {}),
          ...(form.maxAmount.trim() !== "" ? { maxAmount: Number(form.maxAmount) } : {}),
          categories: form.categories.trim(),
          levels: levels.map((l) => ({
            name: l.name.trim(),
            approverType: l.approverType,
            approverEmails: l.approverEmails.trim(),
            ...(l.autoApproveHours.trim() !== "" ? { autoApproveHours: Number(l.autoApproveHours) } : {}),
          })),
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Create failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Workflow created", description: `${form.name.trim()} is now configured.`, variant: "success" });
      setEditorOpen(false);
      setForm({ name: "", appliesTo: "staff_requests", active: true, minAmount: "", maxAmount: "", categories: "" });
      setLevels([{ name: "Line Manager", approverType: "Direct Manager", approverEmails: "", autoApproveHours: "0" }]);
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

  // ---------------- the editor view (the REF's full-page New Workflow) ----------------
  if (editorOpen) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Back to workflows"
            onClick={() => setEditorOpen(false)}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <h1 className="text-2xl font-semibold text-foreground">New Workflow</h1>
        </div>

        {/* the base contract: name + applies-to + the active switch, then
            the amount window + categories (the REF's live geometry:
            2-col rows at y=109/142, then 248/324). */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="wf-name">Workflow Name</Label>
            <Input
              id="wf-name"
              placeholder="e.g. Finance Approval"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wf-applies">Applies To</Label>
            <Select value={form.appliesTo} onValueChange={(v) => setForm({ ...form, appliesTo: v })}>
              <SelectTrigger id="wf-applies">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EDITOR_APPLIES_TO.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-6">
          <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} id="wf-active" />
          <Label htmlFor="wf-active">Active</Label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="wf-min">Min Amount (SAR)</Label>
            <Input
              id="wf-min"
              type="number"
              min="0"
              placeholder="e.g. 500"
              value={form.minAmount}
              onChange={(e) => setForm({ ...form, minAmount: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wf-max">Max Amount (SAR)</Label>
            <Input
              id="wf-max"
              type="number"
              min="0"
              placeholder="e.g. 10000"
              value={form.maxAmount}
              onChange={(e) => setForm({ ...form, maxAmount: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2 mt-6">
          <Label htmlFor="wf-categories">Categories (comma separated, blank = all)</Label>
          <Input
            id="wf-categories"
            placeholder="finance, hr, it"
            value={form.categories}
            onChange={(e) => setForm({ ...form, categories: e.target.value })}
          />
        </div>

        {/* the levels builder — the REF's bordered sub-cards: the blue
            numbered circle + the name input (w-48) + the trash button; the
            level grid carries Approver Type + Auto-approve (+ the
            Approver Emails field for the Specific User(s) type). */}
        <div className="space-y-4 mt-8">
          {levels.map((level, i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </div>
                  <input
                    className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-48"
                    placeholder="Level name (e.g. Line Manager)"
                    aria-label={`Level ${i + 1} name`}
                    value={level.name}
                    onChange={(e) => setLevel(i, { name: e.target.value })}
                  />
                </div>
                {levels.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 w-9 text-red-400 hover:text-red-600"
                    aria-label={`Remove level ${i + 1}`}
                    onClick={() => setLevels((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                ) : null}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-500">Approver Type</Label>
                  <Select value={level.approverType} onValueChange={(v) => setLevel(i, { approverType: v })}>
                    <SelectTrigger className="mt-1" aria-label={`Level ${i + 1} approver type`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {APPROVER_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {level.approverType === "Specific User(s)" ? (
                  <div>
                    <Label className="text-xs text-slate-500">Approver Emails (comma separated)</Label>
                    <input
                      className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      placeholder="email1@company.com, email2@company.com"
                      aria-label={`Level ${i + 1} approver emails`}
                      value={level.approverEmails}
                      onChange={(e) => setLevel(i, { approverEmails: e.target.value })}
                    />
                  </div>
                ) : null}
                <div>
                  <Label className="text-xs text-slate-500">Auto-approve after (hours, 0 = disabled)</Label>
                  <input
                    type="number"
                    min="0"
                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    aria-label={`Level ${i + 1} auto-approve hours`}
                    value={level.autoApproveHours}
                    onChange={(e) => setLevel(i, { autoApproveHours: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => setLevels((prev) => [...prev, { ...BLANK_LEVEL }])}>
            <Plus className="mr-2" aria-hidden="true" />
            Add Level
          </Button>
        </div>

        <div className="flex justify-end gap-2 mt-8">
          <Button type="button" variant="outline" onClick={() => setEditorOpen(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={saving} onClick={() => void onSaveWorkflow()}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            Save Workflow
          </Button>
        </div>
      </div>
    );
  }

  // ---------------- the list view (the standing card-list superset) ----------------
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        actionsUnwrapped

        /* Session 49 (R48-A3): the always-row family — REF renders the
         *  UNPREFIXED always-row (measured @1440×900 this round), with
         *  the block's mb-6 spacing member on the row (REF:
         *  `flex items-center justify-between mb-6`). */
        alwaysRow
        className="mb-6"
        size="md"
        title="Approval Workflow Engine"
        subtitle="Configure multi-level approval hierarchies for requests and expenses"
        actions={
          /* Session 58 (R58-10): REF's New Workflow is the SOLID
             blue-600 — live-measured, the CTA-fill census. Session 60
             (R60-E): REF authors text-white here (literal — 255,255,255
             both themes, live-measured; the other blue sites keep the
             flipping primary-foreground token).
             Session 93 (R93-C): the click swaps to the FULL-PAGE EDITOR. */
          <Button variant="blue" className="text-white" onClick={() => setEditorOpen(true)}>
            <Plus className="mr-2" aria-hidden="true" />
            New Workflow
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      ) : workflows.length === 0 ? (
        /* Session 11 (R10-Q): the reference's empty state — the py-16 sits
           on the CARD itself (measured classes "rounded-xl border bg-card
           text-card-foreground shadow text-center py-16", 976x266) with the
           48px Settings2 icon (mb-3), ONE slate-500 line, and the 213x36
           flat blue-600 CTA as direct children (y=169/229/269).
           Session 88 (R88-I): the text-card-foreground token was missed at
           this call site when the r87-I card family landed — restored
           (the REF's computed color set at both card levels). */
        <div className="rounded-xl border bg-card text-card-foreground text-center shadow py-16">
          <Settings2 className="mx-auto mb-3 h-12 w-12 text-slate-300" aria-hidden="true" />
          <p className="text-slate-500">No workflows configured yet.</p>
          {/* Session 66 (R66-K): the CTA carries mt-4 DIRECTLY (REF's
              authored form — the census read the button's own 16px top
              margin; the wrapper div is retired). */}
          <Button variant="blue" className="mt-4 text-white" onClick={() => setEditorOpen(true)}>
            <Plus className="mr-2" aria-hidden="true" />
            Create First Workflow
          </Button>
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
    </div>
  );
}
