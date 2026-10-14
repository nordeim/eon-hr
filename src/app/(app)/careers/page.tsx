"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Briefcase, Building2, Clock, DollarSign, Loader2, MapPin, Search } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface JobRow {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  type: string;
  status: string;
  description: string | null;
  company: string | null;
  salaryRange: string | null;
}

/**
 * The /careers page — parity rounds 31 + 33 + 40 + 41.
 *
 * Round 41 (R40-B…H) re-measured the whole family after the mobile
 * pixel-diff (round-39's deferred frontier): the board content is a
 * centered wide container with the tall vertical rhythm (both views);
 * the zero-state is the icon-over-line card (the shared briefcase
 * family — the padding rides on the card itself, the briefcase centers
 * itself, the heading keeps a tight bottom gap, and the message is
 * state-dependent: the recovery line for the empty board and the org
 * view, the search line for the filtered zero); the count heading sits
 * in a between-aligned flex row; the job card is REF's first measurable
 * with-data contract — the status badge, the company line under the
 * title, the four-row icon meta stack (office / map / clock / dollar,
 * the type lowercase), the three-line description clamp, and the
 * full-width apply CTA that routes to the external application page
 * with the org + job slugs; the org view wraps the back button + the
 * company heading in the tall-gap section; and the chips are built
 * from the job's COMPANY (REF's chips are companies — the department
 * source was semantically wrong).
 *
 * Supersets: the search input filters the list client-side; the org
 * state is URL-driven (shareable, back/forward works); the external
 * page resolves the apply params (REF's own target renders its
 * zero-state for them).
 */
export default function CareersPage() {
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = React.useState<JobRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/jobs?status=open");
        const json = await res.json();
        if (json.ok) setJobs(json.data.jobs);
        else toast.toast({ title: "Failed to load openings", description: json.error?.message, variant: "error" });
      } catch {
        toast.toast({ title: "Network error", variant: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  /* R40-H: REF's chips are companies — the board's org dimension. */
  const companies = React.useMemo(() => {
    const set = new Set<string>();
    for (const j of jobs) if (j.company) set.add(j.company);
    return [...set].sort();
  }, [jobs]);

  /* The shared slug contract (R39-S + R40-F): lowercase, dash-joined —
     the company feeds ?org=, the title feeds ?job=. */
  const slug = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const orgParam = searchParams.get("org");
  const activeCompany = orgParam
    ? companies.find((c) => slug(c) === orgParam) ?? null
    : null;

  const visible = React.useMemo(() => {
    let list = activeCompany ? jobs.filter((j) => j.company === activeCompany) : jobs;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          (j.company ?? "").toLowerCase().includes(q) ||
          (j.department ?? "").toLowerCase().includes(q) ||
          (j.location ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [jobs, activeCompany, query]);

  const openOrg = (c: string) => router.push(`/careers?org=${slug(c)}`);
  const backToAll = () => router.push("/careers");

  const countHeading = (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-xl font-semibold text-slate-900">
        {visible.length} Open Position{visible.length === 1 ? "" : "s"}
      </h3>
    </div>
  );

  const list = loading ? (
    <div className="flex h-40 items-center justify-center">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
    </div>
  ) : visible.length === 0 ? (
    /* R40-C: REF's icon-over-line zero card — the message depends on the
       state (the search-filtered zero gets its own line). */
    <Card className="text-center py-12">
      <CardContent className="p-6 pt-0">
        <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" aria-hidden="true" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No Open Positions</h3>
        <p className="text-slate-600">
          {query.trim()
            ? "No jobs match your search. Try different keywords."
            : "Check back later for new opportunities!"}
        </p>
      </CardContent>
    </Card>
  ) : (
    <div className="grid md:grid-cols-2 gap-6">
      {visible.map((j) => (
        <Card key={j.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="border-b">
            {/* R40-E2: the title row — the title/company block + the
                status badge, start-aligned between with a tight gap. */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div>
                  <div className="font-semibold tracking-tight text-xl">{j.title}</div>
                  {j.company ? <p className="text-sm text-slate-600">{j.company}</p> : null}
                </div>
              </div>
              <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent shadow hover:bg-primary/80 bg-green-100 text-green-700">
                Open
              </div>
            </div>
            {/* R40-E4: the four-row meta stack — office, map, clock
                (lowercase), dollar. */}
            <div className="space-y-2 text-sm text-slate-600">
              {j.department ? (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" aria-hidden="true" /> {j.department}
                </div>
              ) : null}
              {j.location ? (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" aria-hidden="true" /> {j.location}
                </div>
              ) : null}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" aria-hidden="true" /> {j.type.replace(/_/g, " ")}
              </div>
              {j.salaryRange ? (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" aria-hidden="true" /> {j.salaryRange}
                </div>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-4">
            {j.description ? <p className="text-slate-700 line-clamp-3 mb-4">{j.description}</p> : null}
            {/* R40-F: the apply CTA — the external application page with
                the org + job slugs (REF's contract). */}
            <Button
              className="w-full"
              onClick={() =>
                router.push(`/externaljobapplication?org=${slug(j.company ?? "")}&job=${slug(j.title)}`)
              }
            >
              View Details &amp; Apply
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* REF's hero: the sRGB-pinned blue→indigo band (trap 3), the
          centered wide nesting, and the job-search input (the migrated
          base + the tall padding + the large mobile font, h=50). */}
      <div className="bg-[linear-gradient(to_right,#2563eb,#4f46e5)] py-16 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Find Your Dream Job</h1>
            <p className="text-xl text-blue-100 mb-8">Explore opportunities from top companies powered by EonHR</p>
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search jobs by title, department, or location..."
                  aria-label="Search jobs"
                  className="pl-12 py-6 text-lg bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* R40-B: the board content — the centered wide container with the
          tall rhythm (the board and the org view share it). */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {activeCompany ? (
          /* R40-G: the org view — the back button + the company heading
             ride in the tall-gap section. */
          <div className="mb-8">
            <Button
              variant="ghost"
              className="hover:bg-accent hover:text-accent-foreground mb-4"
              onClick={backToAll}
            >
              ← Back to all companies
            </Button>
            <h2 className="text-3xl font-bold text-slate-900">{activeCompany}</h2>
          </div>
        ) : (
          <>
            {/* REF's with-data company section: the tall-gap wrapper > the
                heading + the outline chips in the wrapping row. */}
            {companies.length > 0 ? (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Browse by Company</h2>
                <div className="flex gap-3 flex-wrap">
                  {companies.map((c) => (
                    <Button key={c} variant="outline" className="h-auto py-3 px-4" onClick={() => openOrg(c)}>
                      {c}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
        {countHeading}
        {list}
      </div>
    </div>
  );
}
