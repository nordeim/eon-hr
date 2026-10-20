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

  /* Session 49 (R48-C1): the form element retired (REF renders the grid
   *  as a DIV) — the Analyze button calls the handler directly. */
  async function onAnalyze(e?: React.FormEvent) {
    e?.preventDefault();
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        /* Session 49 (R48-A2): the bare family — REF renders the hero
         *  block as a DIRECT child of the content wrapper (no hero row).
         *  Live-measured @1440×900 this round. */
        bare
        section="AI-Powered Interviews"
        layout="flat36"
        iconClassName="text-purple-600"
        sectionIcon={<Sparkles aria-hidden="true" />}
        title="Interview Assistant"
        subtitle="AI-powered interview preparation and analysis"
      />

      {/* Session 49 (R48-C1): REF's two-card form — the grid carries two
          space-y-6 columns: “Select Candidate” (label: Candidate, the
          h-9 select) + “Interview Notes” (label: Notes, the textarea, the
          Analyze button); the clone's AI Analysis rides column one as
          the functional superset (REF's analyze is a documented no-op).
          Live-measured @1440×900: card headers p-6 border-b
          border-slate-200 + DIV CardTitle leading-none, bodies
          p-6 space-y-4 > space-y-2 label groups. */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="leading-none">Select Candidate</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="ia-candidate">Candidate</Label>
                  <Select value={candidateId} onValueChange={setCandidateId}>
                    <SelectTrigger id="ia-candidate">
                      {/* Session 61 (R61-L): REF renders the standard
                        shadcn placeholder at zero candidates too
                        (live-measured) — the conditional "No candidates
                        yet" authoring replaced. */}
                    <SelectValue placeholder="Select candidate" />
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
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
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

        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="leading-none">Interview Notes</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
                </div>
              ) : (
                <>
              {/* Session 58 (R58-21): REF's Analyze Interview is w-full and
                  a DIRECT child of the p-6 space-y-4 card body (498px),
                  not nested in the notes' space-y-2 div — live-measured,
                  the CTA-fill census. */}
              <div className="space-y-2">
                <Label htmlFor="ia-notes">Notes</Label>
                {/* Session 64 (R64-D): REF's live textarea placeholder
                    (live-measured this round — the authored example essay
                    retired; R61-L held the SELECT's string only). */}
                <Textarea
                  id="ia-notes"
                  rows={10}
                  placeholder="Enter your interview observations, candidate responses, and overall impressions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">{notes.trim().split(/\s+/).filter(Boolean).length} words</p>
              </div>
              <Button variant="green" className="w-full" type="button" disabled={analyzing || !notes.trim()} onClick={() => void onAnalyze()}>
                {analyzing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
                Analyze Interview
              </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </div>
  );
}
