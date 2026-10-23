"use client";

import * as React from "react";
import { Calendar, ChartColumn, FileSpreadsheet, FileText, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageCanvas } from "@/components/shared/page-canvas";
import { PageHeader } from "@/components/shared/page-header";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
 * table (thead bg-slate-50; the Monthly th family is the r48 BARE px-4 py-3 form;
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
  /* Session 35 (R34-E): the tabs wired — REF's triggers are inert (its
     Tax/History/Custom change nothing, re-verified this round), so any
     content is the with-data superset the frontier framed. The at-rest
     DOM (Monthly active + the summary card) is unchanged. */
  const [tab, setTab] = React.useState("monthly");
  const [range, setRange] = React.useState({ from: "", to: "", employee: "all" });
  const [customRows, setCustomRows] = React.useState<PayrollRow[] | null>(null);
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

  /* R34-E: the Tax & Deductions aggregation — per-employee gross /
     deductions / effective rate / net, month-scoped (the same `visible`
     slice the Monthly summary renders). */
  const taxRows = React.useMemo(() => {
    const byEmp = new Map<string, { gross: number; deductions: number; net: number }>();
    for (const r of visible) {
      const e = byEmp.get(r.employeeName) ?? { gross: 0, deductions: 0, net: 0 };
      e.gross += r.grossPay;
      e.deductions += r.deductions;
      e.net += r.netPay;
      byEmp.set(r.employeeName, e);
    }
    return [...byEmp.entries()].map(([name, v]) => ({
      name,
      ...v,
      rate: v.gross > 0 ? v.deductions / v.gross : 0,
    }));
  }, [visible]);

  /* R34-E: the History aggregation — every processed period with its
     totals, descending (periods are "YYYY-MM" — a string sort is a
    chronological sort). */
  const periods = React.useMemo(() => {
    const byPeriod = new Map<string, { records: number; gross: number; deductions: number; net: number }>();
    for (const r of rows) {
      const p = byPeriod.get(r.period) ?? { records: 0, gross: 0, deductions: 0, net: 0 };
      p.records += 1;
      p.gross += r.grossPay;
      p.deductions += r.deductions;
      p.net += r.netPay;
      byPeriod.set(r.period, p);
    }
    return [...byPeriod.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [rows]);

  /* R34-E: the Custom report — the from/to + employee range filter over
     the loaded rows ("YYYY-MM" strings compare chronologically). */
  function onGenerate() {
    const filtered = rows.filter(
      (r) =>
        (!range.from || r.period >= range.from) &&
        (!range.to || r.period <= range.to) &&
        (range.employee === "all" || r.employeeName === range.employee)
    );
    setCustomRows(filtered);
    toast.toast({ title: "Report generated", description: `${filtered.length} record(s) in range.`, variant: "success" });
  }

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
    <PageCanvas>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Session 49 (R48-C3): the header REBUILT to the fresh census —
            the mobile kicker (back button h-9 w-9 select-none + the
            standard kicker classes) + the SHORT hidden desktop row
            `hidden md:flex justify-between items-start` carrying the
            classless hero block (badge: chart-column w-4 h-4
            text-blue-600 + "Payroll Reporting Suite"; H1 text-4xl mb-2;
            P text-slate-600) with the WhatsApp CTA rendered DIRECTLY in
            the row (actionsUnwrapped), and the mobile full-width copy
            in a md:hidden div below. Live-measured @1440×900. */}
        <PageHeader
          mobileKicker
          mobileKickerBack
          mobileKickerTitle="Payroll Reports"
          mobileHeader="hidden"
          alwaysRow
          actionsStart
          actionsUnwrapped
          layout="flat36-sm"
          section="Payroll Reporting Suite"
          iconClassName="text-blue-600"
          sectionIcon={<ChartColumn aria-hidden="true" />}
          title="Payroll Reports"
          subtitle="Generate, export and distribute payroll reports"
          actions={
            <Button
              /* REF's CTA (live-measured): shadow h-9 px-4 py-2
                 bg-green-600 hover:bg-green-700 TEXT-WHITE gap-2 — no
                 gradient (bgImage: none; bg-none suppresses the default
                 variant's blue CTA gradient — the documented mitigation). */
              className="bg-none shadow h-9 px-4 py-2 bg-green-600 hover:bg-none hover:bg-green-700 text-white"
              onClick={() => toast.toast({ title: "Payslips queued", description: "WhatsApp dispatch logged.", variant: "success" })}
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Send Payslips via WhatsApp
            </Button>
          }
        />
        {/* Session 49 (R48-C3): REF's mobile copy — a md:hidden div
            carrying the FULL-WIDTH WhatsApp button. */}
        <div className="md:hidden">
          <Button
            className="bg-none shadow h-9 px-4 py-2 w-full bg-green-600 hover:bg-none hover:bg-green-700 text-white"
            onClick={() => toast.toast({ title: "Payslips queued", description: "WhatsApp dispatch logged.", variant: "success" })}
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Send Payslips via WhatsApp
          </Button>
        </div>

        {/* REF's filter card: the Label above the w-full select */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1 flex-1 min-w-[180px]">
                {/* Session 49 (R48-C3): REF's label pair — text-xs
                    text-slate-500 (live-measured). */}
                <Label className="text-xs text-slate-500">Filter by Employee</Label>
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
              <span className="text-sm text-slate-500 self-center">{visible.length} total records</span>
            </div>
          </CardContent>
        </Card>

        {/* REF (round 33): the tabs + the summary card ride a space-y-4
            wrapper (16px) inside the page's space-y-6 flow. */}
        <div className="space-y-4">
        {/* REF's tab list: the 4-col grid. Session 35 (R34-E): the
            triggers are inert on REF — the clone wires them to real
            aggregates (controlled; the sibling cards below swap by tab,
            the Tabs component keeps rendering only the list — the
            at-rest Monthly DOM is byte-identical). */}
        {/* Session 49 (R48-C3): REF's tabs — the TabsList `grid
            grid-cols-4 w-full md:w-auto` + the OLD-shadcn trigger form
            (ring-offset-background + data-[state=active]:bg-background/
            shadow + text-xs md:text-sm — live-measured) and ALL FOUR
            panels mounted as Radix TabsContent (`… space-y-4 mt-4`);
            Session 35 (R34-E) keeps the wired aggregates as the
            functional superset (REF's triggers are inert). */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="monthly" className="ring-offset-background text-xs md:text-sm data-[state=active]:bg-background data-[state=active]:shadow">Monthly</TabsTrigger>
            <TabsTrigger value="tax" className="ring-offset-background text-xs md:text-sm data-[state=active]:bg-background data-[state=active]:shadow">Tax &amp; Deductions</TabsTrigger>
            <TabsTrigger value="history" className="ring-offset-background text-xs md:text-sm data-[state=active]:bg-background data-[state=active]:shadow">History</TabsTrigger>
            <TabsTrigger value="custom" className="ring-offset-background text-xs md:text-sm data-[state=active]:bg-background data-[state=active]:shadow">Custom</TabsTrigger>
          </TabsList>
          <TabsContent value="monthly" className="ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-4 mt-4">
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
                {/* Session 84 (R84-B): the reference's PDF button opens a
                    BLANK window (window.open("") — a broken stub, no
                    document, no print); the clone previously toasted an
                    advisory "use your browser's print dialog". The
                    session-29 R28-B/R29-C print superset already ships
                    the print CSS (the chrome hidden, the dialogs
                    suppressed, print-color-adjust: exact, the @page
                    margins) — so this button now opens the REAL print
                    dialog in one click (print → "Save as PDF" produces
                    the print-optimized document). */}
                <Button variant="outline" size="sm" onClick={() => window.print()}>
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
                  {/* Session 49 (R48-C3): REF's th forms re-measured —
                      the BARE px-4 py-3 family (+ alignment, the
                      hidden md:table-cell pair on Allowances/Overtime,
                      font-bold on Net Salary). */}
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left">Employee</th>
                        <th className="px-4 py-3 text-right">Basic</th>
                        <th className="px-4 py-3 text-right hidden md:table-cell">Allowances</th>
                        <th className="px-4 py-3 text-right hidden md:table-cell">Overtime</th>
                        <th className="px-4 py-3 text-right">Deductions</th>
                        <th className="px-4 py-3 text-right font-bold">Net Salary</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-center">Payslip</th>
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
        </TabsContent>

        {/* R34-E: the Tax & Deductions card — the per-employee breakdown
            on REF's card grammar (border-slate-200, the p-6 pb-3 border-b
            header, the bg-slate-50 uppercase thead, the py-12 empty TD). */}
        <TabsContent value="tax" className="ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-4 mt-4">
        <Card className="border-slate-200">
          <CardHeader className="border-b p-6 pb-3">
            <div>
              <p className="font-semibold leading-none tracking-tight">Tax &amp; Deductions</p>
              <p className="text-sm text-slate-500 mt-1">Deduction breakdown for {month}</p>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-600">Employee</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-600">Gross</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-600">Deductions</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-600">Effective Rate</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-600">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {taxRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        No records for {month}
                      </td>
                    </tr>
                  ) : (
                    taxRows.map((r) => (
                      <tr key={r.name} className="border-b">
                        <td className="px-4 py-3 font-medium text-slate-900">{r.name}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{fmt(r.gross)}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{fmt(r.deductions)}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{(r.rate * 100).toFixed(1)}%</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">{fmt(r.net)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        {/* R34-E: the History card — every processed period with its
            totals, newest first. */}
        <TabsContent value="history" className="ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-4 mt-4">
        <Card className="border-slate-200">
          <CardHeader className="border-b p-6 pb-3">
            <div>
              <p className="font-semibold leading-none tracking-tight">Payroll History</p>
              <p className="text-sm text-slate-500 mt-1">All processed periods</p>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-600">Period</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-600">Records</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-600">Gross</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-600">Deductions</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-600">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {periods.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        No payroll history yet
                      </td>
                    </tr>
                  ) : (
                    periods.map(([period, p]) => (
                      <tr key={period} className="border-b">
                        <td className="px-4 py-3 font-medium text-slate-900">{period}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{p.records}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{fmt(p.gross)}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{fmt(p.deductions)}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">{fmt(p.net)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        {/* R34-E: the Custom card — the from/to + employee range form and
            the generated table. */}
        <TabsContent value="custom" className="ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-4 mt-4">
        <Card className="border-slate-200">
          <CardHeader className="border-b p-6 pb-3">
            <div>
              <p className="font-semibold leading-none tracking-tight">Custom Report</p>
              <p className="text-sm text-slate-500 mt-1">Build a report for any range</p>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-end gap-4 mb-6">
              <div className="space-y-1">
                <Label className="text-xs" htmlFor="custom-from">From</Label>
                <Input
                  id="custom-from"
                  type="month"
                  className="w-40 mt-1"
                  value={range.from}
                  onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs" htmlFor="custom-to">To</Label>
                <Input
                  id="custom-to"
                  type="month"
                  className="w-40 mt-1"
                  value={range.to}
                  onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
                />
              </div>
              <div className="space-y-1 flex-1 min-w-[180px]">
                <Label className="text-xs">Employee</Label>
                <Select
                  value={range.employee}
                  onValueChange={(v) => setRange((r) => ({ ...r, employee: v }))}
                >
                  <SelectTrigger className="w-full mt-1" aria-label="Filter employee">
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
              <Button onClick={onGenerate} disabled={loading}>Generate Report</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-600">Period</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-600">Employee</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-600">Gross</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-600">Deductions</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-600">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {(customRows ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        No records in range
                      </td>
                    </tr>
                  ) : (
                    (customRows ?? []).map((r) => (
                      <tr key={r.id} className="border-b">
                        <td className="px-4 py-3 font-medium text-slate-900">{r.period}</td>
                        <td className="px-4 py-3 text-slate-600">{r.employeeName}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{fmt(r.grossPay)}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{fmt(r.deductions)}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">{fmt(r.netPay)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
    </PageCanvas>
  );
}
