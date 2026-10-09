"use client";

import * as React from "react";
import { Plus, MoreHorizontal, Calendar, FolderKanban, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useToast } from "@/components/ui/toast";
import { formatDate, initials } from "@/lib/utils";

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: string;
  assignee: string | null;
  priority: string;
  dueDate: string | null;
  projectId: string | null;
  createdAt: string;
}

interface ProjectRow {
  id: string;
  name: string;
  description: string | null;
  progress: number;
  createdAt: string;
}

const COLUMNS = [
  { id: "backlog", label: "Backlog" },
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "done", label: "Done" },
] as const;

const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

function labelize(v: string): string {
  return v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function TaskManagerPage() {
  const toast = useToast();
  const [tasks, setTasks] = React.useState<TaskRow[]>([]);
  const [projects, setProjects] = React.useState<ProjectRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [taskDialogOpen, setTaskDialogOpen] = React.useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = React.useState(false);
  const [dialogSeq, setDialogSeq] = React.useState(0);
  const [saving, setSaving] = React.useState(false);

  function openTaskDialog() {
    setDialogSeq((s) => s + 1);
    setTaskDialogOpen(true);
  }

  function openProjectDialog() {
    setDialogSeq((s) => s + 1);
    setProjectDialogOpen(true);
  }

  const load = React.useCallback(() => {
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((json) => {
        if (json.ok) {
          setTasks(json.data.tasks);
          setProjects(json.data.projects);
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

  async function moveTask(id: string, status: string) {
    try {
      const res = await fetch(`/api/tasks?kind=task&id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Move failed", description: json.error?.message, variant: "error" });
        return;
      }
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
      toast.toast({ title: "Task moved", description: `Moved to ${labelize(status)}.`, variant: "success" });
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  async function deleteTask(task: TaskRow) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      const res = await fetch(`/api/tasks?kind=task&id=${task.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Delete failed", description: json.error?.message, variant: "error" });
        return;
      }
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      toast.toast({ title: "Task deleted", variant: "success" });
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  async function createTask(data: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "task", ...data }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Save failed", description: json.error?.message, variant: "error" });
        return false;
      }
      toast.toast({ title: "Task created", description: `${String(data.title)} was added to the board.`, variant: "success" });
      await load();
      return true;
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function createProject(data: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "project", ...data }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Save failed", description: json.error?.message, variant: "error" });
        return false;
      }
      toast.toast({ title: "Project created", description: `${String(data.name)} was added.`, variant: "success" });
      await load();
      return true;
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
      return false;
    } finally {
      setSaving(false);
    }
  }

  const projectById = React.useMemo(() => {
    const map = new Map<string, ProjectRow>();
    projects.forEach((p) => map.set(p.id, p));
    return map;
  }, [projects]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        section="Task Management"
        layout="raised-48"
        iconClassName="text-blue-600"
        sectionIcon={<FolderKanban aria-hidden="true" />}
        title="Tasks & Projects"
        subtitle="Manage tasks, track progress, and collaborate with your team"
        actions={
          <>
            <Button variant="outline" onClick={openProjectDialog}>
              <FolderKanban aria-hidden="true" />
              New Project
            </Button>
            <Button onClick={openTaskDialog}>
              <Plus className="mr-2" aria-hidden="true" />
              New Task
            </Button>
          </>
        }
      />

      <Tabs defaultValue="kanban" className="flex flex-col gap-4">
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-0">
          {loading ? (
            <div className="flex items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          ) : (
            <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {COLUMNS.map((col) => {
                const columnTasks = tasks.filter((t) => t.status === col.id);
                return (
                  <div key={col.id} className="flex min-w-0 flex-col gap-3 rounded-xl border bg-secondary/30 p-3">
                    <div className="flex items-center justify-between px-1">
                      <p className="text-sm font-semibold text-foreground">{col.label}</p>
                      <Badge variant="secondary">{columnTasks.length}</Badge>
                    </div>
                    {columnTasks.length === 0 ? (
                      <p className="py-6 text-center text-sm text-muted-foreground">No tasks</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {columnTasks.map((task) => (
                          <div
                            key={task.id}
                            className="group cursor-grab rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="min-w-0 flex-1 break-words text-sm font-medium text-foreground">
                                {task.title}
                              </p>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="iconSm"
                                    className="shrink-0 text-muted-foreground"
                                    aria-label={`Actions for ${task.title}`}
                                  >
                                    <MoreHorizontal aria-hidden="true" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Move to</DropdownMenuLabel>
                                  {COLUMNS.filter((c) => c.id !== task.status).map((c) => (
                                    <DropdownMenuItem key={c.id} onSelect={() => moveTask(task.id, c.id)}>
                                      {c.label}
                                    </DropdownMenuItem>
                                  ))}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600 focus:bg-red-50"
                                    onSelect={() => deleteTask(task)}
                                  >
                                    <Trash2 aria-hidden="true" />
                                    Delete task
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            {task.description ? (
                              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
                            ) : null}
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              <StatusBadge status={task.priority} />
                              {task.projectId && projectById.has(task.projectId) ? (
                                <Badge variant="outline" className="max-w-full">
                                  <span className="truncate">{projectById.get(task.projectId)!.name}</span>
                                </Badge>
                              ) : null}
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                              <span className="flex min-w-0 items-center gap-1.5">
                                {task.assignee ? (
                                  <>
                                    <Avatar className="h-5 w-5">
                                      <AvatarFallback className="text-[10px]">
                                        {initials(task.assignee)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="truncate">{task.assignee}</span>
                                  </>
                                ) : (
                                  <span className="italic">Unassigned</span>
                                )}
                              </span>
                              {task.dueDate ? (
                                <span className="flex shrink-0 items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                                  {formatDate(task.dueDate)}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="projects" className="mt-0">
          {loading ? (
            <div className="flex items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-xl border bg-card shadow-sm">
              <EmptyState
                icon={<FolderKanban className="h-6 w-6" aria-hidden="true" />}
                title="No projects yet"
                description="Create your first project to organize your team's work."
                action={
                  <Button onClick={openProjectDialog}>
                    <Plus className="mr-2" aria-hidden="true" />
                    New Project
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => {
                const taskCount = tasks.filter((t) => t.projectId === project.id).length;
                return (
                  <div key={project.id} className="rounded-xl border bg-card p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{project.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Created {formatDate(project.createdAt)} · {taskCount} task{taskCount === 1 ? "" : "s"}
                        </p>
                      </div>
                      <Badge variant="secondary">{project.progress}%</Badge>
                    </div>
                    {project.description ? (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
                    ) : null}
                    <div className="mt-4 flex flex-col gap-1.5">
                      <Progress value={project.progress} aria-label={`${project.name} progress`} />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{project.progress}% complete</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <TaskDialog
        key={`task-${dialogSeq}`}
        open={taskDialogOpen}
        projects={projects}
        saving={saving}
        onOpenChange={setTaskDialogOpen}
        onSave={createTask}
      />

      <ProjectDialog
        key={`project-${dialogSeq}`}
        open={projectDialogOpen}
        saving={saving}
        onOpenChange={setProjectDialogOpen}
        onSave={createProject}
      />
    </div>
  );
}

function TaskDialog({
  open,
  projects,
  saving,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  projects: ProjectRow[];
  saving: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (data: Record<string, unknown>) => Promise<boolean>;
}) {
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    status: "backlog",
    priority: "medium",
    assignee: "",
    dueDate: "",
    projectId: "none",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const saved = await onSave({
      title: form.title,
      description: form.description,
      status: form.status,
      priority: form.priority,
      assignee: form.assignee,
      dueDate: form.dueDate,
      projectId: form.projectId === "none" ? "" : form.projectId,
    });
    if (saved) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
          <DialogDescription>Create a task and add it to the Kanban board.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              required
              maxLength={140}
              placeholder="e.g. Prepare Q4 report"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea
              id="task-desc"
              rows={3}
              placeholder="Optional details"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-status">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger id="task-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLUMNS.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-priority">Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger id="task-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {labelize(p)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-assignee">Assignee</Label>
              <Input
                id="task-assignee"
                placeholder="Who owns this?"
                value={form.assignee}
                onChange={(e) => setForm({ ...form, assignee: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-due">Due Date</Label>
              <Input
                id="task-due"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-project">Project</Label>
            <Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v })}>
              <SelectTrigger id="task-project">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No project</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProjectDialog({
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
  const [form, setForm] = React.useState({ name: "", description: "", progress: "0" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const progress = Math.min(100, Math.max(0, Math.round(Number(form.progress) || 0)));
    const saved = await onSave({
      name: form.name,
      description: form.description,
      progress,
    });
    if (saved) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
          <DialogDescription>Group related tasks under a project.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              required
              maxLength={140}
              placeholder="e.g. Website Redesign"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-desc">Description</Label>
            <Textarea
              id="project-desc"
              rows={3}
              placeholder="Optional details"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-progress">Progress (%)</Label>
            <Input
              id="project-progress"
              type="number"
              min={0}
              max={100}
              step={1}
              value={form.progress}
              onChange={(e) => setForm({ ...form, progress: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
