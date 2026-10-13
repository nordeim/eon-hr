"use client";

import * as React from "react";
import { ArrowLeft, FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * The /requestreports orphan route — parity round 31 (R31-C7).
 *
 * REF serves this page (registry: RequestReports): the slate→blue
 * canvas; the CENTERED 24px header (x=385 y=32) with the Back ghost
 * button (12px, h-32, x=288 y=42) + the 14px sub (y=64); the Monthly
 * select (144px x=1111 y=40) + the white "Export CSV" button (145px
 * x=1263 y=40); the documenttracker-recipe 4-tile row (82h, p-4 flex
 * items-center gap-3, 24px values, 12px labels) — "0 Total Requests" /
 * "0 Approved" / "0 Pending" / "0 Total Amount (SAR)".
 * Superset: aggregates StaffRequest + a real CSV export.
 */
export default function RequestReportsPage() {
  const toast = useToast();
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({ total: 0, approved: 0, pending: 0, amount: 0 });
  const [rows, setRows] = React.useState<{ id: string; title: string; category: string; status: string; createdAt: string }[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/staff-requests?scope=all");
        const json = await res.json();
        if (json.ok) {
          const requests = json.data.requests ?? [];
          setRows(requests);
          setStats({
            total: requests.length,
            approved: requests.filter((r: { status: string }) => r.status === "resolved").length,
            pending: requests.filter((r: { status: string }) => r.status === "pending").length,
            amount: 0,
          });
        }
      } catch {
        /* zero-data keeps the zero-state */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function onExportCsv() {
    const header = "Title,Category,Status,Created\n";
    const body = rows.map((r) => `${r.title},${r.category},${r.status},${r.createdAt}`).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "request-report.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.toast({ title: "CSV exported", description: `${rows.length} request(s).`, variant: "success" });
  }

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full p-4 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="px-2 text-xs text-slate-500" onClick={() => history.back()}>
              <ArrowLeft className="mr-1 h-3 w-3" aria-hidden="true" />
              Back
            </Button>
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-slate-900">Request Reports</h1>
              <p className="text-sm text-slate-500">Analytics and reporting by area and period</p>
            </div>
            <div className="flex items-center gap-3">
              <Select defaultValue="monthly">
                <SelectTrigger className="w-[144px]">
                  <SelectValue placeholder="Monthly" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={onExportCsv}>
                <FileDown className="mr-2" aria-hidden="true" />
                Export CSV
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Total Requests", value: stats.total },
              { label: "Approved", value: stats.approved },
              { label: "Pending", value: stats.pending },
              { label: "Total Amount (SAR)", value: stats.amount },
            ].map((s) => (
              <Card key={s.label} className="border-slate-200 shadow-sm">
                <CardContent className="flex items-center gap-3 p-4">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{loading ? "…" : s.value}</p>
                    <p className="text-xs text-slate-500">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-slate-200">
            <CardContent className="p-6">
              {loading ? (
                <div className="flex h-24 items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
                </div>
              ) : rows.length === 0 ? (
                <p className="py-12 text-center text-muted-foreground">No requests in the selected period.</p>
              ) : (
                <div className="divide-y">
                  {rows.map((r) => (
                    <div key={r.id} className="flex items-center justify-between px-1 py-3">
                      <span className="text-sm font-medium text-slate-900">{r.title}</span>
                      <span className="text-sm capitalize text-slate-500">{r.category} · {r.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
