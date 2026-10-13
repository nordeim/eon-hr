"use client";

import * as React from "react";
import { Building2, Loader2, MapPin, Search } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
 * The /careers page — parity rounds 31 + 33.
 *
 * Round 31 delivered the registry recovery (Careers): the blue-600→
 * indigo-600 sRGB hero + the zero-data "No Open Positions" contract.
 *
 * Round 33 (R33-E): the at-rest census re-measured REF's hero with its
 * live data and found structure the round-31 build missed — the page
 * carries its OWN canvas (`min-h-screen bg-gradient-to-br from-blue-50
 * to-indigo-50`); the hero nests `max-w-6xl mx-auto px-4` >
 * `text-center` > [h1 `text-5xl font-bold mb-4`][p `text-xl
 * text-blue-100 mb-8`][the job-search input — a `max-w-2xl mx-auto`
 * wrapper, placeholder "Search jobs by title, department, or
 * location..."] (hero h=302, h1 y=64 x=288); with-data: the "Browse
 * by Company" H2 (`text-2xl font-bold text-slate-900 mb-4` y=350) +
 * company chips at Button-outline geometry (h-46, rounded-md, the
 * default border token, text-sm/500 foreground).
 *
 * Supersets: the search input filters the job list client-side; the
 * chips filter by company (clicking the active chip again clears).
 */
export default function CareersPage() {
  const toast = useToast();
  const [jobs, setJobs] = React.useState<JobRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [company, setCompany] = React.useState<string | null>(null);
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
  const visible = React.useMemo(() => {
    let list = company ? jobs.filter((j) => j.department === company) : jobs;
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
  }, [jobs, company, query]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* REF's hero: the sRGB-pinned blue→indigo band (trap 3), the
          max-w-6xl px-4 nesting, and the job-search input. */}
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
                  className="h-12 pl-11 rounded-lg border-slate-200 bg-white text-slate-900 shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8">
        {/* REF's with-data company section: the H2 + the h-46 chips */}
        {companies.length > 0 ? (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Browse by Company</h2>
            <div className="flex flex-wrap items-center gap-3">
              {companies.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCompany(company === c ? null : c)}
                  className={
                    company === c
                      ? "h-[46px] rounded-md border border-slate-900 bg-slate-900 px-4 text-sm font-medium text-white"
                      : "h-[46px] rounded-md border bg-white px-4 text-sm font-medium text-foreground hover:bg-slate-50"
                  }
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {loading ? (
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
                  <p className="mt-1 text-sm text-slate-600">Company</p>
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
        )}
      </div>
    </div>
  );
}
