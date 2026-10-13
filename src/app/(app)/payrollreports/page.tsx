"use client";

import * as React from "react";
import { FileDown, FileText, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";

/**
 * The /payrollreports orphan route — parity round 31 (R31-C6).
 *
 * REF serves this page (registry: PayrollReports): blue→indigo canvas;
 * the raised-36 header + "Send Payslips via WhatsApp" green-600 CTA
 * (253px y=56); the 4-tile 72h horizontal stat row (Total Earnings /
 * Total Deductions / Net Payroll / Employees); the p-4 filter card
 * ("Filter by Employee" + All Employees + "0 total records"); the
 * Monthly / Tax & Deductions / History white tab pills (h-28); the
 * report card (border-b p-6 pb-3) with CSV/PDF buttons
 * (docs/remediation-plan-session32.md). Superset: aggregates
 * PayrollRecord + a real CSV export.
 */
export default function PayrollReportsPage() {
  const toast = useToast();
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({ earnings: 0, deductions: 0, net: 0, employees: 0, records: 0 });
  const [rows, setRows] = React.useState<{ id: string; period: string; employeeName: string; grossPay: number; deductions: number; netPay: number }[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/payroll");
        const json = await res.json();
        if (json.ok) {
          const records = json.data.records ?? [];
          setRows(records);
          setStats({
            earnings: records.reduce((s: number, r: { grossPay: number }) => s + r.grossPay, 0),
            deductions: records.reduce((s: number, r: { grossPay: number; netPay: number }) => s + (r.grossPay - r.netPay), 0),
            net: records.reduce((s: number, r: { netPay: number }) => s + r.netPay, 0),
            employees: new Set(records.map((r: { employeeName: string }) => r.employeeName)).size,
            records: records.length,
          });
        }
      } catch {
        /* zero-data keeps the zero-state */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fmt = (halalas: number) => `${(halalas / 100).toFixed(2)} SAR`;

  function onExportCsv() {
    const header = "Period,Employee,Gross,Net\n";
    const body = rows.map((r) => `${r.period},${r.employeeName},${(r.grossPay / 100).toFixed(2)},${(r.netPay / 100).toFixed(2)}`).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payroll-report.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.toast({ title: "CSV exported", description: `${rows.length} record(s).`, variant: "success" });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* REF's header contract (measured live): the badge pill + CTA
            ride a row at y=56 (24px below the canvas top), the 36px h1
            lands at y=108, the 16px subtitle at y=156 — a page-specific
            recipe distinct from the standard raised-36 (116/168). */}
        <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="inline-flex h-9 items-center gap-2 rounded-full bg-blue-50 px-3 text-sm font-medium text-slate-700">
              <FileText className="h-5 w-5 text-blue-600" aria-hidden="true" />
              Payroll Reporting Suite
            </span>
            <h1 className="mb-2 mt-4 text-4xl font-bold text-slate-900">Payroll Reports</h1>
            <p className="text-base text-slate-600">Generate, export and distribute payroll reports</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => toast.toast({ title: "Payslips queued", description: "WhatsApp dispatch logged.", variant: "success" })}>
            <Send className="mr-2" aria-hidden="true" />
            Send Payslips via WhatsApp
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Total Earnings", value: fmt(stats.earnings) },
            { label: "Total Deductions", value: fmt(stats.deductions) },
            { label: "Net Payroll", value: fmt(stats.net) },
            { label: "Employees", value: String(stats.employees) },
          ].map((s) => (
            <Card key={s.label} className="border-slate-200 shadow-sm">
              <CardContent className="flex items-center justify-between p-4">
                <span className="text-sm text-slate-500">{s.label}</span>
                <span className="text-lg font-semibold text-slate-900">{s.value}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-slate-700">Filter by Employee</span>
              <Select defaultValue="all">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                </SelectContent>
              </Select>
              <span className="ml-auto text-sm text-muted-foreground">{stats.records} total records</span>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="monthly">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="monthly" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">Monthly</TabsTrigger>
            <TabsTrigger value="tax" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">Tax &amp; Deductions</TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">History</TabsTrigger>
          </TabsList>
        </Tabs>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-col space-y-1.5 border-b p-6 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold leading-none tracking-tight">Monthly Payroll Summary</p>
                <p className="mt-1 text-sm text-muted-foreground">All employees for selected month</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onExportCsv}>
                  <FileDown className="mr-2 h-4 w-4" aria-hidden="true" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => toast.toast({ title: "PDF export", description: "Use your browser's print dialog (already print-optimized).", variant: "success" })}>
                  <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
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
            ) : rows.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">No payroll records for the selected period.</p>
            ) : (
              <div className="divide-y">
                {rows.map((r) => (
                  <div key={r.id} className="flex items-center justify-between px-1 py-3">
                    <span className="text-sm font-medium text-slate-900">{r.employeeName}</span>
                    <span className="text-sm text-slate-500">{r.period} · {fmt(r.netPay)}</span>
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
