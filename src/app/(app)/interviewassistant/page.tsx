"use client";

import * as React from "react";
import { Sparkles, Loader2, ThumbsUp, AlertTriangle, HelpCircle, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { useToast } from "@/components/ui/toast";

interface CandidateOption {
  id: string;
  name: string;
  stage: string;
  jobPosting: { id: string; title: string; department: string | null } | null;
}

interface Analysis {
  score: number;
  verdict: string;
  strengths: string[];
  weaknesses: string[];
  questions: string[];
  summary: string;
  wordCount: number;
}

export default function InterviewAssistantPage() {
  const toast = useToast();
  const [candidates, setCandidates] = React.useState<CandidateOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [candidateId, setCandidateId] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [analyzing, setAnalyzing] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<Analysis | null>(null);
  const [analyzedFor, setAnalyzedFor] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/candidates")
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setCandidates(json.data.candidates);
      })
      .catch(() => toast.toast({ title: "Failed to load candidates", variant: "error" }))
      .finally(() => setLoading(false));
  }, [toast]);

  async function onAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!notes.trim()) return;
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await fetch("/api/interview-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(candidateId && candidateId !== "none" ? { candidateId } : {}),
          notes,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Analysis failed", description: json.error?.message, variant: "error" });
        return;
      }
      setAnalysis(json.data.analysis as Analysis);
      setAnalyzedFor(candidateId ? (json.data.candidate as string) : "Unassigned notes");
      toast.toast({
        title: "Interview analyzed",
        description: `Score ${json.data.analysis.score}/100 · ${json.data.analysis.verdict}.`,
        variant: "success",
      });
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader
        section="AI-Powered Interviews"
        title="Interview Assistant"
        subtitle="AI-powered interview preparation and analysis"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="p-5 pb-0">
            <CardTitle>Interview Notes</CardTitle>
            <CardDescription>
              Pick a candidate and paste your interview notes — the analysis runs locally with deterministic heuristics.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
              </div>
            ) : (
              <form onSubmit={onAnalyze} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ia-candidate">Select Candidate</Label>
                  <Select value={candidateId} onValueChange={setCandidateId}>
                    <SelectTrigger id="ia-candidate">
                      <SelectValue placeholder={candidates.length === 0 ? "No candidates yet" : "Select candidate"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {candidates.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} · {c.jobPosting?.title ?? "—"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {candidates.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Add candidates in Recruitment first, or analyze unassigned notes.
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ia-notes">Interview Notes</Label>
                  <Textarea
                    id="ia-notes"
                    rows={10}
                    required
                    placeholder="e.g. Led the redesign project, delivered ahead of schedule. Excellent communication — confident presenter. Concern: depth in testing…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">{notes.trim().split(/\s+/).filter(Boolean).length} words</p>
                </div>
                <Button type="submit" disabled={analyzing || !notes.trim()}>
                  {analyzing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
                  Analyze Interview
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-5 pb-0">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
              AI Analysis
            </CardTitle>
            <CardDescription>
              {analyzedFor ? `Analysis for ${analyzedFor}` : "Strengths, weaknesses and follow-up questions."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            {analysis ? (
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between gap-4 rounded-lg border bg-secondary/30 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Gauge className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{analysis.verdict}</p>
                      <p className="text-xs text-muted-foreground">{analysis.wordCount} words of notes analyzed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">{analysis.score}</p>
                    <p className="text-xs text-muted-foreground">score / 100</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <ThumbsUp className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                    Strengths
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
                    Weaknesses
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {analysis.weaknesses.map((w, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden="true" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <HelpCircle className="h-4 w-4 text-blue-600" aria-hidden="true" />
                    Suggested questions
                  </p>
                  <ol className="flex flex-col gap-1.5">
                    {analysis.questions.map((q, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <Badge variant="info" className="shrink-0">{i + 1}</Badge>
                        {q}
                      </li>
                    ))}
                  </ol>
                </div>

                <p className="rounded-lg border bg-secondary/40 p-3 text-xs text-muted-foreground">
                  {analysis.summary}
                </p>
              </div>
            ) : (
              <EmptyState
                icon={<Sparkles className="h-6 w-6" aria-hidden="true" />}
                title="No analysis yet"
                description="Write or paste interview notes, then click Analyze Interview."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
