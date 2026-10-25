"use client";

import * as React from "react";
import { Briefcase, CircleCheckBig, FileSearch, Filter, Loader2, Plus, Sparkles, Trash2, TrendingUp, Upload, UserPlus, Users } from "lucide-react";
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
import { deriveCandidateName, extractTextFromFile } from "@/lib/cv-text";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useToast } from "@/components/ui/toast";
import { initials, timeAgo, cn } from "@/lib/utils";

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
  experience: number | null;
  source: string | null;
  aiScore: number | null;
  skillsMatch: number | null;
  notes: string | null;
  appliedAt: string;
  jobPosting: { id: string; title: string; department: string | null } | null;
}

const STAGES = ["applied", "interviewing", "offer", "hired", "rejected"];
const TYPE_OPTIONS = ["full_time", "part_time", "contract", "intern"];
/* Session 93 (R93-B): the REF's Post New Job Employment Type — the four
   with the -ship member (live-read: Full Time/Part Time/Contract/Internship;
   the employee WIZARD's set carries "Intern" instead — the REF's own
   per-surface divergence, preserved verbatim). */
const POSTJOB_TYPE_LABELS: Record<string, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
  intern: "Internship",
};

/* Session 91 (R91-C): the REF's table-filter STATUS vocabulary — the 7
 * lowercase raw values live-read from the REF's open filter (its kanban
 * uses the 5-stage `stage` field; the table filter uses this separate
 * pipeline vocabulary). The stage→status mapping predicate keeps the
 * clone's 5-stage pipeline filterable through the REF's set (reviewed /
 * shortlisted have no clone stage — they match nothing, the same effective
 * behavior as the REF's zero-candidate data). */
const CANDIDATE_STATUSES = [
  "new",
  "reviewed",
  "shortlisted",
  "interview scheduled",
  "offered",
  "hired",
  "rejected",
] as const;

const STAGE_TO_STATUS: Record<string, string> = {
  applied: "new",
  interviewing: "interview scheduled",
  offer: "offered",
  hired: "hired",
  rejected: "rejected",
};

/* The REF's three sort modes (live-read: AI Score, Application Date,
 * Experience). */
const SORT_OPTIONS = [
  { value: "default", label: "AI Score" },
  { value: "appliedAt", label: "Application Date" },
  { value: "experience", label: "Experience" },
] as const;

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

  /* Session 93 (R93-B): Post New Job renders an INLINE FORM SECTION on the
     Applicants tab (between the tab bar and the filter row), not a dialog;
     the tabs become controlled so Upload CV can deep-link to the CV tab. */
  const [tab, setTab] = React.useState("applicants");
  const [showJobForm, setShowJobForm] = React.useState(false);
  const [jobSaving, setJobSaving] = React.useState(false);
  const [jobForm, setJobForm] = React.useState({
    title: "",
    department: "",
    location: "",
    type: "full_time",
    description: "",
    requirements: "",
  });

  // AI CV upload tab state
  const [cvJobId, setCvJobId] = React.useState("");
  const [analyzing, setAnalyzing] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<{ name: string; job: string; aiScore: number; skillsMatch: number; matchedKeywords: string[] } | null>(null);
  const cvFileRef = React.useRef<HTMLInputElement>(null);

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
    /* Session 93 (R93-H): the REF's stat counts ACTIVE jobs (the draft
        postings stay out of the number — the REF's own 1/0/0 tenant). */
    const activeJobs = jobs.filter((j) => j.status === "active").length;
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
        (statusFilter === "all" || (STAGE_TO_STATUS[c.stage] ?? c.stage) === statusFilter)
    );
    if (scoreSort === "aiScore") {
      list = [...list].sort((a, b) => (b.aiScore ?? -1) - (a.aiScore ?? -1));
    } else if (scoreSort === "appliedAt") {
      list = [...list].sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
    } else if (scoreSort === "experience") {
      list = [...list].sort((a, b) => (b.experience ?? -1) - (a.experience ?? -1));
    }
    return list;
  }, [candidates, jobFilter, statusFilter, scoreSort]);

  async function onCreateJob(e: React.FormEvent) {
    e.preventDefault();
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
          description: jobForm.description,
          requirements: jobForm.requirements,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Failed to post job", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Job created", description: `${jobForm.title} was saved as a draft posting.`, variant: "success" });
      setShowJobForm(false);
      setJobForm({ title: "", department: "", location: "", type: "full_time", description: "", requirements: "" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setJobSaving(false);
    }
  }

  async function onToggleJobStatus(job: JobRow) {
    /* Session 93 (R93-H): the REF's vocabulary — draft ↔ active (publish /
       unpublish; the functional superset over the REF's static cards). */
    const status = job.status === "active" ? "draft" : "active";
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
      toast.toast({ title: status === "active" ? "Job published" : "Job unpublished", variant: "success" });
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

  /* Session 95 (R95-A): the REF's AI CV Upload tab is a FILE-UPLOAD surface
     — "Upload Candidate CV / PDF, DOC, DOCX — AI will parse & score
     automatically" with the hidden .pdf/.doc/.docx input (live-captured on
     the REF). The superset flow: the filename stem becomes the candidate
     name, the text is extracted client-side (zero-dependency — the
     DecompressionStream .docx/.pdf readers in src/lib/cv-text.ts), and the
     deterministic keyword-overlap API scores it. */
  async function onCvFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-uploading the same file
    if (!file || !cvJobId) return;
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const cvText = await extractTextFromFile(file);
      if (!cvText) {
        toast.toast({
          title: "Couldn't read the CV text",
          description: "Try a text-based PDF, DOCX, or DOC file.",
          variant: "error",
        });
        return;
      }
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobPostingId: cvJobId, name: deriveCandidateName(file.name), email: "", cvText }),
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
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        rowBreakpoint="md"
        actionsUnwrapped
        section="AI-Powered Recruitment"
        layout="flat36-sm"
        iconClassName="text-indigo-600"
        sectionIcon={<UserPlus aria-hidden="true" />}
        title="Recruitment"
        subtitle="AI-assisted CV parsing, scoring & applicant tracking"
        actions={
          /* Session 58 (R58-16): REF's Post New Job is the REVERSED blue
             gradient — from-indigo-600 to-blue-600 (#4F46E5→#2563EB,
             the endpoints swapped vs the default CTA — live-measured,
             the CTA-fill census).
             Session 86 companion pass (R86-E): REF's CTA icon is
             lucide-USER-PLUS (live-read: `lucide lucide-user-plus w-4
             h-4 mr-2` — the person+plus glyph, 49 white pixels vs the
             plain plus's 21 in the icon cell; the text geometry
             identical cross-side). The glyph identity was invisible to
             the color/text censuses (the r63 lesson class) — the
             cross-side pixel diff surfaced it. */
          <Button variant="indigoBlue" onClick={() => setShowJobForm(true)}>
            <UserPlus className="w-4 h-4 mr-2" aria-hidden="true" />
            Post New Job
          </Button>
        }
      />

      {/* Session 47 (R46-B2, corrected): the stats render at ZERO too (the
          first census read missed the DIV-valued cards). REF's measured
          family: briefcase / users / circle-check-big / trending-up with
          the per-color indigo/blue/green/purple tiles. */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard variant="compact" label="Active Jobs" value={stats.activeJobs} icon={<Briefcase className="w-5 h-5 text-indigo-600" aria-hidden="true" />} tileClassName="bg-indigo-100" />
        <StatCard variant="compact" label="Total Applicants" value={stats.totalApplicants} icon={<Users className="w-5 h-5 text-blue-600" aria-hidden="true" />} tileClassName="bg-blue-100" />
        <StatCard variant="compact" label="Shortlisted" value={stats.shortlisted} icon={<CircleCheckBig className="w-5 h-5 text-green-600" aria-hidden="true" />} tileClassName="bg-green-100" />
        <StatCard variant="compact" label="Avg AI Score" value={stats.avgScore === null ? "—" : `${stats.avgScore}`} icon={<TrendingUp className="w-5 h-5 text-purple-600" aria-hidden="true" />} tileClassName="bg-purple-100" />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        {/* Session 15 (R14-A): the reference pill is the default
            shrink-wrapped TabsList + bg-white border border-slate-200
            (439×36); the first two triggers carry 12px lucide icons
            (users / sparkles) with gap-1 — the compliance trigger
            recipe (190/131/108 live-measured). */}
        {/* Session 95: flex-wrap — below the pill's 439px min-content the
            three labels otherwise force a 471px page min-content at mobile
            (the REF renders an EMPTY #root below ~640 on this route — the
            documented REF-broken mobile set; the superset wraps cleanly
            instead of scrolling). Desktop is untouched (487 < 768). */}
        <TabsList className="mb-0! bg-white border border-slate-200 flex-wrap">
          <TabsTrigger value="applicants" className="gap-1"><Users className="h-3 w-3" aria-hidden="true" /> Applicants &amp; Ranking</TabsTrigger>
          <TabsTrigger value="cvupload" className="gap-1"><Sparkles className="h-3 w-3" aria-hidden="true" /> AI CV Upload</TabsTrigger>
          <TabsTrigger value="jobs">Job Postings</TabsTrigger>
        </TabsList>

        {/* ---------------- Applicants & Ranking ---------------- */}
        {/* Session 12 (R11-K): the reference's toolbar — flex flex-wrap
            gap-3 items-center bg-white p-4 rounded-xl border — with a 16px
            Filter icon (session 61), w-48/w-40/w-40 selects and the ml-auto count. */}
        <TabsContent value="applicants" className="mt-6 space-y-4">
          {/* Session 93 (R93-B): the REF's Post New Job — an INLINE FORM
              CARD (rounded-xl border bg-card border-slate-200 shadow-xl, the
              indigo→blue gradient header) inserted between the tab bar and
              the filter row; the table stays visible below. */}
          {showJobForm ? (
            <div className="rounded-xl border bg-card text-card-foreground border-slate-200 shadow-xl">
              <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-blue-50">
                <div className="font-semibold leading-none tracking-tight">Post New Job</div>
              </div>
              <form onSubmit={onCreateJob} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="job-title">Job Title *</Label>
                    <Input
                      id="job-title"
                      required
                      value={jobForm.title}
                      onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="job-department">Department *</Label>
                    <Input
                      id="job-department"
                      required
                      value={jobForm.department}
                      onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="job-location">Location</Label>
                    <Input
                      id="job-location"
                      value={jobForm.location}
                      onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="job-type">Employment Type</Label>
                    <Select value={jobForm.type} onValueChange={(v) => setJobForm({ ...jobForm, type: v })}>
                      <SelectTrigger id="job-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TYPE_OPTIONS.map((t) => (
                          <SelectItem key={t} value={t}>
                            {POSTJOB_TYPE_LABELS[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="job-description">Job Description *</Label>
                  <Textarea
                    id="job-description"
                    required
                    rows={4}
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="job-requirements">Requirements</Label>
                  <Textarea
                    id="job-requirements"
                    rows={3}
                    placeholder="List required skills, experience, qualifications..."
                    value={jobForm.requirements}
                    onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowJobForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={jobSaving}>
                    {jobSaving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                    Create Job
                  </Button>
                </div>
              </form>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-xl border border-slate-200">
            {/* Session 61 (R61-V): REF's filter row leads with the
                Filter glyph in authored slate-400 (rgb(148,163,184)
                both themes — live-measured); the Users + muted-token
                authoring replaced. */}
            <Filter className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger className="w-48" aria-label="Filter by job">
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
              <SelectTrigger className="w-40" aria-label="Filter by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {/* Session 91 (R91-C): the REF's raw seven — the lowercase
                    values verbatim (live-read from the REF's open filter). */}
                {CANDIDATE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={scoreSort} onValueChange={setScoreSort}>
              <SelectTrigger className="w-40" aria-label="Sort candidates">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {/* Session 91 (R91-C): the REF's three sort modes. */}
                {SORT_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-slate-500 ml-auto">
              {visibleCandidates.length} candidate{visibleCandidates.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
              </div>
            ) : visibleCandidates.length === 0 ? (
              /* Session 12 (R11-K): the reference's in-table empty row
                 (text-center py-10 text-slate-400, 101px) under the
                 bg-slate-50 bordered thead. */
              <Table>
                <TableHeader className="bg-slate-50 border-b border-slate-200 [&_tr]:border-0">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-600">Candidate</TableHead>
                    <TableHead className="font-semibold text-slate-600">Job</TableHead>
                    {/* Session 63 (R63-F): REF's AI Score th carries the
                        trending-up icon (w-3 h-3 inside flex items-center
                        gap-1, riding the th's unflipping slate-600 — both
                        themes live-measured). */}
                    <TableHead className="font-semibold text-slate-600"><div className="flex items-center gap-1"><TrendingUp className="w-3 h-3" aria-hidden="true" />AI Score</div></TableHead>
                    <TableHead className="font-semibold text-slate-600">Skills Match</TableHead>
                    <TableHead className="font-semibold text-slate-600">Status</TableHead>
                    <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      No applicants found
                    </td>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50 border-b border-slate-200 [&_tr]:border-0">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-600">Candidate</TableHead>
                    <TableHead className="font-semibold text-slate-600">Job</TableHead>
                    {/* Session 63 (R63-F): the with-data table matches the
                        empty-state th recipe (the icon rides both). */}
                    <TableHead className="font-semibold text-slate-600"><div className="flex items-center gap-1"><TrendingUp className="w-3 h-3" aria-hidden="true" />AI Score</div></TableHead>
                    <TableHead className="font-semibold text-slate-600">Skills Match</TableHead>
                    <TableHead className="font-semibold text-slate-600">Status</TableHead>
                    <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
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
        {/* Session 95 (R95-A): the REF's tab REBUILT to its live-captured
            contract — a single STACKED column (NOT the invented 2-col grid):
            (1) the "Select Job Position" label + the w-96 combobox (the
            placeholder "Choose a job posting...", the options
            "{title} — {dept}" for ALL jobs incl. drafts, no default
            selection — verified 3x on fresh loads); (2) the CONDITIONAL
            dropzone — with no job the DISABLED form (slate-300 dashes, the
            slate-300 upload icon, "Select a job position above to start
            uploading CVs"), with a job the ACTIVE indigo form
            (border-indigo-200 dashes, the indigo-400 icon, "Upload
            Candidate CV" + "PDF, DOC, DOCX — AI will parse & score
            automatically", the hidden .pdf/.doc/.docx input; h168 at rest).
            The superset: uploading a file extracts the text client-side
            (src/lib/cv-text.ts) and renders the analysis result below —
            only after an upload (the interviewassistant AI-Analysis
            pattern; the REF's own post-upload surface is unreadable — its
            creation paths are the documented 403-broken class). */}
        <TabsContent value="cvupload" className="mt-6 space-y-4">
          {/* text-base leading-6 + the trigger's mt-2 = the REF's rendered
              geometry (its v3 space-y-2 puts margin-top on the BLOCK button;
              v4's margin-block-end on the INLINE label is layout-inert — the
              documented trap #6, restored with the explicit second-child mt) */}
          <div className="text-base leading-6">
            <Label htmlFor="cv-job">Select Job Position</Label>
            <Select value={cvJobId} onValueChange={setCvJobId}>
              <SelectTrigger id="cv-job" className="w-full max-w-96 mt-2">
                <SelectValue placeholder="Choose a job posting..." />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title} — {job.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
            {cvJobId ? (
              <div
                role="button"
                tabIndex={0}
                className="border-2 border-dashed border-indigo-200 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer"
                onClick={() => cvFileRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") cvFileRef.current?.click();
                }}
              >
                <Upload className="w-10 h-10 text-indigo-400 mx-auto mb-3" aria-hidden="true" />
                <p className="font-semibold text-slate-700 mb-1">Upload Candidate CV</p>
                <p className="text-sm text-slate-500">PDF, DOC, DOCX — AI will parse &amp; score automatically</p>
                <input
                  ref={cvFileRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={onCvFile}
                />
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                <Upload className="w-10 h-10 mx-auto mb-3 text-slate-300" aria-hidden="true" />
                <p>Select a job position above to start uploading CVs</p>
              </div>
            )}
            {analyzing ? (
              <div className="flex items-center justify-center py-6" aria-live="polite">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
                <span className="ml-2 text-sm text-muted-foreground">Parsing &amp; scoring the CV…</span>
              </div>
            ) : null}
            {analysis ? (
              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-1 pb-4">
                  <h2 className="text-base font-semibold text-foreground">Analysis Result</h2>
                  <p className="text-sm text-muted-foreground">Score summary for the last analyzed CV.</p>
                </div>
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
              </div>
            ) : null}
          </div>
        </TabsContent>

        {/* ---------------- Job Postings ---------------- */}
        {/* Session 93 (R93-H): the REF's job-postings card (live HTML read
            2026-10-25) — the header p-6/border-b carries the text-lg
            title + the "dept · location" second line + the status badge;
            the p-4 body carries the line-clamp-2 description + the
            applicants/Upload CV footer row. The badge is the REF's own
            inline recipe (rounded-md, semibold, RAW lowercase text):
            draft = slate-100/slate-600, active = green-100/green-700. */}
        <TabsContent value="jobs" className="mt-6 space-y-4">
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
                  <Button variant="dark" onClick={() => setShowJobForm(true)}>
                    <Plus className="mr-2" aria-hidden="true" />
                    Post New Job
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-xl border bg-card text-card-foreground shadow border-slate-200 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold tracking-tight text-lg">{job.title}</div>
                        <p className="text-sm text-slate-500">
                          {[job.department, job.location].filter(Boolean).join(" · ") || "—"}
                        </p>
                      </div>
                      {/* the REF's badge recipe — RAW lowercase status text */}
                      <div
                        className={cn(
                          "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold border-transparent",
                          job.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600",
                        )}
                      >
                        {job.status}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    {job.description ? (
                      <p className="text-sm text-slate-600 line-clamp-2 mb-3">{job.description}</p>
                    ) : (
                      <p className="text-sm text-slate-600 line-clamp-2 mb-3">No description provided.</p>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">
                        {job._count?.candidates ?? 0} applicants
                      </span>
                      <div className="flex items-center gap-1">
                        {/* the REF's Upload CV is inert on click — the clone
                            keeps the visible contract and wires the superset:
                            jump to the AI CV Upload tab with the job
                            preselected. */}
                        <Button
                          variant="outline"
                          className="h-8 px-3 text-xs"
                          onClick={() => {
                            setCvJobId(job.id);
                            setTab("cvupload");
                          }}
                        >
                          <Upload className="w-3 h-3 mr-1" aria-hidden="true" /> Upload CV
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onToggleJobStatus(job)}
                        >
                          {job.status === "active" ? "Unpublish" : "Publish"}
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
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
    </div>
  );
}
