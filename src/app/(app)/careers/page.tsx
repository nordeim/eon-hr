"use client";

import * as React from "react";
import { Building2, Loader2, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
 * The /careers orphan route — parity round 31 (R31-C1).
 *
 * REF serves this page (registry: Careers): the blue-600→indigo-600
 * sRGB hero (`bg-gradient-to-r`, py-16 text-center, h=174) with the
 * 48px/700 white "Find Your Dream Job" h1 + the 20px blue-200 line;
 * below, the company chip row (white h-46 buttons, with-data) + the
 * 2-col job grid (548px shadow cards, border-b p-6 headers).
 *
 * REF's job data FLUCTUATES (base44 backend; one load rendered 5
 * companies + postings, the next the empty state) — the ZERO-DATA
 * contract ("No Open Positions / Check back later for new
 * opportunities!") is the parity target; the clone renders its own
 * JobPosting rows (the superset, /assets precedent).
 */
export default function CareersPage() {
  const toast = useToast();
  const [jobs, setJobs] = React.useState<JobRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [company, setCompany] = React.useState("all");

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
  const visible = company === "all" ? jobs : jobs.filter((j) => j.department === company);

  return (
    <div className="min-h-screen">
      {/* REF's hero: the sRGB-pinned blue→indigo band (trap 3) */}
      <div className="bg-[linear-gradient(to_right,#2563eb,#4f46e5)] text-white py-16 text-center">
        <h1 className="px-4 text-5xl font-bold">Find Your Dream Job</h1>
        <p className="mt-4 px-4 text-xl text-blue-200">
          Explore opportunities from top companies powered by EonHR
        </p>
      </div>

      <div className="p-4 md:p-8">
        {/* the company chips (REF renders them only with data) */}
        {companies.length > 0 ? (
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setCompany("all")}
              className={
                company === "all"
                  ? "h-[46px] rounded-lg border border-slate-200 bg-slate-900 px-4 text-sm font-medium text-white"
                  : "h-[46px] rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
              }
            >
              All Companies
            </button>
            {companies.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCompany(c)}
                className={
                  company === c
                    ? "h-[46px] rounded-lg border border-slate-200 bg-slate-900 px-4 text-sm font-medium text-white"
                    : "h-[46px] rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                }
              >
                {c}
              </button>
            ))}
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
                    <span className="capitalize">{j.type.replace("_", " ")}</span>
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
