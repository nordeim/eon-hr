"use client";

import * as React from "react";
import { Building2, Calculator, CalendarDays, CheckCircle2, Clock4, Cog, Info, Loader2, TrendingDown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useToast } from "@/components/ui/toast";
import { currentPeriod, formatSar } from "@/lib/utils";

interface DepartmentOption {
  id: string;
  name: string;
}

interface EngineResultRow {
  employeeId: string;
  name: string;
  basicSalary: number;
  lateDeduction: number;
  absentDeduction: number;
  overtimePay: number;
  net: number;
  attendanceDays: number;
}

interface EngineResult {
  month: string;
  processed: number;
  attendanceRecords: number;
  totalDeductions: number;
  totalOvertime: number;
  results: EngineResultRow[];
}

interface PayrollRow {
  id: string;
  employeeId: string;
  period: string;
  basicSalary: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  status: string;
  employee: { id: string; employeeId: string; firstName: string; lastName: string } | null;
}

function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  if (!y || !m) return month;
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export default function PayrollEnginePage() {
  const toast = useToast();
  const [month, setMonth] = React.useState(currentPeriod());
  const [departmentId, setDepartmentId] = React.useState("all");
  const [departments, setDepartments] = React.useState<DepartmentOption[]>([]);
  const [generating, setGenerating] = React.useState(false);
  const [loadingExisting, setLoadingExisting] = React.useState(true);
  const [result, setResult] = React.useState<EngineResult | null>(null);
  const [existing, setExisting] = React.useState<PayrollRow[]>([]);

  React.useEffect(() => {
    fetch("/api/payroll/engine")
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setDepartments(json.data.departments);
      })
      .catch(() => {
        toast.toast({ title: "Failed to load departments", variant: "error" });
      });
  }, [toast]);

  const loadExisting = React.useCallback(async (period: string) => {
    try {
      const res = await fetch(`/api/payroll?period=${period}`);
      const json = await res.json();
      if (json.ok) setExisting(json.data.records);
    } catch {
      toast.toast({ title: "Failed to load payroll records", variant: "error" });
    } finally {
      setLoadingExisting(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void loadExisting(month);
  }, [loadExisting, month]);

  async function onGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/payroll/engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, ...(departmentId !== "all" ? { departmentId } : {}) }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Generation failed", description: json.error?.message, variant: "error" });
        return;
      }
      setResult(json.data as EngineResult);
      toast.toast({
        title: `Payroll generated for ${monthLabel(month)}`,
        description: `${json.data.processed} employee record(s) calculated from attendance data.`,
        variant: "success",
      });
      await loadExisting(month);
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setGenerating(false);
    }
  }

  function onMonthChange(value: string) {
    setMonth(value);
    setResult(null);
    setLoadingExisting(true);
  }

  const infoMonth = monthLabel(month);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        section="Payroll Engine"
        sectionIcon={<Calculator aria-hidden="true" />}
        title="Payroll Calculator"
        subtitle="Auto-generate salary slips from attendance data"
        actions={
          <Button onClick={onGenerate} disabled={generating}>
            {generating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Cog aria-hidden="true" />}
            Generate Payroll
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="p-5 pb-0">
            <CardTitle>Calculation Inputs</CardTitle>
            <CardDescription>Choose the payroll month and scope.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pe-month">Payroll Month</Label>
              <Input
                id="pe-month"
                type="month"
                value={month}
                onChange={(e) => onMonthChange(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pe-department">Department</Label>
              <Select value={departmentId} onValueChange={(v) => setDepartmentId(v)}>
                <SelectTrigger id="pe-department" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={onGenerate} disabled={generating} className="w-full">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Cog aria-hidden="true" />}
              Generate Payroll
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="p-5 pb-0">
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" aria-hidden="true" />
              How the engine calculates
            </CardTitle>
            <CardDescription>
              Late deductions, absent deductions &amp; overtime are automatically calculated from attendance records for{" "}
              {infoMonth}.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-secondary/30 p-3">
                <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <TrendingDown className="h-4 w-4 text-amber-600" aria-hidden="true" />
                  Late deduction
                </p>
                <p className="text-xs text-muted-foreground">0.50 SAR per late minute, capped at 10% of basic salary.</p>
              </div>
              <div className="rounded-lg border bg-secondary/30 p-3">
                <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <CalendarDays className="h-4 w-4 text-red-600" aria-hidden="true" />
                  Absent deduction
                </p>
                <p className="text-xs text-muted-foreground">Each absent day deducts one daily salary (basic ÷ 30).</p>
              </div>
              <div className="rounded-lg border bg-secondary/30 p-3">
                <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Clock4 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  Overtime pay
                </p>
                <p className="text-xs text-muted-foreground">1.5× the hourly rate (basic ÷ 240 hours) per OT minute.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {generating ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      ) : result ? (
        <>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatCard label="Employees Processed" value={result.processed} icon={<Users aria-hidden="true" />} />
            <StatCard label="Attendance Records" value={result.attendanceRecords} icon={<CalendarDays aria-hidden="true" />} />
            <StatCard label="Total Deductions" value={formatSar(result.totalDeductions)} icon={<TrendingDown aria-hidden="true" />} />
            <StatCard label="Total Overtime" value={formatSar(result.totalOvertime)} icon={<Clock4 aria-hidden="true" />} />
          </div>
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="flex flex-col gap-1 p-5 pb-0">
              <h2 className="text-base font-semibold text-foreground">Generated Payroll — {monthLabel(result.month)}</h2>
              <p className="text-sm text-muted-foreground">Computed from attendance records for this month.</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Late Deduction</TableHead>
                  <TableHead>Absent Deduction</TableHead>
                  <TableHead>Overtime</TableHead>
                  <TableHead>Net Salary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.results.map((row) => (
                  <TableRow key={row.employeeId}>
                    <TableCell className="font-medium text-foreground">{row.name}</TableCell>
                    <TableCell className="text-muted-foreground">{formatSar(row.basicSalary)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatSar(row.lateDeduction)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatSar(row.absentDeduction)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatSar(row.overtimePay)}</TableCell>
                    <TableCell className="font-medium text-foreground">{formatSar(row.net)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      ) : loadingExisting ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      ) : existing.length > 0 ? (
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="flex flex-col gap-1 p-5 pb-0">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              Payroll already generated for {infoMonth}
            </h2>
            <p className="text-sm text-muted-foreground">
              Regenerate to recalculate deductions and overtime from the latest attendance data.
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Basic Salary</TableHead>
                <TableHead>Overtime Pay</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {existing.map((record) => {
                const name =
                  `${record.employee?.firstName ?? ""} ${record.employee?.lastName ?? ""}`.trim() || "—";
                return (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium text-foreground">{name}</TableCell>
                    <TableCell className="text-muted-foreground">{formatSar(record.basicSalary)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatSar(record.bonus)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatSar(record.deductions)}</TableCell>
                    <TableCell className="font-medium text-foreground">{formatSar(record.netSalary)}</TableCell>
                    <TableCell>
                      <StatusBadge status={record.status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm">
          <EmptyState
            icon={<Building2 className="h-6 w-6" aria-hidden="true" />}
            title={`Select a month and click "Generate Payroll"`}
            description="Attendance data will be used to compute deductions and overtime automatically"
          />
        </div>
      )}
    </div>
  );
}
