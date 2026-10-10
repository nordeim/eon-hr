"use client";

import * as React from "react";
import { Plus, ChevronDown, Search, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { PageHeader } from "@/components/shared/page-header";
import { useToast } from "@/components/ui/toast";
import { initials } from "@/lib/utils";

interface CandidateRow {
  id: string;
  jobPostingId: string;
  name: string;
  email: string | null;
  stage: string;
  aiScore: number | null;
  appliedAt: string;
  jobPosting: { id: string; title: string; department: string | null } | null;
}

interface JobRow {
  id: string;
  title: string;
}

const COLUMNS = [
  { stage: "applied", label: "Applied", dot: "bg-blue-500" },
  { stage: "interviewing", label: "Interviewing", dot: "bg-violet-500" },
  { stage: "offer", label: "Offer", dot: "bg-amber-500" },
  { stage: "hired", label: "Hired", dot: "bg-emerald-500" },
  { stage: "rejected", label: "Rejected", dot: "bg-red-500" },
];

function labelize(v: string): string {
  return v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function RecruitmentKanbanPage() {
  const toast = useToast();
  const [candidates, setCandidates] = React.useState<CandidateRow[]>([]);
  const [jobs, setJobs] = React.useState<JobRow[]>([]);
  const [jobFilter, setJobFilter] = React.useState("all");
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", email: "", jobId: "", stage: "applied" });

  const load = React.useCallback(async () => {
    try {
      const [candRes, jobsRes] = await Promise.all([fetch("/api/candidates"), fetch("/api/jobs")]);
      const candJson = await candRes.json();
      const jobsJson = await jobsRes.json();
      if (candJson.ok) setCandidates(candJson.data.candidates);
      else toast.toast({ title: "Failed to load pipeline", description: candJson.error?.message, variant: "error" });
      if (jobsJson.ok) setJobs(jobsJson.data.jobs);
    } catch {
      toast.toast({ title: "Failed to load pipeline", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return candidates.filter((c) => {
      if (jobFilter !== "all" && c.jobPostingId !== jobFilter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.jobPosting?.title ?? "").toLowerCase().includes(q)
      );
    });
  }, [candidates, jobFilter, query]);

  async function onAddApplicant(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.jobId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobPostingId: form.jobId,
          name: form.name,
          email: form.email,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Failed to add applicant", description: json.error?.message, variant: "error" });
        return;
      }
      // Server creates candidates in "applied"; move immediately if another
      // stage was chosen in the dialog.
      if (form.stage !== "applied") {
        await fetch(`/api/candidates?id=${json.data.candidate.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage: form.stage }),
        });
      }
      toast.toast({ title: "Applicant added", description: `${form.name} is in the pipeline.`, variant: "success" });
      setDialogOpen(false);
      setForm({ name: "", email: "", jobId: "", stage: "applied" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function onMove(candidate: CandidateRow, stage: string) {
    try {
      const res = await fetch(`/api/candidates?id=${candidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Move failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: `${candidate.name} → ${labelize(stage)}`, variant: "success" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  async function onDelete(candidate: CandidateRow) {
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

  return (
    <div className="p-4 md:p-8">
      {/* Session 11 (R10-K): the reference renders this page FULL-WIDTH —
          no max-w container (content spans 1344px at 1440). Header carries
          only the Add Applicant CTA; below it a `flex flex-col sm:flex-row
          gap-3` filter row (search input flex-1 with the 16px icon at
          left-3 top-2.5 + the All Jobs select w-48), then the board:
          `flex gap-4 overflow-x-auto pb-4` with five w-64 columns —
          `rounded-lg border-2 bg-slate-100 border-slate-300` p-3.5, the
          column header (`flex items-center justify-between mb-3`: h3
          `font-semibold text-slate-700 text-sm` + the count badge
          `inline-flex items-center rounded-md border px-2.5` 30x22) over a
          `min-h-32 rounded-md` drop zone. The clone's working
          search/filter/move/delete flow rides the reference's furniture. */}
      <div className="flex flex-col space-y-6">
      <PageHeader
        size="md"
        title="Recruitment Pipeline"
        subtitle="Track candidates through the hiring process"
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2" aria-hidden="true" />
            Add Applicant
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            aria-label="Search candidates"
            placeholder="Search candidates, jobs or emails…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
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
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const colCandidates = visible.filter((c) => c.stage === col.stage);
            return (
              <div key={col.stage} className="w-64 shrink-0 rounded-lg border-2 border-slate-300 bg-slate-100 p-3.5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700">{col.label}</h3>
                  <span className="inline-flex h-[22px] items-center rounded-md border px-2.5 text-xs font-semibold text-muted-foreground">
                    {colCandidates.length}
                  </span>
                </div>
                <div className="flex min-h-32 flex-col gap-2 rounded-md transition-colors">
                  {colCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="flex flex-col gap-2 rounded-md border bg-card p-3 text-left shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{candidate.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {candidate.jobPosting?.title ?? "—"}
                          </p>
                        </div>
                        {candidate.aiScore !== null ? (
                          <Badge variant={candidate.aiScore >= 75 ? "success" : candidate.aiScore >= 50 ? "warning" : "destructive"}>
                            AI {candidate.aiScore}
                          </Badge>
                        ) : null}
                      </div>
                      <div className="flex items-center justify-between border-t pt-2">
                        <span className="text-xs text-muted-foreground">
                          {initials(candidate.name)} · {labelize(candidate.stage)}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" aria-label={`Move ${candidate.name}`}>
                              Move to
                              <ChevronDown aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Move to</DropdownMenuLabel>
                            {COLUMNS.filter((c) => c.stage !== candidate.stage).map((c) => (
                              <DropdownMenuItem key={c.stage} onClick={() => onMove(candidate, c.stage)}>
                                {c.label}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => onDelete(candidate)}>
                              <Trash2 aria-hidden="true" /> Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Applicant</DialogTitle>
            <DialogDescription>Add a candidate to the hiring pipeline.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onAddApplicant} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ka-name">Full Name</Label>
              <Input
                id="ka-name"
                required
                placeholder="e.g. Sara Almutairi"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ka-email">Email (optional)</Label>
              <Input
                id="ka-email"
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ka-job">Job</Label>
                <Select value={form.jobId} onValueChange={(v) => setForm({ ...form, jobId: v })}>
                  <SelectTrigger id="ka-job">
                    <SelectValue placeholder="Select job" />
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
                <Label htmlFor="ka-stage">Stage</Label>
                <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}>
                  <SelectTrigger id="ka-stage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLUMNS.map((c) => (
                      <SelectItem key={c.stage} value={c.stage}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || jobs.length === 0}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                Add Applicant
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
}
