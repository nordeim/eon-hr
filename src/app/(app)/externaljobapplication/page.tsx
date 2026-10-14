"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Briefcase, Building2, Loader2, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
 * The /externaljobapplication orphan route — parity rounds 31 + 39 + 41.
 *
 * Round 41 (R40-I) aligned the page to REF's live contract: the content
 * is the bare centered wide container (no stack spacing — the header
 * block carries the tall bottom gap itself, the heading the tight one);
 * the card joins the shared icon-over-line empty family (the centered
 * tall padding rides on the card, the briefcase centers itself, no
 * slate border override). The apply flow's org/job query params (the
 * careers card's CTA routes here) now FILTER the list — REF's own
 * target renders its zero-state for the params, so the no-match shape
 * stays REF-parity while the matching shape is the working superset.
 */
export default function ExternalJobApplicationPage() {
  const toast = useToast();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = React.useState<JobRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/jobs?status=open");
        const json = await res.json();
        if (json.ok) setJobs(json.data.jobs);
        else toast.toast({ title: "Failed to load positions", description: json.error?.message, variant: "error" });
      } catch {
        toast.toast({ title: "Network error", variant: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const slug = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  /* R40-I3: the apply flow's params — the org + job slugs filter the
     listed positions (absent params list everything). */
  const orgParam = searchParams.get("org");
  const jobParam = searchParams.get("job");
  const visible = jobs.filter(
    (j) =>
      (orgParam === null || orgParam === "" || slug(j.company ?? "") === orgParam) &&
      (jobParam === null || jobParam === "" || slug(j.title) === jobParam)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Job Opportunities</h1>
          <p className="text-lg text-slate-600">Join our team and make an impact</p>
        </div>

        <Card className="text-center py-12">
          <CardContent className="p-6 pt-0">
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
              </div>
            ) : visible.length === 0 ? (
              /* REF's icon-over-line empty contract (round-31 measured,
                 round-41 re-measured). */
              <>
                <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" aria-hidden="true" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Open Positions</h3>
                <p className="text-slate-600">
                  We don&apos;t have any open positions at the moment. Check back later!
                </p>
              </>
            ) : (
              /* the with-data superset (REF-side zero-data) */
              <div className="divide-y text-left">
                {visible.map((j) => (
                  <div key={j.id} className="px-2 py-4">
                    <p className="font-medium text-slate-900">{j.title}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      {j.company ? (
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="h-4 w-4" aria-hidden="true" /> {j.company}
                        </span>
                      ) : null}
                      {j.location ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4" aria-hidden="true" /> {j.location}
                        </span>
                      ) : null}
                      <span>{j.type.replace(/_/g, " ")}</span>
                    </p>
                    {j.description ? <p className="mt-2 text-sm text-slate-600">{j.description}</p> : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
