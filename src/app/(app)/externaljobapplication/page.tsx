"use client";

import * as React from "react";
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
}

/**
 * The /externaljobapplication orphan route — parity round 31 (R31-C3).
 *
 * REF serves this page (registry: ExternalJobApplication): blue→indigo
 * canvas, centered 36px header ("Job Opportunities" + the 18px slate-600
 * line), one 1120px card whose p-6 pt-0 text-center holds the 20px
 * "No Open Positions" h3 + the 64px slate-300 Briefcase + the 16px
 * slate-600 line (measured y=32/84/160/209/325,
 * docs/remediation-plan-session32.md). Superset: lists the clone's open
 * JobPosting rows (REF-side zero-data — the empty state is the parity
 * contract).
 */
export default function ExternalJobApplicationPage() {
  const toast = useToast();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900">Job Opportunities</h1>
          <p className="mt-3 text-lg text-slate-600">Join our team and make an impact</p>
        </div>

        <Card className="border-slate-200">
          <CardContent className="p-6 pt-0 text-center">
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="pt-12 pb-6">
                <div className="mb-4 flex justify-center">
                  <Briefcase className="h-16 w-16 text-slate-300" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-900">No Open Positions</h3>
                <p className="text-slate-600">
                  We don&apos;t have any open positions at the moment. Check back later!
                </p>
              </div>
            ) : (
              /* the with-data superset (REF-side zero-data) */
              <div className="divide-y text-left">
                {jobs.map((j) => (
                  <div key={j.id} className="px-2 py-4">
                    <p className="font-medium text-slate-900">{j.title}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-4 text-sm text-slate-500">
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
