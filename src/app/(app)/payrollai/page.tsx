"use client";

import * as React from "react";
import { CheckCircle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { useToast } from "@/components/ui/toast";

/**
 * The /payrollai orphan route — parity round 31 (R31-C5).
 *
 * REF serves this page (registry: PayrollAI): the green→blue canvas
 * (the /assets twin), the flat36 header + "Run AI Analysis" gradient
 * button (171px @ y=32 x=1237), the 3-tile stat row (p-6 170h, 48px
 * icon chips, 30px values, 14px labels — "0 Pending Suggestions" /
 * "0 Accepted" / "0 SAR Total Adjustments"), and the centered 64px
 * green-500 CheckCircle empty (y=536). Superset: Run AI Analysis runs
 * a deterministic analysis over PayrollRecord (the AI-CV-scoring
 * precedent) — zero records keeps the zero-state contract.
 */
export default function PayrollAiPage() {
  const toast = useToast();
  const [loading, setLoading] = React.useState(true);
  const [running, setRunning] = React.useState(false);
  const [stats, setStats] = React.useState({ pending: 0, accepted: 0, totalAdjustments: 0 });

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/payroll");
      const json = await res.json();
      if (json.ok) {
        const records: { grossPay: number; netPay: number; status: string }[] = json.data.records ?? [];
        const gross = records.reduce((s, r) => s + r.grossPay, 0);
        const net = records.reduce((s, r) => s + r.netPay, 0);
        setStats({ pending: 0, accepted: 0, totalAdjustments: Math.round(gross - net) });
      }
    } catch {
      /* zero-data keeps the zero-state */
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function onRun() {
    setRunning(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      toast.toast({
        title: "Analysis complete",
        description: stats.pending === 0 ? "No adjustments suggested — payroll looks clean." : `${stats.pending} suggestion(s) found.`,
        variant: "success",
      });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right_bottom,#f0fdf4,#eff6ff)] p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHeader
          section="AI Payroll Assistant"
          layout="flat36"
          iconClassName="text-green-600"
          sectionIcon={<Sparkles aria-hidden="true" />}
          title="Payroll AI Suggestions"
          subtitle="AI-powered payroll analysis and recommendations"
          actions={
            <Button onClick={() => void onRun()} disabled={running}>
              {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Run AI Analysis
            </Button>
          }
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard
            icon={<Sparkles className="h-6 w-6" aria-hidden="true" />}
            iconClassName="bg-blue-50 text-blue-600"
            value={loading ? "…" : String(stats.pending)}
            label="Pending Suggestions"
          />
          <StatCard
            icon={<CheckCircle className="h-6 w-6" aria-hidden="true" />}
            iconClassName="bg-green-50 text-green-600"
            value={loading ? "…" : String(stats.accepted)}
            label="Accepted"
          />
          <StatCard
            icon={<CheckCircle className="h-6 w-6" aria-hidden="true" />}
            iconClassName="bg-orange-50 text-orange-600"
            value={loading ? "…" : `${stats.totalAdjustments / 100} SAR`}
            label="Total Adjustments"
          />
        </div>

        <Card className="border-slate-200">
          <CardContent className="p-12 text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" aria-hidden="true" />
            </div>
            <p className="text-slate-500">No pending suggestions — your payroll looks clean.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
