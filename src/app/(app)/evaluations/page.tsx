"use client";

import * as React from "react";
import { Plus, ClipboardCheck, Play, CheckCircle2, Sparkles, GraduationCap, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useToast } from "@/components/ui/toast";
import { formatDate, initials } from "@/lib/utils";

interface CycleReview {
  id: string;
  status: string;
  overallRating: number | null;
  completedAt: string | null;
  employeeName: string;
  reviewerName: string;
}

interface ReviewCycle {
  id: string;
  name: string;
  type: string;
  status: string;
  periodStart: string | null;
  periodEnd: string | null;
  createdAt: string;
  reviews: CycleReview[];
}

interface Evaluation {
  id: string;
  type: string;
  status: string;
  feedback: string | null;
  aiSummary: string | null;
  ratings: Record<string, number>;
  createdAt: string;
  employeeId: string;
  employeeName: string;
  jobTitle: string | null;
}

interface Goal {
  id: string;
  title: string;
  category: string;
  progress: number;
  status: string;
  dueDate: string | null;
  employeeName: string;
}

const CYCLE_TYPES = [
  { value: "annual", label: "Annual" },
  { value: "quarterly", label: "Quarterly" },
  { value: "probation", label: "Probation" },
  { value: "360", label: "360°" },
];

const EVAL_TYPES: Record<string, string> = {
  "360": "360° Evaluation",
  appraisal: "Appraisal",
  self: "Self Review",
  peer: "Peer Review",
};

function labelize(v: string): string {
  return v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function EvaluationsPage() {
  const toast = useToast();
  const [cycles, setCycles] = React.useState<ReviewCycle[]>([]);
  const [evaluations, setEvaluations] = React.useState<Evaluation[]>([]);
  const [goals, setGoals] = React.useState<Goal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [cyclesRes, evaluationsRes, goalsRes] = await Promise.all([
        fetch("/api/review-cycles"),
        fetch("/api/evaluations"),
        fetch("/api/goals"),
      ]);
      const cyclesJson = await cyclesRes.json();
      const evaluationsJson = await evaluationsRes.json();
      const goalsJson = await goalsRes.json();
      if (cyclesJson.ok) setCycles(cyclesJson.data.cycles);
      else toast.toast({ title: "Failed to load review cycles", description: cyclesJson.error?.message, variant: "error" });
      if (evaluationsJson.ok) setEvaluations(evaluationsJson.data.evaluations);
      if (goalsJson.ok) setGoals(goalsJson.data.goals);
    } catch {
      toast.toast({ title: "Network error", description: "Could not load evaluation data.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function onCreateCycle(data: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch("/api/review-cycles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Failed to create review", description: json.error?.message, variant: "error" });
        return false;
      }
      toast.toast({ title: "Review created", description: "The review cycle is ready to start.", variant: "success" });
      await load();
      return true;
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function onCycleStatus(cycle: ReviewCycle, status: "in_progress" | "completed") {
    setBusy(cycle.id + status);
    try {
      const res = await fetch(`/api/review-cycles?id=${cycle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Update failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({
        title: status === "in_progress" ? "Review cycle started" : "Review cycle completed",
        description: `${cycle.name} is now ${status === "in_progress" ? "in progress" : "completed"}.`,
        variant: "success",
      });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setBusy(null);
    }
  }

  const allReviews = React.useMemo(() => cycles.flatMap((c) => c.reviews), [cycles]);
  const stats = React.useMemo(
    () => ({
      total: allReviews.length,
      completed: allReviews.filter((r) => r.status === "completed").length,
      inProgress: allReviews.filter((r) => r.status === "in_progress").length,
      notStarted: allReviews.filter((r) => r.status === "not_started").length,
    }),
    [allReviews]
  );

  const trainingNeeds = React.useMemo(
    () => goals.filter((g) => g.category === "development" || g.status === "at_risk" || g.status === "behind"),
    [goals]
  );

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right_bottom,#eef2ff,#faf5ff)] p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        section="Performance Management"
        layout="flat48"
        centered
        iconClassName="text-indigo-600"
        sectionIcon={<ClipboardCheck aria-hidden="true" />}
        title="360° Evaluations & Appraisals"
        subtitle="Structured reviews, automated workflows & AI-generated performance reports"
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Reviews" value={stats.total} icon={<ClipboardCheck className="h-4 w-4" />} />
        <StatCard label="Completed" value={stats.completed} icon={<ClipboardCheck className="h-4 w-4" />} iconClassName="bg-emerald-100 text-emerald-600" />
        <StatCard label="In Progress" value={stats.inProgress} icon={<ClipboardCheck className="h-4 w-4" />} iconClassName="bg-blue-100 text-blue-600" />
        <StatCard label="Not Started" value={stats.notStarted} icon={<ClipboardCheck className="h-4 w-4" />} iconClassName="bg-amber-100 text-amber-600" />
      </div>

      <Tabs defaultValue="workflows">
        <TabsList>
          <TabsTrigger value="workflows">Appraisal Workflows</TabsTrigger>
          <TabsTrigger value="eval360">360° Evaluations</TabsTrigger>
          <TabsTrigger value="training">Training Needs</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="flex flex-col gap-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div className="flex flex-col gap-1.5">
                <CardTitle>Review Cycles</CardTitle>
                <CardDescription>
                  {cycles.length} cycle{cycles.length === 1 ? "" : "s"} · {stats.total} review{stats.total === 1 ? "" : "s"} tracked
                </CardDescription>
              </div>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2" aria-hidden="true" />
                New Review
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
                </div>
              ) : cycles.length === 0 ? (
                <EmptyState
                  icon={<ClipboardCheck className="h-6 w-6" />}
                  title="No reviews yet. Create one to get started."
                  description="Review cycles organize appraisal and 360° feedback rounds."
                  action={
                    <Button variant="dark" onClick={() => setDialogOpen(true)}>
                      <Plus className="mr-2" aria-hidden="true" />
                      New Review
                    </Button>
                  }
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {cycles.map((cycle) => {
                    const completed = cycle.reviews.filter((r) => r.status === "completed").length;
                    const pct = cycle.reviews.length > 0 ? Math.round((completed / cycle.reviews.length) * 100) : 0;
                    const period =
                      cycle.periodStart || cycle.periodEnd
                        ? `${formatDate(cycle.periodStart)} → ${formatDate(cycle.periodEnd)}`
                        : "No period set";
                    return (
                      <div key={cycle.id} className="rounded-xl border bg-secondary/30 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback>{initials(cycle.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-foreground">{cycle.name}</p>
                              <p className="text-xs text-muted-foreground">{period}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">{CYCLE_TYPES.find((t) => t.value === cycle.type)?.label ?? labelize(cycle.type)}</Badge>
                            <StatusBadge status={cycle.status} />
                            {cycle.status === "not_started" ? (
                              <Button size="sm" variant="outline" disabled={busy === cycle.id + "in_progress"} onClick={() => onCycleStatus(cycle, "in_progress")}>
                                {busy === cycle.id + "in_progress" ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Play aria-hidden="true" />}
                                Start
                              </Button>
                            ) : null}
                            {cycle.status === "in_progress" ? (
                              <Button size="sm" variant="outline" disabled={busy === cycle.id + "completed"} onClick={() => onCycleStatus(cycle, "completed")}>
                                {busy === cycle.id + "completed" ? <Loader2 className="animate-spin" aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}
                                Complete
                              </Button>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <Progress value={pct} />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {completed}/{cycle.reviews.length} reviews completed
                          </span>
                        </div>
                        {cycle.reviews.length > 0 ? (
                          <div className="flex flex-col gap-1.5">
                            {cycle.reviews.slice(0, 4).map((r) => (
                              <div key={r.id} className="flex items-center justify-between gap-2 text-xs">
                                <span className="truncate text-muted-foreground">
                                  {r.employeeName} ← {r.reviewerName}
                                </span>
                                <StatusBadge status={r.status} />
                              </div>
                            ))}
                            {cycle.reviews.length > 4 ? (
                              <p className="text-xs text-muted-foreground">+{cycle.reviews.length - 4} more…</p>
                            ) : null}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No reviews assigned in this cycle yet.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eval360" className="flex flex-col gap-4">
          {loading ? (
            <div className="flex items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          ) : evaluations.length === 0 ? (
            <div className="rounded-xl border bg-card shadow-sm">
              <EmptyState
                icon={<Users className="h-6 w-6" />}
                title="No evaluations yet"
                description="360° evaluations appear here once reviewers submit feedback"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {evaluations.map((ev) => (
                <div key={ev.id} className="rounded-xl border bg-card p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{initials(ev.employeeName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{ev.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{ev.employeeId}{ev.jobTitle ? ` · ${ev.jobTitle}` : ""}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge variant="info">{EVAL_TYPES[ev.type] ?? labelize(ev.type)}</Badge>
                      <StatusBadge status={ev.status} />
                    </div>
                  </div>
                  {Object.keys(ev.ratings).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(ev.ratings).map(([competency, score]) => (
                        <Badge key={competency} variant="outline">
                          {labelize(competency)}: {score}/5
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  {ev.feedback ? <p className="line-clamp-3 text-sm text-muted-foreground">{ev.feedback}</p> : null}
                  {ev.aiSummary ? (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-blue-700">
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                        AI Summary
                      </p>
                      <p className="text-sm text-blue-900/80">{ev.aiSummary}</p>
                    </div>
                  ) : null}
                  <p className="text-xs text-muted-foreground">Submitted {formatDate(ev.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="training" className="flex flex-col gap-4">
          {loading ? (
            <div className="flex items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          ) : trainingNeeds.length === 0 ? (
            <div className="rounded-xl border bg-card shadow-sm">
              <EmptyState
                icon={<GraduationCap className="h-6 w-6" />}
                title="No training needs identified"
                description="Development goals and at-risk goals appear here as coaching candidates"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {trainingNeeds.map((goal) => (
                <div key={goal.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                      <GraduationCap className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{goal.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {goal.employeeName}
                        {goal.dueDate ? ` · due ${formatDate(goal.dueDate)}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32">
                      <Progress value={goal.progress} />
                    </div>
                    <StatusBadge status={goal.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <NewReviewDialog open={dialogOpen} saving={saving} onOpenChange={setDialogOpen} onSave={onCreateCycle} />
    </div>
    </div>
  );
}

function NewReviewDialog({
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
  const [form, setForm] = React.useState({ name: "", type: "annual", periodStart: "", periodEnd: "" });

  React.useEffect(() => {
    if (open) setForm({ name: "", type: "annual", periodStart: "", periodEnd: "" });
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const saved = await onSave({
      name: form.name.trim(),
      type: form.type,
      periodStart: form.periodStart,
      periodEnd: form.periodEnd,
    });
    if (saved) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Review</DialogTitle>
          <DialogDescription>Create a review cycle with a review period.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="review-name">Cycle Name</Label>
            <Input id="review-name" required maxLength={120} placeholder="e.g. FY2027 Annual Review" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="review-type">Review Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger id="review-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CYCLE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="review-start">Period Start</Label>
              <Input id="review-start" type="date" value={form.periodStart} onChange={(e) => setForm({ ...form, periodStart: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="review-end">Period End</Label>
              <Input id="review-end" type="date" value={form.periodEnd} onChange={(e) => setForm({ ...form, periodEnd: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              Create Review
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
