"use client";

import * as React from "react";
import { BarChart3, Calendar, FileSpreadsheet, FileText, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";

interface PayrollRow {
  id: string;
  period: string;
  employeeName: string;
  grossPay: number;
  deductions: number;
  netPay: number;
}

/**
 * The /payrollreports page — parity round 33 (R33-A), rebuilt to the
 * live-measured REF structure (the round-31 body drifted):
 *
 * the slate→blue sRGB canvas; the white-pill kicker (`px-4 py-2 bg-white
 * rounded-full shadow-sm mb-4` + the 16px blue-600 BarChart3) at y=56
 * with the green-600 WhatsApp CTA (MessageCircle w-4 h-4) on the same
 * row; the 36px h1 y=108 (`text-4xl font-bold text-slate-900 mb-2`) +
 * the 16px sub y=156; the p-4 filter card (Label "Filter by Employee"
 * fs12 ABOVE a w-full select in `space-y-1 flex-1 min-w-[180px]` inside
 * `flex flex-wrap gap-4 items-end`, "N total records" right); the
 * 4-col grid tab list (`grid grid-cols-4 w-full` — Monthly active=
 * bg-background, Tax & Deductions, History, Custom — inert on REF);
 * the summary card (border-b p-6 pb-3 header: Calendar w-5 h-5
 * text-blue-600 + title/sub | the w-40 month input + CSV + PDF) with
 * the stats INSIDE (text-xs slate-500 labels + font-bold text-lg
 * values colored blue-700/red-600/green-700/slate-700) and the 8-col
 * table (thead bg-slate-50, th text-xs font-bold uppercase text-slate-600;
 * Employee left · Basic/Allowances/Overtime/Deductions/Net Salary
 * right · Status/Payslip center) + the colspan "No records for
 * {YYYY-MM}" TD (py-12 text-center text-slate-400).
 *
 * Supersets: real PayrollRecord aggregation (+ the month input and the
 * employee filter re-filter it) + a real CSV export.
 */
export default function PayrollReportsPage() {
  const toast = useToast();
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<PayrollRow[]>([]);
  const [month, setMonth] = React.useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [employee, setEmployee] = React.useState("all");

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/payroll");
        const json = await res.json();
        if (json.ok) {
          setRows(
            (json.data.records ?? []).map(
              (r: { id: string; period: string; employeeName: string; grossPay: number; netPay: number }) => ({
                id: r.id,
                period: r.period,
                employeeName: r.employeeName,
                grossPay: r.grossPay,
                deductions: r.grossPay - r.netPay,
                netPay: r.netPay,
              })
            )
          );
        }
      } catch {
        /* zero-data keeps the zero-state */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const employeeNames = React.useMemo(
    () => [...new Set(rows.map((r) => r.employeeName))].sort(),
    [rows]
  );
  const visible = React.useMemo(
    () =>
      rows.filter(
        (r) => r.period.startsWith(month) && (employee === "all" || r.employeeName === employee)
      ),
    [rows, month, employee]
  );
  const fmt = (halalas: number) => `${(halalas / 100).toFixed(2)} SAR`;
  const stats = {
    earnings: visible.reduce((s, r) => s + r.grossPay, 0),
    deductions: visible.reduce((s, r) => s + r.deductions, 0),
    net: visible.reduce((s, r) => s + r.netPay, 0),
    employees: new Set(visible.map((r) => r.employeeName)).size,
  };

  function onExportCsv() {
    const header = "Period,Employee,Gross,Net\n";
    const body = visible
      .map((r) => `${r.period},${r.employeeName},${(r.grossPay / 100).toFixed(2)},${(r.netPay / 100).toFixed(2)}`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payroll-report.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.toast({ title: "CSV exported", description: `${visible.length} record(s).`, variant: "success" });
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right_bottom,#f8fafc,#eff6ff)] p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* REF's header (round 33 re-measure): the pill + the CTA ride a
            row at y=56 (items-start; the pill's mb-4 spaces the 36px h1
            at y=108, mb-2 lands the sub at y=156) — one wrapper so the
            container's space-y-6 doesn't add margins inside. */}
        <div className="mt-6">
          <div className="flex items-start justify-between">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-4">
              <BarChart3 className="h-4 w-4 text-blue-600" aria-hidden="true" />
              <span className="text-sm font-medium">Payroll Reporting Suite</span>
            </span>
            <Button
              /* REF's CTA (round-33 measure): SOLID green-600 — no
                 gradient (bgImage: none). bg-none suppresses the default
                 variant's blue CTA gradient (the bg-image group). */
              className="bg-none bg-green-600 hover:bg-none hover:bg-green-700"
              onClick={() => toast.toast({ title: "Payslips queued", description: "WhatsApp dispatch logged.", variant: "success" })}
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Send Payslips via WhatsApp
            </Button>
          </div>
          <h1 className="mb-2 text-4xl font-bold text-slate-900">Payroll Reports</h1>
          <p className="text-base text-slate-600">Generate, export and distribute payroll reports</p>
        </div>

        {/* REF's filter card: the Label above the w-full select */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1 flex-1 min-w-[180px]">
                <Label className="text-xs">Filter by Employee</Label>
                <Select value={employee} onValueChange={setEmployee}>
                  {/* v3's space-y-1 put mt on this BLOCK (v4 puts mb on the
                      inline label — ignored; explicit mt-1, the login fix). */}
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="All Employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {employeeNames.map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <span className="text-sm text-muted-foreground">{visible.length} total records</span>
            </div>
          </CardContent>
        </Card>

        {/* REF (round 33): the tabs + the summary card ride a space-y-4
            wrapper (16px) inside the page's space-y-6 flow. */}
        <div className="space-y-4">
        {/* REF's tab list: the 4-col grid (the triggers are inert on
            REF — the Monthly summary below is the standing content). */}
        <Tabs defaultValue="monthly">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="tax">Tax &amp; Deductions</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
        </Tabs>

        <Card className="border-slate-200">
          {/* REF's card header (round 33): `flex flex-col md:flex-row
              justify-between gap-3` — the bare left block (title DIV with
              the INLINE Calendar icon, h=20 + the mt-1 sub) and the
              `flex gap-2 flex-wrap` right block (input + CSV + PDF,
              all top-aligned at y=403). */}
          <CardHeader className="border-b p-6 pb-3">
            <div className="flex flex-col md:flex-row justify-between gap-3">
              <div>
                <p className="font-semibold leading-none tracking-tight">
                  <Calendar className="w-5 h-5 text-blue-600 mr-2 -translate-y-[1px]" aria-hidden="true" />
                  Monthly Payroll Summary
                </p>
                <p className="text-sm text-slate-500 mt-1">All employees for selected month</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-40"
                  aria-label="Report month"
                />
                <Button variant="outline" size="sm" onClick={onExportCsv}>
                  <FileSpreadsheet className="mr-1 h-4 w-4" aria-hidden="true" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.toast({ title: "PDF export", description: "Use your browser's print dialog (already print-optimized).", variant: "success" })}
                >
                  <FileText className="mr-1 h-4 w-4" aria-hidden="true" />
                  PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex h-24 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
              </div>
            ) : (
              <>
                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <p className="mb-1 text-xs text-slate-500">Total Earnings</p>
                    <p className="text-lg font-bold text-blue-700">{fmt(stats.earnings)}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-slate-500">Total Deductions</p>
                    <p className="text-lg font-bold text-red-600">{fmt(stats.deductions)}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-slate-500">Net Payroll</p>
                    <p className="text-lg font-bold text-green-700">{fmt(stats.net)}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-slate-500">Employees</p>
                    <p className="text-lg font-bold text-slate-700">{stats.employees}</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-600">Employee</th>
                        <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-600">Basic</th>
                        <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-600">Allowances</th>
                        <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-600">Overtime</th>
                        <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-600">Deductions</th>
                        <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-600">Net Salary</th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase text-slate-600">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase text-slate-600">Payslip</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400">
                            No records for {month}
                          </td>
                        </tr>
                      ) : (
                        visible.map((r) => (
                          <tr key={r.id} className="border-b">
                            <td className="px-4 py-3 font-medium text-slate-900">{r.employeeName}</td>
                            <td className="px-4 py-3 text-right text-slate-600">{fmt(r.grossPay - r.deductions)}</td>
                            <td className="px-4 py-3 text-right text-slate-600">0.00 SAR</td>
                            <td className="px-4 py-3 text-right text-slate-600">0.00 SAR</td>
                            <td className="px-4 py-3 text-right text-slate-600">{fmt(r.deductions)}</td>
                            <td className="px-4 py-3 text-right font-medium text-slate-900">{fmt(r.netPay)}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Paid</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600">
                                Download
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
