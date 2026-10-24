"use client";

import * as React from "react";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { ReportChart, type GroupPoint, type ReportChartType } from "./charts";

interface ReportRecord {
  fullName: string;
  jobTitle: string | null;
  department: string | null;
  employmentStatus: string;
  employmentType: string;
  startDate: string | null;
}

interface ReportResponse {
  stats: { totalRecords: number; uniqueGroups: number; activeCount: number };
  groups: GroupPoint[];
  records: ReportRecord[];
}

const GROUP_OPTIONS = [
  { value: "status", label: "Status" },
  { value: "department", label: "Department" },
  { value: "type", label: "Type" },
] as const;

const CHART_OPTIONS = [
  { value: "bar", label: "Bar Chart" },
  { value: "pie", label: "Pie Chart" },
  { value: "line", label: "Line Chart" },
] as const;

const STATUS_OPTIONS = ["all", "active", "on_leave", "suspended", "terminated"] as const;

function labelize(v: string): string {
  return v === "all" ? "All" : v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function escapeCsv(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function downloadCsv(filename: string, rows: (string | number | null)[][]): void {
  const csv = rows.map((row) => row.map((cell) => escapeCsv(String(cell ?? ""))).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

const CSV_HEADERS = ["FULL NAME", "JOB TITLE", "DEPARTMENT ID", "EMPLOYMENT STATUS", "EMPLOYMENT TYPE", "START DATE"];

// Session 23 (R22-E): the table renders REF's compact recipe — lowercase DOM
// texts uppercased by CSS (`px-3 py-2 text-left text-xs font-semibold
// text-slate-600 uppercase`, 33px th). The CSV export keeps the uppercase
// literals (file format).
const TABLE_HEADERS = ["full name", "job title", "department id", "employment status", "employment type", "start date"];

function recordsToCsv(records: ReportRecord[]): (string | number | null)[][] {
  return [
    CSV_HEADERS,
    ...records.map((r) => [
      r.fullName,
      r.jobTitle,
      r.department,
      r.employmentStatus,
      r.employmentType,
      r.startDate ? r.startDate.slice(0, 10) : null,
    ]),
  ];
}

export default function HRReportsPage() {
  const toast = useToast();
  const [source, setSource] = React.useState("employees");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  // Session 14 (R13-L): the reference's Group By trigger renders EMPTY
  // until a grouping is chosen (measured "" in the 169px trigger).
  const [groupBy, setGroupBy] = React.useState<string>("");
  const [chartType, setChartType] = React.useState<ReportChartType>("bar");
  const [status, setStatus] = React.useState<string>("all");

  const [data, setData] = React.useState<ReportResponse | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ source });
      if (from) qs.set("from", from);
      if (to) qs.set("to", to);
      qs.set("groupBy", groupBy);
      qs.set("status", status);
      const res = await fetch(`/api/hr-reports?${qs}`);
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Failed to load report", description: json.error?.message, variant: "error" });
        return;
      }
      setData(json.data as ReportResponse);
    } catch {
      toast.toast({ title: "Network error", description: "Could not reach the reports API.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [source, from, to, groupBy, status, toast]);

  React.useEffect(() => {
    const t = window.setTimeout(load, 250);
    return () => window.clearTimeout(t);
  }, [load]);

  function exportCsv() {
    if (!data || data.records.length === 0) {
      toast.toast({ title: "Nothing to export", description: "No records match the current filters.", variant: "info" });
      return;
    }
    downloadCsv("hr-report.csv", recordsToCsv(data.records));
    toast.toast({
      title: "Export ready",
      description: `${data.records.length} records exported to CSV.`,
      variant: "success",
    });
  }

  const stats = data?.stats ?? { totalRecords: 0, uniqueGroups: 0, activeCount: 0 };
  const groupLabel = GROUP_OPTIONS.find((g) => g.value === groupBy)?.label ?? "Status";

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <PageHeader
        /* Session 49 (R48-A3/C5): REF's header is the UNPREFIXED center
         *  always-row `flex items-center justify-between` with the bare
         *  `flex gap-2` actions cluster (live-measured @1440×900). */
        alwaysRow
        actionsBare
        size="md"
        title="HR Reports & Analytics"
        subtitle="Create custom charts and export data for management reviews"
        subtitleClassName="mt-0 text-slate-500"
        actions={
          <>
            {/* Session 88 (R88-E2): the REF's export pair —
                FileSpreadsheet (CSV) + Download (PDF), both w-4 h-4
                mr-2 (live-measured; the old Download + Printer was a
                clone invention). */}
            <Button variant="outline" onClick={exportCsv}>
              <FileSpreadsheet className="w-4 h-4 mr-2" aria-hidden="true" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="w-4 h-4 mr-2" aria-hidden="true" />
              Export PDF
            </Button>
          </>
        }
      />

      {/* Session 13 (R12-B): the reference's report builder is a GRID —
          `grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4` of BARE
          field divs (no flex wrapper — the inline label + newline
          whitespace replicate the REF's 64px line-box stacking),
          `text-xs text-slate-500 font-medium` labels, mt-1 controls.
          Card 106px tall. Our Status Filter rides as the sixth column —
          a documented superset that fills the row without growing the
          card. */}
      <Card>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="hr-source" className="text-xs text-slate-500">Data Source</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger id="hr-source" className="mt-1 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employees">Employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="hr-from" className="text-xs text-slate-500">From Date</Label>
              <Input id="hr-from" type="date" className="mt-1" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="hr-to" className="text-xs text-slate-500">To Date</Label>
              <Input id="hr-to" type="date" className="mt-1" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="hr-group" className="text-xs text-slate-500">Group By</Label>
              <Select value={groupBy} onValueChange={setGroupBy}>
                {/* Session 63 (R63-B): REF's empty Group By trigger has NO
                    data-placeholder attribute (its runtime mounts the
                    trigger differently) and renders the trigger's own
                    FOREGROUND pair — #0a0a0a light / #fafafa dark (both
                    live-measured). The clone's Radix fires data-placeholder
                    on the empty value, so this trigger overrides the base's
                    R37-E neutral literal back to the foreground pair — the
                    dark: member is required too (the base's dark rule
                    carries the .dark ancestor class = higher specificity
                    than a light-only override). The base member stays (the
                    loans dialog "Select employee" placeholder pin). */}
                <SelectTrigger id="hr-group" className="mt-1 w-full data-[placeholder]:text-foreground dark:data-[placeholder]:text-foreground">
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  {GROUP_OPTIONS.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="hr-chart" className="text-xs text-slate-500">Chart Type</Label>
              <Select value={chartType} onValueChange={(v) => setChartType(v as ReportChartType)}>
                <SelectTrigger id="hr-chart" className="mt-1 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHART_OPTIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="hr-status" className="text-xs text-slate-500">Status Filter</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="hr-status" className="mt-1 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {labelize(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard variant="mini-centered" label="Total Records" value={loading ? "…" : stats.totalRecords} labelClassName="text-slate-500" valueClassName="text-blue-600" />
        <StatCard variant="mini-centered" label="Unique Groups" value={loading ? "…" : stats.uniqueGroups} labelClassName="text-slate-500" valueClassName="text-orange-500" />
        <StatCard variant="mini-centered" label="Active/Approved" value={loading ? "…" : stats.activeCount} labelClassName="text-slate-500" valueClassName="text-purple-600" />
      </div>

      {/* Session 12 (R11-U): the reference's chart card — title-only
          header (DIV font-semibold tracking-tight text-base, 72px — no
          description) and the chart renders unconditionally (320px). */}
      <Card>
        <div className="flex flex-col space-y-1.5 p-6">
          <div className="font-semibold tracking-tight text-base">{`Employees by ${groupLabel.toLowerCase()}`}</div>
        </div>
        <CardContent className="p-6 pt-0">
          <ReportChart data={data?.groups ?? []} type={chartType} />
        </CardContent>
      </Card>

      {/* Session 12 (R11-U): the data-table card — flex row header (80px)
          with the title and the h-8 Export button, no description. */}
      <Card>
        <div className="flex flex-col space-y-1.5 p-6">
          <div className="flex items-center justify-between">
            <div className="font-semibold tracking-tight text-base">{`Data Table (${data?.records.length ?? 0} records)`}</div>
            {/* Session 88 (R88-E3): the REF's Data Table Export icon —
                FileSpreadsheet w-4 h-4 mr-1 (live-measured; the old
                Download was the wrong glyph for this button). */}
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <FileSpreadsheet className="w-4 h-4 mr-1" aria-hidden="true" />
              Export
            </Button>
          </div>
        </div>
        <CardContent className="p-6 pt-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          ) : (
            /* Session 23 (R22-E): at 0 records REF renders the HEADER ROW
               ONLY — no empty state, no empty row (card 139px measured).
               The table always renders; the body is empty without records. */
            <Table>
              <TableHeader>
                {/* R56-D: REF's thead row — border-b bg-slate-50 (computed
                    rgb(248,250,252), 33px, inert: no hover tint). */}
                <tr className="border-b bg-slate-50">
                  {TABLE_HEADERS.map((header) => (
                    <TableHead key={header} className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase">
                      {header}
                    </TableHead>
                  ))}
                </tr>
              </TableHeader>
              <TableBody>
                {data?.records.map((r, i) => (
                  <TableRow key={`${r.fullName}-${i}`}>
                    <TableCell className="font-medium text-foreground">{r.fullName}</TableCell>
                    <TableCell className="text-muted-foreground">{r.jobTitle ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{r.department ?? "—"}</TableCell>
                    <TableCell>
                      <StatusBadge status={r.employmentStatus} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={r.employmentType} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(r.startDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
