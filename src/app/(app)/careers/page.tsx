"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Loader2, MapPin, Search } from "lucide-react";
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
}

/**
 * The /careers page — parity rounds 31 + 33 + 40.
 *
 * Round 31 delivered the registry recovery (Careers): the blue-600→
 * indigo-600 sRGB hero + the zero-data "No Open Positions" contract.
 *
 * Round 33 (R33-E): the at-rest census re-measured REF's hero with its
 * live data — the page carries its OWN canvas (`min-h-screen
 * bg-gradient-to-br from-blue-50 to-indigo-50`); the hero nests
 * `max-w-6xl mx-auto px-4` > `text-center` > [h1 `text-5xl font-bold
 * mb-4`][p `text-xl text-blue-100 mb-8`][the job-search input — a
 * `max-w-2xl mx-auto` wrapper, placeholder "Search jobs by title,
 * department, or location..."].
 *
 * Round 40 (R39-P…T): REF's public board re-measured with its
 * cross-tenant demo data (517 company chips) — the chips are the v4
 * Button outline family (`h-auto py-3 px-4`, shadow-sm, the accent
 * hover, measured h=46) in a `flex gap-3 flex-wrap` row inside the
 * mb-8 section; a count h3 (`text-xl font-semibold text-slate-900`,
 * "N Open Position(s)") rides between the section and the grid; the
 * hero input is the migrated base + `pl-12 py-6 text-lg bg-white`
 * (h=50, 18px mobile font); and the chips NAVIGATE — clicking one
 * routes to `/careers?org=<slug>` (REF's own client-side artifact is
 * the capitalized /Careers path) rendering the org view: the back
 * button ("← Back to all companies", the ghost family + mb-4), the
 * org-name h2 `text-3xl font-bold text-slate-900`, the count h3, and
 * the filtered list.
 *
 * Supersets: the search input filters the job list client-side; the
 * org state is URL-driven (shareable, back/forward works).
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

  const companies = React.useMemo(() => {
    const set = new Set<string>();
    for (const j of jobs) if (j.department) set.add(j.department);
    return [...set].sort();
  }, [jobs]);

  /* Session 40 (R39-S): the org slug — REF's chips navigate to
     ?org=<slug> (lowercase, dash-joined). */
  const orgSlug = (c: string) =>
    c.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const orgParam = searchParams.get("org");
  const activeCompany = orgParam
    ? companies.find((c) => orgSlug(c) === orgParam) ?? null
    : null;

  const visible = React.useMemo(() => {
    let list = activeCompany ? jobs.filter((j) => j.department === activeCompany) : jobs;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          (j.department ?? "").toLowerCase().includes(q) ||
          (j.location ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [jobs, activeCompany, query]);

  const openOrg = (c: string) => router.push(`/careers?org=${orgSlug(c)}`);
  const backToAll = () => router.push("/careers");

  const countHeading = (
    <h3 className="text-xl font-semibold text-slate-900">
      {visible.length} Open Position{visible.length === 1 ? "" : "s"}
    </h3>
  );

  const list = loading ? (
    <div className="flex h-40 items-center justify-center">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
    </div>
  ) : visible.length === 0 ? (
    /* REF's zero-data contract */
    <Card className="border-slate-200 shadow">
      <CardContent className="p-12 text-center">
        <h3 className="text-xl font-semibold text-slate-900">No Open Positions</h3>
        <p className="mt-2 text-slate-500">Check back later for new opportunities!</p>
      </CardContent>
    </Card>
  ) : (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {visible.map((j) => (
        <Card key={j.id} className="border-slate-200 shadow transition-shadow hover:shadow-lg">
          <CardHeader className="border-b p-6">
            <p className="font-semibold text-slate-900">{j.title}</p>
            <p className="mt-1 text-sm text-slate-600">{j.department}</p>
          </CardHeader>
          <CardContent className="p-6">
            <p className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              {j.department ? (
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-4 w-4" aria-hidden="true" /> {j.department}
                </span>
              ) : null}
              {j.location ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" aria-hidden="true" /> {j.location}
                </span>
              ) : null}
              <span className="capitalize">{j.type.replace(/_/g, " ")}</span>
            </p>
            {j.description ? <p className="mt-3 text-slate-700">{j.description}</p> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* REF's hero: the sRGB-pinned blue→indigo band (trap 3), the
          max-w-6xl px-4 nesting, and the job-search input (session 40:
          the migrated base + pl-12 py-6 text-lg bg-white — h=50). */}
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

      <div className="p-4 md:p-8">
        {activeCompany ? (
          /* Session 40 (R39-S): the org view — REF's ?org= contract. */
          <div>
            <Button
              variant="ghost"
              className="hover:bg-accent hover:text-accent-foreground mb-4"
              onClick={backToAll}
            >
              ← Back to all companies
            </Button>
            <h2 className="text-3xl font-bold text-slate-900">{activeCompany}</h2>
            <div className="mt-4 mb-6">{countHeading}</div>
            {list}
          </div>
        ) : (
          <>
            {/* REF's with-data company section: the mb-8 wrapper > the H2
                (mb-4) + the v4 outline chips in a flex gap-3 flex-wrap row. */}
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
            <div className="mb-6">{countHeading}</div>
            {list}
          </>
        )}
      </div>
    </div>
  );
}
