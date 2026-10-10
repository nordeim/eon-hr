"use client";

import * as React from "react";
import { Download, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { EmptyState } from "@/components/shared/empty-state";
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
  const [groupBy, setGroupBy] = React.useState<string>("status");
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
  const hasRecords = (data?.records.length ?? 0) > 0;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <PageHeader
        size="md"
        title="HR Reports & Analytics"
        subtitle="Create custom charts and export data for management reviews"
        actions={
          <>
            <Button variant="outline" onClick={exportCsv}>
              <Download aria-hidden="true" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer aria-hidden="true" />
              Export PDF
            </Button>
          </>
        }
      />

      {/* Session 10 (R9-D): the reference's report builder is a compact
          filter row — a bare card (no title/description) with a p-5
          interior of 169px label+control columns (Data Source / From /
          To / Group By / Chart Type, all 36px controls with 12px labels;
          card 106px tall). Our Status Filter rides as the sixth column —
          a documented superset that fills the row without growing the
          card. */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap gap-4">
            <div className="flex w-[169px] shrink-0 flex-col gap-1.5">
              <Label htmlFor="hr-source">Data Source</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger id="hr-source" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employees">Employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[169px] shrink-0 flex-col gap-1.5">
              <Label htmlFor="hr-from">From Date</Label>
              <Input id="hr-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="flex w-[169px] shrink-0 flex-col gap-1.5">
              <Label htmlFor="hr-to">To Date</Label>
              <Input id="hr-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="flex w-[169px] shrink-0 flex-col gap-1.5">
              <Label htmlFor="hr-group">Group By</Label>
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger id="hr-group" className="w-full">
                  <SelectValue />
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
            <div className="flex w-[169px] shrink-0 flex-col gap-1.5">
              <Label htmlFor="hr-chart">Chart Type</Label>
              <Select value={chartType} onValueChange={(v) => setChartType(v as ReportChartType)}>
                <SelectTrigger id="hr-chart" className="w-full">
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
            <div className="flex w-[169px] shrink-0 flex-col gap-1.5">
              <Label htmlFor="hr-status">Status Filter</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="hr-status" className="w-full">
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
        <StatCard variant="mini-centered" label="Total Records" value={loading ? "…" : stats.totalRecords} />
        <StatCard variant="mini-centered" label="Unique Groups" value={loading ? "…" : stats.uniqueGroups} />
        <StatCard variant="mini-centered" label="Active/Approved" value={loading ? "…" : stats.activeCount} />
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
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="mr-1" aria-hidden="true" />
              Export
            </Button>
          </div>
        </div>
        <CardContent className="px-0 pb-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          ) : !hasRecords ? (
            <div className="pb-6">
              <EmptyState title="No records found" description="Adjust the filters to include more employees." />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {CSV_HEADERS.map((header) => (
                    <TableHead key={header} className={header === "FULL NAME" ? "" : "text-muted-foreground"}>
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
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
