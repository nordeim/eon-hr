"use client";

import * as React from "react";
import { Plus, Target, Star, Trash2, Loader2, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/input";
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
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useToast } from "@/components/ui/toast";
import { cn, formatDate, initials } from "@/lib/utils";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  category: string;
  targetValue: number | null;
  progress: number;
  status: string;
  dueDate: string | null;
  createdAt: string;
  employeeId: string;
  employeeName: string;
  jobTitle: string | null;
}

interface Review {
  id: string;
  status: string;
  overallRating: number | null;
  strengths: string | null;
  improvements: string | null;
  completedAt: string | null;
  createdAt: string;
  employeeName: string;
  jobTitle: string | null;
  reviewerName: string;
  cycleName: string;
}

interface EmployeeOption {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
}

const GOAL_STATUS_OPTIONS = ["on_track", "at_risk", "behind", "completed"];
const GOAL_CATEGORIES = ["performance", "development", "okr", "kpi"];

function labelize(v: string): string {
  return v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function progressColor(status: string): string | undefined {
  if (status === "completed") return "bg-emerald-500";
  if (status === "at_risk") return "bg-amber-500";
  if (status === "behind") return "bg-red-500";
  return undefined;
}

function Stars({ rating }: { rating: number | null }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={rating ? `${rating} of 5 stars` : "Not rated yet"}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={cn("h-4 w-4", i <= (rating ?? 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")}
        />
      ))}
    </div>
  );
}

export default function PerformanceManagementPage() {
  const toast = useToast();
  const [goals, setGoals] = React.useState<Goal[]>([]);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [employees, setEmployees] = React.useState<EmployeeOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [goalsRes, reviewsRes, employeesRes] = await Promise.all([
        fetch("/api/goals"),
        fetch("/api/reviews"),
        fetch("/api/employees"),
      ]);
      const goalsJson = await goalsRes.json();
      const reviewsJson = await reviewsRes.json();
      const employeesJson = await employeesRes.json();
      if (goalsJson.ok) setGoals(goalsJson.data.goals);
      else toast.toast({ title: "Failed to load goals", description: goalsJson.error?.message, variant: "error" });
      if (reviewsJson.ok) setReviews(reviewsJson.data.reviews);
      if (employeesJson.ok) {
        setEmployees(
          employeesJson.data.employees.map((e: EmployeeOption) => ({ id: e.id, firstName: e.firstName, lastName: e.lastName, jobTitle: e.jobTitle }))
        );
      }
    } catch {
      toast.toast({ title: "Network error", description: "Could not load performance data.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function onCreateGoal(data: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Failed to set goal", description: json.error?.message, variant: "error" });
        return false;
      }
      toast.toast({ title: "Goal set", description: "The goal is now tracked for this employee.", variant: "success" });
      await load();
      return true;
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function patchGoal(id: string, body: Record<string, unknown>) {
    setBusy(id + "patch");
    try {
      const res = await fetch(`/api/goals?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Update failed", description: json.error?.message, variant: "error" });
        await load();
        return;
      }
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setBusy(null);
    }
  }

  async function onDeleteGoal(goal: Goal) {
    if (!window.confirm(`Delete goal "${goal.title}"? This cannot be undone.`)) return;
    setBusy(goal.id + "delete");
    try {
      const res = await fetch(`/api/goals?id=${goal.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Delete failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Goal deleted", variant: "success" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setBusy(null);
    }
  }

  const stats = React.useMemo(
    () => ({
      total: goals.length,
      completed: goals.filter((g) => g.status === "completed").length,
      atRisk: goals.filter((g) => g.status === "at_risk").length,
      reviews: reviews.length,
    }),
    [goals, reviews]
  );

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right_bottom,#f8fafc,#eef2ff)] p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        section="Performance Management"
        layout="flat36"
        iconClassName="text-indigo-600"
        sectionIcon={<Target aria-hidden="true" />}
        title="Goals & Reviews"
        subtitle="Track performance, set goals, and conduct reviews"
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Goals" value={stats.total} icon={<Target className="h-4 w-4" />} />
        <StatCard label="Completed" value={stats.completed} icon={<Target className="h-4 w-4" />} iconClassName="bg-emerald-100 text-emerald-600" />
        <StatCard label="At Risk" value={stats.atRisk} icon={<Target className="h-4 w-4" />} iconClassName="bg-amber-100 text-amber-600" />
        <StatCard label="Reviews" value={stats.reviews} icon={<Star className="h-4 w-4" />} iconClassName="bg-blue-100 text-blue-600" />
      </div>

      <Tabs defaultValue="goals">
        <TabsList>
          <TabsTrigger value="goals">Goals & KPIs</TabsTrigger>
          <TabsTrigger value="reviews">Performance Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {goals.length} goal{goals.length === 1 ? "" : "s"} across the team
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2" aria-hidden="true" />
              Set New Goal
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          ) : goals.length === 0 ? (
            <div className="rounded-xl border bg-card shadow-sm">
              <EmptyState
                icon={<Target className="h-6 w-6" />}
                title="No goals set yet"
                description="Set the first goal to start tracking performance"
                action={
                  <Button variant="dark" onClick={() => setDialogOpen(true)}>
                    <Plus className="mr-2" aria-hidden="true" />
                    Set New Goal
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {goals.map((goal) => (
                <Card key={goal.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{goal.title}</CardTitle>
                      <StatusBadge status={goal.status} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px]">{initials(goal.employeeName)}</AvatarFallback>
                      </Avatar>
                      <p className="text-xs text-muted-foreground">
                        {goal.employeeName}
                        {goal.jobTitle ? ` · ${goal.jobTitle}` : ""}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    {goal.description ? (
                      <p className="line-clamp-2 text-sm text-muted-foreground">{goal.description}</p>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{labelize(goal.category)}</Badge>
                      {goal.targetValue !== null ? <Badge variant="outline">Target {goal.targetValue}</Badge> : null}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span className="font-medium text-foreground">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} indicatorClassName={progressColor(goal.status)} />
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={goal.progress}
                        aria-label={`Progress for ${goal.title}`}
                        className="h-1.5 w-full cursor-pointer accent-blue-600"
                        onChange={(e) => {
                          const progress = Number(e.target.value);
                          setGoals((prev) => prev.map((g) => (g.id === goal.id ? { ...g, progress } : g)));
                        }}
                        onPointerUp={() => patchGoal(goal.id, { progress: goal.progress })}
                        onKeyUp={() => patchGoal(goal.id, { progress: goal.progress })}
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarClock className="h-4 w-4" aria-hidden="true" />
                        {goal.dueDate ? `Due ${formatDate(goal.dueDate)}` : "No due date"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Select
                          value={goal.status}
                          onValueChange={(v) => patchGoal(goal.id, { status: v })}
                          disabled={busy === goal.id + "patch"}
                        >
                          <SelectTrigger className="h-8 w-32 text-xs" aria-label={`Status for ${goal.title}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {GOAL_STATUS_OPTIONS.map((s) => (
                              <SelectItem key={s} value={s}>
                                {labelize(s)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="iconSm"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          aria-label={`Delete ${goal.title}`}
                          disabled={busy === goal.id + "delete"}
                          onClick={() => onDeleteGoal(goal)}
                        >
                          {busy === goal.id + "delete" ? (
                            <Loader2 className="animate-spin" aria-hidden="true" />
                          ) : (
                            <Trash2 aria-hidden="true" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="flex flex-col gap-4">
          {loading ? (
            <div className="flex items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-xl border bg-card shadow-sm">
              <EmptyState
                icon={<Star className="h-6 w-6" />}
                title="No reviews yet"
                description="Start a review cycle from the Evaluations module to collect feedback"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-xl border bg-card p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{initials(review.employeeName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{review.employeeName}</p>
                        <p className="text-xs text-muted-foreground">
                          {review.cycleName} · reviewed by {review.reviewerName}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Stars rating={review.overallRating} />
                      <StatusBadge status={review.status} />
                    </div>
                  </div>
                  {review.strengths || review.improvements ? (
                    <div className="flex flex-col gap-2">
                      {review.strengths ? (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-emerald-600">Strengths:</span> {review.strengths}
                        </p>
                      ) : null}
                      {review.improvements ? (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-amber-600">To improve:</span> {review.improvements}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    {review.completedAt ? `Completed ${formatDate(review.completedAt)}` : `Created ${formatDate(review.createdAt)}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <NewGoalDialog open={dialogOpen} employees={employees} saving={saving} onOpenChange={setDialogOpen} onSave={onCreateGoal} />
    </div>
    </div>
  );
}

function NewGoalDialog({
  open,
  employees,
  saving,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  employees: EmployeeOption[];
  saving: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (data: Record<string, unknown>) => Promise<boolean>;
}) {
  const [form, setForm] = React.useState({ employeeId: "", title: "", description: "", category: "performance", dueDate: "" });

  React.useEffect(() => {
    if (open) {
      setForm({ employeeId: employees[0]?.id ?? "", title: "", description: "", category: "performance", dueDate: "" });
    }
  }, [open, employees]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.employeeId) return;
    const saved = await onSave({
      employeeId: form.employeeId,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      dueDate: form.dueDate,
    });
    if (saved) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Set New Goal</DialogTitle>
          <DialogDescription>Define a measurable goal for an employee.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="goal-employee">Employee</Label>
            <Select value={form.employeeId} onValueChange={(v) => setForm({ ...form, employeeId: v })}>
              <SelectTrigger id="goal-employee">
                <SelectValue placeholder={employees.length === 0 ? "No employees found" : "Select employee"} />
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
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="goal-title">Goal Title</Label>
            <Input id="goal-title" required maxLength={140} placeholder="e.g. Close 20 enterprise deals" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="goal-category">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger id="goal-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {labelize(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="goal-due">Due Date</Label>
              <Input id="goal-due" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="goal-desc">Description (optional)</Label>
            <Textarea id="goal-desc" maxLength={500} rows={3} placeholder="How will this goal be measured?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !form.employeeId}>
              {saving ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              Set Goal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
