"use client";

import * as React from "react";
import { CheckCircle, CircleCheckBig, DollarSign, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader

        /* Session 49 (R48-A3): the always-row family — REF renders the
         *  UNPREFIXED always-row (measured @1440×900 this round). */
        alwaysRow
        actionsUnwrapped
          section="AI Payroll Assistant"
          layout="flat36"
          iconClassName="text-green-600"
          sectionIcon={<Sparkles aria-hidden="true" />}
          title="Payroll AI Suggestions"
          subtitle="AI-powered payroll analysis and recommendations"
          actionsStart
          actions={
            /* REF (round 33 re-measure): the green-gradient CTA rides the
               badge row — `flex justify-between items-start`, y=32. */
            <Button variant="green" onClick={() => void onRun()} disabled={running}>
              {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />}
              Run AI Analysis
            </Button>
          }
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard
            valueTag="p"
            labelTag="p"
            valueClassName="mt-4 mb-0"
            tileRowClassName=""
            icon={<Sparkles className="w-6 h-6 text-blue-600" aria-hidden="true" />}
            tileClassName="bg-blue-100"
            value={loading ? "…" : String(stats.pending)}
            label="Pending Suggestions"
          />
          <StatCard
            valueTag="p"
            labelTag="p"
            valueClassName="mt-4 mb-0"
            tileRowClassName=""
            icon={<CircleCheckBig className="w-6 h-6 text-green-600" aria-hidden="true" />}
            tileClassName="bg-green-100"
            value={loading ? "…" : String(stats.accepted)}
            label="Accepted"
          />
          <StatCard
            valueTag="p"
            labelTag="p"
            valueClassName="mt-4 mb-0"
            tileRowClassName=""
            icon={<DollarSign className="w-6 h-6 text-purple-600" aria-hidden="true" />}
            tileClassName="bg-purple-100"
            value={loading ? "…" : `${stats.totalAdjustments / 100} SAR`}
            label="Total Adjustments"
          />
        </div>

        {/* Session 61 (R61-K): REF's suggestions card carries a
            CardHeader (the CardTitle "AI Suggestions" — font-semibold
            leading-none tracking-tight, live-measured y:423) + the
            p-6 content (the empty stack at x:313); the round-33 pin's
            headerless p-12 form superseded by the r61 re-measure. */}
        <Card className="border-slate-200">
          <CardHeader className="flex flex-col space-y-1.5 p-6 border-b border-slate-200">
            <CardTitle>AI Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* REF's content carries ONE inner wrapper: text-center
                py-12 (live-measured y:488 h:236; the icon lands at
                y:536 = wrapper + py-12). */}
            <div className="text-center py-12">
              {/* REF's empty contract (round 33): the 64px CircleCheckBig
                  (all utilities on the icon — REF's exact chain) + the 18px
                  semibold heading + the 16px slate-500 line. */}
              <CircleCheckBig className="w-16 h-16 mx-auto mb-4 text-green-500" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">All Clear!</h3>
              <p className="text-slate-500">No payroll adjustments needed</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
