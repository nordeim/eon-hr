"use client";

import * as React from "react";
import { ExternalLink, GraduationCap, Loader2, MonitorSmartphone, Plus, Video } from "lucide-react";
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
import { useToast } from "@/components/ui/toast";
import { initials } from "@/lib/utils";

interface Platform {
  id: string;
  name: string;
  category: string;
  description: string | null;
  url: string | null;
  coursesCount: number;
  logoColor: string;
}

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "technical", label: "Technical" },
  { value: "soft_skills", label: "Soft Skills" },
  { value: "compliance", label: "Compliance" },
  { value: "product", label: "Product" },
  { value: "tools", label: "Tools" },
  { value: "leadership", label: "Leadership" },
];

function categoryLabel(v: string): string {
  return CATEGORIES.find((c) => c.value === v)?.label ?? v.replace(/_/g, " ");
}

function categoryVariant(v: string): "info" | "secondary" | "success" | "warning" | "purple" | "default" {
  switch (v) {
    case "technical":
      return "info";
    case "soft_skills":
      return "success";
    case "compliance":
      return "warning";
    case "product":
      return "purple";
    case "tools":
      return "secondary";
    case "leadership":
      return "default";
    default:
      return "secondary";
  }
}

export default function TrainingPage() {
  const toast = useToast();
  const [platforms, setPlatforms] = React.useState<Platform[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [category, setCategory] = React.useState("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/training");
      const json = await res.json();
      if (json.ok) setPlatforms(json.data.platforms);
      else toast.toast({ title: "Failed to load training platforms", description: json.error?.message, variant: "error" });
    } catch {
      toast.toast({ title: "Network error", description: "Could not load training platforms.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(data: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch("/api/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Failed to add platform", description: json.error?.message, variant: "error" });
        return false;
      }
      toast.toast({ title: "Training platform added", description: "It is now visible to all employees.", variant: "success" });
      await load();
      return true;
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
      return false;
    } finally {
      setSaving(false);
    }
  }

  const filtered = React.useMemo(
    () => (category === "all" ? platforms : platforms.filter((p) => p.category === category)),
    [platforms, category]
  );

  function onVisit(platform: Platform) {
    if (platform.url) {
      window.open(platform.url, "_blank", "noopener,noreferrer");
    } else {
      toast.toast({ title: "No link configured", description: `${platform.name} has no URL yet.`, variant: "info" });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        /* Session 49 (R48-A2): the bare family — REF renders the hero
         *  block as a DIRECT child of the content wrapper (no hero row).
         *  Live-measured @1440×900 this round. */
        bare
        section="Learning Management System"
        layout="flat48"
        centered
        iconClassName="text-purple-600"
        sectionIcon={<Video aria-hidden="true" />}
        title="Training Center"
        subtitle="Expand your skills with our comprehensive training library"
      />

      {/* Session 10 (R9-C): the reference renders its category tabs as
          bare dark/outline buttons (the taskmanager-toggle family) in a
          flex gap-2 overflow-x-auto pb-2 list — active bg-[#171717] with
          12px/500 white text, inactive white with the neutral border —
          NOT the shadcn segmented tab strip.
          Session 15 (R14-B): role downgraded tablist→group — the reference
          renders a plain div, and a tablist whose children are aria-pressed
          toggle buttons (not tabs) is invalid ARIA. */}
      <div className="flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Training categories">
        {CATEGORIES.map((c) => (
          <Button
            key={c.value}
            variant={category === c.value ? "dark" : "outline"}
            size="sm"
            className="shrink-0"
            aria-pressed={category === c.value}
            onClick={() => setCategory(c.value)}
          >
            {c.label}
          </Button>
        ))}
      </div>

      {/* Session 10 (R9-C): the reference's section furniture — a bare
          text-2xl/700 H2 in a flex items-center justify-between mb-6 row
          with the right slot EMPTY (32px row, live-measured session 15:
          the reference page renders NO create affordance anywhere — its
          all-buttons inventory is the seven category chips only). */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Training Platforms</h2>
        </div>
        <Card>
          {/* p-0: the reference's empty state (p-12) renders directly in
              the card — no interior padding layer. */}
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
              </div>
            ) : filtered.length === 0 ? (
              /* Reference simple empty state: p-12 text-center + 64px icon +
                 ONE 16px slate-500 line — no h3, no description, NO create
                 button (session 47 re-measurement; the session-15 CTA
                 retired — the with-data entry is the grid's dashed
                 add-tile). */
              <div className="p-12 text-center">
                <div className="flex justify-center">
                  <GraduationCap className="h-16 w-16 text-slate-300" aria-hidden="true" />
                </div>
                <p className="mt-3 text-slate-500">No training platforms available</p>
              </div>
            ) : (
              /* Session 47 (R46-H1): REF's zero-state renders NO create
                 button — the with-data entry is the session-15 dashed
                 add-tile below (the create flow stays reachable). */
              <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((platform) => (
                  <div key={platform.id} className="flex flex-col gap-4 rounded-xl border bg-secondary/30 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
                          style={{ backgroundColor: platform.logoColor }}
                        >
                          {initials(platform.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{platform.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {platform.coursesCount.toLocaleString()} course{platform.coursesCount === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>
                      <Badge variant={categoryVariant(platform.category)}>{categoryLabel(platform.category)}</Badge>
                    </div>
                    {platform.description ? (
                      <p className="line-clamp-2 text-sm text-muted-foreground">{platform.description}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">No description provided.</p>
                    )}
                    <div className="flex items-center justify-between gap-2 border-t pt-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MonitorSmartphone className="h-4 w-4" aria-hidden="true" />
                        {categoryLabel(platform.category)}
                      </span>
                      <Button size="sm" variant="outline" onClick={() => onVisit(platform)}>
                        <ExternalLink aria-hidden="true" />
                        Visit Platform
                      </Button>
                    </div>
                  </div>
                ))}
                {/* Session 15 (R14-B): the with-data create affordance — a
                    trailing dashed add-tile in the grid (the reference
                    renders none; this keeps the superset reachable now that
                    the h2-row button is gone). */}
                <button
                  type="button"
                  onClick={() => setDialogOpen(true)}
                  className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 p-5 text-sm font-medium text-slate-500 transition-colors hover:border-slate-400 hover:text-slate-600"
                >
                  <Plus className="h-6 w-6" aria-hidden="true" />
                  Add Platform
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <NewPlatformDialog open={dialogOpen} saving={saving} onOpenChange={setDialogOpen} onSave={onCreate} />
    </div>
    </div>
  );
}

function NewPlatformDialog({
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
  const [form, setForm] = React.useState({
    name: "",
    category: "technical",
    description: "",
    url: "",
    coursesCount: "0",
  });

  React.useEffect(() => {
    if (open) setForm({ name: "", category: "technical", description: "", url: "", coursesCount: "0" });
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const courses = Number(form.coursesCount);
    const saved = await onSave({
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      url: form.url.trim(),
      coursesCount: Number.isFinite(courses) && courses >= 0 ? Math.round(courses) : 0,
    });
    if (saved) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Training Platform</DialogTitle>
          <DialogDescription>Add an external learning platform to the training library.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tp-name">Platform Name</Label>
            <Input id="tp-name" required maxLength={80} placeholder="e.g. Udemy Business" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tp-category">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger id="tp-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter((c) => c.value !== "all").map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tp-courses">Courses Count</Label>
              <Input id="tp-courses" type="number" min="0" step="1" value={form.coursesCount} onChange={(e) => setForm({ ...form, coursesCount: e.target.value })} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tp-url">Platform URL</Label>
            <Input id="tp-url" type="url" placeholder="https://…" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tp-desc">Description</Label>
            <Textarea id="tp-desc" maxLength={300} rows={2} placeholder="What can employees learn here?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              Add Platform
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
