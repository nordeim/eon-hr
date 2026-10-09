"use client";

import * as React from "react";
import {
  Plus, Trash2, Loader2, Briefcase, Users, Star, Sparkles, FileSearch, MapPin, Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useToast } from "@/components/ui/toast";
import { initials, timeAgo } from "@/lib/utils";

interface JobRow {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  type: string;
  status: string;
  openings: number;
  description: string | null;
  postedAt: string;
  _count?: { candidates: number };
}

interface CandidateRow {
  id: string;
  jobPostingId: string;
  name: string;
  email: string | null;
  phone: string | null;
  stage: string;
  aiScore: number | null;
  skillsMatch: number | null;
  notes: string | null;
  appliedAt: string;
  jobPosting: { id: string; title: string; department: string | null } | null;
}

const STAGES = ["applied", "interviewing", "offer", "hired", "rejected"];
const TYPE_OPTIONS = ["full_time", "part_time", "contract", "intern"];

function labelize(v: string): string {
  return v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function RecruitmentPage() {
  const toast = useToast();
  const [jobs, setJobs] = React.useState<JobRow[]>([]);
  const [candidates, setCandidates] = React.useState<CandidateRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [jobFilter, setJobFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [scoreSort, setScoreSort] = React.useState("default");

  const [jobDialogOpen, setJobDialogOpen] = React.useState(false);
  const [jobSaving, setJobSaving] = React.useState(false);
  const [jobForm, setJobForm] = React.useState({
    title: "",
    department: "",
    location: "",
    type: "full_time",
    openings: "1",
    description: "",
  });

  // AI CV upload tab state
  const [cvName, setCvName] = React.useState("");
  const [cvEmail, setCvEmail] = React.useState("");
  const [cvJobId, setCvJobId] = React.useState("");
  const [cvText, setCvText] = React.useState("");
  const [analyzing, setAnalyzing] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<{ name: string; job: string; aiScore: number; skillsMatch: number; matchedKeywords: string[] } | null>(null);

  const load = React.useCallback(async () => {
    try {
      const [jobsRes, candRes] = await Promise.all([fetch("/api/jobs"), fetch("/api/candidates")]);
      const jobsJson = await jobsRes.json();
      const candJson = await candRes.json();
      if (jobsJson.ok) setJobs(jobsJson.data.jobs);
      else toast.toast({ title: "Failed to load jobs", description: jobsJson.error?.message, variant: "error" });
      if (candJson.ok) setCandidates(candJson.data.candidates);
      else toast.toast({ title: "Failed to load applicants", description: candJson.error?.message, variant: "error" });
    } catch {
      toast.toast({ title: "Failed to load recruitment data", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const stats = React.useMemo(() => {
    const activeJobs = jobs.filter((j) => j.status === "open").length;
    const shortlisted = candidates.filter((c) => c.stage === "interviewing" || c.stage === "offer").length;
    const scored = candidates.filter((c) => c.aiScore !== null);
    const avgScore =
      scored.length > 0 ? Math.round(scored.reduce((s, c) => s + (c.aiScore ?? 0), 0) / scored.length) : null;
    return { activeJobs, totalApplicants: candidates.length, shortlisted, avgScore };
  }, [jobs, candidates]);

  const visibleCandidates = React.useMemo(() => {
    let list = candidates.filter(
      (c) =>
        (jobFilter === "all" || c.jobPostingId === jobFilter) &&
        (statusFilter === "all" || c.stage === statusFilter)
    );
    if (scoreSort === "aiScore") {
      list = [...list].sort((a, b) => (b.aiScore ?? -1) - (a.aiScore ?? -1));
    }
    return list;
  }, [candidates, jobFilter, statusFilter, scoreSort]);

  async function onCreateJob(e: React.FormEvent) {
    e.preventDefault();
    const openings = Number(jobForm.openings);
    if (!Number.isInteger(openings) || openings < 1 || openings > 99) return;
    setJobSaving(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: jobForm.title,
          department: jobForm.department,
          location: jobForm.location,
          type: jobForm.type,
          openings,
          description: jobForm.description,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Failed to post job", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Job posted", description: `${jobForm.title} is now accepting applicants.`, variant: "success" });
      setJobDialogOpen(false);
      setJobForm({ title: "", department: "", location: "", type: "full_time", openings: "1", description: "" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setJobSaving(false);
    }
  }

  async function onToggleJobStatus(job: JobRow) {
    const status = job.status === "open" ? "paused" : "open";
    try {
      const res = await fetch(`/api/jobs?id=${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Update failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: status === "open" ? "Job reopened" : "Job paused", variant: "success" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  async function onDeleteJob(job: JobRow) {
    if (!window.confirm(`Delete "${job.title}" and all its applicants? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/jobs?id=${job.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Delete failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Job posting deleted", variant: "success" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  async function onMoveStage(candidate: CandidateRow, stage: string) {
    try {
      const res = await fetch(`/api/candidates?id=${candidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Update failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: `${candidate.name} → ${labelize(stage)}`, variant: "success" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  async function onDeleteCandidate(candidate: CandidateRow) {
    if (!window.confirm(`Remove ${candidate.name} from the pipeline?`)) return;
    try {
      const res = await fetch(`/api/candidates?id=${candidate.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Delete failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Candidate removed", variant: "success" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  async function onAnalyzeCv(e: React.FormEvent) {
    e.preventDefault();
    if (!cvJobId || !cvName.trim() || !cvText.trim()) return;
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobPostingId: cvJobId, name: cvName, email: cvEmail, cvText }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Analysis failed", description: json.error?.message, variant: "error" });
        return;
      }
      const candidate = json.data.candidate as CandidateRow;
      const matchedKeywords = (json.data.matchedKeywords ?? []) as string[];
      const job = jobs.find((j) => j.id === cvJobId);
      setAnalysis({
        name: candidate.name,
        job: job?.title ?? candidate.jobPosting?.title ?? "",
        aiScore: candidate.aiScore ?? 0,
        skillsMatch: candidate.skillsMatch ?? 0,
        matchedKeywords,
      });
      toast.toast({
        title: "CV analyzed",
        description: `${candidate.name} scored ${candidate.aiScore ?? 0}/100 and was added to the pipeline.`,
        variant: "success",
      });
      setCvName("");
      setCvEmail("");
      setCvText("");
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        section="AI-Powered Recruitment"
        title="Recruitment"
        subtitle="AI-assisted CV parsing, scoring & applicant tracking"
        actions={
          <Button onClick={() => setJobDialogOpen(true)}>
            <Plus aria-hidden="true" />
            Post New Job
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Active Jobs" value={stats.activeJobs} icon={<Briefcase aria-hidden="true" />} />
        <StatCard label="Total Applicants" value={stats.totalApplicants} icon={<Users aria-hidden="true" />} />
        <StatCard label="Shortlisted" value={stats.shortlisted} icon={<Star aria-hidden="true" />} />
        <StatCard
          label="Avg AI Score"
          value={stats.avgScore === null ? "—" : `${stats.avgScore}`}
          hint={stats.avgScore === null ? "No scored CVs yet" : "out of 100"}
          icon={<Sparkles aria-hidden="true" />}
        />
      </div>

      <Tabs defaultValue="applicants">
        <TabsList>
          <TabsTrigger value="applicants">Applicants &amp; Ranking</TabsTrigger>
          <TabsTrigger value="cvupload">AI CV Upload</TabsTrigger>
          <TabsTrigger value="jobs">Job Postings</TabsTrigger>
        </TabsList>

        {/* ---------------- Applicants & Ranking ---------------- */}
        <TabsContent value="applicants" className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-sm sm:flex-row sm:items-center">
            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger className="w-full sm:w-56" aria-label="Filter by job">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44" aria-label="Filter by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STAGES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {labelize(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={scoreSort} onValueChange={setScoreSort}>
              <SelectTrigger className="w-full sm:w-48" aria-label="Sort by AI score">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">AI Score: Default</SelectItem>
                <SelectItem value="aiScore">AI Score: High to Low</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground sm:ml-auto">
              {visibleCandidates.length} candidate{visibleCandidates.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="rounded-xl border bg-card shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
              </div>
            ) : visibleCandidates.length === 0 ? (
              <EmptyState
                icon={<Users className="h-6 w-6" aria-hidden="true" />}
                title="No applicants found"
                description={
                  jobFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting the job or status filters."
                    : "Upload a CV or add applicants to the pipeline."
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Job</TableHead>
                    <TableHead>AI Score</TableHead>
                    <TableHead>Skills Match</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleCandidates.map((candidate) => {
                    const score = candidate.aiScore;
                    return (
                      <TableRow key={candidate.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{initials(candidate.name)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">{candidate.name}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {candidate.email ?? "No email"} · {timeAgo(candidate.appliedAt)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {candidate.jobPosting?.title ?? "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex w-28 flex-col gap-1">
                            <span className="text-xs font-medium text-foreground">
                              {score === null ? "Not scored" : `${score}/100`}
                            </span>
                            <Progress
                              value={score ?? 0}
                              aria-label={`AI score ${score ?? 0} of 100`}
                              indicatorClassName={
                                score === null
                                  ? undefined
                                  : score >= 75
                                    ? "bg-emerald-500"
                                    : score >= 50
                                      ? "bg-amber-500"
                                      : "bg-red-500"
                              }
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          {candidate.skillsMatch === null ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <Badge variant={candidate.skillsMatch >= 60 ? "success" : "secondary"}>
                              {candidate.skillsMatch}% match
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={candidate.stage} />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="iconSm" aria-label={`Actions for ${candidate.name}`}>
                                <FileSearch aria-hidden="true" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Move to</DropdownMenuLabel>
                              {STAGES.filter((s) => s !== candidate.stage).map((s) => (
                                <DropdownMenuItem key={s} onClick={() => onMoveStage(candidate, s)}>
                                  {labelize(s)}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => onDeleteCandidate(candidate)}>
                                <Trash2 aria-hidden="true" /> Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* ---------------- AI CV Upload ---------------- */}
        <TabsContent value="cvupload" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-1 pb-4">
                <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                  AI CV Upload
                </h2>
                <p className="text-sm text-muted-foreground">
                  Paste a CV and pick a job — the CV is scored with a keyword-overlap heuristic against the posting.
                </p>
              </div>
              <form onSubmit={onAnalyzeCv} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cv-name">Candidate Name</Label>
                    <Input
                      id="cv-name"
                      required
                      placeholder="Full name"
                      value={cvName}
                      onChange={(e) => setCvName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cv-email">Email (optional)</Label>
                    <Input
                      id="cv-email"
                      type="email"
                      placeholder="name@example.com"
                      value={cvEmail}
                      onChange={(e) => setCvEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cv-job">Job</Label>
                  <Select value={cvJobId} onValueChange={setCvJobId}>
                    <SelectTrigger id="cv-job">
                      <SelectValue placeholder="Select job posting" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobs.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cv-text">CV Text</Label>
                  <Textarea
                    id="cv-text"
                    rows={8}
                    required
                    placeholder="Paste the full CV text here — skills, experience, education…"
                    value={cvText}
                    onChange={(e) => setCvText(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={analyzing || jobs.length === 0}>
                  {analyzing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
                  Analyze CV
                </Button>
                {jobs.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Post a job first to analyze CVs against it.</p>
                ) : null}
              </form>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-1 pb-4">
                <h2 className="text-base font-semibold text-foreground">Analysis Result</h2>
                <p className="text-sm text-muted-foreground">Score summary for the last analyzed CV.</p>
              </div>
              {analysis ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-4 rounded-lg border bg-secondary/30 p-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{analysis.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{analysis.job}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-2xl font-bold text-foreground">{analysis.aiScore}</p>
                      <p className="text-xs text-muted-foreground">AI score / 100</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Skills match</span>
                      <span className="font-medium text-foreground">{analysis.skillsMatch}%</span>
                    </div>
                    <Progress
                      value={analysis.skillsMatch}
                      aria-label={`Skills match ${analysis.skillsMatch}%`}
                      indicatorClassName={analysis.skillsMatch >= 60 ? "bg-emerald-500" : "bg-amber-500"}
                    />
                  </div>
                  {analysis.matchedKeywords.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium text-foreground">Matched keywords</p>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.matchedKeywords.map((kw) => (
                          <Badge key={kw} variant="info">{kw}</Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No job keywords matched — the CV may target a different role.</p>
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={<FileSearch className="h-6 w-6" aria-hidden="true" />}
                  title="No analysis yet"
                  description="Paste a CV on the left and click Analyze CV."
                />
              )}
            </div>
          </div>
        </TabsContent>

        {/* ---------------- Job Postings ---------------- */}
        <TabsContent value="jobs" className="flex flex-col gap-4">
          {loading ? (
            <div className="flex items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-xl border bg-card shadow-sm">
              <EmptyState
                icon={<Briefcase className="h-6 w-6" aria-hidden="true" />}
                title="No job postings"
                description="Post your first job to start collecting applicants."
                action={
                  <Button onClick={() => setJobDialogOpen(true)}>
                    <Plus aria-hidden="true" />
                    Post New Job
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {jobs.map((job) => (
                <div key={job.id} className="flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{job.title}</p>
                      <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                        {job.department ?? "—"}
                      </p>
                    </div>
                    <StatusBadge status={job.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={job.type} />
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      {job.location ?? "Remote"}
                    </span>
                    <span className="text-xs text-muted-foreground">· {job.openings} opening{job.openings === 1 ? "" : "s"}</span>
                  </div>
                  {job.description ? (
                    <p className="line-clamp-2 text-sm text-muted-foreground">{job.description}</p>
                  ) : null}
                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" aria-hidden="true" />
                      {job._count?.candidates ?? 0} applicant{(job._count?.candidates ?? 0) === 1 ? "" : "s"}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleJobStatus(job)}
                      >
                        {job.status === "open" ? "Pause" : "Reopen"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="iconSm"
                        aria-label={`Delete job ${job.title}`}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => onDeleteJob(job)}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* New Job dialog */}
      <Dialog open={jobDialogOpen} onOpenChange={setJobDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Post New Job</DialogTitle>
            <DialogDescription>Create a job posting that applicants and CV scoring will target.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onCreateJob} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="job-title">Job Title</Label>
              <Input
                id="job-title"
                required
                placeholder="e.g. Senior Frontend Engineer"
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="job-department">Department</Label>
                <Input
                  id="job-department"
                  placeholder="e.g. Engineering"
                  value={jobForm.department}
                  onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="job-location">Location</Label>
                <Input
                  id="job-location"
                  placeholder="e.g. Riyadh"
                  value={jobForm.location}
                  onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="job-type">Type</Label>
                <Select value={jobForm.type} onValueChange={(v) => setJobForm({ ...jobForm, type: v })}>
                  <SelectTrigger id="job-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {labelize(t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="job-openings">Openings</Label>
                <Input
                  id="job-openings"
                  type="number"
                  min="1"
                  max="99"
                  step="1"
                  required
                  value={jobForm.openings}
                  onChange={(e) => setJobForm({ ...jobForm, openings: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="job-description">Description</Label>
              <Textarea
                id="job-description"
                rows={4}
                placeholder="Responsibilities, requirements and keywords for CV matching…"
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setJobDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={jobSaving}>
                {jobSaving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                Post Job
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
