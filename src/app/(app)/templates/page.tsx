"use client";

import * as React from "react";
import { Plus, Trash2, Loader2, ListChecks, Rocket } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

interface TemplateTask {
  title: string;
  dayOffset: number;
}

interface TemplateRow {
  id: string;
  title: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  tasks: TemplateTask[];
  usedCount: number;
}

interface EmployeeOption {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
}

export default function TemplatesPage() {
  const toast = useToast();
  const [templates, setTemplates] = React.useState<TemplateRow[]>([]);
  const [employees, setEmployees] = React.useState<EmployeeOption[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({ title: "", description: "", tasks: "" });

  const [useTemplate, setUseTemplate] = React.useState<TemplateRow | null>(null);
  const [useEmployeeId, setUseEmployeeId] = React.useState("");
  const [using, setUsing] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const [tplRes, empRes] = await Promise.all([
        fetch("/api/onboarding-templates"),
        fetch("/api/employees"),
      ]);
      const tplJson = await tplRes.json();
      const empJson = await empRes.json();
      if (tplJson.ok) setTemplates(tplJson.data.templates);
      else toast.toast({ title: "Failed to load templates", description: tplJson.error?.message, variant: "error" });
      if (empJson.ok) setEmployees(empJson.data.employees);
    } catch {
      toast.toast({ title: "Failed to load templates", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const tasks = form.tasks
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);
    if (!form.title.trim() || tasks.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/onboarding-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          tasks,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Failed to create template", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({
        title: "Template created",
        description: `${tasks.length} task${tasks.length === 1 ? "" : "s"} saved to “${form.title}”.`,
        variant: "success",
      });
      setCreateOpen(false);
      setForm({ title: "", description: "", tasks: "" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function onUse(e: React.FormEvent) {
    e.preventDefault();
    if (!useTemplate || !useEmployeeId) return;
    setUsing(true);
    try {
      const res = await fetch("/api/onboarding-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "use",
          templateId: useTemplate.id,
          employeeId: useEmployeeId,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Failed to start onboarding", description: json.error?.message, variant: "error" });
        return;
      }
      const employee = employees.find((emp) => emp.id === useEmployeeId);
      const name = employee ? `${employee.firstName} ${employee.lastName}`.trim() : "the employee";
      toast.toast({
        title: "Onboarding started",
        description: `“${useTemplate.title}” was assigned to ${name}.`,
        variant: "success",
      });
      setUseTemplate(null);
      setUseEmployeeId("");
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setUsing(false);
    }
  }

  async function onDelete(template: TemplateRow) {
    if (!window.confirm(`Delete the “${template.title}” template?`)) return;
    try {
      const res = await fetch(`/api/onboarding-templates?id=${template.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Delete failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Template deleted", variant: "success" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        title="Onboarding Templates"
        size="lg"
        subtitle="Create reusable onboarding task templates"
        actions={
          <Button variant="indigo" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2" aria-hidden="true" />
            Create Template
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          label="Templates Available"
          value={templates.length}
          hint={`${templates.length} template${templates.length === 1 ? "" : "s"} available`}
          icon={<ListChecks aria-hidden="true" />}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-xl border bg-card shadow-sm">
          <EmptyState
            icon={<ListChecks className="h-6 w-6" aria-hidden="true" />}
            title="No templates yet"
            description="Create your first onboarding template to get started"
            action={
              <Button variant="dark" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2" aria-hidden="true" />
                Create Template
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{template.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {template.tasks.length} task{template.tasks.length === 1 ? "" : "s"} · used{" "}
                      {template.usedCount} time{template.usedCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <Badge variant={template.active ? "success" : "secondary"}>
                    {template.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {template.description ? (
                  <p className="line-clamp-2 text-sm text-muted-foreground">{template.description}</p>
                ) : null}
                <div className="flex flex-wrap gap-1.5">
                  {template.tasks.map((task, i) => (
                    <Badge key={`${template.id}-${i}`} variant="secondary">
                      {task.title}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-xs text-muted-foreground">Created {formatDate(template.createdAt)}</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUseTemplate(template);
                        setUseEmployeeId("");
                      }}
                    >
                      <Rocket aria-hidden="true" />
                      Use Template
                    </Button>
                    <Button
                      variant="ghost"
                      size="iconSm"
                      aria-label={`Delete template ${template.title}`}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => onDelete(template)}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Template dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Template</DialogTitle>
            <DialogDescription>Build a reusable onboarding task list.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tpl-title">Template Title</Label>
              <Input
                id="tpl-title"
                required
                placeholder="e.g. Standard New Hire Onboarding"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tpl-description">Description</Label>
              <Input
                id="tpl-description"
                placeholder="What is this template for?"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tpl-tasks">Tasks (one per line)</Label>
              <Textarea
                id="tpl-tasks"
                rows={6}
                required
                placeholder={"Welcome meeting\nIT accounts setup\nPolicy walkthrough\nTeam introductions"}
                value={form.tasks}
                onChange={(e) => setForm({ ...form, tasks: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                Create Template
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Use Template dialog */}
      <Dialog
        open={useTemplate !== null}
        onOpenChange={(o) => {
          if (!o) {
            setUseTemplate(null);
            setUseEmployeeId("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Use Template</DialogTitle>
            <DialogDescription>
              Start an onboarding process for an employee with the “{useTemplate?.title}” task list.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onUse} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tpl-employee">Employee</Label>
              <Select value={useEmployeeId} onValueChange={setUseEmployeeId}>
                <SelectTrigger id="tpl-employee">
                  <SelectValue placeholder="Select employee" />
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
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setUseTemplate(null);
                  setUseEmployeeId("");
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={using}>
                {using ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Rocket aria-hidden="true" />}
                Start Onboarding
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
}
