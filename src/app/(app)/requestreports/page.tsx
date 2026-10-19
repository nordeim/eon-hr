"use client";

import * as React from "react";
import { ArrowLeft, Clock, DollarSign, FileDown, FileText, Loader2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { useToast } from "@/components/ui/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RequestRow {
  id: string;
  refNumber?: string;
  title: string;
  category: string;
  status: string;
  amount?: number;
  createdAt: string;
  requesterName?: string;
}

/**
 * The /requestreports page — parity round 33 (R33-B), completed to the
 * live-measured REF structure:
 *
 * the slate→blue canvas; the centered 24px header (Back ghost + h1 +
 * the Monthly select + the white Export CSV button); the 4-tile stat
 * row (the stock Card recipe: `rounded-xl border bg-card
 * text-card-foreground shadow`, p-4 flex items-center, 24px bold
 * values + 12px slate-500 labels); the 2×2 section grid — "Requests
 * by Category" / "Status Breakdown" / "Financial Amount by Category
 * (SAR)" / "Top Requesters" — each the CardHeader (`flex flex-col
 * space-y-1.5 p-6`, DIV title `font-semibold tracking-tight
 * text-base`) + CardContent `p-6 pt-0` with the P
 * `text-slate-400 text-center py-8` "No data" (the financial card:
 * "No financial requests"); the full-width "Request Log - Monthly"
 * card with the 7-column table (Ref # / Employee / Category / Title /
 * Amount / Status / Date — text-sm left-aligned th, empty tbody at
 * zero data).
 *
 * Supersets: the sections compute real distributions from
 * /api/staff-requests when data exists (with-data rendering is
 * REF-unmeasurable — the documented superset territory) + a real CSV
 * export.
 */
export default function RequestReportsPage() {
  const toast = useToast();
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<RequestRow[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/staff-requests?scope=all");
        const json = await res.json();
        if (json.ok) setRows(json.data.requests ?? []);
      } catch {
        /* zero-data keeps the zero-state */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = {
    total: rows.length,
    approved: rows.filter((r) => r.status === "resolved" || r.status === "approved").length,
    pending: rows.filter((r) => r.status === "pending").length,
    amount: rows.reduce((s, r) => s + (r.amount ?? 0), 0),
  };
  const byCategory = React.useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rows) m.set(r.category, (m.get(r.category) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]);
  const byStatus = React.useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rows) m.set(r.status, (m.get(r.status) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]);
  const financial = React.useMemo(
    () => byCategory.filter(([c]) => ["petty_cash", "fuel", "expense", "loan"].includes(c)),
    [byCategory]
  );
  const topRequesters = React.useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rows) {
      const k = r.requesterName ?? "Unknown";
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [rows]);

  function onExportCsv() {
    const header = "Ref,Employee,Category,Title,Amount,Status,Created\n";
    const body = rows
      .map((r) => `${r.refNumber ?? r.id},${r.requesterName ?? ""},${r.category},${r.title},${r.amount ?? 0},${r.status},${r.createdAt}`)
      .join("\n");
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
          {/* Session 49 (R48-C7): the header re-measured — the always-row
              `flex items-center justify-between` carrying the hero
              (`flex items-center gap-3`: the Back ghost h-8 px-3 text-xs
              + the CLASSLESS h1/p block) and the BARE `flex gap-2`
              actions cluster. Live-measured @1440×900. */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="h-8 rounded-md px-3 text-xs" onClick={() => history.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Request Reports</h1>
                <p className="text-slate-500 text-sm">Analytics and reporting by area and period</p>
              </div>
            </div>
            <div className="flex gap-2">
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

          {/* Session 49 (R48-C7): the HORIZONTAL-BARE stat row — Card
              `rounded-xl border bg-card text-card-foreground shadow` >
              `p-4 flex items-center gap-3` > the 40×40 rounded-LG tile
              (icon classes on the svg, w-5 h-5) + the CLASSLESS div with
              P text-2xl / P text-xs text-slate-500 (live-measured). */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard variant="horizontal-bare" label="Total Requests" value={loading ? "…" : stats.total} icon={<FileText className="w-5 h-5 text-blue-600" aria-hidden="true" />} tileClassName="bg-blue-100" />
            <StatCard variant="horizontal-bare" label="Approved" value={loading ? "…" : stats.approved} icon={<TrendingUp className="w-5 h-5 text-green-600" aria-hidden="true" />} tileClassName="bg-green-100" />
            <StatCard variant="horizontal-bare" label="Pending" value={loading ? "…" : stats.pending} icon={<Clock className="w-5 h-5 text-yellow-600" aria-hidden="true" />} tileClassName="bg-yellow-100" />
            <StatCard variant="horizontal-bare" label="Total Amount (SAR)" value={loading ? "…" : stats.amount / 100} icon={<DollarSign className="w-5 h-5 text-purple-600" aria-hidden="true" />} tileClassName="bg-purple-100" />
          </div>

          {/* REF's 2×2 section grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-col space-y-1.5 p-6">
                <CardTitle className="font-semibold tracking-tight text-base">Requests by Category</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {byCategory.length === 0 ? (
                  <p className="py-8 text-center text-slate-400">No data</p>
                ) : (
                  <div className="space-y-2">
                    {byCategory.map(([c, n]) => (
                      <div key={c} className="flex items-center justify-between text-sm">
                        <span className="capitalize text-slate-600">{c.replace(/_/g, " ")}</span>
                        <span className="font-medium text-slate-900">{n}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-col space-y-1.5 p-6">
                <CardTitle className="font-semibold tracking-tight text-base">Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {byStatus.length === 0 ? (
                  <p className="py-8 text-center text-slate-400">No data</p>
                ) : (
                  <div className="space-y-2">
                    {byStatus.map(([s, n]) => (
                      <div key={s} className="flex items-center justify-between text-sm">
                        <span className="capitalize text-slate-600">{s}</span>
                        <span className="font-medium text-slate-900">{n}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-col space-y-1.5 p-6">
                <CardTitle className="font-semibold tracking-tight text-base">Financial Amount by Category (SAR)</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {financial.length === 0 ? (
                  <p className="py-8 text-center text-slate-400">No financial requests</p>
                ) : (
                  <div className="space-y-2">
                    {financial.map(([c, n]) => (
                      <div key={c} className="flex items-center justify-between text-sm">
                        <span className="capitalize text-slate-600">{c.replace(/_/g, " ")}</span>
                        <span className="font-medium text-slate-900">{n}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-col space-y-1.5 p-6">
                <CardTitle className="font-semibold tracking-tight text-base">Top Requesters</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {topRequesters.length === 0 ? (
                  <p className="py-8 text-center text-slate-400">No data</p>
                ) : (
                  <div className="space-y-2">
                    {topRequesters.map(([name, n]) => (
                      <div key={name} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">{name}</span>
                        <span className="font-medium text-slate-900">{n}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* REF's full-width Request Log */}
          <Card>
            <CardHeader className="flex flex-col space-y-1.5 p-6">
              <CardTitle className="font-semibold tracking-tight text-base">Request Log - Monthly</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {loading ? (
                <div className="flex h-24 items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {/* Session 49 (R48-C7): REF's th forms — the BARE
                      pb-2 pr-4 family (last column pb-2 only),
                      live-measured this round. */}
                  <table className="w-full text-sm">
                    <thead>
                      {/* Session 61 (R61-X): REF's header row carries the
                          members itself — border-b text-left text-slate-500
                          (live-measured, unflipping: the ths computed
                          rgb(100,116,139) in BOTH themes; the bare tr left
                          them inheriting the flipping foreground token). */}
                      <tr className="border-b text-left text-slate-500">
                        <th className="pb-2 pr-4">Ref #</th>
                        <th className="pb-2 pr-4">Employee</th>
                        <th className="pb-2 pr-4">Category</th>
                        <th className="pb-2 pr-4">Title</th>
                        <th className="pb-2 pr-4">Amount</th>
                        <th className="pb-2 pr-4">Status</th>
                        <th className="pb-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.length === 0
                        ? null
                        : rows.map((r) => (
                            <tr key={r.id} className="border-b">
                              <td className="px-4 py-3 text-slate-600">{r.refNumber ?? r.id.slice(0, 8)}</td>
                              <td className="px-4 py-3 text-slate-600">{r.requesterName ?? "—"}</td>
                              <td className="px-4 py-3 capitalize text-slate-600">{r.category.replace(/_/g, " ")}</td>
                              <td className="px-4 py-3 font-medium text-slate-900">{r.title}</td>
                              <td className="px-4 py-3 text-slate-600">
                                {r.amount != null ? `${(r.amount / 100).toFixed(2)} SAR` : "—"}
                              </td>
                              <td className="px-4 py-3 capitalize text-slate-600">{r.status}</td>
                              <td className="px-4 py-3 text-slate-600">
                                {new Date(r.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
    </div>
  );
}
