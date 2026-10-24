"use client";

import * as React from "react";
import { Calendar, ChartColumn, DollarSign, FileSpreadsheet, FileText, Loader2, MessageCircle, TrendingUp } from "lucide-react";
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

/* Session 87 (R87-C): the Report Filters title glyph — VENDORED. The
   REF renders lucide-filter (the CLASSIC triangle funnel: polygon
   `22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3`, live-read cross-side);
   lucide 0.525 renamed the glyph to Funnel with DIFFERENT path geometry
   (the rounded-spout form — pixel-proven maxdelta 221 at the icon cell,
   ABOVE the AA floor: the lucide-version watch's escalation path).
   The vendored svg carries the REF's exact polygon + class form. */
function RefFilterGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className ? `lucide lucide-filter ${className}` : "lucide lucide-filter"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

interface PayrollRow {
  id: string;
  period: string;
  employeeName: string;
  basicSalary: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  status: string;
}

/* Session 87 (R87-C): the Custom tab's column chips — the REF's
   FOURTEEN, in its exact order, with its exact default-ON set
   (live-measured on the active panel: the toggle chips are `px-3 py-1.5
   rounded-full text-xs font-medium border transition-colors`, active
   `bg-blue-600 text-white border-blue-600`, inactive
   `bg-white text-slate-600 border-slate-300`). */
const COLUMN_CHIPS = [
  { key: "name", label: "Employee Name", on: true },
  { key: "month", label: "Month", on: true },
  { key: "basic", label: "Basic Salary", on: true },
  { key: "housing", label: "Housing Allowance", on: false },
  { key: "transport", label: "Transport Allowance", on: false },
  { key: "food", label: "Food Allowance", on: false },
  { key: "otHours", label: "Overtime Hours", on: false },
  { key: "otAmount", label: "Overtime Amount", on: false },
  { key: "total", label: "Total Earnings", on: true },
  { key: "insurance", label: "Insurance", on: false },
  { key: "loans", label: "Loans", on: false },
  { key: "deductions", label: "Total Deductions", on: true },
  { key: "net", label: "Net Salary", on: true },
  { key: "status", label: "Status", on: true },
] as const;

type ColumnKey = (typeof COLUMN_CHIPS)[number]["key"];

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
  /* Session 87 (R87-A/R87-C): the REF-measured range/filter/column state —
     the Tax toolbar's From/To (From defaulting to JANUARY of the current
     year, To to the current month — live-read `2026-01`/`2026-10` on the
     REF), and the Custom tab's From Month/To Month (both the current
     month) + Employee + Status filters. The old session-35 wiring kept
     empty-string defaults and a Generate button — the REF has neither. */
  const [taxRange, setTaxRange] = React.useState(() => ({
    from: `${new Date().getFullYear()}-01`,
    to: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
  }));
  const [custom, setCustom] = React.useState(() => {
    const d = new Date();
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { from: m, to: m, employee: "all", status: "all" };
  });
  /* Session 87 (R87-C): the active column-chip set — the REF's default-ON
     seven; the chips toggle preview columns LIVE (no Generate button). */
  const [activeCols, setActiveCols] = React.useState<ColumnKey[]>(
    () => COLUMN_CHIPS.filter((c) => c.on).map((c) => c.key),
  );
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
          /* Session 87 (R87-D): the field map FIXED — GET /api/payroll
             returns the raw Prisma records ({ basicSalary, allowances,
             bonus, deductions, netSalary, status, employee: { firstName,
             lastName } }); the old map read employeeName/grossPay/netPay,
             fields the API NEVER carried (the zero-data state masked the
             mismatch since session 35 — any record would have rendered
             undefined/NaN cells). */
          setRows(
            (json.data.records ?? []).map(
              (r: {
                id: string;
                period: string;
                basicSalary: number;
                allowances: number;
                bonus: number;
                deductions: number;
                netSalary: number;
                status: string;
                employee: { firstName: string; lastName: string };
              }) => ({
                id: r.id,
                period: r.period,
                employeeName: `${r.employee.firstName} ${r.employee.lastName}`,
                basicSalary: r.basicSalary,
                grossPay: r.basicSalary + r.allowances + r.bonus,
                deductions: r.deductions,
                netPay: r.netSalary,
                status: r.status,
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

  /* Session 87 (R87-A): the Tax & Deductions rows — per-employee-per-MONTH
     over the From→To range (YYYY-MM strings compare chronologically).
     Insurance/Loans/Late-Absent render the documented 0.00 SAR
     placeholders (PayrollRecord carries a single aggregate `deductions`
     field — no component split; the same doctrine the Monthly tab's
     Allowances/Overtime columns follow), Total Deductions = the record's
     deductions, Est. Tax = 15% of gross (the flat-estimate reading of the
     REF's "Est. Tax (15%)" label — both sides render empty, the formula
     documented here as the superset decision). */
  const taxRows = React.useMemo(
    () => rows.filter((r) => r.period >= taxRange.from && r.period <= taxRange.to),
    [rows, taxRange],
  );

  /* Session 87 (R87-B): the History rows — every record (per employee per
     month), newest period first; Basic = basicSalary, Housing/Transport/
     Overtime the documented 0.00 SAR placeholders, Total Earnings = gross,
     Net Salary = net, Slip = the payslip affordance. */
  const historyRows = React.useMemo(
    () => [...rows].sort((a, b) => b.period.localeCompare(a.period) || a.employeeName.localeCompare(b.employeeName)),
    [rows],
  );

  /* Session 87 (R87-C): the Custom preview — the From/To range + the
     employee + the status filters derive the rows REACTIVELY (no Generate
     button on the REF); the active-chip set derives the columns. */
  const previewRows = React.useMemo(
    () =>
      rows.filter(
        (r) =>
          r.period >= custom.from &&
          r.period <= custom.to &&
          (custom.employee === "all" || r.employeeName === custom.employee) &&
          (custom.status === "all" || r.status === custom.status),
      ),
    [rows, custom],
  );
  const activeChips = React.useMemo(
    () => COLUMN_CHIPS.filter((c) => activeCols.includes(c.key)),
    [activeCols],
  );
  function toggleCol(key: ColumnKey) {
    setActiveCols((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }
  /* The cell renderer for a preview column (the REF's preview th's are all
     `px-4 py-3 text-left whitespace-nowrap`; the unmapped component chips
     render the documented placeholders). */
  function previewCell(r: PayrollRow, key: ColumnKey): string {
    switch (key) {
      case "name":
        return r.employeeName;
      case "month":
        return r.period;
      case "basic":
        return fmt(r.basicSalary);
      case "housing":
      case "transport":
      case "food":
      case "insurance":
      case "loans":
      case "otAmount":
        return "0.00 SAR";
      case "otHours":
        return "0";
      case "total":
        return fmt(r.grossPay);
      case "deductions":
        return fmt(r.deductions);
      case "net":
        return fmt(r.netPay);
      case "status":
        return r.status;
    }
  }
  /* The CSV export helper (shared by the four tabs' CSV buttons — the
     header row + the body rows join into a downloadable blob; the
     filename differs per tab). */
  function exportCsv(filename: string, header: string, bodyRows: string[]) {
    const blob = new Blob([header + bodyRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.toast({ title: "CSV exported", description: `${bodyRows.length} record(s).`, variant: "success" });
  }
  function onExportCsv() {
    /* the Monthly tab's export (Period,Employee,Gross,Net over `visible`) */
    exportCsv(
      "payroll-report.csv",
      "Period,Employee,Gross,Net\n",
      visible.map((r) => `${r.period},${r.employeeName},${(r.grossPay / 100).toFixed(2)},${(r.netPay / 100).toFixed(2)}`),
    );
  }
  function onExportTaxCsv() {
    exportCsv(
      "tax-deductions-report.csv",
      "Employee,Month,Insurance,Loans,Late/Absent,Total Deductions,Est. Tax\n",
      taxRows.map(
        (r) =>
          `${r.employeeName},${r.period},0.00,0.00,0.00,${(r.deductions / 100).toFixed(2)},${((r.grossPay * 0.15) / 100).toFixed(2)}`,
      ),
    );
  }
  function onExportHistoryCsv() {
    exportCsv(
      "earnings-history.csv",
      "Employee,Month,Basic,Housing,Transport,Overtime,Total Earnings,Net Salary\n",
      historyRows.map(
        (r) =>
          `${r.employeeName},${r.period},${(r.basicSalary / 100).toFixed(2)},0.00,0.00,0.00,${(r.grossPay / 100).toFixed(2)},${(r.netPay / 100).toFixed(2)}`,
      ),
    );
  }
  function onExportCustomCsv() {
    const labels = activeChips.map((c) => c.label).join(",");
    const body = previewRows.map((r) => activeChips.map((c) => previewCell(r, c.key)).join(","));
    exportCsv("custom-report.csv", `${labels}\n`, body);
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
          /* Session 86 (R86-A2): the +24px container offset — the REF's
             v3-style space-y puts margin-TOP on sibling children; the
             container's first DOM child is the md:hidden mobile sticky
             header (display:none at desktop), so the SECOND child (this
             desktop row) carries mt24 which COLLAPSES out of the
             padding-less max-w-7xl container → the whole container sits
             24px lower (y56 vs y32). TW v4's space-y compiles to
             margin-block-end on :not(:last-child) — no first-child
             margin-top, no collapse. This mt-6 replicates the REF's
             computed mt24 with the identical collapse behavior; inert
             at mobile (the row is hidden md:flex — display:none kills
             margins; the REF's mobile top has no offset either, its
             mobile sticky header being the first in-flow child). */
          className="mt-6"
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
              all top-aligned at y=403).
              Session 86 (R86-A3): the cross-side pixel-diff re-measure —
              the header row is `flex flex-col space-y-1.5 p-6 pb-3` with
              NO border-b (the border-b member never existed on the REF;
              pixel-proven on the fresh at-rest pair). */}
          <CardHeader className="p-6 pb-3">
            <div className="flex flex-col md:flex-row justify-between gap-3">
              <div>
                {/* Session 86 (R86-A3 residual): the title block is the REF's
                    FLEX DIV — `font-semibold leading-none tracking-tight
                    flex items-center gap-2` (live-read; the r33 comment's
                    own "title DIV with the icon, h=20" — the <p> +
                    inline-svg form that replaced it expanded the line box
                    to 36px (leading-none 16 + the 20px inline svg), +16px
                    on the header row and everything below). The svg rides
                    the flex row (items-center, the gap-2 spacing — the
                    mr-2/-translate-y baseline hacks retire). */}
                <div className="font-semibold leading-none tracking-tight flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" aria-hidden="true" />
                  Monthly Payroll Summary
                </div>
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
          {/* Session 86 (R86-A4): REF's stats section re-measured by the
              cross-side pixel-diff — the CardContent is p-0 and the GRID
              itself carries the padding + the border (`grid grid-cols-2
              md:grid-cols-4 gap-4 p-4 border-b border-slate-100`), each
              stat cell a boxed `bg-slate-50 rounded-lg p-3` with DIV
              children (the bare-cell + mb-6-grid + p-6-body form rendered
              the grid at h48 vs the REF's h105). */}
          <CardContent className="p-0">
            {loading ? (
              <div className="flex h-24 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 p-4 md:grid-cols-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="mb-1 text-xs text-slate-500">Total Earnings</div>
                    <div className="text-lg font-bold text-blue-700">{fmt(stats.earnings)}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="mb-1 text-xs text-slate-500">Total Deductions</div>
                    <div className="text-lg font-bold text-red-600">{fmt(stats.deductions)}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="mb-1 text-xs text-slate-500">Net Payroll</div>
                    <div className="text-lg font-bold text-green-700">{fmt(stats.net)}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="mb-1 text-xs text-slate-500">Employees</div>
                    <div className="text-lg font-bold text-slate-700">{stats.employees}</div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  {/* Session 49 (R48-C3): REF's th forms re-measured —
                      the BARE px-4 py-3 family (+ alignment, the
                      hidden md:table-cell pair on Allowances/Overtime,
                      font-bold on Net Salary). */}
                  <table className="w-full text-sm">
                    {/* Session 86 (R86-A1): the header typography lives on
                        the THEAD — `bg-slate-50 text-slate-600 text-xs
                        uppercase` (the REF's thead class set verbatim,
                        live-read; the bare px-4 py-3 + alignment th's
                        INHERIT 12px/700/UPPERCASE → the header row h40.
                        The r48 round measured the th forms but missed
                        these thead-level members, leaving the table's
                        text-sm 14px Title-case rendering, h44). */}
                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
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

        {/* Session 87 (R87-A): the Tax & Deductions card REBUILT to the
            REF-measured recipe (the r87 tab-interior instrument's first
            find — the session-35 wiring invented a Gross/Deductions/
            Effective Rate/Net aggregate the REF does not carry; the REF
            renders the trending-up title + the From/To range toolbar +
            the SEVEN-column breakdown). Live-measured in the active
            panel @1440×900. */}
        <TabsContent value="tax" className="ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-4 mt-4">
        <Card className="border-slate-200">
          <CardHeader className="p-6 pb-3">
            <div className="flex flex-col md:flex-row justify-between gap-3">
              <div>
                {/* the REF's title block: the FLEX DIV form (the r86-A3
                    lesson) with the trending-up icon w-5 h-5
                    text-orange-600 */}
                <div className="font-semibold leading-none tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" aria-hidden="true" />
                  Tax &amp; Deductions Report
                </div>
                <p className="text-sm text-slate-500 mt-1">Breakdown of deductions and estimated tax</p>
              </div>
              {/* the REF's range toolbar: `flex gap-2 flex-wrap items-end`
                  with the From/To groups (the Label text-xs above the w-36
                  month input) + the CSV/PDF pair. TRAP (the S35 inline-label
                  family, r87 re-find): the REF's v3 space-y-1 puts the 4px
                  on the INPUT (mt — a block, applies); v4 puts it on the
                  LABEL (inline — vertical margins IGNORED), collapsing
                  the gap by 4px (input y427 vs the REF's y431, group h60
                  vs h64). The house fix: explicit mt-1 on the control. */}
              <div className="flex gap-2 flex-wrap items-end">
                <div>
                  <Label className="text-xs" htmlFor="tax-from">From</Label>
                  <Input
                    id="tax-from"
                    type="month"
                    className="w-36 mt-1"
                    value={taxRange.from}
                    onChange={(e) => setTaxRange((r) => ({ ...r, from: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-xs" htmlFor="tax-to">To</Label>
                  <Input
                    id="tax-to"
                    type="month"
                    className="w-36 mt-1"
                    value={taxRange.to}
                    onChange={(e) => setTaxRange((r) => ({ ...r, to: e.target.value }))}
                  />
                </div>
                <Button variant="outline" size="sm" onClick={onExportTaxCsv}>
                  <FileSpreadsheet className="mr-1 h-4 w-4" aria-hidden="true" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <FileText className="mr-1 h-4 w-4" aria-hidden="true" />
                  PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Employee</th>
                    <th className="px-4 py-3 text-center">Month</th>
                    <th className="px-4 py-3 text-right hidden md:table-cell">Insurance</th>
                    <th className="px-4 py-3 text-right hidden md:table-cell">Loans</th>
                    <th className="px-4 py-3 text-right hidden md:table-cell">Late/Absent</th>
                    <th className="px-4 py-3 text-right">Total Deductions</th>
                    <th className="px-4 py-3 text-right">Est. Tax (15%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {taxRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No records for selected period
                      </td>
                    </tr>
                  ) : (
                    taxRows.map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-3 font-medium text-slate-900">{r.employeeName}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{r.period}</td>
                        <td className="px-4 py-3 text-right text-slate-600 hidden md:table-cell">0.00 SAR</td>
                        <td className="px-4 py-3 text-right text-slate-600 hidden md:table-cell">0.00 SAR</td>
                        <td className="px-4 py-3 text-right text-slate-600 hidden md:table-cell">0.00 SAR</td>
                        <td className="px-4 py-3 text-right text-slate-600">{fmt(r.deductions)}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{fmt(Math.round(r.grossPay * 0.15))}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        {/* Session 87 (R87-B): the History card REBUILT to the REF-measured
            recipe — the REF renders the PER-EMPLOYEE earnings history (the
            session-35 wiring invented a per-period aggregate), with the
            dollar-sign title, the top-aligned CSV/PDF pair, and the NINE
            columns incl. the Slip affordance. */}
        <TabsContent value="history" className="ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-4 mt-4">
        <Card className="border-slate-200">
          <CardHeader className="p-6 pb-3">
            <div className="flex flex-col md:flex-row justify-between gap-3">
              <div>
                <div className="font-semibold leading-none tracking-tight flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" aria-hidden="true" />
                  Employee Earnings History
                </div>
                <p className="text-sm text-slate-500 mt-1">Complete salary history per employee</p>
              </div>
              {/* the REF's export pair rides `flex gap-2` TOP-ALIGNED (no
                  items-end — the h44 right block vs the tax tab's h64) */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onExportHistoryCsv}>
                  <FileSpreadsheet className="mr-1 h-4 w-4" aria-hidden="true" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <FileText className="mr-1 h-4 w-4" aria-hidden="true" />
                  PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Employee</th>
                    <th className="px-4 py-3 text-center">Month</th>
                    <th className="px-4 py-3 text-right hidden md:table-cell">Basic</th>
                    <th className="px-4 py-3 text-right hidden md:table-cell">Housing</th>
                    <th className="px-4 py-3 text-right hidden md:table-cell">Transport</th>
                    <th className="px-4 py-3 text-right hidden md:table-cell">Overtime</th>
                    <th className="px-4 py-3 text-right">Total Earnings</th>
                    <th className="px-4 py-3 text-right font-bold">Net Salary</th>
                    <th className="px-4 py-3 text-center">Slip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyRows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        No payroll history found
                      </td>
                    </tr>
                  ) : (
                    historyRows.map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-3 font-medium text-slate-900">{r.employeeName}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{r.period}</td>
                        <td className="px-4 py-3 text-right text-slate-600 hidden md:table-cell">{fmt(r.basicSalary)}</td>
                        <td className="px-4 py-3 text-right text-slate-600 hidden md:table-cell">0.00 SAR</td>
                        <td className="px-4 py-3 text-right text-slate-600 hidden md:table-cell">0.00 SAR</td>
                        <td className="px-4 py-3 text-right text-slate-600 hidden md:table-cell">0.00 SAR</td>
                        <td className="px-4 py-3 text-right text-slate-600">{fmt(r.grossPay)}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">{fmt(r.netPay)}</td>
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
          </CardContent>
        </Card>
        </TabsContent>

        {/* Session 87 (R87-C): the Custom tab REBUILT to the REF's
            THREE-card architecture — the session-35 wiring invented a
            ONE-card form with a Generate button; the REF renders the
            Report Filters card (the 4-cell grid incl. the Status select),
            the Select Columns card (the FOURTEEN toggle chips), and the
            Report Preview card (the chip-driven column set + the records
            span + the CSV/PDF pair), with the preview deriving REACTIVELY
            from the filters (no Generate button). */}
        <TabsContent value="custom" className="ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-4 mt-4">
        <div className="space-y-4">
          {/* Card 1 — Report Filters: the p-6 header (the filter icon +
              the text-base title) + the 4-cell grid (all controls
              w-full inside their cells) */}
          <Card className="border-slate-200">
            <CardHeader className="p-6">
              <div className="font-semibold tracking-tight text-base flex items-center gap-2">
                <RefFilterGlyph className="w-4 h-4" />
                Report Filters
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* the S35 inline-label trap (the r87 re-find): explicit
                    mt-1 on every control — v4's space-y margin lands on
                    the inline label and is ignored (the REF's v3 form puts
                    it on the control; the login fix pattern) */}
                <div>
                  <Label className="text-xs" htmlFor="custom-from">From Month</Label>
                  <Input
                    id="custom-from"
                    type="month"
                    className="w-full mt-1"
                    value={custom.from}
                    onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-xs" htmlFor="custom-to">To Month</Label>
                  <Input
                    id="custom-to"
                    type="month"
                    className="w-full mt-1"
                    value={custom.to}
                    onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-xs">Employee</Label>
                  <Select value={custom.employee} onValueChange={(v) => setCustom((c) => ({ ...c, employee: v }))}>
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
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select value={custom.status} onValueChange={(v) => setCustom((c) => ({ ...c, status: v }))}>
                    <SelectTrigger className="w-full mt-1" aria-label="Filter status">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Card 2 — Select Columns: the FOURTEEN toggle chips in the
              REF's order; active bg-blue-600 text-white border-blue-600,
              inactive bg-white text-slate-600 border-slate-300 */}
          <Card className="border-slate-200">
            <CardHeader className="p-6">
              <div className="font-semibold tracking-tight text-base">Select Columns</div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="flex flex-wrap gap-2">
                {COLUMN_CHIPS.map((chip) => {
                  const on = activeCols.includes(chip.key);
                  return (
                    <button
                      key={chip.key}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleCol(chip.key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        on
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-600 border-slate-300"
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          {/* Card 3 — Report Preview: the justify-between header (the
              title + the records span | the CSV/PDF pair) + the
              chip-driven column table */}
          <Card className="border-slate-200">
            <CardHeader className="p-6 pb-3">
              <div className="flex justify-between items-center">
                <div className="font-semibold tracking-tight text-base">
                  {"Report Preview "}
                  <span className="text-slate-400 text-sm font-normal ml-2">{previewRows.length} records</span>
                </div>
                <div className="flex gap-2">
                  {/* Session 87 (R87-C): the REF disables the PREVIEW exports
                      at 0 records (live-read: disabled + opacity-0.5,
                      cursor default — the pixel proof: the AA-gray text);
                      the Monthly/Tax/History exports stay ENABLED at 0
                      records (their 0-cell pairs prove it — those export
                      the full dataset, this one exports the preview
                      rows). */}
                  <Button variant="outline" size="sm" onClick={onExportCustomCsv} disabled={previewRows.length === 0}>
                    <FileSpreadsheet className="mr-1 h-4 w-4" aria-hidden="true" />
                    CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.print()} disabled={previewRows.length === 0}>
                    <FileText className="mr-1 h-4 w-4" aria-hidden="true" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                    <tr>
                      {activeChips.map((c) => (
                        <th key={c.key} className="px-4 py-3 text-left whitespace-nowrap">
                          {c.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewRows.length === 0 ? (
                      <tr>
                        <td colSpan={activeChips.length} className="py-12 text-center text-slate-400">
                          No data for selected filters
                        </td>
                      </tr>
                    ) : (
                      previewRows.map((r) => (
                        <tr key={r.id}>
                          {activeChips.map((c) => (
                            <td key={c.key} className="px-4 py-3 text-left whitespace-nowrap text-slate-600">
                              {previewCell(r, c.key)}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
        </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
    </PageCanvas>
  );
}
