"use client";

import * as React from "react";
import { Plus, ClipboardList, Play, Square, Eye, Trash2, Loader2, X } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useToast } from "@/components/ui/toast";
import { formatDate, timeAgo } from "@/lib/utils";

interface SurveyQuestion {
  id: string;
  text: string;
  type: string;
}

interface SurveyResponse {
  id: string;
  sentiment: number | null;
  submittedAt: string;
  answers: string;
  employeeName: string;
}

interface Survey {
  id: string;
  title: string;
  description: string | null;
  status: string;
  questions: SurveyQuestion[];
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  responses: SurveyResponse[];
}

function avgSentiment(responses: SurveyResponse[]): number | null {
  const values = responses.map((r) => r.sentiment).filter((s): s is number => s !== null);
  if (values.length === 0) return null;
  return Math.round(values.reduce((s, v) => s + v, 0) / values.length);
}

function sentimentVariant(v: number): "success" | "warning" | "destructive" | "secondary" {
  if (v >= 20) return "success";
  if (v > -20) return "warning";
  return "destructive";
}

interface ParsedAnswer {
  questionId: string;
  answer: string;
}

function parseAnswers(raw: string): ParsedAnswer[] {
  try {
    const parsed: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((a): a is Record<string, unknown> => typeof a === "object" && a !== null)
      .map((a) => ({
        questionId: typeof a.questionId === "string" ? a.questionId : "",
        answer: typeof a.answer === "string" ? a.answer : String(a.answer ?? ""),
      }))
      .filter((a) => a.answer.length > 0);
  } catch {
    return [];
  }
}

export default function SurveysPage() {
  const toast = useToast();
  const [surveys, setSurveys] = React.useState<Survey[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [viewing, setViewing] = React.useState<Survey | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/surveys");
      const json = await res.json();
      if (json.ok) setSurveys(json.data.surveys);
      else toast.toast({ title: "Failed to load surveys", description: json.error?.message, variant: "error" });
    } catch {
      toast.toast({ title: "Network error", description: "Could not load surveys.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(data: { title: string; description: string; questions: string[] }) {
    setSaving(true);
    try {
      const res = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Failed to create survey", description: json.error?.message, variant: "error" });
        return false;
      }
      toast.toast({ title: "Survey created", description: `"${data.title}" is saved as a draft.`, variant: "success" });
      await load();
      return true;
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function onStatus(survey: Survey, status: "active" | "closed") {
    setBusy(survey.id + status);
    try {
      const res = await fetch(`/api/surveys?id=${survey.id}`, {
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
        title: status === "active" ? "Survey activated" : "Survey closed",
        description: status === "active" ? "Employees can now submit responses." : "Responses are no longer accepted.",
        variant: "success",
      });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setBusy(null);
    }
  }

  async function onDelete(survey: Survey) {
    if (!window.confirm(`Delete "${survey.title}" and its ${survey.responses.length} response(s)? This cannot be undone.`)) return;
    setBusy(survey.id + "delete");
    try {
      const res = await fetch(`/api/surveys?id=${survey.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Delete failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Survey deleted", variant: "success" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setBusy(null);
    }
  }

  const stats = React.useMemo(() => {
    const active = surveys.filter((s) => s.status === "active").length;
    const totalResponses = surveys.reduce((n, s) => n + s.responses.length, 0);
    const sentiments = surveys
      .flatMap((s) => s.responses.map((r) => r.sentiment))
      .filter((v): v is number => v !== null);
    const avg = sentiments.length > 0 ? Math.round(sentiments.reduce((s, v) => s + v, 0) / sentiments.length) : 0;
    return { total: surveys.length, active, totalResponses, avg };
  }, [surveys]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader
        section="Employee Engagement"
        title="Surveys"
        subtitle="Create surveys and gather employee feedback"
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus aria-hidden="true" />
            New Survey
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Surveys" value={stats.total} icon={<ClipboardList className="h-4 w-4" />} />
        <StatCard label="Active Surveys" value={stats.active} icon={<Play className="h-4 w-4" />} iconClassName="bg-emerald-100 text-emerald-600" />
        <StatCard label="Total Responses" value={stats.totalResponses} icon={<Eye className="h-4 w-4" />} iconClassName="bg-blue-100 text-blue-600" />
        <StatCard label="Avg Sentiment" value={`${stats.avg}%`} icon={<ClipboardList className="h-4 w-4" />} iconClassName="bg-amber-100 text-amber-600" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      ) : surveys.length === 0 ? (
        <div className="rounded-xl border bg-card shadow-sm">
          <EmptyState
            title="No surveys yet"
            description="Create your first survey to gather employee feedback"
            action={
              <Button onClick={() => setDialogOpen(true)}>
                <Plus aria-hidden="true" />
                New Survey
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {surveys.map((survey) => {
            const sentiment = avgSentiment(survey.responses);
            return (
              <Card key={survey.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{survey.title}</CardTitle>
                    <StatusBadge status={survey.status} />
                  </div>
                  <CardDescription className="line-clamp-2">
                    {survey.description ?? `${survey.questions.length} question${survey.questions.length === 1 ? "" : "s"}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{survey.questions.length} questions</Badge>
                    <Badge variant="outline">{survey.responses.length} responses</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Sentiment:</span>
                    {sentiment !== null ? (
                      <Badge variant={sentimentVariant(sentiment)}>
                        {sentiment > 0 ? "+" : ""}
                        {sentiment}%
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">No responses yet</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {survey.status === "active" && survey.startDate
                      ? `Active since ${formatDate(survey.startDate)}`
                      : survey.status === "closed" && survey.endDate
                        ? `Closed ${formatDate(survey.endDate)}`
                        : `Created ${timeAgo(survey.createdAt)}`}
                  </p>
                </CardContent>
                <CardFooter className="flex-wrap gap-2">
                  {survey.status === "draft" ? (
                    <Button size="sm" variant="outline" disabled={busy === survey.id + "active"} onClick={() => onStatus(survey, "active")}>
                      {busy === survey.id + "active" ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Play aria-hidden="true" />}
                      Activate
                    </Button>
                  ) : null}
                  {survey.status === "active" ? (
                    <Button size="sm" variant="outline" disabled={busy === survey.id + "closed"} onClick={() => onStatus(survey, "closed")}>
                      {busy === survey.id + "closed" ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Square aria-hidden="true" />}
                      Close
                    </Button>
                  ) : null}
                  <Button size="sm" variant="ghost" onClick={() => setViewing(survey)}>
                    <Eye aria-hidden="true" />
                    View Responses
                  </Button>
                  <Button
                    size="iconSm"
                    variant="ghost"
                    className="ml-auto text-red-600 hover:bg-red-50 hover:text-red-700"
                    aria-label={`Delete ${survey.title}`}
                    disabled={busy === survey.id + "delete"}
                    onClick={() => onDelete(survey)}
                  >
                    {busy === survey.id + "delete" ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Trash2 aria-hidden="true" />}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <NewSurveyDialog open={dialogOpen} saving={saving} onOpenChange={setDialogOpen} onCreate={onCreate} />

      <Dialog open={viewing !== null} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewing?.title} — Responses</DialogTitle>
            <DialogDescription>
              {viewing ? `${viewing.responses.length} response(s) · ${viewing.questions.length} question(s)` : ""}
            </DialogDescription>
          </DialogHeader>
          {viewing && viewing.responses.length === 0 ? (
            <EmptyState title="No responses yet" description="Responses appear here once employees submit the survey." />
          ) : viewing ? (
            <div className="flex flex-col gap-3">
              {viewing.responses.map((r) => {
                const sentiment = r.sentiment;
                const answers = parseAnswers(r.answers);
                return (
                  <div key={r.id} className="rounded-lg border bg-secondary/30 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{r.employeeName}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{timeAgo(r.submittedAt)}</span>
                        {sentiment !== null ? (
                          <Badge variant={sentimentVariant(sentiment)}>
                            {sentiment > 0 ? "+" : ""}
                            {sentiment}%
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {answers.map((a, i) => (
                        <p key={`${r.id}-${i}`} className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {viewing.questions.find((q) => q.id === a.questionId)?.text ?? "Question"}:
                          </span>{" "}
                          {a.answer}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NewSurveyDialog({
  open,
  saving,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  saving: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (data: { title: string; description: string; questions: string[] }) => Promise<boolean>;
}) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [questions, setQuestions] = React.useState<string[]>([""]);

  React.useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setQuestions([""]);
    }
  }, [open]);

  function updateQuestion(index: number, value: string) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? value : q)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = questions.map((q) => q.trim()).filter((q) => q.length > 0);
    if (cleaned.length === 0) {
      return;
    }
    const created = await onCreate({ title: title.trim(), description: description.trim(), questions: cleaned });
    if (created) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Survey</DialogTitle>
          <DialogDescription>Create a survey with a custom question set.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="survey-title">Title</Label>
            <Input id="survey-title" required maxLength={120} placeholder="e.g. Q4 Engagement Pulse" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="survey-desc">Description (optional)</Label>
            <Textarea
              id="survey-desc"
              maxLength={500}
              placeholder="What is this survey about?"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Questions</Label>
            {questions.map((q, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  required
                  maxLength={300}
                  placeholder={`Question ${i + 1}`}
                  value={q}
                  onChange={(e) => updateQuestion(i, e.target.value)}
                  aria-label={`Question ${i + 1}`}
                />
                <Button
                  type="button"
                  size="iconSm"
                  variant="ghost"
                  className="shrink-0 text-muted-foreground"
                  aria-label={`Remove question ${i + 1}`}
                  disabled={questions.length === 1}
                  onClick={() => setQuestions((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  <X aria-hidden="true" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              disabled={questions.length >= 20}
              onClick={() => setQuestions((prev) => [...prev, ""])}
            >
              <Plus aria-hidden="true" />
              Add Question
            </Button>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              Create Survey
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
